"use client";

import { useState } from "react";
import Link from "next/link";
import type { Major } from "@/types";
import { Tilt3D } from "@/components/motion/Tilt3D";
import { Icon } from "@/components/ui/Icon";

interface MajorCardProps {
  major: Major;
  expanded: boolean;
  onToggle: () => void;
}

export function MajorCard({ major, expanded, onToggle }: MajorCardProps) {
  const [openSub, setOpenSub] = useState<string | null>(null);

  if (!expanded) {
    return (
      <Tilt3D maxTilt={8} className="h-full rounded-xl">
        <button
          onClick={onToggle}
          className="group flex h-full w-full flex-col rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-lg text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
        >
          <div className="mb-md flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon name={major.icon} />
          </div>
          <h3 className="mb-xs font-headline-md text-headline-md">{major.name}</h3>
          <p className="mb-lg flex-grow font-body-md text-body-md text-on-surface-variant">
            {major.description}
          </p>
          <div className="flex items-center justify-between font-label-md text-label-md text-primary">
            <span>Explore {major.subMajors.length} Tracks</span>
            <Icon name="arrow_forward" />
          </div>
        </button>
      </Tilt3D>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)] ring-2 ring-primary">
      <div className="pointer-events-none absolute right-0 top-0 p-lg opacity-10">
        <Icon name={major.icon} className="text-[120px]" filled />
      </div>

      <button
        onClick={onToggle}
        className="mb-lg flex w-full items-center gap-md text-left"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-container text-white">
          <Icon name={major.icon} className="text-4xl" />
        </div>
        <div className="flex-1">
          <h2 className="font-headline-lg text-headline-lg text-primary">{major.name}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {major.description}
          </p>
        </div>
        <Icon name="expand_less" className="text-primary" />
      </button>

      <div className="grid gap-lg border-t border-outline-variant pt-lg md:grid-cols-2">
        {/* Sub-majors */}
        <div>
          <h3 className="mb-sm font-label-md text-label-md uppercase tracking-wider text-primary">
            Sub-Majors
          </h3>
          <div className="flex flex-col gap-sm">
            {major.subMajors.map((sm) => {
              const open = openSub === sm.name;
              return (
                <div
                  key={sm.name}
                  className="overflow-hidden rounded-lg bg-surface-container-low"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSub(open ? null : sm.name)}
                    aria-expanded={open}
                    className="group flex w-full items-center justify-between p-sm text-left transition-colors hover:bg-secondary-container"
                  >
                    <div>
                      <span className="font-body-md text-body-md font-semibold text-on-surface">
                        {sm.name}
                      </span>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {sm.avgStartingSalary} avg · {sm.jobGrowth} job growth
                      </p>
                    </div>
                    <Icon
                      name="expand_more"
                      className={`text-on-surface-variant transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="border-t border-outline-variant/40 px-sm pb-sm pt-sm">
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        {sm.description}
                      </p>
                      <div className="mt-sm flex flex-wrap gap-xs">
                        <span className="inline-flex items-center gap-xs rounded-full bg-primary-container/15 px-sm py-0.5 font-caption text-caption text-primary">
                          <Icon name="payments" className="text-sm" />
                          {sm.avgStartingSalary} avg starting
                        </span>
                        <span className="inline-flex items-center gap-xs rounded-full bg-primary-container/15 px-sm py-0.5 font-caption text-caption text-primary">
                          <Icon name="trending_up" className="text-sm" />
                          {sm.jobGrowth} job growth
                        </span>
                      </div>
                      <Link
                        href={`/quiz?field=${encodeURIComponent(sm.name)}`}
                        className="mt-sm inline-flex items-center gap-xs font-label-md text-label-md text-primary transition-colors hover:underline"
                      >
                        Match me with universities for this
                        <Icon name="arrow_forward" className="text-sm" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary + careers */}
        <div className="space-y-lg">
          <div className="rounded-xl border border-primary-container/20 bg-primary-container/10 p-md">
            <h3 className="mb-xs font-label-md text-label-md text-primary">
              Avg. Starting Salary
            </h3>
            <p className="font-headline-md text-headline-md font-extrabold text-primary-container">
              {major.avgStartingSalary}
            </p>
            <div className="mt-sm h-2 w-full overflow-hidden rounded-full bg-outline-variant">
              <div
                className="h-full rounded-full bg-primary-container"
                style={{ width: `${major.salaryBarPercent}%` }}
              />
            </div>
            <p className="mt-xs font-caption text-caption text-on-surface-variant">
              {major.tags.join(" • ")}
            </p>
          </div>
          <div>
            <h3 className="mb-sm font-label-md text-label-md uppercase tracking-wider text-primary">
              Common Career Paths
            </h3>
            <ul className="space-y-xs">
              {major.careerPaths.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-xs font-body-md text-body-md text-on-surface-variant"
                >
                  <Icon name="check_circle" className="text-sm text-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
