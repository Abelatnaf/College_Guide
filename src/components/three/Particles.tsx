"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import type { Points as ThreePoints } from "three";
import { randomInSphere } from "@/lib/three";

/** A drifting emerald dust shell around the globe — the "light atmosphere". */
export function Particles() {
  const ref = useRef<ThreePoints>(null);

  const positions = useMemo(() => {
    const count = 850;
    const arr = randomInSphere(count, 2.7);
    // Push any point that fell inside the globe out past its surface so none
    // sit within the sphere.
    const minR = 1.4;
    for (let i = 0; i < count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];
      const d = Math.hypot(x, y, z) || 1;
      if (d < minR) {
        const s = minR / d;
        arr[i * 3] *= s;
        arr[i * 3 + 1] *= s;
        arr[i * 3 + 2] *= s;
      }
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.015;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#34d399"
        size={0.019}
        sizeAttenuation
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}
