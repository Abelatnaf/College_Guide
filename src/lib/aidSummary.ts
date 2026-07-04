import type { getAidPolicy } from "@/data/aidPolicy";

/** One-line, boolean-driven summary of an aid policy — avoids truncating the sourced note mid-sentence. */
export function aidSummaryLine(entry: NonNullable<ReturnType<typeof getAidPolicy>>): string {
  const parts: string[] = [];
  if (entry.needBlindForInternational === true) parts.push("Need-blind for international applicants");
  else if (entry.needBlindForInternational === false) parts.push("Need-aware for international applicants");

  if (entry.meetsFullDemonstratedNeed === true) parts.push("meets full demonstrated need");
  else if (entry.meetsFullDemonstratedNeed === false) parts.push("does not meet full demonstrated need");

  return parts.length > 0 ? `${parts.join(", ")}.` : entry.note;
}
