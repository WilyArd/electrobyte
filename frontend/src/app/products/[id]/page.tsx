import { getProductById, getRelatedProducts } from "@/actions/search";
import { formatPrice, getCategoryLabel, getStockStatus } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { Category } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category);
  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-navy-400 dark:text-navy-300">
          <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-500 transition-colors">Products</Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-primary-500 transition-colors"
          >
            {getCategoryLabel(product.category)}
          </Link>
          <span>/</span>
          <span className="text-navy-800 dark:text-white truncate">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image */}
          <div className="glass-card overflow-hidden rounded-3xl">
            <div className="aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <span className="badge-primary mb-4 self-start">
              {getCategoryLabel(product.category)}
            </span>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
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
              <span className="text-sm text-navy-400 dark:text-navy-300">
                {product.rating} rating
              </span>
            </div>

            <p className="text-navy-400 dark:text-navy-200 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Price & Stock */}
            <div className="flex items-center gap-6 mb-8">
              <span className="font-heading text-4xl font-bold gradient-text">
                {formatPrice(product.price)}
              </span>
              <span className={`font-medium ${stockStatus.color}`}>
                {stockStatus.label}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-sm ml-1">({product.stock} left)</span>
                )}
              </span>
            </div>

            {/* Add to Cart */}
            {product.stock > 0 && (
              <div className="max-w-sm">
                <AddToCartButton productId={product.id} />
              </div>
            )}

            {/* Features */}
            <div className="mt-10 pt-8 border-t border-primary-100/10 dark:border-navy-500/30">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🚚", text: "Free Shipping" },
                  { icon: "🔄", text: "30-Day Returns" },
                  { icon: "🛡️", text: "2-Year Warranty" },
                  { icon: "💬", text: "24/7 Support" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-navy-400 dark:text-navy-200">
                    <span className="text-lg">{feature.icon}</span>
                    {feature.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold mb-8">
              Related <span className="gradient-text">Products</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.id}`}
                  className="glass-card group overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
                      {rp.name}
                    </h3>
                    <span className="font-heading font-bold gradient-text">
                      {formatPrice(rp.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
