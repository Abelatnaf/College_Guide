"use client";

import { useState } from "react";

const REASONS = [
  "General question",
  "Question about a school or match",
  "Report an issue",
  "Partnership / press",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

  const subject = encodeURIComponent(`[UniPath] ${reason}`);
  const body = encodeURIComponent(
    `Name: ${name || "—"}\nEmail: ${email || "—"}\nReason: ${reason}\n\n${message}`,
  );
  const mailtoHref = `mailto:hello@unipath.app?subject=${subject}&body=${body}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // No Web3Forms key configured — fall back to the mailto: link so the form still works.
    if (!accessKey) {
      window.location.href = mailtoHref;
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `[UniPath] ${reason}`,
          name,
          email,
          reason,
          message,
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <section className="mx-auto max-w-2xl text-center">
        <span
          className="mb-sm inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_4px_15px_rgb(var(--primary)/0.35)]"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            mail
          </span>
        </span>
        <h1 className="mb-md bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-headline-xl text-headline-xl-mobile font-bold text-transparent md:text-headline-xl">
          Get in Touch
        </h1>
        <p className="mx-auto max-w-lg font-body-lg text-body-lg text-on-surface-variant">
          Questions about a school, your match results, or the site itself?
          Send us a note and we&apos;ll get back to you by email.
        </p>
      </section>

      {status === "success" ? (
        <div className="mx-auto mt-xl max-w-xl rounded-2xl border border-primary/30 bg-secondary-container/30 p-lg text-center">
          <span className="material-symbols-outlined mb-sm text-[40px] text-primary">check_circle</span>
          <h2 className="mb-xs font-headline-md text-headline-md text-on-surface">Message sent</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Thanks for reaching out — we&apos;ll get back to you by email soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-xl max-w-xl space-y-md rounded-2xl border border-outline-variant bg-surface-container-low p-lg"
        >
          {/* Honeypot — hidden from real visitors, Web3Forms rejects submissions where this is filled in. */}
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

          <div>
            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
            />
          </div>
          <div>
            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Your email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
            />
          </div>
          <div>
            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="How can we help?"
              required
              className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
            />
          </div>

          {status === "error" && (
            <div className="flex items-start gap-sm rounded-xl border border-error/30 bg-error-container/40 p-md">
              <span className="material-symbols-outlined shrink-0 text-error">error</span>
              <p className="font-body-md text-body-md text-on-surface">
                Something went wrong sending your message. Please try again, or email us directly at{" "}
                <a href="mailto:hello@unipath.app" className="text-primary underline hover:no-underline">
                  hello@unipath.app
                </a>
                .
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="block w-full rounded-lg bg-primary px-lg py-3 text-center font-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Send Message"}
          </button>
          <p className="text-center font-caption text-caption text-on-surface-variant">
            {accessKey
              ? "Sent directly to our team — no email app required."
              : "Opens your email client addressed to hello@unipath.app"}
          </p>
        </form>
      )}
    </main>
  );
}
