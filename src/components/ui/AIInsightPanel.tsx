"use client";

import type { QuizInsight } from "@/types/ai";

/**
 * Optional, additive panel showing AI-generated narrative reasoning for a quiz
 * match. Renders nothing when there's no insight (no API key configured, the
 * request failed, or this school's insight hasn't resolved yet) — the
 * heuristic match card above it is always complete on its own.
 */
export function AIInsightPanel({
  insight,
  loading,
}: {
  insight: QuizInsight | undefined;
  loading: boolean;
}) {
  if (!loading && !insight) return null;

  return (
    <div className="mt-sm rounded-lg border border-outline-variant bg-surface-container-low p-sm">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
        <span className="font-label-md text-caption uppercase tracking-wider text-primary">
          AI-generated insight
        </span>
      </div>
      {loading ? (
        <p className="font-caption text-caption text-on-surface-variant">
          Personalizing this match…
        </p>
      ) : insight ? (
        <>
          <p className="font-body-md text-body-md text-on-surface">{insight.narrative}</p>
          {insight.considerations.length > 0 && (
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {insight.considerations.map((c) => (
                <li key={c} className="font-caption text-caption text-on-surface-variant">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
