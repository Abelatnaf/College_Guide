"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { meetsTier, type Tier } from "@/lib/access/tiers";

export type PaymentStatus = "pending" | "approved" | "rejected" | null;

interface AccessContextValue {
  /** True once the initial profile fetch (or "no user" short-circuit) settles. */
  loading: boolean;
  isAdmin: boolean;
  tier: Tier | null;
  status: PaymentStatus;
  /** Admins always pass; everyone else needs status === "approved" and tier >= required. */
  hasAccess: (required: Tier) => boolean;
  /** True the moment ANY approved tier unlocks the site at all (used by the paywall gate). */
  isUnlocked: boolean;
  refresh: () => Promise<void>;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tier, setTier] = useState<Tier | null>(null);
  const [status, setStatus] = useState<PaymentStatus>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user) {
      setIsAdmin(false);
      setTier(null);
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, access_tier, access_status")
      .eq("id", user.id)
      .maybeSingle();
    setIsAdmin(Boolean(data?.is_admin));
    setTier((data?.access_tier as Tier | null) ?? null);
    setStatus((data?.access_status as PaymentStatus) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const hasAccess = useCallback(
    (required: Tier) => {
      if (isAdmin) return true;
      return status === "approved" && meetsTier(tier, required);
    },
    [isAdmin, status, tier],
  );

  const value = useMemo<AccessContextValue>(
    () => ({
      loading: authLoading || loading,
      isAdmin,
      tier,
      status,
      hasAccess,
      isUnlocked: isAdmin || status === "approved",
      refresh: load,
    }),
    [authLoading, loading, isAdmin, tier, status, hasAccess, load],
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessContextValue {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
