import { getUniversityBySlug } from "@/data/universities";
import { getDeadlines, type DeadlineType } from "@/data/deadlines";
import { parseDeadline, daysUntil } from "@/lib/ics";
import type { Application } from "@/lib/storage/types";
import type { University } from "@/types";

/** Resolve an application's effective deadline, preferring a custom override over the school's listed date. */
export function deadlineDate(app: Application): Date | null {
  const u = getUniversityBySlug(app.slug);
  if (!u) return null;
  return parseDeadline(u.applicationDeadline, app.deadline);
}

export interface UpcomingDeadline {
  application: Application;
  university: University;
  date: Date;
  daysUntil: number;
}

/** The soonest N future-or-today deadlines across tracked applications, nearest first. Past deadlines are excluded. */
export function upcomingDeadlines(applications: Application[], limit = 3): UpcomingDeadline[] {
  const withDates = applications
    .map((application) => {
      const university = getUniversityBySlug(application.slug);
      const date = deadlineDate(application);
      if (!university || !date) return null;
      return { application, university, date, daysUntil: daysUntil(date) };
    })
    .filter((x): x is UpcomingDeadline => x !== null && x.daysUntil >= 0);

  return withDates.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

export interface ResolvedDeadline {
  type: DeadlineType | "listed";
  label: string;
  date: Date | null;
  sourceUrl?: string;
  note?: string;
}

/** Verified per-round deadlines when we have them, falling back to the school's single static label otherwise. */
export function universityDeadlines(u: University): ResolvedDeadline[] {
  const structured = getDeadlines(u.slug);
  if (structured?.length) {
    return structured.map((d) => ({ ...d, date: parseDeadline(d.label) }));
  }
  return [{ type: "listed", label: u.applicationDeadline, date: parseDeadline(u.applicationDeadline) }];
}
