# ADR 0004 — Camadas de movimento do Digital Core

**Status:** proposto para revisão no Handoff 005.

## Contexto

O Crimson Core V4 tem uma referência visual fixa (moldura, grade e rótulos)
e um conjunto orbital que responde ao ponteiro. A entrada, a perspectiva e a
rotação precisam coexistir; medir um elemento já inclinado criaria feedback
no cálculo da posição do cursor.

## Decisão

Sobrepor dois SVGs decorativos nativos com o mesmo `viewBox`. Manter o Static
Frame como irmão de um wrapper HTML que aplica perspectiva por meio do stage
e recebe rotação e deslocamento magnético. O SVG interno anima os arcos em
um grupo descendente; a entrada atua em um ancestral comum. O retângulo para
normalização vem do stage. A visibilidade e as preferências controlam a
execução das animações CSS; callbacks JS só atualizam a resposta ao ponteiro.

## Consequências

- O stage reserva a geometria quadrada antes da animação e serve de referência
  estável para entrada do ponteiro e observação da viewport.
- A rotação dos arcos pode continuar durante a inclinação da camada interna e
  a moldura mantém posição comparável.
- Os dois SVGs compartilham a convenção de coordenadas, porém mantêm seus
  próprios recursos de pintura. `useId()` identifica gradientes e patterns
  por instância.
- Sem movimento, a mesma figura continua no DOM e dispensa assets externos.
