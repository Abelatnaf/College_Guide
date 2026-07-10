"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUniversityBySlug } from "@/data/universities";
import { STATUS_META } from "@/lib/applicationMeta";
import {
  getSharedApplications,
  getSharedProfile,
  getSharedShortlist,
  listSharedWithMe,
  type SharedApplication,
  type SharedProfile,
  type SharedShortlistItem,
  type SharedWithMeEntry,
} from "@/lib/sharing";

export default function SharedDashboardPage({ params }: { params: { ownerId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [entry, setEntry] = useState<SharedWithMeEntry | null>(null);
  const [profile, setProfile] = useState<SharedProfile | null>(null);
  const [applications, setApplications] = useState<SharedApplication[]>([]);
  const [shortlist, setShortlist] = useState<SharedShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const mine = await listSharedWithMe();
      const match = mine.find((s) => s.ownerId === params.ownerId) ?? null;
      if (cancelled) return;
      setEntry(match);
      if (!match) {
        setLoading(false);
        return;
      }
      const [p, apps, sl] = await Promise.all([
        match.scope.includes("profile") ? getSharedProfile(params.ownerId) : Promise.resolve(null),
        match.scope.includes("applications") ? getSharedApplications(params.ownerId) : Promise.resolve([]),
        match.scope.includes("shortlist") ? getSharedShortlist(params.ownerId) : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setProfile(p);
      setApplications(apps);
      setShortlist(sl);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, params.ownerId]);

  if (authLoading || loading) return null;

  if (!user || !entry) {
    return (
      <main className="mx-auto max-w-3xl px-md py-xl md:px-lg">
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center font-body-md text-body-md text-on-surface-variant">
          This isn&apos;t shared with you, or the invite hasn&apos;t been accepted yet.{" "}
          <Link href="/shared" className="text-primary hover:underline">
            Back to Shared with You
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-md py-xl md:px-lg">
      <PageHeader
        icon="visibility"
        title={`${entry.ownerDisplayName ?? "Student"}'s Progress`}
        description="Read-only — you can't make changes here."
      />

      <div className="space-y-gutter">
        {profile && (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h3 className="mb-md font-headline-md text-headline-md">Academic Profile</h3>
            <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
              {profile.gpa != null && <Stat label="GPA" value={String(profile.gpa)} />}
              {profile.sat != null && <Stat label="SAT" value={String(profile.sat)} />}
              {profile.act != null && <Stat label="ACT" value={String(profile.act)} />}
              {profile.toefl != null && <Stat label="TOEFL" value={String(profile.toefl)} />}
              {profile.ielts != null && <Stat label="IELTS" value={String(profile.ielts)} />}
            </div>
            {profile.intendedMajor && (
              <p className="mt-md font-caption text-caption text-on-surface-variant">
                Intended major: <span className="text-on-surface">{profile.intendedMajor}</span>
              </p>
            )}
          </div>
        )}

        {applications.length > 0 && (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h3 className="mb-md font-headline-md text-headline-md">Applications</h3>
            <ul className="divide-y divide-outline-variant/40">
              {applications.map((a) => {
                const u = getUniversityBySlug(a.universitySlug);
                return (
                  <li key={a.universitySlug} className="flex items-center justify-between gap-sm py-3">
                    <span className="font-body-md text-body-md text-on-surface">
                      {u?.name ?? a.universitySlug}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-label-md text-caption ${STATUS_META[a.status].classes}`}
                    >
                      {STATUS_META[a.status].label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {shortlist.length > 0 && (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h3 className="mb-md font-headline-md text-headline-md">Shortlist</h3>
            <ul className="divide-y divide-outline-variant/40">
              {shortlist.map((s) => {
                const u = getUniversityBySlug(s.universitySlug);
                return (
                  <li key={s.universitySlug} className="py-3">
                    <p className="font-body-md text-body-md text-on-surface">{u?.name ?? s.universitySlug}</p>
                    {s.note && <p className="font-caption text-caption text-on-surface-variant">{s.note}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!profile && applications.length === 0 && shortlist.length === 0 && (
          <p className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center font-body-md text-body-md text-on-surface-variant">
            Nothing to show yet.
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-sm">
      <p className="font-caption text-caption text-on-surface-variant">{label}</p>
      <p className="font-headline-md text-headline-md text-on-surface">{value}</p>
    </div>
  );
}
