"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { getCategoryLabel } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  category: string;
}

export function FeaturedProductsClient({ products }: { products: Product[] }) {
  const { t, formatCurrency } = useTranslation();

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] bg-primary-500/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 lg:mb-16">
          <span className="badge-primary mb-4 inline-block">{t("featured.badge")}</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t("featured.title")} <span className="gradient-text">{t("featured.titleHighlight")}</span> {t("featured.titleSuffix")}
          </h2>
          <p className="text-navy-400 dark:text-navy-200 text-lg max-w-2xl mx-auto">
            {t("featured.subtitle")}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
          {products.map((product) => (
            <div
              key={product.id}
              className="card-spotlight glass-card group overflow-hidden"
            >
              {/* Image */}
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-white/90 dark:bg-navy-800/90 backdrop-blur-md text-navy-600 dark:text-navy-200 text-xs border border-white/20">
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs border-0">
                      {t("featured.label")}
                    </span>
                  </div>

                  {/* Quick view hint */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-navy-800/90 backdrop-blur-md text-xs font-semibold shadow-lg">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-5">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-heading font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors duration-300">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3.5 h-3.5 ${
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
                  <span className="text-xs text-navy-400 dark:text-navy-300 font-medium">
                    {product.rating}
                  </span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-primary-100/10 dark:border-navy-500/20">
                  <span className="font-heading font-bold text-lg gradient-text">
                    {formatCurrency(product.price)}
                  </span>
                  <AddToCartButton productId={product.id} compact />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-14">
          <Link
            href="/products"
            className="btn-secondary inline-flex items-center gap-2 group hover-glow"
            id="view-all-products"
          >
            {t("featured.viewAll")}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
