"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Icon } from "@/components/ui/Icon";
import { readLocal, writeLocal, newId, nowIso, STORAGE_KEYS } from "@/lib/storage/localStore";
import { authHeaders } from "@/lib/access/authHeader";

interface EssayDraft {
  id: string;
  title: string;
  /** A PROMPT_LIBRARY id, or "custom" for a blank draft. */
  type: string;
  content: string;
  updatedAt: string;
}

/**
 * Deliberately GENERIC prompt shapes — not any specific school's real, current-year
 * wording. Real per-school prompts change yearly and would need their own verified
 * research pass; fabricating one here would violate the app's no-invented-facts rule.
 */
const PROMPT_LIBRARY: { id: string; label: string; prompt: string; helper: string }[] = [
  {
    id: "personal-statement",
    label: "Personal Statement",
    prompt: "Tell your story. What has shaped who you are today, and what do you want an admissions reader to understand about you?",
    helper: "The universal 'who are you' essay — the shape behind the Common App personal statement.",
  },
  {
    id: "why-us",
    label: "Why This School",
    prompt: "Why are you interested in this particular university, and how does it fit your goals?",
    helper: "A generic shape only — always check the exact current wording and word limit on the school's own application.",
  },
  {
    id: "extracurricular",
    label: "Extracurricular / Activity",
    prompt: "Describe an activity, project, or responsibility that has been meaningful to you and why.",
    helper: "A common supplemental short-answer shape.",
  },
  {
    id: "community",
    label: "Community",
    prompt: "Describe the community you come from and how it has shaped the way you see the world.",
    helper: "Focuses on identity, background, and belonging.",
  },
  {
    id: "challenge",
    label: "Overcoming a Challenge",
    prompt: "Describe a challenge or setback you faced, and what you learned from working through it.",
    helper: "A classic resilience-and-growth shape.",
  },
];

const MIN_FEEDBACK_WORDS = 30;

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function promptLabelFor(type: string): string {
  return PROMPT_LIBRARY.find((p) => p.id === type)?.label ?? "college application";
}

