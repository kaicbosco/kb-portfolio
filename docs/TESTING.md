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
O teste de regressão entrega a notificação de `matchMedia` após abrir o menu
mobile para verificar que o painel permanece aberto e o botão mantém o foco.
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

### Hero e Digital Core

`src/__tests__/hero.spec.ts` verifica o conteúdo nos dois catálogos, o título,
CTAs, cards, preferência manual, prioridade de redução de movimento, APIs de
visibilidade, limites magnéticos e limpeza. `e2e/hero.spec.ts` verifica o Hero
nos três servidores. Os testes comparam o retângulo e a transformação da moldura,
grade e rótulos antes e depois de mover o ponteiro. Também verificam que a órbita
continua avançando durante a inclinação, que a geometria cabe no stage e que o
grupo magnético retorna ao centro depois de `pointerleave`.

A matriz é **1920×1080, 1440×900, 1024×768, 768×1024, 375×812, 320×568 e
1440×350**, em PT-BR e EN. Ela verifica layout normal e `font-size: 200%` na
raiz. Esse segundo caso testa ampliação de texto. Para reproduzir o zoom
nativo, abra uma janela do Chromium com `innerWidth` de 640 px a 100%, aplique
200% pela interface do navegador e confirme `innerWidth` de 320 px. A área
útil pode ser menor com barra de rolagem. Compare `clientWidth` e `scrollWidth`
com o menu aberto e fechado e nos dois idiomas. Repita com a janela ajustada
ao dobro das demais larguras da matriz. A troca real de abas também permite
verificar a suspensão pela Page Visibility API.

Para produzir as capturas locais do Hero no Vite Preview:

```sh
pnpm build
CI=true PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" \
  PLAYWRIGHT_HERO_SCREENSHOTS=1 pnpm test:e2e e2e/hero.spec.ts
```

Artefatos em `review-receipts/hero-digital-core/`, ignorados pelo Git. Nos
recortes magnéticos, as animações contínuas são fixadas na mesma fase; o
movimento do ponteiro continua habilitado para comparar as poses.
Os testes de movimento podem ser repetidos contra o Nginx com um worker:

```sh
CI=true PLAYWRIGHT_BASE_URL=http://127.0.0.1:28080 \
  PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" \
  pnpm test:e2e e2e/hero.spec.ts \
  --grep 'keyboard interaction|pauses Precision|system reduced|tilts only|limits mobile' \
  --repeat-each 5
```

#### Medição local de performance do Hero

Compare o `dist/` da baseline (`4b7e368`) com o build do Hero, somando bytes
originais e gzip individualmente por extensão. Para o SVG, some `outerHTML`
dos dois elementos `.core-svg` em UTF-8, incluindo atributos de scoping do Vue.
O JavaScript de movimento está no chunk da homepage; a estimativa comprime os
dois composables e os blocos de script de `HeroSection` e `DigitalCore`
transpilados, sem minificação. Ela inclui a integração dos componentes e
exclui o código de renderização gerado a partir dos templates.

| Artefatos                            | Baseline (bytes / gzip) | Hero (bytes / gzip) |
| ------------------------------------ | ----------------------- | ------------------- |
| Todos os chunks JavaScript           | 163.468 / 62.409        | 181.919 / 69.698    |
| Todas as folhas de estilos           | 22.015 / 5.426          | 30.422 / 7.950      |
| Fontes WOFF2                         | 110.948 / 111.007       | 110.948 / 111.007   |
| SVG inline, serializado              | —                       | 6.449 / 1.376       |
| JavaScript de movimento (estimativa) | —                       | 6.206 / 1.706       |

Na página de produção em loopback, use um contexto Chromium novo, 1440×900,
registre as requisições e observe `largest-contentful-paint` e `layout-shift`.
Depois da entrada, compare duas amostras de seis segundos com o Core visível
e o ponteiro parado, uma em Precision Motion e outra em pausa. O trace CDP
permite observar pintura e layout; a cadência dos callbacks do navegador é
uma indicação de ritmo, sem medir frames apresentados ao usuário. Dados de
campo, INP e comportamento em outros dispositivos exigem medições próprias.

