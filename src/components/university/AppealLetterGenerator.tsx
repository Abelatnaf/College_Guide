"use client";

import { useRef, useState } from "react";
import type { CostInputs, CostResults } from "@/lib/cost";
import { buildAppealLetterRequest } from "@/lib/ai/appealLetter";
import type { University } from "@/types";

const MIN_REASON_WORDS = 20;

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function AppealLetterGenerator({
  university: u,
  inputs,
  results,
}: {
  university: University;
  inputs: CostInputs;
  results: CostResults;
}) {
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const words = wordCount(reason);
  const canGenerate = words >= MIN_REASON_WORDS && !loading && !streaming;

  const generate = async () => {
    if (!canGenerate) return;
    setDraft("");
    setUnavailable(false);
    setLoading(true);
    setCopied(false);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";

    try {
      const payload = buildAppealLetterRequest(u, inputs, results, reason.trim());
      const res = await fetch("/api/appeal-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const contentType = res.headers.get("Content-Type") ?? "";
      if (!res.ok || contentType.includes("application/json") || !res.body) {
        setUnavailable(true);
        setLoading(false);
        abortRef.current = null;
        return;
      }

      setStreaming(true);
      setLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setDraft(acc);
      }

      setStreaming(false);
      if (!acc) setUnavailable(true);
      abortRef.current = null;
    } catch (err) {
      setLoading(false);
      setStreaming(false);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (!acc && !isAbort) setUnavailable(true);
      abortRef.current = null;
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <h3 className="mb-sm font-headline-md text-headline-md">Financial Aid Appeal Letter</h3>
      <p className="mb-md font-caption text-caption text-on-surface-variant">
        Draft a starting letter to request a reconsideration of your aid offer, based on the
        numbers above. AI-generated generic draft — not legal or financial advice. Verify your
        school&apos;s actual appeal process before sending.
      </p>

      <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
        Why are you appealing? (changed circumstances, a competing offer, etc.)
      </label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        placeholder="e.g. My family's financial situation changed since I applied because…"
        className="w-full rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
      />
      <p className="mt-1 font-caption text-caption text-on-surface-variant">
        {words} word{words === 1 ? "" : "s"}
        {words < MIN_REASON_WORDS && words > 0 && ` · write at least ${MIN_REASON_WORDS} to generate a draft`}
      </p>

      <button
        onClick={generate}
        disabled={!canGenerate}
        className="mt-md w-full rounded-lg bg-primary py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-40"
      >
        {loading || streaming ? "Generating…" : "Generate draft letter"}
      </button>

      {unavailable && (
        <p className="mt-md rounded-lg bg-surface-container-low p-md font-caption text-caption text-on-surface-variant">
          AI drafting is unavailable right now. Try again later.
        </p>
      )}

      {(draft || streaming) && (
        <div className="mt-md">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            readOnly={streaming}
            rows={14}
            className="w-full rounded-lg border-2 border-outline-variant bg-surface p-md font-body-md text-body-md focus:border-primary focus:ring-0"
          />
          <button
            onClick={copyDraft}
            disabled={streaming}
            className="mt-sm rounded-lg border-2 border-primary px-md py-2 font-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  );
}
