# ============================================
# ElectroByte — Multi-Stage Production Dockerfile
# ============================================

# Stage 1: Install dependencies
FROM node:24.15.0-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
COPY prisma ./prisma/

RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm install

# Stage 2: Build the application
FROM node:24.15.0-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /build/frontend

COPY --from=deps /app/node_modules ./node_modules
COPY frontend .
COPY prisma /build/prisma/

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate --schema=/build/prisma/schema.prisma
RUN npm run build

# Stage 3: Production runner
FROM node:24.15.0-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /build/frontend/public ./frontend/public
COPY --from=builder /build/prisma ./prisma

# Set correct permissions for prerender cache
RUN mkdir -p frontend/.next
RUN chown nextjs:nodejs frontend/.next

# Copy standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /build/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /build/frontend/.next/static ./frontend/.next/static

# Copy node_modules for prisma client
COPY --from=builder --chown=nextjs:nodejs /build/frontend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /build/frontend/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "frontend/server.js"]
