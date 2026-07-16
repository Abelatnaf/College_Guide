import type { CostInputs, CostResults } from "@/lib/cost";

/** Application lifecycle states (mirror of the Postgres `application_status` enum). */
export type ApplicationStatus =
  | "considering"
  | "planning"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "deferred";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "considering",
  "planning",
  "in_progress",
  "submitted",
  "accepted",
  "rejected",
  "waitlisted",
  "deferred",
];

/** A saved university on the user's shortlist. */
export interface ShortlistItem {
  slug: string;
  note?: string;
  /** ISO timestamp. */
  savedAt: string;
}

/** Reusable academic profile, seeded from the quiz, used by the chance estimator. */
export interface AcademicProfile {
  /** Unweighted GPA, 0.00–4.00. */
  gpa: number | null;
  /** SAT total, 400–1600. */
  sat: number | null;
  /** ACT composite, 1–36. */
  act: number | null;
  /** TOEFL iBT, 0–120. */
  toefl: number | null;
  /** IELTS band, 0–9. */
  ielts: number | null;
  /** Major slug or sub-major name the student intends to study. */
  intendedMajor: string | null;
  /** Preferred regions, mirroring the quiz `Region` values. */
  preferredRegions: string[];
  /** Budget band label, mirroring the quiz options. */
  budgetBand: string | null;
  /** "Small" | "Medium" | "Large". */
  campusSize: string | null;
  /** ISO timestamp of the last edit. */
  updatedAt: string;
}

export function emptyAcademicProfile(): AcademicProfile {
  return {
    gpa: null,
    sat: null,
    act: null,
    toefl: null,
    ielts: null,
    intendedMajor: null,
    preferredRegions: [],
    budgetBand: null,
    campusSize: null,
    updatedAt: "",
  };
}

/** A single requirement under an application. */
export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** ISO date (yyyy-mm-dd) or null. */
  dueDate?: string | null;
}

export type EssayStatus = "not-started" | "drafting" | "done";

export const ESSAY_STATUSES: EssayStatus[] = ["not-started", "drafting", "done"];

/** A single supplemental essay under an application. */
export interface EssayItem {
  id: string;
  prompt: string;
  status: EssayStatus;
  wordCount: number;
  /** Word limit, or null when the school doesn't state one. */
  wordLimit: number | null;
}

/** A tracked university application. */
export interface Application {
  slug: string;
  status: ApplicationStatus;
  /** ISO date (yyyy-mm-dd) override for the deadline, or null to use static data. */
  deadline?: string | null;
  /** ISO timestamp when marked submitted, or null. */
  submittedAt?: string | null;
  notes?: string;
  checklist: ChecklistItem[];
  essays: EssayItem[];
  createdAt: string;
  updatedAt: string;
}

/** A saved Cost & ROI scenario. */
export interface CostScenario {
  id: string;
  name: string;
  slug: string;
  majorSlug?: string | null;
  inputs: CostInputs;
  results?: CostResults | null;
  createdAt: string;
}
