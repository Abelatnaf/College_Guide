import { getApplicationFee, type ApplicationFeeEntry } from "@/data/applicationFees";
import { getUniversityBySlug } from "@/data/universities";
import type { University } from "@/types";

export interface CostSummary {
  verified: { university: University; fee: ApplicationFeeEntry }[];
  unverified: University[];
  byCurrency: Map<string, number>;
}

/** Split a list of university slugs into fee-verified vs unverified, and total the verified fees by currency. Never invents a fee for an unverified school. */
export function summarizeApplicationFees(slugs: string[]): CostSummary {
  const verified: { university: University; fee: ApplicationFeeEntry }[] = [];
  const unverified: University[] = [];
  for (const slug of slugs) {
    const university = getUniversityBySlug(slug);
    if (!university) continue;
    const fee = getApplicationFee(slug);
    if (fee) verified.push({ university, fee });
    else unverified.push(university);
  }

  const byCurrency = new Map<string, number>();
  for (const { fee } of verified) {
    byCurrency.set(fee.currency, (byCurrency.get(fee.currency) ?? 0) + fee.amount);
  }

  return { verified, unverified, byCurrency };
}
