# Design system

**Identidade:** KB. Portfolio, marca `KB.`, Cyberpunk Minimal + Bento Grid. **Tema:** apenas escuro, com densidade equilibrada, bordas discretas, glow vermelho pontual e animação moderada. A fundação não implementa o acabamento visual final.

## Crimson Void

Os valores primitivos e aliases estão em [`tokens.css`](../src/assets/styles/tokens.css), integrados ao Tailwind 4 por `@theme`. Use nomes semânticos como `bg-background`, `text-muted` e `text-accent`. Não há tokens específicos de componentes enquanto não houver necessidade real.

| Token de cor       | Valor     | Uso                                      |
| ------------------ | --------- | ---------------------------------------- |
| `background`       | `#09090B` | Fundo principal                          |
| `surface`          | `#121214` | Superfície                               |
| `surface-elevated` | `#1C1C21` | Superfície elevada                       |
| `primary`          | `#DC2626` | Preenchimento de ação principal          |
| `primary-hover`    | `#B91C1C` | Hover do preenchimento                   |
| `foreground`       | `#F4F4F5` | Texto principal                          |
| `muted`            | `#A1A1AA` | Texto secundário                         |
| `border`           | `#29292E` | Borda decorativa                         |
| `success`          | `#4ADE80` | Estado de sucesso, com indicação textual |
| `accent` e `focus` | `#F87171` | Texto de destaque e foco visível         |
| `on-primary`       | `#FFFFFF` | Texto sobre preenchimentos vermelhos     |

Em WCAG AA, texto normal requer pelo menos **4,5:1**. `accent` chega a **6,14:1** na superfície elevada; `muted`, a **6,62:1**. `primary` sozinho sobre o fundo tem **4,12:1** e não deve ser usado como texto normal. Use `on-primary` sobre `primary` (**4,83:1**) ou `primary-hover` (**6,47:1**). `border` não atinge **3:1** nas superfícies escuras: não a use como única indicação de um controle ou estado. Links da fundação são sublinhados e o foco usa contorno com offset.

## Tipografia e layout

- Inter (`font-sans`) para conteúdo e interface; Space Grotesk (`font-display`) para títulos e marca; JetBrains Mono (`font-mono`) para identificadores.
- `fonts.css` consome os WOFF2 variáveis latinos do Fontsource, com `font-display: swap` e fallbacks do sistema. PT-BR e EN não dependem de CDN.
- `max-w-site`: 80 rem (1280 px na raiz padrão). `site-grid`: 4 colunas no mobile, 12 a partir de `lg` (64 rem). A escala de espaçamento parte de `0.25rem` (4 px na raiz padrão).
- Raios predominantes de 8–12 px (`rounded-md` e `rounded-lg`). Nenhum movimento decorativo nesta etapa; efeitos futuros devem respeitar `prefers-reduced-motion`.
