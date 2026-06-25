"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Major, University } from "@/types";
import { flagFor } from "@/data/flags";
import { majors } from "@/data/majors";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  getAdmissionsTier,
  getApplicationTimeline,
  getCostBreakdown,
  getFAQs,
  getWhyChooseBullets,
  type PercentileContext,
} from "@/lib/universityInsights";
import { UniversityPrintDocument } from "./UniversityPrintDocument";
import { ShortlistButton } from "@/components/ui/ShortlistButton";
import { ChanceBadge } from "@/components/ui/ChanceBadge";
import { CostRoiPanel } from "@/components/ui/CostRoiPanel";
import { TrackApplicationButton } from "@/components/ui/TrackApplicationButton";

const FILL_1 = { fontVariationSettings: "'FILL' 1" } as const;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "majors", label: "Majors Offered" },
  { id: "tuition", label: "Tuition & Fees" },
  { id: "roi", label: "Cost & ROI" },
  { id: "scholarships", label: "Scholarships" },
  { id: "admissions", label: "Admissions" },
  { id: "campus", label: "Campus Life" },
  { id: "deadlines", label: "Deadlines" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const iconFor = (majorName: string) =>
  majors.find((m) => m.name === majorName)?.icon ?? "menu_book";

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-caption text-caption opacity-80">{label}</p>
      <p className="font-headline-md text-headline-md">{value}</p>
    </div>
  );
}

