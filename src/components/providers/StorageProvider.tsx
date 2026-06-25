"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUniversityBySlug } from "@/data/universities";
import { getAdmissionsTier } from "@/lib/universityInsights";
import {
  newId,
  nowIso,
  readLocal,
  STORAGE_KEYS,
  writeLocal,
} from "@/lib/storage/localStore";
import {
  emptyAcademicProfile,
  type AcademicProfile,
  type Application,
  type ApplicationStatus,
  type ChecklistItem,
  type CostScenario,
  type ShortlistItem,
} from "@/lib/storage/types";
import {
  pullAll,
  remoteDeleteApplication,
  remoteDeleteScenario,
  remoteRemoveShortlist,
  remoteSaveShortlist,
  remoteUpsertApplication,
  remoteUpsertProfile,
  remoteUpsertScenario,
} from "@/lib/storage/remoteSync";

interface StorageContextValue {
  hydrated: boolean;

  // shortlist
  shortlist: ShortlistItem[];
  isSaved: (slug: string) => boolean;
  toggleSave: (slug: string) => void;
  setShortlistNote: (slug: string, note: string) => void;

  // academic profile
  profile: AcademicProfile;
  hasProfile: boolean;
  saveProfile: (patch: Partial<AcademicProfile>) => void;
  clearProfile: () => void;

  // applications
  applications: Application[];
  getApplication: (slug: string) => Application | undefined;
  addApplication: (slug: string, init?: Partial<Application>) => void;
  setApplicationStatus: (slug: string, status: ApplicationStatus) => void;
  updateApplication: (slug: string, patch: Partial<Application>) => void;
  removeApplication: (slug: string) => void;
  addChecklistItem: (slug: string, label: string) => void;
  toggleChecklistItem: (slug: string, itemId: string) => void;
  removeChecklistItem: (slug: string, itemId: string) => void;

  // cost scenarios
  scenarios: CostScenario[];
  saveScenario: (s: Omit<CostScenario, "id" | "createdAt">) => void;
  removeScenario: (id: string) => void;
}

