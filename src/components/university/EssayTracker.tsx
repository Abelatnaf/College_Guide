"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { EssayItem, EssayStatus } from "@/lib/storage/types";

const STATUS_META: Record<EssayStatus, { label: string; classes: string }> = {
  "not-started": { label: "Not started", classes: "bg-surface-container-high text-on-surface-variant" },
  drafting: { label: "Drafting", classes: "bg-secondary-container text-on-secondary-container" },
  done: { label: "Done", classes: "bg-tertiary text-on-tertiary" },
};

const NEXT_STATUS: Record<EssayStatus, EssayStatus> = {
  "not-started": "drafting",
  drafting: "done",
  done: "not-started",
};

/** Per-school essay checklist — prompt, word count vs. limit, and a status a student cycles through with one click. */
export function EssayTracker({
  essays,
  onAdd,
  onUpdate,
  onRemove,
}: {
  essays: EssayItem[];
  onAdd: (prompt: string, wordLimit: number | null) => void;
  onUpdate: (essayId: string, patch: Partial<Omit<EssayItem, "id">>) => void;
  onRemove: (essayId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [wordLimit, setWordLimit] = useState("");

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const limit = Number(wordLimit);
    onAdd(trimmed, Number.isFinite(limit) && limit > 0 ? limit : null);
    setPrompt("");
    setWordLimit("");
    setAdding(false);
  };

  return (
    <div className="mb-md">
      <div className="mb-xs flex items-center justify-between">
        <p className="font-caption text-caption text-on-surface-variant">
          {essays.filter((e) => e.status === "done").length} of {essays.length} essays done
        </p>
        <button
          onClick={() => setAdding((a) => !a)}
          className="font-label-md text-caption text-primary hover:underline"
        >
          {adding ? "Cancel" : "+ Add essay"}
        </button>
      </div>

      {adding && (
        <div className="mb-sm space-y-2 rounded-lg border border-outline-variant/40 p-sm">
          <input
            autoFocus
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Essay prompt or title"
            className="w-full rounded-md border border-outline-variant bg-surface px-2 py-1.5 font-body-sm text-body-sm focus:border-primary focus:ring-0"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={wordLimit}
              onChange={(e) => setWordLimit(e.target.value)}
              placeholder="Word limit (optional)"
              className="w-40 rounded-md border border-outline-variant bg-surface px-2 py-1.5 font-body-sm text-body-sm focus:border-primary focus:ring-0"
            />
            <button
              onClick={submit}
              disabled={!prompt.trim()}
              className="rounded-md bg-primary px-3 py-1.5 font-label-md text-caption text-on-primary disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {essays.length > 0 && (
        <ul className="space-y-1.5">
          {essays.map((essay) => (
            <li
              key={essay.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-outline-variant/30 p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-body-sm text-body-sm text-on-surface">{essay.prompt}</p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={essay.wordCount || ""}
                    onChange={(e) => onUpdate(essay.id, { wordCount: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-16 rounded-md border border-outline-variant/60 bg-surface px-1.5 py-0.5 font-caption text-caption focus:border-primary focus:ring-0"
                  />
                  <span className="font-caption text-caption text-on-surface-variant">
                    {essay.wordLimit ? `/ ${essay.wordLimit} words` : "words"}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onUpdate(essay.id, { status: NEXT_STATUS[essay.status] })}
                  className={`rounded-full px-2.5 py-1 font-label-md text-[11px] font-semibold transition-colors ${STATUS_META[essay.status].classes}`}
                >
                  {STATUS_META[essay.status].label}
                </button>
                <button
                  onClick={() => onRemove(essay.id)}
                  aria-label="Remove essay"
                  className="text-on-surface-variant hover:text-error"
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
