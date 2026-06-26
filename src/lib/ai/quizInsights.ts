import type { QuizAnswers, QuizMatch } from "@/types";
import type { QuizInsight, QuizInsightsResult } from "@/types/ai";
import type { ChanceResult } from "@/lib/chances";

/** Trimmed match data sent to the LLM — no full `University` object, to limit tokens. */
export interface QuizInsightMatchInput {
  slug: string;
  name: string;
  country: string;
  acceptanceRate: number;
  annualTuition: number;
  currency: string;
  reasons: string[];
  matchPercent: number;
  chance: Pick<ChanceResult, "tier" | "label" | "estimate" | "strength">;
}

export interface QuizInsightsRequest {
  answers: QuizAnswers;
  matches: QuizInsightMatchInput[];
}

/** Build the trimmed request payload from full quiz/match/chance data. */
export function buildInsightsRequest(
  answers: QuizAnswers,
  matches: QuizMatch[],
  chances: ChanceResult[],
): QuizInsightsRequest {
  return {
    answers,
    matches: matches.map((m, i) => ({
      slug: m.university.slug,
      name: m.university.name,
      country: m.university.country,
      acceptanceRate: m.university.acceptanceRate,
      annualTuition: m.university.annualTuition,
      currency: m.university.currency,
      reasons: m.reasons,
      matchPercent: m.matchPercent,
      chance: {
        tier: chances[i].tier,
        label: chances[i].label,
        estimate: chances[i].estimate,
        strength: chances[i].strength,
      },
    })),
  };
}

const SYSTEM_PROMPT = `You are a college admissions assistant inside UniPath, a student-facing app.
You will be given a student's quiz answers and a list of up to 3 universities that an existing
heuristic algorithm already matched them to, including each school's real acceptance rate,
tuition, match reasons, and an admission-chance estimate (tier + percentage).

Your job is to write a short, personalized narrative explaining why each match makes sense for
THIS student, plus 1-3 concrete considerations (e.g. what to highlight in an application).

STRICT RULES:
- Do NOT invent or restate any acceptance rate, GPA cutoff, SAT/ACT range, or statistic that was
  not explicitly given to you in the input. Only narrate/explain the numbers you were given.
- Do NOT claim certainty about admission outcomes. Stay directional and encouraging, consistent
  with the provided chance tier/estimate.
- Respond ONLY with JSON matching this exact shape, no prose outside the JSON:
  { "insights": [ { "universitySlug": string, "narrative": string, "considerations": string[] } ] }
- One insight per university provided, in the same order, using the exact slug given.
- Keep narrative to 1-3 sentences. Keep each consideration to one short sentence.`;

/** Pure prompt builder — no network code, easy to unit test. */
export function buildInsightPrompt(payload: QuizInsightsRequest): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPT,
    user: JSON.stringify(payload),
  };
}

/**
 * Client-side fetch wrapper. Never throws — any failure (no key configured,
 * network error, bad response) resolves to `{ available: false }` so the UI
 * can treat the AI panel as purely optional.
 */
export async function requestQuizInsights(
  payload: QuizInsightsRequest,
): Promise<QuizInsightsResult> {
  try {
    const res = await fetch("/api/quiz-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { available: false };
    const data = (await res.json()) as QuizInsightsResult;
    if (!data.available || !Array.isArray(data.insights)) return { available: false };
    return data;
  } catch {
    return { available: false };
  }
}

export type { QuizInsight, QuizInsightsResult };
