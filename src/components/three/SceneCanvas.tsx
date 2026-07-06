"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Globe } from "./Globe";
import { Particles } from "./Particles";
import type { DeviceTier } from "./useDeviceTier";

/**
 * The globe scene's <Canvas>. Default export so it can be dynamically imported
 * with { ssr:false } from GlobeLoader — this is where all of three/R3F loads.
 *
 * Keeps it fast: capped DPR (auto-downgraded by PerformanceMonitor/AdaptiveDpr
 * under load), render loop paused when the tab is hidden, and bloom only on
 * the high tier.
 */
export default function SceneCanvas({ tier }: { tier: DeviceTier }) {
  const [active, setActive] = useState(true);
  const [maxDpr, setMaxDpr] = useState(tier === "high" ? 1.75 : 1.25);

  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      className="!absolute !inset-0"
      frameloop={active ? "always" : "never"}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.15, 3.0], fov: 42 }}
    >
      <PerformanceMonitor
        onDecline={() => setMaxDpr(1)}
        onIncline={() => setMaxDpr(tier === "high" ? 1.75 : 1.25)}
      />
      <AdaptiveDpr />
      <AdaptiveEvents />

      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 5]} intensity={2.4} color="#8affd0" />
      <pointLight position={[-5, -2, -3]} intensity={0.5} color="#0a5c3c" />

      <Globe />
      <Particles />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.72}
      />

      {tier === "high" && (
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={0.9}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.2}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
