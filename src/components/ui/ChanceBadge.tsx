"use client";

import { getUniversityBySlug } from "@/data/universities";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import { Icon } from "@/components/ui/Icon";
import { estimateChance, type ChanceTier } from "@/lib/chances";
import { cn } from "@/lib/utils";

const TIER_CLASSES: Record<ChanceTier, string> = {
  safety:
    "bg-[#e3f4ea] text-[#0f7a4e] border-[#bfe6d1] dark:bg-[#0f7a4e]/20 dark:text-[#7fe0b2] dark:border-[#0f7a4e]/50",
  target:
    "bg-[#e5eefb] text-[#21588f] border-[#c5dbf5] dark:bg-[#21588f]/25 dark:text-[#a9c9f0] dark:border-[#21588f]/60",
  reach:
    "bg-[#fdf0dd] text-[#9a6b15] border-[#f3dcae] dark:bg-[#9a6b15]/25 dark:text-[#eccb87] dark:border-[#9a6b15]/60",
  "high-reach":
    "bg-[#fde3e1] text-[#b3261e] border-[#f6c5c1] dark:bg-[#b3261e]/25 dark:text-[#f5b4ae] dark:border-[#b3261e]/60",
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
      <Icon name="target" className="text-[14px]" />
      {chance.label}
      {showEstimate && chance.hasProfile ? ` · ~${chance.estimate}%` : ""}
    </span>
  );
}
