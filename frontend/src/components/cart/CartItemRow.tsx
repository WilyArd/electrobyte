"use client";

import { removeFromCart, updateCartQuantity } from "@/actions/cart";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type CartItemType = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category: string;
  };
};

export function CartItemRow({ item }: { item: CartItemType }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdateQuantity = (newQty: number) => {
    startTransition(async () => {
      await updateCartQuantity(item.id, newQty);
      router.refresh();
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCart(item.id);
      router.refresh();
    });
  };

  return (
    <div className={`glass-card p-4 sm:p-6 flex gap-4 sm:gap-6 ${isPending ? "opacity-50" : ""} transition-opacity`}>
      {/* Image */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-sm sm:text-base mb-1 line-clamp-2">
          {item.product.name}
        </h3>
        <p className="text-xs text-navy-400 dark:text-navy-300 mb-3">
          {item.product.category}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isPending}
              className="w-8 h-8 rounded-lg border border-primary-100/20 dark:border-navy-500/30 flex items-center justify-center hover:bg-primary-50 dark:hover:bg-navy-600 transition-all text-sm"
            >
              −
            </button>
            <span className="w-10 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isPending || item.quantity >= item.product.stock}
              className="w-8 h-8 rounded-lg border border-primary-100/20 dark:border-navy-500/30 flex items-center justify-center hover:bg-primary-50 dark:hover:bg-navy-600 transition-all text-sm disabled:opacity-50"
            >
              +
            </button>
          </div>

          {/* Price & Remove */}
          <div className="flex items-center gap-4">
            <span className="font-heading font-bold gradient-text">
              {formatPrice(item.product.price * item.quantity)}
            </span>
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="p-2 rounded-lg text-danger-500 hover:bg-danger-500/10 transition-all"
              aria-label="Remove item"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
