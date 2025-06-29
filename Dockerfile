# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências do sistema (incluindo curl para healthcheck)
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/cache/apk/*

# Configurar pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Stage de dependências
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Stage de build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar Prisma Client
RUN pnpm prisma generate

# Stage de produção
FROM base AS production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copiar dependências e código
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app .

# Criar diretórios necessários
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check melhorado - agora com curl como fallback
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:3001/health || node scripts/healthcheck.js

# Script de inicialização
CMD ["node", "scripts/start.js"]