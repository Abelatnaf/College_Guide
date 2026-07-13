"use client";

import { useEffect, useRef, useState } from "react";
import { readLocal, writeLocal, removeLocal, STORAGE_KEYS } from "@/lib/storage/localStore";
import type { ChatMessage } from "@/lib/ai/chatAssistant";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders } from "@/lib/access/authHeader";

// Prompts intentionally cover general strategy + the app's verified-data topics.
// Deliberately no "acceptance rate" style prompts — the assistant doesn't track those.
const SUGGESTED_PROMPTS = [
  { label: "Personal statement", icon: "edit_note", prompt: "How do I write a strong personal statement?" },
  { label: "Visa process", icon: "flight_takeoff", prompt: "What's the visa process for studying in the US?" },
  { label: "Need-blind schools", icon: "volunteer_activism", prompt: "Which schools are need-blind for international students?" },
  { label: "Fee waivers", icon: "confirmation_number", prompt: "How do I get application fees waived?" },
];

export default function ChatPage() {
  const { user } = useAuth();
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // sent, awaiting first token
  const [streaming, setStreaming] = useState(false); // tokens arriving
  const [unavailable, setUnavailable] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Ref mirror of `streaming` so the persistence effect can skip per-token writes
  // without needing to re-subscribe on every keystroke of streamed text.
  const streamingRef = useRef(false);

  useEffect(() => {
    setMessages(readLocal<ChatMessage[]>(STORAGE_KEYS.chatHistory, []));
    setHydrated(true);
  }, []);

  // Persist on change — but never mid-stream (that would write on every token).
  // The stream's completion/abort path persists the final text explicitly.
  useEffect(() => {
    if (!hydrated || streamingRef.current) return;
    writeLocal(STORAGE_KEYS.chatHistory, messages);
  }, [messages, hydrated]);

  // Follow new content, but don't fight a user who has scrolled up to read.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  const resetTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) el.style.height = "auto";
  };

  const sendMessage = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading || streaming) return;

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    resetTextareaHeight();
    setUnavailable(false);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("Content-Type") ?? "";
      // Pre-stream failure contract: JSON body (or a non-OK / bodyless response).
      if (!res.ok || contentType.includes("application/json") || !res.body) {
        setUnavailable(true);
        setLoading(false);
        abortRef.current = null;
        return;
      }

      // Streaming has begun: swap the typing indicator for a growing bubble.
      streamingRef.current = true;
      setStreaming(true);
      setLoading(false);
      setMessages([...history, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: acc }]);
      }

      // Normal completion.
      streamingRef.current = false;
      setStreaming(false);
      if (acc) {
        const finalMessages: ChatMessage[] = [...history, { role: "assistant", content: acc }];
        setMessages(finalMessages);
        writeLocal(STORAGE_KEYS.chatHistory, finalMessages);
      } else {
        // Empty response — drop the placeholder bubble, surface the error state.
        setMessages(history);
        writeLocal(STORAGE_KEYS.chatHistory, history);
        setUnavailable(true);
      }
      abortRef.current = null;
    } catch (err) {
      streamingRef.current = false;
      setStreaming(false);
      setLoading(false);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (acc) {
        // Keep whatever streamed in — covers both a user Stop and a mid-stream drop.
        const finalMessages: ChatMessage[] = [...history, { role: "assistant", content: acc }];
        setMessages(finalMessages);
        writeLocal(STORAGE_KEYS.chatHistory, finalMessages);
      } else {
        setMessages(history);
        writeLocal(STORAGE_KEYS.chatHistory, history);
        if (!isAbort) setUnavailable(true); // a user Stop with no text isn't an error
      }
      abortRef.current = null;
    }
  };

  const stopGenerating = () => {
    abortRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const copyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1500);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  };

  const clearConversation = () => {
    setMessages([]);
    removeLocal(STORAGE_KEYS.chatHistory);
    setUnavailable(false);
  };

  const busy = loading || streaming;
  const lastIndex = messages.length - 1;
  const empty = messages.length === 0;

  // Shared composer — rendered once, sized differently depending on where it appears
  // (large + centered on the empty state, slim + sticky once a conversation exists).
  const composer = (big: boolean) => (
    <div
      className={
        big
          ? "flex w-full items-end gap-sm rounded-3xl border border-outline-variant bg-surface-container-lowest p-2 pl-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgb(var(--primary)/0.12),0_8px_30px_rgba(0,0,0,0.12)]"
          : "flex items-end gap-sm rounded-3xl border border-outline-variant bg-surface-container-lowest/90 p-1.5 pl-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgb(var(--primary)/0.12),0_4px_20px_rgba(0,0,0,0.08)]"
      }
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about admissions, aid, essays, visas..."
        rows={1}
        disabled={busy}
        aria-label="Message the assistant"
        className={
          big
            ? "max-h-[140px] flex-1 resize-none self-center border-none bg-transparent py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0 disabled:opacity-60"
            : "max-h-[140px] flex-1 resize-none self-center border-none bg-transparent py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0 disabled:opacity-60"
        }
      />
      {busy ? (
        <button
          onClick={stopGenerating}
          aria-label="Stop generating"
          className={
            big
              ? "inline-flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full border border-outline-variant bg-surface-container text-on-surface shadow-sm transition-all duration-200 hover:border-primary/60 hover:text-primary"
              : "inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-outline-variant bg-surface-container text-on-surface shadow-sm transition-all duration-200 hover:border-primary/60 hover:text-primary"
          }
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            stop
          </span>
        </button>
      ) : (
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          aria-label="Send message"
          className={
            big
              ? "inline-flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-primary text-on-primary shadow-[0_2px_8px_rgb(var(--primary)/0.3)] transition-all duration-200 hover:bg-primary-container hover:shadow-[0_4px_12px_rgb(var(--primary)/0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              : "inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-primary text-on-primary shadow-[0_2px_8px_rgb(var(--primary)/0.3)] transition-all duration-200 hover:bg-primary-container hover:shadow-[0_4px_12px_rgb(var(--primary)/0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          }
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      )}
    </div>
  );

  return (
    <main className="mx-auto flex h-[calc(100vh-5rem)] max-w-container-max flex-col px-md pb-lg pt-lg md:px-lg">
      {/* Header */}
      <div className="mb-sm flex items-center justify-between gap-sm">
        <div className="flex items-center gap-sm">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_4px_15px_rgb(var(--primary)/0.35)]"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </span>
          <h1 className="font-display text-headline-md text-on-surface">Ask AI</h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="group inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest px-md py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm transition-all duration-200 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_0_3px_rgb(var(--primary)/0.12)]"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-rotate-6">
              delete_sweep
            </span>
            Clear conversation
          </button>
        )}
      </div>

      {/* Trust note — always visible, not buried. Slimmer, refined banner. */}
      <div className="mb-md flex items-start gap-sm rounded-xl border border-primary/25 bg-gradient-to-r from-secondary-container/50 to-secondary-container/20 px-md py-sm">
        <span
          className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary"
          aria-hidden="true"
        >
          verified
        </span>
        <p className="font-caption text-caption text-on-surface">
          For general advice (essays, visas, test prep, timelines) I&apos;ll use my own knowledge.
          For a specific school&apos;s fees or aid policy, I&apos;ll only use UniPath&apos;s
          verified data — and I&apos;ll tell you plainly when something isn&apos;t covered yet,
          instead of guessing. I don&apos;t track acceptance rates or tuition figures in this chat
          at all — check the school&apos;s profile page on UniPath for those.
        </p>
      </div>

      {empty ? (
        /* Empty state — centered greeting + big composer + quick-prompt pills */
        <div className="flex flex-1 flex-col items-center justify-center px-md pb-10 text-center">
          <span
            className="mb-md flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary-container to-secondary-container/40 text-primary shadow-[0_8px_30px_rgb(var(--primary)/0.18)]"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </span>
          <h2 className="mb-sm font-display text-display-lg text-on-surface">
            Hey there{firstName ? `, ${firstName}` : ""}
          </h2>
          <p className="mb-lg max-w-lg font-body-md text-body-md text-on-surface-variant">
            Ask about essays, visas, test prep, or timelines — or a specific school&apos;s fees and
            aid, checked against UniPath&apos;s verified data.
          </p>

          <div className="w-full max-w-2xl">{composer(true)}</div>

          {/* Suggested prompt pills */}
          <div className="mt-lg flex flex-wrap items-center justify-center gap-sm">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.prompt)}
                disabled={busy}
                className="group inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-lg py-2.5 font-label-md text-label-md text-on-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-[0_8px_20px_rgb(var(--primary)/0.12)] disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px] text-primary/70 transition-colors duration-200 group-hover:text-primary">
                  {p.icon}
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Message list */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-lg"
            aria-live="polite"
          >
            <div className="flex flex-col gap-md">
            {messages.map((m, i) => {
              const isStreamingMessage = streaming && i === lastIndex && m.role === "assistant";
              return (
                <div
                  key={i}
                  className={`flex animate-fade-in items-end gap-sm ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_2px_8px_rgb(var(--primary)/0.3)]"
                      aria-hidden="true"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                    </span>
                  )}

                  {m.role === "user" ? (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-md py-sm font-body-md text-body-md leading-relaxed text-on-primary shadow-[0_4px_14px_rgb(var(--primary)/0.28)] sm:max-w-[70%]">
                      {m.content}
                    </div>
                  ) : (
                    <div className="group flex max-w-[85%] flex-col items-start gap-1 sm:max-w-[75%]">
                      <div className="w-full rounded-2xl rounded-bl-md border border-outline-variant/40 bg-surface-container-low px-md py-sm font-body-md text-body-md text-on-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                        <MarkdownContent content={m.content} />
                        {isStreamingMessage && (
                          <span
                            className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      {!isStreamingMessage && m.content && (
                        <button
                          onClick={() => copyMessage(m.content, i)}
                          aria-label={copiedIndex === i ? "Copied" : "Copy message"}
                          className="ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-caption text-caption text-on-surface-variant opacity-100 transition-colors hover:text-primary sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedIndex === i ? "check" : "content_copy"}
                          </span>
                          {copiedIndex === i ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex animate-fade-in items-end justify-start gap-sm">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_2px_8px_rgb(var(--primary)/0.3)]"
                  aria-hidden="true"
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </span>
                <div
                  className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-outline-variant/40 bg-surface-container-low px-md py-sm shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                  role="status"
                  aria-label="Assistant is typing"
                >
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant" />
                </div>
              </div>
            )}

            {unavailable && (
              <div className="flex animate-fade-in items-start gap-sm rounded-2xl border border-error/30 bg-error-container/40 p-md">
                <span className="material-symbols-outlined shrink-0 text-error">error</span>
                <p className="font-body-md text-body-md text-on-surface">
                  The assistant is temporarily unavailable. Please try again in a moment.
                </p>
              </div>
            )}

            <div ref={scrollRef} />
            </div>
          </div>

          {/* Input — sticky, premium, focus glow */}
          <div className="sticky bottom-0 mt-md pt-sm">{composer(false)}</div>
        </>
      )}
    </main>
  );
}
