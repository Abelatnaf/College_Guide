import { readLocal, writeLocal, removeLocal } from "@/lib/storage/localStore";

/**
 * One-shot signal for why a user is landing on /payment — set right before
 * sending them into the sign-in flow from a locked feature, consumed once by
 * the payment page so it can explain what they're unlocking instead of
 * showing a generic tier grid. Cleared on read so it never goes stale.
 */
const KEY = "paymentContext";

const CONTEXT_LABELS: Record<string, string> = {
  quiz: "your other 2 quiz matches",
  path: "your Command Center",
  "cost-to-apply": "the full Cost to Apply breakdown",
  calculator: "the Cost Calculator",
  essays: "the Essay Hub",
  chat: "Ask AI",
  calendar: "the Deadline Calendar",
  applications: "the Application Tracker",
  "affordability-finder": "the Affordability Finder",
};

/** Derive a payment-context key from a blocked pathname, or null if there's no good label. */
export function contextKeyForPathname(pathname: string): string | null {
  const segment = pathname.split("/")[1];
  return segment && CONTEXT_LABELS[segment] ? segment : null;
}

export function setPaymentContext(key: string): void {
  writeLocal(KEY, key);
}

/** Reads and clears the stored context, returning its display label or null. */
export function consumePaymentContextLabel(): string | null {
  const key = readLocal<string | null>(KEY, null);
  removeLocal(KEY);
  return key ? CONTEXT_LABELS[key] ?? null : null;
}
