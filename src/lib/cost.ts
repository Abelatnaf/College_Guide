import type { Major, Region, University } from "@/types";

/**
 * Interactive Cost & ROI engine. Builds on the static cost-of-attendance
 * estimate in `universityInsights.getCostBreakdown`, but exposes tunable inputs
 * (living cost, scholarship, family contribution, program length) and folds in
 * a major's starting salary to produce payback / ROI figures.
 *
 * Pure functions only — no React, no storage — so it's reused by the standalone
 * calculator, the university Cost tab, and saved-scenario rendering alike.
 */

/** User-tunable knobs for one cost scenario. */
export interface CostInputs {
  /** Annual living cost (housing + food + personal), in the school's currency. */
  livingCost: number;
  /** Annual scholarship / grant the student expects to receive. */
  scholarship: number;
  /** Annual amount the family can pay out of pocket (reduces loans). */
  familyContribution: number;
  /** Program length in years. */
  years: number;
}

/** Derived results for one cost scenario. */
export interface CostResults {
  tuition: number;
  livingCost: number;
  /** Tuition + living, before aid. */
  grossAnnual: number;
  /** Gross minus scholarship, floored at 0. */
  netAnnual: number;
  /** Net annual × years. */
  totalProgram: number;
  /** What can't be covered by family contribution — i.e. loans/savings needed. */
  loanNeeded: number;
  /** Parsed starting salary for the chosen major, or null if none picked. */
  startingSalary: number | null;
  /** Years to repay the loan at ~20% of starting salary, or null. */
  paybackYears: number | null;
  /** 10-year earnings minus total program cost — a rough decade ROI, or null. */
  tenYearRoi: number | null;
}

/** Typical annual living cost by region, in USD. Rough, editable by the user. */
const REGION_LIVING_COST: Record<Region, number> = {
  USA: 18000,
  Europe: 13000,
  Canada: 15000,
  China: 8000,
  UAE: 16000,
};

/** Parse a salary label like "$92,000" into a number, or null if unparseable. */
export function parseSalary(label: string | undefined | null): number | null {
  if (!label) return null;
  const digits = label.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** Sensible starting inputs for a university, seeded from its data. */
export function defaultCostInputs(u: University): CostInputs {
  // Mirror the heuristic used in getCostBreakdown for a consistent default grant.
  const estimatedGrant = Math.round(u.annualTuition * (u.financialAid / 100) * 0.6);
  return {
    livingCost: REGION_LIVING_COST[u.region] ?? 14000,
    scholarship: estimatedGrant,
    familyContribution: 0,
    years: 4,
  };
}

/** Compute a full cost + ROI breakdown for a university and a set of inputs. */
export function computeCost(
  u: University,
  inputs: CostInputs,
  major?: Major | null,
): CostResults {
  const tuition = u.annualTuition;
  const livingCost = Math.max(0, inputs.livingCost);
  const grossAnnual = tuition + livingCost;
  const netAnnual = Math.max(0, grossAnnual - Math.max(0, inputs.scholarship));
  const years = Math.max(1, Math.min(8, Math.round(inputs.years)));
  const totalProgram = netAnnual * years;
  const loanNeeded = Math.max(0, totalProgram - Math.max(0, inputs.familyContribution) * years);

  const startingSalary = parseSalary(major?.avgStartingSalary);

  let paybackYears: number | null = null;
  let tenYearRoi: number | null = null;
  if (startingSalary) {
    // Assume ~20% of gross starting salary is available for repayment per year.
    const annualRepayCapacity = startingSalary * 0.2;
    paybackYears = loanNeeded > 0 ? Math.round((loanNeeded / annualRepayCapacity) * 10) / 10 : 0;
    tenYearRoi = startingSalary * 10 - totalProgram;
  }

  return {
    tuition,
    livingCost,
    grossAnnual,
    netAnnual,
    totalProgram,
    loanNeeded,
    startingSalary,
    paybackYears,
    tenYearRoi,
  };
}
