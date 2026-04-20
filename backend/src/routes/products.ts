import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { authMiddleware } from "../middleware/auth";
import type { Category } from "@prisma/client";

export const productRoutes = new Elysia({ prefix: "/api/products" })
  .use(authMiddleware)

  // GET /api/products — Search/list products
  .get("/", async ({ query }) => {
    const {
      q,
      category,
      sort,
      page = "1",
      limit = "12",
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category as Category;
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    };
  }, {
    query: t.Object({
      q: t.Optional(t.String()),
      category: t.Optional(t.String()),
      sort: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  // GET /api/products/featured
  .get("/featured", async () => {
    return prisma.product.findMany({
      where: { featured: true },
      orderBy: { rating: "desc" },
      take: 8,
    });
  })

  // GET /api/products/:id
  .get("/:id", async ({ params, set }) => {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      set.status = 404;
      return { error: "Product not found" };
    }

    return product;
  })

  // GET /api/products/:id/related
  .get("/:id/related", async ({ params, set }) => {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      set.status = 404;
      return { error: "Product not found" };
    }

    return prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: params.id },
      },
      take: 4,
    });
  });
