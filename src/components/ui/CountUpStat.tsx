"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/lib/hooks/useReveal";
import { formatNumber } from "@/lib/utils";

/**
 * Animates a REAL number (passed in, never invented) from 0 up to `value`
 * once scrolled into view. Purely a presentation animation — the value
 * itself must come from actual data (dataset length, verified-fee count,
 * etc.), consistent with the app's no-fabricated-stats rule.
 */
export function CountUpStat({
  value,
  suffix = "",
  durationMs = 1200,
  className,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(display)}
      {suffix}
    </span>
  );
}
