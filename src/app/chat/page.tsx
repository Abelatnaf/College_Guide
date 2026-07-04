"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { readLocal, writeLocal, removeLocal, STORAGE_KEYS } from "@/lib/storage/localStore";
import type { ChatMessage } from "@/lib/ai/chatAssistant";

// Prompts intentionally cover general strategy + the app's verified-data topics.
// Deliberately no "acceptance rate" style prompts — the assistant doesn't track those.
const SUGGESTED_PROMPTS = [
  "How do I write a strong personal statement?",
  "What's the visa process for studying in the US?",
  "Which schools are need-blind for international students?",
  "How do I get application fees waived?",
];

/** Markdown → Tailwind-styled elements. Compact margins — chat bubbles, not an article. */
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-1 mt-2 font-body-lg text-body-lg font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1 mt-2 font-body-lg text-body-lg font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2 font-body-md text-body-md font-semibold first:mt-0">{children}</h3>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:no-underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-primary/30 pl-3 italic text-on-surface-variant">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-surface-container p-3 text-[0.85em] last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const text = String(children ?? "");
    const isInline = !className && !text.includes("\n");
    return isInline ? (
      <code className="rounded bg-surface-container px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    ) : (
      <code className="font-mono text-[0.85em]">{children}</code>
    );
  },
};

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}

export default function ChatPage() {
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
        headers: { "Content-Type": "application/json" },
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

  return (
    <main className="mx-auto flex h-[calc(100vh-5rem)] max-w-container-max flex-col px-md pb-lg pt-lg md:px-lg">
      {/* Header */}
      <div className="mb-md flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-sm">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_4px_15px_rgba(0,105,72,0.35)]"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </span>
          <div>
            <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-headline-lg text-headline-lg font-bold text-transparent">
              Ask AI
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A college-admissions assistant for general strategy, essays, visas, test prep, and
              more.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="group inline-flex items-center gap-1 self-start rounded-full border border-outline-variant bg-surface-container-lowest px-md py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm transition-all duration-200 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_0_3px_rgba(0,105,72,0.12)] sm:self-auto"
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

      {/* Message list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-lg"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-md text-center">
            <span
              className="mb-md flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary-container to-secondary-container/40 text-primary shadow-[0_8px_30px_rgba(0,105,72,0.18)]"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </span>
            <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
              What can I help with?
            </h3>
            <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">
              Ask about essay strategy, visa basics, test prep, application timelines, how
              need-blind admissions work, or general study-abroad advice for international
              applicants. Ask about a specific school&apos;s fees or aid policy and I&apos;ll check
              UniPath&apos;s verified data for you — I&apos;ll say so plainly if it isn&apos;t
              covered yet.
            </p>

            {/* Suggested prompt chips */}
            <div className="mt-lg grid w-full max-w-xl grid-cols-1 gap-sm sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={busy}
                  className="group flex items-center gap-sm rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-md py-sm text-left font-body-md text-body-md text-on-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_20px_rgba(0,105,72,0.12)] disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="material-symbols-outlined shrink-0 text-[20px] text-primary/70 transition-colors duration-200 group-hover:text-primary">
                    arrow_outward
                  </span>
                  <span className="flex-1">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_2px_8px_rgba(0,105,72,0.3)]"
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
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-md py-sm font-body-md text-body-md leading-relaxed text-on-primary shadow-[0_4px_14px_rgba(0,105,72,0.28)] sm:max-w-[70%]">
                      {m.content}
                    </div>
                  ) : (
                    <div className="group flex max-w-[85%] flex-col items-start gap-1 sm:max-w-[75%]">
                      <div className="w-full rounded-2xl rounded-bl-md border border-outline-variant/40 bg-surface-container-low px-md py-sm font-body-md text-body-md text-on-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                        <AssistantMarkdown content={m.content} />
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_2px_8px_rgba(0,105,72,0.3)]"
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
        )}
      </div>

      {/* Input — sticky, premium, focus glow */}
      <div className="sticky bottom-0 mt-md pt-sm">
        <div className="flex items-end gap-sm rounded-3xl border border-outline-variant bg-surface-container-lowest/90 p-1.5 pl-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(0,105,72,0.12),0_4px_20px_rgba(0,0,0,0.08)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about admissions, aid, essays, visas..."
            rows={1}
            disabled={busy}
            aria-label="Message the assistant"
            className="max-h-[140px] flex-1 resize-none self-center border-none bg-transparent py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0 disabled:opacity-60"
          />
          {busy ? (
            <button
              onClick={stopGenerating}
              aria-label="Stop generating"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-outline-variant bg-surface-container text-on-surface shadow-sm transition-all duration-200 hover:border-primary/60 hover:text-primary"
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
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-primary text-on-primary shadow-[0_2px_8px_rgba(0,105,72,0.3)] transition-all duration-200 hover:bg-primary-container hover:shadow-[0_4px_12px_rgba(0,105,72,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
