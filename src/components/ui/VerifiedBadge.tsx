import { Icon } from "@/components/ui/Icon";

/**
 * Small, consistent marker for data that's been checked against an official
 * source (as opposed to estimated/heuristic data elsewhere in the app). Used
 * on aidPolicy/feeWaivers/englishTests/scholarships surfaces so a student can
 * tell at a glance which numbers are sourced and which are directional.
 */
export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-tertiary/15 px-2.5 py-1 font-caption text-caption font-semibold text-tertiary ${className}`}
    >
      <Icon name="verified" className="text-[13px]" />
      Verified
    </span>
  );
}
