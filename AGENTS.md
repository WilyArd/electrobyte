# ElectroByte — AGENTS.md

## Architecture

Monorepo with three surface apps and two API backends:

| App | Dir | Stack | Port |
|---|---|---|---|
| Storefront | `frontend/` | Next.js 15 (App Router) | 3000 |
| Admin Panel | `admin/` | React + Vite | 5000 |
| Monolith API | `backend/` | Elysia + Bun | 4000 |
| Auth Service | `services/auth-service/` | Elysia + Bun | 4001 |
| Product Service | `services/product-service/` | Elysia + Bun | 4002 |
| Cart Service | `services/cart-service/` | Elysia + Bun | 4003 |
| Order Service | `services/order-service/` | Elysia + Bun | 4004 |
| Admin Service | `services/admin-service/` | Elysia + Bun | 4005 |

- **Frontend** calls microservices directly via `apiFetch()` which routes by URL prefix (`/api/auth` → auth-service, `/api/products` → product-service, etc.).
- **Admin panel** uses the monolith backend (`backend/`, port 4000).
- `nginx/nginx.conf` proxies `/api/auth/` to frontend (NextAuth), all other `/api/*` to respective services.

## Prisma 7

`prisma/` at root is the **shared schema** — all targets use the same `schema.prisma`. Prisma 7 specifics:
- Connection config lives in `prisma/prisma.config.ts`, not in `schema.prisma` (no `url` in datasource block).
- Every target instantiates its own `PrismaClient` with `@prisma/adapter-pg` runtime pool (`db.ts` files).
- Commands (`generate`, `db push`, etc.) work from any backend directory.

## Service wiring & entrypoints

- Each service `src/index.ts` is the entrypoint (Elysia `.listen(port)`).
- `bun run --watch src/index.ts` for hot reload (set in every service's `package.json` as `dev` script).
- `start-dev.sh` launches all services in parallel via background processes, sharing `backend/.env` to all.
- Env vars `PRODUCT_SERVICE_URL`, `CART_SERVICE_URL`, `AUTH_SERVICE_URL`, `ORDER_SERVICE_URL` wired per `docker-compose.yml` for inter-service calls.
- Cart depends on Product; Order depends on Cart + Product; Admin depends on Auth + Product + Order.
- Auth middleware (`src/middleware/auth.ts`) is **duplicated per service** — not shared. Edits must be applied to each copy.

## Shared code

`services/shared/minio.ts` is the only shared cross-service code, imported as `../../shared/minio` from any `services/*/src/` file. Handles bucket init, upload, delete, and URL generation.

In Docker, all microservices build from `services/Dockerfile` (shared multi-stage build with `SERVICE_DIR` arg + Prisma generate).

## Auth flow

- `NEXTAUTH_SECRET` env var must match across `frontend/.env` and `backend/.env`.
- Key derivation: HKDF with info strings `"NextAuth.js Generated Signing Key"` / `"NextAuth.js Generated Encryption Key"`.
- Frontend uses NextAuth v5 beta (Credentials + Google OAuth). JWT callback in NextAuth generates a backend token signed with derived key.
- Every Elysia service validates JWE (NextAuth v5 encrypted tokens) first, then falls back to JWS.
- Admin panel uses **separate** direct JWT login: `POST /api/admin/login` on the monolith backend.

## MinIO

S3-compatible storage for avatars, product images, review photos. Buckets: `electrobyte-products`, `electrobyte-avatars`, `electrobyte-reviews`. Credentials: `electrobyte` / `electrobyte_secret`, console at port 9001.

## Dev commands

| Target | Dir | Command |
|---|---|---|
| Monolith backend | `backend/` | `bun run dev` |
| Any microservice | `services/*/` | `bun run dev` |
| Frontend | `frontend/` | `npm run dev` |
| Admin panel | `admin/` | `bun run dev` |
| Prisma generate | from any backend dir | `bunx prisma generate` |
| Prisma db push | from any backend dir | `bunx prisma db push` |
| Seed | project root | `bun run prisma/seed.ts` |
| All services (Docker) | project root | `docker-compose up -d --build` |
| All services (local) | project root | `./start-dev.sh` (starts MinIO container + all services) |

## Tests

No tests exist (placeholder only).

## Seed credentials

- Admin: `admin@electrobyte.com` / `admin123`
- User: `user@electrobyte.com` / `user123`

## Health checks

Every Elysia service: `GET /api/health` → `{ status: "ok", service: "<name>", timestamp: "..." }`

## Key conventions

- `cuid()` for all primary keys.
- Elysia `onError` handler standardizes 401 (UNAUTHORIZED) / 403 (FORBIDDEN) / 500 responses across all services.
- MinIO upload endpoints enforce type + size validation (JPEG/PNG/WebP, 2MB for avatars, 5MB for products/reviews).
- Admin product CRUD uses `requireAdmin()` guard.
- Cart item unique constraint on `[userId, productId]`.
- All files are `.ts` (no `.js`), Bun runtime everywhere.
- `frontend/` uses TailwindCSS v3, `admin/` uses TailwindCSS v4.
