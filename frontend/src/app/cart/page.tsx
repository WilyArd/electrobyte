import { getCart } from "@/actions/cart";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CartItemRow } from "@/components/cart/CartItemRow";

export default async function CartPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const cartItems = await getCart();
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8">
          Shopping <span className="gradient-text">Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="font-heading text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-navy-400 dark:text-navy-200 mb-6">
              Discover amazing electronics and add them to your cart
            </p>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-28">
                <h2 className="font-heading text-lg font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400 dark:text-navy-200">
                      Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400 dark:text-navy-200">Estimated Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400 dark:text-navy-200">Shipping</span>
                    <span className="font-medium text-accent-500">
                      {subtotal >= 99 ? "Free" : formatPrice(9.99)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-primary-100/10 dark:border-navy-500/30 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-heading font-bold text-lg">Total</span>
                    <span className="font-heading font-bold text-lg gradient-text">
                      {formatPrice(total + (subtotal < 99 ? 9.99 : 0))}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full text-center block !py-3.5"
                  id="checkout-button"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="block text-center text-sm text-primary-500 hover:underline mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
