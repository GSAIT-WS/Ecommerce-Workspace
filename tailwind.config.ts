import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        surface: {
          subtle: "hsl(var(--surface-subtle))",
          muted: "hsl(var(--surface-muted))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 4px 20px -6px hsl(var(--foreground) / 0.07), 0 0 0 1px hsl(var(--border) / 0.55)",
        "card-hover":
          "0 14px 36px -10px hsl(var(--primary) / 0.18), 0 0 0 1px hsl(var(--primary) / 0.14)",
        lift: "0 6px 20px -8px hsl(var(--foreground) / 0.12), 0 2px 8px -4px hsl(var(--foreground) / 0.06)",
        /** Deeper elevation for hero cards & featured tiles */
        "card-elevated":
          "0 22px 48px -20px hsl(var(--foreground) / 0.16), 0 0 0 1px hsl(var(--border) / 0.5)",
        "card-elevated-hover":
          "0 30px 64px -24px hsl(var(--primary) / 0.28), 0 0 0 1px hsl(var(--primary) / 0.18)",
        /** Warm gold halo — used sparingly on badges & price chips */
        glow: "0 8px 24px -8px hsl(var(--primary) / 0.45)",
        "glow-sm": "0 4px 12px -4px hsl(var(--primary) / 0.35)",
        /** Crisp top inner highlight that makes light surfaces feel glossy */
        "inner-top":
          "inset 0 1px 0 0 hsl(var(--sheen) / 0.6), 0 1px 2px hsl(var(--foreground) / 0.04)",
        "focus-ring": "0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--primary) / 0.35)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
        /** Shared rhythm for Radix overlays (dialog, sheet, popover, select).
            Also used as the animation duration by tailwindcss-animate. */
        overlay: "220ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.15)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        /** Very slow badge pulse — Offers & Combos discount pill */
        "offer-badge-pulse": {
          "0%, 100%": {
            boxShadow:
              "inset 0 2px 4px rgba(255,255,255,0.42), inset 0 -3px 6px rgba(0,0,0,0.14), 0 0 0 0 hsl(36 78% 46% / 0.2)",
          },
          "50%": {
            boxShadow:
              "inset 0 2px 5px rgba(255,255,255,0.48), inset 0 -3px 5px rgba(0,0,0,0.12), 0 0 0 10px hsl(36 78% 46% / 0.06)",
          },
        },
        /** Soft scale-in for badges/chips appearing on hover or state change */
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.86)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        /** Sheen sweep across a surface on hover */
        "sheen-sweep": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        /** Slow rotating conic halo (accent rings, badges) */
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        /** Underline grows from the centre for headings */
        "underline-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        /** Cart badge pop when an item is added */
        "badge-pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.18)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        /** Soft vertical drift for decorative blobs */
        "drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        /** Horizontal marquee for testimonial / logo strips */
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        /** Fade + rise used by scroll-reveal wrappers */
        "reveal-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "gradient-pan": "gradient-pan 7s ease infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.6s ease-out forwards",
        float: "float 3.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "offer-badge-pulse": "offer-badge-pulse 5.5s ease-in-out infinite",
        "pop-in": "pop-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "sheen-sweep": "sheen-sweep 1.1s ease-in-out forwards",
        "spin-slow": "spin-slow 14s linear infinite",
        "underline-grow": "underline-grow 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "badge-pop": "badge-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
        drift: "drift 7s ease-in-out infinite",
        /** Seamless loop for the customer-reviews strip.
            42s ≈ 70px/s on the current 8-card width — slow enough to read. */
        marquee: "marquee 42s linear infinite",
        "reveal-up": "reveal-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
