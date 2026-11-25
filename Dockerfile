# Stage 1: Build
FROM node:22.23.5-bookworm-slim@sha256:be979e5523c76fa4d5ca4ebd3099078f220aa47ec39c48ad5b5df9314debd6eb AS builder

ENV npm_config_store_dir=/pnpm/store

WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install --global --no-audit --no-fund "$(node -p 'require("./package.json").packageManager')" \
    && install -d -o node -g node /pnpm/store \
    && chown node:node /app

USER node

RUN --mount=type=cache,id=kb-portfolio-pnpm,target=/pnpm/store,uid=1000,gid=1000,sharing=locked \
    pnpm install --frozen-lockfile --prod=false

COPY --chown=node:node env.d.ts index.html tsconfig*.json vite.config.ts vitest.config.ts playwright.config.ts ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
COPY --chown=node:node e2e ./e2e

RUN pnpm build

# Stage 2: Production
FROM ghcr.io/nginx/nginx-unprivileged:1.30.7-alpine-slim@sha256:8432c57ac86f178741af2b89948bd9087cb9df1c415bc1ab4d23735c4f0e3e61 AS production

ARG OCI_REVISION=unknown
LABEL org.opencontainers.image.title="KB. Portfolio" \
      org.opencontainers.image.description="Bilingual portfolio SPA served by Nginx" \
      org.opencontainers.image.source="https://github.com/kaicbosco/kb-portfolio" \
      org.opencontainers.image.revision="${OCI_REVISION}"

USER 101
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=0:0 /app/dist /srv/portfolio

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/index.html"]
