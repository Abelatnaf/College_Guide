"use client";

import { useMemo } from "react";
import { createGlobeMaterial, createAtmosphereMaterial } from "./globeMaterials";
import { Pins } from "./Pins";

/**
 * The composed globe: dark emerald earth + additive atmosphere halo + pins.
 * It doesn't self-rotate — OrbitControls (autoRotate, in SceneCanvas) orbits
 * the camera, which reads as the globe turning and lets the user drag to spin.
 */
export function Globe() {
  const globeMat = useMemo(() => createGlobeMaterial(), []);
  const atmoMat = useMemo(() => createAtmosphereMaterial(), []);

  return (
    <group>
      <mesh material={globeMat}>
        <icosahedronGeometry args={[1, 24]} />
      </mesh>
      <mesh material={atmoMat} scale={1.18}>
        <icosahedronGeometry args={[1, 12]} />
      </mesh>
      <Pins radius={1.012} />
    </group>
  );
}
