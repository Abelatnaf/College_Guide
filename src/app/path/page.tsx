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
import { Icon } from "@/components/ui/Icon";
import { upcomingDeadlines, deadlineDate } from "@/lib/deadlines";
import { daysUntil } from "@/lib/ics";
import { summarizeApplicationFees } from "@/lib/costSummary";
import { aidSummaryLine } from "@/lib/aidSummary";
import { STATUS_META } from "@/lib/applicationMeta";
import type { AcademicProfile, Application } from "@/lib/storage/types";
import type { University } from "@/types";

/** Fields the profile page actually lets a student fill in — used for the completeness meter. */
const PROFILE_FIELD_KEYS: (keyof AcademicProfile)[] = ["gpa", "sat", "act", "toefl", "ielts", "intendedMajor"];

interface NextAction {
  icon: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

interface SchoolCard {
  app: Application;
  university: University;
  date: Date | null;
  days: number | null;
}

export default function PathPage() {
  const { profile, hasProfile, hydrated: profileHydrated } = useAcademicProfile();
  const { shortlist, hydrated: shortlistHydrated } = useShortlist();
  const {
    applications,
    addApplication,
    toggleChecklistItem,
    hydrated: applicationsHydrated,
  } = useApplications();

  const hydrated = profileHydrated && shortlistHydrated && applicationsHydrated;

  const filledCount = PROFILE_FIELD_KEYS.filter((k) => profile[k] != null).length;
  const completeness = Math.round((filledCount / PROFILE_FIELD_KEYS.length) * 100);

  const untracked = shortlist
    .map((s) => ({ item: s, university: getUniversityBySlug(s.slug) }))
    .filter(
      (x): x is { item: typeof x.item; university: University } =>
        Boolean(x.university) && !applications.some((a) => a.slug === x.item.slug),
    );

  const schoolCards: SchoolCard[] = applications
    .map((app) => {
      const university = getUniversityBySlug(app.slug);
      if (!university) return null;
      const date = deadlineDate(app);
      return { app, university, date, days: date ? daysUntil(date) : null };
    })
    .filter((x): x is SchoolCard => x !== null)
    .sort((a, b) => {
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return a.university.name.localeCompare(b.university.name);
    });

  const weekAhead = upcomingDeadlines(applications, 6);
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
      title: `Start tracking ${untracked.length} shortlisted ${untracked.length === 1 ? "school" : "schools"}`,
      body: "Open a folder for each so deadlines and checklists show up here.",
      href: "/shortlist",
      cta: "Go to shortlist",
    });
  }
  const noDeadline = applications.filter((a) => deadlineDate(a) == null);
  if (noDeadline.length > 0) {
    actions.push({
      icon: "event",
      title: `Set a deadline for ${noDeadline.length} ${noDeadline.length === 1 ? "application" : "applications"}`,
      body: "Add the exact date so this week's timeline and reminders are accurate.",
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
  const [topAction, ...restActions] = actions;

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="folder_open"
        title="Command Center"
        description={
          hydrated && hasProfile
            ? "Every school, organized by folder — what's due, what's next, and how each one is tracking."
            : "Add your scores and build a shortlist to open your first folder."
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
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        )}
      </div>

      {/* Handwritten mentor note — the single highest-priority thing to do next */}
      {hydrated && topAction && (
        <div className="mb-lg flex items-start gap-md border-l-[3px] border-error bg-surface-container-lowest p-md">
          <Icon name="edit" className="mt-0.5 shrink-0 text-error" />
          <div>
            <p className="font-hand text-[22px] leading-snug text-error">
              {topAction.body} — {topAction.title.toLowerCase()} first.
            </p>
            <Link
              href={topAction.href}
              className="mt-1 inline-flex items-center gap-1 font-label-md text-caption text-primary hover:underline"
            >
              {topAction.cta}
              <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>
        </div>
      )}

      {/* This week, across every tracked school */}
      {hydrated && weekAhead.length > 0 && (
        <section className="mb-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
          <h2 className="mb-lg font-headline-md text-headline-md text-on-surface">
            This week, across your folders
          </h2>
          <div className="overflow-x-auto pb-sm">
            <div className="relative flex min-w-[560px] gap-0 border-t-2 border-dotted border-outline pt-sm">
              {weekAhead.map(({ application, university, daysUntil: days }) => (
                <Link
                  key={application.slug}
                  href={`/universities/${university.slug}`}
                  className="group relative flex-1 px-sm first:pl-0"
                >
                  <span
                    className={`absolute -top-[9px] left-sm h-3.5 w-3.5 rounded-full border-2 bg-surface-container-lowest ${
                      days <= 7 ? "border-error" : "border-primary"
                    }`}
                  />
                  <p className="mt-sm font-caption text-caption text-on-surface-variant group-hover:text-primary">
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                  </p>
                  <p className="font-label-md text-label-md text-on-surface group-hover:text-primary">
                    {university.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="space-y-md lg:col-span-2">
          {!hydrated ? (
            <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
          ) : schoolCards.length === 0 && untracked.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
              <Icon name="folder_open" className="mb-md text-[48px] text-outline" />
              <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
                No folders open yet
              </h3>
              <p className="mb-md max-w-md text-body-md text-on-surface-variant">
                Save a school to your shortlist and it&apos;ll get its own folder here — deadline,
                checklist, and aid info, all in one place.
              </p>
              <Link
                href="/universities"
                className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
              >
                Browse universities
              </Link>
            </div>
          ) : (
            <>
              {schoolCards.map((card) => (
                <SchoolFolderCard
                  key={card.app.slug}
                  card={card}
                  onToggleItem={(id) => toggleChecklistItem(card.app.slug, id)}
                />
              ))}
              {untracked.map(({ item, university }) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-md rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest/60 p-md"
                >
                  <div>
                    <Link
                      href={`/universities/${university.slug}`}
                      className="font-label-md text-on-surface hover:text-primary"
                    >
                      {university.name}
                    </Link>
                    <p className="font-caption text-caption text-on-surface-variant">
                      On your shortlist — not tracked yet
                    </p>
                  </div>
                  <button
                    onClick={() => addApplication(university.slug)}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon name="create_new_folder" className="text-[18px]" />
                    Open folder
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="space-y-lg">
          {/* Suggested next steps */}
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h2 className="mb-md font-headline-md text-headline-md text-on-surface">Suggested next steps</h2>
            {!hydrated ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            ) : actions.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                You&apos;re all caught up — check back as deadlines approach.
              </p>
            ) : restActions.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                That note above is the one thing to do next.
              </p>
            ) : (
              <div className="space-y-sm">
                {restActions.map((a) => (
                  <Link
                    key={a.href + a.title}
                    href={a.href}
                    className="block rounded-lg border border-outline-variant/30 p-md transition-colors hover:border-primary"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Icon name={a.icon} className="text-primary" />
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
              <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function SchoolFolderCard({
  card,
  onToggleItem,
}: {
  card: SchoolCard;
  onToggleItem: (itemId: string) => void;
}) {
  const { app, university, days } = card;
  const aid = getAidPolicy(university.slug);
  const doneCount = app.checklist.filter((c) => c.done).length;
  const visibleItems = app.checklist.slice(0, 5);
  const overflow = app.checklist.length - visibleItems.length;

  return (
    <div className="dogear overflow-hidden border border-outline-variant/30 bg-surface-container-lowest">
      <div className="p-md sm:p-lg">
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
          <div className="flex flex-wrap items-center gap-xs">
            <ChanceBadge slug={university.slug} showEstimate />
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-label-md text-caption ${STATUS_META[app.status].classes}`}
            >
              {STATUS_META[app.status].label}
            </span>
          </div>
        </div>

        <p
          className={`dotted-rule mb-md inline-block pb-1 font-label-md text-label-md ${
            days == null
              ? "text-on-surface-variant"
              : days < 0
                ? "text-error"
                : days <= 7
                  ? "text-error"
                  : "text-on-surface-variant"
          }`}
        >
          {days == null
            ? "No deadline set"
            : days < 0
              ? "Deadline passed"
              : days === 0
                ? "Due today"
                : days === 1
                  ? "Due tomorrow"
                  : `Due in ${days} days`}
        </p>

        {app.checklist.length > 0 && (
          <div className="mb-md">
            <p className="mb-xs font-caption text-caption text-on-surface-variant">
              {doneCount} of {app.checklist.length} tasks done
            </p>
            <ul className="space-y-1.5">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className="group flex w-full items-start gap-2 text-left"
                  >
                    <span
                      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-2 ${
                        item.done ? "border-tertiary bg-tertiary" : "border-outline-variant"
                      }`}
                    >
                      {item.done && (
                        <Icon name="check" className="text-[14px] text-on-tertiary" />
                      )}
                    </span>
                    <span
                      className={`font-body-md text-body-md ${
                        item.done ? "text-on-surface-variant line-through" : "text-on-surface"
                      } group-hover:text-primary`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {overflow > 0 && (
              <p className="mt-1.5 font-caption text-caption text-on-surface-variant">+{overflow} more</p>
            )}
          </div>
        )}

        {aid && (
          <p className="mb-md font-caption text-caption text-on-surface-variant">{aidSummaryLine(aid)}</p>
        )}

        <div className="flex flex-wrap gap-md border-t border-outline-variant/30 pt-sm">
          <Link href="/applications" className="font-label-md text-caption text-primary hover:underline">
            Manage full checklist →
          </Link>
          <Link href="/essays" className="font-label-md text-caption text-primary hover:underline">
            Draft an essay →
          </Link>
        </div>
      </div>
    </div>
  );
}
