import type { IntlInstitution } from "@/types";
import rawInstitutions from "@/data/intlInstitutions.json";
import curatedCrosswalk from "@/data/curatedIntlCrosswalk.json";

/**
 * Bulk international (non-US) institution directory — 7,899 records from the
 * Hipo university-domains-list project (MIT-licensed, community-maintained).
 * US institutions are excluded here since the IPEDS-derived us-directory
 * already covers them with richer, government-sourced data.
 */
export const intlInstitutions = rawInstitutions as IntlInstitution[];

/** Maps an international institution id to the slug of its rich curated profile, where one exists. */
const crosswalk = curatedCrosswalk as Record<string, string>;

export function curatedSlugForIntl(institutionId: string): string | undefined {
  return crosswalk[institutionId];
}

export function intlCountries(): string[] {
  return Array.from(new Set(intlInstitutions.map((i) => i.country))).sort();
}

export interface IntlInstitutionQuery {
  q?: string;
  country?: string;
  page?: number;
  perPage?: number;
}

export interface IntlInstitutionResults {
  items: IntlInstitution[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function searchIntlInstitutions({
  q = "",
  country = "",
  page = 1,
  perPage = 30,
}: IntlInstitutionQuery): IntlInstitutionResults {
  const needle = q.trim().toLowerCase();
  let filtered = intlInstitutions;
  if (needle) {
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(needle));
  }
  if (country) filtered = filtered.filter((i) => i.country === country);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total, page: safePage, perPage, totalPages };
}
