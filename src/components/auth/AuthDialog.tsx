"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Lightweight, optional sign-in modal. Triggered just-in-time (never a wall) and
 * only rendered when Supabase is configured. Magic-link first, Google as a
 * one-click accelerator. Anonymous users never see this.
 */
export function AuthDialog() {
  const { enabled, authOpen, closeAuth, signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authOpen) {
      setStatus("idle");
      setEmail("");
      setMessage("");
    }
  }, [authOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!authOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authOpen, closeAuth]);

  if (!enabled || !authOpen) return null;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setStatus("error");
      setMessage(error);
    } else {
      setStatus("sent");
      setMessage(`We sent a sign-in link to ${email.trim()}. Check your inbox.`);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-[100] flex items-center justify-center p-md"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to UniPath"
    >
      <button
        aria-label="Close sign in"
        onClick={closeAuth}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md animate-fade-in rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-2xl">
        <button
          onClick={closeAuth}
          aria-label="Close"
          className="absolute right-md top-md flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-md flex items-center gap-base">
          <span
            className="material-symbols-outlined text-[28px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface">Save your progress</h2>
        </div>
        <p className="mb-lg font-body-md text-body-md text-on-surface-variant">
          Sign in to sync your shortlist, profile, and applications across devices. It&apos;s
          optional — everything keeps working on this device without an account.
        </p>

        {status === "sent" ? (
          <div className="rounded-lg border border-primary/30 bg-secondary-container/40 p-md text-center">
            <span className="material-symbols-outlined mb-xs text-[32px] text-primary">mail</span>
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
          </div>
        ) : (
          <>
            <form onSubmit={submitEmail} className="space-y-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-lg border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-lg bg-primary py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>

            {status === "error" && (
              <p className="mt-sm font-caption text-caption text-error">{message}</p>
            )}

            <div className="my-md flex items-center gap-sm">
              <span className="h-px flex-1 bg-outline-variant" />
              <span className="font-caption text-caption text-on-surface-variant">or</span>
              <span className="h-px flex-1 bg-outline-variant" />
            </div>

            <button
              onClick={() => signInWithGoogle()}
              className="flex w-full items-center justify-center gap-sm rounded-lg border-2 border-outline-variant bg-surface py-3 font-label-md text-on-surface transition-colors hover:border-primary"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
