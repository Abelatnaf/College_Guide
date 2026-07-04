/**
 * University → verified real campus photo, keyed by slug.
 *
 * HONESTY CONTRACT: every entry here is a genuine, specifically-sourced photo
 * of that exact university's own campus — not a generic city photo, and not
 * an unverified guess. Sourced from Wikimedia Commons (never a university's
 * own copyrighted press photos, which aren't freely licensed for reuse here).
 * Unlike the Pexels photos elsewhere in this app, Wikimedia licenses (CC BY,
 * CC BY-SA) typically require attribution — every entry's `license` and
 * `attribution` fields are surfaced on the About page's photo credits section
 * to satisfy that requirement.
 *
 * Deliberately NOT exhaustive: most of the 237 universities in the directory
 * have no free-licensed campus photo available at all, and are left absent
 * from this map on purpose — LocationImage falls back to the honest
 * country-level photo (see countryImages.ts) rather than showing nothing or
 * guessing. Only add an entry here after individually verifying the photo is
 * genuinely of that campus and genuinely under a free license.
 */
export interface UniversityImage {
  /** Path under public/, e.g. "/images/universities/mit.jpg". */
  src: string;
  /** Honest, specific description for alt text — names the actual building/view. */
  alt: string;
  photographer: string;
  license: string;
  sourceUrl: string;
}

export const UNIVERSITY_IMAGES: Partial<Record<string, UniversityImage>> = {
  mit: {
    src: "/images/universities/mit.jpg",
    alt: "The Great Dome, Building 10, Massachusetts Institute of Technology",
    photographer: "Beyond My Ken",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2017_Maclaurin_Buildings_(MIT_Building_10)_and_Great_Dome_close.jpg",
  },
  harvard: {
    src: "/images/universities/harvard.jpg",
    alt: "Widener Library, Harvard Yard, Harvard University",
    photographer: "Phoebe Barghouty",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Widener_Library_front.jpg",
  },
  stanford: {
    src: "/images/universities/stanford.jpg",
    alt: "Main Quad and Hoover Tower, Stanford University",
    photographer: "King of Hearts",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Stanford_University_Main_Quad_(cropped).jpg",
  },
  yale: {
    src: "/images/universities/yale.jpg",
    alt: "Harkness Tower, Yale University",
    photographer: "Hrichardson (WMF)",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Harkness_Tower_Yale_Fall_2014.jpg",
  },
  princeton: {
    src: "/images/universities/princeton.jpg",
    alt: "Nassau Hall, Princeton University",
    photographer: "Ken Lund",
    license: "CC BY-SA 2.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Cannon_Green_and_Nassau_Hall,_Princeton_University.jpg",
  },
  columbia: {
    src: "/images/universities/columbia.jpg",
    alt: "Low Memorial Library, Columbia University",
    photographer: "Beyond My Ken",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2014_Columbia_University_Low_Memorial_Library_from_front.jpg",
  },
  "uc-berkeley": {
    src: "/images/universities/uc-berkeley.jpg",
    alt: "Sather Tower (the Campanile), UC Berkeley",
    photographer: "Doug Letterman",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:UC_Berkeley_Sather_Tower_-_Jan_16,_2022.jpg",
  },
  ucla: {
    src: "/images/universities/ucla.jpg",
    alt: "Royce Hall, UCLA",
    photographer: "Beyond My Ken",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2019_UCLA_Royce_Hall_2.jpg",
  },
  "university-of-michigan": {
    src: "/images/universities/university-of-michigan.jpg",
    alt: "Angell Hall, University of Michigan",
    photographer: "Chris Rycroft",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Front_of_Angell_Hall.jpg",
  },
  nyu: {
    src: "/images/universities/nyu.jpg",
    alt: "Washington Square Arch, at the heart of NYU's Greenwich Village campus (a public NYC landmark, not an NYU-owned building)",
    photographer: "Elisa.rolle",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Washington_Square_Arch_03.JPG",
  },
};

export function getUniversityImage(slug: string): UniversityImage | undefined {
  return UNIVERSITY_IMAGES[slug];
}
