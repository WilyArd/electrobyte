import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { authMiddleware, requireAuth } from "../middleware/auth";

export const userRoutes = new Elysia({ prefix: "/api/user" })
  .use(authMiddleware)

  // GET /api/user/profile — Get user profile
  .get("/profile", async ({ user, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, cartItems: true },
        },
      },
    });

    if (!dbUser) {
      set.status = 404;
      return { error: "User not found" };
    }

    return dbUser;
  })

  // GET /api/user/orders — Get user orders
  .get("/orders", async ({ user, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    return prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true, category: true },
            },
          },
        },
      },
    });
  })

  // PUT /api/user/profile — Update user profile
  .put("/profile", async ({ user, body, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return { success: true, user: updated };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
    }),
  });
