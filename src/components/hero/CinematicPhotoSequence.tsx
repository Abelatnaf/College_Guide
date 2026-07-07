"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDeferredMount } from "@/lib/hooks/useDeferredMount";
import { useHeroMotionAllowed } from "@/lib/hooks/useHeroMotionCapability";

const SLIDES = [
  { src: "/images/hero-students.jpg", alt: "Students studying together" },
  { src: "/images/hero-campus-life.jpg", alt: "Students walking together on campus" },
  { src: "/images/hero-graduation.jpg", alt: "Graduates throwing caps in the air" },
  { src: "/images/hero-journey.jpg", alt: "Airplane window view above the clouds" },
] as const;

const SLIDE_MS = 6000;
const CROSSFADE_MS = 1600;

/**
 * The cinematic "video" feel for the hero, built entirely from real,
 * already-licensed campus photos already in the app: a slow continuous Ken
 * Burns zoom per frame, cross-fading on a timer.
 *
 * Only the first frame loads immediately (matching the cost of the single
 * hero image this replaces); the remaining frames mount after idle so they
 * never compete with LCP. Freezes on the first frame — no timer, no zoom —
 * under reduced motion.
 */
export function CinematicPhotoSequence({ className }: { className?: string }) {
  const motionAllowed = useHeroMotionAllowed();
  const restReady = useDeferredMount({ timeout: 2500 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!motionAllowed || !restReady) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [motionAllowed, restReady]);

  const visibleSlides = useMemo(
    () => (restReady ? SLIDES : SLIDES.slice(0, 1)),
    [restReady],
  );

  return (
    <div className={className}>
      {visibleSlides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 ease-in-out"
          style={{
            opacity: i === active ? 1 : 0,
            transitionProperty: "opacity",
            transitionDuration: `${CROSSFADE_MS}ms`,
          }}
          aria-hidden={i !== active}
        >
          <div className={motionAllowed ? "relative h-full w-full animate-ken-burns" : "relative h-full w-full"}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
