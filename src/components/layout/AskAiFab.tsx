"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Floating "Ask AI" launcher pinned to the bottom-right corner on every page except the chat page itself. */
export function AskAiFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/chat")) return null;

  return (
    <Link
      href="/chat"
      aria-label="Ask AI"
      title="Ask AI"
      className="no-print group fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-outline-variant bg-gradient-to-br from-primary to-primary/80 text-on-primary shadow-[0_8px_24px_rgb(var(--primary)/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgb(var(--primary)/0.45)] active:scale-95 sm:h-auto sm:w-auto sm:bottom-6 sm:right-6 sm:py-3 sm:pl-4 sm:pr-5"
    >
      <span
        className="material-symbols-outlined text-[22px] sm:text-[20px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden="true"
      >
        auto_awesome
      </span>
      <span className="hidden whitespace-nowrap font-label-md text-label-md font-semibold sm:inline">
        Ask AI
      </span>
    </Link>
  );
}
