import type { University } from "@/types";

/**
 * Per-university derived-content helpers for university profiles.
 *
 * Everything here is computed PURELY from the single `University` passed in
 * (ranking, acceptance rate, tuition, tags, etc.) — no imports of the full
 * `universities`/`majors` data arrays — so this module is safe to import from
 * client components without bloating their bundle. Cross-directory helpers that
 * need the whole dataset (similar schools, percentile ranking, major details)
 * live in `universityComparisons.ts` and are computed server-side instead.
 */

export type SelectivityTone = "elite" | "selective" | "moderate" | "accessible";

export function selectivityTier(acceptanceRate: number): {
  label: string;
  tone: SelectivityTone;
} {
  if (acceptanceRate < 15) return { label: "Highly Selective", tone: "elite" };
  if (acceptanceRate < 35) return { label: "Selective", tone: "selective" };
  if (acceptanceRate < 60) return { label: "Moderately Selective", tone: "moderate" };
  return { label: "Accessible", tone: "accessible" };
}

export function campusSizeLabel(pop: number): "Small" | "Medium" | "Large" {
  if (pop < 5000) return "Small";
  if (pop <= 20000) return "Medium";
  return "Large";
}

export interface AdmissionsTier {
  label: string;
  tone: SelectivityTone;
  blurb: string;
  requirements: string[];
  testGuidance: string;
  recommendationLetters: number;
  essays: number;
}

/** Admissions requirements & guidance, scaled to how selective the school is. */
export function getAdmissionsTier(u: University): AdmissionsTier {
  const { label, tone } = selectivityTier(u.acceptanceRate);

  const base = [
    "Completed online application",
    "Official academic transcripts",
    "Proof of English proficiency (TOEFL/IELTS) for non-native speakers",
  ];

  switch (tone) {
    case "elite":
      return {
        label,
        tone,
        blurb: `With only ${u.acceptanceRate}% of applicants admitted, every part of the application needs to be deliberate — academics, essays, and activities all carry weight.`,
        requirements: [
          ...base,
          "3 letters of recommendation from teachers or mentors",
          "Personal statement plus 2+ supplemental essays",
          "Standardized test scores (optional at many schools, but top-decile scores strengthen the file)",
          "Demonstrated depth in 1-2 extracurriculars rather than breadth across many",
        ],
        testGuidance:
          "Test-optional, but admitted students who submit scores typically land in the 90th percentile or above.",
        recommendationLetters: 3,
        essays: 2,
      };
    case "selective":
      return {
        label,
        tone,
        blurb: `At a ${u.acceptanceRate}% acceptance rate, a solid, well-rounded application has a realistic shot here.`,
        requirements: [
          ...base,
          "2 letters of recommendation",
          "Personal statement plus 1 supplemental essay",
          "Standardized test scores (recommended where accepted)",
        ],
        testGuidance:
          "Submitting scores in or above the published middle-50% range will strengthen most applications.",
        recommendationLetters: 2,
        essays: 1,
      };
    case "moderate":
      return {
        label,
        tone,
        blurb: `A ${u.acceptanceRate}% acceptance rate means admission is achievable for most prepared applicants who meet the academic baseline.`,
        requirements: [
          ...base,
          "1-2 letters of recommendation",
          "Personal statement",
          "Standardized test scores (where required by the program)",
        ],
        testGuidance:
          "Test requirements vary by program — check the specific department for the latest policy.",
        recommendationLetters: 2,
        essays: 1,
      };
    default:
      return {
        label,
        tone,
        blurb: `With a ${u.acceptanceRate}% acceptance rate, admission is primarily about meeting baseline academic and language requirements.`,
        requirements: [
          ...base,
          "1 letter of recommendation (program-dependent)",
          "Statement of purpose",
        ],
        testGuidance:
          "Most applicants are evaluated on transcripts and language proficiency rather than standardized tests.",
        recommendationLetters: 1,
        essays: 1,
      };
  }
}

export interface CostBreakdown {
  tuition: number;
  housing: number;
  booksAndSupplies: number;
  personalExpenses: number;
  totalCostOfAttendance: number;
  estimatedAverageGrant: number;
  estimatedNetPrice: number;
  fourYearTotal: number;
}

/** Full cost-of-attendance estimate, scaled off tuition and the school's aid rate. */
export function getCostBreakdown(u: University): CostBreakdown {
  const tuition = u.annualTuition;
  const housing = Math.round(tuition * 0.35) || Math.round(12000);
  const booksAndSupplies = Math.round(Math.max(1000, tuition * 0.04));
  const personalExpenses = Math.round(Math.max(2500, tuition * 0.08));
  const totalCostOfAttendance = tuition + housing + booksAndSupplies + personalExpenses;
  const estimatedAverageGrant = Math.round(tuition * (u.financialAid / 100) * 0.6);
  const estimatedNetPrice = Math.max(0, tuition - estimatedAverageGrant);

  return {
    tuition,
    housing,
    booksAndSupplies,
    personalExpenses,
    totalCostOfAttendance,
    estimatedAverageGrant,
    estimatedNetPrice,
    fourYearTotal: totalCostOfAttendance * 4,
  };
}

