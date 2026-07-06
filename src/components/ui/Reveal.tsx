"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * Wraps children in a scroll-triggered fade-up reveal, with optional stagger
 * delay. Public API (children / delayMs / className) is unchanged — swapping
 * the internals to framer-motion upgrades every existing `<Reveal>` across the
 * app for free. Reduced-motion is honored globally via `<MotionConfig
 * reducedMotion="user">`.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={fadeUp}
      custom={delayMs / 1000}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </m.div>
  );
}
