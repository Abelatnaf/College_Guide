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
  "carnegie-mellon": {
    src: "/images/universities/carnegie-mellon.jpg",
    alt: "Hamerschlag Hall, Carnegie Mellon University",
    photographer: "-cpt-",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:CMU_Hamerschlag_Hall.jpg",
  },
  "johns-hopkins": {
    src: "/images/universities/johns-hopkins.jpg",
    alt: "Gilman Hall at the head of the Upper Quad, Johns Hopkins University",
    photographer: "Ottawa80",
    license: "Public domain",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Gilman_Hall_at_the_head_of_the_Upper_Quad,_Johns_Hopkins_University.jpg",
  },
  caltech: {
    src: "/images/universities/caltech.jpg",
    alt: "Millikan Library, California Institute of Technology",
    photographer: "en:User:Geographer",
    license: "CC BY 1.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Millikan_Library,_Caltech.jpg",
  },
  cornell: {
    src: "/images/universities/cornell.jpg",
    alt: "McGraw Tower, Cornell University",
    photographer: "Herbert Lanks",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cornell_University_-_McGraw_Tower.jpg",
  },
  oxford: {
    src: "/images/universities/oxford.jpg",
    alt: "The Radcliffe Camera, University of Oxford",
    photographer: "Zhushenje",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Radcliffe_Camera,_Oxford,_UK.jpg",
  },
  cambridge: {
    src: "/images/universities/cambridge.jpg",
    alt: "King's College Chapel, University of Cambridge",
    photographer: "Martinvl",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kings_College_Cambridge_Chapel_from_the_river.jpg",
  },
  "imperial-college": {
    src: "/images/universities/imperial-college.jpg",
    alt: "Queen's Tower, Imperial College London",
    photographer: "Chris Sampson",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Queen's_Tower,_Imperial_College_London.jpg",
  },
  ucl: {
    src: "/images/universities/ucl.jpg",
    alt: "The Wilkins Building portico, University College London",
    photographer: "LordHarris",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:UCL_Portico_Building.jpg",
  },
  edinburgh: {
    src: "/images/universities/edinburgh.jpg",
    alt: "Old College quad, University of Edinburgh",
    photographer: "Su Hongjia",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Old_College,_University_of_Edinburgh.JPG",
  },
  manchester: {
    src: "/images/universities/manchester.jpg",
    alt: "Whitworth Building, University of Manchester",
    photographer: "Mike Peel (www.mikepeel.net)",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:University_of_Manchester_-_Whitworth_Building.jpg",
  },
  "kings-college-london": {
    src: "/images/universities/kings-college-london.jpg",
    alt: "King's College London signage, Strand Campus",
    photographer: "Katy Ereira",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kings_College_London_Sign.jpg",
  },
  "eth-zurich": {
    src: "/images/universities/eth-zurich.jpg",
    alt: "Main building of ETH Zurich",
    photographer: "Leonhard Lenz",
    license: "CC0 1.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hauptgeb%C3%A4ude_der_ETH_Z%C3%BCrich_2022-09-24_01.jpg",
  },
  epfl: {
    src: "/images/universities/epfl.jpg",
    alt: "The Rolex Learning Center, EPFL",
    photographer: "Philippe (Nphilou)",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_Learning_Center.jpg",
  },
  "tu-munich": {
    src: "/images/universities/tu-munich.jpg",
    alt: "Main building clock tower, Technical University of Munich",
    photographer: "Fred Romero",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:M%C3%BCnchen_-_Technische_Universit%C3%A4t.jpg",
  },
  "ku-leuven": {
    src: "/images/universities/ku-leuven.jpg",
    alt: "University Hall, KU Leuven",
    photographer: "Frie Van Grunderbeeck",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Universiteitshal_K.U.Leuven.jpg",
  },
  sorbonne: {
    src: "/images/universities/sorbonne.jpg",
    alt: "The historic Sorbonne building, Latin Quarter, Paris (shared among the historic University of Paris's successor institutions, including Sorbonne University)",
    photographer: "Michal Osmenda",
    license: "CC BY-SA 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:La_Sorbonne_-_University_of_Paris,_15_August_2011.jpg",
  },
  "tu-delft": {
    src: "/images/universities/tu-delft.jpg",
    alt: "The Aula building, TU Delft",
    photographer: "T Houdijk",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aula_TU_Delft.jpg",
  },
};

export function getUniversityImage(slug: string): UniversityImage | undefined {
  return UNIVERSITY_IMAGES[slug];
}
