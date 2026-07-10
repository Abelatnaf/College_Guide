"use client";

import { useMemo, useState } from "react";
import type { University } from "@/types";
import { majors } from "@/data/majors";
import { formatCurrency } from "@/lib/utils";
import {
  computeCost,
  defaultCostInputs,
  type CostInputs,
} from "@/lib/cost";
import {
  useAcademicProfile,
  useCostScenarios,
} from "@/components/providers/StorageProvider";
import { Tilt3D } from "@/components/motion/Tilt3D";
import { AppealLetterGenerator } from "@/components/university/AppealLetterGenerator";

const INPUT_FIELDS: { key: keyof CostInputs; label: string; hint: string; step: number }[] = [
  { key: "livingCost", label: "Living cost / year", hint: "Housing, food, personal", step: 500 },
  { key: "scholarship", label: "Scholarship / grant / year", hint: "Aid you expect to receive", step: 500 },
  { key: "familyContribution", label: "Family contribution / year", hint: "Paid out of pocket", step: 500 },
];

/**
 * Interactive net-price + ROI calculator for one university. Combines the
 * school's tuition and a chosen major's starting salary to estimate net cost,
 * total funding needed, payback period, and a 10-year ROI. Signed-in or
 * anonymous users can save scenarios to revisit.
 */
export function CostRoiPanel({ university: u }: { university: University }) {
  const { profile } = useAcademicProfile();
  const { scenarios, saveScenario, removeScenario } = useCostScenarios();

  const offeredMajors = useMemo(
    () => majors.filter((m) => u.majorsOffered.includes(m.name)),
    [u.majorsOffered],
  );

  const defaultMajorSlug = useMemo(() => {
    const byProfile = offeredMajors.find((m) => m.name === profile.intendedMajor);
    return (byProfile ?? offeredMajors[0])?.slug ?? "";
  }, [offeredMajors, profile.intendedMajor]);

  const [majorSlug, setMajorSlug] = useState(defaultMajorSlug);
  const [inputs, setInputs] = useState<CostInputs>(() => defaultCostInputs(u));
  const [scenarioName, setScenarioName] = useState("");

  const major = majors.find((m) => m.slug === majorSlug) ?? null;
  const results = useMemo(() => computeCost(u, inputs, major), [u, inputs, major]);

  const savedHere = scenarios.filter((s) => s.slug === u.slug);

  const setField = (key: keyof CostInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(value) ? Math.max(0, value) : 0 }));

  const handleSave = () => {
    saveScenario({
      name: scenarioName.trim() || `${u.name}${major ? ` · ${major.name}` : ""}`,
      slug: u.slug,
      majorSlug: major?.slug ?? null,
      inputs,
      results,
    });
    setScenarioName("");
  };

  return (
    <div className="space-y-gutter">
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        {/* Inputs */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <h3 className="mb-md font-headline-md text-headline-md">Your numbers</h3>

          <div className="mb-md">
            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Intended major (for ROI)
            </label>
            <select
              value={majorSlug}
              onChange={(e) => setMajorSlug(e.target.value)}
              className="w-full rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
            >
              <option value="">No major selected</option>
              {offeredMajors.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name} · {m.avgStartingSalary} avg start
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-md">
            {INPUT_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
                  {f.label}
                </label>
                <input
                  type="number"
                  min={0}
                  step={f.step}
                  value={inputs[f.key]}
                  onChange={(e) => setField(f.key, Number(e.target.value))}
                  className="w-full rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
                />
                <p className="mt-1 font-caption text-caption text-on-surface-variant">{f.hint}</p>
              </div>
            ))}
            <div>
              <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
                Program length: {inputs.years} years
              </label>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={inputs.years}
                onChange={(e) => setField("years", Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <p className="mt-md font-caption text-caption text-on-surface-variant">
            Tuition is fixed from our directory ({formatCurrency(u.annualTuition, u.currency)}/yr).
            Everything else is yours to adjust.
          </p>
        </div>

        {/* Results */}
        <div className="space-y-gutter">
          <Tilt3D maxTilt={6} className="rounded-xl">
            <div className="rounded-xl bg-primary p-lg text-on-primary shadow-lg">
              <p className="font-label-md text-label-md opacity-80">Net cost per year (after aid)</p>
              <p className="mt-1 font-headline-xl text-headline-xl">
                {formatCurrency(results.netAnnual, u.currency)}
              </p>
              <p className="mt-2 font-caption text-caption opacity-80">
                {formatCurrency(results.totalProgram, u.currency)} total over {inputs.years} years
              </p>
            </div>
          </Tilt3D>

          <div className="grid grid-cols-2 gap-md">
            <Stat
              label="Funding needed"
              value={formatCurrency(results.loanNeeded, u.currency)}
              hint="After family contribution"
            />
            <Stat
              label="Gross / year"
              value={formatCurrency(results.grossAnnual, u.currency)}
              hint="Tuition + living"
            />
            {results.startingSalary != null ? (
              <>
                <Stat
                  label="Est. starting salary"
                  value={formatCurrency(results.startingSalary, "USD")}
                  hint={major?.name ?? ""}
                />
                <Stat
                  label="Payback period"
                  value={
                    results.paybackYears != null && results.paybackYears > 0
                      ? `${results.paybackYears} yrs`
                      : "Immediate"
                  }
                  hint="At ~20% of salary/yr"
                />
                <div className="col-span-2">
                  <Stat
                    label="10-year net ROI"
                    value={formatCurrency(results.tenYearRoi ?? 0, "USD")}
                    hint="10 yrs of salary minus total cost"
                    tone={(results.tenYearRoi ?? 0) >= 0 ? "good" : "bad"}
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2 rounded-xl border border-dashed border-outline-variant p-md font-caption text-caption text-on-surface-variant">
                Pick an intended major above to see starting salary, payback period, and ROI.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save scenario */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <h3 className="mb-sm font-headline-md text-headline-md">Save this scenario</h3>
        <div className="flex flex-col gap-sm sm:flex-row">
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder={`e.g. ${u.name}${major ? ` + ${major.name}` : ""}`}
            className="flex-1 rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
          />
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-lg py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Save scenario
          </button>
        </div>

        {savedHere.length > 0 && (
          <ul className="mt-md divide-y divide-outline-variant/40">
            {savedHere.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-sm py-2">
                <div>
                  <p className="font-body-md text-body-md text-on-surface">{s.name}</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Net {formatCurrency(s.results?.netAnnual ?? 0, u.currency)}/yr
                    {s.results?.paybackYears != null
                      ? ` · payback ${s.results.paybackYears} yrs`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => removeScenario(s.id)}
                  aria-label="Delete scenario"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="rounded-lg bg-surface-container-low p-md font-caption text-caption text-on-surface-variant">
        Estimates only. Living costs, aid, and salaries vary widely by program, country, and year —
        use this to compare options, not as a financial guarantee.
      </p>

      <AppealLetterGenerator university={u} inputs={inputs} results={results} />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <p className="font-caption text-caption text-on-surface-variant">{label}</p>
      <p
        className={
          tone === "good"
            ? "font-headline-md text-headline-md text-primary"
            : tone === "bad"
              ? "font-headline-md text-headline-md text-error"
              : "font-headline-md text-headline-md text-on-surface"
        }
      >
        {value}
      </p>
      {hint && <p className="font-caption text-caption text-on-surface-variant">{hint}</p>}
    </div>
  );
}
