/**
 * A small set of well-known university slugs that stay browsable without an
 * account or payment — the "free taste" a shared link lands on. Picked to
 * span selectivity/region/aid-policy so the preview feels representative,
 * not cherry-picked. Everything else on /universities/[slug] stays behind
 * the normal paywall (see AccessGate.tsx).
 */
export const FREE_PREVIEW_SLUGS: string[] = [
  "mit",
  "harvard",
  "stanford",
  "yale",
  "princeton",
  "columbia",
  "nyu",
  "oxford",
  "cambridge",
  "university-of-toronto",
];

export function isFreePreviewSlug(slug: string): boolean {
  return FREE_PREVIEW_SLUGS.includes(slug);
}
