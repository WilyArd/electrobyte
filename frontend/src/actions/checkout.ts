"use server";

import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function processCheckout(
  _prevState: { error?: string; orderId?: string } | undefined,
  formData: FormData
) {
  const rawData = {
    shippingName: formData.get("shippingName") as string,
    shippingEmail: formData.get("shippingEmail") as string,
    shippingAddress: formData.get("shippingAddress") as string,
    shippingCity: formData.get("shippingCity") as string,
    shippingZip: formData.get("shippingZip") as string,
    couponCode: formData.get("couponCode") as string | undefined,
  };

  try {
    const data = await api<{ success: boolean; orderId: string }>("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(rawData),
    });

    revalidatePath("/cart");
    revalidatePath("/products");
    
    // Redirect must happen outside try/catch or it will be caught
    return { success: true, orderId: data.orderId };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Checkout failed" };
  }
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const data = await api<{
      valid: boolean;
      couponId: string;
      code: string;
      discountType: string;
      value: number;
      discount: number;
    }>("/api/orders/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
    return data;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid coupon" };
  }
}
