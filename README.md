# KB. Portfolio

Portfólio profissional de Kaíque Bosco Araújo, desenvolvedor frontend e estudante de Engenharia de Software. A homepage bilíngue apresenta o Hero Crimson Core, o Digital Core em SVG com controle de animações e quatro cards de informações profissionais. As demais seções e os estudos de caso definitivos estão no [roadmap](docs/ROADMAP.md).

## Desenvolvimento local

Use a versão do Node.js indicada em [`.nvmrc`](.nvmrc) (22.23.1) e o pnpm 10.33.1, fixado em [`package.json`](package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

O Vite informa a URL local. Abra `/pt` ou `/en` para escolher o idioma. No VS Code, abra [`kb-portfolio.code-workspace`](kb-portfolio.code-workspace) e use as [extensões recomendadas](.vscode/extensions.json).

| Comando              | Finalidade                                  |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento                 |
| `pnpm build`         | Checagem de tipos e build em `dist/`        |
| `pnpm preview`       | Servir localmente o build já gerado         |
| `pnpm lint`          | Lint sem correções; falha em avisos         |
| `pnpm lint:fix`      | Aplicar correções do Oxlint                 |
| `pnpm format`        | Formatar arquivos com Prettier              |
| `pnpm format:check`  | Conferir formatação sem reescrever arquivos |
| `pnpm type-check`    | Checar tipos da aplicação, configs e testes |
| `pnpm test:unit`     | Executar Vitest em modo de observação local |
| `pnpm test:unit:run` | Executar Vitest uma vez                     |
| `pnpm test:e2e`      | Executar Playwright com Chromium            |
| `pnpm check`         | Lint, formatação, testes unitários e build  |

Para E2E, instale somente o Chromium headless gerenciado pelo Playwright:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" pnpm exec playwright install --only-shell chromium
PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" pnpm test:e2e
```

Consulte [Testes](docs/TESTING.md) para usar um Chromium já instalado ou reproduzir a verificação contra o build.

## Docker opcional

```sh
docker compose up --build dev
docker compose up --build -d --wait production
```

O Vite fica em `http://127.0.0.1:5173` e o Nginx em `http://127.0.0.1:8080`. Execute o segundo comando em outro terminal para usar os dois juntos. Consulte o [guia Docker](docs/DOCKER.md) para requisitos, testes, segurança e distribuição pelo GHCR.

## Documentação

- [Projeto](docs/PROJECT.md), [arquitetura](docs/ARCHITECTURE.md) e [ADRs](docs/adr/)
- [Design system](docs/DESIGN_SYSTEM.md) e [UX/UI](docs/UX_UI.md)
- [Conteúdo](docs/CONTENT.md) e [roadmap](docs/ROADMAP.md)
- [Testes e CI](docs/TESTING.md), [Docker](docs/DOCKER.md), [regras para agentes](AGENTS.md) e [changelog](CHANGELOG.md)
