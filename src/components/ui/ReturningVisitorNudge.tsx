"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccess } from "@/components/auth/AccessProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getLatestQuizResult, type QuizHistoryEntry } from "@/lib/quizHistory";
import { Icon } from "@/components/ui/Icon";

/**
 * "Your matches are still saved" banner for a visitor who took the quiz
 * before but never signed up — the retention half of the free-taste funnel.
 * Renders nothing once they're unlocked, signed out entirely with no
 * account system enabled, or if they've never taken the quiz.
 */
export function ReturningVisitorNudge() {
  const { enabled } = useAuth();
  const { isUnlocked, loading } = useAccess();
  const [latest, setLatest] = useState<QuizHistoryEntry | null>(null);

  useEffect(() => {
    setLatest(getLatestQuizResult());
  }, []);

  if (!enabled || loading || isUnlocked || !latest) return null;

  return (
    <div className="mx-auto max-w-container-max px-md pt-lg md:px-lg">
      <Link
        href={`/quiz/result?u=${encodeURIComponent(latest.topMatchSlug)}&score=${latest.topMatchPercent}`}
        className="hairline flex items-center justify-between gap-md rounded-2xl border bg-secondary-container/40 p-md transition-colors hover:border-primary/40"
      >
        <span className="flex items-center gap-sm font-body-md text-body-md text-on-surface">
          <Icon name="bookmark" className="text-primary" />
          Your top match, <strong>{latest.topMatchName}</strong>, is still saved — see it again.
        </span>
        <Icon name="arrow_forward" className="shrink-0 text-primary" />
      </Link>
    </div>
  );
}
