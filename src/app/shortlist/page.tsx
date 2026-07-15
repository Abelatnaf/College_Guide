"use client";

import { useState } from "react";
import Link from "next/link";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { formatCurrency } from "@/lib/utils";
import {
  useApplications,
  useShortlist,
} from "@/components/providers/StorageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChanceBadge } from "@/components/ui/ChanceBadge";
import { CampusGraphic } from "@/components/ui/CampusGraphic";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";

export default function ShortlistPage() {
  const { shortlist, toggleSave, setNote, hydrated } = useShortlist();
  const { getApplication, addApplication } = useApplications();
  const { enabled, user, openAuth } = useAuth();

  const items = shortlist
    .map((i) => ({ item: i, university: getUniversityBySlug(i.slug) }))
    .filter((x): x is { item: typeof x.item; university: NonNullable<typeof x.university> } =>
      Boolean(x.university),
    );

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="bookmark"
        title="My Shortlist"
        description={
          hydrated
            ? `${items.length} ${items.length === 1 ? "university" : "universities"} saved`
            : "Loading…"
        }
        actions={
          <div className="flex flex-wrap gap-sm">
            {items.length > 0 && (
              <Link
                href="/cost-to-apply"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-lg py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container"
              >
                <Icon name="payments" />
                See what it costs to apply
              </Link>
            )}
            {items.length >= 2 && (
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-lg bg-secondary-container px-lg py-3 font-label-md text-primary transition-colors hover:bg-outline-variant/20"
              >
                <Icon name="compare_arrows" />
                Compare schools
              </Link>
            )}
          </div>
        }
      />

      {enabled && !user && items.length > 0 && (
        <div className="mb-lg flex flex-col items-start justify-between gap-sm rounded-xl border border-primary/30 bg-secondary-container/40 p-md sm:flex-row sm:items-center">
          <p className="font-body-md text-body-md text-on-surface">
            Your shortlist is saved on this device. Sign in to sync it across your phone and laptop.
          </p>
          <button
            onClick={openAuth}
            className="shrink-0 rounded-lg bg-primary px-lg py-2 font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Sign in to sync
          </button>
        </div>
      )}

      {hydrated && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <Icon name="bookmark_border" className="mb-md text-[48px] text-outline" />
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
            No saved universities yet
          </h3>
          <p className="mb-md max-w-md text-body-md text-on-surface-variant">
            Tap the bookmark on any university to save it here. Build a shortlist, then compare and
            track your applications.
          </p>
          <div className="flex flex-wrap justify-center gap-sm">
            <Link
              href="/universities"
              className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Browse universities
            </Link>
            <Link
              href="/quiz"
              className="rounded-lg bg-secondary-container px-lg py-sm font-label-md text-primary transition-colors hover:bg-outline-variant/20"
            >
              Take the match quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-md">
          {items.map(({ item, university: u }) => {
            const tracked = Boolean(getApplication(u.slug));
            return (
              <div
                key={u.slug}
                className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-32 w-full sm:h-auto sm:w-48 sm:shrink-0">
                    <CampusGraphic name={u.name} className="absolute inset-0" />
                  </div>
                  <div className="flex-1 p-md">
                    <div className="mb-1 flex flex-wrap items-start justify-between gap-sm">
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
                        onClick={() => toggleSave(u.slug)}
                        aria-label="Remove from shortlist"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                      >
                        <Icon name="delete" />
                      </button>
                    </div>

                    <div className="mb-sm flex flex-wrap items-center gap-x-md gap-y-1 font-caption text-caption text-on-surface-variant">
                      <span>Rank #{u.globalRanking}</span>
                      <span>{formatCurrency(u.annualTuition, u.currency)}/yr</span>
                      <span>{u.acceptanceRate}% acceptance</span>
                      <ChanceBadge slug={u.slug} showEstimate />
                    </div>

                    <NoteEditor
                      initial={item.note ?? ""}
                      onSave={(note) => setNote(u.slug, note)}
                    />

                    <div className="mt-sm flex flex-wrap gap-sm">
                      <Link
                        href={`/universities/${u.slug}`}
                        className="rounded-lg border border-outline-variant px-md py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                      >
                        View profile
                      </Link>
                      {tracked ? (
                        <Link
                          href="/applications"
                          className="inline-flex items-center gap-1 rounded-lg bg-secondary-container px-md py-1.5 font-label-md text-label-md text-primary"
                        >
                          <Icon name="check" className="text-[18px]" />
                          Tracking
                        </Link>
                      ) : (
                        <button
                          onClick={() => addApplication(u.slug)}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-md py-1.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container"
                        >
                          <Icon name="add" className="text-[18px]" />
                          Track application
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

/** Inline note editor that commits on blur to avoid writing on every keystroke. */
function NoteEditor({ initial, onSave }: { initial: string; onSave: (note: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== initial) onSave(value);
      }}
      placeholder="Add a private note (e.g. why you like it, deadlines…)"
      className="w-full rounded-lg border border-outline-variant/60 bg-surface px-sm py-2 font-body-md text-body-md focus:border-primary focus:ring-0"
    />
  );
}
