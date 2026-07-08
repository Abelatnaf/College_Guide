"use client";

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
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
 * Always renders the same `m.div` structure regardless of
 * prefers-reduced-motion — branching between a plain `<div>` and `<m.div>`
 * based on that value caused a real hydration mismatch (React errors
 * #418/#423), since `useReducedMotion()` can resolve synchronously on the
 * client's first render, differently from what the server saw. Reduced
 * motion instead zeroes the tilt amount, so rotation stays pinned at 0
 * regardless of pointer movement — a value difference, not a structural one.
 */
export function Tilt3D({
  children,
  className,
  style,
  maxTilt = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxTilt?: number;
  glare?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const effectiveMaxTilt = reduceMotion ? 0 : maxTilt;
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [effectiveMaxTilt, -effectiveMaxTilt]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-effectiveMaxTilt, effectiveMaxTilt]), SPRING);
  const glareBackground = useTransform([px, py], ([gx, gy]: number[]) =>
    `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.16), transparent 60%)`,
  );

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
      style={{ ...style, rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("relative will-change-transform [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare && (
        <m.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ background: glareBackground, opacity: hovering && !reduceMotion ? 1 : 0 }}
        />
      )}
    </m.div>
  );
}
