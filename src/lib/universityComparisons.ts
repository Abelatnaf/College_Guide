import type { Major, University } from "@/types";
import { universities } from "@/data/universities";
import { majors } from "@/data/majors";
import type { PercentileContext } from "./universityInsights";

/**
 * Cross-university helpers that need the FULL directory (or the full major list)
 * to compute their result. These are deliberately split out of
 * `universityInsights.ts` so they are only ever imported by SERVER code (the
 * university profile page). Keeping them here means the client profile bundle
 * never pulls in the entire `universities`/`majors` data arrays — the page
 * computes these once at build time and passes the small results down as props.
 */

/** Where this school sits relative to every other school in the directory. */
export function getPercentileContext(
  u: University,
  all: University[] = universities,
): PercentileContext {
  const total = all.length;
  const denom = Math.max(1, total - 1);
  const moreSelectiveThan = all.filter((x) => x.acceptanceRate > u.acceptanceRate).length;
  const cheaperThan = all.filter((x) => x.annualTuition > u.annualTuition).length;
  const rankedBetterThan = all.filter((x) => x.globalRanking > u.globalRanking).length;
  const pct = (n: number) => Math.round((n / denom) * 100);

  return {
    selectivityPercentile: pct(moreSelectiveThan),
    affordabilityPercentile: pct(cheaperThan),
    rankPercentile: pct(rankedBetterThan),
    totalCompared: total,
  };
}

/** The most comparable schools in the directory — same region first, then closest in rank/tuition. */
export function getSimilarUniversities(
  u: University,
  all: University[] = universities,
  count = 3,
): University[] {
  return all
    .filter((x) => x.slug !== u.slug)
    .map((x) => {
      const regionPenalty = x.region === u.region ? 0 : 1000;
      const rankDiff = Math.abs(x.globalRanking - u.globalRanking);
      const tuitionDiff = Math.abs(x.annualTuition - u.annualTuition) / 1000;
      return { x, score: regionPenalty + rankDiff + tuitionDiff * 0.1 };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((s) => s.x);
}

/** Cross-references this school's `majorsOffered` names to the full Major records. */
export function getMajorDetails(u: University): Major[] {
  return u.majorsOffered
    .map((name) => majors.find((m) => m.name === name))
    .filter((m): m is Major => Boolean(m));
}
