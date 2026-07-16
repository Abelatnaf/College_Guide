import { describe, it, expect } from "vitest";
import {
  estimateChance,
  hasAcademicSignal,
  strengthIndex,
} from "./chances";
import { emptyAcademicProfile, type AcademicProfile } from "@/lib/storage/types";
import type { University } from "@/types";

/** Minimal University stub — estimateChance only reads `acceptanceRate`. */
function uni(acceptanceRate: number): University {
  return { acceptanceRate } as University;
}

function profile(overrides: Partial<AcademicProfile>): AcademicProfile {
  return { ...emptyAcademicProfile(), ...overrides };
}

describe("hasAcademicSignal", () => {
  it("is false with no profile or an empty profile", () => {
    expect(hasAcademicSignal(null)).toBe(false);
    expect(hasAcademicSignal(undefined)).toBe(false);
    expect(hasAcademicSignal(emptyAcademicProfile())).toBe(false);
  });

  it("is true when any of gpa / sat / act is present", () => {
    expect(hasAcademicSignal(profile({ gpa: 3.5 }))).toBe(true);
    expect(hasAcademicSignal(profile({ sat: 1400 }))).toBe(true);
    expect(hasAcademicSignal(profile({ act: 30 }))).toBe(true);
  });

  it("ignores non-academic-strength fields like toefl", () => {
    expect(hasAcademicSignal(profile({ toefl: 100 }))).toBe(false);
  });
});

describe("strengthIndex", () => {
  it("defaults to 50 (average applicant) with no signals", () => {
    expect(strengthIndex(null)).toBe(50);
    expect(strengthIndex(emptyAcademicProfile())).toBe(50);
  });

  it("maps a perfect GPA to 100 and a perfect SAT to 100", () => {
    expect(strengthIndex(profile({ gpa: 4.0 }))).toBe(100);
    expect(strengthIndex(profile({ sat: 1600 }))).toBe(100);
    expect(strengthIndex(profile({ act: 36 }))).toBe(100);
  });

  it("averages multiple signals", () => {
    // gpa 2.0 -> 50, sat 1600 -> 100, average -> 75
    expect(strengthIndex(profile({ gpa: 2.0, sat: 1600 }))).toBe(75);
  });

  it("clamps out-of-range values to the 0–100 band", () => {
    expect(strengthIndex(profile({ sat: 200 }))).toBe(0);
    expect(strengthIndex(profile({ gpa: 5.0 }))).toBe(100);
  });
});

describe("estimateChance", () => {
  it("falls back to selectivity only when there is no profile", () => {
    const res = estimateChance(uni(80), null);
    expect(res.hasProfile).toBe(false);
    expect(res.estimate).toBe(80);
    expect(res.tier).toBe("safety");
    expect(res.rationale).toContain("80%");
  });

  it("assigns tiers by estimated admit probability", () => {
    expect(estimateChance(uni(80), null).tier).toBe("safety"); // >= 70
    expect(estimateChance(uni(50), null).tier).toBe("target"); // >= 40
    expect(estimateChance(uni(20), null).tier).toBe("reach"); // >= 15
    expect(estimateChance(uni(5), null).tier).toBe("high-reach"); // < 15
  });

  it("raises the estimate for a strong profile", () => {
    const base = uni(30);
    const baseline = estimateChance(base, null).estimate;
    const strong = estimateChance(base, profile({ gpa: 4.0, sat: 1600 }));
    expect(strong.hasProfile).toBe(true);
    expect(strong.estimate).toBeGreaterThan(baseline);
  });

  it("lowers the estimate for a weak profile", () => {
    const base = uni(50);
    const baseline = estimateChance(base, null).estimate;
    const weak = estimateChance(base, profile({ gpa: 1.0 }));
    expect(weak.estimate).toBeLessThan(baseline);
  });

  it("keeps the estimate within a sane 1–96 range", () => {
    const veryHigh = estimateChance(uni(95), profile({ gpa: 4.0, sat: 1600 }));
    expect(veryHigh.estimate).toBeLessThanOrEqual(96);
    const veryLow = estimateChance(uni(1), profile({ gpa: 0, sat: 400 }));
    expect(veryLow.estimate).toBeGreaterThanOrEqual(1);
  });
});
