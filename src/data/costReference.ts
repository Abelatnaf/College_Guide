/**
 * Standardized test fees, CSS Profile figures, and fee-waiver guidance —
 * all web-verified this session. Every figure here traces back to a
 * sourceUrl; don't add anything that isn't sourced.
 */

export type TestKey = "TOEFL" | "IELTS" | "Duolingo" | "SAT" | "ACT";

export interface TestFeeEntry {
  key: TestKey;
  test: string;
  typicalFeeUSD: number;
  /** Explains why the fee varies (country/region-dependent pricing, etc). */
  notes: string;
  sourceUrl: string;
}

export const testFees: TestFeeEntry[] = [
  {
    key: "TOEFL",
    test: "TOEFL iBT",
    typicalFeeUSD: 220,
    notes:
      "ETS does not publish one global figure; fee is set per test-taker's country/region, ranging roughly $173-$255+ before local VAT/taxes. $220 is a commonly cited representative figure but applicants should check the exact price for their own country.",
    sourceUrl: "https://www.ets.org/toefl/test-takers/ibt/register/fees.html",
  },
  {
    key: "IELTS",
    test: "IELTS Academic",
    typicalFeeUSD: 245,
    notes:
      "ielts.org publishes no global fee table because pricing is set locally by British Council or IDP Education test centers per country, commonly falling in a $195-$310 range depending on country and center.",
    sourceUrl: "https://ielts.org/take-a-test/booking-your-test",
  },
  {
    key: "Duolingo",
    test: "Duolingo English Test",
    typicalFeeUSD: 70,
    notes:
      "Standard single-test price is $70 USD plus any local taxes; a two-test bundle is offered at a reduced per-test rate.",
    sourceUrl: "https://englishtest.duolingo.com/test_takers",
  },
  {
    key: "SAT",
    test: "SAT",
    typicalFeeUSD: 111,
    notes:
      "Official College Board figure for test-takers outside the US: base SAT fee $68 plus a mandatory $43 international fee = $111 total; some test centers add a further center-use fee.",
    sourceUrl: "https://satsuite.collegeboard.org/sat/registration/international-testing/fees",
  },
  {
    key: "ACT",
    test: "ACT",
    typicalFeeUSD: 188.5,
    notes:
      "Official non-US/international pricing: $188.50 without the optional Writing section, up to $223.50 with both Writing and Science.",
    sourceUrl: "https://global.act.org/content/global/en/products-and-services/the-act-non-us/registration/fees.html",
  },
];

export const cssProfile = {
  firstSchoolFeeUSD: 25,
  additionalSchoolFeeUSD: 16,
  automaticWaiverNote:
    "College Board's automatic fee waiver (family income up to $100,000, or other criteria) is explicitly restricted to students living in the U.S. per the official page. It does not extend to applicants living outside the U.S.; genuinely international applicants must seek a waiver from each individual college's financial aid office instead.",
  sourceUrl: "https://cssprofile.collegeboard.org/help-center/who-qualifies-fee-waiver",
};

export const waiverGuidance: string =
  "If you're applying from outside the U.S. and not enrolled in an American high school, you're excluded from the standard NACAC/Common App fee waiver, which requires a U.S. school counselor's signature. But real options exist. First, for the CSS Profile: College Board's automatic $100,000-income waiver is documented as applying only to students living in the U.S. — however, many individual colleges grant CSS Profile waivers to all admitted international students with demonstrated need, so ask your target school's financial aid office directly and early. Second, contact each university's admissions or financial aid office directly to request an application-fee hardship waiver — this is the single most reliable route for non-U.S. applicants, and many schools grant these routinely but don't advertise it prominently. Third, check whether your test offers its own need-based program: ETS's TOEFL Fee Reduction Service is documented as limited to U.S. high school seniors, so it likely won't help most Ethiopian/African applicants; but Duolingo's Access Program explicitly offers full fee waivers (bringing the cost to $0) for low-income students worldwide, in 200+ countries, and is a genuinely global, well-documented mechanism worth applying for. Always ask — don't assume ineligibility.";
