import { getSupabase } from "@/lib/supabase/client";
import type { ApplicationStatus, ChecklistItem } from "@/lib/storage/types";

export type ShareScope = "profile" | "applications" | "shortlist";
export type ShareStatus = "pending" | "accepted" | "revoked";

export interface Share {
  id: string;
  ownerId: string;
  granteeEmail: string;
  granteeId: string | null;
  scope: ShareScope[];
  status: ShareStatus;
  createdAt: string;
  acceptedAt: string | null;
}

export interface SharedWithMeEntry {
  ownerId: string;
  ownerDisplayName: string | null;
  scope: ShareScope[];
  acceptedAt: string | null;
}

export interface SharedProfile {
  gpa: number | null;
  sat: number | null;
  act: number | null;
  toefl: number | null;
  ielts: number | null;
  intendedMajor: string | null;
  preferredRegions: string[];
  budgetBand: string | null;
  campusSize: string | null;
  updatedAt: string;
}

export interface SharedApplication {
  universitySlug: string;
  status: ApplicationStatus;
  deadline: string | null;
  submittedAt: string | null;
  notes: string | null;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedShortlistItem {
  universitySlug: string;
  note: string | null;
  createdAt: string;
}

function warn(scope: string, error: unknown): void {
  if (error) console.warn(`[unipath sharing] ${scope}:`, error);
}

interface ShareRow {
  id: string;
  owner_id: string;
  grantee_email: string;
  grantee_id: string | null;
  scope: string[];
  status: ShareStatus;
  created_at: string;
  accepted_at: string | null;
}

function rowToShare(row: ShareRow): Share {
  return {
    id: row.id,
    ownerId: row.owner_id,
    granteeEmail: row.grantee_email,
    granteeId: row.grantee_id,
    scope: row.scope as ShareScope[],
    status: row.status,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

/** Shares the current signed-in user created as owner (invites they've sent). Empty when not signed in. */
export async function listMyOwnedShares(): Promise<Share[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data: userData } = await sb.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return [];
  const { data, error } = await sb
    .from("shares")
    .select("*")
    .eq("owner_id", uid)
    .order("created_at", { ascending: false });
  if (error) {
    warn("listMyOwnedShares", error);
    return [];
  }
  return ((data as ShareRow[] | null) ?? []).map(rowToShare);
}

/** Shares addressed to the current signed-in user as grantee (pending or accepted). Empty when not signed in. */
export async function listSharesAddressedToMe(): Promise<Share[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data: userData } = await sb.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return [];
  const { data, error } = await sb
    .from("shares")
    .select("*")
    .neq("owner_id", uid)
    .order("created_at", { ascending: false });
  if (error) {
    warn("listSharesAddressedToMe", error);
    return [];
  }
  return ((data as ShareRow[] | null) ?? []).map(rowToShare);
}

/** Creates a new invite for the current signed-in user as owner. Returns false on failure or if not signed in. */
export async function createShare(granteeEmail: string, scope: ShareScope[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: userData } = await sb.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return false;
  const { error } = await sb.from("shares").insert({
    owner_id: uid,
    grantee_email: granteeEmail.trim().toLowerCase(),
    scope,
  });
  warn("createShare", error);
  return !error;
}

/** Owner revokes (deletes) an invite they created. */
export async function revokeShare(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("shares").delete().eq("id", id);
  warn("revokeShare", error);
  return !error;
}

/** Grantee accepts an invite addressed to their signed-in email. */
export async function acceptShare(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: userData } = await sb.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) return false;
  const { error } = await sb.from("shares").update({ grantee_id: uid, status: "accepted" }).eq("id", id);
  warn("acceptShare", error);
  return !error;
}

/** Accepted shares where the current user is the grantee, with the owner's display name. */
export async function listSharedWithMe(): Promise<SharedWithMeEntry[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("list_shared_with_me");
  if (error || !data) {
    warn("listSharedWithMe", error);
    return [];
  }
  return (data as { owner_id: string; owner_display_name: string | null; scope: string[]; accepted_at: string | null }[]).map(
    (r) => ({
      ownerId: r.owner_id,
      ownerDisplayName: r.owner_display_name,
      scope: r.scope as ShareScope[],
      acceptedAt: r.accepted_at,
    }),
  );
}

export async function getSharedProfile(ownerId: string): Promise<SharedProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("get_shared_profile", { p_owner_id: ownerId });
  if (error || !data || !Array.isArray(data) || data.length === 0) {
    warn("getSharedProfile", error);
    return null;
  }
  const row = data[0];
  return {
    gpa: row.gpa,
    sat: row.sat,
    act: row.act,
    toefl: row.toefl,
    ielts: row.ielts,
    intendedMajor: row.intended_major,
    preferredRegions: row.preferred_regions ?? [],
    budgetBand: row.budget_band,
    campusSize: row.campus_size,
    updatedAt: row.updated_at,
  };
}

export async function getSharedApplications(ownerId: string): Promise<SharedApplication[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("get_shared_applications", { p_owner_id: ownerId });
  if (error || !data) {
    warn("getSharedApplications", error);
    return [];
  }
  return (data as Record<string, unknown>[]).map((row) => ({
    universitySlug: row.university_slug as string,
    status: row.status as ApplicationStatus,
    deadline: (row.deadline as string | null) ?? null,
    submittedAt: (row.submitted_at as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    checklist: (row.checklist as ChecklistItem[] | null) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function getSharedShortlist(ownerId: string): Promise<SharedShortlistItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.rpc("get_shared_shortlist", { p_owner_id: ownerId });
  if (error || !data) {
    warn("getSharedShortlist", error);
    return [];
  }
  return (data as Record<string, unknown>[]).map((row) => ({
    universitySlug: row.university_slug as string,
    note: (row.note as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}
