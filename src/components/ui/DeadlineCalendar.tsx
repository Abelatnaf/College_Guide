"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { deadlineDate } from "@/lib/deadlines";
import { buildCombinedIcs, daysUntil, downloadIcs } from "@/lib/ics";
import type { Application } from "@/lib/storage/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

interface DeadlineEvent {
  application: Application;
  universityName: string;
  universitySlug: string;
  country: string;
  date: Date;
  days: number;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** 42 cells (6 weeks) covering the given month, padded with adjacent-month days so the grid always fills evenly. */
function buildMonthGrid(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, inMonth: date.getMonth() === month };
  });
}

/** Urgency-coded pill classes, reusing the same "light hex + dark hex/opacity" pattern established elsewhere (STATUS_META, ChanceBadge). */
function urgencyClasses(days: number): string {
  if (days < 0) return "bg-surface-container-high text-on-surface-variant";
  if (days <= 7) return "bg-[#fde3e1] text-[#b3261e] dark:bg-[#b3261e]/25 dark:text-[#f5b4ae]";
  if (days <= 30) return "bg-[#fdf0dd] text-[#9a6b15] dark:bg-[#9a6b15]/25 dark:text-[#eccb87]";
  return "bg-[#e5eefb] text-[#21588f] dark:bg-[#21588f]/25 dark:text-[#a9c9f0]";
}

export function DeadlineCalendar({ applications }: { applications: Application[] }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const events = useMemo<DeadlineEvent[]>(() => {
    return applications
      .map((application) => {
        const u = getUniversityBySlug(application.slug);
        const date = deadlineDate(application);
        if (!u || !date) return null;
        const day = startOfDay(date);
        return {
          application,
          universityName: u.name,
          universitySlug: u.slug,
          country: u.country,
          date: day,
          days: daysUntil(day),
        };
      })
      .filter((x): x is DeadlineEvent => x !== null);
  }, [applications]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, DeadlineEvent[]>();
    for (const e of events) {
      const key = e.date.toDateString();
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const grid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const exportAll = () => {
    const upcoming = events.filter((e) => e.days >= 0);
    if (upcoming.length === 0) return;
    const ics = buildCombinedIcs(
      upcoming.map((e) => ({
        uid: `${e.universitySlug}-deadline`,
        title: `Application deadline — ${e.universityName}`,
        date: e.date,
        description: `Application deadline for ${e.universityName}.`,
      })),
    );
    downloadIcs("unipath-deadlines", ics);
  };

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
      <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="w-40 text-center font-headline-md text-headline-md text-on-surface">
            {MONTH_FORMAT.format(viewDate)}
          </h2>
          <button
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            Today
          </button>
        </div>
        <button
          onClick={exportAll}
          disabled={events.filter((e) => e.days >= 0).length === 0}
          className="flex items-center gap-1 rounded-lg bg-primary px-md py-1.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
          Add all to my calendar
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center font-caption text-caption text-on-surface-variant">
            {label}
          </div>
        ))}
        {grid.map(({ date, inMonth }) => {
          const dayEvents = eventsByDay.get(date.toDateString()) ?? [];
          const isToday = date.getTime() === today.getTime();
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[72px] rounded-lg border p-1 ${
                inMonth ? "border-outline-variant/20" : "border-transparent"
              } ${isToday ? "border-primary bg-primary/5" : ""}`}
            >
              <p
                className={`mb-1 text-center font-caption text-caption ${
                  inMonth ? "text-on-surface" : "text-on-surface-variant/40"
                } ${isToday ? "font-bold text-primary" : ""}`}
              >
                {date.getDate()}
              </p>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((e) => (
                  <Link
                    key={e.universitySlug}
                    href={`/universities/${e.universitySlug}`}
                    title={e.universityName}
                    className={`block truncate rounded px-1 py-0.5 font-caption text-[10px] leading-tight ${urgencyClasses(e.days)}`}
                  >
                    {flagFor(e.country)} {e.universityName}
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <p className="px-1 font-caption text-[10px] text-on-surface-variant">
                    +{dayEvents.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <p className="mt-md text-center font-body-md text-body-md text-on-surface-variant">
          No deadlines yet — track an application to see it on the calendar.
        </p>
      )}
    </div>
  );
}
