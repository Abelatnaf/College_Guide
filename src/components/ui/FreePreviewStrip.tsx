import Link from "next/link";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { FREE_PREVIEW_SLUGS } from "@/lib/access/freePreview";
import { Icon } from "@/components/ui/Icon";

/**
 * Clickable strip of the featured free-preview university profiles (see
 * freePreview.ts / AccessGate.tsx) — the entrance to the funnel for a
 * visitor who arrived from a shared link with no account yet.
 */
export function FreePreviewStrip() {
  const schools = FREE_PREVIEW_SLUGS.map(getUniversityBySlug).filter(
    (u): u is NonNullable<typeof u> => Boolean(u),
  );

  return (
    <section className="border-y border-outline-variant/20 bg-surface-container-low/40 py-lg">
      <div className="mx-auto max-w-container-max px-md md:px-lg">
        <div className="mb-md flex items-center gap-sm">
          <Icon name="lock_open" className="text-[18px] text-primary" />
          <p className="font-micro text-micro uppercase tracking-wider text-primary">
            Free — no account needed
          </p>
        </div>
        <div className="flex gap-sm overflow-x-auto pb-2">
          {schools.map((u) => (
            <Link
              key={u.slug}
              href={`/universities/${u.slug}`}
              className="hairline flex shrink-0 items-center gap-2 rounded-full border bg-surface-container-lowest px-4 py-2.5 font-label-md text-body-md text-on-surface transition-colors hover:border-primary/50 hover:text-primary"
            >
              <span className="text-base leading-none">{flagFor(u.country)}</span>
              {u.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
