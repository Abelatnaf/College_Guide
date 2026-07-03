/**
 * Verified international-applicant financial-aid ADMISSION POLICY data,
 * keyed by university slug.
 *
 * These policies change over time (e.g. Dartmouth has flipped need-blind
 * status for international applicants multiple times since 2008) and are
 * frequently misremembered even in good faith — every entry here was
 * verified against the school's own official page during the Week 3
 * research pass, not recalled from training data. A slug NOT present in
 * this lookup means the policy was never checked — the UI must treat that
 * as "not yet verified", never assume a favorable or unfavorable policy.
 *
 * Do not add, guess, or "fill in" entries here without a real sourceUrl.
 */

export interface AidPolicyEntry {
  slug: string;
  /** Admission decisions made without regard to international applicants' ability to pay. null = not stated by source. */
  needBlindForInternational: boolean | null;
  /** School commits to meeting 100% of demonstrated need, explicitly extended to international students. */
  meetsFullDemonstratedNeed: boolean | null;
  sourceUrl: string;
  note: string;
}

export const aidPolicy: Record<string, AidPolicyEntry> = {
  mit: {
    slug: "mit",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://mitadmissions.org/help/faq/need-blind-admissions/",
    note: "MIT states: 'Our admissions process is need-blind for all students, foreign and domestic,' and MIT Student Financial Services states MIT is 'committed to meeting 100% of demonstrated financial need for international students, just as we are for domestic students.'",
  },
  harvard: {
    slug: "harvard",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://college.harvard.edu/admissions/apply/international-applicants",
    note: "Harvard's international applicants page states admissions decisions are made without regard to whether an applicant has applied for financial assistance, and 'International students are eligible for exactly the same aid as American students.' Harvard meets 100% of demonstrated financial need.",
  },
  yale: {
    slug: "yale",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://admissions.yale.edu/financial-aid-international-applicants",
    note: "Yale's official page states: 'A family's ability to pay is not a factor in the admissions process—for any student, anywhere in the world' and aid offers meet 100% of demonstrated need regardless of citizenship or immigration status, without requiring loans.",
  },
  princeton: {
    slug: "princeton",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://admission.princeton.edu/apply/international-students",
    note: "Princeton's international students page states admission is need-blind with no disadvantage for financial aid applicants, and 'the full need of all admitted international students is met the same as it is for students from the United States.'",
  },
  "amherst-college": {
    slug: "amherst-college",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.amherst.edu/offices/financialaid/international_students",
    note: "Amherst admits international students without regard to their level of financial need (need-blind) and meets 100% of calculated financial need for all international students who are admitted. Direct WebFetch of amherst.edu returned 405; corroborated via multiple independent search-result quotations of the official pages.",
  },
  dartmouth: {
    slug: "dartmouth",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://admissions.dartmouth.edu/glossary-question/dartmouth-need-blind-or-need-aware-its-admissions-process",
    note: "Current official Dartmouth Admissions page (verified live) states: 'Dartmouth practices need-blind admissions for all applicants, regardless of citizenship.' Financial aid meets demonstrated need for all admitted undergraduates including international students. Policy has changed multiple times historically (need-blind 2008-2015, need-aware 2015-2022, need-blind again from the Class of 2026 onward) — this is the current, live-verified status.",
  },
  "bowdoin-college": {
    slug: "bowdoin-college",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.bowdoin.edu/student-aid/apply-for-aid/international-students.html",
    note: "Bowdoin's official page states its admissions process is need-blind for all students including international students, and it meets all admitted international students' full demonstrated need.",
  },
  "williams-college": {
    slug: "williams-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.williams.edu/admission-aid/apply/international/",
    note: "Williams' official page states Williams is not need-blind for international applicants (need-aware), though financial aid awards for admitted international students are comprehensive, meet 100% of demonstrated need, and are guaranteed for all four years. Was need-blind for international 2001-2010, then reversed. Direct WebFetch blocked (403); corroborated via multiple independent search snippets.",
  },
  "middlebury-college": {
    slug: "middlebury-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.middlebury.edu/office-student-financial-services/common-questions",
    note: "Middlebury's official page: 'In the case of international students, Middlebury follows a need-blind admissions policy to the extent that financial resources allow' — an explicitly conditional, budget-limited policy, distinct from the unconditional need-blind policy for domestic students. Middlebury meets the full need of any accepted international student.",
  },
  "vassar-college": {
    slug: "vassar-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.vassar.edu/admission/apply/international/",
    note: "Vassar's official international applicants page states Vassar is 'need aware when reviewing applications from international students,' but meets the full demonstrated need of all admitted students who apply for financial aid at the time of their admission application.",
  },
  columbia: {
    slug: "columbia",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://undergrad.admissions.columbia.edu/apply/international/aid",
    note: "Columbia's official page states US citizens/permanent residents/DACA/undocumented students are read in a need-blind manner, while international students are evaluated in a need-aware manner. Columbia meets 100% of a family's demonstrated need for admitted international students. Direct WebFetch blocked (403); corroborated via search-result quotations of the official page.",
  },
  brown: {
    slug: "brown",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://admission.brown.edu/international/financial-aid",
    note: "Brown's official page states Brown became need-blind for international students beginning with the Class of 2029 (entered fall 2025) and meets full demonstrated need for admitted students who apply for aid at the time of admission application. Classes admitted before fall 2025 were under a need-aware policy — this is the current status.",
  },
  upenn: {
    slug: "upenn",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://ask.admissions.upenn.edu/support/solutions/articles/157000361174-does-penn-consider-my-ability-to-pay-when-making-admissions-decisions-",
    note: "Penn's official admissions Q&A states Penn is need-blind for citizens/permanent residents of the US, Canada, and Mexico, but need-aware for other international students. Penn's commitment to meet 100% of demonstrated need remains the same for international students who are admitted as financial aid recipients.",
  },
  stanford: {
    slug: "stanford",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://admission.stanford.edu/apply/international/index.html",
    note: "Stanford's admission page states that if you are not a US citizen/permanent resident/undocumented/Eligible Noncitizen, your request for financial aid will be a factor in the admission evaluation (need-aware). The financial aid office states Stanford will meet the full need of all admitted students regardless of citizenship.",
  },
  "uc-berkeley": {
    slug: "uc-berkeley",
    needBlindForInternational: null,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://financialaid.berkeley.edu/apply-now/international-students/",
    note: "Official Berkeley financial aid page states 'International students are ineligible for federal, state, and need-based university financial aid.' No official statement found on need-blind/need-aware admission for international applicants specifically.",
  },
  ucla: {
    slug: "ucla",
    needBlindForInternational: null,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://admission.ucla.edu/apply/international-applicants",
    note: "Official UCLA admissions page states 'UCLA does not award scholarships or financial aid to undergraduate students who are not citizens or permanent residents of the United States.' No official admission-policy statement for international applicants was found.",
  },
  "university-of-michigan": {
    slug: "university-of-michigan",
    needBlindForInternational: null,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://finaid.umich.edu/apply-aid/international-students",
    note: "Official Michigan page states international students on temporary visas are not eligible for financial aid; the full-need-met commitment is explicitly stated only for Michigan residents. No explicit admission-policy statement for internationals found.",
  },
  "carnegie-mellon": {
    slug: "carnegie-mellon",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://www.cmu.edu/admission/admission/international-applicants",
    note: "Official CMU page: 'Carnegie Mellon doesn't offer financial aid to international students... you and your family must plan to pay the total cost of attendance.' CMU is need-blind for domestic but not international applicants, and does not meet full need for internationals.",
  },
  caltech: {
    slug: "caltech",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.admissions.caltech.edu/apply/first-year-applicants/international-applicants",
    note: "Official Caltech page: 'We are need-aware for international students because the total amount of financial aid funds for international students is limited,' while remaining committed to meeting the demonstrated need of all admitted students, including internationals.",
  },
  "georgia-tech": {
    slug: "georgia-tech",
    needBlindForInternational: null,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://finaid.gatech.edu/apply/international",
    note: "Official page states international students are not eligible for federal or state financial aid programs, and institutional scholarships are often not awarded to international students. No explicit admission need-blind/aware statement found.",
  },
  "ut-austin": {
    slug: "ut-austin",
    needBlindForInternational: null,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://onestop.utexas.edu/managing-costs/scholarships-financial-aid/",
    note: "The demonstrated-need guarantee (Texas Advance Commitment) is explicitly restricted to in-state students; institutional aid for internationals is minimal. No explicit admission-policy statement for internationals found.",
  },
  "wesleyan-university": {
    slug: "wesleyan-university",
    needBlindForInternational: null,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.wesleyan.edu/admission/affordability-and-aid/applying-for-aid.html",
    note: "Official page: 'Wesleyan meets 100% of every admitted student's demonstrated need,' explicitly including international applicants. No current official page explicitly restates need-blind/need-aware status specifically for internationals, so left null.",
  },
  "colby-college": {
    slug: "colby-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://afa.colby.edu/apply/requirements/international-applicants/",
    note: "Colby is need-aware for international applicants (financial need is a factor in admission decisions) while meeting 100 percent of demonstrated need for all admitted students, including international students, via the Colby Commitment (grants/work only, no loans). Direct WebFetch returned 403; based on consistent search-surfaced quotes of the official page.",
  },
  "haverford-college": {
    slug: "haverford-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.haverford.edu/financial-aid/international-applicants",
    note: "Haverford shifted from need-blind to need-aware admissions in 2016, applying to international applicants, for whom limited aid makes admission especially competitive. The same official page states Haverford meets 100% of the demonstrated need of all admitted students, including international students. Direct WebFetch returned 403; based on consistent search-surfaced quotes of the official page.",
  },
  "macalester-college": {
    slug: "macalester-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.macalester.edu/admissions/international/international-students-at-macalester/",
    note: "Official page: 'We are committed to meeting the full demonstrated financial need of every student we admit.' A companion official FAQ page ties financial need to admission outcomes for internationals, i.e. need-aware in practice.",
  },
  cornell: {
    slug: "cornell",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://finaid.cornell.edu/first-year-and-transfer-students-international",
    note: "Official page states admission is need-aware for international students ('need for financial aid is one factor amongst many considered when making admission decisions'), effective fall 2017. Cornell meets 100 percent of admitted international undergraduates' demonstrated financial need for those who applied for aid at time of application.",
  },
  duke: {
    slug: "duke",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://financialaid.duke.edu/forms-resources/awarding-policy/",
    note: "International applicants requesting aid are considered in a separate admission pool (need-aware). Duke expects to enroll 20-25 international students per year whose full demonstrated need has been met with a university-provided need-based aid package — full need met, but only for this small admitted-with-aid cohort.",
  },
  northwestern: {
    slug: "northwestern",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://admissions.northwestern.edu/tuition-aid/international-student-aid/",
    note: "Official page: 'We have a need-aware admission review for international students... financial aid you require may factor into your admission decision.' Northwestern commits to meeting 100% of a student's demonstrated financial need for admitted international students, though funding is limited.",
  },
  georgetown: {
    slug: "georgetown",
    needBlindForInternational: true,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://uadmissions.georgetown.edu/applying/international/",
    note: "Official page: 'All candidates (including non-US citizens or non-permanent residents) are reviewed without consideration of a student's financial resources' (need-blind). However Georgetown does NOT commit to full need for internationals: admitted students seeking aid 'will be considered for a very limited number of need-based scholarships' — not a 100%-of-need guarantee.",
  },
  rice: {
    slug: "rice",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://financialaid.rice.edu/apply-aid/international-students",
    note: "Official page: \"Rice's international need-based aid policy for both admission and financial aid is need aware.\" International students who receive need-based aid have 100% of demonstrated need met with institutional grant aid (though not eligible for the Rice Investment).",
  },
  vanderbilt: {
    slug: "vanderbilt",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://admissions.vanderbilt.edu/affordability/international-costs-and-finances/",
    note: "Official page: requesting need-based assistance means the admission decision is made on a need-aware basis for international students. Vanderbilt's need-blind/100%-need-met promise is explicitly limited to US citizens and eligible non-citizens; other international students get only limited need-based scholarships — not a full-need guarantee for all admits.",
  },
  "johns-hopkins": {
    slug: "johns-hopkins",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://apply.jhu.edu/international-applicants/",
    note: "Official page: JHU is need-aware for international citizens who apply for financial aid — financial circumstances are considered in admissions. JHU's celebrated need-blind policy applies to domestic applicants (incl. DACA/undocumented), not international citizens. JHU does state it meets 100% of demonstrated need for all admitted students including international students, though aid is limited/competitive.",
  },
  nyu: {
    slug: "nyu",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.nyu.edu/admissions/financial-aid-and-scholarships/applying-as-a-prospective-undergraduate-student/first-year-applicants.html",
    note: "NYU is need-aware for international applicants. Since a Fall 2021 policy change, NYU states first-year undergraduates admitted to the NY campus (including international students) who apply for aid by the deadline will have 100% demonstrated need met.",
  },
  "university-of-chicago": {
    slug: "university-of-chicago",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://collegeadmissions.uchicago.edu/financial-support/international-financial-aid/",
    note: "UChicago's own domain returned JS-rendered pages WebFetch couldn't extract as text, so this is corroborated via multiple independent WebSearch snippets quoting the official page. UChicago is need-aware for international applicants, but is committed to meeting 100% of demonstrated need with a loan-free financial aid package if admitted and applied for funding as an international student.",
  },
  usc: {
    slug: "usc",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: false,
    sourceUrl: "https://financialaid.usc.edu/undergraduate-financial-aid/prospective-students/financial-aid-at-usc/",
    note: "USC's own page: 'international students are not eligible to receive federal or USC need-based financial aid, [but] may be awarded merit scholarships and/or other departmental awards.' International applicants must certify ability to pay full cost of attendance at time of application (need-aware in practice); no need-based aid program exists for this group.",
  },
  "pomona-college": {
    slug: "pomona-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.pomona.edu/admissions/apply/international-applicants",
    note: "Official page: 'Admissions is need-aware for international applicants, but we meet the full need of every admitted international student.' Any admitted student with demonstrated financial need is offered a package that meets 100% of that need.",
  },
  "wellesley-college": {
    slug: "wellesley-college",
    needBlindForInternational: false,
    meetsFullDemonstratedNeed: true,
    sourceUrl: "https://www.wellesley.edu/admission-aid/faqs",
    note: "Official FAQ: 'Wellesley is not need-blind for students who are not U.S. citizens or permanent residents' and admission is highly competitive for international citizens applying for financial aid (need-aware). Wellesley is committed to meeting 100% of calculated need for all admitted international citizens who have applied for financial aid during the admission process.",
  },
};

/** Look up a verified aid-policy entry, or undefined if this school hasn't been verified yet. */
export function getAidPolicy(slug: string): AidPolicyEntry | undefined {
  return aidPolicy[slug];
}
