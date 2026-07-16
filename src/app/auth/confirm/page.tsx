"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";

/**
 * Landing page for emailed auth links (password recovery, etc.), reached via
 * a token_hash + type pair rather than Supabase's default {{ .ConfirmationURL }}
 * template. That default links straight to Supabase's own /verify endpoint,
 * which consumes the one-time code on ANY GET request — including the
 * automated link-prefetching that Gmail, Outlook Safe Links, and corporate
 * email scanners do before a human ever clicks. This page only calls
 * verifyOtp() once real browser JS executes, so a scanner visiting the link
 * (which doesn't run JS) can't burn the code before the user does.
 *
 * Requires the Supabase "Reset Password" email template to link here, e.g.:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password
 */
function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/");
      return;
    }

    const tokenHash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;
    const next = params.get("next") || "/shortlist";

    if (!tokenHash || !type) {
      setError("This link is missing required information. Please request a new one.");
      return;
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error: verifyError }) => {
      if (verifyError) {
        setError(verifyError.message);
      } else {
        router.replace(next);
      }
    });
  }, [router, params]);

  if (error) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
        <Icon name="error" className="mb-md text-[40px] text-error" />
        <h1 className="mb-xs font-display text-[26px] text-on-surface">Link failed</h1>
        <p className="mb-md font-body-md text-body-md text-on-surface-variant">{error}</p>
        <button
          onClick={() => router.replace("/")}
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
        >
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
      <div className="mb-md h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
      <p className="font-body-md text-body-md text-on-surface-variant">Verifying your link…</p>
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-grow items-center justify-center py-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
        </main>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
