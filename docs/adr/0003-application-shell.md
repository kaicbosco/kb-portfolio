# ADR 0003 — Shell compartilhado e páginas com layout próprio

**Status:** proposto para revisão no Handoff 004.

## Contexto

O layout inicial aplicava grid e gutters a todas as páginas. A homepage vai
precisar de seções com composições distintas; o shell precisa continuar servindo
páginas de projeto, 404 e o playground sem conhecer o layout de cada uma.

## Decisão

Manter `DefaultLayout` com os landmarks globais e foco em navegações, sem impor
grid ao `main`. Delegar aos componentes de página o uso de `AppContainer` e grid.
Compartilhar a navegação entre as duas apresentações e usar um disclosure não
modal no mobile. Só publicar links com destino real; a URL continua sendo a
fonte de verdade do idioma.

## Consequências

- Páginas novas escolhem gutters e grid sem exceções no router ou no shell.
- Novas seções precisam de IDs reais e únicos antes de receber links no menu.
- A altura do header não é presumida pelos destinos: a compensação de scroll
  acompanha a altura real e cessa quando a viewport é baixa demais para sticky.
