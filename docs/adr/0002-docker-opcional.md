# ADR 0002 — Conteinerização opcional

**Status:** proposto para revisão no Handoff 002.1.

## Contexto

O portfólio é uma SPA estática. O desenvolvimento nativo funciona e deve continuar independente do Docker. O projeto precisa de um ambiente reproduzível para testar navegação direta, cache e restrições de execução antes de distribuir a imagem.

## Decisão

Preservar dois ambientes no Compose: Vite como usuário `node`, com bind mount e volumes de dependências, e Nginx não privilegiado, com build multi-stage que transfere apenas `dist/` para o runtime. Usar bases por digest, BuildKit e lockfile congelado. O job de publicação pode enviar ao GHCR somente a imagem de produção validada, transferida por artefato, sem rebuild.

## Consequências

- O Docker é opcional no desenvolvimento e o runtime não precisa de Node, pnpm ou fonte da aplicação.
- A versão de patch do Node do container pode divergir da nativa dentro do intervalo aceito; ambas são identificadas e verificadas separadamente.
- Os digests precisam de revisão explícita para receber correções. O Trivy bloqueia achados altos e críticos, mesmo sem correção, ou falhas do scanner.
- A imagem fornece usuário não privilegiado, Nginx e healthcheck. O Compose aplica as restrições adicionais; distribuir a imagem não configura essas restrições em outro host, nem define o destino de deploy.
- O fallback preserva o acesso direto a rotas da SPA; o 404 do router não se torna um 404 HTTP. Não foi adotado SSR ou pré-renderização.
