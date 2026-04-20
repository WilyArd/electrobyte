import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { authMiddleware, requireAdmin, getDerivedSigningKey } from "../middleware/auth";
import type { Category } from "@prisma/client";
import { compare } from "bcryptjs";
import * as jose from "jose";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-electrobyte-2026";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  // Public route for admin login (used by standalone Vite app)
  .post("/login", async ({ body, set }) => {
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || user.role !== "ADMIN") {
      set.status = 401;
      return { error: "Invalid credentials or unauthorized" };
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      set.status = 401;
      return { error: "Invalid credentials" };
    }

    // Generate JWT token for Vite Admin app using the same secret
    
    // We create a JWS token that our authMiddleware can verify
    const signingKey = await getDerivedSigningKey(NEXTAUTH_SECRET);
    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(signingKey);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
  })
  
  // Protected admin routes below
  .use(authMiddleware)

  // GET /api/admin/stats — Dashboard statistics
  .get("/stats", async ({ user, set }) => {
    try {
      requireAdmin(user);
    } catch (e: unknown) {
      const err = e as Error;
      set.status = err.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }

    const [totalProducts, totalOrders, totalUsers, revenueResult] =
      await Promise.all([
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

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: revenueResult._sum.total || 0,
      recentOrders,
    };
  })

  // GET /api/admin/products — All products with order count
  .get("/products", async ({ user, set }) => {
    try {
      requireAdmin(user);
    } catch (e: unknown) {
      const err = e as Error;
      set.status = err.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }

    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });
  })

  // POST /api/admin/products — Create product
  .post("/products", async ({ user, body, set }) => {
    try {
      requireAdmin(user);
    } catch (e: unknown) {
      const err = e as Error;
      set.status = err.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        image: body.image,
        category: body.category as Category,
        stock: body.stock,
        featured: body.featured || false,
      },
    });

    return { success: true, product };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      description: t.String({ minLength: 10 }),
      price: t.Number({ minimum: 0 }),
      image: t.String(),
      category: t.String(),
      stock: t.Number({ minimum: 0 }),
      featured: t.Optional(t.Boolean()),
    }),
  })

  // PUT /api/admin/products/:id — Update product
  .put("/products/:id", async ({ user, params, body, set }) => {
    try {
      requireAdmin(user);
    } catch (e: unknown) {
      const err = e as Error;
      set.status = err.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        image: body.image,
        category: body.category as Category,
        stock: body.stock,
        featured: body.featured || false,
      },
    });

    return { success: true, product };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      description: t.String({ minLength: 10 }),
      price: t.Number({ minimum: 0 }),
      image: t.String(),
      category: t.String(),
      stock: t.Number({ minimum: 0 }),
      featured: t.Optional(t.Boolean()),
    }),
  })

  // DELETE /api/admin/products/:id — Delete product
  .delete("/products/:id", async ({ user, params, set }) => {
    try {
      requireAdmin(user);
    } catch (e: unknown) {
      const err = e as Error;
      set.status = err.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }

    // Use transaction to delete related records first
    try {
      await prisma.$transaction(async (tx) => {
        // Delete cart items referencing this product
        await tx.cartItem.deleteMany({ where: { productId: params.id } });
        // Delete order items referencing this product
        await tx.orderItem.deleteMany({ where: { productId: params.id } });
        // Delete the product itself
        await tx.product.delete({ where: { id: params.id } });
      });
    } catch (e: any) {
      set.status = 400;
      return { error: "Failed to delete product: " + (e.message || "Unknown error") };
    }

    return { success: true };
  });
