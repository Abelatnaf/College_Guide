import type { ReactNode } from "react";
import { Tilt3D } from "@/components/motion/Tilt3D";

/**
 * Shared page-header pattern (icon chip + gradient title) — the visual
 * language introduced on the chat page, applied consistently across the
 * rest of the app for the Phase B "uplift pass". Layout-neutral: pages keep
 * their own container/spacing, this just standardizes the header itself.
 *
 * The icon chip is wrapped in Tilt3D so every route that uses PageHeader
 * picks up the app's 3D language for free.
 */
export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-sm">
        <Tilt3D maxTilt={20} className="shrink-0 rounded-xl">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-tertiary-fixed text-on-primary shadow-glow"
            aria-hidden="true"
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {icon}
            </span>
          </span>
        </Tilt3D>
        <div>
          <h1 className="bg-gradient-to-r from-primary to-tertiary-fixed bg-clip-text font-headline-lg text-headline-lg font-bold text-transparent">
            {title}
          </h1>
          {description && (
            <div className="font-body-md text-body-md text-on-surface-variant">{description}</div>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}
