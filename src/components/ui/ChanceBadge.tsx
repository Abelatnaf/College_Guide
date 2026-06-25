"use client";

import { getUniversityBySlug } from "@/data/universities";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import { estimateChance, type ChanceTier } from "@/lib/chances";
import { cn } from "@/lib/utils";

const TIER_CLASSES: Record<ChanceTier, string> = {
  safety: "bg-[#e3f4ea] text-[#0f7a4e] border-[#bfe6d1]",
  target: "bg-[#e5eefb] text-[#21588f] border-[#c5dbf5]",
  reach: "bg-[#fdf0dd] text-[#9a6b15] border-[#f3dcae]",
  "high-reach": "bg-[#fde3e1] text-[#b3261e] border-[#f6c5c1]",
};

/**
 * Compact admission-chance pill. By default renders nothing until the user has
 * an academic profile (keeps directory cards clean); pass `showWithoutProfile`
 * to always render a selectivity-based label.
 */
export function ChanceBadge({
  slug,
  showWithoutProfile = false,
  showEstimate = false,
  className,
}: {
  slug: string;
  showWithoutProfile?: boolean;
  showEstimate?: boolean;
  className?: string;
}) {
  const { profile, hasProfile, hydrated } = useAcademicProfile();
  const university = getUniversityBySlug(slug);
  if (!university || !hydrated) return null;
  if (!hasProfile && !showWithoutProfile) return null;

  const chance = estimateChance(university, hasProfile ? profile : null);

  return (
    <span
      title={chance.rationale}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-label-md text-caption shadow-sm",
        TIER_CLASSES[chance.tier],
        className,
      )}
    >
      <span className="material-symbols-outlined text-[14px]">target</span>
      {chance.label}
      {showEstimate && chance.hasProfile ? ` · ~${chance.estimate}%` : ""}
    </span>
  );
}
