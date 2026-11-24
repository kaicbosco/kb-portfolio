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

## GitHub Actions

O workflow executa em PRs e pushes para `main`. Usa Node de `.nvmrc`, pnpm de `packageManager` e `pnpm install --frozen-lockfile`. `pnpm check` gera `dist/`; Playwright testa esse build em `127.0.0.1:4173` com um worker. Só são instalados o Chromium headless gerenciado e suas dependências no runner. Se houver falha, `test-results/` é enviado como artefato por até cinco dias. Não há deploy nem correções automáticas.

Firefox, WebKit, tecnologias assistivas e status HTTP de rotas em hospedagem real não são cobertos pela suite atual.