O carregamento observado de `/en` passou de 10 para 13 requisições, contando
o documento. As três adicionais são locais: um chunk de JS e dois de CSS.
O SVG é inline e não solicita fontes, imagens ou outros recursos exclusivos.
Os tamanhos gzip da tabela são calculados a partir dos arquivos, sem atribuir
essa codificação à resposta do Nginx.

Na amostra com Chrome Headless Shell 159.0.8154.6, o LCP foi **116 ms** e o
CLS foi **0,00073**, com deslocamento observado no `h1` e no seu ponto
vermelho, e zero ocorrências atribuídas ao Digital Core. Em Precision Motion,
a cadência foi de 60 callbacks/s, com intervalo
p95 de 16,8 ms. Em seis segundos, foram registrados 724 eventos de pintura
(72,32 ms acumulados) e 362 de layout (16,35 ms). Na amostra em pausa não
houve eventos de pintura, layout ou rasterização. Os rastros CDP e demais
dados ficam em `review-receipts/hero-digital-core/`.

O contraste dos textos renderizados foi de 6,76:1 nas categorias, 17,02:1
nos valores, 7,30:1 nas descrições dos cards e 7,19:1 no subtítulo e eyebrow.
O menor contraste de texto dos controles ativos medidos foi 4,83:1 (CTA
primário em repouso); o contorno de `focus-visible` foi 7,19:1 contra o fundo.
Esses resultados cobrem as combinações testadas.

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

Use `PLAYWRIGHT_BROWSERS_PATH` no lugar de `PLAYWRIGHT_CHROMIUM_EXECUTABLE` caso prefira o navegador gerenciado. O script também verifica os contratos HTTP e as restrições de runtime: healthcheck, loopback, UID, capabilities, `NoNewPrivs`, tmpfs e bloqueio de escrita na raiz. Valida MIME e cache para as folhas referenciadas no HTML e as fontes WOFF2 encontradas nelas, inclusive quando o CSS é dividido em chunks.

Para investigar a estabilidade do cenário de contraste com o Nginx em execução,
use o Chromium gerenciado, `CI=true` (um worker) e ajuste a URL à porta publicada:

```sh
CI=true PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 \
  PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" \
  pnpm test:e2e e2e/application-shell.spec.ts --grep 'preserves Crimson Void' --repeat-each 20
```

## Smoke tests HTTP em ambiente externo

Em 26/11/2026, a imagem `ghcr.io/kaicbosco/kb-portfolio:latest`, revisão OCI
`6faf745cd67372224791245c85169bc4b6f49167`, retornou os seguintes status no Ubuntu
24.04.5 LTS (`linux/amd64`):

| Rota ou recurso            | Status HTTP |
| -------------------------- | ----------- |
| `/`                        | 200         |
| `/pt`                      | 200         |
| `/en`                      | 200         |
| `/en/projects/codex-usage` | 200         |
| `/assets/nonexistent.js`   | 404         |

Os resultados confirmam as respostas HTTP observadas, não a renderização ou as
interações no navegador da máquina externa, que permanecem não confirmadas.
Consulte o [registro no guia Docker](DOCKER.md#validação-em-ambiente-externo)
para as versões do runtime, a comparação com Debian 13 e os limites da amostra.

## GitHub Actions

O workflow Docker executa em PRs, pushes para `main` e disparos manuais. Invoca `ci.yml` uma única vez por execução. O job nativo usa Node de `.nvmrc`, pnpm de `packageManager` e `pnpm install --frozen-lockfile`. `pnpm check` gera `dist/`; Playwright testa esse build em `127.0.0.1:4173` com um worker.

Em seguida, o job Docker valida Compose, faz os builds, sobe Nginx, roda os testes HTTP, de segurança e Playwright, e analisa a imagem de produção com Trivy. Cada job de navegador instala somente o Chromium headless gerenciado e suas dependências. Em caso de falha, `test-results/`, quando presente, fica disponível por até cinco dias. O [guia Docker](DOCKER.md#cicd) descreve os artefatos, condições de publicação e política de vulnerabilidades. Não há deploy nem correções automáticas.

Firefox, WebKit, tecnologias assistivas e status HTTP em um ambiente de hospedagem externo não são cobertos pela suíte atual.
