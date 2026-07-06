"use client";

import dynamic from "next/dynamic";
import { useDeviceTier } from "./useDeviceTier";
import { useDeferredMount } from "./useDeferredMount";

// SSR-safe boundary: three never enters the server bundle or the initial JS —
// it's a separate chunk fetched only after idle, only on capable devices.
const AmbientCanvas = dynamic(() => import("./AmbientCanvas"), {
  ssr: false,
  loading: () => null,
});

/**
 * The app-wide cinematic backdrop, mounted once in the root layout.
 *
 * Every device gets the cheap always-on layer: two softly "breathing" emerald
 * aurora orbs plus an edge vignette. High-tier devices additionally get a
 * lazy, idle-mounted WebGL dust field layered on top. Low/off tiers (mobile,
 * reduced-motion, no-WebGL) keep just the CSS layer — fast and graceful.
 */
export function AmbientBackground() {
  const tier = useDeviceTier();
  const ready = useDeferredMount();
  const showCanvas = tier === "high" && ready;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-1/2 top-[-25%] h-[65vmax] w-[65vmax] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px] motion-safe:animate-aurora-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[48vmax] w-[48vmax] rounded-full bg-tertiary/10 blur-[130px] motion-safe:animate-aurora-slower" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,transparent_55%,rgb(var(--background)/0.65))]" />
      {showCanvas && <AmbientCanvas />}
    </div>
  );
}
