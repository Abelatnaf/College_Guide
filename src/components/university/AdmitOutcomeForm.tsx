"use client";

import { useState } from "react";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import { readLocal, writeLocal } from "@/lib/storage/localStore";
import {
  submitAdmitOutcome,
  type AdmitDecision,
  type DecisionRound,
} from "@/lib/admitOutcomes";

const SUBMITTED_KEY = "admitOutcomesSubmitted";

const DECISIONS: { value: AdmitDecision; label: string }[] = [
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "deferred", label: "Deferred" },
];

const ROUNDS: { value: DecisionRound | ""; label: string }[] = [
  { value: "", label: "Round (optional)" },
  { value: "ED", label: "Early Decision" },
  { value: "EA", label: "Early Action" },
  { value: "RD", label: "Regular Decision" },
  { value: "Rolling", label: "Rolling" },
];

function alreadySubmitted(slug: string): boolean {
  return readLocal<string[]>(SUBMITTED_KEY, []).includes(slug);
}

function markSubmitted(slug: string) {
  const current = readLocal<string[]>(SUBMITTED_KEY, []);
  if (!current.includes(slug)) writeLocal(SUBMITTED_KEY, [...current, slug]);
}

export function AdmitOutcomeForm({ slug, onSubmitted }: { slug: string; onSubmitted: () => void }) {
  const { profile } = useAcademicProfile();
  const [gpa, setGpa] = useState(profile.gpa != null ? String(profile.gpa) : "");
  const [sat, setSat] = useState(profile.sat != null ? String(profile.sat) : "");
  const [act, setAct] = useState(profile.act != null ? String(profile.act) : "");
  const [decision, setDecision] = useState<AdmitDecision | "">("");
  const [round, setRound] = useState<DecisionRound | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  if (alreadySubmitted(slug)) {
    return (
      <p className="rounded-lg bg-surface-container-low p-md font-caption text-caption text-on-surface-variant">
        Thanks — you already shared your outcome for this school.
      </p>
    );
  }

  const hasSignal = gpa.trim() !== "" || sat.trim() !== "" || act.trim() !== "";
  const canSubmit = hasSignal && decision !== "" && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(false);
    const ok = await submitAdmitOutcome({
      universitySlug: slug,
      gpa: gpa.trim() ? Number(gpa) : null,
      sat: sat.trim() ? Number(sat) : null,
      act: act.trim() ? Number(act) : null,
      decision,
      decisionRound: round || null,
    });
    setSubmitting(false);
    if (!ok) {
      setError(true);
      return;
    }
    markSubmitted(slug);
    onSubmitted();
  }

  return (
    <div className="space-y-sm rounded-lg bg-surface-container-low p-md">
      <p className="font-caption text-caption text-on-surface-variant">
        Share your GPA/test scores at the time you applied and your result — this stays
        anonymous and only ever shows up in aggregate.
      </p>
      <div className="grid grid-cols-3 gap-sm">
        <input
          type="number"
          step="0.01"
          min={0}
          max={4}
          placeholder="GPA"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          className="rounded-lg border border-outline-variant/40 bg-surface px-sm py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        />
        <input
          type="number"
          min={400}
          max={1600}
          placeholder="SAT"
          value={sat}
          onChange={(e) => setSat(e.target.value)}
          className="rounded-lg border border-outline-variant/40 bg-surface px-sm py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        />
        <input
          type="number"
          min={1}
          max={36}
          placeholder="ACT"
          value={act}
          onChange={(e) => setAct(e.target.value)}
          className="rounded-lg border border-outline-variant/40 bg-surface px-sm py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <select
          value={decision}
          onChange={(e) => setDecision(e.target.value as AdmitDecision | "")}
          className="rounded-lg border border-outline-variant/40 bg-surface px-sm py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        >
          <option value="">Decision…</option>
          {DECISIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={round}
          onChange={(e) => setRound(e.target.value as DecisionRound | "")}
          className="rounded-lg border border-outline-variant/40 bg-surface px-sm py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        >
          {ROUNDS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="font-caption text-caption text-error">
          Couldn&apos;t submit — please try again in a moment.
        </p>
      )}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-lg bg-primary py-2 font-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-40"
      >
        {submitting ? "Sharing…" : "Share your outcome"}
      </button>
    </div>
  );
}
