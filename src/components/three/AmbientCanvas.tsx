"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import type { Points as ThreePoints } from "three";
import { randomInSphere } from "@/lib/three";

/** A slow-drifting emerald dust field — the "light atmosphere" behind the app. */
function ParticleField() {
  const ref = useRef<ThreePoints>(null);
  const positions = useMemo(() => randomInSphere(1300, 1.7), []);

  useFrame((_, delta) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += delta * 0.02;
    p.rotation.x += delta * 0.006;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#34d399"
        size={0.01}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

/**
 * Default export so it can be `next/dynamic(..., { ssr:false })`-imported.
 * Pauses the render loop whenever the tab is hidden, so it costs nothing in
 * the background.
 */
export default function AmbientCanvas() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      className="!absolute !inset-0"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 2.2], fov: 60 }}
    >
      <ParticleField />
    </Canvas>
  );
}
