"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";
import type { ProductWithDetails, OrderWithItems } from "@/types";

export async function createProduct(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    image: formData.get("image") as string,
    category: formData.get("category") as string,
    stock: Number(formData.get("stock")),
    featured: formData.get("featured") === "true",
  };

  try {
    await api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(rawData),
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    image: formData.get("image") as string,
    category: formData.get("category") as string,
    stock: Number(formData.get("stock")),
    featured: formData.get("featured") === "true",
  };

  try {
    await api(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(rawData),
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await api(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete product" };
  }
}

export async function getAdminStats() {
  try {
    return await api<{
      totalProducts: number;
      totalOrders: number;
      totalUsers: number;
      totalRevenue: number;
      recentOrders: (OrderWithItems & {
        user: { name: string | null; email: string };
      })[];
    }>("/api/admin/stats");
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      recentOrders: [],
    };
  }
}

export async function getAdminProducts() {
  try {
    return await api<(ProductWithDetails & { _count: { orderItems: number } })[]>(
      "/api/admin/products"
    );
  } catch (error) {
    console.error("Failed to fetch admin products", error);
    return [];
  }
}
