"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Instances, Instance, Html } from "@react-three/drei";
import { latLongToVector3 } from "@/lib/three";
import { GLOBE_PINS } from "@/data/geo";

/**
 * Glowing university pins as a single instanced mesh (one draw call). Hovering
 * a pin enlarges it and shows the school name; clicking opens its profile.
 */
export function Pins({ radius }: { radius: number }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const pins = useMemo(
    () =>
      GLOBE_PINS.map((p) => ({
        ...p,
        pos: latLongToVector3(p.lat, p.lng, radius),
      })),
    [radius],
  );
  const active = pins.find((p) => p.slug === hovered);

  return (
    <group>
      <Instances limit={pins.length} range={pins.length}>
        <sphereGeometry args={[0.011, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
        {pins.map((p) => (
          <Instance
            key={p.slug}
            position={p.pos}
            color={hovered === p.slug ? "#eafff5" : "#5ff0b8"}
            scale={hovered === p.slug ? 2.3 : 1}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(p.slug);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = "auto";
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/universities/${p.slug}`);
            }}
          />
        ))}
      </Instances>

      {active && (
        <Html position={active.pos} center zIndexRange={[30, 0]}>
          <div className="pointer-events-none -translate-y-7 whitespace-nowrap rounded-full border border-primary/40 bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-semibold text-on-surface shadow-glow-sm backdrop-blur-md">
            {active.name}
          </div>
        </Html>
      )}
    </group>
  );
}
