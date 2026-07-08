"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Client-side auth callback. The Supabase browser client auto-detects the
 * session from the URL (PKCE / magic link). We just wait for it, then send the
 * user to their shortlist. Kept fully client-side so no route opts into dynamic
 * rendering and the static university pages stay prerendered.
 */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/");
      return;
    }

    const next = params.get("next") || "/shortlist";
    const authError = params.get("error_description");
    if (authError) {
      setError(authError);
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      router.replace(next);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish();
    });
    const timeout = setTimeout(finish, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, params]);

  return (
    <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
      {error ? (
        <>
          <span className="material-symbols-outlined mb-md text-[40px] text-error">error</span>
          <h1 className="mb-xs font-display text-[26px] text-on-surface">
            Sign-in failed
          </h1>
          <p className="mb-md font-body-md text-body-md text-on-surface-variant">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
          >
            Back to home
          </button>
        </>
      ) : (
        <>
          <div className="mb-md h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
          <p className="font-body-md text-body-md text-on-surface-variant">Signing you in…</p>
        </>
      )}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-grow items-center justify-center py-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
        </main>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
