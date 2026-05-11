"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";

export function HomeStaticSections() {
  const { t } = useTranslation();

  const trustBadges = [
    { icon: "🚚", titleKey: "trust.shipping.title" as const, descKey: "trust.shipping.desc" as const, gradient: "from-blue-500/10 to-blue-600/5" },
    { icon: "🔒", titleKey: "trust.payment.title" as const, descKey: "trust.payment.desc" as const, gradient: "from-emerald-500/10 to-emerald-600/5" },
    { icon: "↩️", titleKey: "trust.returns.title" as const, descKey: "trust.returns.desc" as const, gradient: "from-violet-500/10 to-violet-600/5" },
    { icon: "🎧", titleKey: "trust.support.title" as const, descKey: "trust.support.desc" as const, gradient: "from-amber-500/10 to-amber-600/5" },
  ];

  return (
    <>
      {/* Promo Banner */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden noise-overlay">
            <div className="absolute inset-0 gradient-bg" />
            <div className="absolute inset-0 mesh-gradient opacity-40" />
            {/* Decorative orbs */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 px-8 py-20 lg:px-16 lg:py-24 text-center">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {t("promo.title")}
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                {t("promo.subtitle")}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-primary-600 font-bold text-lg hover:bg-white/95 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                id="promo-cta"
              >
                {t("promo.cta")}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className={`glass-card card-spotlight p-6 flex items-center gap-5 bg-gradient-to-br ${badge.gradient} hover-glow`}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/80 dark:bg-navy-700/80 flex items-center justify-center text-3xl shadow-sm">
                  {badge.icon}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base">{t(badge.titleKey)}</h3>
                  <p className="text-sm text-navy-400 dark:text-navy-200 mt-0.5">{t(badge.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
