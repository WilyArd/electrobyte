import Link from "next/link";
import { Category } from "@prisma/client";
import { getCategoryLabel, getCategoryIcon } from "@/lib/utils";

const categories: Category[] = [
  "LAPTOPS",
  "DESKTOPS",
  "PERIPHERALS",
  "COMPONENTS",
  "NETWORKING",
  "STORAGE",
  "ACCESSORIES",
];

export function CategoryShowcase() {
  return (
    <section className="py-16 lg:py-24 relative bg-primary-50/50 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Shop by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-navy-400 dark:text-navy-200 text-lg">
            Find exactly what you need across our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category}
              href={`/products?category=${category}`}
              className="glass-card p-6 text-center group hover:shadow-glow transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {getCategoryIcon(category)}
              </div>
              <h3 className="font-heading font-semibold text-sm group-hover:text-primary-500 transition-colors">
                {getCategoryLabel(category)}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
