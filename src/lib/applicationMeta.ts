import type { ApplicationStatus } from "@/lib/storage/types";

/** Display label and pill colors for each application status. */
export const STATUS_META: Record<ApplicationStatus, { label: string; classes: string }> = {
  considering: { label: "Considering", classes: "bg-surface-container-high text-on-surface-variant" },
  planning: {
    label: "Planning",
    classes: "bg-[#e5eefb] text-[#21588f] dark:bg-[#21588f]/25 dark:text-[#a9c9f0]",
  },
  in_progress: {
    label: "In progress",
    classes: "bg-[#fdf0dd] text-[#9a6b15] dark:bg-[#9a6b15]/25 dark:text-[#eccb87]",
  },
  submitted: { label: "Submitted", classes: "bg-secondary-container text-on-secondary-container" },
  accepted: {
    label: "Accepted",
    classes: "bg-[#e3f4ea] text-[#0f7a4e] dark:bg-[#0f7a4e]/20 dark:text-[#7fe0b2]",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-[#fde3e1] text-[#b3261e] dark:bg-[#b3261e]/25 dark:text-[#f5b4ae]",
  },
  waitlisted: {
    label: "Waitlisted",
    classes: "bg-[#efe6fb] text-[#6b3fa0] dark:bg-[#6b3fa0]/25 dark:text-[#cdb3ec]",
  },
  deferred: {
    label: "Deferred",
    classes: "bg-[#eceff4] text-[#46506b] dark:bg-[#46506b]/30 dark:text-[#b8c2dd]",
  },
};

/** Sort weight so active applications surface above resolved ones. */
export const STATUS_ORDER: Record<ApplicationStatus, number> = {
  in_progress: 0,
  planning: 1,
  considering: 2,
  submitted: 3,
  waitlisted: 4,
  deferred: 5,
  accepted: 6,
  rejected: 7,
};
