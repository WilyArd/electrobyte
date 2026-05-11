import { searchProducts } from "@/actions/search";
import { ProductsGridClient } from "@/components/products/ProductsGridClient";

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
    <ProductsGridClient
      products={result.products}
      total={result.total}
      pages={result.pages}
      currentPage={result.currentPage}
      query={query}
      category={category}
      sort={sort}
    />
  );
}
