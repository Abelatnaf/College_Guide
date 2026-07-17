"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { universities, universityCountries } from "@/data/universities";
import { getAidPolicy } from "@/data/aidPolicy";
import { UniversityCard } from "@/components/ui/UniversityCard";
import { UniversityCardSkeleton } from "@/components/ui/CardSkeleton";
import { Icon } from "@/components/ui/Icon";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import {
  FilterSidebar,
  DEFAULT_FILTERS,
  type UniversityFilters,
} from "@/components/ui/FilterSidebar";

/** Brief shimmer while a filter change re-sorts/re-filters the grid — long enough to read, short enough to never feel laggy. */
const FILTER_TRANSITION_MS = 220;

const PER_PAGE = 8;

const SORT_OPTIONS = [
  { value: "ranking", label: "Ranking (Best First)" },
  { value: "tuition", label: "Tuition (Low to High)" },
  { value: "acceptance", label: "Acceptance Rate (High to Low)" },
  { value: "alpha", label: "Alphabetical" },
];

function parseFilters(sp: URLSearchParams): UniversityFilters {
  const tuition = sp.get("tuition");
  const acceptance = sp.get("acceptance");
  return {
    search: sp.get("search") ?? "",
    country: sp.get("country") ?? "All",
    region: sp.get("region") ?? "All",
    sort: sp.get("sort") ?? "ranking",
    ranking: sp.get("ranking") ?? "all",
    scholarshipOnly: sp.get("scholarship") === "1",
    fullNeedOnly: sp.get("fullNeed") === "1",
    maxTuition: tuition ? Number(tuition) : 100000,
    acceptance: acceptance ? acceptance.split(",").filter(Boolean) : [],
  };
}

function inAcceptanceBucket(rate: number, bucket: string): boolean {
  if (bucket === "elite") return rate < 10;
  if (bucket === "competitive") return rate >= 10 && rate <= 30;
  if (bucket === "accessible") return rate > 30;
  return false;
}

export function DirectoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countries = useMemo(() => universityCountries(), []);
  const topRef = useRef<HTMLDivElement>(null);
  const { hasProfile, hydrated: profileHydrated } = useAcademicProfile();

  const [filters, setFilters] = useState<UniversityFilters>(() =>
    parseFilters(searchParams),
  );
  const [page, setPage] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  // Pick up an external `search` change (e.g. the navbar search box).
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setFilters((f) => (f.search === urlSearch ? f : { ...f, search: urlSearch }));
  }, [searchParams]);

  // Reflect the active filters back into the URL (shareable / bookmarkable).
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.search) p.set("search", filters.search);
    if (filters.country !== "All") p.set("country", filters.country);
    if (filters.region !== "All") p.set("region", filters.region);
    if (filters.sort !== "ranking") p.set("sort", filters.sort);
    if (filters.ranking !== "all") p.set("ranking", filters.ranking);
    if (filters.scholarshipOnly) p.set("scholarship", "1");
    if (filters.fullNeedOnly) p.set("fullNeed", "1");
    if (filters.maxTuition !== 100000) p.set("tuition", String(filters.maxTuition));
    if (filters.acceptance.length) p.set("acceptance", filters.acceptance.join(","));
    const qs = p.toString();
    if (qs !== searchParams.toString()) {
      router.replace(qs ? `/universities?${qs}` : "/universities", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const filterKey = JSON.stringify(filters);

  // Reset to the first page whenever the filter set changes.
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  // Brief shimmer whenever the visible result set changes (filter or page),
  // so a filter tweak reads as a deliberate transition rather than an
  // instant, jarring re-layout.
  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), FILTER_TRANSITION_MS);
    return () => clearTimeout(t);
  }, [filterKey, page]);

  const filtered = useMemo(() => {
    const list = universities.filter((u) => {
      if (filters.country !== "All" && u.country !== filters.country) return false;
      if (filters.region !== "All" && u.region !== filters.region) return false;
      if (u.annualTuition > filters.maxTuition) return false;
      if (filters.scholarshipOnly && !u.scholarships.available) return false;
      if (filters.fullNeedOnly && getAidPolicy(u.slug)?.meetsFullDemonstratedNeed !== true) return false;
      if (filters.ranking === "top50" && u.globalRanking > 50) return false;
      if (filters.ranking === "top100" && u.globalRanking > 100) return false;
      if (filters.ranking === "top500" && u.globalRanking > 500) return false;
      if (
        filters.acceptance.length &&
        !filters.acceptance.some((b) => inAcceptanceBucket(u.acceptanceRate, b))
      ) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!`${u.name} ${u.city} ${u.country}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (filters.sort === "tuition") return a.annualTuition - b.annualTuition;
      if (filters.sort === "acceptance") return b.acceptanceRate - a.acceptanceRate;
      if (filters.sort === "alpha") return a.name.localeCompare(b.name);
      return a.globalRanking - b.globalRanking;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = (n: number) => {
    setPage(Math.min(Math.max(1, n), totalPages));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const patch = (p: Partial<UniversityFilters>) => setFilters((f) => ({ ...f, ...p }));

  return (
    <main className="mx-auto flex max-w-container-max flex-col gap-lg px-md py-xl md:flex-row md:px-lg">
      {/* Sidebar */}
      <aside className="w-full space-y-md md:w-1/4 lg:w-1/5">
        <FilterSidebar
          filters={filters}
          countries={countries}
          onChange={patch}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </aside>

      {/* Results */}
      <section className="flex-1" ref={topRef}>
        {profileHydrated && !hasProfile && (
          <Link
            href="/profile"
            className="mb-md flex items-center justify-between gap-sm rounded-xl border border-primary/30 bg-secondary-container/40 p-md transition-colors hover:border-primary"
          >
            <span className="flex items-center gap-sm font-body-md text-body-md text-on-surface">
              <Icon name="target" className="text-primary" />
              Add your GPA &amp; test scores to see your admission chances on every school.
            </span>
            <Icon name="arrow_forward" className="text-primary" />
          </Link>
        )}
        <div className="sticky top-20 z-10 mb-8 flex flex-col gap-sm rounded-xl bg-surface/80 py-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-display-md text-on-background">
              University Directory
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Showing {filtered.length}{" "}
              {filtered.length === 1 ? "university" : "universities"} matching your
              criteria ·{" "}
              <Link href="/universities/us-directory" className="text-primary hover:underline">
                browse all 5,994 US institutions
              </Link>{" "}
              ·{" "}
              <Link href="/universities/international-directory" className="text-primary hover:underline">
                or 7,899 international institutions
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <span className="font-label-md text-caption text-on-surface-variant">
              Sort by:
            </span>
            <select
              value={filters.sort}
              onChange={(e) => patch({ sort: e.target.value })}
              className="cursor-pointer border-none bg-transparent font-label-md text-primary focus:ring-0"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {transitioning ? (
          <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {Array.from({ length: Math.min(pageItems.length || 4, PER_PAGE) }, (_, i) => (
              <UniversityCardSkeleton key={i} />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
            <Icon name="search_off" className="mb-md text-[48px] text-outline" />
            <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">
              No universities found
            </h3>
            <p className="mb-md text-body-md text-on-surface-variant">
              Try widening your filters to see more results.
            </p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {pageItems.map((u, i) => (
              <UniversityCard key={u.id} university={u} revealDelayMs={i * 60} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-xl flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="chevron_left" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => goToPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={
                  n === currentPage
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary font-label-md text-on-primary"
                    : "flex h-10 w-10 items-center justify-center rounded-full font-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
                }
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="chevron_right" />
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
