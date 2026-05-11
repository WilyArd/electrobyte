import { getCart } from "@/actions/cart";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CartPageClient } from "@/components/cart/CartPageClient";

export default async function CartPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const cartItems = await getCart();

  return <CartPageClient cartItems={cartItems} />;
}
