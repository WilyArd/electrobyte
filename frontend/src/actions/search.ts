"use server";

import { api } from "@/lib/api";
import type { ProductWithDetails } from "@/types";

export async function searchProducts(params: {
  query?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.set("q", params.query);
  if (params.category) queryParams.set("category", params.category);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());

  return api<{
    products: ProductWithDetails[];
    total: number;
    pages: number;
    currentPage: number;
  }>(`/api/products?${queryParams.toString()}`);
}

export async function getFeaturedProducts() {
  return api<ProductWithDetails[]>("/api/products/featured");
}

export async function getProductById(id: string) {
  try {
    return await api<ProductWithDetails>(`/api/products/${id}`);
  } catch {
    return null;
  }
}

export async function getRelatedProducts(productId: string, _category: string) {
  return api<ProductWithDetails[]>(`/api/products/${productId}/related`);
}
