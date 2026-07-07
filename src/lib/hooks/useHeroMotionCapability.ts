"use client";

import { useEffect, useState } from "react";

/**
 * Client-only capability check for the cinematic hero media: whether it's
 * safe to autoplay the Ken Burns photo motion (or a background video, if one
 * is ever added at public/videos/hero-campus.mp4).
 *
 * Starts `true` (motion allowed) so SSR and the very first paint render the
 * plain first frame — identical either way — then flips `false` after mount
 * if the visitor prefers reduced motion. This is a one-way, mount-time check:
 * respecting a *live* toggle of the OS setting while a slideshow is mid-cycle
 * would be a nice-to-have, not a correctness requirement.
 */
export function useHeroMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAllowed(false);
    }
  }, []);

  return allowed;
}