export default function EssaysPage() {
  const [drafts, setDrafts] = useState<EssayDraft[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStreaming, setFeedbackStreaming] = useState(false);
  const [feedbackUnavailable, setFeedbackUnavailable] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loaded = readLocal<EssayDraft[]>(STORAGE_KEYS.essays, []);
    setDrafts(loaded);
    setActiveId(loaded[0]?.id ?? null);
    setHydrated(true);
  }, []);

  // Debounced autosave — content changes on every keystroke, so don't write on every one.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => writeLocal(STORAGE_KEYS.essays, drafts), 400);
    return () => clearTimeout(t);
  }, [drafts, hydrated]);

  const active = useMemo(() => drafts.find((d) => d.id === activeId) ?? null, [drafts, activeId]);
  const words = active ? wordCount(active.content) : 0;
  const canRequestFeedback = Boolean(active) && words >= MIN_FEEDBACK_WORDS && !feedbackLoading && !feedbackStreaming;

  const createDraft = (type: string, title: string) => {
    const draft: EssayDraft = { id: newId(), title, type, content: "", updatedAt: nowIso() };
    setDrafts((prev) => [draft, ...prev]);
    setActiveId(draft.id);
    setFeedback("");
    setFeedbackUnavailable(false);
  };

  const updateActive = (patch: Partial<Pick<EssayDraft, "title" | "content" | "type">>) => {
    if (!activeId) return;
    setDrafts((prev) =>
      prev.map((d) => (d.id === activeId ? { ...d, ...patch, updatedAt: nowIso() } : d)),
    );
  };

  const selectDraft = (id: string) => {
    abortRef.current?.abort();
    setActiveId(id);
    setFeedback("");
    setFeedbackUnavailable(false);
    setFeedbackLoading(false);
    setFeedbackStreaming(false);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (activeId === id) {
      abortRef.current?.abort();
      setActiveId(null);
      setFeedback("");
      setFeedbackUnavailable(false);
    }
  };

  const requestFeedback = async () => {
    if (!active || !canRequestFeedback) return;
    setFeedback("");
    setFeedbackUnavailable(false);
    setFeedbackLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";

    try {
      const res = await fetch("/api/essay-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ promptType: active.type, content: active.content }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("Content-Type") ?? "";
      if (!res.ok || contentType.includes("application/json") || !res.body) {
        setFeedbackUnavailable(true);
        setFeedbackLoading(false);
        abortRef.current = null;
        return;
      }

      setFeedbackStreaming(true);
      setFeedbackLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setFeedback(acc);
      }

      setFeedbackStreaming(false);
      if (!acc) setFeedbackUnavailable(true);
      abortRef.current = null;
    } catch (err) {
      setFeedbackLoading(false);
      setFeedbackStreaming(false);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (!acc && !isAbort) setFeedbackUnavailable(true);
      abortRef.current = null;
    }
  };

  const stopFeedback = () => abortRef.current?.abort();

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="edit_note"
        title="Essay Hub"
        description="Draft your application essays locally, on this device, and get structured AI feedback whenever you're ready."
      />

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        {/* Left: drafts + prompt library */}
        <div className="space-y-lg lg:col-span-1">
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <div className="mb-md flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Your drafts</h2>
              <button
                onClick={() => createDraft("custom", "Untitled draft")}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container"
              >
                <Icon name="add" className="text-[18px]" />
                New
              </button>
            </div>
            {!hydrated ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
            ) : drafts.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                No drafts yet — start one from a prompt below, or create a blank draft.
              </p>
            ) : (
              <div className="space-y-sm">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectDraft(d.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectDraft(d.id);
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-sm rounded-lg border p-md text-left transition-colors ${
                      d.id === activeId
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-label-md text-on-surface">{d.title || "Untitled draft"}</p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {promptLabelFor(d.type)} · {wordCount(d.content)} words
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDraft(d.id);
                      }}
                      aria-label={`Delete ${d.title || "draft"}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
            <h2 className="mb-1 font-headline-md text-headline-md text-on-surface">Prompt library</h2>
            <p className="mb-md font-caption text-caption text-on-surface-variant">
              Generic prompt shapes to help you start drafting — not any specific school&apos;s real
              wording. Always confirm the exact prompt and word limit on each school&apos;s own
              application.
            </p>
            <div className="space-y-sm">
              {PROMPT_LIBRARY.map((p) => (
                <button
                  key={p.id}
                  onClick={() => createDraft(p.id, p.label)}
                  className="block w-full rounded-lg border border-outline-variant/30 p-md text-left transition-colors hover:border-primary"
                >
                  <p className="font-label-md text-on-surface">{p.label}</p>
                  <p className="mt-1 font-caption text-caption text-on-surface-variant">{p.prompt}</p>
                  <p className="mt-1 font-caption text-[11px] italic text-on-surface-variant/80">{p.helper}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right: editor + feedback */}
        <div className="space-y-lg lg:col-span-2">
          {!active ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
              <Icon name="edit_note" className="mb-md text-[48px] text-outline" />
              <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
                No draft selected
              </h3>
              <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
                Pick a prompt from the library, or start a blank draft, to begin writing.
              </p>
            </div>
          ) : (
            <>
              <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
                <input
                  value={active.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="Draft title"
                  className="mb-sm w-full border-none bg-transparent font-headline-md text-headline-md text-on-surface focus:outline-none focus:ring-0"
                />
                <textarea
                  value={active.content}
                  onChange={(e) => updateActive({ content: e.target.value })}
                  placeholder="Start writing…"
                  rows={16}
                  className="w-full resize-y rounded-lg border border-outline-variant/40 bg-surface p-md font-body-md text-body-md leading-relaxed text-on-surface focus:border-primary focus:ring-0"
                />
                <div className="mt-sm flex flex-wrap items-center justify-between gap-sm">
                  <p className="font-caption text-caption text-on-surface-variant">
                    {words} {words === 1 ? "word" : "words"}
                    {words < MIN_FEEDBACK_WORDS && words > 0 && ` · write at least ${MIN_FEEDBACK_WORDS} for AI feedback`}
                  </p>
                  {feedbackStreaming ? (
                    <button
                      onClick={stopFeedback}
                      className="flex items-center gap-1 rounded-lg border border-outline-variant px-md py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-error hover:text-error"
                    >
                      <Icon name="stop_circle" className="text-[18px]" />
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={requestFeedback}
                      disabled={!canRequestFeedback}
                      className="flex items-center gap-1 rounded-lg bg-primary px-md py-1.5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon name="auto_awesome" className="text-[18px]" />
                      {feedbackLoading ? "Thinking…" : "Get AI feedback"}
                    </button>
                  )}
                </div>
              </section>

              {(feedback || feedbackLoading || feedbackUnavailable) && (
                <section className="rounded-xl border border-primary/25 bg-gradient-to-br from-secondary-container/40 to-secondary-container/10 p-lg">
                  <div className="mb-sm flex items-center gap-2">
                    <Icon name="auto_awesome" className="text-primary" />
                    <h3 className="font-headline-md text-headline-md text-on-surface">AI Feedback</h3>
                  </div>
                  <p className="mb-md font-caption text-caption text-on-surface-variant">
                    General writing feedback only — it has no verified data on any specific school, and
                    it won&apos;t rewrite your essay for you.
                  </p>
                  {feedbackUnavailable ? (
                    <div className="flex items-start gap-sm rounded-lg border border-error/30 bg-error-container/40 p-md">
                      <Icon name="error" className="shrink-0 text-error" />
                      <p className="font-body-md text-body-md text-on-surface">
                        Feedback is temporarily unavailable. Please try again in a moment.
                      </p>
                    </div>
                  ) : feedback ? (
                    <div className="font-body-md text-body-md text-on-surface">
                      <MarkdownContent content={feedback} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-on-surface-variant" role="status" aria-label="Generating feedback">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant" />
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
