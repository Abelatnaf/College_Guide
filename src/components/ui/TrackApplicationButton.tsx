"use client";

import Link from "next/link";
import { useApplications } from "@/components/providers/StorageProvider";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Adds the school to the application tracker, or links to the tracker once
 * it's already there. `full` is the labelled button used on the detail
 * page's sidebar; `icon` is a compact round button for the sticky action bar.
 */
export function TrackApplicationButton({
  slug,
  variant = "full",
  className,
}: {
  slug: string;
  variant?: "full" | "icon";
  className?: string;
}) {
  const { getApplication, addApplication } = useApplications();
  const tracked = Boolean(getApplication(slug));

  if (variant === "icon") {
    if (tracked) {
      return (
        <Link
          href="/applications"
          aria-label="View in application tracker"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low",
            className,
          )}
        >
          <Icon name="assignment_turned_in" />
        </Link>
      );
    }
    return (
      <button
        onClick={() => addApplication(slug)}
        aria-label="Track application"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary",
          className,
        )}
      >
        <Icon name="add_task" />
      </button>
    );
  }

  if (tracked) {
    return (
      <Link
        href="/applications"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container py-3 font-bold text-primary transition-all hover:bg-outline-variant/20",
          className,
        )}
      >
        <Icon name="assignment_turned_in" />
        View in Application Tracker
      </Link>
    );
  }

  return (
    <button
      onClick={() => addApplication(slug)}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary py-3 font-bold text-primary transition-all hover:bg-primary hover:text-on-primary",
        className,
      )}
    >
      <Icon name="add_task" />
      Track Application
    </button>
  );
}
