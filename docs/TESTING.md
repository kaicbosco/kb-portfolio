# Testes e CI

## Validação local

```sh
pnpm check
```

`check` executa lint sem correções, verificação de formatação, Vitest em execução única e build (incluindo `vue-tsc` para aplicação, configuração, testes unitários e E2E). Não reescreve código-fonte.

- `pnpm test:unit`: observação local.
- `pnpm test:unit:run`: execução única com Vitest, jsdom e Vue Test Utils. Preserva a cobertura de rotas, idioma e metadados, e verifica os contratos dos componentes Crimson Void.
- `pnpm test:e2e`: Chromium headless em Vite dev dedicado (`127.0.0.1:4174`) localmente. O projeto `chromium` cobre rotas públicas, foco, 404, grid e fontes locais. O projeto `design-system` cobre o playground separadamente. Libere a porta antes de executar; não há reutilização silenciosa de outro servidor.

Para instalar o Chromium headless isolado no workspace, siga o [README](../README.md). Se o sistema já tiver Chromium, não é necessário baixar outro navegador para uma verificação local:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test:e2e
```

O executável do sistema pode divergir da versão gerenciada pelo Playwright. Para validar da mesma forma que a CI, use o navegador gerenciado e teste o build em vez do servidor de desenvolvimento:

```sh
pnpm build
CI=true PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" pnpm test:e2e
```

### Application Shell

`src/__tests__/application-shell.spec.ts` verifica landmarks, links confirmados,
estado ativo, equivalência de idioma, disclosure, foco e prioridade do scroll salvo.
`e2e/application-shell.spec.ts` roda em Dev, Preview e Nginx: teclado, alvos de
44 px, estados desktop/mobile, idioma, histórico, header sticky, footer, contraste
dos estados e redução de movimento. Reflow é coberto em 320, 375, 768, 1024 e 1440 px,
em PT e EN; o teste adicional de 200% aumenta a fonte raiz e usa um slug longo.
O playground de desenvolvimento cobre também a rolagem de uma âncora real em uma
página longa. Não equivale a uma auditoria WCAG 2.2 AA nem a zoom real do navegador.

Para capturar home, projeto, 404 e estados de foco:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium \
  PLAYWRIGHT_SHELL_SCREENSHOTS=1 \
  pnpm test:e2e e2e/application-shell.spec.ts --grep 'captures'
```

As imagens ficam em `review-receipts/application-shell/` (ignorado pelo Git),
sem baseline de comparação de pixels. Para reproduzir zoom real de 200%, ajuste
a janela do Chromium de modo que `window.innerWidth` seja 640 px antes do zoom,
aplique 200% e compare `document.documentElement.clientWidth` e `scrollWidth` (a
barra vertical pode reduzir a largura útil em relação a `innerWidth`). Depois,
repita com o menu aberto e em ambos os idiomas.

### Crimson Void

Em desenvolvimento, execute só a suíte do playground e opcionalmente capture a página
inteira com as fontes carregadas:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium \
  PLAYWRIGHT_DESIGN_SYSTEM_SCREENSHOTS=1 \
  pnpm test:e2e --project=design-system
```

São verificados os spans computados, a ordem de leitura e de Tab, ativação nativa,
disabled, nomes acessíveis, alvos de 44 px, foco, contraste a partir dos estilos
computados e `prefers-reduced-motion`. O teste valida a ausência de overflow
horizontal em **320, 375, 768, 1024 e 1440 px** e com fonte raiz de **200% em 320 px**.
Esse último teste simula ampliação de texto, não a interface de zoom do navegador.
Na revisão local, o zoom real do Chromium também foi verificado no Vite do Docker:
com zoom de **200%**, uma largura de 640 px passou a 320 px CSS, sem rolagem horizontal.
Para reproduzir, ajuste a janela no navegador, aplique zoom de 200% e compare
`window.innerWidth` com `document.documentElement.scrollWidth`.

As capturas são `review-receipts/crimson-void/design-system-{320,375,768,1440}.png`.
O diretório é ignorado pelo Git. As imagens são evidências para revisão, não
baselines de regressão de pixels: a CI não depende da versão local do Chromium ou
da rasterização de fontes.

Com `CI=true` ou `PLAYWRIGHT_BASE_URL`, a configuração executa apenas `chromium`
e acrescenta `production.spec.ts`: abrir `/dev/design-system` deve renderizar o
404 em PT-BR, sem anunciar o playground nem requisitar seu chunk. A URL pode
receber HTTP 200 por causa do fallback SPA; o 404 é renderizado pelo router.

Para inspecionar o conteúdo emitido, além de testar a navegação:

```sh
pnpm exec vite build --manifest
rg -i 'dev/design-system|crimson-void-playground|designsystempage|specimens|swatch-color' \
  dist/.vite/manifest.json dist/assets
```

O resultado esperado é **nenhuma ocorrência** (`rg` retorna 1). O manifesto deve
listar `index.html` e as páginas públicas, sem `src/dev/`. Execute o teste de
produção contra esse build, via Preview ou Nginx. Uma captura e esses checks
não equivalem a uma auditoria WCAG completa; contraste e limites estão no
[Design System](DESIGN_SYSTEM.md).

### Nginx

`PLAYWRIGHT_BASE_URL` seleciona um servidor externo de produção e desabilita o servidor próprio do Playwright, inclusive com `CI=true`. Assim, a suíte pública valida a imagem servida pelo Compose sem iniciar Vite:

```sh
docker compose up -d --build --wait production
bash docker/check-production.sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 \
  PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test:e2e
```

Use `PLAYWRIGHT_BROWSERS_PATH` no lugar de `PLAYWRIGHT_CHROMIUM_EXECUTABLE` caso prefira o navegador gerenciado. O script também verifica os contratos HTTP e as restrições de runtime: healthcheck, loopback, UID, capabilities, `NoNewPrivs`, tmpfs e bloqueio de escrita na raiz.

## GitHub Actions

O workflow Docker executa em PRs, pushes para `main` e disparos manuais. Invoca `ci.yml` uma única vez por execução. O job nativo usa Node de `.nvmrc`, pnpm de `packageManager` e `pnpm install --frozen-lockfile`. `pnpm check` gera `dist/`; Playwright testa esse build em `127.0.0.1:4173` com um worker.

Em seguida, o job Docker valida Compose, faz os builds, sobe Nginx, roda os testes HTTP, de segurança e Playwright, e analisa a imagem de produção com Trivy. Cada job de navegador instala somente o Chromium headless gerenciado e suas dependências. Em caso de falha, `test-results/`, quando presente, fica disponível por até cinco dias. O [guia Docker](DOCKER.md#cicd) descreve os artefatos, condições de publicação e política de vulnerabilidades. Não há deploy nem correções automáticas.

Firefox, WebKit, tecnologias assistivas e status HTTP em um ambiente de hospedagem externo não são cobertos pela suíte atual.
