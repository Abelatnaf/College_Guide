import type { Metadata } from "next";
import Link from "next/link";
import { curatedSlugFor, searchUSInstitutions, usInstitutions, usSectors, usStates } from "@/lib/usInstitutions";

export const metadata: Metadata = {
  title: "US Institution Directory — UniPath",
  description:
    "Browse all 5,994 active US institutions from the IPEDS 2024 dataset, with direct admissions, financial aid, and application links.",
};

const PER_PAGE = 30;

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== 1) sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default function USDirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string; state?: string; sector?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const state = searchParams.state ?? "";
  const sector = searchParams.sector ?? "";
  const page = Number(searchParams.page ?? "1") || 1;

  const { items, total, totalPages } = searchUSInstitutions({ q, state, sector, page, perPage: PER_PAGE });
  const states = usStates();
  const sectors = usSectors();

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <div className="mb-lg flex flex-col gap-xs">
        <Link
          href="/universities"
          className="flex items-center gap-1 font-label-md text-caption text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to curated University Directory
        </Link>
        <h1 className="font-display text-display-md text-on-background">US Institution Directory</h1>
        <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
          All {usInstitutions.length.toLocaleString()} active US institutions from the IPEDS 2024
          dataset — contact info, sector, and direct admissions / financial aid / application links
          only. For rankings, tuition, acceptance rates, and full profiles, see the{" "}
          <Link href="/universities" className="text-primary hover:underline">
            curated directory
          </Link>
          .
        </p>
      </div>

      <form
        method="GET"
        className="mb-lg grid grid-cols-1 gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or city…"
          className="rounded-lg border border-outline-variant/40 bg-surface px-md py-sm font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        />
        <select
          name="state"
          defaultValue={state}
          className="rounded-lg border border-outline-variant/40 bg-surface px-md py-sm font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="sector"
          defaultValue={sector}
          className="rounded-lg border border-outline-variant/40 bg-surface px-md py-sm font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container"
        >
          Filter
        </button>
      </form>

      <p className="mb-md font-caption text-caption text-on-surface-variant">
        Showing {items.length ? (page - 1) * PER_PAGE + 1 : 0}–{(page - 1) * PER_PAGE + items.length} of{" "}
        {total.toLocaleString()} institutions
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-xl text-center">
          <span className="material-symbols-outlined mb-md text-[48px] text-outline">search_off</span>
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">No institutions found</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Try a different search term or clear the filters.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          {items.map((inst) => {
            const slug = curatedSlugFor(inst.id);
            return (
              <li key={inst.id} className="flex flex-col gap-sm p-md sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">{inst.name}</span>
                    {inst.sector && (
                      <span className="rounded-full bg-secondary-container px-2 py-0.5 font-caption text-[11px] text-on-surface-variant">
                        {inst.sector}
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {[inst.city, inst.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-wrap items-center gap-md font-label-md text-caption">
                  {slug && (
                    <Link href={`/universities/${slug}`} className="font-semibold text-primary hover:underline">
                      Full profile
                    </Link>
                  )}
                  {inst.website && (
                    <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Website ↗
                    </a>
                  )}
                  {inst.admissionsUrl && (
                    <a href={inst.admissionsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Admissions ↗
                    </a>
                  )}
                  {inst.financialAidUrl && (
                    <a href={inst.financialAidUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Financial Aid ↗
                    </a>
                  )}
                  {inst.applicationUrl && (
                    <a href={inst.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Apply ↗
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-xl flex items-center justify-center gap-md">
          <Link
            aria-disabled={page <= 1}
            href={`/universities/us-directory${buildQuery({ q, state, sector, page: page - 1 })}`}
            className={
              page <= 1
                ? "pointer-events-none flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant opacity-40"
                : "flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant transition-colors hover:bg-surface-container"
            }
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
          <span className="font-label-md text-caption text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <Link
            aria-disabled={page >= totalPages}
            href={`/universities/us-directory${buildQuery({ q, state, sector, page: page + 1 })}`}
            className={
              page >= totalPages
                ? "pointer-events-none flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant opacity-40"
                : "flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant transition-colors hover:bg-surface-container"
            }
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </nav>
      )}
    </main>
  );
}
