import type { Variants } from "framer-motion";

/**
 * Shared motion vocabulary for the cinematic UI.
 *
 * Everything animates transform + opacity only (GPU-composited) and is driven
 * through framer-motion variants so a single tweak here re-choreographs the
 * whole app. Reduced-motion is handled globally by `<MotionConfig
 * reducedMotion="user">` in Providers, which strips transforms and keeps a
 * gentle opacity crossfade for users who ask for less motion.
 */

/** Cinematic easing — matches the app's original cubic-bezier(0.16, 1, 0.3, 1). */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
} as const;

/**
 * Fade + rise. The `visible` state accepts an optional per-instance delay
 * (seconds) via framer's `custom` prop, so `<Reveal delayMs>` can stagger
 * without redefining the variant.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE, delay },
  }),
};

/**
 * Transform-only rise for LCP-critical text (never animates opacity from 0,
 * so the largest paint isn't withheld while it settles).
 */
export const riseIn: Variants = {
  hidden: { y: 18 },
  visible: (delay = 0) => ({
    y: 0,
    transition: { duration: DURATION.base, ease: EASE, delay },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE, delay },
  }),
};

/** Parent variant that orchestrates a staggered cascade over its children. */
export const container = (stagger = 0.08, delay = 0.05): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** whileInView config: reveal once, a touch before the element is fully in view. */
export const viewportOnce = { once: true, margin: "0px 0px -10% 0px" } as const;
