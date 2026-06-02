import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { prisma } from "./db";
import { authMiddleware } from "./middleware/auth";
import { hash, compare } from "bcryptjs";
import { getDerivedSigningKey } from "./middleware/auth";
import * as jose from "jose";
import { initMinioBuckets, uploadFile, generateObjectName, BUCKETS } from "../../shared/minio";

const port = process.env.PORT || 4001;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-electrobyte-2026";

// Initialize MinIO buckets on startup
initMinioBuckets();

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
    })
  )
  .onError(({ code, error, set }) => {
    if (error.message === "UNAUTHORIZED") { set.status = 401; return { error: "Authentication required" }; }
    if (error.message === "FORBIDDEN") { set.status = 403; return { error: "Access denied" }; }
    console.error(`[${code}]`, error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/api/health", () => ({
    status: "ok",
    service: "auth-service",
    timestamp: new Date().toISOString(),
  }))

  // POST /api/auth/register
  .post("/api/auth/register", async ({ body, set }) => {
    const { name, email, password } = body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      set.status = 409;
      return { error: "An account with this email already exists" };
    }
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });
    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  })

  // POST /api/auth/verify — Used by NextAuth credentials provider
  .post("/api/auth/verify", async ({ body, set }) => {
    const { email, password } = body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      set.status = 401;
      return { error: "Invalid credentials" };
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      set.status = 401;
      return { error: "Invalid credentials" };
    }
    return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
  })

  // POST /api/auth/oauth-user — Create/get OAuth user
  .post("/api/auth/oauth-user", async ({ body }) => {
    const { email, name, image } = body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, image, role: "USER" },
      });
    }
    return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      name: t.Optional(t.Nullable(t.String())),
      image: t.Optional(t.Nullable(t.String())),
    }),
  })

  // GET /api/auth/user/:email — Get user by email
  .get("/api/auth/user/:email", async ({ params, set }) => {
    const user = await prisma.user.findUnique({ where: { email: params.email } });
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
  })

  // GET /api/auth/user-by-id/:id — Get user by ID (used by other services)
  .get("/api/auth/user-by-id/:id", async ({ params, set }) => {
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
  })

  // GET /api/auth/profile — Get current user profile
  .use(authMiddleware)
  .get("/api/auth/profile", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) { set.status = 404; return { error: "User not found" }; }
    return { id: dbUser.id, email: dbUser.email, name: dbUser.name, image: dbUser.image, role: dbUser.role, createdAt: dbUser.createdAt, language: dbUser.language, region: dbUser.region, currency: dbUser.currency };
  })

  // PATCH /api/auth/profile — Update profile
  .patch("/api/auth/profile", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: body.name, image: body.image, language: body.language, region: body.region, currency: body.currency },
    });
    return { id: updated.id, email: updated.email, name: updated.name, image: updated.image, language: updated.language, region: updated.region, currency: updated.currency };
  }, {
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      image: t.Optional(t.String()),
      language: t.Optional(t.String()),
      region: t.Optional(t.String()),
      currency: t.Optional(t.String()),
    }),
  })

  // Alias routes: /api/user/* → same as /api/auth/*
  .get("/api/user/profile", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) { set.status = 404; return { error: "User not found" }; }
    return { id: dbUser.id, email: dbUser.email, name: dbUser.name, image: dbUser.image, role: dbUser.role, createdAt: dbUser.createdAt, language: dbUser.language, region: dbUser.region, currency: dbUser.currency };
  })

  .patch("/api/user/profile", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: body.name, image: body.image, language: body.language, region: body.region, currency: body.currency },
    });
    return { id: updated.id, email: updated.email, name: updated.name, image: updated.image, language: updated.language, region: updated.region, currency: updated.currency };
  }, {
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      image: t.Optional(t.String()),
      language: t.Optional(t.String()),
      region: t.Optional(t.String()),
      currency: t.Optional(t.String()),
    }),
  })

  // POST /api/user/avatar — Upload profile picture to MinIO
  .post("/api/user/avatar", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }

    const file = (body as any).avatar as File;
    if (!file) { set.status = 400; return { error: "No image file provided" }; }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      set.status = 400;
      return { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" };
    }
    if (file.size > 2 * 1024 * 1024) {
      set.status = 400;
      return { error: "File too large. Maximum size: 2MB" };
    }

    const objectName = generateObjectName(`users/${user.id}`, file.name);
    const buffer = await file.arrayBuffer();
    const url = await uploadFile(BUCKETS.avatars, objectName, new Uint8Array(buffer), file.type);

    // Update user's image field in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { image: url },
    });

    return { url };
  })

  // GET /api/user/payment-methods — Get user's payment methods
  .get("/api/user/payment-methods", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return methods;
  })

  // POST /api/user/payment-methods — Add a payment method
  .post("/api/user/payment-methods", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    
    // Check if user already has a default payment method
    const existing = await prisma.paymentMethod.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    const isDefault = !existing; // Make it default if it's the first one

    const newMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: body.type,
        provider: body.provider,
        last4: body.last4,
        isDefault,
      },
    });
    return newMethod;
  }, {
    body: t.Object({
      type: t.String(),
      provider: t.Optional(t.Nullable(t.String())),
      last4: t.Optional(t.Nullable(t.String())),
    })
  })

  // DELETE /api/user/payment-methods/:id — Remove a payment method
  .delete("/api/user/payment-methods/:id", async ({ user, params, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const method = await prisma.paymentMethod.findUnique({ where: { id: params.id } });
    
    if (!method || method.userId !== user.id) {
      set.status = 404;
      return { error: "Payment method not found" };
    }

    await prisma.paymentMethod.delete({ where: { id: params.id } });
    
    // If it was default, make the newest remaining one default
    if (method.isDefault) {
      const remaining = await prisma.paymentMethod.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.paymentMethod.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }
    return { success: true };
  })

  // PATCH /api/user/payment-methods/:id/default — Set as default
  .patch("/api/user/payment-methods/:id/default", async ({ user, params, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    
    const method = await prisma.paymentMethod.findUnique({ where: { id: params.id } });
    if (!method || method.userId !== user.id) {
      set.status = 404;
      return { error: "Payment method not found" };
    }

    // Unset current default
    await prisma.paymentMethod.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    const updated = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: { isDefault: true },
    });

    return updated;
  })

  .listen(port);

console.log(`🔐 Auth Service running at ${app.server?.hostname}:${app.server?.port}`);
