"use client";

import { useState } from "react";
import { CinematicPhotoSequence } from "./CinematicPhotoSequence";
import { useHeroMotionAllowed } from "@/lib/hooks/useHeroMotionCapability";

const HERO_VIDEO_SRC = "/videos/hero-campus.mp4";

/**
 * Drop-in cinematic hero visual. Tries a real background video first — add
 * one at public/videos/hero-campus.mp4 and it plays automatically — and
 * falls back to a Ken Burns photo sequence built from the app's existing
 * licensed campus photos if no video file is present (or under reduced
 * motion, where it skips autoplay entirely and shows a single still frame).
 */
export function CinematicHeroMedia({ className }: { className?: string }) {
  const motionAllowed = useHeroMotionAllowed();
  const [videoFailed, setVideoFailed] = useState(false);
  const tryVideo = motionAllowed && !videoFailed;

  return (
    <div className={className}>
      {tryVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      {!tryVideo && <CinematicPhotoSequence className="absolute inset-0" />}
    </div>
  );
}
