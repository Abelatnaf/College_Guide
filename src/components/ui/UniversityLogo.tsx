"use client";

import { useState } from "react";
import { avatarColorFor, universityFaviconUrl, initialsFor } from "@/lib/universityLogo";
import { cn } from "@/lib/utils";

/**
 * Renders a university's real favicon (derived from its official website
 * domain) and gracefully falls back to a generated initials avatar if it
 * fails to load — not every school resolves. Uses a plain <img>, not
 * next/image: the source is a third-party .ico that Next's built-in
 * optimizer doesn't reliably handle, and these are small enough that
 * optimization wouldn't help anyway.
 */
export function UniversityLogo({
  name,
  website,
  size = 64,
  className,
  rounded = "rounded-lg",
}: {
  name: string;
  website: string;
  size?: number;
  className?: string;
  rounded?: string;
}) {
  const src = universityFaviconUrl(website);
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center font-label-md font-bold text-white",
          rounded,
          className,
        )}
        style={{ width: size, height: size, backgroundColor: avatarColorFor(name) }}
        aria-label={`${name} logo`}
        role="img"
      >
        <span style={{ fontSize: Math.max(11, size * 0.32) }}>{initialsFor(name)}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- third-party .ico, not worth Next's image pipeline
    <img
      className={cn("shrink-0 bg-white object-contain p-1", rounded, className)}
      alt={`${name} logo`}
      src={src}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
