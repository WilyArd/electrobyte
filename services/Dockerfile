# ============================================
# Shared Dockerfile for all Elysia/Bun services
# Build context: electrobyte/ root directory
# ============================================
# Struktur di dalam container:
#   /app/
#     shared/       ← services/shared/ (minio.ts, dll)
#     service/
#       src/        ← services/<name>/src/
#       prisma/     ← schema.prisma (diletakkan di sini agar Prisma auto-detect node_modules dengan benar)
#       node_modules/
#
# Import '../../shared/minio' dari /app/service/src/ → /app/shared/ ✅
# ============================================

FROM oven/bun:1.2-alpine AS base
RUN apk add --no-cache openssl

# ── deps stage: install dependencies ─────────
FROM base AS deps
ARG SERVICE_DIR
WORKDIR /app/service

COPY ${SERVICE_DIR}/package.json ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile

# ── builder stage ────────────────────────────
FROM base AS builder
ARG SERVICE_DIR
WORKDIR /app/service

COPY --from=deps /app/service/node_modules ./node_modules
COPY ${SERVICE_DIR}/src ./src
# Copy shared helpers ke /app/shared sehingga ../../shared/minio resolve benar
COPY services/shared ../shared
# Copy prisma ke dalam /app/service agar auto-detect node_modules/@prisma/client bekerja
COPY prisma ./prisma/

RUN bunx prisma generate

# ── runner stage: minimal production image ────
FROM base AS runner
ARG SERVICE_DIR
WORKDIR /app/service

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 --ingroup bunjs bunuser

COPY --from=builder --chown=bunuser:bunjs /app/service/node_modules ./node_modules
COPY --from=builder --chown=bunuser:bunjs /app/service/src ./src
COPY --from=builder --chown=bunuser:bunjs /app/shared ../shared
COPY --from=builder --chown=bunuser:bunjs /app/service/prisma ./prisma

USER bunuser

CMD ["bun", "run", "src/index.ts"]
