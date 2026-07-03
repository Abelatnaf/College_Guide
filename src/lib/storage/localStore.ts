/**
 * Tiny, SSR-safe localStorage helpers. All UniPath user data is namespaced under
 * the `unipath:` prefix. Every accessor swallows errors (private mode, quota,
 * disabled storage) so the UI never crashes on a storage failure.
 */

const PREFIX = "unipath:";

export const STORAGE_KEYS = {
  shortlist: "shortlist",
  profile: "profile",
  applications: "applications",
  costScenarios: "costScenarios",
  chatHistory: "chatHistory",
  migratedPrefix: "migrated:",
} as const;

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function removeLocal(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** A stable unique id, preferring crypto.randomUUID when available. */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** ISO timestamp for "now" (centralized so call sites read cleanly). */
export function nowIso(): string {
  return new Date().toISOString();
}
