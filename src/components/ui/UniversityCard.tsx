import Link from "next/link";
import type { University } from "@/types";
import { flagFor } from "@/data/flags";
import { formatCurrency } from "@/lib/utils";
import { ShortlistButton } from "@/components/ui/ShortlistButton";
import { ChanceBadge } from "@/components/ui/ChanceBadge";
import { LocationImage } from "@/components/ui/LocationImage";
import { UniversityLogo } from "@/components/ui/UniversityLogo";

const FILL_1 = { fontVariationSettings: "'FILL' 1" } as const;

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low">
        <span className="material-symbols-outlined text-primary" style={FILL_1}>
          {icon}
        </span>
      </div>
      <div>
        <p className="mb-1 font-caption text-caption leading-none text-on-surface-variant">
          {label}
        </p>
        <p className="font-label-md text-on-surface">{value}</p>
      </div>
    </div>
  );
}

export function UniversityCard({
  university,
  revealDelayMs = 0,
}: {
  university: University;
  /** Stagger delay for the card's entrance animation (paired with animate-fade-up). */
  revealDelayMs?: number;
}) {
  return (
    <div
      className="group flex animate-fade-up flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest opacity-0 shadow-[0_4px_15px_rgb(var(--shadow-ambient)/0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
      style={{ animationDelay: `${revealDelayMs}ms` }}
    >
      <div className="relative h-40 overflow-hidden bg-primary-container/10">
        <LocationImage
          name={university.name}
          slug={university.slug}
          country={university.country}
          city={university.city}
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/70 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="text-lg leading-none">{flagFor(university.country)}</span>
          <span className="font-caption text-caption font-bold text-on-surface">
            {university.country}
          </span>
        </div>
        <ShortlistButton
          slug={university.slug}
          variant="icon"
          className="absolute right-4 top-4"
        />
        <ChanceBadge slug={university.slug} className="absolute bottom-3 left-4" />
      </div>

      <div className="flex-1 p-md">
        <div className="mb-4 flex items-center gap-3">
          <UniversityLogo
            name={university.name}
            website={university.website}
            size={40}
            className="-mt-8 border-4 border-surface-container-lowest shadow-md"
          />
          <h3 className="font-headline-md text-xl font-bold text-on-background">
            {university.name}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-y-4">
          <Stat icon="military_tech" label="Global Rank" value={`#${university.globalRanking}`} />
          <Stat
            icon="payments"
            label="Annual Tuition"
            value={formatCurrency(university.annualTuition, university.currency)}
          />
          <Stat
            icon="task_alt"
            label="Acceptance Rate"
            value={`${university.acceptanceRate}%`}
          />
          <Stat
            icon="calendar_month"
            label="Application Due"
            value={university.applicationDeadline}
          />
        </div>
      </div>

      <div className="p-md pt-0">
        <Link
          href={`/universities/${university.slug}`}
          className="block w-full rounded-lg bg-secondary-container py-3 text-center font-label-md text-label-md text-primary transition-all duration-200 hover:bg-primary hover:text-on-primary"
        >
          View Full Profile
        </Link>
      </div>
    </div>
  );
}
