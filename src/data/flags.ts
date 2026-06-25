/**
 * Country → flag-emoji lookup, deliberately kept in its OWN module (separate
 * from the large `universities` data array). Several client components only
 * need `flagFor`; importing it from here means they never transitively pull the
 * entire 197-record `universities` array into their browser bundle.
 */
const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Switzerland: "🇨🇭",
  Germany: "🇩🇪",
  Belgium: "🇧🇪",
  France: "🇫🇷",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Ireland: "🇮🇪",
  Sweden: "🇸🇪",
  Spain: "🇪🇸",
  Canada: "🇨🇦",
  China: "🇨🇳",
  "United Arab Emirates": "🇦🇪",
  Denmark: "🇩🇰",
  Austria: "🇦🇹",
  Finland: "🇫🇮",
  Poland: "🇵🇱",
  Norway: "🇳🇴",
  Portugal: "🇵🇹",
  "Czech Republic": "🇨🇿",
  Australia: "🇦🇺",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  India: "🇮🇳",
  Singapore: "🇸🇬",
};

/** Country flag emoji for a university's country (falls back to a globe). */
export const flagFor = (country: string): string => COUNTRY_FLAGS[country] ?? "🏳️";
