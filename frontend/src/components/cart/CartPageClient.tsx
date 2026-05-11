"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { CartItemRow } from "@/components/cart/CartItemRow";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    category: string;
  };
}

export function CartPageClient({ cartItems }: { cartItems: CartItem[] }) {
  const { t, formatCurrency } = useTranslation();

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const total = subtotal + tax + shipping;
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[25rem] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            {t("cart.title")} <span className="gradient-text">{t("cart.titleHighlight")}</span>
          </h1>
          {cartItems.length > 0 && (
            <p className="text-navy-400 dark:text-navy-200">{totalQty} {t("cart.items")}</p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-28 h-28 rounded-full bg-primary-500/5 dark:bg-navy-700/50 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🛒</span>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-3">{t("cart.empty")}</h3>
            <p className="text-navy-400 dark:text-navy-200 mb-8 max-w-md mx-auto">{t("cart.emptySubtitle")}</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2 group">
              {t("cart.browse")}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 stagger-children">
              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary — sticky with better design */}
            <div className="lg:col-span-1">
              <div className="glass-card card-spotlight p-7 sticky top-28 hover:transform-none">
                <h2 className="font-heading text-lg font-bold mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t("cart.orderSummary")}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400 dark:text-navy-200">
                      {t("cart.subtotal")} ({totalQty} {t("cart.items")})
                    </span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400 dark:text-navy-200">{t("cart.tax")}</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400 dark:text-navy-200">{t("cart.shipping")}</span>
                    <span className={`font-semibold ${subtotal >= 99 ? "text-accent-500" : ""}`}>
                      {subtotal >= 99 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {t("cart.shippingFree")}
                        </span>
                      ) : (
                        formatCurrency(9.99)
                      )}
                    </span>
                  </div>
                </div>

                <div className="section-divider mb-4" />

                <div className="flex justify-between items-center mb-7">
                  <span className="font-heading font-bold text-lg">{t("cart.total")}</span>
                  <span className="font-heading font-bold text-2xl gradient-text">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full text-center block !py-4 text-lg group"
                  id="checkout-button"
                >
                  <span className="flex items-center justify-center gap-2">
                    {t("cart.checkout")}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/products"
                  className="block text-center text-sm text-primary-500 hover:underline mt-5 font-medium"
                >
                  ← {t("cart.continueShopping")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
