"use client";

import type { University } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getCostBreakdown } from "@/lib/universityInsights";
import { estimateChance, TIER_META } from "@/lib/chances";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import { Icon } from "@/components/ui/Icon";
import { UniversityLogo } from "@/components/ui/UniversityLogo";

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
  { label: "Est. Net Price/yr", icon: "savings", format: (u) => { const c = getCostBreakdown(u); return formatCurrency(c.estimatedNetPrice, u.currency); }, value: (u) => getCostBreakdown(u).estimatedNetPrice, mode: "min", winLabel: "Best Net Price" },
  { label: "4-Year Total", icon: "account_balance_wallet", format: (u) => { const c = getCostBreakdown(u); return formatCurrency(c.fourYearTotal, u.currency); }, value: (u) => getCostBreakdown(u).fourYearTotal, mode: "min", winLabel: "Lowest 4-Year Cost" },
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

// Same dark-safe palette as ChanceBadge — this table predates the dark-only
// migration and was still using light-only chip colors that read as blown-out
// mint/red pills against the cinematic dark background.
const CHANCE_COLORS: Record<string, string> = {
  safety: "bg-[#0f7a4e]/20 text-[#7fe0b2]",
  target: "bg-[#21588f]/25 text-[#a9c9f0]",
  reach: "bg-[#9a6b15]/25 text-[#eccb87]",
  "high-reach": "bg-[#b3261e]/25 text-[#f5b4ae]",
};

export function CompareTable({ universities, allUniversities, onChange }: CompareTableProps) {
  const { profile } = useAcademicProfile();
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
                  <UniversityLogo
                    name={u.name}
                    website={u.website}
                    size={64}
                    className="border border-outline-variant"
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
                    <Icon name={row.icon} className="text-primary" />
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
                        <Icon name="star" className="text-[16px] text-primary" filled />
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="border-b border-outline-variant transition-colors hover:bg-surface-container-low">
            <td className="p-md font-label-md text-on-surface-variant">
              <div className="flex items-center gap-sm">
                <Icon name="target" className="text-primary" />
                Your Chances
              </div>
            </td>
            {universities.map((u, i) => {
              const chance = estimateChance(u, profile);
              return (
                <td key={i} className="p-md">
                  <span className={`inline-block rounded-full px-3 py-1 font-label-md text-caption ${CHANCE_COLORS[chance.tier] ?? ""}`}>
                    {TIER_META[chance.tier].label} ~{chance.estimate}%
                  </span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
