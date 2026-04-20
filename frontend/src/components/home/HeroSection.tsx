import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/30 to-accent-50/20 dark:from-navy-800 dark:via-navy-700 dark:to-navy-800" />
      <div className="absolute inset-0 mesh-gradient opacity-60" />

      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary-500/5 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,102,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 dark:bg-primary-500/10 border border-primary-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                New Arrivals — Spring 2026
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              Next-Gen
              <br />
              <span className="gradient-text">Electronics,</span>
              <br />
              Delivered.
            </h1>

            <p className="text-lg sm:text-xl text-navy-400 dark:text-navy-200 max-w-lg mb-8 leading-relaxed">
              From blazing-fast gaming rigs to enterprise networking,
              discover premium IT hardware at prices that make sense.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="btn-primary text-center text-lg !px-8 !py-4"
                id="hero-shop-now"
              >
                <span className="flex items-center justify-center gap-2">
                  Shop Now
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/products"
                className="btn-secondary text-center text-lg !px-8 !py-4"
                id="hero-browse"
              >
                Browse Categories
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-primary-100/20 dark:border-navy-500/30">
              <Stat value="10K+" label="Products" />
              <Stat value="50K+" label="Customers" />
              <Stat value="4.9" label="Rating" />
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="hidden lg:flex justify-center animate-fade-in animation-delay-200">
            <div className="relative">
              {/* Main card */}
              <div className="w-[420px] h-[420px] rounded-3xl gradient-bg p-[1px]">
                <div className="w-full h-full rounded-3xl bg-white/90 dark:bg-navy-800/90 backdrop-blur-xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">⚡</div>
                    <h3 className="font-heading text-2xl font-bold mb-2">
                      <span className="gradient-text">Power Up</span>
                    </h3>
                    <p className="text-navy-400 dark:text-navy-200 text-sm">
                      Cutting-edge tech for every need
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl glass-card shadow-glow animate-float">
                <div className="flex items-center gap-2">
                  <span className="text-accent-500 text-lg">🚀</span>
                  <span className="text-sm font-semibold whitespace-nowrap">Fast Shipping</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-2xl glass-card shadow-glow-accent animate-float animation-delay-400">
                <div className="flex items-center gap-2">
                  <span className="text-primary-500 text-lg">🔒</span>
                  <span className="text-sm font-semibold whitespace-nowrap">Secure Payment</span>
                </div>
              </div>

              <div className="absolute top-1/2 -right-16 px-4 py-2 rounded-2xl glass-card animate-float animation-delay-200">
                <div className="flex items-center gap-2">
                  <span className="text-warning-500 text-lg">⭐</span>
                  <span className="text-sm font-semibold whitespace-nowrap">Top Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-heading text-2xl font-bold gradient-text">{value}</div>
      <div className="text-sm text-navy-400 dark:text-navy-200">{label}</div>
    </div>
  );
}
