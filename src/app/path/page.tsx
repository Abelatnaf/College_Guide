"use client";

import Link from "next/link";
import { getUniversityBySlug } from "@/data/universities";
import { getAidPolicy } from "@/data/aidPolicy";
import { flagFor } from "@/data/flags";
import { formatCurrency } from "@/lib/utils";
import {
  useAcademicProfile,
  useApplications,
  useShortlist,
} from "@/components/providers/StorageProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChanceBadge } from "@/components/ui/ChanceBadge";
import { upcomingDeadlines } from "@/lib/deadlines";
import { summarizeApplicationFees } from "@/lib/costSummary";
import { aidSummaryLine } from "@/lib/aidSummary";
import type { AcademicProfile } from "@/lib/storage/types";

/** Fields the profile page actually lets a student fill in — used for the completeness meter. */
const PROFILE_FIELD_KEYS: (keyof AcademicProfile)[] = ["gpa", "sat", "act", "toefl", "ielts", "intendedMajor"];

interface NextAction {
  icon: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

export default function PathPage() {
  const { profile, hasProfile, hydrated: profileHydrated } = useAcademicProfile();
  const { shortlist, hydrated: shortlistHydrated } = useShortlist();
  const { applications, hydrated: applicationsHydrated } = useApplications();

  const hydrated = profileHydrated && shortlistHydrated && applicationsHydrated;

  const filledCount = PROFILE_FIELD_KEYS.filter((k) => profile[k] != null).length;
  const completeness = Math.round((filledCount / PROFILE_FIELD_KEYS.length) * 100);

  const shortlistItems = shortlist
    .map((s) => ({ item: s, university: getUniversityBySlug(s.slug) }))
    .filter(
      (x): x is { item: typeof x.item; university: NonNullable<typeof x.university> } =>
        Boolean(x.university),
    );

  const untracked = shortlist.filter((s) => !applications.some((a) => a.slug === s.slug));
  const trackedNoCustomDeadline = applications.filter((a) => a.deadline == null);
  const deadlines = upcomingDeadlines(applications, 3);
  const { unverified: unverifiedFees, byCurrency } = summarizeApplicationFees(
    shortlist.map((s) => s.slug),
  );

  // Rule-based next actions, in priority order — no AI, just what the student's own data implies.
  const actions: NextAction[] = [];
  if (!hasProfile) {
    actions.push({
      icon: "person",
      title: "Add your scores",
      body: "Enter your GPA and test scores to get personalized admission-chance estimates.",
      href: "/profile",
      cta: "Complete profile",
    });
  }
  if (shortlist.length === 0) {
    actions.push({
      icon: "explore",
      title: "Build a shortlist",
      body: "Browse the directory and save universities you're considering.",
      href: "/universities",
      cta: "Browse universities",
    });
  } else if (untracked.length > 0) {
    actions.push({
      icon: "add_task",
      title: `Track ${untracked.length} shortlisted ${untracked.length === 1 ? "school" : "schools"}`,
      body: "Move them into your application tracker to manage deadlines and checklists.",
      href: "/shortlist",
      cta: "Go to shortlist",
    });
  }
  if (trackedNoCustomDeadline.length > 0) {
    actions.push({
      icon: "event",
      title: `Set a deadline for ${trackedNoCustomDeadline.length} ${trackedNoCustomDeadline.length === 1 ? "application" : "applications"}`,
      body: "Add the exact date so reminders and calendar exports are accurate.",
      href: "/applications",
      cta: "Go to tracker",
    });
  }
  if (shortlist.length >= 2) {
    actions.push({
      icon: "compare_arrows",
      title: "Compare your top choices",
      body: "See tuition, acceptance rate, and aid policy side by side.",
      href: "/compare",
      cta: "Compare schools",
    });
  }
  if (hasProfile || shortlist.length > 0) {
    actions.push({
      icon: "edit_note",
      title: "Start drafting your essays",
      body: "Get a head start with generic prompt shapes and structured AI feedback.",
      href: "/essays",
      cta: "Go to Essay Hub",
    });
  }

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="explore"
        title="My Path"
        description={
          hydrated && hasProfile
            ? "Your mission control — deadlines, shortlist, and costs, all in one place."
            : "Add your scores and build a shortlist to unlock personalized guidance."
        }
      />

      {/* Profile completeness */}
      <div className="mb-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
        <div className="mb-sm flex items-center justify-between">
          <p className="font-label-md text-on-surface">Profile completeness</p>
          <p className="font-label-md text-primary">{hydrated ? `${completeness}%` : "…"}</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${hydrated ? completeness : 0}%` }}
          />
        </div>
        {hydrated && completeness < 100 && (
          <Link
            href="/profile"
            className="mt-sm inline-flex items-center gap-1 font-label-md text-primary hover:underline"
          >
            Finish your profile
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="space-y-lg lg:col-span-2">
          {/* Next deadlines */}
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <div className="mb-md flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Next deadlines</h2>
              {applications.length > 0 && (
                <div className="flex items-center gap-md">
                  <Link href="/calendar" className="font-label-md text-primary hover:underline">
                    Calendar
                  </Link>
                  <Link href="/applications" className="font-label-md text-primary hover:underline">
                    View all
                  </Link>
                </div>
              )}
            </div>
            {!hydrated ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            ) : deadlines.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {applications.length === 0
                  ? "Track an application to see its deadline here."
                  : "No upcoming deadlines — set a date on a tracked application to see it here."}
              </p>
            ) : (
              <div className="space-y-sm">
                {deadlines.map(({ application, university, daysUntil: days }) => (
                  <Link
                    key={application.slug}
                    href={`/universities/${university.slug}`}
                    className="flex items-center justify-between rounded-lg border border-outline-variant/30 p-md transition-colors hover:border-primary"
                  >
                    <div>
                      <p className="font-label-md text-on-surface">{university.name}</p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {flagFor(university.country)} {university.city}, {university.country}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 font-caption text-caption font-semibold ${
                        days <= 7
                          ? "bg-[#fde3e1] text-[#b3261e] dark:bg-[#b3261e]/25 dark:text-[#f5b4ae]"
                          : "bg-secondary-container text-on-secondary-container"
                      }`}
                    >
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Shortlist snapshot */}
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <div className="mb-md flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Shortlist snapshot</h2>
              {shortlist.length > 0 && (
                <Link href="/shortlist" className="font-label-md text-primary hover:underline">
                  View all
                </Link>
              )}
            </div>
            {!hydrated ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            ) : shortlistItems.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Your shortlist is empty.{" "}
                <Link href="/universities" className="text-primary hover:underline">
                  Browse universities
                </Link>{" "}
                to start building one.
              </p>
            ) : (
              <div className="space-y-sm">
                {shortlistItems.slice(0, 5).map(({ university }) => {
                  const aid = getAidPolicy(university.slug);
                  return (
                    <div key={university.slug} className="rounded-lg border border-outline-variant/30 p-md">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-sm">
                        <Link
                          href={`/universities/${university.slug}`}
                          className="font-label-md text-on-surface hover:text-primary"
                        >
                          {university.name}
                        </Link>
                        <ChanceBadge slug={university.slug} showEstimate />
                      </div>
                      {aid && (
                        <p className="font-caption text-caption text-on-surface-variant">
                          {aidSummaryLine(aid)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-lg">
          {/* Suggested next actions */}
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h2 className="mb-md font-headline-md text-headline-md text-on-surface">Suggested next steps</h2>
            {!hydrated ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            ) : actions.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                You&apos;re all caught up — check back as deadlines approach.
              </p>
            ) : (
              <div className="space-y-sm">
                {actions.map((a) => (
                  <Link
                    key={a.href + a.title}
                    href={a.href}
                    className="block rounded-lg border border-outline-variant/30 p-md transition-colors hover:border-primary"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">{a.icon}</span>
                      <p className="font-label-md text-on-surface">{a.title}</p>
                    </div>
                    <p className="mb-2 font-caption text-caption text-on-surface-variant">{a.body}</p>
                    <span className="font-label-md text-primary">{a.cta} →</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Cost snapshot */}
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h2 className="mb-md font-headline-md text-headline-md text-on-surface">Cost snapshot</h2>
            {!hydrated ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            ) : shortlist.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Add schools to your shortlist to see application costs.
              </p>
            ) : byCurrency.size === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                No verified application fees yet for your shortlisted schools.
              </p>
            ) : (
              <div className="space-y-1">
                {Array.from(byCurrency.entries()).map(([currency, total]) => (
                  <p key={currency} className="font-label-md text-on-surface">
                    {formatCurrency(total, currency)}{" "}
                    <span className="font-caption text-caption text-on-surface-variant">
                      application fees ({currency})
                    </span>
                  </p>
                ))}
              </div>
            )}
            {hydrated && unverifiedFees.length > 0 && (
              <p className="mt-sm font-caption text-caption text-on-surface-variant">
                {unverifiedFees.length} shortlisted {unverifiedFees.length === 1 ? "school has" : "schools have"}{" "}
                no verified fee yet.
              </p>
            )}
            <Link
              href="/cost-to-apply"
              className="mt-sm inline-flex items-center gap-1 font-label-md text-primary hover:underline"
            >
              Full cost breakdown
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
