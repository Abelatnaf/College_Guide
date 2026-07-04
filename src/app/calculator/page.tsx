"use client";

import { useMemo, useState } from "react";
import { universities } from "@/data/universities";
import { CostRoiPanel } from "@/components/ui/CostRoiPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";

export default function CalculatorPage() {
  const sorted = useMemo(
    () => [...universities].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const [slug, setSlug] = useState(
    () => [...universities].sort((a, b) => a.globalRanking - b.globalRanking)[0]?.slug ?? "",
  );

  const university = universities.find((u) => u.slug === slug) ?? null;

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="calculate"
        title="Cost & ROI Calculator"
        description="Estimate the real cost of a degree — net of aid — and how long it takes your future salary to pay it back. Pick a school to begin."
      />

      <div className="mb-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
          University
        </label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
        >
          {sorted.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.name} — {u.city}, {u.country} ({formatCurrency(u.annualTuition, u.currency)}/yr)
            </option>
          ))}
        </select>
      </div>

      {university && <CostRoiPanel key={university.slug} university={university} />}
    </main>
  );
}
