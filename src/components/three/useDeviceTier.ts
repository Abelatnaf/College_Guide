"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "high" | "low" | "off";

/**
 * Classifies how much WebGL flourish a device should get:
 * - "off":  no WebGL, or the user prefers reduced motion → never mount a canvas.
 * - "low":  WebGL works but the device is modest (mobile / coarse pointer /
 *           few cores / little memory) → ambient only, no bloom or heavy scene.
 * - "high": capable desktop-class GPU → full scene + postprocessing.
 *
 * Starts at "off" so SSR and the very first client frame keep the static
 * fallback; it upgrades after mount once the environment can be probed. This
 * is a heuristic, tuned to fail *down* — unknown values are treated generously
 * only where a false "low" would needlessly punish capable desktops.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("off");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTier("off");
      return;
    }

    let hasWebGL = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebGL = !!(
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
      );
    } catch {
      hasWebGL = false;
    }
    if (!hasWebGL) {
      setTier("off");
      return;
    }

    // Defaults lean high when the browser doesn't expose the hint (Safari/FF
    // don't report deviceMemory) so desktops aren't wrongly demoted.
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;

    if (coarse || smallScreen || cores <= 4 || memory <= 2) {
      setTier("low");
    } else {
      setTier("high");
    }
  }, []);

  return tier;
}
