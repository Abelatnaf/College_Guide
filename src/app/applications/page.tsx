"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import {
  useApplications,
  useShortlist,
} from "@/components/providers/StorageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
} from "@/lib/storage/types";
import { STATUS_META, STATUS_ORDER } from "@/lib/applicationMeta";
import { buildDeadlineIcs, daysUntil, downloadIcs, parseDeadline } from "@/lib/ics";
import { CampusGraphic } from "@/components/ui/CampusGraphic";

export default function ApplicationsPage() {
  const {
    applications,
    setApplicationStatus,
    updateApplication,
    removeApplication,
    addApplication,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    hydrated,
  } = useApplications();
  const { shortlist } = useShortlist();
  const { enabled, user, openAuth } = useAuth();
  const [view, setView] = useState<"cards" | "timeline">("cards");

  const sorted = useMemo(() => {
    return [...applications].sort((a, b) => {
      const order = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (order !== 0) return order;
      const da = deadlineDate(a);
      const db = deadlineDate(b);
      if (da && db) return da.getTime() - db.getTime();
      return a.slug.localeCompare(b.slug);
    });
  }, [applications]);

  const untracked = shortlist.filter((s) => !applications.some((a) => a.slug === s.slug));

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background">Application Tracker</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {hydrated
              ? `${applications.length} ${applications.length === 1 ? "application" : "applications"} tracked`
              : "Loading…"}
          </p>
        </div>
        {applications.length > 0 && (
          <div className="flex rounded-lg border border-outline-variant p-0.5">
            <button
              onClick={() => setView("cards")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 font-label-md text-label-md transition-colors ${view === "cards" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              Cards
            </button>
            <button
              onClick={() => setView("timeline")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 font-label-md text-label-md transition-colors ${view === "timeline" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[18px]">timeline</span>
              Deadlines
            </button>
          </div>
        )}
      </div>

      {applications.length > 0 && <StatusSummary applications={applications} />}

      {enabled && !user && applications.length > 0 && (
        <div className="mb-lg flex flex-col items-start justify-between gap-sm rounded-xl border border-primary/30 bg-secondary-container/40 p-md sm:flex-row sm:items-center">
          <p className="font-body-md text-body-md text-on-surface">
            Your tracker is saved on this device. Sign in to back it up and sync across devices.
          </p>
          <button
            onClick={openAuth}
            className="shrink-0 rounded-lg bg-primary px-lg py-2 font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Sign in to sync
          </button>
        </div>
      )}

      {/* Quick add from shortlist */}
      {untracked.length > 0 && (
        <div className="mb-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <p className="mb-sm font-label-md text-label-md text-on-surface-variant">
            Add from your shortlist
          </p>
          <div className="flex flex-wrap gap-sm">
            {untracked.map((s) => {
              const u = getUniversityBySlug(s.slug);
              if (!u) return null;
              return (
                <button
                  key={s.slug}
                  onClick={() => addApplication(s.slug)}
                  className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {u.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hydrated && applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <span className="material-symbols-outlined mb-md text-[48px] text-outline">assignment</span>
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
            No applications yet
          </h3>
          <p className="mb-md max-w-md text-body-md text-on-surface-variant">
            Track an application from any university profile or your shortlist. We&apos;ll pre-fill a
            requirements checklist and keep your deadlines in view.
          </p>
          <div className="flex flex-wrap justify-center gap-sm">
            <Link
              href="/shortlist"
              className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Go to shortlist
            </Link>
            <Link
              href="/universities"
              className="rounded-lg bg-secondary-container px-lg py-sm font-label-md text-primary transition-colors hover:bg-outline-variant/20"
            >
              Browse universities
            </Link>
          </div>
        </div>
      ) : view === "timeline" ? (
        <DeadlineTimeline applications={sorted} />
      ) : (
        <div className="space-y-md">
          {sorted.map((app) => (
            <ApplicationCard
              key={app.slug}
              app={app}
              onStatus={(s) => setApplicationStatus(app.slug, s)}
              onDeadline={(iso) => updateApplication(app.slug, { deadline: iso })}
              onNotes={(notes) => updateApplication(app.slug, { notes })}
              onRemove={() => removeApplication(app.slug)}
              onAddItem={(label) => addChecklistItem(app.slug, label)}
              onToggleItem={(id) => toggleChecklistItem(app.slug, id)}
              onRemoveItem={(id) => removeChecklistItem(app.slug, id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function deadlineDate(app: Application): Date | null {
  const u = getUniversityBySlug(app.slug);
  if (!u) return null;
  return parseDeadline(u.applicationDeadline, app.deadline);
}

function StatusSummary({ applications }: { applications: Application[] }) {
  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const present = APPLICATION_STATUSES.filter((s) => counts[s]);
  return (
    <div className="mb-lg flex flex-wrap gap-sm">
      {present.map((s) => (
        <span
          key={s}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-md text-caption ${STATUS_META[s].classes}`}
        >
          {STATUS_META[s].label}: {counts[s]}
        </span>
      ))}
    </div>
  );
}

function ApplicationCard({
  app,
  onStatus,
  onDeadline,
  onNotes,
  onRemove,
  onAddItem,
  onToggleItem,
  onRemoveItem,
}: {
  app: Application;
  onStatus: (s: ApplicationStatus) => void;
  onDeadline: (iso: string | null) => void;
  onNotes: (notes: string) => void;
  onRemove: () => void;
  onAddItem: (label: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}) {
  const u = getUniversityBySlug(app.slug);
  const [newItem, setNewItem] = useState("");
  const [notes, setNotesLocal] = useState(app.notes ?? "");

  if (!u) return null;

  const deadline = parseDeadline(u.applicationDeadline, app.deadline);
  const days = deadline ? daysUntil(deadline) : null;
  const doneCount = app.checklist.filter((c) => c.done).length;
  const progress = app.checklist.length
    ? Math.round((doneCount / app.checklist.length) * 100)
    : 0;

  const addToCalendar = () => {
    if (!deadline) return;
    const ics = buildDeadlineIcs({
      uid: `unipath-${app.slug}-${deadline.getFullYear()}`,
      title: `Application deadline — ${u.name}`,
      date: deadline,
      description: `UniPath: ${u.name} application deadline. Status: ${STATUS_META[app.status].label}.`,
    });
    downloadIcs(`${u.slug}-deadline`, ics);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-md p-md sm:flex-row">
        <div className="relative h-24 w-full overflow-hidden rounded-lg sm:h-24 sm:w-36 sm:shrink-0">
          <CampusGraphic name={u.name} className="absolute inset-0" />
        </div>

        <div className="flex-1">
          <div className="mb-sm flex flex-wrap items-start justify-between gap-sm">
            <div>
              <Link
                href={`/universities/${u.slug}`}
                className="font-headline-md text-headline-md text-on-surface hover:text-primary"
              >
                {u.name}
              </Link>
              <p className="font-caption text-caption text-on-surface-variant">
                {flagFor(u.country)} {u.city}, {u.country}
              </p>
            </div>
            <button
              onClick={onRemove}
              aria-label="Remove application"
              className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>

          {/* Status + deadline */}
          <div className="mb-md flex flex-wrap items-center gap-sm">
            <select
              value={app.status}
              onChange={(e) => onStatus(e.target.value as ApplicationStatus)}
              className={`rounded-full border-none px-3 py-1.5 font-label-md text-label-md focus:ring-0 ${STATUS_META[app.status].classes}`}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>

            {deadline && (
              <span
                className={`inline-flex items-center gap-1 font-label-md text-label-md ${
                  days != null && days < 0
                    ? "text-error"
                    : days != null && days <= 14
                      ? "text-[#9a6b15]"
                      : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">event</span>
                {days != null && days < 0
                  ? "Deadline passed"
                  : days === 0
                    ? "Due today"
                    : `${days} days left`}
              </span>
            )}

            <button
              onClick={addToCalendar}
              disabled={!deadline}
              className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              Add to calendar
            </button>

            <label className="inline-flex items-center gap-1 font-caption text-caption text-on-surface-variant">
              Override:
              <input
                type="date"
                value={app.deadline ?? ""}
                onChange={(e) => onDeadline(e.target.value || null)}
                className="rounded-lg border border-outline-variant bg-surface px-2 py-1 font-caption text-caption focus:border-primary focus:ring-0"
              />
            </label>
          </div>

          {/* Checklist */}
          <div className="mb-md">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Requirements ({doneCount}/{app.checklist.length})
              </span>
              <span className="font-label-md text-label-md text-primary">{progress}%</span>
            </div>
            <div className="mb-sm h-2 w-full rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ul className="space-y-1">
              {app.checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-sm">
                  <button
                    onClick={() => onToggleItem(c.id)}
                    aria-pressed={c.done}
                    aria-label={c.done ? "Mark incomplete" : "Mark complete"}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      c.done ? "border-primary bg-primary text-on-primary" : "border-outline"
                    }`}
                  >
                    {c.done && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                  <span
                    className={`flex-1 font-body-md text-body-md ${
                      c.done ? "text-on-surface-variant line-through" : "text-on-surface"
                    }`}
                  >
                    {c.label}
                  </span>
                  <button
                    onClick={() => onRemoveItem(c.id)}
                    aria-label="Remove item"
                    className="text-on-surface-variant transition-colors hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAddItem(newItem);
                setNewItem("");
              }}
              className="mt-sm flex gap-sm"
            >
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a requirement…"
                className="flex-1 rounded-lg border border-outline-variant bg-surface px-sm py-1.5 font-body-md text-body-md focus:border-primary focus:ring-0"
              />
              <button
                type="submit"
                className="rounded-lg bg-secondary-container px-md py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-outline-variant/20"
              >
                Add
              </button>
            </form>
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotesLocal(e.target.value)}
            onBlur={() => {
              if (notes !== (app.notes ?? "")) onNotes(notes);
            }}
            rows={2}
            placeholder="Notes (essay ideas, contacts, portal login reminders…)"
            className="w-full rounded-lg border border-outline-variant/60 bg-surface px-sm py-2 font-body-md text-body-md focus:border-primary focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}

function DeadlineTimeline({ applications }: { applications: Application[] }) {
  const withDeadlines = applications
    .map((app) => {
      const u = getUniversityBySlug(app.slug);
      if (!u) return null;
      const deadline = parseDeadline(u.applicationDeadline, app.deadline);
      const days = deadline ? daysUntil(deadline) : null;
      return { app, u, deadline, days };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.deadline !== null)
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());

  if (withDeadlines.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center">
        <span className="material-symbols-outlined mb-sm text-[40px] text-outline">event_busy</span>
        <p className="font-body-md text-body-md text-on-surface-variant">
          No deadlines to show. Add deadline dates to your applications to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {withDeadlines.map(({ app, u, deadline, days }) => {
        const passed = days != null && days < 0;
        const urgent = days != null && days >= 0 && days <= 14;
        const doneCount = app.checklist.filter((c) => c.done).length;
        const progress = app.checklist.length
          ? Math.round((doneCount / app.checklist.length) * 100)
          : 0;

        return (
          <div
            key={app.slug}
            className={`flex items-center gap-md rounded-xl border p-md transition-colors ${
              passed
                ? "border-error/30 bg-error/5"
                : urgent
                  ? "border-amber-400/40 bg-amber-50/50"
                  : "border-outline-variant/30 bg-surface-container-lowest"
            }`}
          >
            <div className="flex w-20 shrink-0 flex-col items-center text-center">
              <span className={`font-label-md ${passed ? "text-error" : urgent ? "text-[#9a6b15]" : "text-primary"}`}>
                {deadline!.toLocaleDateString("en-US", { month: "short" })}
              </span>
              <span className={`text-2xl font-bold ${passed ? "text-error" : urgent ? "text-[#9a6b15]" : "text-on-surface"}`}>
                {deadline!.getDate()}
              </span>
            </div>

            <div className="h-12 w-px bg-outline-variant/40" />

            <div className="flex-1">
              <Link
                href={`/universities/${u.slug}`}
                className="font-label-md text-on-surface hover:text-primary"
              >
                {flagFor(u.country)} {u.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-sm">
                <span className={`inline-block rounded-full px-2 py-0.5 font-caption text-caption ${STATUS_META[app.status].classes}`}>
                  {STATUS_META[app.status].label}
                </span>
                <span className={`font-caption text-caption ${passed ? "text-error" : urgent ? "text-[#9a6b15]" : "text-on-surface-variant"}`}>
                  {passed
                    ? "Deadline passed"
                    : days === 0
                      ? "Due today"
                      : `${days} days left`}
                </span>
                {app.checklist.length > 0 && (
                  <span className="font-caption text-caption text-on-surface-variant">
                    · {doneCount}/{app.checklist.length} done ({progress}%)
                  </span>
                )}
              </div>
            </div>

            {app.checklist.length > 0 && (
              <div className="hidden w-24 sm:block">
                <div className="h-2 w-full rounded-full bg-surface-container-low">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
