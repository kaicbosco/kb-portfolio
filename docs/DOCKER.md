# Docker

Docker é opcional. O fluxo nativo com `.nvmrc`, pnpm, Vite e Chromium continua disponível e não depende de containers. Use Docker para isolar as dependências de desenvolvimento ou validar como o Nginx serve o build estático. A imagem não inclui backend e sua publicação não implanta o portfólio.

- [Pré-requisitos e início rápido](#pré-requisitos-e-início-rápido)
- [Imagens, volumes e cache](#imagens-volumes-e-cache)
- [Comandos e testes](#comandos-e-testes)
- [Produção e segurança](#produção-e-segurança)
- [CI/CD e GHCR](#cicd)
- [Validação em ambiente externo](#validação-em-ambiente-externo)
- [Diagnóstico e atualização](#diagnóstico-e-atualização)

## Pré-requisitos e início rápido

- Docker Engine com BuildKit e plugin Docker Compose v2. Ambiente local de referência: Engine 26.1.5 e Compose 2.26.1. Para redes não confiáveis, leia a ressalva sobre publicação abaixo.
- Para E2E no host: Node da `.nvmrc`, pnpm do `package.json` e Chromium compatível. Para o smoke test, use Bash e `curl`.

```sh
# Vite: 127.0.0.1:5173, com hot reload e volumes criados automaticamente.
docker compose up --build dev

# Em outro terminal: Nginx em 127.0.0.1:8080.
docker compose up -d --build --wait production
```

O serviço `dev` não usa profile. O `production` pertence ao profile `production` e é ativado quando selecionado pelo nome. Para subir ambos de uma vez, use `docker compose --profile production up -d --build --wait`.

## Imagens, volumes e cache

| Arquivo ou serviço      | Responsabilidade                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `docker/Dockerfile.dev` | Node 22.23.5 Bookworm Slim, pnpm do `package.json`, dependências e Vite como UID 1000. |
| `Dockerfile` (builder)  | Mesma base Node; resolve o lockfile congelado e executa `pnpm build`.                  |
| `Dockerfile` (runtime)  | Nginx 1.30.7 Alpine Slim: recebe `dist/` em `/srv/portfolio`, sem Node ou pnpm.        |
| `compose.yaml`          | Portas, bind mount, volumes e restrições de execução.                                  |

As bases fixam tags legíveis e digests de índice. O Node nativo e o da CI são 22.23.1; o container usa 22.23.5, dentro do intervalo de `engines.node`. O patch do container foi mantido porque sua base já estava validada. Os dois Dockerfiles usam o frontend já fornecido pelo BuildKit, sem baixar uma tag de frontend mutável. Não há promessa de imagens idênticas byte a byte: metadados do build, plataforma e versão do builder podem alterar a identidade.

`.dockerignore` permite somente entradas do projeto e exclui arquivos locais sensíveis comuns. O builder de produção copia explicitamente as entradas de build e de tipos. Não adicione credenciais a diretórios incluídos; arquivos ignorados pelo Git não são automaticamente ignorados pelo Docker.

- O código em `/app` vem do bind mount do checkout, para o Vite observar as alterações. `node_modules` e `pnpm_store` são volumes nomeados do projeto: não precisam ser criados manualmente e não usam o `node_modules` nativo.
- Um volume de `node_modules` novo recebe as dependências e a marca de sincronização da imagem. A entrada dev só usa `pnpm install --frozen-lockfile` se a marca, os manifests, a versão/plataforma do Node ou o Vite instalado não corresponderem. Um lockfile incompatível impede a partida. Alterações no lockfile exigem restart; não são tratadas pelo hot reload.
- O store efetivo do pnpm 10 é `/pnpm/store/v10` quando existe. O mount BuildKit em `/pnpm/store` é compartilhado pelos builds locais; o volume de runtime no mesmo caminho é independente e pode começar vazio. Alterações que precisarem de pacotes não presentes nesse volume podem acessar o registry. Nenhum cache de store é copiado intencionalmente para o runtime.
- A imagem dev não impõe `NODE_ENV=development`: o Vite usa desenvolvimento ao servir e produção ao rodar `pnpm build`, como no fluxo nativo.
- O container dev usa `node` (UID/GID 1000). No Linux, a escrita no bind mount também depende das permissões do checkout no host. Se seu UID/GID for diferente, use um checkout gravável para o UID/GID do container ou execute o quality gate nativamente. Não execute como root nem mude permissões de forma recursiva como procedimento padrão.

Se pretender alternar com o fluxo nativo no mesmo clone Linux, execute `mkdir -p node_modules` no host antes da primeira partida Docker. Isso cria apenas o diretório de montagem, não um volume Docker. Se o daemon já criou esse diretório como root e ele estiver vazio, pare o serviço dev, use `rmdir node_modules` (só remove diretório vazio) e instale nativamente. Evite builds simultâneos no mesmo checkout porque ambos podem escrever em `dist/`.

## Comandos e testes

```sh
docker compose --profile production config --quiet
docker compose --profile production ps
docker compose logs -f dev
docker compose restart dev          # Depois de mudar o lockfile.
docker compose exec -T dev pnpm check
bash docker/check-production.sh    # Com Nginx saudável.
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080 \
  PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test:e2e
docker compose --profile production down
```

`down` preserva os volumes nomeados sem `--volumes`. Para um segundo checkout, escolha projeto, tags e portas distintos. Exemplo (use os mesmos valores ao inspecionar e encerrar):

```sh
export COMPOSE_PROJECT_NAME=kb-portfolio-review KB_IMAGE_REPOSITORY=kb-portfolio-review
export KB_DEV_PORT=25173 KB_PRODUCTION_PORT=28080
docker compose --profile production up -d --build --wait
```

O script de produção resolve a porta via Compose. Se a porta for alterada, ajuste `PLAYWRIGHT_BASE_URL`. Veja [Testes](TESTING.md) para o navegador gerenciado, o preview nativo e os artefatos de falha.

## Produção e segurança

O Nginx responde na porta 8080 usando `/srv/portfolio`, sem servir as páginas padrão que permanecem na imagem base. Acesso direto às rotas PT-BR e EN recebe `index.html`. Endereços de navegação desconhecidos também recebem HTTP 200; o router renderiza o 404 no cliente. Arquivos ausentes em `/assets/` recebem HTTP 404. HTML e arquivos não versionados revalidam (`no-cache`); assets do Vite com hash no nome recebem `immutable` por um ano. Não copie arquivos de nome estável que imitem o padrão de hash para `/assets/`.

A imagem inclui o usuário 101, a configuração do Nginx e o healthcheck do `index.html`. O Compose aplica `read_only`, `cap_drop: ALL`, `no-new-privileges`, publicação em `127.0.0.1` e tmpfs de 16 MiB em `/tmp` com `noexec,nosuid,nodev` para PID e diretórios temporários. O runtime preserva o sinal de parada `SIGQUIT` da base. Se executar a imagem diretamente ou em outro orquestrador, replique as proteções do Compose.

O servidor não divulga a versão nos headers e envia `nosniff`, política de referrer e bloqueio de framing. A CSP mínima limita `base-uri`, `object-src` e `frame-ancestors`; não é uma política de restrição de scripts/estilos. Isso evita autorizar origens antecipadamente ou quebrar recursos locais. HTTPS, HSTS e uma CSP completa devem ser avaliados no ambiente de publicação.

O bind em loopback não é isolamento absoluto. Segundo a [documentação do Docker](https://docs.docker.com/engine/network/port-publishing/), versões anteriores à 28.0.0, incluindo 26.1.5, têm uma limitação que pode permitir alcance a partir do mesmo segmento de camada 2. Não trate a porta local como barreira de segurança em rede não confiável; planeje a atualização do Engine separadamente. Não há teste remoto dessa condição neste handoff.

## CI/CD

`docker.yml` é a entrada para PRs, pushes na `main` e disparos manuais. `ci.yml` é apenas reutilizável, executando instalação congelada, lint, formatação, testes unitários, tipos, build e Playwright contra Vite Preview. Depois, o job Docker valida Compose, faz os dois builds no mesmo runner (cache BuildKit local), testa HTTP e hardening no Nginx, roda Playwright contra ele e escaneia a imagem de produção pelo ID que está em execução.

Na primeira revisão remota, confira os nomes dos checks requeridos se a proteção de branch ainda referenciar o workflow CI antigo. Este handoff não altera configurações do GitHub.

O Trivy verifica pacotes de sistema e bibliotecas reconhecíveis na imagem de produção. `HIGH` e `CRITICAL` bloqueiam, com ou sem correção disponível; erro de scanner ou ausência de relatório também bloqueia. O relatório, quando gerado, fica nos logs e em um artefato por cinco dias. Esse scan depende da base de dados, da plataforma construída e do reconhecimento dos pacotes. Não cobre o daemon Docker, a imagem dev, as dependências do builder nem bibliotecas incorporadas em bundles JS sem metadados de pacote.

Em 25/11/2026, o Trivy 0.70.0 encontrou 5 críticos e 15 altos na imagem com Nginx 1.30.6/Alpine 3.24.2. A base corrigida [Nginx Unprivileged](https://github.com/nginx/docker-nginx-unprivileged) 1.30.7/Alpine 3.24.4, variante slim, deixou zero altos ou críticos na imagem final `linux/amd64`. Uma análise local sem filtro registrou 7 médios e 4 baixos em OpenSSL e zlib, fora do limiar de bloqueio. O scanner avisou que Alpine 3.24 não constava na sua lista de fim de suporte, mas detectou o Alpine e analisou 21 pacotes com a base de vulnerabilidades de 25/11/2026. Esses dados valem para o digest e a base de dados testados, não garantem ausência de novos achados.

### GHCR

Somente pushes para `main` em `kaicbosco/kb-portfolio` habilitam exportação e publicação. A pipeline armazena a imagem testada por um dia e o job `publish` a restaura por ID de artefato, verifica a integridade do download, o ID da imagem e a revisão OCI. Somente esse job recebe `packages: write` e usa `GITHUB_TOKEN` para o GHCR. O source OCI associa a imagem ao repositório. Não há rebuild nem deploy.

A tag `sha-<SHA completo>` identifica o commit. `latest` só é atualizado se o commit ainda for a ponta da `main` quando consultado; pushes na `main` são serializados. A consulta e o push não são atômicos. Para reprodutibilidade, fixe o digest do manifesto reportado na publicação, não uma tag.

Quando houver um pacote público, não é preciso autenticar para baixar:

```sh
docker pull ghcr.io/kaicbosco/kb-portfolio:latest
```

Para um pacote privado, o usuário precisa de acesso ao pacote e de um PAT clássico com `read:packages` (e autorização SSO, se exigida). Com `GHCR_USER` e `GHCR_PAT` já fornecidos de forma segura:

```sh
printf '%s' "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
docker pull ghcr.io/kaicbosco/kb-portfolio:latest
docker logout ghcr.io
```

Uma imagem ainda não publicada não pode ser baixada desse endereço. Para workflows consumidores, prefira `GITHUB_TOKEN` com `packages: read`, desde que o repositório tenha acesso ao pacote.

## Validação em ambiente externo

Em 26/11/2026, a imagem `ghcr.io/kaicbosco/kb-portfolio:latest`, com revisão OCI
`6faf745cd67372224791245c85169bc4b6f49167`, foi validada no seguinte ambiente:

- Ubuntu 24.04.5 LTS (Noble Numbat), `linux/amd64`.
- Docker Engine Community 29.10.0, Docker API 1.57, containerd 2.4.2 e runc 1.5.3.

O download pelo GHCR e a inicialização foram bem-sucedidos. O healthcheck atingiu
o estado `healthy`, e o container coexistiu com outros containers ativos.
Os códigos de resposta estão no [registro dos smoke tests HTTP](TESTING.md#smoke-tests-http-em-ambiente-externo).

Em conjunto com a validação local no Debian 13 (Docker Engine 26.1.5), os resultados
demonstram portabilidade entre Debian 13 e Ubuntu 24.04.5 LTS em `linux/amd64`,
com versões diferentes do Docker Engine, dentro do escopo testado.

Na amostra, o container usou 10,57 MiB de memória, registrou 0,00% de CPU, 13 PIDs
e 0 B de escrita em disco. Esses valores não caracterizam o consumo sob carga elevada.
Interações no navegador da máquina externa, outras arquiteturas, Windows e macOS
permanecem não confirmados.

## Diagnóstico e atualização

- **Porta ocupada:** pare somente o seu processo correspondente ou use `KB_DEV_PORT`/`KB_PRODUCTION_PORT`. Vite nativo e Vite no Docker usam a mesma porta padrão.
- **Falha de instalação:** confirme `package.json` e `pnpm-lock.yaml`, a conectividade com o registry e a propriedade dos volumes. Consulte `docker compose logs dev`. Para diagnosticar volumes antigos sem apagá-los, isole o projeto conforme o exemplo acima. Se o `node_modules` nativo pertencer a outro store e o pnpm pedir recriação, use um clone limpo ou revise essa mudança em terminal interativo.
- **Build com base atualizada:** verifique os avisos do fornecedor e compare o digest da variante exata com `docker buildx imagetools inspect <imagem:tag>`. Atualize o mesmo digest Node nos dois Dockerfiles quando aplicável. Confirme plataformas, `engines.node`, versão do pnpm, UID, paths e sinal do runtime. Refaça builds, testes e scan da imagem final, sem afrouxar o gate nem alterar volumes existentes.
- **Scan bloqueado:** consulte versão instalada, correção disponível e aviso do fornecedor. Prefira migração para digest oficial corrigido. Refaça o scan sem ignorar achados por padrão. Se o scanner não executar, investigue logs e disponibilidade da base de dados; não promova a imagem.

### Métricas

Os exercícios anteriores registraram aproximadamente 472 MB no dev e 60,4 MB em produção (diferença de 87,2%) e 201 pacotes reutilizados, sem novos downloads, em um build com store aquecido. Os valores são históricos e não demonstram melhora de tempo de build.

Neste handoff, o `docker image inspect` em `linux/amd64` mediu cerca de 459,5 MB no dev e 13,0 MB em produção (97,2% menor que dev). Os dois builds reaproveitaram 201 pacotes e baixaram zero pacotes pnpm quando as camadas de instalação foram executadas com o store BuildKit aquecido. Na primeira partida com volumes novos, o dev usou as dependências da imagem sem executar a instalação. Não foi feito benchmark de build frio.
