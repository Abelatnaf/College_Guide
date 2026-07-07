"use client";

import { useRef, type ReactNode } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Shifts children vertically as the viewport scrolls past their container —
 * a lightweight scroll-linked depth layer for hero/section imagery. No-op
 * (plain div, no scroll listener) under prefers-reduced-motion.
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
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <m.div ref={ref} style={{ y }} className={className}>
      {children}
    </m.div>
  );
}
