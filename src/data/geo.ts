import { universities } from "@/data/universities";
import type { Region } from "@/types";

/**
 * Approximate coordinates for the university cities that appear among the
 * top-ranked schools (the ones rendered as globe pins). Keyed by the exact
 * `city` string used in the dataset (e.g. "Cambridge, MA" vs "Cambridge"),
 * which conveniently disambiguates same-named cities.
 */
const CITY_COORDS: Record<string, [number, number]> = {
  "Cambridge, MA": [42.373, -71.11],
  "Stanford, CA": [37.427, -122.17],
  "Berkeley, CA": [37.872, -122.259],
  "Pasadena, CA": [34.148, -118.144],
  "Los Angeles, CA": [34.052, -118.244],
  "Princeton, NJ": [40.348, -74.659],
  "New Haven, CT": [41.311, -72.926],
  "New York, NY": [40.713, -74.006],
  "Ithaca, NY": [42.444, -76.501],
  "Chicago, IL": [41.789, -87.6],
  "Evanston, IL": [42.056, -87.688],
  "Ann Arbor, MI": [42.278, -83.738],
  "Atlanta, GA": [33.775, -84.397],
  "Baltimore, MD": [39.329, -76.62],
  "Durham, NC": [36.001, -78.939],
  "Philadelphia, PA": [39.952, -75.193],
  "Pittsburgh, PA": [40.444, -79.953],
  Oxford: [51.755, -1.254],
  Cambridge: [52.205, 0.119],
  London: [51.507, -0.128],
  Edinburgh: [55.953, -3.188],
  Manchester: [53.481, -2.242],
  Bristol: [51.455, -2.588],
  Zurich: [47.377, 8.541],
  Lausanne: [46.52, 6.633],
  Munich: [48.137, 11.576],
  Paris: [48.857, 2.352],
  Amsterdam: [52.37, 4.895],
  Delft: [52.011, 4.357],
  Toronto: [43.653, -79.383],
  Montreal: [45.502, -73.567],
  Vancouver: [49.283, -123.121],
  Beijing: [39.904, 116.407],
  Shanghai: [31.23, 121.474],
  Hangzhou: [30.274, 120.155],
  Tokyo: [35.68, 139.65],
  Kyoto: [35.011, 135.768],
  Seoul: [37.566, 126.978],
  Daejeon: [36.35, 127.385],
  Sydney: [-33.868, 151.209],
  Melbourne: [-37.814, 144.963],
  Brisbane: [-27.47, 153.026],
  Canberra: [-35.282, 149.129],
};

/** Fallback centroids per region, used when a city isn't in the table above. */
const REGION_CENTROIDS: Record<Region, [number, number]> = {
  USA: [39.5, -98.35],
  Europe: [50.0, 9.0],
  Canada: [50.0, -97.0],
  China: [35.86, 104.2],
  UAE: [24.45, 54.38],
  Australia: [-25.27, 133.78],
  Japan: [36.2, 138.25],
  "South Korea": [36.5, 127.85],
  India: [22.0, 78.0],
};

/** Small deterministic jitter so region-fallback pins don't stack exactly. */
function jitter(seed: string): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = ((h & 0xffff) / 0xffff - 0.5) * 8; // ±4°
  const b = (((h >> 16) & 0xffff) / 0xffff - 0.5) * 8;
  return [a, b];
}

export interface GlobePin {
  slug: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

/** How many top-ranked universities to light up on the globe. */
const PIN_COUNT = 48;

/**
 * The top-ranked universities, resolved to coordinates — computed once at
 * module load. Deterministic, so SSR and client agree.
 */
export const GLOBE_PINS: GlobePin[] = [...universities]
  .sort((a, b) => a.globalRanking - b.globalRanking)
  .slice(0, PIN_COUNT)
  .map((u) => {
    const hit = CITY_COORDS[u.city];
    if (hit) {
      return { slug: u.slug, name: u.name, city: u.city, lat: hit[0], lng: hit[1] };
    }
    const centroid = REGION_CENTROIDS[u.region] ?? [0, 0];
    const [dLat, dLng] = jitter(u.id);
    return {
      slug: u.slug,
      name: u.name,
      city: u.city,
      lat: centroid[0] + dLat,
      lng: centroid[1] + dLng,
    };
  });
