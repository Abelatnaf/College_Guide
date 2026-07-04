"use client";

import Link from "next/link";
import { useApplications } from "@/components/providers/StorageProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { DeadlineCalendar } from "@/components/ui/DeadlineCalendar";

export default function CalendarPage() {
  const { applications, hydrated } = useApplications();

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="calendar_month"
        title="Deadline Calendar"
        description="Every deadline across your tracked applications, in one month view — export them all to your own calendar app."
        actions={
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary-container px-lg py-3 font-label-md text-primary transition-colors hover:bg-outline-variant/20"
          >
            <span className="material-symbols-outlined">assignment</span>
            Application tracker
          </Link>
        }
      />

      {!hydrated ? (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <span className="material-symbols-outlined mb-md text-[48px] text-outline">event_busy</span>
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
            No applications tracked yet
          </h3>
          <p className="mb-md max-w-md text-body-md text-on-surface-variant">
            Track a university you&apos;re applying to and its deadline will show up here.
          </p>
          <Link
            href="/universities"
            className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Browse universities
          </Link>
        </div>
      ) : (
        <DeadlineCalendar applications={applications} />
      )}
    </main>
  );
}
