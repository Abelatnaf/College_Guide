import type { Config } from "tailwindcss";

/**
 * Every color reads from a CSS variable declared in globals.css (RGB channel
 * triplets), so the palette flips for dark mode via the `.dark` class while
 * Tailwind opacity modifiers (bg-primary/70, …) keep working.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const TOKEN_NAMES = [
  "surface",
  "surface-dim",
  "surface-bright",
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
  "surface-variant",
  "surface-tint",
  "background",
  "on-background",
  "on-surface",
  "on-surface-variant",
  "inverse-surface",
  "inverse-on-surface",
  "inverse-primary",
  "primary",
  "on-primary",
  "primary-container",
  "on-primary-container",
  "primary-fixed",
  "primary-fixed-dim",
  "on-primary-fixed",
  "on-primary-fixed-variant",
  "secondary",
  "on-secondary",
  "secondary-container",
  "on-secondary-container",
  "secondary-fixed",
  "secondary-fixed-dim",
  "on-secondary-fixed",
  "on-secondary-fixed-variant",
  "tertiary",
  "on-tertiary",
  "tertiary-container",
  "on-tertiary-container",
  "tertiary-fixed",
  "tertiary-fixed-dim",
  "on-tertiary-fixed",
  "on-tertiary-fixed-variant",
  "error",
  "on-error",
  "error-container",
  "on-error-container",
  "outline",
  "outline-variant",
  "glow",
] as const;

const colors = Object.fromEntries(TOKEN_NAMES.map((name) => [name, token(name)]));

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors,
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      // Custom spacing scale used throughout the Stitch designs (p-md, gap-lg, etc.)
      spacing: {
        lg: "48px",
        xl: "80px",
        "container-max": "1200px",
        base: "8px",
        sm: "12px",
        xs: "4px",
        gutter: "24px",
        md: "24px",
      },
      maxWidth: {
        "container-max": "1200px",
      },
      boxShadow: {
        // Signature cinematic emerald glow
        glow: "0 0 40px rgb(var(--glow) / 0.22)",
        "glow-sm": "0 0 20px rgb(var(--glow) / 0.18)",
        "glow-lg": "0 0 70px rgb(var(--glow) / 0.28)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-inter)", "Inter", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        "label-md": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-sm": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-md": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-lg-mobile": ["var(--font-inter)", "Inter", "sans-serif"],
        "body-md": ["var(--font-inter)", "Inter", "sans-serif"],
        "body-lg": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-xl-mobile": ["var(--font-inter)", "Inter", "sans-serif"],
        caption: ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-xl": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-lg": ["var(--font-inter)", "Inter", "sans-serif"],
      },
      // Role-based type scale from the Stitch design system
      fontSize: {
        "label-md": ["14px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-sm": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-xl-mobile": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-xl": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease forwards",
        "slide-in": "slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
