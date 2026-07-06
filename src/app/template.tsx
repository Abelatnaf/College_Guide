"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * App Router re-mounts template.tsx on every navigation (unlike layout.tsx),
 * so this wrapper fires a gentle page-level "settle" on first paint AND on
 * every route change — the app-wide entry cascade with zero per-page wiring.
 *
 * Deliberately transform-only (no opacity fade): the largest contentful paint
 * is never withheld behind an opacity animation, so LCP stays fast. Per-page
 * choreography (opacity cascades on non-LCP chrome) is layered on top via
 * <Stagger>/<Reveal>. Reduced-motion collapses this to a no-op globally.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
