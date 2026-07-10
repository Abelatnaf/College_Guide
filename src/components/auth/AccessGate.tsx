"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAccess } from "@/components/auth/AccessProvider";
import { LockScreen } from "@/components/auth/LockScreen";

/**
 * App-wide hard paywall. Everything except marketing/legal pages, the payment
 * flow itself, auth callback, and the admin console requires a signed-in user
 * whose profile is admin or has an approved payment.
 *
 * This is a CLIENT-side gate — this app's auth is fully client-side (PKCE,
 * localStorage session, no auth cookies reach the server), so there is no
 * middleware layer that can see the session. The real security boundary for
 * data stays Supabase RLS; this gate is the product-facing "you must pay" UX.
 */
const EXEMPT_PREFIXES = ["/payment", "/auth", "/admin"];
const EXEMPT_EXACT = ["/", "/about", "/contact", "/privacy", "/terms"];

function isExempt(pathname: string): boolean {
  if (EXEMPT_EXACT.includes(pathname)) return true;
  return EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
}

export function AccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { enabled, user, loading: authLoading, openAuth } = useAuth();
  const { isUnlocked, loading: accessLoading } = useAccess();
  const router = useRouter();

  const exempt = isExempt(pathname);
  const loading = authLoading || (Boolean(user) && accessLoading);
  const blocked = enabled && !exempt && !loading && (!user || !isUnlocked);

  useEffect(() => {
    if (blocked && user) router.replace("/payment");
  }, [blocked, user, router]);

  if (exempt || !enabled) return <>{children}</>;

  if (loading) {
    return (
      <main className="flex flex-grow items-center justify-center py-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <LockScreen
        icon="lock"
        title="Sign in to continue"
        description="UniPath requires an account so we can track your paid access. Sign in or create an account to get started."
        action={
          <button
            onClick={openAuth}
            className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition hover:shadow-glow-sm"
          >
            Sign in
          </button>
        }
      />
    );
  }

  if (blocked) {
    return (
      <main className="flex flex-grow items-center justify-center py-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      </main>
    );
  }

  return <>{children}</>;
}
