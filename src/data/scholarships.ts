/**
 * Verified scholarship data, discovered during a dedicated research pass (one
 * sequential agent per program, each instructed to use ONLY the program's own
 * official website — never third-party aggregators/ranking sites — and to
 * write "not stated" rather than estimate any figure or date).
 *
 * This list is NOT exhaustive — it covers a handful of major, well-documented
 * programs relevant to international and African applicants. Coverage amounts,
 * eligibility rules, and deadlines can change year to year; every entry links
 * to the official source(s) actually used, and `note` records any caveat the
 * research surfaced (a discrepancy between official pages, a fetch that failed
 * and fell back to search-result corroboration, a date that's illustrative of a
 * recurring pattern rather than a fixed annual constant, etc.). Always verify
 * on the official page before relying on a specific figure or deadline.
 */

export interface Scholarship {
  slug: string;
  name: string;
  provider: string;
  /** Destination country/region of study. */
  destination: string;
  /** What the award covers, as stated by the official source(s). */
  coverage: string;
  /** Who can apply, as stated by the official source(s). */
  eligibility: string;
  degreeLevels: string[];
  /** General recurring application-window pattern — never a single fixed year's date treated as permanent. */
  deadlineWindow: string;
  sourceUrls: string[];
  note: string;
}

export const scholarships: Scholarship[] = [
  {
    slug: "chevening-scholarships",
    name: "Chevening Scholarships",
    provider: "UK Foreign, Commonwealth & Development Office (FCDO), and partner organisations",
    destination: "United Kingdom",
    coverage:
      "Fully-funded: university tuition fees, a monthly living-expenses stipend (rate depends on studying inside or outside London), economy travel to and from the scholar's home country plus a travel top-up for events in London, an arrival allowance, a homeward departure allowance, and the cost of one UK visa application.",
    eligibility:
      "Must be a citizen of a Chevening-eligible country or territory; must not hold British or dual British citizenship (exceptions: British Overseas Territory citizens, and BN(O) status holders applying from Hong Kong). Must have an undergraduate degree completed at least two years before the application deadline, plus at least 2,800 hours of work experience gained after graduating (full-time, part-time, remote, or voluntary all count). Must apply to three different eligible UK university courses, and must return to the home country for a minimum of two years after the scholarship ends.",
    degreeLevels: ["Master's (one-year, UK university)"],
    deadlineWindow:
      "Recurring pattern across past cycles: applications typically open in early-to-mid August and close in early-to-mid November. The official site's own application-timeline page should be checked for the current cycle's exact dates — a direct fetch of that specific page failed during this research, so only the historical pattern is confirmed here.",
    sourceUrls: [
      "https://www.chevening.org/scholarships/who-can-apply/",
      "https://www.chevening.org/scholarships/who-can-apply/work-experience/",
      "https://www.chevening.org/resource-hub/guidance/eligibility/",
      "https://www.chevening.org/scholarships/",
      "https://www.chevening.org/about/",
      "https://www.chevening.org/faqs/what-does-a-chevening-scholarship-cover/",
    ],
    note: "British/dual-British citizens are excluded (with the stated territory/Hong Kong exceptions). The 2,800-hour work-experience threshold is strict — the official site states an application will be rejected if it isn't met. The August–November deadline window is a historical pattern only, not independently reconfirmed for the current cycle in this research pass.",
  },
  {
    slug: "fulbright-foreign-student-program",
    name: "Fulbright Foreign Student Program",
    provider:
      "US Department of State, Bureau of Educational and Cultural Affairs (ECA); administered in most countries by the Institute of International Education (IIE) or AMIDEAST, processed through binational Fulbright Commissions/Foundations or the local US Embassy",
    destination: "United States",
    coverage:
      "Officially stated benefits: J-1 visa sponsorship, funding support, a health benefit plan, and enrichment activities. Specific dollar amounts, tuition coverage details, and travel provisions are not stated at the program-wide level — they vary by country and are set by each local Fulbright Commission.",
    eligibility:
      "Must not hold US citizenship (dual citizens are not eligible). Must reside in the country of nomination at time of application. Must hold the equivalent of a US bachelor's degree with a good academic record. Recommended English proficiency: TOEFL 550 (paper-based) / 79–80 (iBT), or IELTS 6.5 overall. Beyond this, eligibility and selection procedures vary significantly by country — applicants must check their home country's Fulbright Commission or US Embassy page for exact local rules.",
    degreeLevels: ["Master's", "Doctorate", "research (for young professionals/artists)"],
    deadlineWindow:
      "Not stated as one fixed program-wide date — the official source explicitly states eligibility, admission, and selection procedures vary by country, and directs applicants to their country's Fulbright Commission/Embassy page for exact deadlines.",
    sourceUrls: [
      "https://foreign.fulbrightonline.org/about/foreign-student-program",
      "https://foreign.fulbrightonline.org/apply",
      "https://foreign.fulbrightonline.org/about",
      "https://www.iie.org/programs/fulbright-program-for-non-us-students/",
      "https://exchanges.state.gov/non-us/program/fulbright-foreign-student-program",
    ],
    note: "This program administers through country-specific Fulbright Commissions, so exact benefits, eligibility nuances, and deadlines vary significantly by country — always check the applicant's home-country Fulbright Commission page. The commonly-cited 'must return home after the grant' rule is a standard feature of the J-1 exchange-visitor program generally, but was not found explicitly restated on the pages fetched for this research, so it isn't asserted here as a confirmed fact of this specific program's official page.",
  },
  {
    slug: "gates-cambridge-scholarship",
    name: "Gates Cambridge Scholarship",
    provider: "Gates Cambridge Trust, funded by a US$210 million donation from the Bill & Melinda Gates Foundation to the University of Cambridge",
    destination: "United Kingdom",
    coverage:
      "University composition (tuition) fees; a maintenance allowance of £22,050/year (pro-rated for shorter courses, payable up to 4 years for PhD); one economy return airfare; visa costs and the Immigration Health Surcharge. Discretionary additional funding may include academic development funding (£500–£2,000), a Dependent Children Allowance (up to £12,184/child/year), fieldwork support for PhD students, parental-leave funding, and hardship funding. Does not cover bench fees or scientific-equipment costs.",
    eligibility:
      "Open to citizens of any country outside the UK (dual UK/other citizens are eligible) applying to an eligible full-time (or, for PhD, full- or part-time) postgraduate course at Cambridge. Selection is need-blind, based on academic excellence, a compelling rationale for the chosen course, a demonstrated commitment to improving the lives of others, and leadership capacity. Excludes undergraduate degrees, MASt courses, most part-time degrees, and professional courses (MBA, EMBA, MFin, PGCE, medical degrees).",
    degreeLevels: ["PhD", "MLitt", "MPhil / MRes / LLM and other one-year postgraduate courses"],
    deadlineWindow:
      "Annual cycle, applications generally open in September. Two rounds: Round 1 (US citizens resident in the USA) closes in October; Round 2 (all other eligible applicants) closes in December or early January, varying by course. Exact dates change year to year.",
    sourceUrls: [
      "https://www.gatescambridge.org/programme/the-scholarship/",
      "https://www.gatescambridge.org/apply/eligibility/",
      "https://www.gatescambridge.org/apply/criteria/",
      "https://www.gatescambridge.org/apply/timeline/",
    ],
    note: "All figures reflect what was stated on the official site as of this research pass (July 2026) and are subject to annual change — the official site itself notes the current cycle was closed at the time of research, with the next cycle opening the following September. No GPA/test-score thresholds are stated beyond 'academic excellence' assessed via transcripts, references, and experience.",
  },
  {
    slug: "daad-epos",
    name: "Development-Related Postgraduate Courses (EPOS)",
    provider: "DAAD (Deutscher Akademischer Austauschdienst / German Academic Exchange Service); funded by Germany's Federal Ministry for Economic Cooperation and Development (BMZ)",
    destination: "Germany",
    coverage:
      "A monthly stipend (€992 for Master's-level scholars, €1,300 for doctoral candidates, rising to €1,400 from February 2026 per the official source); payments toward health, accident, and personal-liability insurance; a travel allowance (unless already covered elsewhere); optionally a rent subsidy and family allowance 'under certain circumstances'. Funding duration ranges from 12 to 42 months depending on the specific programme.",
    eligibility:
      "For professionals and managerial staff from developing or newly industrialised countries. Requires a Bachelor's degree (normally four years) in a related subject, with results in the upper third of the class, completed no more than six years before applying. Requires at least two years of professional experience, generally with public authorities or companies in developing countries. Applicant must not have been resident in Germany for longer than 15 months at time of application.",
    degreeLevels: ["Master's (primarily)", "PhD (in exceptional cases)"],
    deadlineWindow:
      "Not a single fixed date — EPOS is an umbrella funding dozens of individual named courses at different German universities, each setting its own deadline. Per the official 2026/2027 intake deadline list, course deadlines cluster mainly between June and December of the prior year, but applicants must check the specific course's own listing.",
    sourceUrls: [
      "https://www.daad.de/en/information-services-for-higher-education-institutions/further-information-on-daad-programmes/epos/",
      "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50076777",
    ],
    note: "EPOS is not one scholarship but a framework funding many separate Master's/PhD courses, each with its own subject, duration, and deadline — applicants apply to the individual course, which nominates candidates for DAAD funding. The official deadline list is explicitly published 'without guarantee' by DAAD itself. The €1,400/month doctoral rate is explicitly time-bound ('from February 2026') per the source, not a permanent figure.",
  },
  {
    slug: "commonwealth-scholarships",
    name: "Commonwealth Scholarships (Master's, Shared, Split-site)",
    provider: "Commonwealth Scholarship Commission in the UK (CSC), funded primarily by the UK Foreign, Commonwealth & Development Office (FCDO)",
    destination: "United Kingdom",
    coverage:
      "Approved airfare to the UK and return; approved tuition fees; a stipend/living allowance — official pages state two different figures (£1,452/month, £1,781/month in London, on the Master's page; £1,378/month, £1,690/month in London, on the Split-site page) that were not reconciled by either source; a warm-clothing allowance where applicable; a study travel grant; and a child allowance where applicable (£622/month for the first child, £154/month for the second and third, under the Master's programme).",
    eligibility:
      "Open to citizens of eligible low- and middle-income Commonwealth countries — NOT all Commonwealth citizens qualify. Commonwealth Master's Scholarships list 46 eligible countries; Commonwealth Shared Scholarships are specifically for least-developed and lower-middle-income Commonwealth countries; Split-site Scholarships list 43 qualifying countries by OECD DAC income classification. Refugees with status in, and permanent residence in, an eligible Commonwealth country may also apply. Academic requirement (Master's/Split-site): at least upper-second-class (2:1) honours, or a lower second plus a relevant postgraduate qualification. Separate Commonwealth PhD Scholarships exist for high-income OECD Commonwealth countries and for least-developed/fragile states, under different eligibility rules.",
    degreeLevels: ["Master's (taught, one year)", "Master's (part-time, Distance Learning)", "PhD / doctoral research (Split-site: 12 months in the UK only)"],
    deadlineWindow:
      "General pattern: nominating agencies submit candidates by December, with outcomes communicated around July, for study starting the following September/October. Timing varies by specific programme and year — the official FAQ advises checking the site once updated for the current cycle rather than relying on a fixed date.",
    sourceUrls: [
      "https://cscuk.fcdo.gov.uk/about-us/scholarships/",
      "https://cscuk.fcdo.gov.uk/scholarships/",
      "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
      "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships/",
      "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-split-site-scholarships-for-low-and-middle-income-countries/",
      "https://cscuk.fcdo.gov.uk/commonwealth-scholarships-frequently-asked-questions/",
    ],
    note: "'Commonwealth Scholarships' is a family of distinct programs, each with its own eligible-country list — only citizens of specific designated countries qualify for the awards described here. The two stipend figures found on official pages did not match and weren't attributable to one current rate; the Split-site programme was explicitly stated as not running in 2026. Always check the specific program page on cscuk.fcdo.gov.uk for the current-year eligible-country list, rate, and deadline rather than treating these figures as fixed.",
  },
  {
    slug: "australia-awards-scholarships",
    name: "Australia Awards Scholarships",
    provider: "Australian Government Department of Foreign Affairs and Trade (DFAT)",
    destination: "Australia",
    coverage:
      "Full tuition fees for the minimum period needed to complete the program (including any preparatory training); return economy airfare; a one-off Establishment Allowance; a fortnightly Contribution to Living Expenses stipend; Overseas Student Health Cover for the award duration; and a compulsory pre-study Introductory Academic Program.",
    eligibility:
      "Open to citizens of DFAT's listed partner countries (primarily Indo-Pacific, with some African nations also participating) — not open to Australian citizens/permanent residents or dual Australian citizens. Exact eligible fields of study, quotas, and work-experience thresholds are set separately per partner country (DFAT materials for some African countries specify a minimum 5 years of relevant post-graduate work experience, but this is not stated as universal across all countries). Applicants generally must not be currently residing in Australia and must return to their home country for a minimum period (DFAT states at least two years) after the award.",
    degreeLevels: ["Bachelor's", "Master's", "Doctorate/PhD", "TAFE (technical/vocational)"],
    deadlineWindow:
      "Varies by country — some countries accept online applications, others require hard copy, with different timelines. Illustrative pattern only: for one recent intake, the global round opened February with many (not all) countries closing around the following April — exact dates must be checked on the country-specific DFAT page.",
    sourceUrls: [
      "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
      "https://www.dfat.gov.au/people-to-people/australia-awards",
      "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships-opening-and-closing-dates",
      "https://www.dfat.gov.au/people-to-people/australia-awards/participating-countries",
      "https://www.dfat.gov.au/about-us/publications/australia-awards-scholarships-policy-handbook",
    ],
    note: "Eligibility (fields of study, quotas, work-experience thresholds) is genuinely country-specific — DFAT tells applicants to consult their own country's profile, so no country-agnostic summary can be complete. Direct page fetches to dfat.gov.au timed out repeatedly during this research; the facts above are drawn from search-result snippets quoting the same official URLs rather than an independently re-fetched page, so treat any single number (exact stipend amount, exact work-experience years for a given country) as needing re-verification against the official Policy Handbook before being treated as final.",
  },
  {
    slug: "schwarzman-scholars",
    name: "Schwarzman Scholars",
    provider: "Founded by Stephen A. Schwarzman; delivered through Schwarzman College at Tsinghua University, Beijing",
    destination: "China (Beijing)",
    coverage:
      "Fully covered: tuition, fees, room and board, travel to and from Beijing at the start and end of the academic year, in-country study tours, required course books/supplies, a laptop, health insurance, and a personal stipend. Interview-stage travel/hotel for finalists is also arranged/covered per the program's FAQ content.",
    eligibility:
      "Must hold (or be on track to complete) an undergraduate degree before August 1 of the enrollment year. Must be at least 18 and not yet 29 years old as of August 1 of the enrollment year. English proficiency required (TOEFL 100+, IELTS 7+, Cambridge C1/C2 185+, or Duolingo 130+ for non-native speakers, waived with 2+ years of English-medium undergraduate study). Applicants who already hold graduate degrees are also welcome. The official site does not state any nationality restriction and explicitly says it does not discriminate on national or ethnic origin — applicants with a passport other than Chinese/Hong Kong/Macau/Taiwan use the standard global application track, which includes African applicants.",
    degreeLevels: ["Master's (one-year Master of Global Affairs)"],
    deadlineWindow:
      "Recurring pattern: applicants with a Chinese-mainland/Hong Kong/Macau/Taiwan passport apply January–May each cycle; applicants with any other country's passport apply April–September each cycle. Exact yearly dates shift within that seasonal window.",
    sourceUrls: [
      "https://www.schwarzmanscholars.org/",
      "https://www.schwarzmanscholars.org/about/",
      "https://www.schwarzmanscholars.org/admissions/",
      "https://www.schwarzmanscholars.org/admissions/eligibility/",
      "https://www.schwarzmanscholars.org/frequently-asked-questions/",
    ],
    note: "The 'Master of Global Affairs' degree name and its concentrations (Public Policy, Economics and Business, International Studies) were corroborated via search-result snippets of official-site content after a direct fetch of the curriculum page returned a 404 — treat that specific sub-detail as very slightly less certain than the rest, though it's consistent across the site's other pages. The current cycle's exact deadline is one specific year's date and should not be presented as permanent — only the seasonal window is stable year to year.",
  },
];

export function getScholarship(slug: string): Scholarship | undefined {
  return scholarships.find((s) => s.slug === slug);
}
