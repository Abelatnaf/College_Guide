"use client";

import Link from "next/link";
import { useAccess } from "@/components/auth/AccessProvider";
import { TIERS, type Tier } from "@/lib/access/tiers";

/**
 * Per-feature gate, layered on top of the app-wide AccessGate paywall. A user
 * can be "approved" on Basic and still be blocked from Standard/Premium-only
 * tools — this renders an upsell instead of the feature in that case.
 */
export function RequireTier({ tier, children }: { tier: Tier; children: React.ReactNode }) {
  const { hasAccess, loading } = useAccess();

  if (loading) {
    return (
      <main className="flex flex-grow items-center justify-center py-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      </main>
    );
  }

  if (hasAccess(tier)) return <>{children}</>;

  const tierInfo = TIERS.find((t) => t.id === tier)!;
  return (
    <main className="flex flex-grow flex-col items-center justify-center gap-md px-md py-xl text-center">
      <span className="material-symbols-outlined text-[40px] text-on-surface-variant">lock</span>
      <h1 className="font-display text-display-md text-on-surface">
        {tierInfo.label} plan required
      </h1>
      <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
        This feature is part of the {tierInfo.label} plan ({tierInfo.priceEtb} ETB) and up.
      </p>
      <Link
        href="/payment"
        className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
      >
        View plans
      </Link>
    </main>
  );
}
