import type { ReactNode } from "react";
import { Tilt3D } from "@/components/motion/Tilt3D";
import { Icon } from "@/components/ui/Icon";

/**
 * Shared page-header pattern (icon chip + editorial serif title) — applied
 * consistently across the app, so every inner route inherits the display
 * typeface and the 3D chip without per-page code. Layout-neutral: pages keep
 * their own container/spacing, this just standardizes the header itself.
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
      <div className="flex items-start gap-md">
        <Tilt3D maxTilt={20} className="mt-1 shrink-0 rounded-xl">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-tertiary-fixed text-on-primary shadow-glow"
            aria-hidden="true"
          >
            <Icon name={icon} className="text-[24px]" filled />
          </span>
        </Tilt3D>
        <div>
          <h1 className="font-display text-display-md text-on-surface">{title}</h1>
          {description && (
            <div className="mt-1 font-body-md text-body-md text-on-surface-variant">
              {description}
            </div>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}
