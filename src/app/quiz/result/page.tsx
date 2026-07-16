"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { CampusGraphic } from "@/components/ui/CampusGraphic";
import { Icon } from "@/components/ui/Icon";

/**
 * Public, no-login shareable "result card" for a quiz match — the word-of-
 * mouth hook. Reads the match straight off the URL (?u=slug&score=87) rather
 * than any stored/personal data, so the link works for anyone who opens it,
 * including a parent or classmate who never took the quiz themselves.
 */
function ResultInner() {
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);
  const slug = params.get("u") ?? "";
  const scoreRaw = Number(params.get("score"));
  const score = Number.isFinite(scoreRaw) ? Math.min(99, Math.max(1, Math.round(scoreRaw))) : null;
  const university = getUniversityBySlug(slug);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My UniPath match", url });
        return;
      } catch {
        // user cancelled the native share sheet, fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard blocked (no focus / permission / insecure context) — fail quietly
      }
    }
  };

  if (!university || score == null) {
    return (
      <main className="flex flex-grow flex-col items-center justify-center px-md py-xl text-center">
        <Icon name="search_off" className="mb-md text-[40px] text-outline" />
        <h1 className="mb-xs font-display text-[26px] text-on-surface">Result not found</h1>
        <p className="mb-md font-body-md text-body-md text-on-surface-variant">
          This link is missing or broken. Take the quiz to get your own match.
        </p>
        <Link
          href="/quiz"
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary"
        >
          Take the quiz
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-grow flex-col items-center justify-center px-md py-xl">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lg">
        <div className="relative h-40">
          <CampusGraphic name={university.name} className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/10 to-transparent" />
        </div>
        <div className="-mt-8 px-lg pb-lg text-center">
          <div className="relative mx-auto mb-sm flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary shadow-md">
            <span className="font-headline-md text-[17px] font-bold leading-none text-on-primary">
              {score}%
            </span>
          </div>
          <p className="font-label-md text-caption uppercase tracking-wider text-primary">
            Top college match
          </p>
          <h1 className="mb-1 font-display text-[26px] text-on-surface">{university.name}</h1>
          <p className="mb-lg font-caption text-caption text-on-surface-variant">
            {flagFor(university.country)} {university.city}, {university.country}
          </p>

          <div className="mb-lg flex flex-col gap-sm sm:flex-row">
            <Link
              href="/quiz"
              className="flex-1 rounded-lg bg-primary py-3 text-center font-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Find your own match
            </Link>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-outline-variant/60 py-3 font-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name={copied ? "check" : "share"} className="text-[18px]" />
              {copied ? "Link copied" : "Share this"}
            </button>
          </div>

          <p className="font-caption text-caption text-on-surface-variant/70">
            Matched with UniPath — a directional estimate, not an admission decision.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function QuizResultPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-grow items-center justify-center py-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
        </main>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
