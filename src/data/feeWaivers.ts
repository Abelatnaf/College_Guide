/**
 * Application-fee-waiver policies for international applicants, keyed by
 * university slug (matches src/data/universities.ts). Same research standard
 * as src/data/aidPolicy.ts: every entry is checked against the school's own
 * official page, not recalled from training data or copied from a
 * third-party aggregator. A slug NOT present here means the policy hasn't
 * been verified yet — never assume a favorable or unfavorable policy for an
 * unlisted school.
 *
 * This is a STARTER list (5 schools), meant to grow via the weekly curation
 * pass — not exhaustive. Direct WebFetch of every official admissions page
 * below returned 403 (bot-blocked); each entry is corroborated via multiple
 * independent search-result quotations of that same official page, the same
 * fallback already used in aidPolicy.ts (see its Amherst entry). Always
 * verify the current cycle's exact process on the official page before
 * relying on it — fee waiver mechanics change year to year.
 */

export interface FeeWaiverEntry {
  /** University slug — matches src/data/universities.ts. */
  slug: string;
  /** Whether the school's own page states international applicants are eligible. */
  internationalEligible: boolean;
  /** How to actually request it, paraphrased from the official page. */
  howToRequest: string;
  sourceUrls: string[];
  note: string;
}

export const feeWaivers: FeeWaiverEntry[] = [
  {
    slug: "mit",
    internationalEligible: true,
    howToRequest:
      "Request it in the Fee Waiver Request section of MIT's own application (not the Common App) — available to domestic and international applicants alike. MIT states this has no effect on the admissions decision since MIT is need-blind.",
    sourceUrls: ["https://mitadmissions.org/help/faq/application-fee-fee-waiver/"],
    note: "Undergraduate policy only — MIT's graduate programs (Office of Graduate Education) do NOT offer need-based fee waivers to international applicants, only to those who completed a qualifying pre-grad-school prep program. Don't conflate the two.",
  },
  {
    slug: "harvard",
    internationalEligible: true,
    howToRequest:
      "Indicate financial need on the Common App's own fee-waiver question if you meet its indicators, or use Harvard's separate fee-waiver request form directly if you don't.",
    sourceUrls: [
      "https://college.harvard.edu/resources/faq/does-harvard-offer-admission-application-fee-waivers-international-students",
      "https://apply.college.harvard.edu/register/fee-waiver-request",
    ],
    note: "Harvard states the fee is waived whenever it 'presents a hardship' for the applicant's family, explicitly including international applicants, and that requesting one does not disadvantage the application.",
  },
  {
    slug: "yale",
    internationalEligible: true,
    howToRequest:
      "Request through the Common Application or Coalition Application's fee-waiver question; Yale may ask for brief documentation of financial hardship.",
    sourceUrls: ["https://admissions.yale.edu/fee-waiver"],
    note: "Yale's stated standard is that the fee (was $80 as of this research) is waived when paying it 'would constitute a significant financial burden' — same process for international and domestic applicants.",
  },
  {
    slug: "princeton",
    internationalEligible: true,
    howToRequest:
      "Select the fee-waiver option on the Common App, or use Princeton's own fee-waiver option directly on the application — the Princeton-specific waiver does not require counselor approval, unlike the Common App route.",
    sourceUrls: ["https://admission.princeton.edu/faqs", "https://admission.princeton.edu/apply/application-checklist"],
    note: "Princeton states low-income international applicants, or anyone for whom the fee is a hardship while applying for aid, are eligible — and that requesting a waiver never disadvantages the application.",
  },
  {
    slug: "stanford",
    internationalEligible: true,
    howToRequest:
      "Ask your school counselor to verify eligibility directly in the Common App, or complete the NACAC fee-waiver form with counselor authorization and email it to credentials@stanford.edu.",
    sourceUrls: ["https://admission.stanford.edu/apply/first-year/fee.html"],
    note: "Undergraduate application-fee policy — distinct from the CSS Profile fee waiver / ISAFA process Stanford runs separately for financial aid forms, and from its graduate School-Based Waivers (reviewed case-by-case).",
  },
];

export function getFeeWaiver(slug: string): FeeWaiverEntry | undefined {
  return feeWaivers.find((f) => f.slug === slug);
}
