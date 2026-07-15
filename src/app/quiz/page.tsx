"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { universities } from "@/data/universities";
import { flagFor } from "@/data/flags";
import { majors } from "@/data/majors";
import { QuizCard, type QuizOption } from "@/components/ui/QuizCard";
import type { QuizAnswers, QuizMatch } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useAcademicProfile } from "@/components/providers/StorageProvider";
import { ChanceBadge } from "@/components/ui/ChanceBadge";
import { AIInsightPanel } from "@/components/ui/AIInsightPanel";
import { estimateChance } from "@/lib/chances";
import { CampusGraphic } from "@/components/ui/CampusGraphic";
import { Icon } from "@/components/ui/Icon";
import { buildInsightsRequest, requestQuizInsights } from "@/lib/ai/quizInsights";
import type { QuizInsightsResult } from "@/types/ai";
import { readLocal, writeLocal } from "@/lib/storage/localStore";

const OTHER_VALUE = "__other__";

/** Representative numeric GPA for each quiz band, used to seed the profile. */
const GPA_BAND_TO_GPA: Record<string, number> = {
  "3.5+": 3.7,
  "3.0-3.5": 3.25,
  "2.5-3.0": 2.75,
  "Below 2.5": 2.2,
};

// Flatten every sub-major across all 13 categories into one rich list (54 majors),
// each tagged with its parent category for scoring, plus a trailing "Other".
const FIELD_OPTIONS: (QuizOption & { category: string })[] = majors.flatMap((m) =>
  m.subMajors.map((sm) => ({
    value: sm.name,
    label: sm.name,
    sub: `${sm.avgStartingSalary} avg starting salary · ${sm.jobGrowth} job growth`,
    category: m.name,
  })),
);

const FIELD_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  FIELD_OPTIONS.map((f) => [f.value, f.category]),
);

const REGION_OPTIONS: QuizOption[] = [
  { value: "USA", label: "United States" },
  { value: "Europe", label: "Europe" },
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "Australia", label: "Australia" },
  { value: "Japan", label: "Japan" },
  { value: "South Korea", label: "South Korea" },
  { value: "India", label: "India" },
  { value: "No preference", label: "No preference", sub: "I'm open to anywhere" },
];

const BUDGET_OPTIONS: QuizOption[] = [
  { value: "Under $15k", label: "Under $15,000" },
  { value: "$15k-$30k", label: "$15,000 – $30,000" },
  { value: "$30k-$50k", label: "$30,000 – $50,000" },
  { value: "$50k+", label: "$50,000+" },
];

const GPA_OPTIONS: QuizOption[] = [
  { value: "3.5+", label: "3.5 and above", sub: "Strong academic record" },
  { value: "3.0-3.5", label: "3.0 – 3.5", sub: "Above average" },
  { value: "2.5-3.0", label: "2.5 – 3.0", sub: "Average" },
  { value: "Below 2.5", label: "Below 2.5", sub: "Building up" },
];

const CAMPUS_OPTIONS: QuizOption[] = [
  { value: "Small", label: "Small", sub: "Under 5,000 students" },
  { value: "Medium", label: "Medium", sub: "5,000 – 20,000 students" },
  { value: "Large", label: "Large", sub: "20,000+ students" },
];

const TEST_SCORE_OPTIONS: QuizOption[] = [
  { value: "SAT", label: "SAT", sub: "I have an SAT score" },
  { value: "ACT", label: "ACT", sub: "I have an ACT score" },
  { value: "None", label: "Skip this", sub: "I don't have a test score yet" },
];

const AID_OPTIONS: QuizOption[] = [
  {
    value: "Essential",
    label: "Essential",
    sub: "I can't attend without scholarships or aid",
  },
  { value: "Helpful", label: "Helpful", sub: "Aid would make a real difference" },
  { value: "Not a factor", label: "Not a factor", sub: "I don't need aid to attend" },
];

const CLASS_SIZE_OPTIONS: QuizOption[] = [
  { value: "Small", label: "Intimate seminars", sub: "Average class under ~20 students" },
  { value: "Medium", label: "Mid-size classes", sub: "Roughly 20–40 students" },
  { value: "Large", label: "Big lectures are fine", sub: "40+ doesn't bother me" },
  { value: "No preference", label: "No preference", sub: "Class size isn't a factor" },
];

