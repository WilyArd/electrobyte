"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { useEffect, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden noise-overlay">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/40 to-accent-50/20 dark:from-navy-800 dark:via-navy-700 dark:to-navy-900" />
      <div className="absolute inset-0 mesh-gradient opacity-70" />

      {/* Animated orbs — deeper colors */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-primary-500/15 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-[120px] animate-float animation-delay-200" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary-400/8 rounded-full blur-[80px] animate-float animation-delay-600" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,102,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/60 dark:bg-navy-700/60 backdrop-blur-md border border-primary-500/20 mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
              </span>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold leading-[1.05] mb-8 tracking-tight">
              {t("hero.headline1")}
              <br />
              <span className="gradient-text">{t("hero.headline2")}</span>
              <br />
              {t("hero.headline3")}
            </h1>

            <p className="text-lg sm:text-xl text-navy-400 dark:text-navy-200 max-w-lg mb-10 leading-relaxed">
              {t("hero.tagline")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary text-center text-lg !px-8 !py-4 group" id="hero-shop-now">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t("hero.shopNow")}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link href="/products" className="btn-secondary text-center text-lg !px-8 !py-4 hover-glow" id="hero-browse">
                {t("hero.browseCategories")}
              </Link>
            </div>

            {/* Stats — with animated counters */}
            <div className="flex items-center gap-10 mt-12 pt-8 border-t border-primary-100/20 dark:border-navy-500/30">
              <div>
                <div className="font-heading text-3xl font-bold gradient-text">
                  <AnimatedCounter target={10000} suffix="+" />
                </div>
                <div className="text-sm text-navy-400 dark:text-navy-200 mt-1">{t("hero.stat.products")}</div>
              </div>
              <div className="w-px h-10 bg-primary-200/30 dark:bg-navy-500/30" />
              <div>
                <div className="font-heading text-3xl font-bold gradient-text">
                  <AnimatedCounter target={50000} suffix="+" />
                </div>
                <div className="text-sm text-navy-400 dark:text-navy-200 mt-1">{t("hero.stat.customers")}</div>
              </div>
              <div className="w-px h-10 bg-primary-200/30 dark:bg-navy-500/30" />
              <div>
                <div className="font-heading text-3xl font-bold gradient-text">4.9</div>
                <div className="text-sm text-navy-400 dark:text-navy-200 mt-1">{t("hero.stat.rating")}</div>
              </div>
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="hidden lg:flex justify-center animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Main card with animated border */}
              <div className="animated-border w-[440px] h-[440px] rounded-3xl">
                <div className="w-full h-full rounded-3xl bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-10">
                    <div className="text-[6rem] mb-6 animate-float">⚡</div>
                    <h3 className="font-heading text-3xl font-bold mb-3">
                      <span className="gradient-text">Power Up</span>
                    </h3>
                    <p className="text-navy-400 dark:text-navy-200 text-base leading-relaxed">
                      {t("hero.card.tagline")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badges — more polished */}
              <div className="absolute -top-5 -right-5 px-5 py-3 rounded-2xl bg-white/90 dark:bg-navy-700/90 backdrop-blur-xl border border-primary-500/15 shadow-lg shadow-primary-500/10 animate-float">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🚀</span>
                  <span className="text-sm font-bold whitespace-nowrap">{t("hero.badge.fastShipping")}</span>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 px-5 py-3 rounded-2xl bg-white/90 dark:bg-navy-700/90 backdrop-blur-xl border border-accent-500/15 shadow-lg shadow-accent-500/10 animate-float animation-delay-400">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔒</span>
                  <span className="text-sm font-bold whitespace-nowrap">{t("hero.badge.securePayment")}</span>
                </div>
              </div>

              <div className="absolute top-1/2 -right-20 px-5 py-3 rounded-2xl bg-white/90 dark:bg-navy-700/90 backdrop-blur-xl border border-warning-500/15 shadow-lg shadow-warning-500/10 animate-float animation-delay-200">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⭐</span>
                  <span className="text-sm font-bold whitespace-nowrap">{t("hero.badge.topRated")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
