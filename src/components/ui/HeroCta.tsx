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
      className="group flex h-14 w-full items-center justify-center gap-base rounded-full bg-primary px-8 font-label-md text-body-md text-on-primary shadow-glow-sm transition-all duration-300 hover:shadow-glow hover:brightness-110 sm:w-auto"
    >
      {hasStarted ? "Continue My Path" : "Get Started"}
      <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">
        arrow_forward
      </span>
    </Link>
  );
}
