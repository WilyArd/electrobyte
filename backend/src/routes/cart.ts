import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { authMiddleware, requireAuth } from "../middleware/auth";

export const cartRoutes = new Elysia({ prefix: "/api/cart" })
  .use(authMiddleware)

  // GET /api/cart — Get user's cart
  .get("/", async ({ user, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    return prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // GET /api/cart/count
  .get("/count", async ({ user }) => {
    if (!user) return { count: 0 };

    const result = await prisma.cartItem.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    });

    return { count: result._sum.quantity || 0 };
  })

  // POST /api/cart — Add to cart
  .post("/", async ({ user, body, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Please sign in to add items to cart" };
    }

    const { productId, quantity = 1 } = body;

    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      set.status = 404;
      return { error: "Product not found" };
    }

    if (product.stock < quantity) {
      set.status = 400;
      return { error: "Insufficient stock" };
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        set.status = 400;
        return { error: "Cannot add more than available stock" };
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
      });
    }

    return { success: true };
  }, {
    body: t.Object({
      productId: t.String(),
      quantity: t.Optional(t.Number()),
    }),
  })

  // PATCH /api/cart/:id — Update quantity
  .patch("/:id", async ({ user, params, body, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    const { quantity } = body;

    if (quantity < 1) {
      // Remove item if quantity < 1
      await prisma.cartItem.delete({
        where: { id: params.id, userId: user.id },
      });
      return { success: true };
    }

    // Check stock
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id, userId: user.id },
      include: { product: true },
    });

    if (!cartItem) {
      set.status = 404;
      return { error: "Cart item not found" };
    }

    if (quantity > cartItem.product.stock) {
      set.status = 400;
      return { error: "Quantity exceeds available stock" };
    }

    await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
    });

    return { success: true };
  }, {
    body: t.Object({
      quantity: t.Number(),
    }),
  })

  // DELETE /api/cart/:id — Remove item
  .delete("/:id", async ({ user, params, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    await prisma.cartItem.delete({
      where: { id: params.id, userId: user.id },
    });

    return { success: true };
  })

  // DELETE /api/cart — Clear cart
  .delete("/", async ({ user, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Not authenticated" };
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return { success: true };
  });
