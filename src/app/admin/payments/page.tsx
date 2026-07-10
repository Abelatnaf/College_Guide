"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAccess } from "@/components/auth/AccessProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Tier } from "@/lib/access/tiers";

type Status = "pending" | "approved" | "rejected";
interface Submission {
  id: string;
  user_id: string;
  tier: Tier;
  amount_etb: number;
  method: string;
  screenshot_path: string;
  status: Status;
  rejection_reason: string | null;
  created_at: string;
  display_name: string | null;
  signedUrl: string | null;
}

const TABS: Status[] = ["pending", "approved", "rejected"];

export default function AdminPaymentsPage() {
  const { user, loading: authLoading, openAuth } = useAuth();
  const { isAdmin, loading: accessLoading } = useAccess();
  const [tab, setTab] = useState<Status>("pending");
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !isAdmin) return;
    setLoading(true);
    const { data: submissions } = await supabase
      .from("payment_submissions")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });

    const list = submissions ?? [];
    const userIds = Array.from(new Set(list.map((s) => s.user_id)));
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
      : { data: [] as { id: string; display_name: string | null }[] };
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

    const withUrls = await Promise.all(
      list.map(async (s) => {
        const { data: signed } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(s.screenshot_path, 600);
        return {
          ...s,
          display_name: nameById.get(s.user_id) ?? null,
          signedUrl: signed?.signedUrl ?? null,
        } as Submission;
      }),
    );
    setRows(withUrls);
    setLoading(false);
  }, [isAdmin, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (row: Submission) => {
    const supabase = getSupabase();
    if (!supabase || !user) return;
    setBusyId(row.id);
    await supabase
      .from("payment_submissions")
      .update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("id", row.id);
    await supabase
      .from("profiles")
      .update({ access_tier: row.tier, access_status: "approved" })
      .eq("id", row.user_id);
    setBusyId(null);
    load();
  };

  const reject = async (row: Submission) => {
    const reason = window.prompt("Reason for rejecting this payment (shown to the user):");
    if (reason === null) return;
    const supabase = getSupabase();
    if (!supabase || !user) return;
    setBusyId(row.id);
    await supabase
      .from("payment_submissions")
      .update({
        status: "rejected",
        rejection_reason: reason || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    await supabase.from("profiles").update({ access_status: "rejected" }).eq("id", row.user_id);
    setBusyId(null);
    load();
  };

  if (authLoading || accessLoading) {
    return (
      <main className="flex flex-grow items-center justify-center py-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center gap-md px-md py-xl text-center">
        <h1 className="font-display text-display-md text-on-surface">Sign in required</h1>
        <button
          onClick={openAuth}
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
        >
          Sign in
        </button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center gap-md px-md py-xl text-center">
        <span className="material-symbols-outlined text-[40px] text-error">block</span>
        <h1 className="font-display text-display-md text-on-surface">Not authorized</h1>
        <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
          This page is restricted to UniPath admins.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-md py-xl md:px-lg">
      <PageHeader icon="admin_panel_settings" title="Payment review" />

      <div className="mb-lg flex gap-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-md py-xs font-label-md text-label-md capitalize ${
              tab === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-outline-variant/30 text-on-surface-variant"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      ) : rows.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">No {tab} submissions.</p>
      ) : (
        <div className="space-y-md">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg sm:flex-row"
            >
              {row.signedUrl && (
                <a href={row.signedUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.signedUrl}
                    alt="Payment screenshot"
                    className="h-40 w-40 rounded-lg border border-outline-variant/30 object-cover"
                  />
                </a>
              )}
              <div className="flex-grow">
                <p className="font-label-lg text-label-lg text-on-surface">
                  {row.display_name ?? row.user_id}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {row.tier} · {row.amount_etb} ETB · {row.method} ·{" "}
                  {new Date(row.created_at).toLocaleString()}
                </p>
                {row.status === "rejected" && row.rejection_reason && (
                  <p className="mt-1 font-body-sm text-body-sm text-error">
                    Reason: {row.rejection_reason}
                  </p>
                )}
                {tab === "pending" && (
                  <div className="mt-md flex gap-sm">
                    <button
                      onClick={() => approve(row)}
                      disabled={busyId === row.id}
                      className="rounded-lg bg-primary px-md py-xs font-label-md text-on-primary disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(row)}
                      disabled={busyId === row.id}
                      className="rounded-lg border border-error px-md py-xs font-label-md text-error disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
