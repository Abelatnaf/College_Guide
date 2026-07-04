"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Light/dark toggle. Renders a fixed-size placeholder until mounted so the
 * icon never mismatches between server render and the client's stored theme.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest/80 text-on-surface-variant shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_0_3px_rgb(var(--primary)/0.12)]",
        className,
      )}
    >
      <span
        className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-12"
        aria-hidden="true"
      >
        {mounted ? (isDark ? "light_mode" : "dark_mode") : "routine"}
      </span>
    </button>
  );
}
