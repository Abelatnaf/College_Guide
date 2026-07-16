"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import { PasswordInput } from "@/components/ui/PasswordInput";

/**
 * Landing page for the "reset password" email link. The Supabase browser
 * client auto-detects the recovery session from the URL (same PKCE flow as
 * /auth/callback); once that session is live, this page lets the user set a
 * new password via supabase.auth.updateUser.
 */
function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/");
      return;
    }

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const authError =
      params.get("error_description") || hashParams.get("error_description") || params.get("error") || hashParams.get("error");
    if (authError) {
      setLinkError(authError.replace(/\+/g, " "));
      return;
    }

    let done = false;
    const finish = (hasSession: boolean) => {
      if (done) return;
      done = true;
      if (hasSession) {
        setReady(true);
      } else {
        setLinkError(
          "This reset link didn't work — it may have expired, already been used, or been opened on a different device or browser than the one you requested it from. Please request a new reset link and open it on the same device.",
        );
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish(true);
    });
    const timeout = setTimeout(() => finish(false), 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    setFormError(null);
    setStatus("saving");
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("idle");
      setFormError(error.message);
    } else {
      setStatus("done");
      setTimeout(() => router.replace("/shortlist"), 1500);
    }
  };

  if (linkError) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
        <Icon name="error" className="mb-md text-[40px] text-error" />
        <h1 className="mb-xs font-display text-[26px] text-on-surface">Reset link failed</h1>
        <p className="mb-md font-body-md text-body-md text-on-surface-variant">{linkError}</p>
        <button
          onClick={() => router.replace("/")}
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
        >
          Back to home
        </button>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
        <div className="mb-md h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
        <p className="font-body-md text-body-md text-on-surface-variant">Verifying your link…</p>
      </main>
    );
  }

  if (status === "done") {
    return (
      <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
        <Icon name="check_circle" className="mb-md text-[40px] text-primary" />
        <h1 className="mb-xs font-display text-[26px] text-on-surface">Password updated</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Taking you to your shortlist…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-grow flex-col items-center justify-center px-md py-xl">
      <div className="w-full max-w-[380px]">
        <h1 className="mb-xs text-center font-display text-[26px] text-on-surface">Set a new password</h1>
        <p className="mb-6 text-center font-body-md text-body-md text-on-surface-variant">
          Choose a new password for your account.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="New password (min 6 characters)"
            minLength={6}
          />
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
          />
          <button
            type="submit"
            disabled={status === "saving"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition-all hover:brightness-110 disabled:opacity-60"
          >
            {status === "saving" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                Saving…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
        {formError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2.5">
            <Icon name="error" className="mt-0.5 text-[16px] text-error" />
            <p className="text-xs text-error">{formError}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-grow items-center justify-center py-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
