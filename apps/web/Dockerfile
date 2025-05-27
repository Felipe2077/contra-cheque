# monorepo-root/apps/web/Dockerfile

# Estágio 1: Base com PNPM
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
WORKDIR /app

# Estágio 2: Construir o Web App
FROM base AS builder

# Copiar arquivos de manifesto do pnpm e turbo.json
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Copiar package.json da raiz e do app específico
COPY package.json ./
COPY apps/web/package.json ./apps/web/

# Copiar o código fonte do Web App e quaisquer packages/libs que ele dependa
# Ex: COPY packages/ui ./packages/ui
COPY apps/web ./apps/web

# Instalar dependências filtrando para 'web' e suas dependências de workspace
RUN pnpm install --filter web...

# Construir o app web (que executa 'next build')
# Certifique-se que 'output: "standalone"' está em apps/web/next.config.ts
RUN pnpm --filter web run build

# Estágio 3: Imagem de produção para Next.js com output standalone
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV production

# Copiar o output standalone do Next.js
COPY --from=builder /app/apps/web/.next/standalone ./
# Copiar a pasta public e a pasta .next/static (para assets)
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Expor a porta que o Next.js usará (padrão 3000)
# Definida via variável de ambiente no docker-compose
EXPOSE ${PORT:-3001}

# Comando para iniciar o servidor Next.js no modo standalone
# O server.js está na raiz do output standalone
CMD ["node", "apps/web/server.js"]