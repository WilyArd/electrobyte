"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/actions/interactions";

export function WishlistButton({
  productId,
  initialInWishlist,
}: {
  productId: string;
  initialInWishlist: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);

  const handleToggle = () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Optimistic update
    const previousState = inWishlist;
    setInWishlist(!previousState);

    startTransition(async () => {
      const result = await toggleWishlist(productId, previousState);
      if (!result?.success) {
        // Revert on failure
        setInWishlist(previousState);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-3 rounded-xl transition-all duration-300 border flex items-center justify-center ${
        inWishlist
          ? "bg-rose-500/10 border-rose-500 text-rose-500"
          : "bg-white/5 border-navy-200 dark:border-navy-600 text-navy-400 hover:text-rose-500 hover:border-rose-500 hover:bg-rose-500/5"
      }`}
      aria-label="Toggle Wishlist"
    >
      {isPending ? (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg 
          className="w-6 h-6 transition-transform hover:scale-110 active:scale-95" 
          fill={inWishlist ? "currentColor" : "none"} 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={inWishlist ? 0 : 2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
    </button>
  );
}
