"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  BAND_ORDER,
  fetchAdmitOutcomeStats,
  fetchAdmitOutcomeTotal,
  type AdmitOutcomeStatRow,
} from "@/lib/admitOutcomes";
import { AdmitOutcomeForm } from "./AdmitOutcomeForm";

const METRIC_LABEL: Record<AdmitOutcomeStatRow["metric"], string> = {
  gpa: "GPA",
  sat: "SAT",
  act: "ACT",
};

function BandBar({ band, rows }: { band: string; rows: AdmitOutcomeStatRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  const accepted = rows.find((r) => r.decision === "accepted")?.n ?? 0;
  const pct = total > 0 ? Math.round((accepted / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between font-caption text-caption text-on-surface-variant">
        <span>{band}</span>
        <span>
          {pct}% accepted <span className="opacity-70">(n={total})</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-container-low">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function RealOutcomesBlock({ slug }: { slug: string }) {
  const [stats, setStats] = useState<AdmitOutcomeStatRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    Promise.all([fetchAdmitOutcomeStats(slug), fetchAdmitOutcomeTotal(slug)]).then(
      ([s, t]) => {
        if (cancelled) return;
        setStats(s);
        setTotal(t);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, refreshKey]);

  if (!isSupabaseConfigured) return null;

  const byMetric = (metric: AdmitOutcomeStatRow["metric"]) => {
    const rows = (stats ?? []).filter((r) => r.metric === metric);
    const bands = BAND_ORDER[metric].filter((b) => rows.some((r) => r.band === b));
    return bands.map((band) => ({ band, rows: rows.filter((r) => r.band === band) }));
  };

  const gpaBands = byMetric("gpa");
  const satBands = byMetric("sat");
  const actBands = byMetric("act");
  const hasBreakdown = gpaBands.length > 0 || satBands.length > 0 || actBands.length > 0;

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <div className="mb-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">groups</span>
        <h3 className="font-headline-md text-headline-md">Real Applicant Outcomes</h3>
      </div>
      <p className="mb-md font-caption text-caption text-on-surface-variant">
        Self-reported, unverified results shared by students on UniPath — not official school
        data. Shown only in aggregate; individual submissions are never displayed.
      </p>

      {hasBreakdown ? (
        <div className="space-y-md">
          {gpaBands.length > 0 && (
            <div>
              <p className="mb-2 font-label-md text-label-md text-on-surface">{METRIC_LABEL.gpa}</p>
              <div className="space-y-2">
                {gpaBands.map((b) => (
                  <BandBar key={b.band} band={b.band} rows={b.rows} />
                ))}
              </div>
            </div>
          )}
          {satBands.length > 0 && (
            <div>
              <p className="mb-2 font-label-md text-label-md text-on-surface">{METRIC_LABEL.sat}</p>
              <div className="space-y-2">
                {satBands.map((b) => (
                  <BandBar key={b.band} band={b.band} rows={b.rows} />
                ))}
              </div>
            </div>
          )}
          {actBands.length > 0 && (
            <div>
              <p className="mb-2 font-label-md text-label-md text-on-surface">{METRIC_LABEL.act}</p>
              <div className="space-y-2">
                {actBands.map((b) => (
                  <BandBar key={b.band} band={b.band} rows={b.rows} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mb-md rounded-lg bg-surface-container-low p-md font-caption text-caption text-on-surface-variant">
          {total > 0
            ? `${total} student${total === 1 ? " has" : "s have"} shared data for this school — not enough yet for a breakdown.`
            : "No outcomes shared yet for this school — be the first."}
        </p>
      )}

      {showForm ? (
        <AdmitOutcomeForm
          slug={slug}
          onSubmitted={() => {
            setShowForm(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border-2 border-primary py-2 font-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary"
        >
          Share your outcome
        </button>
      )}
    </div>
  );
}