/**
 * School-personality picks, each mapped to a predicate over real university
 * data (tags / founding year / tuition) — never a vibe we can't verify.
 */
const VIBE_OPTIONS: (QuizOption & {
  matches?: (u: (typeof universities)[number]) => boolean;
})[] = [
  {
    value: "Research",
    label: "Research powerhouse",
    sub: "Labs, papers, and grad-school pipelines",
    matches: (u) => u.tags.includes("Research"),
  },
  {
    value: "STEM",
    label: "STEM & tech energy",
    sub: "Engineering culture, startups, hackathons",
    matches: (u) => u.tags.includes("STEM") || u.tags.includes("Tech"),
  },
  {
    value: "Liberal Arts",
    label: "Liberal arts & broad thinking",
    sub: "Small, discussion-driven, interdisciplinary",
    matches: (u) => u.tags.includes("Liberal Arts"),
  },
  {
    value: "Historic",
    label: "History & prestige",
    sub: "Storied campuses and old traditions",
    matches: (u) =>
      u.established < 1900 ||
      u.tags.some((t) => ["Historic", "Elite", "Prestige", "Ivy League"].includes(t)),
  },
  {
    value: "Value",
    label: "Affordable value",
    sub: "Low or no tuition, big return",
    matches: (u) =>
      u.annualTuition < 15000 ||
      u.tags.includes("Affordable") ||
      u.tags.includes("Tuition-free"),
  },
  {
    value: "Urban",
    label: "Buzzing city campus",
    sub: "In the middle of a major city",
    matches: (u) => u.tags.includes("Urban"),
  },
  { value: "No preference", label: "No preference", sub: "Surprise me" },
];

const VIBE_LABELS: Record<string, string> = Object.fromEntries(
  VIBE_OPTIONS.map((v) => [v.value, v.label]),
);

const AMBITION_OPTIONS: QuizOption[] = [
  {
    value: "Safe",
    label: "Play it safer",
    sub: "Prioritize schools where my odds are strong",
  },
  { value: "Balanced", label: "Balanced mix", sub: "A healthy spread of odds" },
  {
    value: "Reach",
    label: "Aim high",
    sub: "Show me ambitious, selective picks",
  },
];

const BUDGET_MAX: Record<string, number> = {
  "Under $15k": 15000,
  "$15k-$30k": 30000,
  "$30k-$50k": 50000,
  "$50k+": Number.POSITIVE_INFINITY,
};

// Minimum acceptance rate a GPA band can realistically target.
const GPA_MIN_ACCEPT: Record<string, number> = {
  "3.5+": 0,
  "3.0-3.5": 10,
  "2.5-3.0": 25,
  "Below 2.5": 45,
};

const sizeBucket = (pop: number) =>
  pop < 5000 ? "Small" : pop <= 20000 ? "Medium" : "Large";

const classSizeBucket = (avg: number) =>
  avg <= 20 ? "Small" : avg <= 40 ? "Medium" : "Large";

interface Answers {
  region: string[];
  budget: string;
  aidImportance: string;
  field: string;
  fieldOtherText: string;
  gpa: string;
  classSize: string;
  campusSize: string;
  /** Up to 2 school-personality picks, or ["No preference"]. */
  vibes: string[];
  ambition: string;
  /** "SAT" | "ACT" | "None" | "" (unanswered). */
  testScoreType: string;
  testScoreValue: string;
}

const EMPTY_ANSWERS: Answers = {
  region: [],
  budget: "",
  aidImportance: "",
  field: "",
  fieldOtherText: "",
  gpa: "",
  classSize: "",
  campusSize: "",
  vibes: [],
  ambition: "",
  testScoreType: "",
  testScoreValue: "",
};

const TEST_SCORE_RANGE: Record<"SAT" | "ACT", { min: number; max: number }> = {
  SAT: { min: 400, max: 1600 },
  ACT: { min: 1, max: 36 },
};

