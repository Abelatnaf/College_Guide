"use client";

import { useRef, type ReactNode } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Shifts children vertically as the viewport scrolls past their container —
 * a lightweight scroll-linked depth layer for hero/section imagery.
 *
 * Always renders the same `m.div` regardless of prefers-reduced-motion:
 * branching between a plain `<div>` and `<m.div>` based on that value risks
 * a hydration mismatch, since `useReducedMotion()` can resolve synchronously
 * on the client's first render, differently from what the server saw.
 * Reduced motion instead pins the parallax offset to 0 — a value
 * difference, not a structural one.
 */
export function ScrollParallax({
  children,
  className,
  strength = 40,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const effectiveStrength = reduceMotion ? 0 : strength;
  const y = useTransform(scrollYProgress, [0, 1], [-effectiveStrength, effectiveStrength]);

  return (
    <m.div ref={ref} style={{ y }} className={className}>
      {children}
    </m.div>
  );
}
