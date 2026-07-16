import { describe, it, expect } from "vitest";
import { meetsTier, TIERS, TIER_RANK, type Tier } from "./tiers";

describe("meetsTier", () => {
  it("returns false when the user has no tier", () => {
    expect(meetsTier(null, "basic")).toBe(false);
    expect(meetsTier(undefined, "basic")).toBe(false);
  });

  it("grants access when the held tier exactly matches", () => {
    expect(meetsTier("basic", "basic")).toBe(true);
    expect(meetsTier("standard", "standard")).toBe(true);
    expect(meetsTier("premium", "premium")).toBe(true);
  });

  it("grants access when the held tier is higher than required", () => {
    expect(meetsTier("standard", "basic")).toBe(true);
    expect(meetsTier("premium", "basic")).toBe(true);
    expect(meetsTier("premium", "standard")).toBe(true);
  });

  it("denies access when the held tier is lower than required", () => {
    expect(meetsTier("basic", "standard")).toBe(false);
    expect(meetsTier("basic", "premium")).toBe(false);
    expect(meetsTier("standard", "premium")).toBe(false);
  });
});

describe("TIERS catalog", () => {
  it("lists the three tiers in ascending price order", () => {
    expect(TIERS.map((t) => t.id)).toEqual(["basic", "standard", "premium"]);
    const prices = TIERS.map((t) => t.priceEtb);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("ranks tiers so each step up is strictly greater", () => {
    expect(TIER_RANK.basic).toBeLessThan(TIER_RANK.standard);
    expect(TIER_RANK.standard).toBeLessThan(TIER_RANK.premium);
  });

  it("every catalog entry has a rank and non-empty features", () => {
    for (const tier of TIERS) {
      expect(TIER_RANK[tier.id as Tier]).toBeTypeOf("number");
      expect(tier.features.length).toBeGreaterThan(0);
    }
  });
});
