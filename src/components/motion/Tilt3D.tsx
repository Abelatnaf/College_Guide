"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 300, damping: 25, mass: 0.6 };

/**
 * Wraps children in a pointer-reactive 3D tilt: rotates on the X/Y axes
 * toward the cursor with spring physics, plus a soft radial glare that
 * tracks the pointer. The app-wide 3D language — used on the hero visual,
 * feature/bento tiles, and shared cards so "3D everywhere" comes from one
 * primitive instead of per-page transform code.
 *
 * Skips all of it under prefers-reduced-motion (renders a plain div, no
 * listeners) — this is manually driven via pointer events, which framer's
 * global `MotionConfig reducedMotion="user"` doesn't reach on its own.
 */
export function Tilt3D({
  children,
  className,
  maxTilt = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), SPRING);
  const glareBackground = useTransform([px, py], ([gx, gy]: number[]) =>
    `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.16), transparent 60%)`,
  );

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    setHovering(false);
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <m.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("relative will-change-transform [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare && (
        <m.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ background: glareBackground, opacity: hovering ? 1 : 0 }}
        />
      )}
    </m.div>
  );
}
