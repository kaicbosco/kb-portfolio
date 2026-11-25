# Testes e CI

## Validação local

```sh
pnpm check
```

`check` executa lint sem correções, verificação de formatação, Vitest em execução única e build (incluindo `vue-tsc` para aplicação, configuração, testes unitários e E2E). Não reescreve código-fonte.

- `pnpm test:unit`: observação local.
- `pnpm test:unit:run`: execução única com Vitest, jsdom e Vue Test Utils. Cobre resolução de rotas, parâmetros preservados, fallback do 404, mensagem renderizada, idioma e título do documento.
- `pnpm test:e2e`: Chromium headless em servidor Vite dedicado (`127.0.0.1:4174`). Cobre URL direta, troca de idioma com query e fragmento, histórico, foco visível, 404, grid em 320 px e 1440 px e fontes locais. Libere a porta antes de executar; não há reutilização silenciosa de outro servidor.

Para instalar o Chromium headless isolado no workspace, siga o [README](../README.md). Se o sistema já tiver Chromium, não é necessário baixar outro navegador para uma verificação local:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test:e2e
```

O executável do sistema pode divergir da versão gerenciada pelo Playwright. Para validar da mesma forma que a CI, use o navegador gerenciado e teste o build em vez do servidor de desenvolvimento:

```sh
pnpm build
CI=true PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" pnpm test:e2e
```

### Nginx

`PLAYWRIGHT_BASE_URL` seleciona um servidor externo e desabilita o servidor próprio do Playwright, inclusive com `CI=true`. Assim, a mesma suíte valida a imagem publicada pelo Compose sem iniciar Vite:

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
