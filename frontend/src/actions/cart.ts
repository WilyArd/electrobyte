"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";
import type { CartItemWithProduct } from "@/types";

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });

    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to add to cart" };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await api(`/api/cart/${cartItemId}`, {
      method: "DELETE",
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to remove from cart" };
  }
}

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
) {
  try {
    await api(`/api/cart/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update quantity" };
  }
}

export async function getCart() {
  try {
    return await api<CartItemWithProduct[]>("/api/cart");
  } catch {
    return [];
  }
}

export async function getCartCount() {
  try {
    const { count } = await api<{ count: number }>("/api/cart/count");
    return count;
  } catch {
    return 0;
  }
}

export async function clearCart() {
  try {
    await api("/api/cart", {
      method: "DELETE",
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to clear cart" };
  }
}
