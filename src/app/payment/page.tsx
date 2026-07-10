"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAccess } from "@/components/auth/AccessProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { TIERS, PAYMENT_DETAILS, type Tier } from "@/lib/access/tiers";

type Method = "telebirr" | "abyssinia";
type LatestSubmission = {
  id: string;
  tier: Tier;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
} | null;

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading, openAuth } = useAuth();
  const { isUnlocked, loading: accessLoading, refresh } = useAccess();
  const [selectedTier, setSelectedTier] = useState<Tier>("standard");
  const [method, setMethod] = useState<Method>("telebirr");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<LatestSubmission>(null);
  const [loadingLatest, setLoadingLatest] = useState(true);

  const loadLatest = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user) {
      setLoadingLatest(false);
      return;
    }
    setLoadingLatest(true);
    const { data } = await supabase
      .from("payment_submissions")
      .select("id, tier, status, rejection_reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setLatest((data as LatestSubmission) ?? null);
    setLoadingLatest(false);
  }, [user]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  useEffect(() => {
    if (!authLoading && !accessLoading && isUnlocked) {
      router.replace("/shortlist");
    }
  }, [authLoading, accessLoading, isUnlocked, router]);

  const handleSubmit = async () => {
    const supabase = getSupabase();
    if (!supabase || !user || !file) return;
    setSubmitting(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(path, file, { contentType: file.type || "image/png" });
      if (uploadError) throw uploadError;

      const tierInfo = TIERS.find((t) => t.id === selectedTier)!;
      const { error: insertError } = await supabase.from("payment_submissions").insert({
        user_id: user.id,
        tier: selectedTier,
        amount_etb: tierInfo.priceEtb,
        method,
        screenshot_path: path,
      });
      if (insertError) throw insertError;

      setFile(null);
      await loadLatest();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingLatest) {
    return (
      <main className="flex flex-grow items-center justify-center py-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center gap-md px-md py-xl text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant">lock</span>
        <h1 className="font-display text-display-md text-on-surface">Sign in to pay</h1>
        <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
          Create an account or sign in first, then come back here to choose a plan.
        </p>
        <button
          onClick={openAuth}
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
        >
          Sign in
        </button>
      </main>
    );
  }

  const tierInfo = TIERS.find((t) => t.id === selectedTier)!;
  const pending = latest?.status === "pending";

  return (
    <main className="mx-auto max-w-3xl px-md py-xl md:px-lg">
      <PageHeader
        icon="payments"
        title="Unlock UniPath"
        description="Pick a plan, send the payment, then upload a screenshot of the transfer. We approve access by hand, usually within a day."
      />

      {latest && (
        <div
          className={`mb-lg rounded-xl border p-lg ${
            latest.status === "rejected"
              ? "border-error/40 bg-error/10"
              : "border-outline-variant/30 bg-surface-container-lowest"
          }`}
        >
          {latest.status === "pending" && (
            <p className="font-body-md text-body-md text-on-surface">
              Your <strong>{latest.tier}</strong> payment is under review. We&apos;ll unlock your
              account as soon as it&apos;s approved — no need to resubmit.
            </p>
          )}
          {latest.status === "rejected" && (
            <>
              <p className="font-body-md text-body-md text-on-surface">
                Your last submission (<strong>{latest.tier}</strong>) was rejected
                {latest.rejection_reason ? `: ${latest.rejection_reason}` : "."}
              </p>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Double-check the amount and account, then submit a new screenshot below.
              </p>
            </>
          )}
        </div>
      )}

      {!pending && (
        <>
          <div className="mb-lg grid gap-md sm:grid-cols-3">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`rounded-xl border p-lg text-left transition ${
                  selectedTier === t.id
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40"
                }`}
              >
                <h3 className="font-display text-display-sm text-on-surface">{t.label}</h3>
                <p className="mt-1 font-label-lg text-label-lg text-primary">{t.priceEtb} ETB</p>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{t.tagline}</p>
                <ul className="mt-md space-y-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h2 className="mb-md font-display text-display-sm text-on-surface">
              Pay {tierInfo.priceEtb} ETB for {tierInfo.label}
            </h2>

            <div className="mb-md flex gap-sm">
              {(["telebirr", "abyssinia"] as Method[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-md py-xs font-label-md text-label-md ${
                    method === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant/30 text-on-surface-variant"
                  }`}
                >
                  {m === "telebirr" ? "Telebirr" : "Bank of Abyssinia"}
                </button>
              ))}
            </div>

            <div className="mb-lg rounded-lg bg-surface-container p-md font-body-md text-body-md text-on-surface">
              {method === "telebirr" ? (
                <>
                  <p>
                    Send to Telebirr number <strong>{PAYMENT_DETAILS.telebirr.number}</strong>
                  </p>
                  <p className="text-on-surface-variant">
                    Account name: {PAYMENT_DETAILS.telebirr.name}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Send to Bank of Abyssinia account{" "}
                    <strong>{PAYMENT_DETAILS.abyssinia.accountNumber}</strong>
                  </p>
                  <p className="text-on-surface-variant">
                    Account name: {PAYMENT_DETAILS.abyssinia.name}
                  </p>
                </>
              )}
            </div>

            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Upload a screenshot of the completed payment
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mb-md block w-full text-body-sm text-on-surface-variant file:mr-md file:rounded-lg file:border-0 file:bg-primary file:px-md file:py-xs file:font-label-md file:text-on-primary"
            />

            {error && <p className="mb-md font-body-sm text-body-sm text-error">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!file || submitting}
              className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
