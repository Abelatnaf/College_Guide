"use client";

import dynamic from "next/dynamic";
import { useDeviceTier } from "./useDeviceTier";
import { useDeferredMount } from "./useDeferredMount";
import { GlobeFallback } from "./GlobeFallback";

// SSR-safe boundary: the whole three/R3F/postprocessing scene lives behind this
// { ssr:false } dynamic import, so it never enters SSR or the initial bundle —
// it's a separate chunk fetched after idle, only on the high tier.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => null,
});

/**
 * Drop-in hero visual. Renders the CSS globe immediately (LCP-safe), then
 * mounts the live WebGL globe on top once the device qualifies (high tier) and
 * the browser is idle. Low/off tiers and reduced-motion keep the CSS globe.
 */
export function GlobeLoader({ className }: { className?: string }) {
  const tier = useDeviceTier();
  const ready = useDeferredMount({ timeout: 2500 });
  const showGlobe = tier === "high" && ready;

  return (
    <div className={className}>
      <GlobeFallback />
      {showGlobe && <SceneCanvas tier={tier} />}
    </div>
  );
}
