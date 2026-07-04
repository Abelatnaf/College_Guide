"use client";

import { useShortlist } from "@/components/providers/StorageProvider";
import { cn } from "@/lib/utils";

const FILL_1 = { fontVariationSettings: "'FILL' 1" } as const;

/**
 * Reusable shortlist toggle. `icon` renders the round bookmark button used on
 * cards; `full` renders a labelled button used on the detail page. Backed by the
 * real, persisted shortlist (localStorage, plus Supabase when signed in).
 */
export function ShortlistButton({
  slug,
  variant = "icon",
  className,
}: {
  slug: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { isSaved, toggleSave } = useShortlist();
  const saved = isSaved(slug);

  if (variant === "full") {
    return (
      <button
        onClick={() => toggleSave(slug)}
        aria-pressed={saved}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold transition-all",
          saved
            ? "bg-primary text-on-primary hover:bg-primary-container"
            : "bg-secondary-container text-primary hover:bg-outline-variant/20",
          className,
        )}
      >
        <span className="material-symbols-outlined" style={saved ? FILL_1 : undefined}>
          {saved ? "bookmark" : "bookmark_border"}
        </span>
        {saved ? "Saved to Shortlist" : "Save to Shortlist"}
      </button>
    );
  }

  return (
    <button
      onClick={() => toggleSave(slug)}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      aria-pressed={saved}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-sm backdrop-blur transition-colors hover:text-primary",
        saved && "text-primary",
        className,
      )}
    >
      <span className="material-symbols-outlined" style={saved ? FILL_1 : undefined}>
        {saved ? "bookmark" : "bookmark_border"}
      </span>
    </button>
  );
}
