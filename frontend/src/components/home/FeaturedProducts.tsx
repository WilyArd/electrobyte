import Link from "next/link";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { getFeaturedProducts } from "@/actions/search";
import { AddToCartButton } from "@/components/products/AddToCartButton";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="badge-primary mb-4 inline-block">⚡ Featured</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Top <span className="gradient-text">Picks</span> for You
          </h2>
          <p className="text-navy-400 dark:text-navy-200 text-lg max-w-2xl mx-auto">
            Hand-selected premium electronics loved by our community
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="glass-card group overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-white/90 dark:bg-navy-800/90 backdrop-blur-sm text-navy-600 dark:text-navy-200 text-xs">
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-accent-500/90 text-white text-xs">
                      Featured
                    </span>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-heading font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
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
                  <span className="text-xs text-navy-400 dark:text-navy-300">
                    {product.rating}
                  </span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-lg gradient-text">
                    {formatPrice(product.price)}
                  </span>
                  <AddToCartButton productId={product.id} compact />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="btn-secondary inline-flex items-center gap-2"
            id="view-all-products"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
