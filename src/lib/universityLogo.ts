/**
 * Derives a real favicon URL for a university from its official `website`
 * domain using DuckDuckGo's icon service (icons.duckduckgo.com) — free, no
 * API key, and returns a clean 404 for unknown domains rather than a generic
 * placeholder image, which lets the `onError` fallback in `UniversityLogo`
 * trigger correctly instead of silently showing a non-answer as if it were
 * real. (Clearbit's free Logo API was verified dead — its domain no longer
 * resolves in DNS — so it was replaced with this.)
 */
export function universityFaviconUrl(website: string): string | null {
  try {
    const hostname = new URL(website).hostname.replace(/^www\./, "");
    return hostname ? `https://icons.duckduckgo.com/ip3/${hostname}.ico` : null;
  } catch {
    return null;
  }
}

/** Deterministic background color for an initials avatar, derived from the name. */
const AVATAR_PALETTE = [
  "#006948", // primary green
  "#21588f", // blue
  "#9a6b15", // amber
  "#7a4ea0", // purple
  "#b3261e", // red
  "#0f7a4e", // teal-green
  "#4a5568", // slate
  "#8a5a2f", // brown
];

export function avatarColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

/** Up to 2-letter initials derived from a university name, e.g. "MIT" -> "MI", "Stanford University" -> "SU". */
export function initialsFor(name: string): string {
  const words = name
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^(of|the|and|for|at)$/i.test(w));
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
