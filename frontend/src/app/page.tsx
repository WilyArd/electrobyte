import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { HomeStaticSections } from "@/components/home/HomeStaticSections";

export default function HomePage() {
  return (
    <div className="pt-16 lg:pt-20">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <HomeStaticSections />
    </div>
  );
}
