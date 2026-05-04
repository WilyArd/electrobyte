# Stage 1: Base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies + generate Prisma client
FROM base AS deps
# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY backend/package.json backend/bun.lock ./
# Copy prisma schema so postinstall & generate can use it
COPY prisma ./prisma/
RUN bun install --frozen-lockfile

# Explicitly run prisma generate to ensure client is generated with correct schema
RUN ./node_modules/.bin/prisma generate

# Stage 3: Release
FROM base AS release
RUN apk add --no-cache openssl

# Create a non-root user for security
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 elysiajs

COPY --from=deps /app/node_modules ./node_modules
COPY backend/src ./src
COPY backend/package.json ./

USER elysiajs

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
