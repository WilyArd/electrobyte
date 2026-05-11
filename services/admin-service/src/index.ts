import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { prisma } from "./db";
import { authMiddleware, requireAdmin, getDerivedSigningKey } from "./middleware/auth";
import { compare } from "bcryptjs";
import * as jose from "jose";

const port = process.env.PORT || 4005;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-electrobyte-2026";

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .onError(({ code, error, set }) => {
    if (error.message === "UNAUTHORIZED") { set.status = 401; return { error: "Authentication required" }; }
    if (error.message === "FORBIDDEN") { set.status = 403; return { error: "Access denied" }; }
    console.error(`[${code}]`, error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/api/health", () => ({ status: "ok", service: "admin-service", timestamp: new Date().toISOString() }))

  // POST /api/admin/login — Admin login (standalone Vite admin app)
  .post("/api/admin/login", async ({ body, set }) => {
    const { email, password } = body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || user.role !== "ADMIN") {
      set.status = 401;
      return { error: "Invalid credentials or unauthorized" };
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) { set.status = 401; return { error: "Invalid credentials" }; }

    const signingKey = await getDerivedSigningKey(NEXTAUTH_SECRET);
    const token = await new jose.SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(signingKey);

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
  })

  .use(authMiddleware)

  // GET /api/admin/stats — Dashboard statistics
  .get("/api/admin/stats", async ({ user, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const [totalProducts, totalOrders, totalUsers, revenueResult] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
    return { totalProducts, totalOrders, totalUsers, totalRevenue: revenueResult._sum.total || 0, recentOrders };
  })

  // GET /api/admin/users
  .get("/api/admin/users", async ({ user, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
    });
  })

  // PATCH /api/admin/users/:id/role
  .patch("/api/admin/users/:id/role", async ({ user, params, body, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: body.role },
    });
    return { success: true, user: { id: updated.id, email: updated.email, role: updated.role } };
  }, {
    body: t.Object({ role: t.Enum({ USER: "USER", ADMIN: "ADMIN" }) }),
  })

  .listen(port);

console.log(`⚙️  Admin Service running at ${app.server?.hostname}:${app.server?.port}`);
