# UX/UI

## Application Shell

O cabeçalho sticky tem altura mínima aproximada de 64 px no mobile e 72 px no desktop.
A partir de `lg` (64 rem), a navegação horizontal fica no centro, entre a marca e os
idiomas. Abaixo disso, o botão abre uma lista vertical no fluxo do cabeçalho. A
abertura mantém o foco no botão; o próximo Tab entra no painel. Escape e a seleção
repetida do destino devolvem o foco ao botão; sair do cabeçalho e navegar também
fecham o painel. A troca de idioma fica acessível com o painel fechado.

| Destino planejado        | Neste handoff                                                            |
| ------------------------ | ------------------------------------------------------------------------ |
| Início / Home            | Link público para a inicial localizada, com sublinhado quando atual.     |
| Sobre / About            | Futuro; sem âncora publicada.                                            |
| Projetos / Projects      | Futuro; sem índice nem seção publicada. URLs de detalhe são provisórias. |
| Experiência / Experience | Futuro; sem âncora publicada.                                            |
| Contato / Contact        | Futuro; sem âncora publicada.                                            |

A marca vai para a inicial do idioma atual. PT/EN mostra os códigos e anuncia os
nomes completos nos próprios idiomas; o idioma atual é um rótulo, não um link.
O footer básico tem copyright e os perfis confirmados de GitHub e LinkedIn, que
abrem na mesma aba. A composição editorial e o CTA ficam para o Handoff 009.

A primeira interação por Tab é o skip link. O 404 preserva a URL inválida e oferece
retorno à inicial correspondente. As páginas têm um único `h1`; as verificações de
foco, reflow e contraste estão no [guia de testes](TESTING.md#application-shell).

## Hero Crimson Core V4

Apresentação textual, Digital Core decorativo e Bento Strip nessa ordem no DOM.
O nome em duas linhas domina a composição; a disponibilidade usa um ponto
verde estático. Os CTAs explícitos levam aos perfis públicos em nova aba. Os
quatro cards são informativos, sem estados de hover nem paradas de Tab.

| Faixa              | Introdução e Digital Core                             | Bento Strip               |
| ------------------ | ----------------------------------------------------- | ------------------------- |
| Mobile, < 768 px   | Empilhados, CTAs verticais                            | Quatro linhas de um card  |
| Tablet, ≥ 768 px   | Empilhados, Core centralizado e CTAs lado a lado      | Duas linhas de dois cards |
| Desktop, ≥ 1024 px | Lado a lado, spans 7/5 e alinhamento vertical central | Uma linha de quatro cards |

O Core é quadrado, com grade de 20 unidades e moldura a 12 unidades da borda.
O centro `(200, 200)` alinha as órbitas de raios 161/141 e os hexágonos de
raios 135/100/58. Trilhas em eixos isométricos ligam o centro aos seis nós do
hexágono intermediário. Arcos opostos, gradientes contidos e marcações de eixo,
canto e figura completam a geometria.

### Precision Motion

| Movimento  | Comportamento                                                                     |
| ---------- | --------------------------------------------------------------------------------- |
| Órbita     | Arcos e marcadores giram em 32 s lineares.                                        |
| Respiração | Opacidade externa e central variam suavemente em 6 s.                             |
| Sinais     | Dois traços percorrem conexões em ciclos de 6 s e fases separadas.                |
| Nós        | Seis vértices variam em luminosidade, em ciclos de 6 s, faseados em 1 s.          |
| Entrada    | Fade e deslocamentos de até 12 px, mais escala de 98–100% no Core, em até 720 ms. |

No tablet, a geometria e o perfil Precision Motion são preservados. No mobile,
só o glow ambiental respira; a entrada é simplificada para 300 ms. Focar um
CTA cancela a entrada do grupo enquanto houver foco. A pausa manual suspende
as animações CSS e neutraliza a inclinação. O modo de redução de movimento
preserva a composição completa e informa no botão que o sistema desativou as
animações. Em ambos os modos, as trilhas estruturais permanecem visíveis.

No desktop com hover e ponteiro preciso, o Core interno translada até ±5 px
e inclina até ±6° por eixo, com perspectiva de 800 px. A moldura, a grade,
os rótulos e o glow externo ficam fixos. Os arcos giram no SVG interno,
independentemente da inclinação do grupo. A interpolação magnética leva
190 ms; `pointerleave` e `pointercancel` devolvem o Core ao centro em 300 ms.
Pausa, mudanças de capacidade e saída da área observada neutralizam a
inclinação sem prolongar movimento. Veja [Testes](TESTING.md#hero-e-digital-core).

## Experiência planejada

1. Navbar (estrutura disponível; destinos adicionais dependem das seções)
2. Hero com Digital Core (implementado, em revisão)
3. About Me
4. Selected Projects
5. Tech Stack
6. Experience
7. Education
8. Contact
9. Footer

Estudos de caso terão páginas individuais. O conteúdo provisório atual não é um esqueleto do desenho definitivo. Antes de implementar as seções, aprovar a hierarquia dos conteúdos, os estados mobile e desktop, as transições e as alternativas sem movimento ou sem efeitos.