/** Normalize a SAT/ACT score (0–100ish) against the GPA-derived minimum acceptance bar. */
function testScoreStrength(type: "SAT" | "ACT", value: number): number {
  const { min, max } = TEST_SCORE_RANGE[type];
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/** Loosely resolve a freeform "Other" field entry to a known major category, if any. */
function fuzzyCategoryMatch(text: string): string | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  for (const major of majors) {
    if (major.name.toLowerCase().includes(q) || q.includes(major.name.toLowerCase())) {
      return major.name;
    }
    for (const sm of major.subMajors) {
      if (sm.name.toLowerCase().includes(q) || q.includes(sm.name.toLowerCase())) {
        return major.name;
      }
    }
  }
  return null;
}

function computeMatches(answers: Answers): QuizMatch[] {
  const budgetMax = BUDGET_MAX[answers.budget] ?? Number.POSITIVE_INFINITY;
  const gpaMinAccept = GPA_MIN_ACCEPT[answers.gpa] ?? 0;

  const testType = answers.testScoreType === "SAT" || answers.testScoreType === "ACT"
    ? answers.testScoreType
    : null;
  const testValue = Number(answers.testScoreValue);
  const hasTestScore = Boolean(testType) && Number.isFinite(testValue) && testValue > 0;
  // Minimum acceptance rate this test score can realistically target, mirroring GPA_MIN_ACCEPT.
  const testMinAccept = hasTestScore && testType
    ? Math.max(0, 90 - testScoreStrength(testType, testValue) * 90)
    : 0;

  const aidWeight =
    answers.aidImportance === "Essential" ? 18 : answers.aidImportance === "Helpful" ? 10 : 0;
  const hasClassSizePref = Boolean(answers.classSize) && answers.classSize !== "No preference";
  const vibePicks = answers.vibes.filter((v) => v !== "No preference");
  const vibeMatchers = VIBE_OPTIONS.filter(
    (v) => vibePicks.includes(v.value) && v.matches,
  );

  const maxScore =
    30 + 25 + 20 + 20 + 10 +
    aidWeight +
    (hasClassSizePref ? 10 : 0) +
    vibeMatchers.length * 8 +
    (hasTestScore ? 15 : 0);

  const noPreference = answers.region.includes("No preference") || answers.region.length === 0;
  const isOther = answers.field === OTHER_VALUE;
  const fieldLabel = isOther ? answers.fieldOtherText.trim() || "your field" : answers.field;
  const category = isOther
    ? fuzzyCategoryMatch(answers.fieldOtherText)
    : FIELD_TO_CATEGORY[answers.field] ?? null;

  const scored = universities.map((u) => {
    let score = 0;
    const reasons: string[] = [];

    if (noPreference) {
      score += 8;
    } else if (answers.region.includes(u.region)) {
      score += 30;
      reasons.push(`In your preferred region (${u.region})`);
    }

    if (u.annualTuition <= budgetMax) {
      score += 25;
      reasons.push("Within your tuition budget");
    } else {
      score -= 15;
    }

    if (u.acceptanceRate >= gpaMinAccept) {
      score += 20;
      reasons.push("Realistic admission odds for your GPA");
    } else {
      score += 5;
    }

    if (category && u.majorsOffered.includes(category)) {
      score += 20;
      reasons.push(`Offers ${category}${isOther ? ` (matches "${fieldLabel}")` : ""}`);
    }

    if (sizeBucket(u.studentPopulation) === answers.campusSize) {
      score += 10;
      reasons.push(`${answers.campusSize} campus size`);
    }

    // Financial aid, scored against the school's real scholarship/aid data.
    if (aidWeight > 0) {
      if (u.scholarships.available) {
        score += aidWeight;
        reasons.push(
          u.financialAid >= 40
            ? `Scholarships offered, ${u.financialAid}% of students receive aid`
            : "Scholarships available",
        );
      } else if (answers.aidImportance === "Essential") {
        score -= 10; // hard signal: they can't attend without aid
      }
    }

    // Learning environment, scored against real average class size.
    if (hasClassSizePref && classSizeBucket(u.avgClassSize) === answers.classSize) {
      score += 10;
      reasons.push(`Average class of ~${u.avgClassSize} fits your learning style`);
    }

    // School personality, each pick scored via a verifiable data predicate.
    for (const vibe of vibeMatchers) {
      if (vibe.matches!(u)) {
        score += 8;
        reasons.push(VIBE_LABELS[vibe.value]);
      }
    }

    if (hasTestScore) {
      if (u.acceptanceRate >= testMinAccept) {
        score += 15;
        reasons.push(`Your ${testType} score aligns with this school's range`);
      } else {
        score += 5;
      }
    }

    // Rank tiebreaker, scaled by how bold the student wants the list to be.
    const rankBonus = Math.max(0, 10 - u.globalRanking / 25);
    if (answers.ambition === "Reach") {
      score += rankBonus * 2;
      if (u.acceptanceRate < 12) {
        score += 8;
        reasons.push("Ambitious, selective pick — as requested");
      }
    } else if (answers.ambition === "Safe") {
      score += rankBonus * 0.5;
      if (u.acceptanceRate >= gpaMinAccept + 20) {
        score += 8;
        reasons.push("Comfortable admission odds");
      }
    } else {
      score += rankBonus;
    }

    return { u, score, reasons };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((t) => ({
      university: t.u,
      matchPercent: Math.min(99, Math.max(70, Math.round((t.score / maxScore) * 100))),
      reasons: t.reasons.slice(0, 5),
    }));
}

/** Convert the page's internal answer shape to the public `QuizAnswers` type used by lib code. */
function toQuizAnswers(answers: Answers): QuizAnswers {
  const isOther = answers.field === OTHER_VALUE;
  const testValue = Number(answers.testScoreValue);
  const hasTestValue = Number.isFinite(testValue) && testValue > 0;
  let testScore: QuizAnswers["testScore"];
  if (answers.testScoreType === "SAT" || answers.testScoreType === "ACT") {
    testScore = { type: answers.testScoreType, ...(hasTestValue ? { value: testValue } : {}) };
  } else if (answers.testScoreType === "None") {
    testScore = { type: "None" };
  }

  return {
    region: answers.region as QuizAnswers["region"],
    budget: answers.budget as QuizAnswers["budget"],
    field: isOther ? answers.fieldOtherText.trim() : answers.field,
    fieldIsOther: isOther,
    gpa: answers.gpa as QuizAnswers["gpa"],
    campusSize: answers.campusSize as QuizAnswers["campusSize"],
    ...(answers.aidImportance
      ? { aidImportance: answers.aidImportance as QuizAnswers["aidImportance"] }
      : {}),
    ...(answers.classSize
      ? { classSize: answers.classSize as QuizAnswers["classSize"] }
      : {}),
    ...(answers.vibes.length > 0 ? { vibes: answers.vibes } : {}),
    ...(answers.ambition
      ? { ambition: answers.ambition as QuizAnswers["ambition"] }
      : {}),
    testScore,
  };
}

const STEP_LABELS = [
  "Region",
  "Budget",
  "Financial Aid",
  "Field of Study",
  "GPA",
  "Class Size",
  "Campus Size",
  "School Personality",
  "Your List",
  "Test Score",
];

function QuizPageInner() {
  const searchParams = useSearchParams();
  const prefilledField = searchParams.get("field");
  const initialField =
    prefilledField && FIELD_TO_CATEGORY[prefilledField] ? prefilledField : "";

  const { profile, hasProfile, saveProfile } = useAcademicProfile();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    ...EMPTY_ANSWERS,
    field: initialField,
  });
  const [status, setStatus] = useState<"quiz" | "loading" | "results">("quiz");
  const [matches, setMatches] = useState<QuizMatch[]>([]);
  const [profileSaved, setProfileSaved] = useState(false);
  const [insights, setInsights] = useState<QuizInsightsResult | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchInsights = async (computed: QuizMatch[], rawAnswers: Answers) => {
    const quizAnswers = toQuizAnswers(rawAnswers);
    const chances = computed.map((m) =>
      estimateChance(m.university, hasProfile ? profile : null),
    );
    const cacheKey = `quizInsights:${JSON.stringify(quizAnswers)}`;
    const cached = readLocal<QuizInsightsResult | null>(cacheKey, null);
    if (cached) {
      setInsights(cached);
      return;
    }

    setInsightsLoading(true);
    const payload = buildInsightsRequest(quizAnswers, computed, chances);
    const result = await requestQuizInsights(payload);
    setInsightsLoading(false);
    setInsights(result);
    if (result.available) {
      writeLocal(cacheKey, result);
    }
  };

  const saveAnswersToProfile = () => {
    const isOther = answers.field === OTHER_VALUE;
    const intendedMajor = isOther
      ? answers.fieldOtherText.trim() || null
      : (FIELD_TO_CATEGORY[answers.field] ?? answers.field) || null;
    const testValue = Number(answers.testScoreValue);
    const hasTestValue = Number.isFinite(testValue) && testValue > 0;
    saveProfile({
      gpa: GPA_BAND_TO_GPA[answers.gpa] ?? null,
      intendedMajor,
      preferredRegions: answers.region.filter((r) => r !== "No preference"),
      budgetBand: answers.budget || null,
      campusSize: answers.campusSize || null,
      ...(answers.testScoreType === "SAT" && hasTestValue ? { sat: testValue } : {}),
      ...(answers.testScoreType === "ACT" && hasTestValue ? { act: testValue } : {}),
    });
    setProfileSaved(true);
  };

  const progress = Math.round(((step + 1) / STEP_LABELS.length) * 100);
  const isLast = step === STEP_LABELS.length - 1;

  const isAnswered = useMemo(() => {
    if (step === 0) return answers.region.length > 0;
    if (step === 1) return Boolean(answers.budget);
    if (step === 2) return Boolean(answers.aidImportance);
    if (step === 3)
      return answers.field === OTHER_VALUE
        ? answers.fieldOtherText.trim().length > 0
        : Boolean(answers.field);
    if (step === 4) return Boolean(answers.gpa);
    if (step === 5) return Boolean(answers.classSize);
    if (step === 6) return Boolean(answers.campusSize);
    if (step === 7) return answers.vibes.length > 0;
    if (step === 8) return Boolean(answers.ambition);
    // Step 9 (test score) is optional/skippable — always considered answered.
    return true;
  }, [step, answers]);

  /** Multi-select toggle where "No preference" is exclusive and picks are capped. */
  const toggleCapped = (key: "region" | "vibes", cap: number) => (value: string) => {
    setAnswers((a) => {
      const current = a[key];
      if (value === "No preference") {
        return { ...a, [key]: ["No preference"] };
      }
      const withoutNoPreference = current.filter((r) => r !== "No preference");
      if (withoutNoPreference.includes(value)) {
        return { ...a, [key]: withoutNoPreference.filter((r) => r !== value) };
      }
      if (withoutNoPreference.length >= cap) return a;
      return { ...a, [key]: [...withoutNoPreference, value] };
    });
  };
  const toggleRegion = toggleCapped("region", 2);
  const toggleVibe = toggleCapped("vibes", 2);

  const handleContinue = () => {
    if (!isAnswered) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setStatus("loading");
    setTimeout(() => {
      const computed = computeMatches(answers);
      setMatches(computed);
      setStatus("results");
      void fetchInsights(computed, answers);
    }, 1400);
  };

  const reset = () => {
    setInsights(null);
    setInsightsLoading(false);
    setStep(0);
    setAnswers(EMPTY_ANSWERS);
    setMatches([]);
    setStatus("quiz");
  };

  return (
    <main className="flex flex-grow flex-col items-center justify-center px-md py-xl">
      <div className="relative z-10 w-full max-w-2xl">
        {status !== "results" && (
          <div className="mb-lg">
            <div className="mb-sm flex items-end justify-between">
              <span className="font-label-md uppercase tracking-wider text-primary">
                Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
              </span>
              <span className="font-label-md text-on-surface-variant">
                {progress}% Complete
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === "quiz" && (
          <>
            {step === 0 && (
              <QuizCard
                mode="multi"
                question="Which regions would you like to study in?"
                helperText="Pick up to 2 — we'll match you against schools in either."
                options={REGION_OPTIONS}
                selected={answers.region}
                maxSelections={2}
                onSelect={toggleRegion}
              />
            )}
            {step === 1 && (
              <QuizCard
                mode="single"
                question="What is your annual tuition budget?"
                options={BUDGET_OPTIONS}
                selected={answers.budget || undefined}
                onSelect={(value) => setAnswers((a) => ({ ...a, budget: value }))}
              />
            )}
            {step === 2 && (
              <QuizCard
                mode="single"
                question="How important are scholarships & financial aid?"
                helperText="We'll weigh each school's real scholarship programs and the share of students receiving aid."
                options={AID_OPTIONS}
                selected={answers.aidImportance || undefined}
                onSelect={(value) => setAnswers((a) => ({ ...a, aidImportance: value }))}
              />
            )}
            {step === 3 && (
              <div>
                <QuizCard
                  mode="single"
                  question="Which field do you want to study?"
                  helperText="Choose the closest match from 54 majors, or tell us in your own words."
                  options={[
                    ...FIELD_OPTIONS,
                    { value: OTHER_VALUE, label: "Other", sub: "Type your own interest" },
                  ]}
                  selected={answers.field || undefined}
                  onSelect={(value) => setAnswers((a) => ({ ...a, field: value }))}
                />
                {answers.field === OTHER_VALUE && (
                  <div className="mt-md animate-fade-in">
                    <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
                      Tell us what you&apos;re interested in
                    </label>
                    <input
                      autoFocus
                      type="text"
                      value={answers.fieldOtherText}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, fieldOtherText: e.target.value }))
                      }
                      placeholder="e.g. Marine Biology, Game Design, Architecture…"
                      className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-lg text-body-lg focus:border-primary focus:ring-0"
                    />
                  </div>
                )}
              </div>
            )}
            {step === 4 && (
              <QuizCard
                mode="single"
                question="What is your GPA range?"
                options={GPA_OPTIONS}
                selected={answers.gpa || undefined}
                onSelect={(value) => setAnswers((a) => ({ ...a, gpa: value }))}
              />
            )}
            {step === 5 && (
              <QuizCard
                mode="single"
                question="What learning environment suits you best?"
                helperText="Scored against each school's real average class size."
                options={CLASS_SIZE_OPTIONS}
                selected={answers.classSize || undefined}
                onSelect={(value) => setAnswers((a) => ({ ...a, classSize: value }))}
              />
            )}
            {step === 6 && (
              <QuizCard
                mode="single"
                question="What campus size do you prefer?"
                helperText="Total student population — a different thing from class size."
                options={CAMPUS_OPTIONS}
                selected={answers.campusSize || undefined}
                onSelect={(value) => setAnswers((a) => ({ ...a, campusSize: value }))}
              />
            )}
            {step === 7 && (
              <QuizCard
                mode="multi"
                question="What should your school be known for?"
                helperText="Pick up to 2 — each matched against real school traits, not guesses."
                options={VIBE_OPTIONS}
                selected={answers.vibes}
                maxSelections={2}
                onSelect={toggleVibe}
              />
            )}
            {step === 8 && (
              <QuizCard
                mode="single"
                question="How bold should your list be?"
                helperText="This shifts the balance between strong-odds schools and selective reaches."
                options={AMBITION_OPTIONS}
                selected={answers.ambition || undefined}
                onSelect={(value) => setAnswers((a) => ({ ...a, ambition: value }))}
              />
            )}
            {step === 9 && (
              <div>
                <QuizCard
                  mode="single"
                  question="Do you have a standardized test score?"
                  helperText="Optional — sharpens your admission chance estimates. Skip if you don't have one yet."
                  options={TEST_SCORE_OPTIONS}
                  selected={answers.testScoreType || undefined}
                  onSelect={(value) =>
                    setAnswers((a) => ({ ...a, testScoreType: value, testScoreValue: "" }))
                  }
                />
                {(answers.testScoreType === "SAT" || answers.testScoreType === "ACT") && (
                  <div className="mt-md animate-fade-in">
                    <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">
                      Your {answers.testScoreType} score
                    </label>
                    <input
                      autoFocus
                      type="number"
                      inputMode="numeric"
                      min={TEST_SCORE_RANGE[answers.testScoreType].min}
                      max={TEST_SCORE_RANGE[answers.testScoreType].max}
                      value={answers.testScoreValue}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, testScoreValue: e.target.value }))
                      }
                      placeholder={
                        answers.testScoreType === "SAT" ? "e.g. 1350" : "e.g. 29"
                      }
                      className="w-full rounded-xl border-2 border-outline-variant bg-surface p-md font-body-lg text-body-lg focus:border-primary focus:ring-0"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-lg flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-xs font-label-md text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
              >
                <Icon name="arrow_back" className="text-[20px]" />
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!isAnswered}
                className="rounded-lg bg-primary px-lg py-3 font-label-md text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {isLast ? "See My Matches" : "Continue"}
              </button>
            </div>
          </>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-xl text-center">
            <div className="mb-md h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Finding your best-fit schools…
            </h2>
            <p className="mt-xs font-body-md text-body-md text-on-surface-variant">
              Scoring {universities.length} universities against your answers.
            </p>
          </div>
        )}

        {status === "results" && (
          <section>
            <div className="mb-lg text-center">
              <Icon name="celebration" className="text-[40px] text-primary" />
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Your Top 3 Matches
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Scored across all {STEP_LABELS.length} of your answers — region, budget,
                aid, academics, learning style, and campus fit.
              </p>
            </div>

            <div className="space-y-md">
              {matches.map((m, i) => (
                <div
                  key={m.university.id}
                  className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-32 w-full sm:h-auto sm:w-40 sm:shrink-0">
                      <CampusGraphic name={m.university.name} className="absolute inset-0" />
                      <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-label-md text-caption text-primary shadow-sm backdrop-blur">
                        #{i + 1}
                      </div>
                    </div>
                    <div className="flex-1 p-md">
                      <div className="mb-1 flex items-start justify-between gap-sm">
                        <h3 className="font-headline-md text-headline-md text-on-surface">
                          {m.university.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-primary px-3 py-1 font-label-md text-caption text-on-primary">
                          {m.matchPercent}% Match
                        </span>
                      </div>
                      <p className="mb-sm font-caption text-caption text-on-surface-variant">
                        {flagFor(m.university.country)} {m.university.city},{" "}
                        {m.university.country}
                      </p>
                      <div className="mb-sm flex flex-wrap items-center gap-x-md gap-y-1 font-caption text-caption text-on-surface-variant">
                        <span>Rank #{m.university.globalRanking}</span>
                        <span>{formatCurrency(m.university.annualTuition, m.university.currency)}/yr</span>
                        <span>{m.university.acceptanceRate}% acceptance</span>
                        <ChanceBadge slug={m.university.slug} showEstimate />
                      </div>
                      <p className="mb-sm font-caption text-caption text-on-surface-variant">
                        {estimateChance(m.university, hasProfile ? profile : null).rationale}
                      </p>
                      <div className="mb-md flex flex-wrap gap-1">
                        {m.reasons.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-secondary-container px-2 py-0.5 font-caption text-caption text-on-secondary-container"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <AIInsightPanel
                        insight={insights?.insights?.find(
                          (ins) => ins.universitySlug === m.university.slug,
                        )}
                        loading={insightsLoading}
                      />
                      <Link
                        href={`/universities/${m.university.slug}`}
                        className="mt-md inline-block rounded-lg border-2 border-primary px-md py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-lg flex flex-col justify-center gap-sm sm:flex-row">
              <button
                onClick={reset}
                className="rounded-lg bg-secondary-container px-lg py-3 font-label-md text-primary transition-colors hover:bg-outline-variant/20"
              >
                Retake Quiz
              </button>
              <button
                onClick={saveAnswersToProfile}
                disabled={profileSaved}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-lg py-3 font-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-primary"
              >
                <Icon name={profileSaved ? "check_circle" : "save"} className="text-[20px]" />
                {profileSaved ? "Saved to profile" : "Save answers to my profile"}
              </button>
              <Link
                href="/universities"
                className="rounded-lg bg-primary px-lg py-3 text-center font-label-md text-on-primary transition-colors hover:bg-primary-container"
              >
                Browse All Universities
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-grow items-center justify-center py-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-container border-t-primary" />
        </main>
      }
    >
      <QuizPageInner />
    </Suspense>
  );
}
