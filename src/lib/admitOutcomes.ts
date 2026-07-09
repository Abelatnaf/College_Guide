import { getSupabase } from "@/lib/supabase/client";

export type AdmitDecision = "accepted" | "rejected" | "waitlisted" | "deferred";
export type DecisionRound = "ED" | "EA" | "RD" | "Rolling";

export interface AdmitOutcomeInput {
  universitySlug: string;
  gpa: number | null;
  sat: number | null;
  act: number | null;
  decision: AdmitDecision;
  decisionRound: DecisionRound | null;
}

export interface AdmitOutcomeStatRow {
  metric: "gpa" | "sat" | "act";
  band: string;
  decision: AdmitDecision;
  n: number;
}

/** Ordered band labels per metric, used to render bars in a sensible order rather than DB return order. */
export const BAND_ORDER: Record<AdmitOutcomeStatRow["metric"], string[]> = {
  gpa: ["<3.0", "3.0-3.3", "3.3-3.7", "3.7-3.9", "3.9-4.0"],
  sat: ["<1200", "1200-1350", "1350-1450", "1450-1550", "1550-1600"],
  act: ["<27", "27-30", "31-33", "34-36"],
};

/** Submits one self-reported outcome. Works signed-in or anonymous (both allowed by RLS); returns false if Supabase isn't configured or the insert fails. */
export async function submitAdmitOutcome(input: AdmitOutcomeInput): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: userData } = await sb.auth.getUser();
  const { error } = await sb.from("admit_outcomes").insert({
    user_id: userData?.user?.id ?? null,
    university_slug: input.universitySlug,
    gpa: input.gpa,
    sat: input.sat,
    act: input.act,
    decision: input.decision,
    decision_round: input.decisionRound,
  });
  return !error;
}

/** Bucketed, k-anonymized stats for a school — never raw rows. Empty array if Supabase isn't configured or nothing meets the suppression floor yet. */
export async function fetchAdmitOutcomeStats(slug: string): Promise<AdmitOutcomeStatRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("get_admit_outcome_stats", { p_university_slug: slug });
  if (error || !data) return [];
  return data as AdmitOutcomeStatRow[];
}

/** Total self-reported outcomes for a school, regardless of suppression floor — lets the UI say "N shared, not enough yet for a breakdown." */
export async function fetchAdmitOutcomeTotal(slug: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { data, error } = await sb.rpc("get_admit_outcome_total", { p_university_slug: slug });
  if (error || data == null) return 0;
  return Number(data);
}
