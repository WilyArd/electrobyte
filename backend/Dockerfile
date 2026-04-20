# Stage 1: Base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 3: Release
FROM base AS release
# Create a non-root user for security
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 elysiajs

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# Assuming Prisma client might be needed in the future, 
# you can copy prisma generated files here later.

USER elysiajs

ENV NODE_ENV=production
ENV PORT=4000
# By default Elysia listens to 3000, but we can override it by reading process.env.PORT in index.ts
EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
