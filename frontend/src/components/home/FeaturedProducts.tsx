import { getFeaturedProducts } from "@/actions/search";
import { FeaturedProductsClient } from "./FeaturedProductsClient";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  return <FeaturedProductsClient products={products} />;
}
