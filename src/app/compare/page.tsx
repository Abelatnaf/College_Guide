"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { universities, getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { CompareTable, computeWins } from "@/components/ui/CompareTable";

const DEFAULT_SLUGS = ["harvard", "cambridge", "university-of-toronto"];

export default function ComparePage() {
  const all = useMemo(
    () => [...universities].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const [slugs, setSlugs] = useState<string[]>(DEFAULT_SLUGS);

  const selected = slugs.map(
    (s) => getUniversityBySlug(s) ?? universities[0],
  );
  const wins = computeWins(selected);

  const changeSlot = (i: number, slug: string) =>
    setSlugs((cur) => cur.map((s, idx) => (idx === i ? slug : s)));

  return (
    <main className="mx-auto max-w-container-max px-md py-xl">
      <section className="mb-xl text-center md:text-left">
        <span
          className="mb-sm inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_4px_15px_rgb(var(--primary)/0.35)]"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            compare_arrows
          </span>
        </span>
        <h1 className="mb-base font-display text-display-lg text-on-surface">
          Compare Universities
        </h1>
        <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          Analyze top institutions side by side. Swap any school from the dropdowns, and
          we&apos;ll highlight the strongest option in each row.
        </p>
      </section>

      <CompareTable
        universities={selected}
        allUniversities={all}
        onChange={changeSlot}
      />

      {/* Summary cards */}
      <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-3">
        {selected.map((u, i) => (
          <div
            key={i}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
          >
            <div className="mb-sm flex items-center gap-sm">
              <span className="text-lg">{flagFor(u.country)}</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">{u.name}</h3>
            </div>
            <p className="mb-md font-body-md text-body-md text-on-surface-variant">
              {u.city}, {u.country} · Est. {u.established}
            </p>
            <div className="mb-md flex flex-wrap gap-1">
              {wins[i].length > 0 ? (
                wins[i].map((w) => (
                  <span
                    key={w}
                    className="flex items-center gap-1 rounded-full bg-primary-fixed/40 px-2 py-1 font-caption text-caption text-on-primary-fixed-variant"
                  >
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    {w}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-surface-container px-2 py-1 font-caption text-caption text-on-surface-variant">
                  Solid all-rounder
                </span>
              )}
            </div>
            <Link
              href={`/universities/${u.slug}`}
              className="font-label-md text-label-md text-primary hover:underline"
            >
              View full profile →
            </Link>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-xl flex flex-col items-center rounded-xl bg-surface-container-low p-xl text-center">
        <h2 className="mb-md font-headline-lg text-headline-lg">Need a copy to share?</h2>
        <p className="mb-lg max-w-lg font-body-md text-on-surface-variant">
          Export this comparison as a printable PDF report to review offline or share with
          family and counselors.
        </p>
        <div className="flex flex-col gap-md md:flex-row">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary shadow-md transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">download</span>
            Download PDF Report
          </button>
          <Link
            href="/quiz"
            className="rounded-lg bg-surface-container-highest px-lg py-sm text-center font-label-md text-on-surface transition-all hover:bg-outline-variant/40"
          >
            Find My Match Instead
          </Link>
        </div>
      </section>
    </main>
  );
}
