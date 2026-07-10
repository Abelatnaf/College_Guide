"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Tilt3D } from "@/components/motion/Tilt3D";

/**
 * Shared full-page lock state — used by AccessGate (no account / unpaid) and
 * RequireTier (paid but below the tier a feature needs). Mirrors PageHeader's
 * icon-chip language so a paywall screen still feels like part of the app.
 */
export function LockScreen({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: ReactNode;
  action: ReactNode;
}) {
  return (
    <main className="flex flex-grow flex-col items-center justify-center gap-md px-md py-xl text-center">
      <Reveal className="flex flex-col items-center gap-md">
        <Tilt3D maxTilt={16} className="rounded-2xl">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-tertiary-fixed text-on-primary shadow-glow">
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          </span>
        </Tilt3D>
        <h1 className="font-display text-display-md text-on-surface">{title}</h1>
        <p className="max-w-md font-body-md text-body-md text-on-surface-variant">{description}</p>
        {action}
      </Reveal>
    </main>
  );
}
