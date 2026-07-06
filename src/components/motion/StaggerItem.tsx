"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { fadeUp, riseIn, scaleIn } from "@/lib/motion";

const VARIANTS = { fade: fadeUp, rise: riseIn, scale: scaleIn } as const;

/**
 * A single cascade child. Timing is orchestrated by the parent `<Stagger>`.
 *
 * `variant` is a string key (not a variants object) so it stays serializable
 * across the server→client boundary — the variant objects contain functions
 * (for per-instance delay) which can't be passed as props from an RSC.
 *
 * Use `variant="rise"` for LCP-critical content (e.g. the hero headline):
 * riseIn is transform-only, so the largest paint isn't withheld behind a fade.
 */
export function StaggerItem({
  children,
  className,
  variant = "fade",
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <m.div className={className} variants={VARIANTS[variant]}>
      {children}
    </m.div>
  );
}
