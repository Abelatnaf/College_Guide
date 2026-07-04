"use client";

import Link from "next/link";
import { useAcademicProfile, useShortlist } from "@/components/providers/StorageProvider";

/** Hydration-aware hero CTA: sends returning students to their My Path dashboard, new visitors to the quiz. */
export function HeroCta() {
  const { hasProfile, hydrated: profileHydrated } = useAcademicProfile();
  const { shortlist, hydrated: shortlistHydrated } = useShortlist();

  const hasStarted = profileHydrated && shortlistHydrated && (hasProfile || shortlist.length > 0);

  return (
    <Link
      href={hasStarted ? "/path" : "/quiz"}
      className="flex h-14 w-full items-center justify-center gap-base rounded-lg bg-primary px-lg font-label-md text-body-md text-on-primary transition-all hover:brightness-105 hover:shadow-lg sm:w-auto"
    >
      {hasStarted ? "Continue My Path" : "Get Started"}
      <span className="material-symbols-outlined">arrow_forward</span>
    </Link>
  );
}
