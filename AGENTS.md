# ElectroByte — AGENTS.md

## Architecture

Two coexisting backends:
- **`backend/`** — Elysia monolith (port 4000, Bun). Original API used by the admin panel.
- **`services/`** — Microservice split: auth (4001), product (4002), cart (4003), order (4004), admin-api (4005). All Elysia+Bun. The frontend `apiFetch()` routes to these by URL path prefix (`/api/auth` → auth-service, `/api/products` → product-service, etc.).

`prisma/` at root is the **shared schema** used by both monolith and all services. Each runs its own Prisma client against the same DB.

`services/shared/minio.ts` is imported cross-service as `../../shared/minio`.

## Dev commands

| Target | Dir | Command |
|---|---|---|
| Backend (monolith) | `backend/` | `bun run dev` |
| Each microservice | `services/*/` | `bun run dev` |
| Frontend | `frontend/` | `npm run dev` |
| Admin panel | `admin/` | `bun run dev` |
| Prisma generate | any backend dir | `bunx prisma generate` |
| DB push | any backend dir | `bunx prisma db push` |
| Seed | project root | `bun run prisma/seed.ts` |
| All services (Docker) | project root | `docker-compose up -d --build` |
| All services (local) | project root | `./start-dev.sh` (also starts MinIO container) |

No tests exist everywhere placeholder.

## Auth flow

- **Shared JWT secret**: `NEXTAUTH_SECRET` must be identical across frontend `.env` and backend `.env`.
- Key derivation uses HKDF with info strings `"NextAuth.js Generated Signing Key"` / `"NextAuth.js Generated Encryption Key"` — must match between NextAuth frontend and all Elysia backends.
- Frontend (NextAuth v5 beta) supports Credentials + Google OAuth. JWT callback generates a backend token signed with the derived key.
- Auth middleware in every Elysia service validates both JWE (NextAuth v5 encrypted tokens) and JWS.
- Admin panel uses a separate direct JWT login: `POST /api/admin/login` on the monolith backend (`backend/`).

## MinIO

S3-compatible object storage for avatars, product images, and review photos. Required for image upload endpoints. In Docker, starts as a named service. For local dev, `start-dev.sh` handles it, or run manually:

```
docker run -d --name electrobyte-minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=electrobyte -e MINIO_ROOT_PASSWORD=electrobyte_secret \
  minio/minio server /data --console-address ":9001"
```

## Service health

Every Elysia service exposes `GET /api/health` returning `{ status: "ok", service: "<name>", timestamp: "..." }`.

## Notes

- `prisma/` schemas (not per-service) — all backend targets share one.
- `backend/` monolith is being migrated to `services/` microservices. Frontend uses services, admin panel uses monolith.
- Seed creates admin (`admin@electrobyte.com` / `admin123`) and demo user (`user@electrobyte.com` / `user123`).
- `next.config.ts` uses `output: "standalone"` with monorepo-aware `outputFileTracingRoot`.
- Frontend uses `@/` path alias (Next.js default).
