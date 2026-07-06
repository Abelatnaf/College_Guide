"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { container, viewportOnce } from "@/lib/motion";

/**
 * Semantic <section> that reveals on scroll and cascades any `<StaggerItem>`
 * children. A route can wrap its top-level sections in this to opt into the
 * cinematic entry with zero extra wiring.
 */
export function Section({
  children,
  className,
  id,
  stagger,
  delay,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <m.section
      id={id}
      className={className}
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </m.section>
  );
}
