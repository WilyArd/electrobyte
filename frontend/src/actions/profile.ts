"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateSettings(
  _prevState: any,
  formData: FormData
) {
  const language = formData.get("language") as string;
  const region = formData.get("region") as string;

  try {
    const res = await apiFetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, region }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Failed to update settings" };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: "Failed to connect to backend" };
  }
}

export async function addPaymentMethod(
  _prevState: any,
  formData: FormData
) {
  const type = formData.get("type") as string;
  const provider = formData.get("provider") as string;
  const last4 = formData.get("last4") as string;

  try {
    const res = await apiFetch("/api/user/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, provider, last4 }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Failed to add payment method" };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: "Failed to connect to backend" };
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    const res = await apiFetch(`/api/user/payment-methods/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) return { error: "Failed to delete payment method" };
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: "Failed to connect to backend" };
  }
}

export async function setDefaultPaymentMethod(id: string) {
  try {
    const res = await apiFetch(`/api/user/payment-methods/${id}/default`, {
      method: "PATCH",
    });

    if (!res.ok) return { error: "Failed to set default payment method" };
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { error: "Failed to connect to backend" };
  }
}
