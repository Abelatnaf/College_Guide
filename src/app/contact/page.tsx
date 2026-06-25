"use client";

import { useState } from "react";

const REASONS = [
  "General question",
  "Talk to an advisor",
  "Report an issue",
  "Partnership / press",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");

  const subject = encodeURIComponent(`[UniPath] ${reason}`);
  const body = encodeURIComponent(
    `Name: ${name || "—"}\nEmail: ${email || "—"}\nReason: ${reason}\n\n${message}`,
  );
  const mailtoHref = `mailto:hello@unipath.app?subject=${subject}&body=${body}`;

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="mb-md font-headline-xl text-headline-xl-mobile md:text-headline-xl">
          Get in Touch
        </h1>
        <p className="mx-auto max-w-lg font-body-lg text-body-lg text-on-surface-variant">
          Questions about a school, your match results, or just want to talk to
          an advisor? Send us a note and we&apos;ll get back to you.
        </p>
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailtoHref;
        }}
        className="mx-auto mt-xl max-w-xl space-y-md rounded-2xl border border-outline-variant bg-surface-container-low p-lg"
      >
        <div>
          <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
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
            className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
          />
        </div>
        <button
          type="submit"
          className="block w-full rounded-lg bg-primary px-lg py-3 text-center font-label-md text-on-primary transition-colors hover:bg-primary-container"
        >
          Send via Email
        </button>
        <p className="text-center font-caption text-caption text-on-surface-variant">
          Opens your email client addressed to hello@unipath.app
        </p>
      </form>
    </main>
  );
}
