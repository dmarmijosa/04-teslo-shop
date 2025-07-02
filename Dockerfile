# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm install --production

# ---- Build ----
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# ---- Release ----
FROM base AS release
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ./public ./public
# Puerto que expone la aplicación (definido en src/main.ts)
EXPOSE 3000

# Comando para iniciar la aplicación en modo producción
CMD ["node", "dist/main"]