import { getProductById, getRelatedProducts } from "@/actions/search";
import { getWishlist, getProductReviews } from "@/actions/interactions";
import { ReviewSection } from "@/components/products/ReviewSection";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { auth } from "@/lib/auth";
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

  const session = await auth();
  let inWishlist = false;
  if (session) {
    const wishlist = await getWishlist();
    inWishlist = wishlist.some((item) => item.product.id === product.id);
  }

  const reviews = await getProductReviews(product.id);

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
          inWishlist={inWishlist}
        />

        {/* Reviews Section (already a client component) */}
        <div className="mt-20">
          <ReviewSection productId={product.id} reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
