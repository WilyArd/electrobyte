"use client";

import { processCheckout, validateCoupon } from "@/actions/checkout";
import { formatPrice } from "@/lib/utils";
import { useActionState, useState } from "react";

type CheckoutFormProps = {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
};

export default function CheckoutForm({
  subtotal,
  tax,
  shipping,
  total: initialTotal,
  itemCount,
}: CheckoutFormProps) {
  const [state, formAction, isPending] = useActionState(processCheckout, undefined);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponError("");

    const result = await validateCoupon(couponCode, subtotal);
    
    if (result && "error" in result && result.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
    } else if (result && "discount" in result) {
      setAppliedCoupon({ code: result.code, discount: result.discount });
      setCouponCode("");
    }
    
    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const currentTotal = appliedCoupon 
    ? Math.max(0, initialTotal - appliedCoupon.discount)
    : initialTotal;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Shipping Form */}
      <div className="lg:col-span-2">
        <div className="glass-card p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold mb-6">Shipping Information</h2>

          {state?.error && (
            <div className="mb-6 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4" id="checkout-form">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingName" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="shippingName"
                  name="shippingName"
                  type="text"
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="shippingEmail" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="shippingEmail"
                  name="shippingEmail"
                  type="email"
                  required
                  className="input-field"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shippingAddress" className="block text-sm font-medium mb-2">
                Street Address
              </label>
              <input
                id="shippingAddress"
                name="shippingAddress"
                type="text"
                required
                className="input-field"
                placeholder="123 Tech Avenue"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingCity" className="block text-sm font-medium mb-2">
                  City
                </label>
                <input
                  id="shippingCity"
                  name="shippingCity"
                  type="text"
                  required
                  className="input-field"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label htmlFor="shippingZip" className="block text-sm font-medium mb-2">
                  ZIP Code
                </label>
                <input
                  id="shippingZip"
                  name="shippingZip"
                  type="text"
                  required
                  className="input-field"
                  placeholder="94102"
                />
              </div>
            </div>

            {/* Simulated Payment */}
            <div className="mt-8 pt-6 border-t border-primary-100/10 dark:border-navy-500/30">
              <h3 className="font-heading text-lg font-bold mb-4">Payment Method</h3>
              <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Simulated Payment</p>
                    <p className="text-xs text-navy-400 dark:text-navy-300">
                      This is a demo — no real payment is processed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full !py-4 text-lg flex items-center justify-center gap-2 mt-6"
              id="place-order-button"
            >
              {isPending ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing Order...
                </>
              ) : (
                <>
                  🔒 Place Order — {formatPrice(currentTotal)}
                </>
              )}
            </button>
            {appliedCoupon && (
              <input type="hidden" name="couponCode" value={appliedCoupon.code} />
            )}
          </form>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div>
        <div className="glass-card p-6 sticky top-28">
          <h2 className="font-heading text-lg font-bold mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-navy-400 dark:text-navy-200">Subtotal ({itemCount} items)</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400 dark:text-navy-200">Tax (8%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400 dark:text-navy-200">Shipping</span>
              <span className="font-medium text-accent-500">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-500">
                <span>Discount ({appliedCoupon.code})</span>
                <span className="font-medium">-{formatPrice(appliedCoupon.discount)}</span>
              </div>
            )}
          </div>

          {/* Coupon Code Input */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Have a coupon code?</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-500">{appliedCoupon.code} Applied</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-navy-400 hover:text-danger-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="input-field py-2"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode}
                    className="btn-secondary whitespace-nowrap px-4 py-2"
                  >
                    {isValidatingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-danger-500 mt-2">{couponError}</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-primary-100/10 dark:border-navy-500/30 pt-4">
            <div className="flex justify-between">
              <span className="font-heading font-bold text-lg">Total</span>
              <span className="font-heading font-bold text-lg gradient-text">
                {formatPrice(currentTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
