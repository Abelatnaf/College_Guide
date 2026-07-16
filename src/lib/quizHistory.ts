import { readLocal, writeLocal, newId, nowIso } from "@/lib/storage/localStore";

/**
 * Local-only record of past quiz runs — powers the "your matches are still
 * saved" returning-visitor nudge and the "past matches" list on the quiz
 * page. Deliberately not synced to Supabase (kept local-only to avoid a new
 * table/RLS/sync surface for what's a lightweight retention nudge).
 */
export interface QuizHistoryEntry {
  id: string;
  takenAt: string;
  topMatchSlug: string;
  topMatchName: string;
  topMatchPercent: number;
}

const KEY = "quizHistory";
const MAX_ENTRIES = 5;

export function recordQuizResult(entry: Omit<QuizHistoryEntry, "id" | "takenAt">): void {
  const history = readLocal<QuizHistoryEntry[]>(KEY, []);
  const next: QuizHistoryEntry = { ...entry, id: newId(), takenAt: nowIso() };
  writeLocal(KEY, [next, ...history].slice(0, MAX_ENTRIES));
}

export function getQuizHistory(): QuizHistoryEntry[] {
  return readLocal<QuizHistoryEntry[]>(KEY, []);
}

export function getLatestQuizResult(): QuizHistoryEntry | null {
  return getQuizHistory()[0] ?? null;
}
