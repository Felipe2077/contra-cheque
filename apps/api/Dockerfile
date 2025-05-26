# monorepo-root/apps/api/Dockerfile

# Estágio 1: Base com PNPM
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
WORKDIR /app

# Estágio 2: Instalar dependências e construir a API
FROM base AS builder
# Copiar arquivos de manifesto do pnpm e turbo.json
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Copiar package.json da raiz e do app específico
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Copiar o código fonte da API e quaisquer packages/libs que ela dependa diretamente
# Se a API depende de, por exemplo, packages/config, copie-os também:
# COPY packages/config ./packages/config
COPY apps/api ./apps/api

# Instalar dependências para a API e suas dependências de workspace
# O '...' no final do filtro é importante para incluir dependências do workspace.
RUN pnpm install --filter @contracheque/api...

# Construir apenas a API usando o script 'build' dela
RUN pnpm --filter @contracheque/api run build
# O build da API (@contracheque/api) gera a pasta 'dist' em apps/api/dist

# Estágio 3: Imagem de produção
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Copiar o package.json da API construída para instalar SOMENTE dependências de produção
COPY --from=builder /app/apps/api/package.json ./package.json
# Copiar o código construído (pasta dist)
COPY --from=builder /app/apps/api/dist ./dist

# Instalar apenas as dependências de produção
RUN pnpm install --prod

# Expor a porta que sua API usa (definida via variável de ambiente no docker-compose)
# A porta padrão da API Fastify é geralmente 3000 ou 3334.
# Vamos assumir 3334 como padrão se PORT não for fornecido.
EXPOSE ${PORT:-3334}

CMD ["node", "dist/server.js"]