const StorageContext = createContext<StorageContextValue | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const { user, enabled } = useAuth();

  const [hydrated, setHydrated] = useState(false);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [profile, setProfile] = useState<AcademicProfile>(emptyAcademicProfile);
  const [applications, setApplications] = useState<Application[]>([]);
  const [scenarios, setScenarios] = useState<CostScenario[]>([]);

  const userIdRef = useRef<string | null>(null);
  const mergedForUser = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  /** Run a remote write if Supabase is configured and a user is signed in. */
  const remote = useCallback(
    (fn: (sb: NonNullable<ReturnType<typeof getSupabase>>, userId: string) => void) => {
      const sb = getSupabase();
      const userId = userIdRef.current;
      if (enabled && sb && userId) fn(sb, userId);
    },
    [enabled],
  );

  // ── hydrate from localStorage once on mount ───────────────────────────────
  useEffect(() => {
    setShortlist(readLocal<ShortlistItem[]>(STORAGE_KEYS.shortlist, []));
    setProfile(readLocal<AcademicProfile>(STORAGE_KEYS.profile, emptyAcademicProfile()));
    setApplications(readLocal<Application[]>(STORAGE_KEYS.applications, []));
    setScenarios(readLocal<CostScenario[]>(STORAGE_KEYS.costScenarios, []));
    setHydrated(true);
  }, []);

  // ── persist each domain to localStorage on change ─────────────────────────
  useEffect(() => {
    if (hydrated) writeLocal(STORAGE_KEYS.shortlist, shortlist);
  }, [shortlist, hydrated]);
  useEffect(() => {
    if (hydrated) writeLocal(STORAGE_KEYS.profile, profile);
  }, [profile, hydrated]);
  useEffect(() => {
    if (hydrated) writeLocal(STORAGE_KEYS.applications, applications);
  }, [applications, hydrated]);
  useEffect(() => {
    if (hydrated) writeLocal(STORAGE_KEYS.costScenarios, scenarios);
  }, [scenarios, hydrated]);

  // ── merge local → account once per sign-in ────────────────────────────────
  useEffect(() => {
    const sb = getSupabase();
    const userId = user?.id ?? null;
    if (!hydrated || !enabled || !sb || !userId) return;
    if (mergedForUser.current === userId) return;
    mergedForUser.current = userId;

    (async () => {
      const remoteState = await pullAll(sb, userId);

      // shortlist: union by slug; push local-only rows to remote
      setShortlist((local) => {
        const bySlug = new Map<string, ShortlistItem>();
        remoteState.shortlist.forEach((i) => bySlug.set(i.slug, i));
        local.forEach((i) => {
          if (!bySlug.has(i.slug)) {
            bySlug.set(i.slug, i);
            remoteSaveShortlist(sb, userId, i);
          }
        });
        return Array.from(bySlug.values()).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
      });

      // profile: keep whichever was updated more recently; push local if it wins
      setProfile((local) => {
        const r = remoteState.profile;
        const localHasData = Boolean(local.updatedAt);
        if (r && (!localHasData || r.updatedAt >= local.updatedAt)) return r;
        if (localHasData) remoteUpsertProfile(sb, userId, local);
        return local;
      });

      // applications: union by slug; push local-only
      setApplications((local) => {
        const bySlug = new Map<string, Application>();
        remoteState.applications.forEach((a) => bySlug.set(a.slug, a));
        local.forEach((a) => {
          if (!bySlug.has(a.slug)) {
            bySlug.set(a.slug, a);
            remoteUpsertApplication(sb, userId, a);
          }
        });
        return Array.from(bySlug.values());
      });

      // cost scenarios: union by id; push local-only
      setScenarios((local) => {
        const byId = new Map<string, CostScenario>();
        remoteState.scenarios.forEach((s) => byId.set(s.id, s));
        local.forEach((s) => {
          if (!byId.has(s.id)) {
            byId.set(s.id, s);
            remoteUpsertScenario(sb, userId, s);
          }
        });
        return Array.from(byId.values());
      });
    })();
  }, [user, enabled, hydrated]);

  // ── shortlist ─────────────────────────────────────────────────────────────
  const isSaved = useCallback(
    (slug: string) => shortlist.some((i) => i.slug === slug),
    [shortlist],
  );

  const toggleSave = useCallback(
    (slug: string) => {
      setShortlist((prev) => {
        if (prev.some((i) => i.slug === slug)) {
          remote((sb, uid) => remoteRemoveShortlist(sb, uid, slug));
          return prev.filter((i) => i.slug !== slug);
        }
        const item: ShortlistItem = { slug, savedAt: nowIso() };
        remote((sb, uid) => remoteSaveShortlist(sb, uid, item));
        return [item, ...prev];
      });
    },
    [remote],
  );

  const setShortlistNote = useCallback(
    (slug: string, note: string) => {
      setShortlist((prev) =>
        prev.map((i) => {
          if (i.slug !== slug) return i;
          const next = { ...i, note };
          remote((sb, uid) => remoteSaveShortlist(sb, uid, next));
          return next;
        }),
      );
    },
    [remote],
  );

  // ── academic profile ────────────────────────────────────────────────────
  const saveProfile = useCallback(
    (patch: Partial<AcademicProfile>) => {
      setProfile((prev) => {
        const next: AcademicProfile = { ...prev, ...patch, updatedAt: nowIso() };
        remote((sb, uid) => remoteUpsertProfile(sb, uid, next));
        return next;
      });
    },
    [remote],
  );

  const clearProfile = useCallback(() => {
    const blank = emptyAcademicProfile();
    setProfile(blank);
    remote((sb, uid) => remoteUpsertProfile(sb, uid, blank));
  }, [remote]);

  const hasProfile = useMemo(
    () => profile.gpa != null || profile.sat != null || profile.act != null,
    [profile],
  );

  // ── applications ──────────────────────────────────────────────────────────
  const getApplication = useCallback(
    (slug: string) => applications.find((a) => a.slug === slug),
    [applications],
  );

  /** Update one application by slug, refresh updatedAt, and push to remote. */
  const mutateApplication = useCallback(
    (slug: string, fn: (a: Application) => Application) => {
      setApplications((prev) =>
        prev.map((a) => {
          if (a.slug !== slug) return a;
          const next = { ...fn(a), updatedAt: nowIso() };
          remote((sb, uid) => remoteUpsertApplication(sb, uid, next));
          return next;
        }),
      );
    },
    [remote],
  );

  const addApplication = useCallback(
    (slug: string, init?: Partial<Application>) => {
      setApplications((prev) => {
        if (prev.some((a) => a.slug === slug)) return prev;
        // Seed the checklist from the school's real admission requirements.
        const u = getUniversityBySlug(slug);
        const seededChecklist: ChecklistItem[] = u
          ? getAdmissionsTier(u).requirements.map((label) => ({
              id: newId(),
              label,
              done: false,
            }))
          : [];
        const app: Application = {
          slug,
          status: "considering",
          deadline: null,
          submittedAt: null,
          notes: "",
          checklist: seededChecklist,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          ...init,
        };
        remote((sb, uid) => remoteUpsertApplication(sb, uid, app));
        return [...prev, app];
      });
    },
    [remote],
  );

  const setApplicationStatus = useCallback(
    (slug: string, status: ApplicationStatus) => {
      mutateApplication(slug, (a) => ({
        ...a,
        status,
        submittedAt:
          status === "submitted" && !a.submittedAt ? nowIso() : a.submittedAt ?? null,
      }));
    },
    [mutateApplication],
  );

  const updateApplication = useCallback(
    (slug: string, patch: Partial<Application>) =>
      mutateApplication(slug, (a) => ({ ...a, ...patch })),
    [mutateApplication],
  );

  const removeApplication = useCallback(
    (slug: string) => {
      setApplications((prev) => prev.filter((a) => a.slug !== slug));
      remote((sb, uid) => remoteDeleteApplication(sb, uid, slug));
    },
    [remote],
  );

  const addChecklistItem = useCallback(
    (slug: string, label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const item: ChecklistItem = { id: newId(), label: trimmed, done: false };
      mutateApplication(slug, (a) => ({ ...a, checklist: [...a.checklist, item] }));
    },
    [mutateApplication],
  );

  const toggleChecklistItem = useCallback(
    (slug: string, itemId: string) =>
      mutateApplication(slug, (a) => ({
        ...a,
        checklist: a.checklist.map((c) =>
          c.id === itemId ? { ...c, done: !c.done } : c,
        ),
      })),
    [mutateApplication],
  );

  const removeChecklistItem = useCallback(
    (slug: string, itemId: string) =>
      mutateApplication(slug, (a) => ({
        ...a,
        checklist: a.checklist.filter((c) => c.id !== itemId),
      })),
    [mutateApplication],
  );

  // ── cost scenarios ────────────────────────────────────────────────────────
  const saveScenario = useCallback(
    (s: Omit<CostScenario, "id" | "createdAt">) => {
      const scenario: CostScenario = { ...s, id: newId(), createdAt: nowIso() };
      setScenarios((prev) => [scenario, ...prev]);
      remote((sb, uid) => remoteUpsertScenario(sb, uid, scenario));
    },
    [remote],
  );

  const removeScenario = useCallback(
    (id: string) => {
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      remote((sb, uid) => remoteDeleteScenario(sb, uid, id));
    },
    [remote],
  );

  const value = useMemo<StorageContextValue>(
    () => ({
      hydrated,
      shortlist,
      isSaved,
      toggleSave,
      setShortlistNote,
      profile,
      hasProfile,
      saveProfile,
      clearProfile,
      applications,
      getApplication,
      addApplication,
      setApplicationStatus,
      updateApplication,
      removeApplication,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItem,
      scenarios,
      saveScenario,
      removeScenario,
    }),
    [
      hydrated,
      shortlist,
      isSaved,
      toggleSave,
      setShortlistNote,
      profile,
      hasProfile,
      saveProfile,
      clearProfile,
      applications,
      getApplication,
      addApplication,
      setApplicationStatus,
      updateApplication,
      removeApplication,
      addChecklistItem,
      toggleChecklistItem,
      removeChecklistItem,
      scenarios,
      saveScenario,
      removeScenario,
    ],
  );

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

