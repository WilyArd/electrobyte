"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { getCategoryLabel, getStockStatus } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { WishlistButton } from "@/components/products/WishlistButton";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  category: string;
  description: string;
  stock: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  inWishlist,
}: {
  product: Product;
  relatedProducts: RelatedProduct[];
  inWishlist: boolean;
}) {
  const { formatCurrency } = useTranslation();
  const stockStatus = getStockStatus(product.stock);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-10 text-navy-400 dark:text-navy-300">
        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <svg className="w-3.5 h-3.5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <Link href="/products" className="hover:text-primary-500 transition-colors">Products</Link>
        <svg className="w-3.5 h-3.5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <Link href={`/products?category=${product.category}`} className="hover:text-primary-500 transition-colors">
          {getCategoryLabel(product.category)}
        </Link>
        <svg className="w-3.5 h-3.5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-navy-800 dark:text-white truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-24">
        {/* Image */}
        <div className="glass-card overflow-hidden rounded-3xl card-spotlight group hover:transform-none">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center lg:sticky lg:top-28 lg:self-start">
          <span className="badge-primary mb-5 self-start">
            {getCategoryLabel(product.category)}
          </span>

          <div className="flex justify-between items-start mb-5">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight pr-4">
              {product.name}
            </h1>
            <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-7">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "text-warning-500"
                      : "text-navy-200 dark:text-navy-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-navy-400 dark:text-navy-300 font-medium">
              {product.rating} rating
            </span>
          </div>

          <p className="text-navy-400 dark:text-navy-200 leading-relaxed text-lg mb-10">
            {product.description}
          </p>

          {/* Price & Stock */}
          <div className="flex items-center gap-6 mb-10 p-5 rounded-2xl bg-primary-50/50 dark:bg-navy-700/50">
            <span className="font-heading text-4xl lg:text-5xl font-bold gradient-text">
              {formatCurrency(product.price)}
            </span>
            <div>
              <span className={`font-semibold ${stockStatus.color}`}>
                {stockStatus.label}
              </span>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="text-sm ml-1 text-navy-400">({product.stock} left)</span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          {product.stock > 0 && (
            <div className="max-w-sm">
              <AddToCartButton productId={product.id} />
            </div>
          )}

          {/* Features */}
          <div className="mt-10 pt-8 border-t border-primary-100/10 dark:border-navy-500/30">
            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: "🚚", text: "Free Shipping" },
                { icon: "🔄", text: "30-Day Returns" },
                { icon: "🛡️", text: "2-Year Warranty" },
                { icon: "💬", text: "24/7 Support" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/30 dark:bg-navy-700/30">
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-sm font-medium text-navy-600 dark:text-navy-200">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl lg:text-3xl font-bold mb-10">
            Related <span className="gradient-text">Products</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/products/${rp.id}`}
                className="card-spotlight glass-card group overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={rp.image}
                    alt={rp.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors duration-300">
                    {rp.name}
                  </h3>
                  <span className="font-heading font-bold gradient-text text-lg">
                    {formatCurrency(rp.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
