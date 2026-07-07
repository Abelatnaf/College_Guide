"use client";

import { useEffect, useState } from "react";
import { CinematicPhotoSequence } from "./CinematicPhotoSequence";
import { useHeroMotionAllowed } from "@/lib/hooks/useHeroMotionCapability";

const HERO_VIDEO_SRC = "/videos/hero-campus.mp4";

/**
 * Drop-in cinematic hero visual. Renders the Ken Burns photo sequence (built
 * from the app's existing licensed campus photos) by default — it always
 * works, no network round-trip required. If a real video is ever added at
 * public/videos/hero-campus.mp4, a quick HEAD check on mount detects it and
 * swaps to the background video instead.
 *
 * Checking availability up front (rather than rendering <video> and waiting
 * for an error event) sidesteps how unreliably browsers fire that event when
 * a <source> 404s — in practice a <video autoPlay preload="none"> pointed at
 * a missing file can sit at readyState 0 / networkState NETWORK_NO_SOURCE
 * indefinitely without ever dispatching "error".
 */
export function CinematicHeroMedia({ className }: { className?: string }) {
  const motionAllowed = useHeroMotionAllowed();
  const [videoAvailable, setVideoAvailable] = useState(false);

  useEffect(() => {
    if (!motionAllowed) return;
    let cancelled = false;
    fetch(HERO_VIDEO_SRC, { method: "HEAD" })
      .then((res) => {
        if (!cancelled && res.ok) setVideoAvailable(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [motionAllowed]);

  const useVideo = motionAllowed && videoAvailable;

  return (
    <div className={className}>
      {useVideo && (
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      {!useVideo && <CinematicPhotoSequence className="absolute inset-0" />}
    </div>
  );
}
