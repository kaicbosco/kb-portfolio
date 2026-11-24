# ADR 0001 — Idioma determinado pela rota

**Status:** aceito.

## Contexto

O portfólio precisa ter links compartilháveis nos dois idiomas, inclusive para estudos de caso. O idioma não deve mudar ao abrir o mesmo link em outro navegador.

## Decisão

Usar duas famílias de rotas com componentes compartilhados e metadados tipados. `/` redireciona para `/pt` de forma determinística, independentemente do navegador e de preferências salvas. Os catálogos usam `pt-BR` e `en`; o documento é sincronizado após resolver a rota. O destino da troca de idioma é montado por nome de rota, não por substituição textual do caminho.

## Consequências

- O histórico, o acesso direto e a troca de idioma são testáveis sem storage ou browser detection.
- O identificador de projeto é comum aos idiomas nesta etapa. Se slugs editoriais forem traduzidos, a resolução usará um ID compartilhado e o catálogo de slugs por idioma.
- A SPA depende de fallback no host. Status HTTP, canonical, `hreflang` e pré-renderização serão decididos antes da publicação.
