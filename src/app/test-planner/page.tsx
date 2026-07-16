"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { englishTests } from "@/data/englishTests";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export default function TestPlannerPage() {
  const [search, setSearch] = useState("");
  const [duolingoOnly, setDuolingoOnly] = useState(false);

  const entries = useMemo(
    () =>
      englishTests
        .map((e) => ({ policy: e, university: getUniversityBySlug(e.slug) }))
        .filter((x): x is { policy: (typeof englishTests)[number]; university: NonNullable<typeof x.university> } =>
          Boolean(x.university),
        ),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (duolingoOnly && !e.policy.acceptsDuolingo) return false;
      if (!q) return true;
      return e.university.name.toLowerCase().includes(q) || e.university.country.toLowerCase().includes(q);
    });
  }, [search, duolingoOnly, entries]);

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="translate"
        title="English Test Planner"
        description="Which schools actually require TOEFL/IELTS, which accept the cheaper Duolingo English Test, and what their own pages really say about minimum scores."
      />

      <div className="mb-lg flex items-start gap-sm rounded-xl border border-primary/25 bg-gradient-to-r from-secondary-container/50 to-secondary-container/20 px-md py-sm">
        <Icon name="verified" className="mt-0.5 shrink-0 text-[20px] text-primary" />
        <p className="font-caption text-caption text-on-surface">
          A recurring pattern across every school checked so far: <strong>none publish a hard minimum
          score</strong> — sites that list a specific &ldquo;required&rdquo; TOEFL/IELTS number for these
          schools are not quoting anything on the school&apos;s own page. This is a <strong>starter list</strong> (
          {englishTests.length} schools); always confirm the current policy on the official page (linked
          on each entry) before assuming a school does or doesn&apos;t require a test.
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
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-md py-2.5 font-label-md text-label-md text-on-surface">
          <input
            type="checkbox"
            checked={duolingoOnly}
            onChange={(e) => setDuolingoOnly(e.target.checked)}
            className="accent-primary"
          />
          Accepts Duolingo only
        </label>
      </div>

      <p className="mb-md font-caption text-caption text-on-surface-variant">
        {filtered.length} of {entries.length} schools
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <Icon name="search_off" className="mb-md text-[48px] text-outline" />
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">No matches</h3>
          <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
            Try a different search term or clear the Duolingo filter.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {filtered.map(({ policy, university }) => (
            <article
              key={policy.slug}
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
                <div className="flex flex-wrap items-center gap-1">
                  <VerifiedBadge />
                  <span
                    className={`rounded-full px-3 py-1 font-caption text-caption font-semibold ${
                      policy.required === "optional"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {policy.required === "optional" ? "Fully optional" : "Required for some applicants"}
                  </span>
                </div>
              </div>

              <div className="mb-sm flex flex-wrap gap-1">
                {policy.acceptedTests.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-container-high px-2.5 py-1 font-caption text-caption text-on-surface-variant"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant">{policy.policyNote}</p>

              <div className="mt-sm flex flex-wrap gap-md">
                {policy.sourceUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-caption text-caption text-primary underline hover:no-underline"
                  >
                    Source {policy.sourceUrls.length > 1 ? i + 1 : ""}
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
