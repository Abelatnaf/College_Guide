/**
 * Country → local photo mapping for location-flavored imagery.
 *
 * HONESTY CONTRACT (extension of the Week-1 credibility pass): these are
 * real, free-license CITY photographs of the university's actual COUNTRY —
 * never presented as a photo of a specific university's campus, and never a
 * photo of the wrong country (the previous version of this file grouped many
 * European countries under one UK photo, which was misleading — this maps
 * every country individually instead). Labels and alt text name the
 * city/country only. Files live in public/images/ with attribution recorded
 * in public/images/credits.json (surfaced on the About page).
 *
 * A country absent from this map (or a missing file) falls back to the
 * honest generated CampusGraphic gradient.
 */
export interface CountryImage {
  /** Path under public/, e.g. "/images/country-usa.jpg". */
  src: string;
  /** Honest, non-campus-specific description for alt text. */
  alt: string;
  /** Short human label shown as the image caption chip, e.g. "United States". */
  label: string;
}

export const COUNTRY_IMAGES: Partial<Record<string, CountryImage>> = {
  "United States": {
    src: "/images/region-usa.jpg",
    alt: "City skyline in the United States",
    label: "United States",
  },
  "United Kingdom": {
    src: "/images/region-europe.jpg",
    alt: "Big Ben and the Houses of Parliament over the Thames, London, UK",
    label: "United Kingdom",
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
  "United Arab Emirates": {
    src: "/images/region-uae.jpg",
    alt: "Dubai skyline, United Arab Emirates",
    label: "United Arab Emirates",
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
  Switzerland: {
    src: "/images/country-switzerland.jpg",
    alt: "Grossmünster and the Limmat river, Zurich, Switzerland",
    label: "Switzerland",
  },
  Germany: {
    src: "/images/country-germany.jpg",
    alt: "Berlin skyline with the Fernsehturm and the Spree river, Germany",
    label: "Germany",
  },
  Belgium: {
    src: "/images/country-belgium.jpg",
    alt: "Aerial view of Brussels, Belgium",
    label: "Belgium",
  },
  France: {
    src: "/images/country-france.jpg",
    alt: "Eiffel Tower and city rooftops, Paris, France",
    label: "France",
  },
  Netherlands: {
    src: "/images/country-netherlands.jpg",
    alt: "Canal houses in Amsterdam, Netherlands",
    label: "Netherlands",
  },
  Italy: {
    src: "/images/country-italy.jpg",
    alt: "St. Peter's Basilica over the Tiber river at twilight, Rome, Italy",
    label: "Italy",
  },
  Ireland: {
    src: "/images/country-ireland.jpg",
    alt: "Ha'penny Bridge over the River Liffey, Dublin, Ireland",
    label: "Ireland",
  },
  Sweden: {
    src: "/images/country-sweden.jpg",
    alt: "Stockholm City Hall at sunset over the waterfront, Sweden",
    label: "Sweden",
  },
  Spain: {
    src: "/images/country-spain.jpg",
    alt: "Torrespaña Tower and modern skyline, Madrid, Spain",
    label: "Spain",
  },
  Denmark: {
    src: "/images/country-denmark.jpg",
    alt: "Copenhagen City Hall tower and rooftops, Denmark",
    label: "Denmark",
  },
  Austria: {
    src: "/images/country-austria.jpg",
    alt: "Rooftops and church spires, Vienna, Austria",
    label: "Austria",
  },
  Finland: {
    src: "/images/country-finland.jpg",
    alt: "Helsinki Cathedral viewed from a historic street, Finland",
    label: "Finland",
  },
  Poland: {
    src: "/images/country-poland.jpg",
    alt: "Warsaw skyline with the Palace of Culture and Science, Poland",
    label: "Poland",
  },
  Norway: {
    src: "/images/country-norway.jpg",
    alt: "Oslo waterfront at sunset, Norway",
    label: "Norway",
  },
  Portugal: {
    src: "/images/country-portugal.jpg",
    alt: "Lisbon rooftops at twilight, Portugal",
    label: "Portugal",
  },
  "Czech Republic": {
    src: "/images/country-czech-republic.jpg",
    alt: "Prague rooftops and the Vltava river, Czech Republic",
    label: "Czech Republic",
  },
};

export function getCountryImage(country: string): CountryImage | undefined {
  return COUNTRY_IMAGES[country];
}
