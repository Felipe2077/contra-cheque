# contracheque-app/apps/api/Dockerfile

# ---- Base Node ----
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /usr/src/app

# ---- Dependencies ----
FROM base AS dependencies
COPY package.json ./package.json
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/api/package.json ./apps/api/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter @contracheque/api --prod --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY package.json ./package.json
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/api ./apps/api 
# Instala todas as dependências (incluindo dev) para o build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter @contracheque/api --frozen-lockfile
RUN pnpm --filter @contracheque/api build # Isso deve criar apps/api/dist

# ---- Release ----
FROM base AS release
WORKDIR /usr/src/app # WORKDIR da imagem final

# Copia as dependências de produção do estágio 'dependencies'
# O PNPM coloca os node_modules do pacote filtrado dentro da sua própria pasta
COPY --from=dependencies /usr/src/app/apps/api/node_modules ./node_modules
# Pode ser necessário copiar também os da raiz do workspace se o PNPM colocar algo lá que é necessário em runtime
COPY --from=dependencies /usr/src/app/node_modules ./node_modules_root_workspace # Cuidado com colisões se não for gerenciado

# Copia o código buildado (dist) da API do estágio 'build'
# O build está em /usr/src/app/apps/api/dist
COPY --from=build /usr/src/app/apps/api/dist ./dist

# Copia o package.json da API para a raiz da imagem final.
# Certifique-se que apps/api/package.json tem "main": "dist/server.js"
COPY apps/api/package.json ./package.json

EXPOSE 3333
CMD [ "node", "dist/server.js" ]