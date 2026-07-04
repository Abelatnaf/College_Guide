/**
 * Minimal client-side iCalendar (.ics) generation for application deadlines.
 * No backend needed — builds the file in memory and triggers a download.
 */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Resolve an application deadline to a concrete Date.
 * Prefers an ISO override (yyyy-mm-dd); otherwise parses a static label like
 * "Jan 04", choosing the next occurrence (this year if still ahead, else next).
 */
export function parseDeadline(label: string, overrideIso?: string | null): Date | null {
  if (overrideIso) {
    const d = new Date(`${overrideIso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const m = label.trim().match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})/);
  if (!m) return null;
  const month = MONTHS[m[1].toLowerCase()];
  const day = Number(m[2]);
  if (month == null || !day) return null;

  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month, day);
  if (candidate.getTime() < now.getTime() - 24 * 3600 * 1000) year += 1;
  return new Date(year, month, day);
}

/** Whole days from today until `date` (negative if past). */
export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (24 * 3600 * 1000));
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIcsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

interface IcsEvent {
  uid: string;
  title: string;
  date: Date;
  description?: string;
}

/** Build a single all-day VEVENT block (no VCALENDAR envelope) — shared by the single- and multi-event builders below. */
function buildVeventBlock(opts: IcsEvent): string {
  const start = toIcsDate(opts.date);
  const endDate = new Date(opts.date);
  endDate.setDate(endDate.getDate() + 1);
  const end = toIcsDate(endDate);
  const stamp = toIcsDate(new Date());

  return [
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${stamp}T000000Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    opts.description ? `DESCRIPTION:${escapeIcs(opts.description)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(opts.title)}`,
    "END:VALARM",
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Build an all-day VEVENT .ics string for a single deadline. */
export function buildDeadlineIcs(opts: IcsEvent): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UniPath//Application Tracker//EN",
    "CALSCALE:GREGORIAN",
    buildVeventBlock(opts),
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Build one combined .ics file covering several deadlines — the "add all to my calendar" export. */
export function buildCombinedIcs(events: IcsEvent[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UniPath//Application Tracker//EN",
    "CALSCALE:GREGORIAN",
    ...events.map(buildVeventBlock),
    "END:VCALENDAR",
  ].join("\r\n");
}

function escapeIcs(s: string): string {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Trigger a browser download of an .ics file. */
export function downloadIcs(filename: string, contents: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
