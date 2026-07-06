"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { container, viewportOnce } from "@/lib/motion";

/**
 * Scroll-triggered parent that cascades its `<StaggerItem>` children in.
 * Drop-in for grids/lists: wrap the grid, wrap each cell in `<StaggerItem>`.
 */
export function Stagger({
  children,
  className,
  stagger,
  delay,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <m.div
      className={className}
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </m.div>
  );
}
