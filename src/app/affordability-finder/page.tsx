import type { Metadata } from "next";
import { getUniversityBySlug } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { aidPolicy, type AidPolicyEntry } from "@/data/aidPolicy";
import { affordabilitySchools, type AffordabilitySchool } from "@/data/affordabilitySchools";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Affordability Finder — UniPath",
  description:
    "Which universities are actually need-blind and meet full demonstrated need for international students — verified against official financial-aid pages, with sources.",
};

/** One row on this page: either a main-directory University or a standalone AffordabilitySchool, paired with its verified aid policy. */
interface Candidate {
  slug: string;
  name: string;
  city: string;
  country: string;
  website: string;
  acceptanceRate: number;
  tuitionLabel: string;
  policy: AidPolicyEntry;
}

function fromUniversity(policy: AidPolicyEntry): Candidate | null {
  const u = getUniversityBySlug(policy.slug);
  if (!u) return null;
  return {
    slug: u.slug,
    name: u.name,
    city: u.city,
    country: u.country,
    website: u.website,
    acceptanceRate: u.acceptanceRate,
    tuitionLabel: formatCurrency(u.annualTuition, u.currency),
    policy,
  };
}

function fromAffordabilitySchool(school: AffordabilitySchool, policy?: AidPolicyEntry): Candidate | null {
  if (!policy) return null;
  return {
    slug: school.slug,
    name: school.name,
    city: school.city,
    country: school.country,
    website: school.website,
    acceptanceRate: school.acceptanceRate,
    tuitionLabel: `${formatCurrency(school.annualTuition, "USD")} (${school.tuitionBasis})`,
    policy,
  };
}

function buildCandidates(): Candidate[] {
  const affordabilitySlugs = new Set(affordabilitySchools.map((s) => s.slug));
  const candidates: Candidate[] = [];

  for (const policy of Object.values(aidPolicy)) {
    if (affordabilitySlugs.has(policy.slug)) continue; // handled below, paired with its school record
    const c = fromUniversity(policy);
    if (c) candidates.push(c);
  }

  for (const school of affordabilitySchools) {
    const c = fromAffordabilitySchool(school, aidPolicy[school.slug]);
    if (c) candidates.push(c);
  }

  return candidates;
}

