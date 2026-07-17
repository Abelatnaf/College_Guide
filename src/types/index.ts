/** Geographic region buckets used by filters and the match quiz. */
export type Region = "USA" | "Europe" | "Canada" | "China" | "UAE" | "Australia" | "Japan" | "South Korea" | "India";

/**
 * A raw IPEDS institution record — name/contact info only, no ranking or cost
 * data. Distinct from `University`: these back the bulk US directory browser,
 * not the compare/quiz/chances tools, which need the richer curated fields.
 */
export interface USInstitution {
  id: string;
  name: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  admissionsUrl?: string;
  financialAidUrl?: string;
  applicationUrl?: string;
  sector?: string;
  level?: string;
}

/**
 * A raw international (non-US) institution record — name, country, and a
 * website link only, no ranking/cost data. Sourced from the Hipo
 * university-domains-list project (MIT-licensed, community-maintained),
 * the same class of source as the IPEDS-derived US directory. Distinct from
 * `University`: these back the bulk international directory browser, not
 * the compare/quiz/chances tools, which need the richer curated fields.
 */
export interface IntlInstitution {
  id: string;
  name: string;
  country: string;
  stateProvince: string | null;
  website: string | null;
}

export interface Scholarship {
  available: boolean;
  types: string[];
}

export interface University {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  region: Region;
  globalRanking: number;
  /** Annual tuition amount, expressed in `currency`. */
  annualTuition: number;
  /** Currency label for `annualTuition`, e.g. "USD". */
  currency: string;
  /** Acceptance rate as a percentage, 0–100. */
  acceptanceRate: number;
  studentPopulation: number;
  /** Student-to-faculty ratio, e.g. "8:1". */
  facultyRatio: string;
  avgClassSize: number;
  /** Percentage of students receiving financial aid, 0–100. */
  financialAid: number;
  scholarships: Scholarship;
  /** Application deadline label, e.g. "Jan 02". */
  applicationDeadline: string;
  majorsOffered: string[];
  tags: string[];
  description: string;
  campusLife: string;
  established: number;
  website: string;
  /** Direct link to the admissions homepage, where available (IPEDS-sourced, US schools only). */
  admissionsUrl?: string;
  /** Direct link to the financial aid office page, where available (IPEDS-sourced, US schools only). */
  financialAidUrl?: string;
  /** Direct link to the application portal/page, where available (IPEDS-sourced, US schools only). */
  applicationUrl?: string;
}

export interface SubMajor {
  name: string;
  description: string;
  avgStartingSalary: string;
  jobGrowth: string;
}

export interface Major {
  id: string;
  slug: string;
  name: string;
  /** Material Symbols Outlined icon name. */
  icon: string;
  description: string;
  subMajors: SubMajor[];
  careerPaths: string[];
  avgStartingSalary: string;
  /** Relative salary bar fill, 0–100, for the explorer cards. */
  salaryBarPercent: number;
  tags: string[];
}

/** Filter pill keys used on the Major Explorer page. */
export type MajorFilter = "Most Popular" | "High Salary" | "Fast Growth";

/** Shape of an answered match-quiz, fed to the scoring logic. */
export interface QuizAnswers {
  /** Up to 2 preferred regions, or ["No preference"]. */
  region: (Region | "No preference")[];
  budget: "Under $15k" | "$15k-$30k" | "$30k-$50k" | "$50k+";
  /** A specific major name, or free text if the user picked "Other". */
  field: string;
  /** True when `field` was typed in via the "Other" option rather than picked from the list. */
  fieldIsOther?: boolean;
  gpa: "3.5+" | "3.0-3.5" | "2.5-3.0" | "Below 2.5";
  campusSize: "Small" | "Medium" | "Large";
  /** How much scholarships / financial aid matter — scored against each school's real aid data. */
  aidImportance?: "Essential" | "Helpful" | "Not a factor";
  /** Preferred average class size band, scored against `avgClassSize`. */
  classSize?: "Small" | "Medium" | "Large" | "No preference";
  /** Up to 2 school-personality picks (research, STEM, liberal arts, …), scored against tags. */
  vibes?: string[];
  /** How safety- vs reach-leaning the match list should be. */
  ambition?: "Safe" | "Balanced" | "Reach";
  /** Optional standardized test score, collected to sharpen chance estimates. */
  testScore?: { type: "SAT" | "ACT" | "None"; value?: number };
}

export interface QuizMatch {
  university: University;
  /** Match score expressed as a percentage, 0–100. */
  matchPercent: number;
  reasons: string[];
}
