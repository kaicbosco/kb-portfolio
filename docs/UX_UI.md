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

## Experiência planejada

1. Navbar (estrutura disponível; destinos adicionais dependem das seções)
2. Hero com Digital Core, um objeto tecnológico abstrato
3. About Me
4. Selected Projects
5. Tech Stack
6. Experience
7. Education
8. Contact
9. Footer

Estudos de caso terão páginas individuais. O conteúdo provisório atual não é um esqueleto do desenho definitivo. Antes de implementar as seções, aprovar a hierarquia dos conteúdos, os estados mobile e desktop, as transições e as alternativas sem movimento ou sem efeitos.
