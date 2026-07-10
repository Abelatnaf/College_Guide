"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

type Mode = "signin" | "signup";
type Status = "idle" | "sending" | "sent" | "error" | "google-loading";

export function AuthDialog() {
  const {
    enabled, authOpen, closeAuth,
    signInWithEmail, signInWithPassword, signUpWithPassword, signInWithGoogle,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authOpen) {
      setStatus("idle");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setMessage("");
      setUseMagicLink(false);
    }
  }, [authOpen]);

  useEffect(() => {
    if (authOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [authOpen]);

  useEffect(() => {
    if (!authOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authOpen, closeAuth]);

  if (!enabled || !authOpen) return null;

  const switchMode = (m: Mode) => {
    setMode(m);
    setStatus("idle");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setUseMagicLink(false);
  };

  const submitMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setStatus("error");
      setMessage(error);
    } else {
      setStatus("sent");
      setMessage(email.trim());
    }
  };

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("sending");
    const { error } = await signInWithPassword(email.trim(), password);
    if (error) {
      setStatus("error");
      setMessage(error);
    } else {
      setStatus("idle");
    }
  };

  const submitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) return;
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setStatus("sending");
    const { error } = await signUpWithPassword(email.trim(), password, name.trim());
    if (error) {
      setStatus("error");
      setMessage(error);
    } else {
      setStatus("sent");
      setMessage(email.trim());
    }
  };

  const handleGoogle = async () => {
    setStatus("google-loading");
    const { error } = await signInWithGoogle();
    if (error) {
      setStatus("error");
      setMessage(error);
    }
  };

  const sentView = (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <span className="material-symbols-outlined text-[32px] text-primary">mark_email_read</span>
      </div>
      <h3 className="mb-2 text-lg font-bold text-on-surface">Check your inbox</h3>
      <p className="mb-1 text-sm text-on-surface-variant">
        {mode === "signup" ? "We sent a confirmation link to" : "We sent a sign-in link to"}
      </p>
      <p className="mb-4 text-sm font-semibold text-on-surface">{message}</p>
      <p className="text-xs text-on-surface-variant">
        {mode === "signup"
          ? "Click the link to confirm your account. It expires in 1 hour."
          : "Click the link in the email to sign in. It expires in 1 hour."}
      </p>
      <button
        onClick={() => { setStatus("idle"); setUseMagicLink(false); }}
        className="mt-5 text-sm font-medium text-primary hover:underline"
      >
        Use a different method
      </button>
    </div>
  );

  const inputClass =
    "w-full rounded-xl border-2 border-outline-variant/60 bg-surface py-3 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-0";

  const iconClass =
    "material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant/50";

  return (
    <div
      className="no-print fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to CollegeGuide"
    >
      <button
        aria-label="Close sign in"
        onClick={closeAuth}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />
      <div className="relative w-full max-w-[420px] animate-fade-in overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl">
        {/* Header band */}
        <div className="relative bg-primary px-8 pb-6 pt-8">
          <button
            onClick={closeAuth}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-on-primary/70 transition-colors hover:bg-white/20 hover:text-on-primary"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <span
                className="material-symbols-outlined text-[24px] text-on-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-primary">Welcome to CollegeGuide</h2>
              <p className="text-sm text-on-primary/70">
                {mode === "signin" ? "Sign in to save your progress" : "Create your account"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex border-b border-outline-variant/40">
          <button
            onClick={() => switchMode("signin")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "signin"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "signup"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 pt-6">
          {status === "sent" ? sentView : (
            <>
              {/* Google — primary action */}
              <button
                onClick={handleGoogle}
                disabled={status === "google-loading"}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-outline-variant/60 bg-white px-4 py-3 font-medium text-on-surface shadow-sm transition-all hover:border-[#4285F4] hover:shadow-md disabled:opacity-60"
              >
                {status === "google-loading" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <GoogleLogo className="h-5 w-5" />
                )}
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-outline-variant/60" />
                <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant/60">or</span>
                <span className="h-px flex-1 bg-outline-variant/60" />
              </div>

              {mode === "signin" && !useMagicLink ? (
                <form onSubmit={submitSignIn} className="space-y-3">
                  <div className="relative">
                    <span className={iconClass}>mail</span>
                    <input
                      ref={inputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <span className={iconClass}>lock</span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Sign In
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMagicLink(true)}
                    className="w-full text-center text-xs font-medium text-primary hover:underline"
                  >
                    Use a magic link instead
                  </button>
                </form>
              ) : mode === "signin" && useMagicLink ? (
                <form onSubmit={submitMagicLink} className="space-y-3">
                  <div className="relative">
                    <span className={iconClass}>mail</span>
                    <input
                      ref={inputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                        Sending link…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Send me a sign-in link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMagicLink(false)}
                    className="w-full text-center text-xs font-medium text-primary hover:underline"
                  >
                    Use password instead
                  </button>
                </form>
              ) : (
                <form onSubmit={submitSignUp} className="space-y-3">
                  <div className="relative">
                    <span className={iconClass}>person</span>
                    <input
                      ref={inputRef}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <span className={iconClass}>mail</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <span className={iconClass}>lock</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 characters)"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <span className={iconClass}>lock</span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Create Account
                      </>
                    )}
                  </button>
                </form>
              )}

              {status === "error" && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2.5">
                  <span className="material-symbols-outlined mt-0.5 text-[16px] text-error">error</span>
                  <p className="text-xs text-error">{message}</p>
                </div>
              )}

              <p className="mt-5 text-center text-[11px] leading-relaxed text-on-surface-variant/50">
                An account is required to use UniPath. Once you&apos;re signed in, you&apos;ll pick
                a plan and submit payment for approval.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
