"use client";

import Image from "next/image";
import type { University } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Row {
  label: string;
  icon: string;
  format: (u: University) => string;
  value?: (u: University) => number;
  mode?: "min" | "max";
  winLabel?: string;
}

const ROWS: Row[] = [
  { label: "Tuition", icon: "payments", format: (u) => formatCurrency(u.annualTuition, u.currency), value: (u) => u.annualTuition, mode: "min", winLabel: "Best Value" },
  { label: "Global Ranking", icon: "leaderboard", format: (u) => `#${u.globalRanking}`, value: (u) => u.globalRanking, mode: "min", winLabel: "Top Ranked" },
  { label: "Acceptance Rate", icon: "person_check", format: (u) => `${u.acceptanceRate}%`, value: (u) => u.acceptanceRate, mode: "max", winLabel: "Most Accessible" },
  { label: "Scholarships", icon: "card_membership", format: (u) => (u.scholarships.available ? `${u.scholarships.types.length} programs` : "None"), value: (u) => u.financialAid, mode: "max", winLabel: "Most Aid" },
  { label: "Location", icon: "map", format: (u) => `${u.city}, ${u.country}` },
  { label: "Student Population", icon: "groups", format: (u) => formatNumber(u.studentPopulation) },
  { label: "Established", icon: "history_edu", format: (u) => String(u.established) },
  { label: "Faculty Ratio", icon: "diversity_3", format: (u) => u.facultyRatio, value: (u) => parseInt(u.facultyRatio, 10), mode: "min", winLabel: "Best Faculty Ratio" },
];

function bestIndex(row: Row, list: University[]): number {
  if (!row.value || !row.mode) return -1;
  const values = list.map(row.value);
  const ext = row.mode === "min" ? Math.min(...values) : Math.max(...values);
  if (values.every((v) => v === ext)) return -1; // no clear winner
  return values.indexOf(ext);
}

/** Per-school list of "win" labels (used by the summary cards). */
export function computeWins(list: University[]): string[][] {
  const wins: string[][] = list.map(() => []);
  for (const row of ROWS) {
    if (!row.winLabel) continue;
    const idx = bestIndex(row, list);
    if (idx >= 0) wins[idx].push(row.winLabel);
  }
  return wins;
}

interface CompareTableProps {
  universities: University[];
  allUniversities: University[];
  onChange: (slotIndex: number, slug: string) => void;
}

export function CompareTable({ universities, allUniversities, onChange }: CompareTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="w-1/4 bg-surface-container-low p-md font-label-md text-label-md text-primary">
              Metric
            </th>
            {universities.map((u, i) => (
              <th key={i} className="bg-surface-container-low p-md align-top">
                <div className="flex flex-col items-center gap-sm text-center">
                  <Image
                    className="h-16 w-16 rounded-lg border border-outline-variant object-cover"
                    alt={u.name}
                    src={u.logoImage}
                    width={120}
                    height={120}
                  />
                  <select
                    value={u.slug}
                    onChange={(e) => onChange(i, e.target.value)}
                    className="w-full max-w-[180px] rounded-lg border border-outline-variant bg-surface px-2 py-1.5 font-label-md text-caption text-on-surface focus:ring-2 focus:ring-primary/20"
                    aria-label={`Change school ${i + 1}`}
                  >
                    {allUniversities.map((opt) => (
                      <option key={opt.slug} value={opt.slug}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const best = bestIndex(row, universities);
            return (
              <tr key={row.label} className="border-b border-outline-variant transition-colors hover:bg-surface-container-low">
                <td className="p-md font-label-md text-on-surface-variant">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">{row.icon}</span>
                    {row.label}
                  </div>
                </td>
                {universities.map((u, i) => (
                  <td
                    key={i}
                    className={
                      "p-md font-body-md " +
                      (i === best ? "bg-on-primary-container font-bold text-primary" : "")
                    }
                  >
                    <span className="flex items-center gap-1">
                      {row.format(u)}
                      {i === best && (
                        <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
