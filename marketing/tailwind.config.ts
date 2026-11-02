import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // All colors are driven by CSS variables (see globals.css) so both
        // dark and light themes work and rebranding is a one-file change.
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-2": "hsl(var(--surface-2) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        text: "hsl(var(--text) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        accent: "hsl(var(--accent-glow) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 6px)",
        sm: "calc(var(--radius) - 10px)",
        pill: "999px",
      },
      maxWidth: {
        container: "1280px",
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--primary) / 0.35), 0 10px 40px -8px hsl(var(--primary) / 0.5)",
        "glow-lg": "0 0 60px -10px hsl(var(--primary) / 0.65)",
        card: "0 8px 30px -12px rgb(0 0 0 / 0.5)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent-glow)) 100%)",
        "hero-glow":
          "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "60%": { opacity: "1", transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "pop-in": "pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
