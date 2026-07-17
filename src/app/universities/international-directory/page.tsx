import type { Metadata } from "next";
import Link from "next/link";
import { curatedSlugForIntl, intlCountries, intlInstitutions, searchIntlInstitutions } from "@/lib/intlInstitutions";
import { flagFor } from "@/data/flags";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "International Institution Directory — UniPath",
  description:
    "Browse thousands of universities and colleges outside the US, sourced from the Hipo university-domains-list project, with direct website links.",
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

export default function IntlDirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string; country?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const country = searchParams.country ?? "";
  const page = Number(searchParams.page ?? "1") || 1;

  const { items, total, totalPages } = searchIntlInstitutions({ q, country, page, perPage: PER_PAGE });
  const countries = intlCountries();

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <div className="mb-lg flex flex-col gap-xs">
        <Link
          href="/universities"
          className="flex items-center gap-1 font-label-md text-caption text-primary hover:underline"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          Back to curated University Directory
        </Link>
        <h1 className="font-display text-display-md text-on-background">International Institution Directory</h1>
        <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
          {intlInstitutions.length.toLocaleString()} universities and colleges outside the US, across{" "}
          {countries.length} countries — name and direct website link only, sourced from the{" "}
          <a
            href="https://github.com/Hipo/university-domains-list"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            Hipo university-domains-list
          </a>{" "}
          project. For rankings, tuition, acceptance rates, and full profiles, see the{" "}
          <Link href="/universities" className="text-primary hover:underline">
            curated directory
          </Link>{" "}
          — or for US institutions specifically, the{" "}
          <Link href="/universities/us-directory" className="text-primary hover:underline">
            US Institution Directory
          </Link>
          .
        </p>
      </div>

      <form
        method="GET"
        className="mb-lg grid grid-cols-1 gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md sm:grid-cols-[1fr_auto_auto]"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="rounded-lg border border-outline-variant/40 bg-surface px-md py-sm font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        />
        <select
          name="country"
          defaultValue={country}
          className="rounded-lg border border-outline-variant/40 bg-surface px-md py-sm font-body-md text-body-md text-on-surface outline-none focus:border-primary"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
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
          <Icon name="search_off" className="mb-md text-[48px] text-outline" />
          <h3 className="mb-xs font-headline-md text-headline-md text-on-surface">No institutions found</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Try a different search term or clear the filters.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/20 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          {items.map((inst) => {
            const slug = curatedSlugForIntl(inst.id);
            return (
              <li key={inst.id} className="flex flex-col gap-sm p-md sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base leading-none">{flagFor(inst.country)}</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface">{inst.name}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {[inst.stateProvince, inst.country].filter(Boolean).join(", ")}
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
            href={`/universities/international-directory${buildQuery({ q, country, page: page - 1 })}`}
            className={
              page <= 1
                ? "pointer-events-none flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant opacity-40"
                : "flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant transition-colors hover:bg-surface-container"
            }
          >
            <Icon name="chevron_left" />
          </Link>
          <span className="font-label-md text-caption text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <Link
            aria-disabled={page >= totalPages}
            href={`/universities/international-directory${buildQuery({ q, country, page: page + 1 })}`}
            className={
              page >= totalPages
                ? "pointer-events-none flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant opacity-40"
                : "flex h-10 items-center justify-center rounded-full px-md text-on-surface-variant transition-colors hover:bg-surface-container"
            }
          >
            <Icon name="chevron_right" />
          </Link>
        </nav>
      )}
    </main>
  );
}
