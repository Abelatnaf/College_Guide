/**
 * English-proficiency testing policy for international applicants, keyed by
 * university slug. Same research standard as aidPolicy.ts / feeWaivers.ts:
 * every entry is checked against the school's own official admissions page.
 *
 * Note the pattern that shows up across all five schools researched so far:
 * none of them publish a hard minimum score — third-party blog aggregators
 * commonly present invented "required minimums" that don't appear on the
 * school's own page. Where a school states no fixed cutoff, this file says
 * so explicitly rather than repeating an unsourced number.
 *
 * STARTER list (5 schools) — grows via the weekly curation pass, same as
 * feeWaivers.ts. A slug NOT present here means the policy hasn't been
 * verified yet.
 */

export interface EnglishTestPolicy {
  slug: string;
  /** Whether the school requires a proficiency test from at least some international applicants, or leaves it fully optional. */
  required: "conditional" | "optional";
  /** Which tests the school's own page lists as accepted. */
  acceptedTests: string[];
  /** Whether Duolingo English Test specifically is accepted. */
  acceptsDuolingo: boolean;
  /** The school's own stated exemption/requirement rule, paraphrased. */
  policyNote: string;
  sourceUrls: string[];
}

export const englishTests: EnglishTestPolicy[] = [
  {
    slug: "mit",
    required: "conditional",
    acceptedTests: ["TOEFL", "IELTS", "Duolingo English Test", "PTE Academic", "Cambridge English (C1 Advanced / C2 Proficiency)"],
    acceptsDuolingo: true,
    policyNote:
      "MIT strongly recommends (not strictly requires) an English proficiency score if you've used English for fewer than 5 years or don't speak it at home/school. No minimum score is published.",
    sourceUrls: ["https://mitadmissions.org/apply/firstyear/tests-scores/"],
  },
  {
    slug: "harvard",
    required: "optional",
    acceptedTests: ["TOEFL", "IELTS", "Duolingo English Test"],
    acceptsDuolingo: true,
    policyNote:
      "Harvard does not require an English proficiency exam at all for first-year or transfer applicants — TOEFL/IELTS/Duolingo cannot even be used to satisfy the standardized-testing requirement, though you may submit one for the admissions committee to review if you wish.",
    sourceUrls: [
      "https://college.harvard.edu/resources/faq/which-standardized-tests-does-harvard-require",
      "https://college.harvard.edu/admissions/apply/international-applicants",
    ],
  },
  {
    slug: "yale",
    required: "conditional",
    acceptedTests: ["TOEFL", "IELTS", "Cambridge English", "Duolingo English Test", "InitialView"],
    acceptsDuolingo: true,
    policyNote:
      "Required unless you've completed at least two years of secondary education where English was the language of instruction. Yale states its most competitive applicants tend to score TOEFL 100+, IELTS 7+, or Cambridge 185+ — described as a competitiveness signal, not a hard cutoff.",
    sourceUrls: ["https://admissions.yale.edu/english-proficiency-test-required", "https://admissions.yale.edu/standardized-testing"],
  },
  {
    slug: "princeton",
    required: "conditional",
    acceptedTests: ["TOEFL", "IELTS Academic", "Duolingo English Test", "PTE Academic"],
    acceptsDuolingo: true,
    policyNote:
      "Required if English is not your native language and you did not attend a secondary school where English was the primary language of instruction for at least three years. No minimum score is published.",
    sourceUrls: ["https://admission.princeton.edu/apply/international-students"],
  },
  {
    slug: "stanford",
    required: "optional",
    acceptedTests: ["TOEFL", "IELTS", "Duolingo English Test"],
    acceptsDuolingo: true,
    policyNote:
      "Stanford does not require any English proficiency exam. Applicants whose native language isn't English, or whose secondary schooling wasn't in English, are welcome to self-report a score, but it's optional either way.",
    sourceUrls: ["https://admission.stanford.edu/apply/international/index.html", "https://admission.stanford.edu/apply/first-year/testing.html"],
  },
];

export function getEnglishTestPolicy(slug: string): EnglishTestPolicy | undefined {
  return englishTests.find((e) => e.slug === slug);
}
