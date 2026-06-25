import type { University } from "@/types";
import type { AcademicProfile } from "@/lib/storage/types";

/**
 * Heuristic admission-chance estimator.
 *
 * HONEST LIMITATION: the dataset stores only each school's `acceptanceRate` —
 * there are no per-school median GPA/SAT bands. So this is a directional
 * estimate built from (a) the school's selectivity and (b) a 0–100 "strength
 * index" derived from whatever profile signals the student has entered. It is
 * deliberately framed as guidance, not a prediction. UI surfaces a disclaimer.
 */

export type ChanceTier = "safety" | "target" | "reach" | "high-reach";

export interface ChanceResult {
  tier: ChanceTier;
  label: string;
  /** Student strength index, 0–100 (50 = average applicant). */
  strength: number;
  /** Rough admit probability, 0–100 (directional only). */
  estimate: number;
  rationale: string;
  /** False when no profile signals were available (selectivity-only fallback). */
  hasProfile: boolean;
}

export const TIER_META: Record<ChanceTier, { label: string; tone: string }> = {
  safety: { label: "Safety", tone: "safety" },
  target: { label: "Target", tone: "target" },
  reach: { label: "Reach", tone: "reach" },
  "high-reach": { label: "High Reach", tone: "high-reach" },
};

/** True when the profile carries at least one usable academic signal. */
export function hasAcademicSignal(p: AcademicProfile | null | undefined): boolean {
  if (!p) return false;
  return p.gpa != null || p.sat != null || p.act != null;
}

/** Normalize available academic signals into a 0–100 strength index. */
export function strengthIndex(p: AcademicProfile | null | undefined): number {
  if (!p) return 50;
  const parts: number[] = [];
  if (p.gpa != null) parts.push(clamp01(p.gpa / 4) * 100);
  if (p.sat != null) parts.push(clamp01((p.sat - 400) / (1600 - 400)) * 100);
  if (p.act != null) parts.push(clamp01((p.act - 1) / (36 - 1)) * 100);
  if (!parts.length) return 50;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function tierFor(estimate: number): ChanceTier {
  if (estimate >= 70) return "safety";
  if (estimate >= 40) return "target";
  if (estimate >= 15) return "reach";
  return "high-reach";
}

/**
 * Estimate the admission chance for a university given a student profile.
 * Without profile signals, falls back to a selectivity-only band.
 */
export function estimateChance(
  u: University,
  profile: AcademicProfile | null | undefined,
): ChanceResult {
  const base = u.acceptanceRate; // baseline admit rate, 0–100
  const hasProfile = hasAcademicSignal(profile);

  if (!hasProfile) {
    const estimate = Math.round(base);
    const tier = tierFor(estimate);
    return {
      tier,
      label: TIER_META[tier].label,
      strength: 50,
      estimate,
      hasProfile: false,
      rationale: `Based on this school's ${base}% acceptance rate. Add your GPA or test scores to personalize this.`,
    };
  }

  const strength = strengthIndex(profile);
  // Map strength to a multiplier on the baseline rate: 50 → 1×, 100 → ~2.4×, 0 → ~0.3×.
  const factor = 0.3 + (strength / 50) * 0.85;
  const estimate = Math.round(Math.max(1, Math.min(96, base * factor)));
  const tier = tierFor(estimate);

  const strengthWord =
    strength >= 75 ? "strong" : strength >= 50 ? "solid" : strength >= 30 ? "developing" : "early-stage";

  return {
    tier,
    label: TIER_META[tier].label,
    strength,
    estimate,
    hasProfile: true,
    rationale: `Your ${strengthWord} profile against a ${base}% acceptance rate puts this in "${TIER_META[tier].label}" range (~${estimate}% estimated).`,
  };
}
