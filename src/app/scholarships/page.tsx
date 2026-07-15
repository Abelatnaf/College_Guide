"use client";

import { useMemo, useState } from "react";
import { scholarships } from "@/data/scholarships";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";

const ALL_DESTINATIONS = "All destinations";

export default function ScholarshipsPage() {
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState(ALL_DESTINATIONS);

  const destinations = useMemo(
    () => [ALL_DESTINATIONS, ...Array.from(new Set(scholarships.map((s) => s.destination))).sort()],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scholarships.filter((s) => {
      if (destination !== ALL_DESTINATIONS && s.destination !== destination) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.eligibility.toLowerCase().includes(q)
      );
    });
  }, [search, destination]);

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="military_tech"
        title="Scholarship Database"
        description="Real, web-verified scholarships for international and African students — sourced only from each program's own official page."
      />

      <div className="mb-lg flex items-start gap-sm rounded-xl border border-primary/25 bg-gradient-to-r from-secondary-container/50 to-secondary-container/20 px-md py-sm">
        <Icon name="verified" className="mt-0.5 shrink-0 text-[20px] text-primary" />
        <p className="font-caption text-caption text-on-surface">
          This list is <strong>not exhaustive</strong> — it covers a handful of major, well-documented
          programs, each verified against its own official website. Coverage amounts, eligibility rules,
          and deadlines change year to year, so always confirm the current details on the official page
          (linked on each entry) before relying on anything here.
        </p>
      </div>

      <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, provider, or eligibility…"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 font-body-md text-body-md focus:border-primary focus:ring-0"
          />
        </div>
      </div>

      <div className="mb-lg flex flex-wrap gap-sm">
        {destinations.map((d) => {
          const active = destination === d;
          return (
            <button
              key={d}
              onClick={() => setDestination(d)}
              aria-pressed={active}
              className={
                active
                  ? "rounded-full bg-primary px-md py-1 font-label-md text-label-md text-on-primary"
                  : "rounded-full bg-secondary-container px-md py-1 font-label-md text-label-md text-on-secondary-container transition-colors hover:bg-primary/10"
              }
            >
              {d}
            </button>
          );
        })}
      </div>

      <p className="mb-md font-caption text-caption text-on-surface-variant">
        {filtered.length} of {scholarships.length} programs
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <Icon name="search_off" className="mb-md text-[48px] text-outline" />
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">No matches</h3>
          <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
            Try a different search term or destination.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {filtered.map((s) => (
            <article
              key={s.slug}
              className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgb(var(--shadow-ambient)/0.05)] dark:shadow-[0_4px_15px_rgb(var(--shadow-ambient)/0.3)]"
            >
              <div className="mb-sm flex flex-wrap items-start justify-between gap-sm">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">{s.name}</h2>
                  <p className="font-caption text-caption text-on-surface-variant">{s.provider}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="rounded-full bg-secondary-container px-3 py-1 font-caption text-caption font-semibold text-on-secondary-container">
                    {s.destination}
                  </span>
                  {s.degreeLevels.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-surface-container-high px-3 py-1 font-caption text-caption text-on-surface-variant"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div>
                  <p className="mb-1 font-label-md text-label-md text-on-surface">Coverage</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">{s.coverage}</p>
                </div>
                <div>
                  <p className="mb-1 font-label-md text-label-md text-on-surface">Eligibility</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">{s.eligibility}</p>
                </div>
              </div>

              <div className="mt-sm rounded-lg bg-surface-container-low p-md">
                <p className="font-caption text-caption text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Deadline pattern:</span> {s.deadlineWindow}
                </p>
              </div>

              <p className="mt-sm font-caption text-[11px] italic text-on-surface-variant/80">{s.note}</p>

              <div className="mt-sm flex flex-wrap gap-md">
                {s.sourceUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-caption text-caption text-primary underline hover:no-underline"
                  >
                    Source {s.sourceUrls.length > 1 ? i + 1 : ""}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
