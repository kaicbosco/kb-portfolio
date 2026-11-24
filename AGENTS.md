# Instruções para agentes

## Escopo e arquitetura

- Leia `README.md`, `docs/PROJECT.md`, `docs/ARCHITECTURE.md` e os documentos da área antes de modificar o projeto. Consulte `docs/ROADMAP.md` para distinguir trabalho entregue de trabalho planejado.
- Use Vue 3 com Composition API e `<script setup lang="ts">`. Mantenha TypeScript estrito, props e eventos tipados; trate entradas desconhecidas como `unknown`, valide-as e evite `any`.
- Separe composição de páginas, comportamento, conteúdo e apresentação. Descreva a responsabilidade de novos módulos e só crie pastas/abstrações quando houver uso real.
- Use PascalCase em componentes, `use` em composables e camelCase em variáveis e funções. Nomes técnicos em inglês; documentação interna em português brasileiro.
- Consulte os tokens em `src/assets/styles/` antes de adicionar estilos. Não reintroduza o tema claro. Não adicione dependências sem justificar; Pinia, Vuetify, infraestrutura de servidor, Docker, GSAP e Three.js não fazem parte da fundação.

## Segurança, acessibilidade e idiomas

- Não publique segredos, dados de clientes, código proprietário do ERP Web ou informações profissionais não confirmadas. Registre dúvidas em `docs/CONTENT.md`.
- Renderize conteúdo textual com interpolação escapada; não use `v-html` com conteúdo não confiável. Minimize permissões e não adicione rastreadores ou requisições externas sem aprovação.
- Use HTML semântico, ordem lógica de títulos e foco, navegação por teclado e rótulos acessíveis. Verifique contraste WCAG AA, zoom e reflow; futuras animações devem respeitar `prefers-reduced-motion`.
- A URL é a fonte de verdade do idioma. Não use storage ou configuração do navegador para sobrescrever `/pt` ou `/en`. Atualize ambos os catálogos na mesma mudança e preserve as rotas equivalentes na troca de idioma.

## Workflow e qualidade

1. Inspecione o Git, as instruções e os arquivos relevantes. Preserve alterações preexistentes e informe plano, riscos e incompatibilidades antes de editar.
2. Implemente apenas o escopo autorizado. Acrescente testes de comportamento; evite desativar verificações, adicionar artefatos grandes ou alterar arquivos fora do workspace.
3. Revise o diff e rode `pnpm check`; para mudanças que afetem navegação, layout ou execução no navegador, rode também `pnpm test:e2e`. Não use correções automáticas na CI nem ignore suites vazias.
4. Atualize a documentação aplicável, o changelog e, quando houver um trade-off arquitetural duradouro, registre um ADR curto. Relate resultados e limitações de forma verificável.
5. Use Conventional Commits com tipo em inglês e descrição em português brasileiro (ex.: `feat(hero): implementa objeto abstrato animado`). Não faça commit, push, merge, criação de remotos ou deploy sem solicitação explícita.