function useStorage(): StorageContextValue {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within StorageProvider");
  return ctx;
}

// ── focused hooks (components depend only on what they need) ─────────────────
export function useShortlist() {
  const s = useStorage();
  return {
    hydrated: s.hydrated,
    shortlist: s.shortlist,
    isSaved: s.isSaved,
    toggleSave: s.toggleSave,
    setNote: s.setShortlistNote,
  };
}

export function useAcademicProfile() {
  const s = useStorage();
  return {
    hydrated: s.hydrated,
    profile: s.profile,
    hasProfile: s.hasProfile,
    saveProfile: s.saveProfile,
    clearProfile: s.clearProfile,
  };
}

export function useApplications() {
  const s = useStorage();
  return {
    hydrated: s.hydrated,
    applications: s.applications,
    getApplication: s.getApplication,
    addApplication: s.addApplication,
    setApplicationStatus: s.setApplicationStatus,
    updateApplication: s.updateApplication,
    removeApplication: s.removeApplication,
    addChecklistItem: s.addChecklistItem,
    toggleChecklistItem: s.toggleChecklistItem,
    removeChecklistItem: s.removeChecklistItem,
  };
}

export function useCostScenarios() {
  const s = useStorage();
  return {
    hydrated: s.hydrated,
    scenarios: s.scenarios,
    saveScenario: s.saveScenario,
    removeScenario: s.removeScenario,
  };
}
