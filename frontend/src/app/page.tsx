import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pt-16 lg:pt-20">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />

      {/* Promo Banner */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-bg opacity-90" />
            <div className="absolute inset-0 mesh-gradient opacity-30" />

            <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Free Shipping on Orders Over $99
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
                Plus, enjoy hassle-free returns within 30 days and 24/7 expert technical support.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-600 font-bold text-lg hover:bg-white/90 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                id="promo-cta"
              >
                Start Shopping
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-t border-primary-100/10 dark:border-navy-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🚚", title: "Free Shipping", desc: "On orders over $99" },
              { icon: "🔒", title: "Secure Payment", desc: "256-bit SSL encrypted" },
              { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
              { icon: "🎧", title: "24/7 Support", desc: "Expert tech assistance" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500/10 dark:bg-primary-500/5 flex items-center justify-center text-2xl">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{badge.title}</h3>
                  <p className="text-sm text-navy-400 dark:text-navy-200">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
