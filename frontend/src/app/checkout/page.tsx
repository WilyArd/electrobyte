import { auth } from "@/lib/auth";
import { getCart } from "@/actions/cart";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const cartItems = await getCart();
  if (cartItems.length === 0) redirect("/cart");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const total = subtotal + tax + shipping;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8">
          <span className="gradient-text">Checkout</span>
        </h1>

        <CheckoutForm
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          total={total}
          itemCount={itemCount}
        />
      </div>
    </div>
  );
}