function Bar({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="font-label-md text-label-md">{label}</span>
        <span className="font-label-md text-label-md text-primary">{percent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-surface-container-low">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function UniversityDetail({
  university: u,
  similar,
  percentile,
  majorDetails,
}: {
  university: University;
  similar: University[];
  percentile: PercentileContext;
  majorDetails: Major[];
}) {
  const [tab, setTab] = useState<TabId>("overview");

  const domain = (() => {
    try {
      return new URL(u.website).hostname.replace(/^www\./, "");
    } catch {
      return "admissions.edu";
    }
  })();
  const mailto = `mailto:admissions@${domain}?subject=${encodeURIComponent(
    `Request for Information — ${u.name}`,
  )}&body=${encodeURIComponent(
    `Hello ${u.name} Admissions Team,\n\nI'd like to receive more information about applying to your programs.\n\nThank you!`,
  )}`;

  const whyChoose = getWhyChooseBullets(u);
  const faqs = getFAQs(u);
  const admissions = getAdmissionsTier(u);
  const cost = getCostBreakdown(u);
  const timeline = getApplicationTimeline(u);

  return (
    <>
    <main className="no-print mx-auto max-w-container-max px-md py-lg md:px-lg">
      {/* Hero */}
      <section className="relative mb-lg overflow-hidden rounded-xl">
        <div className="relative h-64 w-full md:h-[400px]">
          <Image
            className="object-cover"
            alt={`${u.name} campus`}
            src={u.bannerImage}
            fill
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <button
          onClick={() => window.print()}
          className="absolute right-lg top-lg flex items-center gap-2 rounded-lg bg-white/95 px-lg py-sm font-label-md text-label-md font-semibold text-primary shadow-lg transition-all hover:bg-primary hover:text-on-primary"
        >
          <span className="material-symbols-outlined">download</span>
          Download Detailed Profile
        </button>
        <div className="absolute bottom-0 left-0 flex w-full flex-col items-start gap-md p-lg md:flex-row md:items-end">
          <div className="rounded-xl border border-outline-variant bg-white p-2 shadow-lg">
            <Image
              className="h-20 w-20 rounded-lg object-cover md:h-28 md:w-28"
              alt={`${u.name} logo`}
              src={u.logoImage}
              width={112}
              height={112}
            />
          </div>
          <div className="flex-1 pb-1">
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-white md:font-headline-xl md:text-headline-xl">
              {u.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 font-label-md text-caption text-on-primary">
                #{u.globalRanking} Worldwide
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 font-label-md text-caption text-white backdrop-blur-md">
                {flagFor(u.country)} {u.city}, {u.country}
              </span>
              <ChanceBadge slug={u.slug} showWithoutProfile showEstimate />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky tabs */}
      <div className="sticky top-20 z-30 mb-lg overflow-x-auto border-b border-outline-variant bg-surface">
        <nav className="flex min-w-max gap-lg">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "border-b-2 border-primary px-2 pb-4 font-label-md text-label-md font-semibold text-primary"
                  : "px-2 pb-4 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Panels */}
      {tab === "overview" && (
        <div className="space-y-gutter">
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="space-y-gutter lg:col-span-8">
            <article className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <h2 className="mb-md font-headline-lg text-headline-lg text-primary">
                About {u.name}
              </h2>
              <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                {u.description}
              </p>
              <div className="mt-md flex flex-wrap gap-2">
                {u.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary-container px-3 py-1 font-caption text-caption text-on-secondary-container"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <h3 className="mb-md font-headline-md text-headline-md">
                Why Students Choose {u.name}
              </h3>
              <ul className="space-y-sm">
                {whyChoose.map((b) => (
                  <li key={b} className="flex items-start gap-sm">
                    <span
                      className="material-symbols-outlined mt-0.5 text-primary"
                      style={FILL_1}
                    >
                      task_alt
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                <h3 className="mb-md font-headline-md text-headline-md">Selectivity</h3>
                <div className="space-y-md">
                  <Bar label="Acceptance Rate" percent={u.acceptanceRate} />
                  <Bar label="Students on Aid" percent={u.financialAid} />
                </div>
                <p className="mt-md font-caption text-caption text-on-surface-variant">
                  More selective than ~{percentile.selectivityPercentile}% and ranked better
                  than ~{percentile.rankPercentile}% of the {percentile.totalCompared} schools
                  in our directory.
                </p>
              </div>
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                <h3 className="mb-md font-headline-md text-headline-md">At a Glance</h3>
                <ul className="space-y-sm font-body-md text-body-md text-on-surface-variant">
                  <li className="flex justify-between">
                    <span>Established</span>
                    <span className="font-semibold text-on-surface">{u.established}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Region</span>
                    <span className="font-semibold text-on-surface">{u.region}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Faculty Ratio</span>
                    <span className="font-semibold text-on-surface">{u.facultyRatio}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Website</span>
                    <a
                      href={u.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      Visit ↗
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-gutter lg:col-span-4">
            <div className="rounded-xl bg-primary p-lg text-on-primary shadow-lg">
              <h3 className="mb-lg border-b border-white/20 pb-2 font-headline-md text-headline-md">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-md">
                <StatBlock label="Student Pop." value={formatNumber(u.studentPopulation)} />
                <StatBlock label="Faculty Ratio" value={u.facultyRatio} />
                <StatBlock label="Avg. Class Size" value={String(u.avgClassSize)} />
                <StatBlock label="Financial Aid" value={`${u.financialAid}%`} />
              </div>
            </div>
            <div className="rounded-xl border-2 border-primary bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <h3 className="mb-sm font-headline-md text-headline-md">Ready to start?</h3>
              <p className="mb-md text-body-md text-on-surface-variant">
                Save this school, track your application, or request full requirements by email.
              </p>
              <ShortlistButton slug={u.slug} variant="full" className="mb-3" />
              <TrackApplicationButton slug={u.slug} className="mb-3" />
              <a
                href={mailto}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-on-primary transition-all hover:bg-primary-container"
              >
                Request Info <span className="material-symbols-outlined">send</span>
              </a>
              <Link
                href="/compare"
                className="flex w-full items-center justify-center rounded-lg bg-secondary-container py-3 font-bold text-primary transition-all hover:bg-outline-variant/20"
              >
                Compare Schools
              </Link>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <h3 className="mb-md font-headline-md text-headline-md">Similar Universities</h3>
              <div className="space-y-sm">
                {similar.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/universities/${s.slug}`}
                    className="flex items-center justify-between gap-sm rounded-lg border border-outline-variant/30 p-sm transition-colors hover:border-primary"
                  >
                    <div>
                      <p className="font-body-md text-body-md font-semibold">{s.name}</p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {flagFor(s.country)} {s.country} · #{s.globalRanking}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <article className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <h3 className="mb-md font-headline-md text-headline-md">Frequently Asked Questions</h3>
          <div className="divide-y divide-outline-variant/40">
            {faqs.map((f) => (
              <details key={f.q} className="py-3">
                <summary className="cursor-pointer font-body-md text-body-md font-semibold text-on-surface">
                  {f.q}
                </summary>
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{f.a}</p>
              </details>
            ))}
          </div>
        </article>
        </div>
      )}

      {tab === "majors" && (
        <div>
          <h2 className="mb-md font-headline-md text-headline-md">Majors Offered</h2>
          <p className="mb-lg font-body-md text-body-md text-on-surface-variant">
            {u.name} offers {u.majorsOffered.length} broad fields of study, each cross-referenced
            below with salary and career outcomes from our Major Explorer.
          </p>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
            {u.majorsOffered.map((m) => {
              const detail = majors.find((mm) => mm.name === m);
              return (
                <Link
                  key={m}
                  href="/majors"
                  className="flex flex-col gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-primary">
                      <span className="material-symbols-outlined">{iconFor(m)}</span>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md font-semibold">{m}</p>
                      {detail && (
                        <p className="font-caption text-caption text-primary">
                          {detail.avgStartingSalary} avg. starting salary
                        </p>
                      )}
                    </div>
                  </div>
                  {detail && (
                    <p className="font-caption text-caption text-on-surface-variant">
                      Careers: {detail.careerPaths.slice(0, 3).join(", ")}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {tab === "tuition" && (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <div className="space-y-gutter lg:col-span-1">
            <div className="rounded-xl bg-primary p-lg text-on-primary shadow-lg">
              <p className="font-label-md text-label-md opacity-80">Annual Tuition</p>
              <p className="mt-1 font-headline-xl text-headline-xl">
                {formatCurrency(u.annualTuition, u.currency)}
              </p>
              <p className="mt-2 font-caption text-caption opacity-80">
                Per year, in {u.currency}
              </p>
            </div>
            <div className="rounded-xl border-2 border-primary bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <p className="font-label-md text-label-md text-on-surface-variant">
                Est. Net Price (after aid)
              </p>
              <p className="mt-1 font-headline-lg text-headline-lg text-primary">
                {formatCurrency(cost.estimatedNetPrice, u.currency)}
              </p>
              <p className="mt-2 font-caption text-caption text-on-surface-variant">
                4-year total before aid: {formatCurrency(cost.fourYearTotal, u.currency)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2">
            <h3 className="mb-md font-headline-md text-headline-md">Full Cost of Attendance</h3>
            <ul className="divide-y divide-outline-variant/40 font-body-md text-body-md">
              <li className="flex justify-between py-3">
                <span className="text-on-surface-variant">Tuition</span>
                <span className="font-semibold">{formatCurrency(cost.tuition, u.currency)}</span>
              </li>
              <li className="flex justify-between py-3">
                <span className="text-on-surface-variant">Est. Housing & Living</span>
                <span className="font-semibold">{formatCurrency(cost.housing, u.currency)}</span>
              </li>
              <li className="flex justify-between py-3">
                <span className="text-on-surface-variant">Books & Supplies</span>
                <span className="font-semibold">
                  {formatCurrency(cost.booksAndSupplies, u.currency)}
                </span>
              </li>
              <li className="flex justify-between py-3">
                <span className="text-on-surface-variant">Personal Expenses</span>
                <span className="font-semibold">
                  {formatCurrency(cost.personalExpenses, u.currency)}
                </span>
              </li>
              <li className="flex justify-between py-3">
                <span className="font-semibold text-on-surface">Total Cost of Attendance</span>
                <span className="font-bold text-primary">
                  {formatCurrency(cost.totalCostOfAttendance, u.currency)}
                </span>
              </li>
              <li className="flex justify-between py-3">
                <span className="text-on-surface-variant">Est. Average Grant / Aid</span>
                <span className="font-semibold text-primary">
                  - {formatCurrency(cost.estimatedAverageGrant, u.currency)}
                </span>
              </li>
              <li className="flex justify-between py-3">
                <span className="text-on-surface-variant">Students Receiving Aid</span>
                <span className="font-semibold text-primary">{u.financialAid}%</span>
              </li>
            </ul>
            <p className="mt-md rounded-lg bg-surface-container-low p-md font-caption text-caption text-on-surface-variant">
              Figures are estimates for international students. Financial aid can
              significantly reduce the net cost — see the Scholarships tab, or download the
              full detailed profile for a complete breakdown.
            </p>
          </div>
        </div>
      )}

      {tab === "roi" && <CostRoiPanel university={u} />}

      {tab === "scholarships" && (
        <div>
          <div className="mb-lg flex items-center gap-sm">
            <span
              className={`material-symbols-outlined ${u.scholarships.available ? "text-primary" : "text-outline"}`}
              style={FILL_1}
            >
              {u.scholarships.available ? "verified" : "do_not_disturb_on"}
            </span>
            <h2 className="font-headline-md text-headline-md">
              {u.scholarships.available
                ? "Scholarships Available"
                : "No Scholarships Listed"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            {u.scholarships.types.map((s) => (
              <div
                key={s}
                className="flex items-center gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container/10 text-primary">
                  <span className="material-symbols-outlined" style={FILL_1}>
                    card_membership
                  </span>
                </div>
                <div>
                  <p className="font-body-md text-body-md font-semibold">{s}</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {u.financialAid}% of students receive aid
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "admissions" && (
        <div className="space-y-gutter">
          <div className="rounded-xl border-2 border-primary bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-sm">
              <h3 className="font-headline-md text-headline-md">
                Admissions — {admissions.label}
              </h3>
              <span className="rounded-full bg-primary px-3 py-1 font-label-md text-caption text-on-primary">
                {u.acceptanceRate}% acceptance rate
              </span>
            </div>
            <p className="mt-md font-body-md text-body-md text-on-surface-variant">
              {admissions.blurb}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <h3 className="mb-md font-headline-md text-headline-md">Admission Snapshot</h3>
              <div className="space-y-md">
                <Bar label="Acceptance Rate" percent={u.acceptanceRate} />
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-md">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Application Deadline
                  </span>
                  <span className="font-label-md text-primary">{u.applicationDeadline}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-md">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Avg. Class Size
                  </span>
                  <span className="font-label-md text-primary">{u.avgClassSize}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-md">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Letters of Recommendation
                  </span>
                  <span className="font-label-md text-primary">
                    {admissions.recommendationLetters}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-md">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Required Essays
                  </span>
                  <span className="font-label-md text-primary">{admissions.essays}</span>
                </div>
              </div>
              <p className="mt-md font-caption text-caption text-on-surface-variant">
                {admissions.testGuidance}
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              <h3 className="mb-md font-headline-md text-headline-md">Application Checklist</h3>
              <ul className="space-y-sm">
                {admissions.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-sm">
                    <span
                      className="material-symbols-outlined mt-0.5 text-primary"
                      style={FILL_1}
                    >
                      check_circle
                    </span>
                    <span className="font-body-md text-body-md">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "campus" && (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <div className="relative h-64 w-full overflow-hidden rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <Image
              className="object-cover"
              alt={`${u.name} student life`}
              src={u.bannerImage}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="mb-md font-headline-md text-headline-md">Campus Life</h2>
            <p className="mb-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              {u.campusLife}
            </p>
            <div className="flex flex-wrap gap-2">
              {u.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary-container px-3 py-1 font-caption text-caption text-on-secondary-container"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "deadlines" && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border-2 border-primary bg-surface-container-lowest p-lg text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <span className="material-symbols-outlined text-[48px] text-primary" style={FILL_1}>
              event_available
            </span>
            <p className="mt-sm font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              Application Deadline
            </p>
            <p className="font-headline-xl text-headline-xl text-primary">
              {u.applicationDeadline}
            </p>
            <p className="mt-md font-body-md text-body-md text-on-surface-variant">
              Submit all materials by this date. We recommend applying at least two weeks
              early to allow time for transcripts and recommendations to arrive.
            </p>
            <a
              href={mailto}
              className="mt-lg inline-block rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Request Deadline Details
            </a>
          </div>

          <div className="mt-gutter rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <h3 className="mb-md font-headline-md text-headline-md">Suggested Timeline</h3>
            <ol className="space-y-md">
              {timeline.map((t, i) => (
                <li key={t.stage} className="flex gap-md">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-label-md text-label-md text-on-primary">
                      {i + 1}
                    </span>
                    {i < timeline.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-outline-variant" />
                    )}
                  </div>
                  <div className="pb-md">
                    <p className="font-label-md text-label-md text-primary">{t.stage}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {t.action}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </main>
    <UniversityPrintDocument
      university={u}
      similar={similar}
      percentile={percentile}
      majorDetails={majorDetails}
    />
    </>
  );
}
