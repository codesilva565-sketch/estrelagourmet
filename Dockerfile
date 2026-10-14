# syntax=docker/dockerfile:1

# ---- build ----
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Preset Node (o padrao do Lovable e Cloudflare; aqui forcamos servidor Node).
ENV DEPLOY_TARGET=vps

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variaveis VITE_* sao injetadas em tempo de build (viram parte do bundle do cliente).
ARG VITE_DEMO_MODE=false
ARG VITE_ADMIN_PASSWORD=estrela123
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE
ENV VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# ---- run ----
FROM node:24-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
