import { searchProducts } from "@/actions/search";
import { formatPrice, getCategoryLabel } from "@/lib/utils";

import Link from "next/link";
import { AddToCartButton } from "@/components/products/AddToCartButton";

const categories: string[] = [
  "LAPTOPS", "DESKTOPS", "PERIPHERALS", "COMPONENTS", "NETWORKING", "STORAGE", "ACCESSORIES",
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name A-Z" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { query, category, sort, page } = params;

  const result = await searchProducts({
    query: query || undefined,
    category: category || undefined,
    sort: sort || undefined,
    page: page ? parseInt(page) : 1,
    limit: 12,
  });

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            {category
              ? getCategoryLabel(category)
              : query
                ? `Results for "${query}"`
                : "All Products"}
          </h1>
          <p className="text-navy-400 dark:text-navy-200">
            {result.total} product{result.total !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Filters Bar */}
        <div className="glass-card p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form className="flex-1" action="/products" method="GET">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Search products..."
                  className="input-field !pl-12"
                  id="product-search"
                />
                {category && <input type="hidden" name="category" value={category} />}
                {sort && <input type="hidden" name="sort" value={sort} />}
              </div>
            </form>

            {/* Sort */}
            <form className="flex gap-2" action="/products" method="GET">
              {query && <input type="hidden" name="query" value={query} />}
              {category && <input type="hidden" name="category" value={category} />}
              <select
                name="sort"
                defaultValue={sort || "newest"}
                className="input-field !w-auto min-w-[180px]"
                id="product-sort"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button type="submit" className="btn-secondary !py-2 !px-4 text-sm">Sort</button>
            </form>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href={`/products?${query ? `query=${query}&` : ""}${sort ? `sort=${sort}` : ""}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !category
                  ? "gradient-bg text-white shadow-glow-sm"
                  : "bg-primary-50 dark:bg-navy-600 text-navy-600 dark:text-navy-200 hover:bg-primary-100 dark:hover:bg-navy-500"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${cat}${query ? `&query=${query}` : ""}${sort ? `&sort=${sort}` : ""}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === cat
                    ? "gradient-bg text-white shadow-glow-sm"
                    : "bg-primary-50 dark:bg-navy-600 text-navy-600 dark:text-navy-200 hover:bg-primary-100 dark:hover:bg-navy-500"
                }`}
              >
                {getCategoryLabel(cat)}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {result.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {result.products.map((product) => (
              <div key={product.id} className="glass-card group overflow-hidden">
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-white/90 dark:bg-navy-800/90 backdrop-blur-sm text-xs">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="badge-warning text-xs">Low Stock</span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="badge-danger text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-heading font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-warning-500" : "text-navy-200 dark:text-navy-500"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-navy-400 dark:text-navy-300">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-lg gradient-text">
                      {formatPrice(product.price)}
                    </span>
                    {product.stock > 0 && <AddToCartButton productId={product.id} compact />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading text-xl font-bold mb-2">No products found</h3>
            <p className="text-navy-400 dark:text-navy-200 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Link href="/products" className="btn-primary">
              Clear Filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {result.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: result.pages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === result.currentPage;
              return (
                <Link
                  key={pageNum}
                  href={`/products?${query ? `query=${query}&` : ""}${category ? `category=${category}&` : ""}${sort ? `sort=${sort}&` : ""}page=${pageNum}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                    isActive
                      ? "gradient-bg text-white shadow-glow-sm"
                      : "glass-card hover:border-primary-500/30"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
