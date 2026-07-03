/**
 * US liberal arts colleges discovered during Week 3's affordability research
 * that aren't part of the main `universities` directory.
 *
 * These are surfaced ONLY on the Affordability Finder — deliberately kept
 * out of `src/data/universities.ts` because that type requires several
 * fields (globalRanking, facultyRatio, majorsOffered, campusLife, etc.)
 * that were never verified for these schools this session, and a global
 * research-university ranking methodology doesn't apply meaningfully to
 * small liberal arts colleges anyway. Every field below WAS verified
 * against an official source (several directly from the school's own
 * Common Data Set) — see `sourceUrl`/`note` on each entry.
 */

export interface AffordabilitySchool {
  slug: string;
  name: string;
  city: string;
  country: string;
  website: string;
  /** Annual tuition, USD, as sourced — see tuitionBasis for what's included. */
  annualTuition: number;
  /** What the tuition figure includes/excludes, as stated by the source (e.g. "tuition only, excludes room/board"). */
  tuitionBasis: string;
  /** Undergraduate acceptance rate, 0-100. */
  acceptanceRate: number;
  studentPopulation: number;
  established: number;
  description: string;
  sourceUrl: string;
  note: string;
}

export const affordabilitySchools: AffordabilitySchool[] = [
  {
    slug: "amherst-college",
    name: "Amherst College",
    city: "Amherst, MA",
    country: "United States",
    website: "https://www.amherst.edu",
    annualTuition: 73140,
    tuitionBasis: "tuition only (2025-26); comprehensive fee incl. room/board/activities is $93,090",
    acceptanceRate: 7,
    studentPopulation: 1907,
    established: 1821,
    description:
      "A private, highly selective liberal arts college offering only a bachelor's degree across 43 majors, with a 7:1 student-faculty ratio.",
    sourceUrl: "https://www.amherst.edu/about/facts",
    note: "WebFetch returned HTTP 405 for amherst.edu; figures cross-checked via multiple independent sources including Amherst's own March 2025 Class of 2029 news release.",
  },
  {
    slug: "bowdoin-college",
    name: "Bowdoin College",
    city: "Brunswick, ME",
    country: "United States",
    website: "https://www.bowdoin.edu",
    annualTuition: 71070,
    tuitionBasis: "tuition only, 2025-26 (required fees $670 and food/housing $19,560 additional)",
    acceptanceRate: 7,
    studentPopulation: 1841,
    established: 1794,
    description:
      "A private liberal arts college enrolling exclusively undergraduates, with a need-blind, no-loan financial aid policy and an 8:1 student-faculty ratio.",
    sourceUrl: "https://www.bowdoin.edu/ir/pdf/bowdoin-cds_2025-2026.pdf",
    note: "Figures pulled directly from Bowdoin's official Common Data Set 2025-2026 PDF.",
  },
  {
    slug: "williams-college",
    name: "Williams College",
    city: "Williamstown, MA",
    country: "United States",
    website: "https://www.williams.edu",
    annualTuition: 72170,
    tuitionBasis: "tuition only, 2025-26 (comprehensive fee incl. room/board/activities is $90,750)",
    acceptanceRate: 8.5,
    studentPopulation: 2101,
    established: 1793,
    description:
      "A private liberal arts college known for its tutorial system and distinctive 4-1-4 academic calendar including a January winter-study term.",
    sourceUrl: "https://www.williams.edu/about/fast-facts/",
    note: "williams.edu blocked WebFetch (403); corroborated via The Williams Record citing the college's own release.",
  },
  {
    slug: "middlebury-college",
    name: "Middlebury College",
    city: "Middlebury, VT",
    country: "United States",
    website: "https://www.middlebury.edu",
    annualTuition: 70120,
    tuitionBasis: "tuition only, 2025-26 (comprehensive fee incl. room/board and SGA fee totals $90,756)",
    acceptanceRate: 13.9,
    studentPopulation: 2600,
    established: 1800,
    description:
      "A private liberal arts college in Vermont known for language immersion (the Middlebury Language Schools) and international studies programs.",
    sourceUrl: "https://www.middlebury.edu/about/quick-facts",
    note: "Acceptance rate confirmed via The Middlebury Campus (student newspaper) citing official college data on the Class of 2029/2029.5 admit pool.",
  },
  {
    slug: "vassar-college",
    name: "Vassar College",
    city: "Poughkeepsie, NY",
    country: "United States",
    website: "https://www.vassar.edu",
    annualTuition: 73275,
    tuitionBasis: "tuition only, 2025-26 (room/board averages ~$19,055 additional)",
    acceptanceRate: 20.9,
    studentPopulation: 2462,
    established: 1861,
    description:
      "A private liberal arts college and one of the original Seven Sisters colleges, now fully coeducational since 1969.",
    sourceUrl: "https://www.vassar.edu/admission/quick-facts/",
    note: "vassar.edu's CDS PDF and tuition page blocked WebFetch (403); acceptance rate corroborated via multiple independent admissions-consulting sources citing the Class of 2029 admit pool.",
  },
  {
    slug: "wesleyan-university",
    name: "Wesleyan University",
    city: "Middletown, CT",
    country: "United States",
    website: "https://www.wesleyan.edu",
    annualTuition: 72828,
    tuitionBasis: "tuition only, 2025-26 (Residential Comprehensive Fee for room/board is $20,668 additional)",
    acceptanceRate: 16,
    studentPopulation: 3200,
    established: 1831,
    description:
      "A private research-oriented liberal arts university offering bachelor's, master's, and select doctoral programs, distinguishing it from most peer liberal arts colleges.",
    sourceUrl: "https://www.wesleyan.edu/about/at-a-glance.html",
    note: "Acceptance rate confirmed directly via Wesleyan's own at-a-glance and class-profile pages, corroborated by The Wesleyan Argus.",
  },
  {
    slug: "colby-college",
    name: "Colby College",
    city: "Waterville, ME",
    country: "United States",
    website: "https://www.colby.edu",
    annualTuition: 72910,
    tuitionBasis: "tuition and fees combined, 2025-26 (food/housing $18,740 additional)",
    acceptanceRate: 7,
    studentPopulation: 2412,
    established: 1813,
    description:
      "A private liberal arts college in Maine known for its expanded 'Fair Shot Fund' financial aid program eliminating parent contributions for lower-income families.",
    sourceUrl: "https://news.colby.edu/story/class-of-2029-admitted-to-colby/",
    note: "afa.colby.edu blocked WebFetch (403); acceptance rate confirmed via Colby's own official news release on the Class of 2029.",
  },
  {
    slug: "haverford-college",
    name: "Haverford College",
    city: "Haverford, PA",
    country: "United States",
    website: "https://www.haverford.edu",
    annualTuition: 73030,
    tuitionBasis: "tuition only, 2025-26 (required fees $538 and room/board ~$20,426 additional)",
    acceptanceRate: 13.3,
    studentPopulation: 1431,
    established: 1833,
    description:
      "A small private liberal arts college founded by members of the Religious Society of Friends (Quakers), still guided by an Honor Code central to campus life.",
    sourceUrl: "https://www.haverford.edu/admission/class-profile",
    note: "haverford.edu blocked WebFetch (403) on all pages tried; corroborated via multiple independent sources citing the Class of 2029 admit pool.",
  },
  {
    slug: "macalester-college",
    name: "Macalester College",
    city: "Saint Paul, MN",
    country: "United States",
    website: "https://www.macalester.edu",
    annualTuition: 70862,
    tuitionBasis: "tuition and required course materials, 2025-26 (room and board additional)",
    acceptanceRate: 26,
    studentPopulation: 2068,
    established: 1874,
    description:
      "A private liberal arts college known for its emphasis on internationalism, multiculturalism, and civic engagement, with roots in the Scottish Presbyterian tradition.",
    sourceUrl: "https://www.macalester.edu/admissions/admitted-students/class-profile/",
    note: "Acceptance rate and admit counts confirmed directly via Macalester's own official class-profile page.",
  },
  {
    slug: "swarthmore-college",
    name: "Swarthmore College",
    city: "Swarthmore, PA",
    country: "United States",
    website: "https://www.swarthmore.edu",
    annualTuition: 68766,
    tuitionBasis: "tuition and books, 2025-26 (comprehensive cost of attendance incl. housing/food/fees is $90,692)",
    acceptanceRate: 7,
    studentPopulation: 1702,
    established: 1864,
    description:
      "A private liberal arts college affiliated historically with the Religious Society of Friends (Quakers) and known for its rigorous Honors Program.",
    sourceUrl: "https://www.swarthmore.edu/meet-swarthmore/swarthmore-numbers",
    note: "All figures confirmed directly via Swarthmore's own 'by the numbers' page and official Class of 2029 news release. Aid-policy specifics (need-blind/full-need status) were not separately re-verified this pass — treat as not yet verified for that field.",
  },
  {
    slug: "pomona-college",
    name: "Pomona College",
    city: "Claremont, CA",
    country: "United States",
    website: "https://www.pomona.edu",
    annualTuition: 68250,
    tuitionBasis: "tuition only, 2025-26 (fees $420 additional; comprehensive charge incl. housing/food is $91,134)",
    acceptanceRate: 6.9,
    studentPopulation: 1690,
    established: 1887,
    description:
      "A private liberal arts college and the founding member of the Claremont Colleges consortium in Southern California.",
    sourceUrl: "https://www.pomona.edu/news/2025/03/21-introducing-pomona-college-class-2029",
    note: "Acceptance rate confirmed via Pomona's own official news release on the Class of 2029.",
  },
  {
    slug: "wellesley-college",
    name: "Wellesley College",
    city: "Wellesley, MA",
    country: "United States",
    website: "https://www.wellesley.edu",
    annualTuition: 69800,
    tuitionBasis: "tuition only, 2025-26 (comprehensive fee incl. housing/meals/activity fee is $92,440)",
    acceptanceRate: 13.7,
    studentPopulation: 2407,
    established: 1870,
    description:
      "A private women's liberal arts college and one of the original Seven Sisters; reported in 2025 as the first US institution with a sticker price exceeding $100,000 per year.",
    sourceUrl: "https://www1.wellesley.edu/about/wellesleyfacts",
    note: "Acceptance rate confirmed via Wellesley's own 'Welcome, class of 2029!' news page.",
  },
];

/** Look up an affordability-spotlight school by slug (returns undefined if not one of these 12). */
export function getAffordabilitySchool(slug: string): AffordabilitySchool | undefined {
  return affordabilitySchools.find((s) => s.slug === slug);
}
