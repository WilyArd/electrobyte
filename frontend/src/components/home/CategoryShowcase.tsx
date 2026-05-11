"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { getCategoryLabel, getCategoryIcon } from "@/lib/utils";

const categories: string[] = [
  "LAPTOPS",
  "DESKTOPS",
  "PERIPHERALS",
  "COMPONENTS",
  "NETWORKING",
  "STORAGE",
  "ACCESSORIES",
];

const categoryColors = [
  "from-blue-500/10 to-blue-600/5",
  "from-violet-500/10 to-violet-600/5",
  "from-rose-500/10 to-rose-600/5",
  "from-amber-500/10 to-amber-600/5",
  "from-cyan-500/10 to-cyan-600/5",
  "from-emerald-500/10 to-emerald-600/5",
  "from-fuchsia-500/10 to-fuchsia-600/5",
];

export function CategoryShowcase() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-transparent to-transparent dark:from-navy-900/50 dark:via-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="badge-primary mb-4 inline-block">🏷️ Categories</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t("category.title")} <span className="gradient-text">{t("category.titleHighlight")}</span>
          </h2>
          <p className="text-navy-400 dark:text-navy-200 text-lg max-w-2xl mx-auto">
            {t("category.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 stagger-children">
          {categories.map((category, index) => (
            <Link
              key={category}
              href={`/products?category=${category}`}
              className={`card-spotlight glass-card p-7 text-center group bg-gradient-to-br ${categoryColors[index]}`}
            >
              <div className="text-5xl mb-4 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-500 ease-out">
                {getCategoryIcon(category)}
              </div>
              <h3 className="font-heading font-bold text-sm group-hover:text-primary-500 transition-colors duration-300">
                {getCategoryLabel(category)}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
