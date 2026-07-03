"use client";

import { useEffect, useRef, useState } from "react";
import { readLocal, writeLocal, removeLocal, STORAGE_KEYS } from "@/lib/storage/localStore";
import type { ChatMessage } from "@/lib/ai/chatAssistant";
import type { ChatResult } from "@/app/api/chat/route";

async function requestChatReply(messages: ChatMessage[]): Promise<ChatResult> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) return { available: false };
    const data = (await res.json()) as ChatResult;
    if (!data.available || typeof data.reply !== "string") return { available: false };
    return data;
  } catch {
    return { available: false };
  }
}

// Prompts intentionally cover general strategy + the app's verified-data topics.
// Deliberately no "acceptance rate" style prompts — the assistant doesn't track those.
const SUGGESTED_PROMPTS = [
  "How do I write a strong personal statement?",
  "What's the visa process for studying in the US?",
  "Which schools are need-blind for international students?",
  "How do I get application fees waived?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(readLocal<ChatMessage[]>(STORAGE_KEYS.chatHistory, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocal(STORAGE_KEYS.chatHistory, messages);
  }, [messages, hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setUnavailable(false);

    const result = await requestChatReply(nextMessages);

    if (!result.available || !result.reply) {
      setUnavailable(true);
      setLoading(false);
      return;
    }

    setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    removeLocal(STORAGE_KEYS.chatHistory);
    setUnavailable(false);
  };

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
      <div className="flex-1 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-lg">
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
                  disabled={loading}
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
            {messages.map((m, i) => (
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
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-md py-sm font-body-md text-body-md leading-relaxed sm:max-w-[70%] ${
                    m.role === "user"
                      ? "rounded-br-md bg-primary text-on-primary shadow-[0_4px_14px_rgba(0,105,72,0.28)]"
                      : "rounded-bl-md border border-outline-variant/40 bg-surface-container-low text-on-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex animate-fade-in items-end gap-sm justify-start">
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
        <div className="flex items-center gap-sm rounded-full border border-outline-variant bg-surface-container-lowest/90 p-1.5 pl-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(0,105,72,0.12),0_4px_20px_rgba(0,0,0,0.08)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about admissions, aid, essays, visas..."
            disabled={loading}
            aria-label="Message the assistant"
            className="flex-1 border-none bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0 disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_2px_8px_rgba(0,105,72,0.3)] transition-all duration-200 hover:bg-primary-container hover:shadow-[0_4px_12px_rgba(0,105,72,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </main>
  );
}
