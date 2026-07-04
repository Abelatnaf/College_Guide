import { cn } from "@/lib/utils";

/** Shimmering placeholder block for loading states. */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-gradient-to-r from-surface-container-low via-surface-container-high to-surface-container-low bg-[length:800px_100%]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Skeleton matching the university directory card layout. */
export function UniversityCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-outline-variant/30 bg-surface-container-lowest">
      <SkeletonBlock className="h-36 w-full rounded-none" />
      <div className="space-y-sm p-md">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <div className="flex gap-sm pt-xs">
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-8 w-20" />
          <SkeletonBlock className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
