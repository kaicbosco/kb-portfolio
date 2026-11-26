# Changelog

## [Não publicado]

### Adicionado

- Fundação SPA bilíngue com rotas localizadas, troca de idioma, páginas mínimas e 404.
- Identidade Crimson Void em tokens Tailwind, fontes variáveis locais e grid responsivo.
- Testes de fundação com Vitest e Playwright, CI e documentação do projeto.
- Docker opcional para Vite e Nginx, com sincronização de dependências, smoke tests HTTP e validação do hardening.
- Análise da imagem de produção com Trivy e configuração de distribuição condicionada no GHCR, sem deploy.
- APIs reutilizáveis de botão, card, badge, container, Bento Grid, heading e indicador de status.
- Catálogo visual em `/dev/design-system`, exclusivo de Vite dev, e testes de componentes, reflow, teclado, contraste e exclusão do catálogo em produção.
- Application Shell bilíngue com cabeçalho sticky, disclosure mobile, estados de navegação, seletor PT/EN e footer básico com perfis confirmados.
- Testes do shell para teclado, reflow, contraste, histórico e âncoras, com capturas opcionais para revisão humana.
- Registro da validação externa da imagem do GHCR e dos smoke tests HTTP no Ubuntu 24.04.5 LTS (`linux/amd64`).
- Hero bilíngue Crimson Core V4 com apresentação profissional, CTAs de GitHub e LinkedIn e Bento Strip de quatro cards.
- Digital Core em SVG com Precision Motion, resposta magnética restrita à geometria interna e controle acessível de pausa.
- Testes do Hero para conteúdo, reflow, ciclo de vida, teclado e independência entre moldura, inclinação e órbita.

### Alterado

- Scripts de qualidade, configuração TypeScript dos testes e recomendações do VS Code.
- Ícone do 404 migrado de `lucide-vue-next` para o sucessor oficial `@lucide/vue`, sem alteração visual.
- Validação no Chromium reforçada para foco visível, preservação de fragmento e ícone decorativo do 404.
- Git ignora arquivos locais de ambiente e registros de revisão.
- Pipeline nativa reutilizável, executada uma vez por evento, e E2E com suporte a servidor externo.
- Tokens Crimson Void para tipografia, espaçamento, foco e estados interativos, com grid de oito colunas no tablet e acento vermelho no ponto da marca.
- Layout interno delegado às páginas; foco e scroll distinguem mudanças de página, query, fragmento e histórico.
- Título da homepage localizado com o nome e a especialidade profissional.

### Corrigido

- Menu mobile permanece aberto quando a notificação de breakpoint chega depois da ativação; os testes verificam estado, foco e contraste no painel correto.

### Removido

- Interface e testes de demonstração do Vue, favicon do scaffold e dependências auxiliares dispensáveis.
