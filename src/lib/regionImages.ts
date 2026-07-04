import type { Region } from "@/types";

/**
 * Region → local photo mapping for location-flavored imagery.
 *
 * HONESTY CONTRACT (extension of the Week-1 credibility pass): these are
 * real, free-license CITY/REGION photographs — they are never presented as
 * a photo of a specific university's campus. Labels and alt text name the
 * city/region only. Files live in public/images/ with attribution recorded
 * in public/images/credits.json (surfaced on the About page).
 *
 * A region absent from this map (or a missing file) falls back to the
 * honest generated CampusGraphic gradient.
 */
export interface RegionImage {
  /** Path under public/, e.g. "/images/region-usa.jpg". */
  src: string;
  /** Honest, non-campus-specific description for alt text. */
  alt: string;
  /** Short human label shown as the image caption chip, e.g. "New York, USA". */
  label: string;
}

export const REGION_IMAGES: Partial<Record<Region, RegionImage>> = {
  USA: {
    src: "/images/region-usa.jpg",
    alt: "City skyline in the United States",
    label: "United States",
  },
  Europe: {
    src: "/images/region-europe.jpg",
    alt: "European city view",
    label: "Europe",
  },
  Canada: {
    src: "/images/region-canada.jpg",
    alt: "Toronto skyline, Canada",
    label: "Canada",
  },
  China: {
    src: "/images/region-china.jpg",
    alt: "City skyline in China",
    label: "China",
  },
  UAE: {
    src: "/images/region-uae.jpg",
    alt: "Dubai skyline, United Arab Emirates",
    label: "UAE",
  },
  Australia: {
    src: "/images/region-australia.jpg",
    alt: "Sydney harbour, Australia",
    label: "Australia",
  },
  Japan: {
    src: "/images/region-japan.jpg",
    alt: "Tokyo cityscape, Japan",
    label: "Japan",
  },
  "South Korea": {
    src: "/images/region-south-korea.jpg",
    alt: "Seoul cityscape, South Korea",
    label: "South Korea",
  },
  India: {
    src: "/images/region-india.jpg",
    alt: "Cityscape in India",
    label: "India",
  },
};

export function getRegionImage(region: Region): RegionImage | undefined {
  return REGION_IMAGES[region];
}
