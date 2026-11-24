# Arquitetura

## Módulos existentes

| Local                     | Responsabilidade                                                           |
| ------------------------- | -------------------------------------------------------------------------- |
| `src/main.ts`             | Criar app, router e i18n; carregar estilos; montar após navegação inicial. |
| `src/App.vue`             | Compor layout e página; sincronizar catálogo, `html[lang]` e título.       |
| `src/router/`             | Declarar rotas, metadados e destinos equivalentes por idioma.              |
| `src/i18n/`               | Definir idiomas, fallback e catálogos de interface com a mesma estrutura.  |
| `src/layouts/`            | Prover landmarks, acesso rápido ao conteúdo e foco em mudanças de rota.    |
| `src/components/layout/`  | Renderizar a navegação de idiomas com links reais.                         |
| `src/pages/`              | Renderizar a inicial, o placeholder de projeto e o 404.                    |
| `src/assets/styles/`      | Centralizar tokens, fontes, estilos globais e utilitários Tailwind.        |
| `src/constants/`          | Centralizar identificadores estáveis da marca.                             |
| `src/__tests__/` e `e2e/` | Testar integração Vue/router/i18n e fluxos em navegador.                   |

As páginas não são duplicadas por idioma. Cada tipo de página tem um componente carregado sob demanda pelo router. `ProjectPage` recebe `slug` como prop tipada; nenhuma página faz acesso a backend. Diretórios como `sections/`, `content/` e `composables/` serão criados quando houver seções, dados editoriais e comportamentos reutilizáveis concretos.

Os catálogos de interface são pequenos e carregados junto com a aplicação. O Vite exclui a API legada e o registro global de componentes e diretivas do Vue I18n; a interface usa `useI18n`. Avaliar a pré-compilação de mensagens quando o catálogo crescer.

## Rotas

| Endereço             | Comportamento                                           |
| -------------------- | ------------------------------------------------------- |
| `/`                  | Redireciona para `/pt`, preservando query e fragmento.  |
| `/pt` e `/en`        | Inicial em português brasileiro e inglês.               |
| `/pt/projetos/:slug` | Placeholder de estudo de caso em português.             |
| `/en/projects/:slug` | O mesmo placeholder em inglês.                          |
| `/pt/*` e `/en/*`    | 404 no idioma do prefixo quando outra rota não casa.    |
| Demais URLs          | 404 em português, sem substituir o endereço solicitado. |

Qualquer `slug` que case com a rota de projeto renderiza apenas o placeholder. A validação de slugs contra um catálogo e o tratamento de projetos inexistentes ficam para a etapa editorial. A troca de idioma preserva `slug`, query e fragmento quando há uma página equivalente. No 404, leva para a inicial do outro idioma. Leia o [ADR 0001](adr/0001-rotas-localizadas.md).

## SEO e hospedagem futura

A SPA usa History API; o host precisa servir o HTML da aplicação para navegações diretas em rotas válidas. O 404 atual é uma página, não uma garantia de status HTTP 404. Antes de publicar, preparar pré-renderização das URLs canônicas e dos slugs aprovados, com `lang`, descrição, canonical e `hreflang` já no HTML. Definir sitemap, política de indexação de páginas provisórias, redirecionamento de `/` no host e 404 HTTP para endereços inválidos. Nenhum domínio, configuração da Vercel ou mecanismo de pré-renderização foi adotado nesta etapa.