/** Synthesized "why students choose this school" bullets, derived from its data. */
export function getWhyChooseBullets(u: University): string[] {
  const bullets: string[] = [];

  if (u.globalRanking <= 50) {
    bullets.push(`Ranked #${u.globalRanking} worldwide — globally recognized academic prestige.`);
  } else if (u.globalRanking <= 150) {
    bullets.push(`Ranked #${u.globalRanking} worldwide — strong international recognition.`);
  } else if (u.globalRanking <= 400) {
    bullets.push(`A solidly ranked institution (#${u.globalRanking} globally) with respected regional standing.`);
  } else {
    bullets.push("A growing institution building its global research and academic profile.");
  }

  if (u.acceptanceRate < 15) {
    bullets.push("Highly competitive admissions mean a tightly selected, high-achieving peer group.");
  } else if (u.acceptanceRate > 60) {
    bullets.push(`A welcoming ${u.acceptanceRate}% acceptance rate makes this a realistic, accessible choice.`);
  }

  if (u.financialAid >= 40) {
    bullets.push(`Generous aid — ${u.financialAid}% of students receive financial support.`);
  } else if (u.financialAid >= 20) {
    bullets.push(`Solid aid coverage, with ${u.financialAid}% of the student body receiving support.`);
  }

  if (u.avgClassSize <= 20) {
    bullets.push(`Small average class size (${u.avgClassSize} students) for close faculty access.`);
  } else if (u.avgClassSize >= 30) {
    bullets.push(`Bigger lecture-style classes (avg. ${u.avgClassSize}) backed by deeper research resources.`);
  }

  const size = campusSizeLabel(u.studentPopulation);
  if (size === "Small") {
    bullets.push("A small, tight-knit campus community.");
  } else if (size === "Large") {
    bullets.push("A large campus with broad program variety and a vibrant student scene.");
  }

  if (u.tags.some((t) => /stem/i.test(t))) {
    bullets.push("A strong STEM focus across its core programs.");
  }
  if (u.tags.some((t) => /research/i.test(t))) {
    bullets.push("An active, well-funded research culture.");
  }
  if (u.tags.some((t) => /historic/i.test(t))) {
    bullets.push("Centuries of academic tradition and history.");
  }
  if (u.tags.some((t) => /(tuition-free|affordable)/i.test(t))) {
    bullets.push("Exceptional value, with little to no tuition cost.");
  }

  if (u.scholarships.available && u.scholarships.types.length > 0) {
    bullets.push(`Dedicated scholarship programs, including ${u.scholarships.types.join(", ")}.`);
  }

  return Array.from(new Set(bullets)).slice(0, 6);
}

export interface PercentileContext {
  selectivityPercentile: number;
  affordabilityPercentile: number;
  rankPercentile: number;
  totalCompared: number;
}

export interface TimelineStage {
  stage: string;
  action: string;
}

/** A generic but deadline-anchored application timeline. */
export function getApplicationTimeline(u: University): TimelineStage[] {
  return [
    {
      stage: "12+ weeks before",
      action: "Request transcripts and letters of recommendation; start drafting your personal statement.",
    },
    {
      stage: "8 weeks before",
      action: "Finalize essays, gather standardized test scores, and complete the online application form.",
    },
    {
      stage: "4 weeks before",
      action: "Submit early — leave buffer time for technical issues or late-arriving documents.",
    },
    {
      stage: `${u.applicationDeadline} — deadline`,
      action: "Hard deadline. All materials must be received by the admissions office.",
    },
    {
      stage: "After submitting",
      action: "Track your applicant portal and respond promptly to any requests for more information.",
    },
  ];
}

export interface FAQItem {
  q: string;
  a: string;
}

/** Frequently-asked-question content, generated from the school's real data. */
export function getFAQs(u: University): FAQItem[] {
  const tier = selectivityTier(u.acceptanceRate);
  return [
    {
      q: `What is the acceptance rate at ${u.name}?`,
      a: `${u.name} admits approximately ${u.acceptanceRate}% of applicants, making it "${tier.label}" in our directory.`,
    },
    {
      q: `How much does ${u.name} cost per year?`,
      a: `Tuition is approximately ${u.annualTuition.toLocaleString()} ${u.currency} per year before aid. See the Tuition tab for a full cost-of-attendance breakdown.`,
    },
    {
      q: `Does ${u.name} offer scholarships or financial aid?`,
      a: u.scholarships.available
        ? `Yes — ${u.name} offers ${u.scholarships.types.join(", ")}, and about ${u.financialAid}% of students receive some form of financial aid.`
        : `${u.name} does not list dedicated scholarship programs in our directory, though roughly ${u.financialAid}% of students receive some form of financial aid.`,
    },
    {
      q: `When is the application deadline for ${u.name}?`,
      a: `The application deadline is ${u.applicationDeadline}. We recommend submitting all materials at least two weeks ahead of that date.`,
    },
    {
      q: `What can I study at ${u.name}?`,
      a: `${u.name} offers ${u.majorsOffered.length} broad fields of study: ${u.majorsOffered.join(", ")}.`,
    },
    {
      q: `How big are classes at ${u.name}?`,
      a: `The average class size is ${u.avgClassSize} students, with a student-to-faculty ratio of ${u.facultyRatio}, across a ${campusSizeLabel(u.studentPopulation).toLowerCase()} campus of about ${u.studentPopulation.toLocaleString()} students.`,
    },
  ];
}
