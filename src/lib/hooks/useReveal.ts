"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal helper: returns a ref to attach to any element and a
 * `visible` flag that flips true once the element enters the viewport
 * (fires once — reveals don't re-hide on scroll-out).
 *
 * Respects prefers-reduced-motion by revealing immediately, and reveals
 * immediately when IntersectionObserver is unavailable.
 *
 * Usage:
 *   const { ref, visible } = useReveal<HTMLDivElement>();
 *   <div ref={ref} className={visible ? "animate-fade-up" : "opacity-0"} />
 *
 * Stagger children by adding an index-based delay:
 *   style={{ animationDelay: `${i * 80}ms` }}
 */
export function useReveal<T extends HTMLElement>(options?: { rootMargin?: string }) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: options?.rootMargin ?? "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.rootMargin]);

  return { ref, visible };
}
