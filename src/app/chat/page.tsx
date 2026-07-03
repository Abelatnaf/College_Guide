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

  const sendMessage = async () => {
    const text = input.trim();
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
    <main className="mx-auto flex h-[calc(100vh-5rem)] max-w-container-max flex-col px-md py-lg md:px-lg">
      <div className="mb-md flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background">Ask AI</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            A college-admissions assistant for general strategy, essays, visas, test prep, and
            more.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="inline-flex items-center gap-1 self-start rounded-lg border border-outline-variant px-md py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            Clear conversation
          </button>
        )}
      </div>

      {/* Trust note — always visible, not buried */}
      <div className="mb-md flex items-start gap-sm rounded-xl border border-primary/30 bg-secondary-container/40 p-md">
        <span className="material-symbols-outlined text-primary">verified</span>
        <p className="font-caption text-caption text-on-surface">
          For general advice (essays, visas, test prep, timelines) I&apos;ll use my own knowledge.
          For a specific school&apos;s fees or aid policy, I&apos;ll only use UniPath&apos;s
          verified data — and I&apos;ll tell you plainly when something isn&apos;t covered yet,
          instead of guessing. I don&apos;t track acceptance rates or tuition figures in this chat
          at all — check the school&apos;s profile page on UniPath for those.
        </p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined mb-md text-[48px] text-outline">
              forum
            </span>
            <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
              What can I help with?
            </h3>
            <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
              Ask about essay strategy, visa basics, test prep, application timelines, how
              need-blind admissions work, or general study-abroad advice for international
              applicants. Ask about a specific school&apos;s fees or aid policy and I&apos;ll check
              UniPath&apos;s verified data for you — I&apos;ll say so plainly if it isn&apos;t
              covered yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-md py-sm font-body-md text-body-md shadow-sm sm:max-w-[70%] ${
                    m.role === "user"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-xl bg-surface-container-low px-md py-sm shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-on-surface-variant" />
                </div>
              </div>
            )}

            {unavailable && (
              <div className="flex items-start gap-sm rounded-xl border border-outline-variant/50 bg-surface-container-low p-md">
                <span className="material-symbols-outlined text-on-surface-variant">
                  error
                </span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  The assistant is temporarily unavailable. Please try again in a moment.
                </p>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-md flex items-center gap-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about admissions, aid, essays, visas..."
          disabled={loading}
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm font-body-md text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-lg py-sm font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </div>
    </main>
  );
}
