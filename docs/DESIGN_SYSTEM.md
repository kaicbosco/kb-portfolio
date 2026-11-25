# Crimson Void Design System

**KB. Portfolio · Cyberpunk Minimal + Bento Grid · tema exclusivamente escuro.**

Use superfícies escuras, geometria precisa, tipografia técnica e vermelho para hierarquia,
ação e foco. Preserve a marca `KB.` e o ponto vermelho. O destaque de um card é uma
linha fina, não um glow. A fundação visual está disponível para revisão; ela não define
a homepage nem o futuro Application Shell.

- [Tokens e contraste](#tokens-e-contraste)
- [Tipografia e layout](#tipografia-e-layout)
- [Componentes](#componentes)
- [Composição](#composição)
- [Playground e validação](#playground-e-validação)

## Tokens e contraste

[`tokens.css`](../src/assets/styles/tokens.css) é a fonte de verdade. Os valores primitivos
em `:root` alimentam aliases de `@theme static`. Esses aliases funcionam tanto como
custom properties (`var(--color-accent)`) quanto como utilitários Tailwind 4
(`text-accent`, `bg-surface`). Variáveis privadas de componente, como `--button-hover`,
selecionam aliases em vez de repetir cores.

| Alias `--color-*`                  | Valor                                             | Uso                                           |
| ---------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| `background`                       | `#09090B`                                         | Fundo da página                               |
| `surface`                          | `#121214`                                         | Superfície padrão                             |
| `surface-elevated`                 | `#1C1C21`                                         | Elevação visual e badges                      |
| `foreground`                       | `#F4F4F5`                                         | Texto principal                               |
| `muted`                            | `#A1A1AA`                                         | Texto secundário                              |
| `border`                           | `#29292E`                                         | Borda decorativa                              |
| `control-border`                   | `#696970`                                         | Contorno de controle secundário               |
| `primary`                          | `#DC2626`                                         | Preenchimento e contorno de ação principal    |
| `primary-hover` / `primary-active` | `#B91C1C` / `#991B1B`                             | Preenchimento principal em hover / active     |
| `on-primary`                       | `#FFFFFF`                                         | Texto e ícone sobre preenchimentos principais |
| `accent` / `focus`                 | `#F87171`                                         | Texto de acento e contorno de foco            |
| `interactive-hover` / `-active`    | `surface-elevated` com 8% / 16% de `muted` (sRGB) | Preenchimento interativo secundário e ghost   |
| `disabled-surface` / `-foreground` | `surface-elevated` / `muted`                      | Botão desabilitado sem depender de opacidade  |
| `success`                          | `#4ADE80`                                         | Dot de sucesso com rótulo textual             |
| `status-neutral` / `-unavailable`  | `muted` / `accent`                                | Dot neutro ou indisponível com rótulo textual |

O foco usa `--focus-width` e `--focus-offset` de **2 px**. A transição do botão usa
`--duration-interaction` (**140 ms**) e `--ease-interaction` (`ease-out`), apenas na cor
de fundo e somente com `prefers-reduced-motion: no-preference`. Hover depende de uma
entrada com suporte a hover; foco e active não dependem dela.

| Combinação aplicada                                        | Contraste aproximado     |
| ---------------------------------------------------------- | ------------------------ |
| `foreground` em `background` / `surface` / elevada         | 18,10 / 17,02 / 15,44 :1 |
| `muted` em `background` / `surface` / elevada              | 7,76 / 7,30 / 6,62 :1    |
| `accent` ou foco em `background` / `surface` / elevada     | 7,19 / 6,76 / 6,14 :1    |
| `on-primary` em `primary` / hover / active                 | 4,83 / 6,47 / 8,31 :1    |
| `foreground` em `interactive-hover` / `interactive-active` | 13,52 / 11,76 :1         |
| `control-border` contra `background` / `surface` / elevada | 3,65 / 3,44 / 3,12 :1    |
| Borda `primary` contra `background` / `surface` / elevada  | 4,12 / 3,87 / 3,51 :1    |
| Dot `success` na superfície elevada                        | 9,74 :1                  |

Texto normal exige **4,5:1**; contornos necessários para identificar controles e foco
usam **3:1** como mínimo contra a superfície adjacente. O botão primário mantém a
borda `primary` mesmo quando seu preenchimento escurece; no ghost, o rótulo identifica
a ação, sem depender de uma borda. `border` é decorativo (1,17:1 sobre a superfície
elevada). `primary` não é uma cor de texto pequeno; use `accent`. Revalide o contraste
se posicionar um controle sobre outra cor, imagem ou superfície interativa.

## Tipografia e layout

WOFF2 variáveis hospedados localmente via Fontsource com `font-display: swap`:
**Space Grotesk** (`font-display`) para títulos; **Inter** (`font-sans`) para texto e
controles; **JetBrains Mono** (`font-mono`) para metadados e código. Não usar CDN.

| Papel Tailwind           | Tamanho (raiz de 16 px) | Entrelinha | Uso/peso                      |
| ------------------------ | ----------------------- | ---------- | ----------------------------- |
| `text-caption`           | 14 px                   | 1,5        | Metadados 400; botões 600     |
| `text-body`              | 16 px                   | 1,6        | Texto 400; botões grandes 600 |
| `text-lead`              | 18 px                   | 1,55       | Abertura 400                  |
| `text-card-title`        | 20 px                   | 1,3        | Título de card 600            |
| `text-section` / `-wide` | 24 / 32 px              | 1,2 / 1,15 | Título de seção 700           |
| `text-display` / `-wide` | 36 / 48 px              | 1,1        | Título em destaque 700        |

`SectionHeading` aplica a escala maior em `md`, `tracking-heading` (`-0.025em`) nos
títulos e `tracking-eyebrow` (`0.08em`) nos eyebrows. O nível HTML é independente do
tamanho visual. Não trunque traduções nem force caixa alta para conteúdo corrido.

| Faixa (breakpoints do Tailwind) | Grid       | Gap   | Gutter por lado | Padding do card |
| ------------------------------- | ---------- | ----- | --------------- | --------------- |
| Abaixo de `md`                  | 4 colunas  | 16 px | 16 px           | 16 px           |
| `md` (48 rem / 768 px)          | 8 colunas  | 16 px | 24 px           | 24 px           |
| `lg` (64 rem / 1024 px)         | 12 colunas | 24 px | 32 px           | 24 px           |

`site-grid` e `site-gutters` compartilham a estratégia mobile-first. `max-w-site` limita
o contêiner a **80 rem / 1280 px**, incluindo gutters. O espaçamento é múltiplo de
`--spacing` (`0.25rem`); os tokens nomeados cobrem gutters, gap, padding de card,
seções (40/56 px) e alvo. `rounded-md` e `rounded-lg` são **8/12 px**.
O botão usa altura mínima **44/48/56 px** em `sm/md/lg` na raiz padrão, com piso de
44 px em todos os tamanhos e largura mínima de 44 px. O texto pode aumentar a altura.

## Componentes

Importe os SFCs diretamente; eles não dependem de catálogos ou conteúdo de negócio.

| Componente (sob `src/components/`) | Props e defaults                                                                                                            | Slots                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `ui/BaseButton`                    | `variant: primary \| secondary \| ghost` (`primary`), `size: sm \| md \| lg` (`md`), `action` (abaixo)                      | `default`, `leading`, `trailing` |
| `ui/BaseCard`                      | `variant: standard \| elevated \| featured` (`standard`), `as: div \| article \| section \| li` (`div`)                     | `header`, `default`, `footer`    |
| `ui/BaseBadge`                     | `variant: neutral \| accent` (`neutral`)                                                                                    | `default` (texto/metadados)      |
| `layout/AppContainer`              | `gutters: boolean` (`true`)                                                                                                 | `default`                        |
| `layout/BentoGrid`                 | Sem props próprias                                                                                                          | `default` (células diretas)      |
| `layout/BentoCard`                 | `as`/`variant` de `BaseCard`; `mobileSpan` 1–4 (`4`), `tabletSpan` 1–8 (`8`), `desktopSpan` 1–12 (`12`)                     | Os mesmos de `BaseCard`          |
| `shared/SectionHeading`            | `id` e `title` obrigatórios, `eyebrow` e `description` opcionais, `level` 1–6 (`2`), `size: section \| display` (`section`) | Nenhum                           |
| `shared/StatusIndicator`           | `label` obrigatório; `tone: neutral \| success \| unavailable` (`neutral`)                                                  | Nenhum                           |

### Ações e ícones

`BaseButton.action` é uma união discriminada:

- Omitida ou `{ kind: 'button', type?, disabled? }`: `<button>` nativo; `type`
  aceita `button` (padrão), `submit`, `reset`. `disabled` é nativo e suprime `click`.
- `{ kind: 'route', to }`: `RouterLink` com `RouteLocationRaw` e `href` real.
- `{ kind: 'external', href, newTab? }`: `<a>` com URL absoluta HTTP(S). `newTab`
  adiciona `target="_blank"` e `rel="noopener noreferrer"`. URL inválida não recebe
  `href` nem emite `click`; corrija a origem em vez de usar isso como estado de UI.

`@click` recebe `MouseEvent`; guardas de navegação interna pertencem ao router.
`class`, `id`, `lang`, `aria-*` pertinentes e atributos como `name`/`value` do botão
passam ao elemento raiz. Propriedades que determinam o comportamento de ação
(`type`, `disabled`, `target`, `href` etc.) são controladas por `action`, não por
atributos soltos. Links não têm variante disabled.

`leading` e `trailing` são decorativos e escondidos de tecnologias assistivas.
Importe ícones individuais de `@lucide/vue`; o botão dimensiona o SVG direto do slot
em 16/20 px (20 em `lg`). Fora desses slots, use `aria-hidden="true"` em ícones
decorativos. Controles icon-only precisam de `aria-label` ou `aria-labelledby`.
Não há `BaseIcon`: Lucide e os slots já atendem o uso atual sem registro dinâmico.

### Superfícies e hierarquia

- `BaseCard` e `BentoCard` são passivos. `header` e `footer` são áreas de composição,
  não landmarks. Use um link ou botão explícito para a ação e headings conforme o
  contexto. `as="li"` precisa de uma lista ancestral.
- `BaseBadge` é um `span` não interativo; o texto deve comunicar a categoria sem
  depender da cor. `StatusIndicator` também é passivo: dot decorativo, rótulo visível
  e nenhum anúncio automático de status.
- `SectionHeading.id` vai no heading, não no wrapper. Use um ID único e
  `aria-labelledby` na seção correspondente. `level="1"` só quando for o heading
  principal; em templates use `:level="1"` para passar número.
- `AppContainer` não cria landmark. Ao aninhar em um pai que já possui gutters,
  use `:gutters="false"` no container interno.

## Composição

Exemplo de uso em SFC (importe os componentes da tabela acima):

```vue
<AppContainer>
  <section aria-labelledby="patterns-title">
    <SectionHeading id="patterns-title" title="Padrões de interface" />
    <BentoGrid class="mt-4">
      <BentoCard as="article" variant="featured" :tablet-span="5" :desktop-span="7">
        <template #header><h3>Layout reutilizável</h3></template>
        <BaseBadge variant="accent">CSS Grid</BaseBadge>
        <template #footer>
          <BaseButton variant="secondary" :action="{ kind: 'route', to: '/pt' }">
            Abrir a inicial
          </BaseButton>
        </template>
      </BentoCard>
      <BentoCard as="article" variant="elevated" :tablet-span="3" :desktop-span="5">
        <template #header><h3>Estado</h3></template>
        <StatusIndicator tone="success" label="Disponível" />
      </BentoCard>
    </BentoGrid>
  </section>
</AppContainer>
```

Os spans são independentes: omitir uma faixa ocupa toda a linha naquela faixa.
Valores inválidos inesperados usam a largura total. Classes Tailwind estáticas
consomem os spans via custom properties; CSS Grid calcula o layout sem medições JS.
Não use `dense`, reordenação por CSS ou alturas fixas que prejudiquem conteúdo,
ordem de leitura e sequência de foco.

## Playground e validação

Abra `/dev/design-system` com `pnpm dev` ou no Vite do Docker. A rota não aparece na
navegação pública. O router coloca a importação dinâmica dentro de `import.meta.env.DEV`;
o build elimina o ramo. `src/dev/` é excluído da varredura global do Tailwind: os
estilos exclusivos usam `@reference`/`@apply` no CSS da própria rota, sem vazar
utilitários exclusivos para o CSS de produção. O catálogo usa PT-BR como idioma da
rota e `lang="en"` para exemplos em inglês; o seletor continua levando à aplicação
localizada.

Veja [Testes e CI](TESTING.md#crimson-void) para comandos, capturas e a verificação de
404 e de exclusão de módulos. O escopo inclui Chromium, foco e ativação nativos,
alvos, reflow, contraste de combinações usadas e redução de movimento. Não equivale
a uma auditoria WCAG 2.2 AA completa: leitores de tela, outros navegadores e a
acessibilidade dos conteúdos/casos futuros requerem avaliação separada.
