"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getUniversityBySlug } from "@/data/universities";
import { getApplicationFee, type ApplicationFeeEntry } from "@/data/applicationFees";
import { testFees, cssProfile, waiverGuidance, type TestKey } from "@/data/costReference";
import { flagFor } from "@/data/flags";
import {
  useAcademicProfile,
  useShortlist,
} from "@/components/providers/StorageProvider";
import { PageHeader } from "@/components/ui/PageHeader";

const TEST_KEYS: TestKey[] = ["TOEFL", "IELTS", "Duolingo", "SAT", "ACT"];

/**
 * Sourced fees carry meaningful cents (e.g. UBC's $173.25 CAD) that the
 * shared `formatCurrency` util intentionally rounds away for tuition
 * display elsewhere in the app. This page shows a student's real bill, so
 * it preserves whatever precision the source actually states.
 */
function formatPreciseCurrency(amount: number, currency: string): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}

export default function CostToApplyPage() {
  const { shortlist, hydrated } = useShortlist();
  const { profile, hydrated: profileHydrated } = useAcademicProfile();

  const items = useMemo(
    () =>
      shortlist
        .map((i) => ({ item: i, university: getUniversityBySlug(i.slug) }))
        .filter(
          (x): x is { item: typeof x.item; university: NonNullable<typeof x.university> } =>
            Boolean(x.university),
        ),
    [shortlist],
  );

  // Default test selection: whichever score fields the student has already
  // filled in on their academic profile are assumed to already be "done",
  // so default-select the tests they DON'T yet have a score for. The profile
  // starts empty and only loads from localStorage after mount, so this has
  // to (re)run once hydration finishes rather than only in useState's lazy
  // initializer, or a returning user's real scores never get picked up.
  const [selectedTests, setSelectedTests] = useState<Set<TestKey>>(new Set());
  const [testsInitialized, setTestsInitialized] = useState(false);

  useEffect(() => {
    if (!profileHydrated || testsInitialized) return;
    const defaults = new Set<TestKey>();
    if (profile.toefl == null) defaults.add("TOEFL");
    if (profile.ielts == null) defaults.add("IELTS");
    if (profile.sat == null) defaults.add("SAT");
    if (profile.act == null) defaults.add("ACT");
    // Duolingo has no profile field to compare against; leave unselected by default.
    setSelectedTests(defaults);
    setTestsInitialized(true);
  }, [profileHydrated, testsInitialized, profile]);

  const toggleTest = (key: TestKey) => {
    setSelectedTests((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── application fees, grouped by currency ──────────────────────────────
  const { verified, unverified } = useMemo(() => {
    const verified: { university: (typeof items)[number]["university"]; fee: ApplicationFeeEntry }[] = [];
    const unverified: (typeof items)[number]["university"][] = [];
    for (const { university } of items) {
      const fee = getApplicationFee(university.slug);
      if (fee) verified.push({ university, fee });
      else unverified.push(university);
    }
    return { verified, unverified };
  }, [items]);

  const byCurrency = new Map<string, number>();
  for (const { fee } of verified) {
    byCurrency.set(fee.currency, (byCurrency.get(fee.currency) ?? 0) + fee.amount);
  }

  const needsCSSProfile = verified.some(({ fee }) => fee.requiresCSSProfile === true);
  const cssProfileSchoolCount = verified.filter(({ fee }) => fee.requiresCSSProfile === true).length;
  const cssProfileTotalUSD = needsCSSProfile
    ? cssProfile.firstSchoolFeeUSD + Math.max(0, cssProfileSchoolCount - 1) * cssProfile.additionalSchoolFeeUSD
    : 0;

  // ── testing costs ───────────────────────────────────────────────────────
  const selectedTestFees = testFees.filter((t) => selectedTests.has(t.key));
  const testingTotalUSD = selectedTestFees.reduce((sum, t) => sum + t.typicalFeeUSD, 0);

  // ── sources actually used on the page ──────────────────────────────────
  const sourcesUsed = useMemo(() => {
    const map = new Map<string, string>();
    verified.forEach(({ university, fee }) => map.set(fee.sourceUrl, `${university.name} application fee`));
    selectedTestFees.forEach((t) => map.set(t.sourceUrl, `${t.test} fee`));
    if (needsCSSProfile) map.set(cssProfile.sourceUrl, "CSS Profile fee & waiver policy");
    return Array.from(map.entries());
  }, [verified, selectedTestFees, needsCSSProfile]);

  if (hydrated && items.length === 0) {
    return (
      <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <span className="material-symbols-outlined mb-md text-[48px] text-outline">payments</span>
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
            Add schools to see what it costs to apply
          </h3>
          <p className="mb-md max-w-md text-body-md text-on-surface-variant">
            Save universities to your shortlist first, then come back here to see verified
            application fees where we have them, testing costs, and real fee-waiver guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-sm">
            <Link
              href="/universities"
              className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Browse universities
            </Link>
            <Link
              href="/shortlist"
              className="rounded-lg bg-secondary-container px-lg py-sm font-label-md text-primary transition-colors hover:bg-outline-variant/20"
            >
              Go to shortlist
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="payments"
        title="Cost to Apply"
        description="What it actually costs just to submit your applications — fees, tests, and the CSS Profile — with sources for every number, and real guidance on getting them waived."
      />

      {/* Completeness line */}
      <div className="mb-lg rounded-lg bg-surface-container-low px-md py-3 font-caption text-caption text-on-surface-variant">
        {verified.length} of {items.length} shortlisted schools have a verified application fee.
        {unverified.length > 0 &&
          " The rest aren't verified yet — check each school's official site before budgeting around them."}
      </div>

      {/* Per-school breakdown */}
      <section className="mb-xl">
        <h2 className="mb-md font-headline-md text-headline-md text-on-surface">Application fees</h2>
        <div className="space-y-md">
          {verified.map(({ university: u, fee }) => (
            <div
              key={u.slug}
              className="flex flex-col gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-body-md text-body-md font-semibold text-on-surface">
                  {flagFor(u.country)} {u.name}
                </p>
                <p className="font-caption text-caption text-on-surface-variant">
                  {fee.appliesTo}
                  {fee.requiresCSSProfile === true && " · requires CSS Profile"}
                </p>
                <p className="mt-1 font-caption text-caption text-on-surface-variant/80">{fee.note}</p>
                <a
                  href={fee.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-caption text-caption text-primary underline hover:no-underline"
                >
                  Source
                </a>
              </div>
              <div className="text-right">
                <p className="font-headline-md text-headline-md text-on-surface">
                  {formatPreciseCurrency(fee.amount, fee.currency)}
                </p>
              </div>
            </div>
          ))}

          {unverified.map((u) => (
            <div
              key={u.slug}
              className="flex flex-col gap-sm rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-lowest/50 p-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-body-md text-body-md font-semibold text-on-surface">
                  {flagFor(u.country)} {u.name}
                </p>
                <p className="font-caption text-caption text-on-surface-variant">
                  Not yet verified — check the official site
                </p>
              </div>
              <a
                href={u.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant px-md py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                Official site
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          ))}
        </div>

        {/* Subtotals by currency — never summed across currencies */}
        {byCurrency.size > 0 && (
          <div className="mt-md rounded-xl bg-primary p-lg text-on-primary shadow-lg">
            <p className="font-label-md text-label-md opacity-80">Application fee subtotals</p>
            <p className="mt-1 flex flex-wrap gap-x-md gap-y-1 font-headline-md text-headline-md">
              {Array.from(byCurrency.entries()).map(([currency, total]) => (
                <span key={currency}>
                  {currency} schools: {formatPreciseCurrency(total, currency)}
                </span>
              ))}
            </p>
            <p className="mt-2 font-caption text-caption opacity-80">
              Kept separate by currency on purpose — adding different currencies together would give
              a meaningless number.
            </p>
          </div>
        )}

        {needsCSSProfile && (
          <div className="mt-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              CSS Profile: {formatPreciseCurrency(cssProfileTotalUSD, "USD")}
            </p>
            <p className="font-caption text-caption text-on-surface-variant">
              {cssProfileSchoolCount} of your shortlisted schools require it — first school{" "}
              {formatPreciseCurrency(cssProfile.firstSchoolFeeUSD, "USD")}, then{" "}
              {formatPreciseCurrency(cssProfile.additionalSchoolFeeUSD, "USD")} per additional school.
            </p>
            <a
              href={cssProfile.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-caption text-caption text-primary underline hover:no-underline"
            >
              Source
            </a>
          </div>
        )}
      </section>

      {/* Testing costs */}
      <section className="mb-xl rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <h2 className="mb-xs font-headline-md text-headline-md text-on-surface">Testing costs</h2>
        <p className="mb-md font-caption text-caption text-on-surface-variant">
          Check the tests you still need to take. Defaults are based on scores already in your
          academic profile.
        </p>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          {testFees.map((t) => (
            <label
              key={t.key}
              className="flex cursor-pointer items-start gap-sm rounded-lg border border-outline-variant/40 p-sm hover:border-primary"
            >
              <input
                type="checkbox"
                checked={selectedTests.has(t.key)}
                onChange={() => toggleTest(t.key)}
                className="mt-1 accent-primary"
              />
              <span className="flex-1">
                <span className="flex items-center justify-between gap-sm">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    {t.test}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">
                    ~{formatPreciseCurrency(t.typicalFeeUSD, "USD")}
                  </span>
                </span>
                <span className="mt-1 block font-caption text-caption text-on-surface-variant">
                  {t.notes}
                </span>
                <a
                  href={t.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-caption text-caption text-primary underline hover:no-underline"
                >
                  Source
                </a>
              </span>
            </label>
          ))}
        </div>

        {testingTotalUSD > 0 && (
          <div className="mt-md rounded-lg bg-surface-container-low p-md">
            <p className="font-body-md text-body-md font-semibold text-on-surface">
              Testing subtotal: ~{formatPreciseCurrency(testingTotalUSD, "USD")}
            </p>
            <p className="font-caption text-caption text-on-surface-variant">
              Approximate — several of these fees vary by country. Confirm the exact price for your
              location before paying.
            </p>
          </div>
        )}
      </section>

      {/* Waiver guidance */}
      <section className="mb-xl rounded-xl border border-primary/30 bg-secondary-container/40 p-lg">
        <h2 className="mb-sm flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <span className="material-symbols-outlined text-primary">volunteer_activism</span>
          Getting these fees waived
        </h2>
        <p className="font-body-md text-body-md text-on-surface">{waiverGuidance}</p>
      </section>

      {/* Sources */}
      <details className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <summary className="cursor-pointer font-body-md text-body-md font-semibold text-on-surface">
          Sources ({sourcesUsed.length})
        </summary>
        <ul className="mt-sm space-y-1">
          {sourcesUsed.map(([url, label]) => (
            <li key={url} className="font-caption text-caption">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                {label}
              </a>
              <span className="text-on-surface-variant"> — {url}</span>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
