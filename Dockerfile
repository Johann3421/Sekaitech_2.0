# ─────────────────────────────────────────────────────────────
# Stage 1 – Base image
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# ─────────────────────────────────────────────────────────────
# Stage 2 – Install ALL dependencies (including devDeps for build)
# ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install deps; postinstall runs "prisma generate" automatically
RUN npm ci --legacy-peer-deps

# ─────────────────────────────────────────────────────────────
# Stage 3 – Build Next.js application
# ─────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time args and env
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
# Skip real DB calls during Next.js static generation
ENV SKIP_DB_DURING_BUILD=1

# ── Build-time public env vars (baked into the bundle) ────────
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_STORE_NAME=Hyper-Logic
ARG NEXT_PUBLIC_DEFAULT_CURRENCY=PEN
ARG NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STORE_NAME=$NEXT_PUBLIC_STORE_NAME
ENV NEXT_PUBLIC_DEFAULT_CURRENCY=$NEXT_PUBLIC_DEFAULT_CURRENCY
ENV NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=$NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# Compile seed.ts → seed.js so the runner can execute it without ts-node
RUN node -e "\
  const ts = require('./node_modules/typescript');\
  const fs = require('fs');\
  const src = fs.readFileSync('./prisma/seed.ts', 'utf8');\
  const result = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2017 } });\
  fs.writeFileSync('./prisma/seed.js', result.outputText);\
"

# ─────────────────────────────────────────────────────────────
# Stage 4 – Production runner (minimal image)
# ─────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# ── Static assets ─────────────────────────────────────────────
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ── Prisma schema (needed by migrate deploy) ──────────────────
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# ── Prisma client binary (runtime query engine) ───────────────
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma         ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma         ./node_modules/@prisma

# ── Prisma CLI (for "migrate deploy" at container startup) ────
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma          ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs         ./node_modules/bcryptjs

# ── Entrypoint ────────────────────────────────────────────────
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
