"use server";

import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function register(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Registration failed" };
    }

    // Auto sign-in after registration
    try {
      await signIn("credentials", {
        email: rawData.email,
        password: rawData.password,
        redirect: false,
      });
    } catch {
      // Sign-in error is non-critical here
    }

    // Redirect outside try/catch
  } catch (error) {
    return { error: "Could not connect to backend" };
  }

  redirect("/");
}

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
  } catch {
    return { error: "Invalid email or password" };
  }

  redirect("/");
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}
