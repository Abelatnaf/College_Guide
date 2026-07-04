"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/lib/hooks/useReveal";
import { cn } from "@/lib/utils";

/** Wraps children in a scroll-triggered fade-up reveal, with optional stagger delay. */
export function Reveal({
  children,
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(visible ? "animate-fade-up" : "opacity-0", className)}
      style={visible ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
