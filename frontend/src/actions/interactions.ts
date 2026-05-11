"use server";

import { api, apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export async function getWishlist() {
  try {
    return await api<any[]>("/api/products/wishlist", { cache: "no-store" });
  } catch (error) {
    console.error("Failed to get wishlist:", error);
    return [];
  }
}

export async function toggleWishlist(productId: string, isCurrentlyInWishlist: boolean) {
  try {
    if (isCurrentlyInWishlist) {
      await apiFetch(`/api/products/wishlist/${productId}`, { method: "DELETE" });
    } else {
      await apiFetch("/api/products/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
    }
    revalidatePath("/products/[id]", "page");
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string) {
  try {
    return await api<any[]>(`/api/products/${productId}/reviews`, { cache: "no-store" });
  } catch (error) {
    console.error("Failed to get reviews:", error);
    return [];
  }
}

export async function submitReview(productId: string, rating: number, comment: string) {
  try {
    const res = await apiFetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Failed to submit review" };
    }
    
    revalidatePath("/products/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateReview(productId: string, reviewId: string, rating: number, comment: string) {
  try {
    const res = await apiFetch(`/api/products/${productId}/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify({ rating, comment }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Failed to update review" };
    }
    
    revalidatePath("/products/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
