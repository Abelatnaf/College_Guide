import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AcademicProfile,
  Application,
  ApplicationStatus,
  ChecklistItem,
  CostScenario,
  ShortlistItem,
} from "@/lib/storage/types";

/**
 * Supabase read/write layer for signed-in users. Maps the app's camelCase
 * domain types to the snake_case Postgres rows. Every write is best-effort and
 * swallows errors (logging to console) — the localStorage copy is always the
 * source of truth for the UI, so a failed sync never breaks the experience.
 *
 * NOTE: this path only runs when Supabase is configured AND a user is signed in.
 * It is wired and ready, but has not been exercised against a live project in
 * this build (no credentials were available). Validate it end-to-end once a
 * Supabase project is connected — see supabase/migrations/0001_init.sql.
 */

export interface RemoteState {
  shortlist: ShortlistItem[];
  profile: AcademicProfile | null;
  applications: Application[];
  scenarios: CostScenario[];
}

function warn(scope: string, error: unknown): void {
  if (error) console.warn(`[unipath sync] ${scope}:`, error);
}

// ── reads ─────────────────────────────────────────────────────────────────
export async function pullAll(sb: SupabaseClient, userId: string): Promise<RemoteState> {
  const empty: RemoteState = { shortlist: [], profile: null, applications: [], scenarios: [] };
  try {
    const [saved, profile, apps, scenarios] = await Promise.all([
      sb.from("saved_universities").select("*").eq("user_id", userId),
      sb.from("student_academic_profile").select("*").eq("user_id", userId).maybeSingle(),
      sb.from("applications").select("*").eq("user_id", userId),
      sb.from("cost_scenarios").select("*").eq("user_id", userId),
    ]);

    return {
      shortlist: (saved.data ?? []).map(rowToShortlist),
      profile: profile.data ? rowToProfile(profile.data) : null,
      applications: (apps.data ?? []).map(rowToApplication),
      scenarios: (scenarios.data ?? []).map(rowToScenario),
    };
  } catch (e) {
    warn("pullAll", e);
    return empty;
  }
}

// ── shortlist ────────────────────────────────────────────────────────────
export async function remoteSaveShortlist(sb: SupabaseClient, userId: string, item: ShortlistItem) {
  const { error } = await sb
    .from("saved_universities")
    .upsert(
      { user_id: userId, university_slug: item.slug, note: item.note ?? null },
      { onConflict: "user_id,university_slug" },
    );
  warn("saveShortlist", error);
}

export async function remoteRemoveShortlist(sb: SupabaseClient, userId: string, slug: string) {
  const { error } = await sb
    .from("saved_universities")
    .delete()
    .eq("user_id", userId)
    .eq("university_slug", slug);
  warn("removeShortlist", error);
}

// ── profile ──────────────────────────────────────────────────────────────
export async function remoteUpsertProfile(sb: SupabaseClient, userId: string, p: AcademicProfile) {
  const { error } = await sb.from("student_academic_profile").upsert(
    {
      user_id: userId,
      gpa: p.gpa,
      sat: p.sat,
      act: p.act,
      toefl: p.toefl,
      ielts: p.ielts,
      intended_major: p.intendedMajor,
      preferred_regions: p.preferredRegions,
      budget_band: p.budgetBand,
      campus_size: p.campusSize,
    },
    { onConflict: "user_id" },
  );
  warn("upsertProfile", error);
}

// ── applications ─────────────────────────────────────────────────────────
export async function remoteUpsertApplication(sb: SupabaseClient, userId: string, a: Application) {
  const { error } = await sb.from("applications").upsert(
    {
      user_id: userId,
      university_slug: a.slug,
      status: a.status,
      deadline: a.deadline ?? null,
      submitted_at: a.submittedAt ?? null,
      notes: a.notes ?? null,
      checklist: a.checklist,
    },
    { onConflict: "user_id,university_slug" },
  );
  warn("upsertApplication", error);
}

export async function remoteDeleteApplication(sb: SupabaseClient, userId: string, slug: string) {
  const { error } = await sb
    .from("applications")
    .delete()
    .eq("user_id", userId)
    .eq("university_slug", slug);
  warn("deleteApplication", error);
}

// ── cost scenarios ───────────────────────────────────────────────────────
export async function remoteUpsertScenario(sb: SupabaseClient, userId: string, s: CostScenario) {
  const { error } = await sb.from("cost_scenarios").upsert({
    id: s.id,
    user_id: userId,
    name: s.name,
    university_slug: s.slug,
    major_slug: s.majorSlug ?? null,
    inputs: s.inputs,
    results: s.results ?? null,
  });
  warn("upsertScenario", error);
}

export async function remoteDeleteScenario(sb: SupabaseClient, userId: string, id: string) {
  const { error } = await sb.from("cost_scenarios").delete().eq("user_id", userId).eq("id", id);
  warn("deleteScenario", error);
}

// ── row mappers ──────────────────────────────────────────────────────────
function rowToShortlist(r: Record<string, unknown>): ShortlistItem {
  return {
    slug: String(r.university_slug),
    note: (r.note as string) ?? undefined,
    savedAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

function rowToProfile(r: Record<string, unknown>): AcademicProfile {
  return {
    gpa: numOrNull(r.gpa),
    sat: numOrNull(r.sat),
    act: numOrNull(r.act),
    toefl: numOrNull(r.toefl),
    ielts: numOrNull(r.ielts),
    intendedMajor: (r.intended_major as string) ?? null,
    preferredRegions: Array.isArray(r.preferred_regions) ? (r.preferred_regions as string[]) : [],
    budgetBand: (r.budget_band as string) ?? null,
    campusSize: (r.campus_size as string) ?? null,
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  };
}

function rowToApplication(r: Record<string, unknown>): Application {
  return {
    slug: String(r.university_slug),
    status: (r.status as ApplicationStatus) ?? "considering",
    deadline: (r.deadline as string) ?? null,
    submittedAt: (r.submitted_at as string) ?? null,
    notes: (r.notes as string) ?? undefined,
    checklist: Array.isArray(r.checklist) ? (r.checklist as ChecklistItem[]) : [],
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  };
}

function rowToScenario(r: Record<string, unknown>): CostScenario {
  return {
    id: String(r.id),
    name: (r.name as string) ?? "Saved scenario",
    slug: String(r.university_slug),
    majorSlug: (r.major_slug as string) ?? null,
    inputs: r.inputs as CostScenario["inputs"],
    results: (r.results as CostScenario["results"]) ?? null,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
