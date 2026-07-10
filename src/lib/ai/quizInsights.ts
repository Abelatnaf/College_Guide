import type { QuizAnswers, QuizMatch } from "@/types";
import type { QuizInsight, QuizInsightsResult } from "@/types/ai";
import type { ChanceResult } from "@/lib/chances";
import { getAidPolicy } from "@/data/aidPolicy";
import { getApplicationFee } from "@/data/applicationFees";
import { authHeaders } from "@/lib/access/authHeader";

/** Short, verified affordability facts for a match — only present when web-verified data exists. */
export interface QuizInsightAidInput {
  needBlindForInternational: boolean | null;
  meetsFullDemonstratedNeed: boolean | null;
  /** Short excerpt of the verified note, not the full paragraph — keeps payload small. */
  noteExcerpt: string;
}

export interface QuizInsightFeeInput {
  amount: number;
  currency: string;
}

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
  /** Verified aid policy facts, only present when this school has been web-verified. */
  aid?: QuizInsightAidInput;
  /** Verified application fee, only present when this school has been web-verified. */
  applicationFee?: QuizInsightFeeInput;
}

const NOTE_EXCERPT_MAX_LEN = 160;

/** Truncate a verified note to a short excerpt, breaking on a word boundary. */
function excerptNote(note: string): string {
  if (note.length <= NOTE_EXCERPT_MAX_LEN) return note;
  const cut = note.slice(0, NOTE_EXCERPT_MAX_LEN);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : NOTE_EXCERPT_MAX_LEN)}…`;
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
    matches: matches.map((m, i) => {
      const aidEntry = getAidPolicy(m.university.slug);
      const feeEntry = getApplicationFee(m.university.slug);
      return {
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
        ...(aidEntry
          ? {
              aid: {
                needBlindForInternational: aidEntry.needBlindForInternational,
                meetsFullDemonstratedNeed: aidEntry.meetsFullDemonstratedNeed,
                noteExcerpt: excerptNote(aidEntry.note),
              },
            }
          : {}),
        ...(feeEntry
          ? {
              applicationFee: {
                amount: feeEntry.amount,
                currency: feeEntry.currency,
              },
            }
          : {}),
      };
    }),
  };
}

const SYSTEM_PROMPT = `You are a college admissions assistant inside UniPath, a student-facing app.
You will be given a student's quiz answers and a list of up to 3 universities that an existing
heuristic algorithm already matched them to, including each school's real acceptance rate,
tuition, match reasons, and an admission-chance estimate (tier + percentage). Some matches will
also include an optional "aid" object (verified international financial-aid policy: whether the
school is need-blind for international applicants, whether it meets full demonstrated need, and a
short sourced note excerpt) and/or an optional "applicationFee" object (verified fee amount and
currency).

Your job is to write a short, personalized narrative explaining why each match makes sense for
THIS student, plus 1-3 concrete considerations (e.g. what to highlight in an application).

STRICT RULES:
- Do NOT invent or restate any acceptance rate, GPA cutoff, SAT/ACT range, or statistic that was
  not explicitly given to you in the input. Only narrate/explain the numbers you were given.
- When a match's input includes an "aid" object, weave its facts in naturally — e.g. mention that
  the school is need-blind and meets full demonstrated need for international students, or flag
  when it is need-aware or does not meet full need, using only what's stated in that object/note.
- When a match's input includes an "applicationFee" object, mention the real fee amount and
  currency when relevant (e.g. as a practical consideration).
- If a match's input has NO "aid" object and/or NO "applicationFee" object, you MUST stay
  completely silent about that school's affordability, aid policy, need-blind/need-aware status,
  or application fee — never guess, estimate, or infer these facts for schools where they are
  absent from the input.
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
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
