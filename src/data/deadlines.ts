/**
 * Verified application deadlines (ED/ED2/EA/RD/Rolling), keyed by university
 * slug. Same discipline as src/data/aidPolicy.ts: every entry was verified
 * against the school's own official admissions page — a slug NOT present
 * here means it was never checked, not that it has no deadlines. The UI
 * must fall back to the school's static `applicationDeadline` label rather
 * than assume anything.
 *
 * Do not add, guess, or "fill in" entries here without a real sourceUrl.
 */

export type DeadlineType = "ED" | "ED2" | "EA" | "RD" | "Rolling";

export interface DeadlineEntry {
  type: DeadlineType;
  /** Month+day only, e.g. "Nov 01" — parsed by the same parseDeadline() used
   *  for the static label, so it auto-rolls to next occurrence every year. */
  label: string;
  sourceUrl: string;
  note?: string;
}

export const deadlines: Record<string, DeadlineEntry[]> = {
  mit: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://mitadmissions.org/apply/firstyear/deadlines-requirements/", note: "MIT offers no Early Decision — only non-binding Early Action and Regular Action." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://mitadmissions.org/apply/firstyear/deadlines-requirements/" },
  ],
  harvard: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://college.harvard.edu/admissions/apply/first-year-applicants", note: "Restrictive (Single-Choice) Early Action — non-binding, but restricts applying early to other private schools." },
    { type: "RD", label: "Jan 01", sourceUrl: "https://college.harvard.edu/admissions/apply/first-year-applicants" },
  ],
  yale: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://admissions.yale.edu/timelines", note: "Single-Choice Early Action — non-binding, but restricts applying early to other private schools." },
    { type: "RD", label: "Jan 02", sourceUrl: "https://admissions.yale.edu/timelines" },
  ],
  princeton: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://admission.princeton.edu/apply/first-year-application-dates-deadlines", note: "Single-Choice Early Action — non-binding, but restricts applying to other private early programs." },
    { type: "RD", label: "Jan 01", sourceUrl: "https://admission.princeton.edu/apply/first-year-application-dates-deadlines" },
  ],
  "amherst-college": [
    { type: "ED", label: "Nov 09", sourceUrl: "https://www.amherst.edu/admission/apply/firstyear/calendar_deadlines", note: "Amherst offers a single binding Early Decision round (no ED II)." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://www.amherst.edu/admission/apply/firstyear/calendar_deadlines" },
  ],
  dartmouth: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admissions.dartmouth.edu/apply-dartmouth" },
    { type: "RD", label: "Jan 01", sourceUrl: "https://admissions.dartmouth.edu/apply-dartmouth" },
  ],
  "bowdoin-college": [
    { type: "ED", label: "Nov 15", sourceUrl: "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html" },
    { type: "ED2", label: "Jan 05", sourceUrl: "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html" },
    { type: "RD", label: "Feb 01", sourceUrl: "https://www.bowdoin.edu/admissions/apply/dates-deadlines/index.html" },
  ],
  "williams-college": [
    { type: "ED", label: "Nov 15", sourceUrl: "https://www.williams.edu/admission-aid/apply/deadlines/", note: "Williams offers a single binding ED round (no ED II)." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://www.williams.edu/admission-aid/apply/deadlines/" },
  ],
  "middlebury-college": [
    { type: "ED", label: "Nov 03", sourceUrl: "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines" },
    { type: "RD", label: "Jan 05", sourceUrl: "https://www.middlebury.edu/college/admissions/application-instructions-and-deadlines" },
  ],
  "vassar-college": [
    { type: "ED", label: "Nov 15", sourceUrl: "https://www.vassar.edu/admission/apply" },
    { type: "ED2", label: "Jan 01", sourceUrl: "https://www.vassar.edu/admission/apply", note: "Early Decision II and Regular Decision share the same January 1 deadline." },
    { type: "RD", label: "Jan 01", sourceUrl: "https://www.vassar.edu/admission/apply" },
  ],
  columbia: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://undergrad.admissions.columbia.edu/apply/firstyear/early-decision" },
    { type: "RD", label: "Jan 01", sourceUrl: "https://undergrad.admissions.columbia.edu/apply/firstyear" },
  ],
  brown: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admission.brown.edu/first-year/early-decision" },
    { type: "RD", label: "Jan 05", sourceUrl: "https://admission.brown.edu/first-year/regular-decision" },
  ],
  upenn: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admissions.upenn.edu/how-to-apply/first-year-applicants" },
    { type: "RD", label: "Jan 05", sourceUrl: "https://admissions.upenn.edu/how-to-apply/first-year-applicants" },
  ],
  stanford: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://admission.stanford.edu/apply/first-year/decision_process.html", note: "Restrictive Early Action — non-binding, but restricts other private-school early applications." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://admission.stanford.edu/apply/first-year/decision_process.html" },
  ],
  "uc-berkeley": [
    { type: "RD", label: "Nov 30", sourceUrl: "https://admissions.berkeley.edu/apply-to-berkeley/dates-deadlines/", note: "UC schools share one Nov 30 deadline for all UC campuses; Berkeley offers no ED, EA, or rolling admission." },
  ],
  ucla: [
    { type: "RD", label: "Nov 30", sourceUrl: "https://admission.ucla.edu/apply/first-year", note: "UC schools share one Nov 30 deadline for all UC campuses; UCLA offers no ED, EA, or rolling admission." },
  ],
  "university-of-michigan": [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admissions.umich.edu/apply/first-year-applicants/first-year-application-plans", note: "Michigan added a binding Early Decision plan starting with Fall 2026 applicants." },
    { type: "EA", label: "Nov 01", sourceUrl: "https://admissions.umich.edu/apply/first-year-applicants/first-year-application-plans" },
    { type: "RD", label: "Feb 01", sourceUrl: "https://admissions.umich.edu/apply/first-year-applicants/first-year-application-plans" },
  ],
  "carnegie-mellon": [
    { type: "ED", label: "Nov 02", sourceUrl: "https://www.cmu.edu/admission/admission/application-plans-deadlines" },
    { type: "RD", label: "Jan 04", sourceUrl: "https://www.cmu.edu/admission/admission/application-plans-deadlines" },
  ],
  caltech: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://www.admissions.caltech.edu/apply/first-year-applicants/deadlines", note: "Restrictive Early Action — non-binding, but restricts other private-school early applications." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://www.admissions.caltech.edu/apply/first-year-applicants/deadlines" },
  ],
  "georgia-tech": [
    { type: "EA", label: "Oct 15", sourceUrl: "https://admission.gatech.edu/first-year/deadlines", note: "Early Action 1 — for Georgia high school students / Georgia residents only." },
    { type: "EA", label: "Nov 03", sourceUrl: "https://admission.gatech.edu/first-year/deadlines", note: "Early Action 2 — for students attending high school outside Georgia (including international applicants)." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://admission.gatech.edu/first-year/deadlines" },
  ],
  "ut-austin": [
    { type: "EA", label: "Oct 15", sourceUrl: "https://admissions.utexas.edu/apply/freshman/", note: "UT Austin has no true binding/non-binding early program — this is the 'Priority' filing deadline for automatic admission and scholarship consideration." },
    { type: "RD", label: "Dec 01", sourceUrl: "https://admissions.utexas.edu/apply/freshman/", note: "UT Austin's 'Final' application deadline." },
  ],
  "wesleyan-university": [
    { type: "ED", label: "Nov 15", sourceUrl: "https://www.wesleyan.edu/admission/undergraduate-admission/early-decision.html" },
    { type: "ED2", label: "Jan 01", sourceUrl: "https://www.wesleyan.edu/admission/undergraduate-admission/early-decision.html" },
    { type: "RD", label: "Jan 15", sourceUrl: "https://www.wesleyan.edu/admission/undergraduate-admission/first-year.html" },
  ],
  "colby-college": [
    { type: "ED", label: "Nov 15", sourceUrl: "https://afa.colby.edu/apply/dates-and-deadlines/" },
    { type: "ED2", label: "Jan 05", sourceUrl: "https://afa.colby.edu/apply/dates-and-deadlines/", note: "Early Decision II and Regular Decision share the same January 5 deadline." },
    { type: "RD", label: "Jan 05", sourceUrl: "https://afa.colby.edu/apply/dates-and-deadlines/" },
  ],
  "haverford-college": [
    { type: "ED", label: "Nov 15", sourceUrl: "https://www.haverford.edu/admission/applying/application-timeline" },
    { type: "ED2", label: "Jan 05", sourceUrl: "https://www.haverford.edu/admission/applying/application-timeline" },
    { type: "RD", label: "Jan 10", sourceUrl: "https://www.haverford.edu/admission/applying/application-timeline" },
  ],
  "macalester-college": [
    { type: "ED", label: "Nov 01", sourceUrl: "https://www.macalester.edu/admissions/deadlines/", note: "Macalester unusually offers both Early Decision I and non-restrictive Early Action, both due Nov 1." },
    { type: "EA", label: "Nov 01", sourceUrl: "https://www.macalester.edu/admissions/deadlines/" },
    { type: "ED2", label: "Jan 01", sourceUrl: "https://www.macalester.edu/admissions/deadlines/" },
    { type: "RD", label: "Jan 15", sourceUrl: "https://www.macalester.edu/admissions/deadlines/" },
  ],
  cornell: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admissions.cornell.edu/how-to-apply/first-year-applicants" },
    { type: "RD", label: "Jan 02", sourceUrl: "https://admissions.cornell.edu/how-to-apply/first-year-applicants" },
  ],
  duke: [
    { type: "ED", label: "Nov 02", sourceUrl: "https://admissions.duke.edu/checklist/" },
    { type: "RD", label: "Jan 04", sourceUrl: "https://admissions.duke.edu/checklist/" },
  ],
  northwestern: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admissions.northwestern.edu/apply/application-deadlines.html", note: "Northwestern offers a single ED round (no ED II) and no Early Action." },
    { type: "RD", label: "Jan 04", sourceUrl: "https://admissions.northwestern.edu/apply/application-deadlines.html" },
  ],
  georgetown: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://uadmissions.georgetown.edu/applying/early-action/", note: "Non-restrictive/non-binding Early Action; Georgetown offers no ED program." },
    { type: "RD", label: "Jan 01", sourceUrl: "https://uadmissions.georgetown.edu/applying/first-year-application/" },
  ],
  rice: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admission.rice.edu/apply/first-year-domestic-applicants" },
    { type: "ED2", label: "Jan 04", sourceUrl: "https://admission.rice.edu/apply/first-year-domestic-applicants", note: "Early Decision II and Regular Decision share the same January 4 deadline." },
    { type: "RD", label: "Jan 04", sourceUrl: "https://admission.rice.edu/apply/first-year-domestic-applicants" },
  ],
  vanderbilt: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://admissions.vanderbilt.edu/apply/decision-plans.php" },
    { type: "ED2", label: "Jan 01", sourceUrl: "https://admissions.vanderbilt.edu/apply/decision-plans.php", note: "Early Decision II and Regular Decision share the same January 1 deadline." },
    { type: "RD", label: "Jan 01", sourceUrl: "https://admissions.vanderbilt.edu/apply/decision-plans.php" },
  ],
  "johns-hopkins": [
    { type: "ED", label: "Nov 01", sourceUrl: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/early-decision/" },
    { type: "ED2", label: "Jan 02", sourceUrl: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/early-decision/", note: "Early Decision II and Regular Decision share the same January 2 deadline." },
    { type: "RD", label: "Jan 02", sourceUrl: "https://apply.jhu.edu/how-to-apply/application-deadlines-requirements/" },
  ],
  nyu: [
    { type: "ED", label: "Nov 01", sourceUrl: "https://www.admissions.nyu.edu/applying.for.admissions/freshman/early.decision.html", note: "NYU offers no Early Action — only two binding ED rounds plus non-binding Regular Decision." },
    { type: "ED2", label: "Jan 01", sourceUrl: "https://www.admissions.nyu.edu/applying.for.admissions/freshman/early.decision.html" },
    { type: "RD", label: "Jan 05", sourceUrl: "https://www.admissions.nyu.edu/applying.for.admissions/freshman/early.decision.html" },
  ],
  "university-of-chicago": [
    { type: "EA", label: "Nov 01", sourceUrl: "https://collegeadmissions.uchicago.edu/apply/application/", note: "Non-restrictive/non-binding Early Action." },
    { type: "ED", label: "Nov 01", sourceUrl: "https://collegeadmissions.uchicago.edu/apply/application/" },
    // ED2/Regular Decision date intentionally omitted — sources disagreed
    // (variously Jan 1/2/4/5/6 depending on cached cycle-year). Confirm on
    // the official page above before adding.
  ],
  usc: [
    { type: "EA", label: "Nov 01", sourceUrl: "https://admission.usc.edu/prospective-students/how-to-apply/" },
    { type: "ED", label: "Nov 01", sourceUrl: "https://admission.usc.edu/prospective-students/how-to-apply/", note: "USC added a binding Early Decision option starting with Fall 2027 applicants, alongside existing non-binding Early Action." },
    { type: "RD", label: "Jan 10", sourceUrl: "https://admission.usc.edu/prospective-students/how-to-apply/" },
  ],
  "pomona-college": [
    { type: "ED", label: "Nov 08", sourceUrl: "https://www.pomona.edu/admissions/paths-apply", note: "Pomona offers no Early Action; only ED I, ED II, and RD." },
    { type: "ED2", label: "Jan 08", sourceUrl: "https://www.pomona.edu/admissions/paths-apply", note: "Early Decision II and Regular Decision share the same January 8 deadline." },
    { type: "RD", label: "Jan 08", sourceUrl: "https://www.pomona.edu/admissions/paths-apply" },
  ],
  "wellesley-college": [
    { type: "ED", label: "Nov 01", sourceUrl: "https://www.wellesley.edu/admission-aid/apply/first-year-applicants" },
    { type: "ED2", label: "Jan 01", sourceUrl: "https://www.wellesley.edu/admission-aid/apply/first-year-applicants" },
    { type: "RD", label: "Jan 08", sourceUrl: "https://www.wellesley.edu/admission-aid/apply/first-year-applicants" },
  ],
};

/** Look up verified structured deadlines, or undefined if this school hasn't been verified yet. */
export function getDeadlines(slug: string): DeadlineEntry[] | undefined {
  return deadlines[slug];
}
