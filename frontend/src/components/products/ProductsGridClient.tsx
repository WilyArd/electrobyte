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
  stock: number;
}

interface ProductsGridClientProps {
  products: Product[];
  total: number;
  pages: number;
  currentPage: number;
  query?: string;
  category?: string;
  sort?: string;
}

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

export function ProductsGridClient({
  products,
  total,
  pages,
  currentPage,
  query,
  category,
  sort,
}: ProductsGridClientProps) {
  const { t, formatCurrency } = useTranslation();

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[40rem] h-[20rem] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            {category ? (
              <>{getCategoryLabel(category)}</>
            ) : query ? (
              <>Results for &ldquo;<span className="gradient-text">{query}</span>&rdquo;</>
            ) : (
              <>All <span className="gradient-text">Products</span></>
            )}
          </h1>
          <p className="text-navy-400 dark:text-navy-200 text-lg">
            {total} product{total !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Filters Bar */}
        <div className="glass-card card-spotlight p-5 mb-10 hover:transform-none">
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
              <button type="submit" className="btn-secondary !py-2 !px-5 text-sm">Sort</button>
            </form>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            <Link
              href={`/products?${query ? `query=${query}&` : ""}${sort ? `sort=${sort}` : ""}`}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
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
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
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
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {products.map((product) => (
              <div key={product.id} className="card-spotlight glass-card group overflow-hidden">
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-3 left-3">
                      <span className="badge bg-white/90 dark:bg-navy-800/90 backdrop-blur-md text-navy-600 dark:text-navy-200 text-xs border border-white/20">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="badge-warning text-xs">Low Stock</span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="badge-danger text-sm">Out of Stock</span>
                      </div>
                    )}

                    {/* Quick view hint */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-navy-800/90 backdrop-blur-md text-xs font-semibold shadow-lg">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-heading font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors duration-300">
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
                    <span className="text-xs text-navy-400 dark:text-navy-300 font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary-100/10 dark:border-navy-500/20">
                    <span className="font-heading font-bold text-lg gradient-text">
                      {formatCurrency(product.price)}
                    </span>
                    {product.stock > 0 && <AddToCartButton productId={product.id} compact />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-28 h-28 rounded-full bg-primary-500/5 dark:bg-navy-700/50 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-3">No products found</h3>
            <p className="text-navy-400 dark:text-navy-200 mb-8 max-w-md mx-auto">
              Try adjusting your search or filter criteria
            </p>
            <Link href="/products" className="btn-primary">
              Clear Filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-14">
            {Array.from({ length: pages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <Link
                  key={pageNum}
                  href={`/products?${query ? `query=${query}&` : ""}${category ? `category=${category}&` : ""}${sort ? `sort=${sort}&` : ""}page=${pageNum}`}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
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
