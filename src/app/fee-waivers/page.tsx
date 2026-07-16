"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { feeWaivers } from "@/data/feeWaivers";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";

export default function FeeWaiversPage() {
  const [search, setSearch] = useState("");

  const entries = useMemo(
    () =>
      feeWaivers
        .map((f) => ({ waiver: f, university: getUniversityBySlug(f.slug) }))
        .filter((x): x is { waiver: (typeof feeWaivers)[number]; university: NonNullable<typeof x.university> } =>
          Boolean(x.university),
        ),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.university.name.toLowerCase().includes(q) ||
        e.university.country.toLowerCase().includes(q),
    );
  }, [search, entries]);

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="confirmation_number"
        title="Application Fee Waivers"
        description="Which schools waive the $50–90 application fee for international applicants, and how to actually ask — sourced from each school's own admissions page."
      />

      <div className="mb-lg flex items-start gap-sm rounded-xl border border-primary/25 bg-gradient-to-r from-secondary-container/50 to-secondary-container/20 px-md py-sm">
        <Icon name="verified" className="mt-0.5 shrink-0 text-[20px] text-primary" />
        <p className="font-caption text-caption text-on-surface">
          This is a <strong>starter list</strong> ({feeWaivers.length} schools) that grows over time — a
          school not listed here just hasn&apos;t been verified yet, not necessarily unavailable. Fee-waiver
          mechanics change year to year, so always confirm the current process on the official page (linked
          on each entry) before applying. A school not appearing here is still worth trying the{" "}
          <a
            href="https://www.commonapp.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            Common App
          </a>{" "}
          or NACAC fee-waiver option on — each college decides individually whether to honor it for
          international applicants.
        </p>
      </div>

      <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school or country…"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 font-body-md text-body-md focus:border-primary focus:ring-0"
          />
        </div>
      </div>

      <p className="mb-md font-caption text-caption text-on-surface-variant">
        {filtered.length} of {entries.length} schools
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <Icon name="search_off" className="mb-md text-[48px] text-outline" />
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">No matches</h3>
          <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {filtered.map(({ waiver, university }) => (
            <article
              key={waiver.slug}
              className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgb(var(--shadow-ambient)/0.05)] dark:shadow-[0_4px_15px_rgb(var(--shadow-ambient)/0.3)]"
            >
              <div className="mb-sm flex flex-wrap items-start justify-between gap-sm">
                <div>
                  <Link
                    href={`/universities/${university.slug}`}
                    className="font-headline-md text-headline-md text-on-surface hover:text-primary"
                  >
                    {university.name}
                  </Link>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {flagFor(university.country)} {university.city}, {university.country}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 font-caption text-caption font-semibold text-on-secondary-container">
                  <Icon name="check_circle" className="text-[14px]" />
                  International applicants eligible
                </span>
              </div>

              <div>
                <p className="mb-1 font-label-md text-label-md text-on-surface">How to request it</p>
                <p className="font-body-md text-body-md text-on-surface-variant">{waiver.howToRequest}</p>
              </div>

              <p className="mt-sm font-caption text-[11px] italic text-on-surface-variant/80">{waiver.note}</p>

              <div className="mt-sm flex flex-wrap gap-md">
                {waiver.sourceUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-caption text-caption text-primary underline hover:no-underline"
                  >
                    Source {waiver.sourceUrls.length > 1 ? i + 1 : ""}
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
