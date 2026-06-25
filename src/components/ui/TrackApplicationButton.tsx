"use client";

import Link from "next/link";
import { useApplications } from "@/components/providers/StorageProvider";
import { cn } from "@/lib/utils";

/**
 * Full-width button for the university detail page. Adds the school to the
 * application tracker, or links to the tracker once it's already there.
 */
export function TrackApplicationButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const { getApplication, addApplication } = useApplications();
  const tracked = Boolean(getApplication(slug));

  if (tracked) {
    return (
      <Link
        href="/applications"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container py-3 font-bold text-primary transition-all hover:bg-outline-variant/20",
          className,
        )}
      >
        <span className="material-symbols-outlined">assignment_turned_in</span>
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
      <span className="material-symbols-outlined">add_task</span>
      Track Application
    </button>
  );
}
