"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { majors } from "@/data/majors";
import { MajorCard } from "@/components/ui/MajorCard";

const FILTERS = ["Most Popular", "High Salary", "Fast Growth"] as const;
type Filter = (typeof FILTERS)[number];

const CHECKLIST = [
  {
    title: "Assess your strengths",
    body: "Take our 10-minute aptitude test.",
    href: "/quiz",
  },
  {
    title: "Review market trends",
    body: "See which jobs will be in demand by 2030.",
    filter: "Fast Growth" as Filter,
  },
  {
    title: "Shadow a professional",
    body: "Connect with alumni for a day of work-shadowing.",
    href: "/contact",
  },
];

export default function MajorsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(majors[0]?.id ?? null);
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);

  const filtered = useMemo(
    () =>
      activeFilter ? majors.filter((m) => m.tags.includes(activeFilter)) : majors,
    [activeFilter],
  );

  const toggleFilter = (f: Filter) => {
    setActiveFilter((cur) => {
      const next = cur === f ? null : f;
      // Collapse the open card if it falls out of the new filtered set.
      const visible = next ? majors.filter((m) => m.tags.includes(next)) : majors;
      if (expandedId && !visible.some((m) => m.id === expandedId)) {
        setExpandedId(null);
      }
      return next;
    });
  };

  const jumpToFilter = (f: Filter) => {
    toggleFilter(f);
    document.getElementById("major-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      {/* Hero */}
      <section className="mb-xl text-center md:text-left">
        <span
          className="mb-sm inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-on-primary shadow-[0_4px_15px_rgb(var(--primary)/0.35)]"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            school
          </span>
        </span>
        <h1 className="mb-md font-display text-display-lg text-on-surface">
          Find Your Future Path
        </h1>
        <p className="mb-lg max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          Explore diverse academic fields, understand career outcomes, and discover
          which major aligns with your passions and goals.
        </p>
        <div className="flex flex-wrap justify-center gap-sm md:justify-start">
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                aria-pressed={active}
                className={
                  active
                    ? "rounded-full bg-primary px-md py-1 font-label-md text-label-md text-on-primary"
                    : "rounded-full bg-secondary-container px-md py-1 font-label-md text-label-md text-on-secondary-container transition-colors hover:bg-primary/10"
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </section>

      {/* Major cards */}
      <div id="major-grid" className="grid grid-cols-1 gap-gutter md:grid-cols-3 scroll-mt-20">
        {filtered.map((m) => (
          <div key={m.id} className={expandedId === m.id ? "md:col-span-3" : ""}>
            <MajorCard
              major={m}
              expanded={expandedId === m.id}
              onToggle={() => setExpandedId((cur) => (cur === m.id ? null : m.id))}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-lg text-center font-body-md text-on-surface-variant">
          No majors match that filter.
        </p>
      )}

      {/* Insights / matchmaker */}
      <section className="mt-xl grid gap-lg md:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
          <h2 className="mb-lg font-headline-md text-headline-md">Choosing Your Major</h2>
          <div className="space-y-md">
            {CHECKLIST.map((item) => {
              const inner = (
                <>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary transition-colors group-hover:bg-primary">
                    <span className="material-symbols-outlined text-sm text-primary group-hover:text-white">
                      check
                    </span>
                  </div>
                  <div>
                    <h4 className="font-body-md text-body-md font-bold">{item.title}</h4>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {item.body}
                    </p>
                  </div>
                </>
              );
              if (item.href) {
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-start gap-md text-left"
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => jumpToFilter(item.filter!)}
                  className="group flex w-full items-start gap-md text-left"
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>

        <div className="group relative min-h-[300px] overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-tertiary-container transition-transform duration-700 group-hover:scale-105">
            <span
              className="material-symbols-outlined absolute -bottom-10 -right-10 select-none text-white/15"
              style={{ fontSize: 220 }}
            >
              travel_explore
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/80 to-transparent p-lg">
            <h3 className="mb-xs font-headline-md text-headline-md text-white">
              University Matchmaker
            </h3>
            <p className="mb-lg font-body-md text-body-md text-white/90">
              See which universities excel in your chosen major with our smart matching
              tool.
            </p>
            <Link
              href="/quiz"
              className="w-fit rounded-lg bg-white px-lg py-2 font-label-md text-label-md text-primary shadow-lg transition-colors hover:bg-secondary-container"
            >
              Start Matching
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
