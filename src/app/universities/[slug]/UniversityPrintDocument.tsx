import type { Major, University } from "@/types";
import { flagFor } from "@/data/flags";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  getAdmissionsTier,
  getApplicationTimeline,
  getCostBreakdown,
  getFAQs,
  getWhyChooseBullets,
  type PercentileContext,
} from "@/lib/universityInsights";

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-t border-outline-variant/40">
      <td className="py-1.5 pr-4 align-top text-on-surface-variant">{label}</td>
      <td
        className={
          "py-1.5 text-right align-top " + (bold ? "font-bold text-primary" : "font-semibold")
        }
      >
        {value}
      </td>
    </tr>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-avoid-break mb-6">
      <h2 className="mb-2 border-b border-outline-variant pb-1 font-headline-md text-headline-md text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Full detailed university profile, rendered only inside `@media print` (see
 * the `.print-only` rule in globals.css). Triggered via window.print() so the
 * user can save it as a PDF — no extra dependency, no network calls, and it
 * stays in lockstep with the on-screen profile since both read from the same
 * `university` object and the same derived-insight helpers.
 */
export function UniversityPrintDocument({
  university: u,
  similar,
  percentile,
  majorDetails,
}: {
  university: University;
  similar: University[];
  percentile: PercentileContext;
  majorDetails: Major[];
}) {
  const admissions = getAdmissionsTier(u);
  const cost = getCostBreakdown(u);
  const bullets = getWhyChooseBullets(u);
  const timeline = getApplicationTimeline(u);
  const faqs = getFAQs(u);
  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="print-only mx-auto max-w-3xl px-8 py-6 text-on-surface">
      <header className="print-avoid-break mb-4 flex items-center justify-between border-b-2 border-primary pb-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={u.logoImage}
            alt={`${u.name} logo`}
            className="h-16 w-16 rounded-lg border border-outline-variant object-cover"
          />
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{u.name}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {flagFor(u.country)} {u.city}, {u.country} · {u.region}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-headline-md text-headline-md text-primary">#{u.globalRanking}</p>
          <p className="font-caption text-caption text-on-surface-variant">Global Ranking</p>
        </div>
      </header>

      <p className="mb-6 font-caption text-caption text-on-surface-variant">
        Detailed admissions profile compiled by UniPath on {generatedOn}. Figures are directory
        estimates intended for planning purposes — always confirm exact requirements and costs
        with the official admissions office at {u.website}.
      </p>

      <Section title="At a Glance">
        <table className="w-full font-body-md text-body-md">
          <tbody>
            <Row label="Established" value={String(u.established)} />
            <Row label="Student Population" value={formatNumber(u.studentPopulation)} />
            <Row label="Faculty Ratio" value={u.facultyRatio} />
            <Row label="Average Class Size" value={String(u.avgClassSize)} />
            <Row label="Acceptance Rate" value={`${u.acceptanceRate}%`} />
            <Row label="Annual Tuition" value={formatCurrency(u.annualTuition, u.currency)} />
            <Row label="Financial Aid Recipients" value={`${u.financialAid}%`} />
            <Row label="Application Deadline" value={u.applicationDeadline} />
            <Row label="Website" value={u.website} />
          </tbody>
        </table>
      </Section>

      <Section title={`About ${u.name}`}>
        <p className="font-body-md text-body-md leading-relaxed">{u.description}</p>
        <p className="mt-2 font-caption text-caption text-on-surface-variant">
          Tags: {u.tags.join(" · ")}
        </p>
      </Section>

      <Section title={`Why Students Choose ${u.name}`}>
        <ul className="list-disc space-y-1 pl-5 font-body-md text-body-md">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </Section>

      <Section title={`Admissions — ${admissions.label}`}>
        <p className="mb-2 font-body-md text-body-md">{admissions.blurb}</p>
        <p className="mb-2 font-body-md text-body-md">
          This school is more selective than approximately {percentile.selectivityPercentile}% of
          schools in our directory, ranks better than {percentile.rankPercentile}% of them, and is
          more affordable than {percentile.affordabilityPercentile}% (out of{" "}
          {percentile.totalCompared} schools compared).
        </p>
        <p className="mb-1 font-label-md text-label-md text-on-surface">Typical requirements:</p>
        <ul className="mb-2 list-disc space-y-1 pl-5 font-body-md text-body-md">
          {admissions.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="font-caption text-caption text-on-surface-variant">
          {admissions.testGuidance}
        </p>
      </Section>

      <Section title="Cost of Attendance (Estimated, per year)">
        <table className="w-full font-body-md text-body-md">
          <tbody>
            <Row label="Tuition" value={formatCurrency(cost.tuition, u.currency)} />
            <Row label="Housing & Living" value={formatCurrency(cost.housing, u.currency)} />
            <Row
              label="Books & Supplies"
              value={formatCurrency(cost.booksAndSupplies, u.currency)}
            />
            <Row
              label="Personal Expenses"
              value={formatCurrency(cost.personalExpenses, u.currency)}
            />
            <Row
              label="Total Cost of Attendance"
              value={formatCurrency(cost.totalCostOfAttendance, u.currency)}
              bold
            />
            <Row
              label="Est. Average Grant / Aid"
              value={`- ${formatCurrency(cost.estimatedAverageGrant, u.currency)}`}
            />
            <Row
              label="Est. Net Price"
              value={formatCurrency(cost.estimatedNetPrice, u.currency)}
              bold
            />
            <Row
              label="4-Year Total (before aid)"
              value={formatCurrency(cost.fourYearTotal, u.currency)}
            />
          </tbody>
        </table>
        <p className="mt-2 font-caption text-caption text-on-surface-variant">
          Estimates for international students; actual aid varies by applicant profile.
        </p>
      </Section>

      <Section title="Scholarships">
        {u.scholarships.available ? (
          <ul className="list-disc space-y-1 pl-5 font-body-md text-body-md">
            {u.scholarships.types.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="font-body-md text-body-md">No dedicated scholarship programs listed.</p>
        )}
      </Section>

      {majorDetails.length > 0 && (
        <Section title="Majors & Career Outcomes">
          <div className="space-y-3">
            {majorDetails.map((m) => (
              <div key={m.id}>
                <p className="font-body-md text-body-md font-semibold">
                  {m.name} — {m.avgStartingSalary} avg. starting salary
                </p>
                <p className="font-caption text-caption text-on-surface-variant">
                  Common careers: {m.careerPaths.slice(0, 4).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Campus Life">
        <p className="font-body-md text-body-md leading-relaxed">{u.campusLife}</p>
      </Section>

      <Section title="Suggested Application Timeline">
        <ul className="space-y-2 font-body-md text-body-md">
          {timeline.map((t) => (
            <li key={t.stage}>
              <span className="font-semibold">{t.stage}:</span> {t.action}
            </li>
          ))}
        </ul>
      </Section>

      {similar.length > 0 && (
        <Section title="Similar Universities to Consider">
          <table className="w-full font-body-md text-body-md">
            <thead>
              <tr className="text-left font-label-md text-label-md text-on-surface-variant">
                <th className="py-1">School</th>
                <th className="py-1">Rank</th>
                <th className="py-1">Tuition</th>
                <th className="py-1">Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {similar.map((s) => (
                <tr key={s.slug} className="border-t border-outline-variant/40">
                  <td className="py-1">{s.name}</td>
                  <td className="py-1">#{s.globalRanking}</td>
                  <td className="py-1">{formatCurrency(s.annualTuition, s.currency)}</td>
                  <td className="py-1">{s.acceptanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title="Frequently Asked Questions">
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q}>
              <p className="font-body-md text-body-md font-semibold">{f.q}</p>
              <p className="font-caption text-caption text-on-surface-variant">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <footer className="mt-8 border-t border-outline-variant pt-4 text-center font-caption text-caption text-on-surface-variant">
        Prepared by UniPath · {u.website} · For planning purposes only — not an official offer of
        admission.
      </footer>
    </div>
  );
}
