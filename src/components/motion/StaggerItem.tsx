"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/** A single cascade child. Timing is orchestrated by the parent `<Stagger>`. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div className={className} variants={fadeUp}>
      {children}
    </m.div>
  );
}
