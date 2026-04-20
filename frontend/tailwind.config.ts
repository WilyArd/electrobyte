import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E6F0FF",
          100: "#CCE0FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0066FF",
          600: "#0052CC",
          700: "#003D99",
          800: "#002966",
          900: "#001433",
        },
        accent: {
          50: "#E6FFF0",
          100: "#B3FFD6",
          200: "#80FFBD",
          300: "#4DFFA3",
          400: "#1AFF8A",
          500: "#00E676",
          600: "#00B85E",
          700: "#008A47",
          800: "#005C2F",
          900: "#002E18",
        },
        navy: {
          50: "#E8ECF2",
          100: "#C5CDD9",
          200: "#8B9BB3",
          300: "#51698D",
          400: "#2D4163",
          500: "#1A2942",
          600: "#111D33",
          700: "#0D1628",
          800: "#0A1628",
          900: "#060D18",
          950: "#030810",
        },
        danger: {
          400: "#FF6B7A",
          500: "#FF4757",
          600: "#E63E4D",
        },
        warning: {
          400: "#FFC733",
          500: "#FFB800",
          600: "#CC9300",
        },
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient": "gradient 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 102, 255, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0A1628 0%, #111D33 50%, #0D1628 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(0, 102, 255, 0.15)",
        "glow": "0 0 30px rgba(0, 102, 255, 0.2)",
        "glow-lg": "0 0 60px rgba(0, 102, 255, 0.3)",
        "glow-accent": "0 0 30px rgba(0, 230, 118, 0.2)",
        "card": "0 4px 30px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 40px rgba(0, 102, 255, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
