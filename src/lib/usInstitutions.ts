import type { USInstitution } from "@/types";
import rawInstitutions from "@/data/usInstitutions.json";
import curatedCrosswalk from "@/data/curatedUsCrosswalk.json";

/** Full IPEDS 2024 directory of active US institutions (5,994 records). */
export const usInstitutions = rawInstitutions as USInstitution[];

/** Maps an IPEDS institution id to the slug of its rich curated profile, where one exists. */
const crosswalk = curatedCrosswalk as Record<string, string>;

export function curatedSlugFor(institutionId: string): string | undefined {
  return crosswalk[institutionId];
}

export function usStates(): string[] {
  return Array.from(new Set(usInstitutions.map((i) => i.state).filter((s): s is string => !!s))).sort();
}

export function usSectors(): string[] {
  return Array.from(new Set(usInstitutions.map((i) => i.sector).filter((s): s is string => !!s))).sort();
}

export interface USInstitutionQuery {
  q?: string;
  state?: string;
  sector?: string;
  page?: number;
  perPage?: number;
}

export interface USInstitutionResults {
  items: USInstitution[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function searchUSInstitutions({
  q = "",
  state = "",
  sector = "",
  page = 1,
  perPage = 30,
}: USInstitutionQuery): USInstitutionResults {
  const needle = q.trim().toLowerCase();
  let filtered = usInstitutions;
  if (needle) {
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(needle) ||
        (i.city && i.city.toLowerCase().includes(needle)),
    );
  }
  if (state) filtered = filtered.filter((i) => i.state === state);
  if (sector) filtered = filtered.filter((i) => i.sector === sector);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return { items, total, page: safePage, perPage, totalPages };
}
