"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence, type Variants } from "framer-motion";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAccess } from "@/components/auth/AccessProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { LockScreen } from "@/components/auth/LockScreen";
import { Stagger } from "@/components/motion/Stagger";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Tilt3D } from "@/components/motion/Tilt3D";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/lib/motion";
import { TIERS, PAYMENT_DETAILS, type Tier } from "@/lib/access/tiers";

type Method = "telebirr" | "abyssinia";
type LatestSubmission = {
  id: string;
  tier: Tier;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
} | null;

const TIER_ICON: Record<Tier, string> = {
  basic: "school",
  standard: "assignment",
  premium: "workspace_premium",
};

const TRUST_ITEMS = [
  { icon: "shield", title: "Secure Payment", desc: "Your data is safe with us" },
  { icon: "bolt", title: "Instant Access", desc: "Get started immediately" },
  { icon: "headset_mic", title: "24/7 Support", desc: "We're here to help" },
] as const;

const stepVariants: Variants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.25, ease: EASE } },
};

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1 as const, label: "Plan" },
    { n: 2 as const, label: "Pay" },
    { n: 3 as const, label: "Proof" },
  ];
  return (
    <div className="mb-xl flex items-center justify-center">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <m.div
              animate={{
                scale: step === s.n ? 1.1 : 1,
                backgroundColor: step >= s.n ? "rgb(var(--primary))" : "transparent",
              }}
              transition={{ duration: 0.3, ease: EASE }}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-label-md text-label-md ${
                step >= s.n
                  ? "border-primary text-on-primary"
                  : "border-outline-variant/40 text-on-surface-variant"
              }`}
            >
              {step > s.n ? (
                <Icon name="check" className="text-[18px]" />
              ) : (
                s.n
              )}
            </m.div>
            <span
              className={`font-label-sm text-label-sm ${
                step === s.n ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="relative mx-2 mb-4 h-0.5 w-10 overflow-hidden rounded-full bg-outline-variant/30 sm:w-20">
              <m.div
                className="absolute inset-y-0 left-0 bg-primary"
                initial={false}
                animate={{ width: step > s.n ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: EASE }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CopyField({ label, value, field, copied, onCopy }: {
  label: string;
  value: string;
  field: string;
  copied: string | null;
  onCopy: (value: string, field: string) => void;
}) {
  const isCopied = copied === field;
  return (
    <div className="flex items-center justify-between gap-md rounded-lg bg-surface-container px-md py-sm">
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
        <p className="font-body-md text-body-md text-on-surface">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, field)}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant/30 px-sm py-xs font-label-sm text-label-sm text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
      >
        <Icon name={isCopied ? "check" : "content_copy"} className="text-[16px]" />
        {isCopied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading, openAuth } = useAuth();
  const { isUnlocked, loading: accessLoading, refresh } = useAccess();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [method, setMethod] = useState<Method>("telebirr");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<LatestSubmission>(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const copy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1500);
    } catch {
      /* clipboard unavailable — copy button just silently no-ops */
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    const supabase = getSupabase();
    if (!supabase || !user || !file || !selectedTier) return;
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

      setSubmitted(true);
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
      <LockScreen
        icon="lock"
        title="Sign in to pay"
        description="Create an account or sign in first, then come back here to choose a plan."
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

  const tierInfo = selectedTier ? TIERS.find((t) => t.id === selectedTier)! : null;
  const pending = latest?.status === "pending";

  return (
    <main className="mx-auto max-w-5xl px-md py-xl md:px-lg">
      {step !== 1 && (
        <PageHeader
          icon="payments"
          title="Unlock UniPath"
          description="Pick a plan, send the payment, then upload a screenshot of the transfer. We approve access by hand, usually within a day."
        />
      )}

      {latest && (
        <Reveal
          className={`mb-lg rounded-xl border p-lg ${
            latest.status === "rejected"
              ? "border-error/40 bg-error/10"
              : "border-outline-variant/30 bg-surface-container-lowest"
          }`}
        >
          {latest.status === "pending" && !submitted && (
            <p className="font-body-md text-body-md text-on-surface">
              Your <strong className="capitalize">{latest.tier}</strong> payment is under review.
              We&apos;ll unlock your account as soon as it&apos;s approved — no need to resubmit.
            </p>
          )}
          {latest.status === "rejected" && (
            <>
              <p className="font-body-md text-body-md text-on-surface">
                Your last submission (<strong className="capitalize">{latest.tier}</strong>) was
                rejected{latest.rejection_reason ? `: ${latest.rejection_reason}` : "."}
              </p>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Double-check the amount and account, then submit a new screenshot below.
              </p>
            </>
          )}
          {submitted && latest.status === "pending" && (
            <p className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
              <Icon name="task_alt" className="text-primary" />
              Submitted! Your <strong className="capitalize">{latest.tier}</strong> payment is now
              in the review queue.
            </p>
          )}
        </Reveal>
      )}

      {!pending && (
        <>
          {step !== 1 && <Stepper step={step} />}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <m.div key="step-1" variants={stepVariants} initial="enter" animate="center" exit="exit">
                <Reveal className="mb-xl flex flex-col items-center text-center">
                  <span className="mb-md inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-label-sm text-label-sm text-primary">
                    <Icon name="gpp_good" className="text-[16px]" />
                    Choose the plan that fits you best
                  </span>
                  <h1 className="text-4xl font-extrabold text-on-surface sm:text-5xl">
                    Pick Your Plan
                  </h1>
                  <p className="mt-sm max-w-md font-body-md text-body-md text-on-surface-variant">
                    Unlock powerful tools and features to ace your application journey.
                  </p>
                </Reveal>

                <Stagger className="grid items-stretch gap-md sm:grid-cols-3" stagger={0.1}>
                  {TIERS.map((t) => (
                    <StaggerItem key={t.id} variant="scale" className="h-full">
                      <Tilt3D maxTilt={8} className="h-full rounded-2xl">
                        <div
                          className={`relative flex h-full flex-col rounded-2xl border p-lg text-center ${
                            t.id === "standard"
                              ? "border-2 border-primary bg-surface-container-lowest shadow-glow"
                              : "border-outline-variant/30 bg-surface-container-lowest"
                          }`}
                        >
                          {t.id === "standard" && (
                            <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-primary px-3 py-1 font-label-sm text-[11px] font-semibold text-on-primary shadow-glow-sm">
                              <Icon name="star" className="text-[14px]" />
                              MOST POPULAR
                            </span>
                          )}

                          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/5 text-primary">
                            <Icon name={TIER_ICON[t.id]} className="text-[26px]" />
                          </span>

                          <h3 className="mt-md font-display text-display-sm text-on-surface">
                            {t.label}
                          </h3>
                          <p className="mt-1 font-label-lg text-label-lg text-primary">
                            {t.priceEtb} ETB
                          </p>
                          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                            {t.tagline}
                          </p>

                          <div className="my-md border-t border-outline-variant/20" />

                          <ul className="flex-grow space-y-2 text-left">
                            {t.features.map((f) => (
                              <li
                                key={f}
                                className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant"
                              >
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                  <Icon name="check" className="text-[14px]" />
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => {
                              setSelectedTier(t.id);
                              setStep(2);
                            }}
                            className={`mt-lg rounded-lg px-lg py-sm font-label-md text-label-md transition ${
                              t.id === "standard"
                                ? "bg-primary text-on-primary hover:shadow-glow-sm"
                                : "border border-primary/40 text-primary hover:bg-primary/10"
                            }`}
                          >
                            Choose {t.label}
                          </button>
                        </div>
                      </Tilt3D>
                    </StaggerItem>
                  ))}
                </Stagger>

                <div className="mt-xl grid gap-md rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-lg sm:grid-cols-3">
                  {TRUST_ITEMS.map((item) => (
                    <div key={item.title} className="flex items-center gap-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon name={item.icon} className="text-[20px]" />
                      </span>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{item.title}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                  Pay via <strong className="text-on-surface">Telebirr</strong> or{" "}
                  <strong className="text-on-surface">Bank of Abyssinia</strong>
                </p>
              </m.div>
            )}

            {step === 2 && tierInfo && (
              <m.div key="step-2" variants={stepVariants} initial="enter" animate="center" exit="exit">
                <div className="mx-auto max-w-2xl rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
                  <div className="mb-md flex items-center justify-between">
                    <h2 className="font-display text-display-sm text-on-surface">
                      Pay {tierInfo.priceEtb} ETB for {tierInfo.label}
                    </h2>
                    <button
                      onClick={() => setStep(1)}
                      className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
                    >
                      Change plan
                    </button>
                  </div>

                  <div className="mb-md flex gap-sm">
                    {(["telebirr", "abyssinia"] as Method[]).map((m2) => (
                      <button
                        key={m2}
                        onClick={() => setMethod(m2)}
                        className={`rounded-lg border px-md py-xs font-label-md text-label-md transition ${
                          method === m2
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                        }`}
                      >
                        {m2 === "telebirr" ? "Telebirr" : "Bank of Abyssinia"}
                      </button>
                    ))}
                  </div>

                  <div className="mb-lg space-y-sm">
                    {method === "telebirr" ? (
                      <>
                        <CopyField
                          label="Telebirr number"
                          value={PAYMENT_DETAILS.telebirr.number}
                          field="telebirr-number"
                          copied={copiedField}
                          onCopy={copy}
                        />
                        <CopyField
                          label="Account name"
                          value={PAYMENT_DETAILS.telebirr.name}
                          field="telebirr-name"
                          copied={copiedField}
                          onCopy={copy}
                        />
                      </>
                    ) : (
                      <>
                        <CopyField
                          label="Bank of Abyssinia account number"
                          value={PAYMENT_DETAILS.abyssinia.accountNumber}
                          field="abyssinia-number"
                          copied={copiedField}
                          onCopy={copy}
                        />
                        <CopyField
                          label="Account name"
                          value={PAYMENT_DETAILS.abyssinia.name}
                          field="abyssinia-name"
                          copied={copiedField}
                          onCopy={copy}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep(3)}
                      className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition hover:shadow-glow-sm"
                    >
                      I&apos;ve sent it — continue
                    </button>
                  </div>
                </div>
              </m.div>
            )}

            {step === 3 && tierInfo && (
              <m.div key="step-3" variants={stepVariants} initial="enter" animate="center" exit="exit">
                <div className="mx-auto max-w-2xl rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
                  <div className="mb-md flex items-center justify-between">
                    <h2 className="font-display text-display-sm text-on-surface">
                      Upload your payment screenshot
                    </h2>
                    <button
                      onClick={() => setStep(2)}
                      className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
                    >
                      Back
                    </button>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mb-lg flex cursor-pointer flex-col items-center justify-center gap-sm rounded-xl border-2 border-dashed p-xl text-center transition ${
                      dragActive
                        ? "border-primary bg-primary/10"
                        : "border-outline-variant/40 hover:border-primary/40"
                    }`}
                  >
                    {previewUrl ? (
                      <m.img
                        key={previewUrl}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        src={previewUrl}
                        alt="Selected payment screenshot"
                        className="h-40 w-40 rounded-lg object-cover shadow-glow-sm"
                      />
                    ) : (
                      <>
                        <Icon name="cloud_upload" className="text-[36px] text-on-surface-variant" />
                        <p className="font-body-md text-body-md text-on-surface">
                          Drag & drop your screenshot here
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          or click to browse
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </div>

                  {file && (
                    <div className="mb-md flex items-center justify-between rounded-lg bg-surface-container px-md py-sm">
                      <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                        {file.name}
                      </span>
                      <button
                        onClick={() => setFile(null)}
                        className="font-label-sm text-label-sm text-error hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {error && <p className="mb-md font-body-sm text-body-sm text-error">{error}</p>}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={!file || submitting}
                      className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition enabled:hover:shadow-glow-sm disabled:opacity-40"
                    >
                      {submitting ? "Submitting…" : "Submit for review"}
                    </button>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </>
      )}
    </main>
  );
}
