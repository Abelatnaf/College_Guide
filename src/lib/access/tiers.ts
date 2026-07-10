/**
 * Payment tiers, pricing, and the feature → tier map that drives the hard
 * paywall. Single source of truth so the payment page, the access gate, and
 * every feature's <RequireTier> stay in sync.
 */

export type Tier = "basic" | "standard" | "premium";

export const TIER_RANK: Record<Tier, number> = {
  basic: 0,
  standard: 1,
  premium: 2,
};

export function meetsTier(have: Tier | null | undefined, need: Tier): boolean {
  if (!have) return false;
  return TIER_RANK[have] >= TIER_RANK[need];
}

export interface TierInfo {
  id: Tier;
  label: string;
  priceEtb: number;
  tagline: string;
  features: string[];
}

export const TIERS: TierInfo[] = [
  {
    id: "basic",
    label: "Basic",
    priceEtb: 250,
    tagline: "Explore and shortlist schools",
    features: [
      "Browse every university & major",
      "Side-by-side Compare tool",
      "Best-fit Quiz",
      "Scholarships directory",
      "Shortlist saving",
    ],
  },
  {
    id: "standard",
    label: "Standard",
    priceEtb: 550,
    tagline: "Plan the application, not just the school",
    features: [
      "Everything in Basic",
      "Cost Calculator & ROI",
      "Affordability Finder",
      "Cost-to-Apply breakdowns",
      "Applications Tracker & checklist",
      "Path planner & deadline Calendar",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    priceEtb: 850,
    tagline: "Full AI-assisted application support",
    features: [
      "Everything in Standard",
      "AI Essay Feedback",
      "AI Chat Advisor",
      "AI appeal-letter drafting",
    ],
  },
];

export const PAYMENT_DETAILS = {
  telebirr: { number: "+251 979272130", name: "Abel" },
  abyssinia: { accountNumber: "244528694", name: "Abel" },
};
