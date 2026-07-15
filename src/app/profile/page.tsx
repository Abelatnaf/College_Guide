"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { majors } from "@/data/majors";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { strengthIndex } from "@/lib/chances";
import type { AcademicProfile } from "@/lib/storage/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareProgressSection } from "@/components/profile/ShareProgressSection";
import { Icon } from "@/components/ui/Icon";

type NumericField = "gpa" | "sat" | "act" | "toefl" | "ielts";

const NUMERIC_FIELDS: {
  key: NumericField;
  label: string;
  placeholder: string;
  min: number;
  max: number;
  step: number;
  hint: string;
}[] = [
  { key: "gpa", label: "GPA", placeholder: "3.7", min: 0, max: 4, step: 0.01, hint: "On a 4.0 scale" },
  { key: "sat", label: "SAT", placeholder: "1450", min: 400, max: 1600, step: 10, hint: "400–1600" },
  { key: "act", label: "ACT", placeholder: "32", min: 1, max: 36, step: 1, hint: "1–36" },
  { key: "toefl", label: "TOEFL", placeholder: "105", min: 0, max: 120, step: 1, hint: "0–120 (optional)" },
  { key: "ielts", label: "IELTS", placeholder: "7.5", min: 0, max: 9, step: 0.5, hint: "0–9 (optional)" },
];

export default function ProfilePage() {
  const { profile, saveProfile, clearProfile, hydrated } = useAcademicProfile();
  const { enabled, user, openAuth } = useAuth();
  const [draft, setDraft] = useState<AcademicProfile>(profile);
  const [saved, setSaved] = useState(false);

  // Sync the local draft when the stored profile hydrates/changes.
  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const setNum = (key: NumericField, raw: string) => {
    setSaved(false);
    const value = raw === "" ? null : Number(raw);
    setDraft((d) => ({ ...d, [key]: value != null && Number.isFinite(value) ? value : null }));
  };

  const handleSave = () => {
    saveProfile({
      gpa: draft.gpa,
      sat: draft.sat,
      act: draft.act,
      toefl: draft.toefl,
      ielts: draft.ielts,
      intendedMajor: draft.intendedMajor,
    });
    setSaved(true);
  };

  const strength = strengthIndex(draft);
  const hasSignal = draft.gpa != null || draft.sat != null || draft.act != null;

  return (
    <main className="mx-auto max-w-3xl px-md py-xl md:px-lg">
      <PageHeader
        icon="person"
        title="Your Academic Profile"
        description="Enter your scores once. We use them to estimate your admission chances across every university — shown as Reach / Target / Safety badges."
      />

      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
          {NUMERIC_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
                {f.label}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={f.min}
                max={f.max}
                step={f.step}
                value={draft[f.key] ?? ""}
                onChange={(e) => setNum(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
              />
              <p className="mt-1 font-caption text-caption text-on-surface-variant">{f.hint}</p>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Intended field of study
            </label>
            <select
              value={draft.intendedMajor ?? ""}
              onChange={(e) => {
                setSaved(false);
                setDraft((d) => ({ ...d, intendedMajor: e.target.value || null }));
              }}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
            >
              <option value="">Undecided</option>
              {majors.map((m) => (
                <option key={m.slug} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasSignal && (
          <div className="mt-lg">
            <div className="mb-2 flex justify-between">
              <span className="font-label-md text-label-md">Profile strength</span>
              <span className="font-label-md text-label-md text-primary">{strength}/100</span>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${strength}%` }}
              />
            </div>
            <p className="mt-2 font-caption text-caption text-on-surface-variant">
              A relative index from the scores you entered (50 ≈ an average applicant). It scales the
              baseline acceptance rate of each school into your personalized estimate.
            </p>
          </div>
        )}

        <div className="mt-lg flex flex-wrap items-center gap-sm">
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-lg py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Save profile
          </button>
          <Link
            href="/universities"
            className="rounded-lg bg-secondary-container px-lg py-3 font-label-md text-primary transition-colors hover:bg-outline-variant/20"
          >
            See my chances
          </Link>
          {hydrated && (profile.gpa != null || profile.sat != null || profile.act != null) && (
            <button
              onClick={() => {
                clearProfile();
                setSaved(false);
              }}
              className="ml-auto font-label-md text-label-md text-on-surface-variant hover:text-error"
            >
              Clear
            </button>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary">
              <Icon name="check_circle" className="text-[18px]" /> Saved
            </span>
          )}
        </div>
      </div>

      <p className="mt-md rounded-lg bg-surface-container-low p-md font-caption text-caption text-on-surface-variant">
        <strong>How accurate is this?</strong> Our directory stores each school&apos;s overall
        acceptance rate but not its median GPA/SAT, so these estimates are directional guidance, not
        predictions. Treat Reach / Target / Safety as a planning aid, and always check each
        school&apos;s official admissions data.
      </p>

      {enabled && !user && (
        <div className="mt-md flex flex-col items-start justify-between gap-sm rounded-xl border border-primary/30 bg-secondary-container/40 p-md sm:flex-row sm:items-center">
          <p className="font-body-md text-body-md text-on-surface">
            Sign in to keep your profile synced across devices.
          </p>
          <button
            onClick={openAuth}
            className="shrink-0 rounded-lg bg-primary px-lg py-2 font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Sign in to sync
          </button>
        </div>
      )}

      {enabled && user && <ShareProgressSection />}
    </main>
  );
}
