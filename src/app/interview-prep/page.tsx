"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";

interface Question {
  q: string;
  why: string;
}

const COMMON_QUESTIONS: Question[] = [
  { q: "Tell me about yourself.", why: "Warm-up — they want a 60-90 second story, not a résumé readout. Pick 2-3 things that connect to why you want this school." },
  { q: "Why this university?", why: "Shows you've done real research, not just prestige-chasing. Name a specific program, professor, or opportunity." },
  { q: "Why this major, and what do you want to do with it?", why: "You don't need a fixed 10-year plan — genuine curiosity beats a rehearsed answer." },
  { q: "Tell me about a challenge you've faced and how you handled it.", why: "They're listening for self-awareness and what you learned, not a perfect outcome." },
  { q: "What do you do outside of class?", why: "Depth over breadth — one activity you genuinely care about is stronger than a long list." },
  { q: "What's a book, idea, or topic you've enjoyed learning about recently?", why: "Tests intellectual curiosity beyond grades. It's fine if it's not academic." },
  { q: "What would you contribute to our campus community?", why: "Be specific and honest — a real answer beats a generic 'diversity of perspective' line." },
  { q: "Do you have any questions for me?", why: "Always have 2-3 ready. Asking nothing reads as disengaged." },
];

const CHECKLIST = [
  "Research the interviewer if you know their name (LinkedIn, program page)",
  "Prepare 2-3 specific reasons for 'why this school' beyond ranking",
  "Have 2-3 questions ready to ask them",
  "Test your camera, mic, and internet if it's a video call",
  "Pick a quiet, well-lit space with a neutral background",
  "Have a notepad nearby, but don't read from a script",
  "Plan to arrive/log on 5-10 minutes early",
  "Send a short thank-you email within 24 hours",
];

export default function InterviewPrepPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <main className="mx-auto max-w-3xl px-md py-xl md:px-lg">
      <PageHeader
        icon="headset_mic"
        title="Interview Prep"
        description="General guidance for university admissions interviews — many US schools use alumni or third-party interviewers (e.g. InitialView, Vericant) as one input among many, not a make-or-break gate."
      />

      <div className="mb-lg flex items-start gap-sm rounded-xl border border-primary/25 bg-gradient-to-r from-secondary-container/50 to-secondary-container/20 px-md py-sm">
        <Icon name="verified" className="mt-0.5 shrink-0 text-[20px] text-primary" />
        <p className="font-caption text-caption text-on-surface">
          This is <strong>general guidance</strong>, not verified per-school interview policy — whether a
          school interviews at all, and how much it weighs, varies and changes. Check each school&apos;s own
          admissions page for its current interview policy.
        </p>
      </div>

      <section className="mb-xl rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
        <h2 className="mb-md font-headline-md text-headline-md text-on-surface">Before the interview</h2>
        <ul className="space-y-2">
          {CHECKLIST.map((item, i) => (
            <li key={item}>
              <button
                onClick={() => toggle(i)}
                className="group flex w-full items-start gap-sm text-left"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2 ${
                    checked.has(i) ? "border-tertiary bg-tertiary" : "border-outline-variant"
                  }`}
                >
                  {checked.has(i) && <Icon name="check" className="text-[14px] text-on-tertiary" />}
                </span>
                <span
                  className={`font-body-md text-body-md ${
                    checked.has(i) ? "text-on-surface-variant line-through" : "text-on-surface"
                  } group-hover:text-primary`}
                >
                  {item}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {checked.size > 0 && (
          <p className="mt-md font-caption text-caption text-on-surface-variant">
            {checked.size} of {CHECKLIST.length} done
          </p>
        )}
      </section>

      <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
        <h2 className="mb-md font-headline-md text-headline-md text-on-surface">Common questions</h2>
        <div className="space-y-sm">
          {COMMON_QUESTIONS.map((item, i) => (
            <div key={item.q} className="rounded-lg border border-outline-variant/30">
              <button
                onClick={() => setExpanded((e) => (e === i ? null : i))}
                className="flex w-full items-center justify-between gap-sm p-md text-left"
              >
                <span className="font-body-md text-body-md font-semibold text-on-surface">{item.q}</span>
                <Icon
                  name={expanded === i ? "expand_less" : "expand_more"}
                  className="shrink-0 text-on-surface-variant"
                />
              </button>
              {expanded === i && (
                <p className="border-t border-outline-variant/30 p-md font-caption text-caption text-on-surface-variant">
                  {item.why}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
