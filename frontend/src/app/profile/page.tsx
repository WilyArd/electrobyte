import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  let profile = null;
  let orders: any[] = [];
  let paymentMethods: any[] = [];

  try {
    const [profileRes, ordersRes, pmRes] = await Promise.all([
      apiFetch("/api/user/profile"),
      apiFetch("/api/user/orders"),
      apiFetch("/api/user/payment-methods"),
    ]);

    if (profileRes.ok) {
      profile = await profileRes.json();
    }
    if (ordersRes.ok) {
      orders = await ordersRes.json();
    }
    if (pmRes.ok) {
      paymentMethods = await pmRes.json();
    }
  } catch (e) {
    console.error("Failed to fetch profile data:", e);
  }

  return <ProfileClient session={session} profile={profile} orders={orders} paymentMethods={paymentMethods} />;
}