function CandidateCard({ c }: { c: Candidate }) {
  return (
    <div className="flex flex-col gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-sm">
        <div>
          <p className="font-body-md text-body-md font-semibold text-on-surface">
            {flagFor(c.country)} {c.name}
          </p>
          <p className="font-caption text-caption text-on-surface-variant">
            {c.city}, {c.country}
          </p>
        </div>
        <p className="shrink-0 text-right font-body-md text-body-md font-semibold text-on-surface">
          {c.tuitionLabel}
        </p>
      </div>

      <p className="font-caption text-caption text-on-surface-variant">
        Acceptance rate: {c.acceptanceRate}%
      </p>

      <p className="rounded-lg bg-surface-container-low p-sm font-caption text-caption text-on-surface">
        {c.policy.note}
      </p>

      <a
        href={c.policy.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start font-caption text-caption text-primary underline hover:no-underline"
      >
        Source
      </a>
    </div>
  );
}

export default function AffordabilityFinderPage() {
  const candidates = buildCandidates();

  // Every candidate has meetsFullDemonstratedNeed explicitly true/false (never null) in aidPolicy.ts,
  // but needBlindForInternational can be true / false / null (genuinely unverified). These five buckets
  // partition on both fields explicitly so an unverified needBlind status never gets silently folded
  // into a "confirmed need-aware" or "confirmed need-blind" bucket.
  const tier1 = candidates.filter(
    (c) => c.policy.needBlindForInternational === true && c.policy.meetsFullDemonstratedNeed === true,
  );
  const needBlindLimitedAid = candidates.filter(
    (c) => c.policy.needBlindForInternational === true && c.policy.meetsFullDemonstratedNeed === false,
  );
  const tier2 = candidates.filter(
    (c) => c.policy.meetsFullDemonstratedNeed === true && c.policy.needBlindForInternational === false,
  );
  const tier2Unconfirmed = candidates.filter(
    (c) => c.policy.meetsFullDemonstratedNeed === true && c.policy.needBlindForInternational === null,
  );
  const tier3 = candidates.filter(
    (c) => c.policy.meetsFullDemonstratedNeed === false && c.policy.needBlindForInternational !== true,
  );

  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <PageHeader
        icon="savings"
        title="Affordability Finder"
        description={
          <>
            <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
              Two things decide whether a school will actually fund an international student:{" "}
              <strong className="text-on-surface">need-blind admission</strong> — whether asking for
              financial aid can hurt your chances of getting in — and{" "}
              <strong className="text-on-surface">meeting full demonstrated need</strong> — whether the
              school, once it admits you, covers 100% of the gap between what your family can pay and
              what it actually costs. A school can do one without the other, and the difference matters
              enormously for how you should apply.
            </p>
            <p className="mt-sm max-w-3xl font-caption text-caption text-on-surface-variant">
              Every policy below was verified against the school&apos;s own official financial-aid or
              admissions page during this research pass — not recalled from memory. These policies
              change over time (some schools have flipped need-blind status more than once), so treat
              this as a snapshot, and always confirm on the source link before you rely on it.
            </p>
          </>
        }
      />

      {/* Tier 1 */}
      <section className="mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          The best of the best: apply without worrying about aid hurting your chances
        </h2>
        <p className="mb-md font-caption text-caption text-on-surface-variant">
          Need-blind for international applicants AND meets 100% of demonstrated need once admitted.
        </p>
        {tier1.length > 0 ? (
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {tier1.map((c) => (
              <CandidateCard key={c.slug} c={c} />
            ))}
          </div>
        ) : (
          <p className="font-caption text-caption text-on-surface-variant">
            No verified schools currently meet both criteria.
          </p>
        )}
      </section>

      {/* Need-blind but limited aid — Georgetown's case: distinct from both tier 1 and "little/no aid" */}
      {needBlindLimitedAid.length > 0 && (
        <section className="mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Need-blind admission, but limited aid once admitted
          </h2>
          <p className="mb-md font-caption text-caption text-on-surface-variant">
            Asking for aid will NOT hurt your chances of getting in here — but unlike the schools
            above, these don&apos;t commit to covering your full demonstrated need once you&apos;re
            admitted. Worth applying if the school is otherwise a great fit, but don&apos;t count on
            a full-need aid package — read each card&apos;s note for specifics.
          </p>
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {needBlindLimitedAid.map((c) => (
              <CandidateCard key={c.slug} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* Tier 2 */}
      <section className="mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Need-aware, but meets full need once admitted
        </h2>
        <p className="mb-md font-caption text-caption text-on-surface-variant">
          Whether you applied for aid may factor into the admission decision — but if you&apos;re
          admitted (and applied for aid at the time you applied), the school commits to covering
          100% of your demonstrated need. At some schools that commitment reaches every admitted
          student who qualifies; at others, only a small number of international students receive
          it each year — read each card&apos;s note, since that distinction matters a lot for how
          much to count on this.
        </p>
        {tier2.length > 0 ? (
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {tier2.map((c) => (
              <CandidateCard key={c.slug} c={c} />
            ))}
          </div>
        ) : (
          <p className="font-caption text-caption text-on-surface-variant">
            No verified schools currently meet this criterion.
          </p>
        )}
      </section>

      {/* Meets full need, but admission policy for international applicants wasn't confirmed */}
      {tier2Unconfirmed.length > 0 && (
        <section className="mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Meets full need — international admission policy not confirmed
          </h2>
          <p className="mb-md font-caption text-caption text-on-surface-variant">
            These schools commit to meeting full demonstrated need for admitted international
            students, but their official pages didn&apos;t explicitly state whether financial aid
            requests factor into the admission decision itself — so we&apos;re not claiming
            need-blind OR need-aware here, only what&apos;s actually confirmed.
          </p>
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {tier2Unconfirmed.map((c) => (
              <CandidateCard key={c.slug} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* Tier 3 */}
      <section className="mb-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Limited or no aid for international students
        </h2>
        <p className="mb-md font-caption text-caption text-on-surface-variant">
          These schools don&apos;t commit to meeting your full demonstrated need as an international
          applicant. Worth applying only if you can self-fund the full cost, or worth looking
          elsewhere for aid.
        </p>
        {tier3.length > 0 ? (
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            {tier3.map((c) => (
              <CandidateCard key={c.slug} c={c} />
            ))}
          </div>
        ) : (
          <p className="font-caption text-caption text-on-surface-variant">
            No verified schools currently fall in this tier.
          </p>
        )}
      </section>

      <div className="rounded-lg bg-surface-container-low px-md py-3 font-caption text-caption text-on-surface-variant">
        Aid policy not yet verified for the other schools in our directory — including Swarthmore
        College, whose tuition and acceptance rate we&apos;ve confirmed but whose international
        aid policy we haven&apos;t independently verified yet. Check each school&apos;s official
        financial aid page directly.
      </div>
    </main>
  );
}
