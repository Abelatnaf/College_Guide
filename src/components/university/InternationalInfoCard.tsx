import { getInternationalInfo } from "@/data/internationalInfo";

/** Curated official government links for studying as an international student in this school's country. Renders nothing when unverified — never a placeholder implying unverified info. */
export function InternationalInfoCard({ country }: { country: string }) {
  const info = getInternationalInfo(country);
  if (!info) return null;

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <div className="mb-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">public</span>
        <h3 className="font-headline-md text-headline-md">Studying in {info.country}</h3>
      </div>
      <p className="mb-md font-caption text-caption text-on-surface-variant">{info.note}</p>
      <div className="flex flex-wrap gap-md font-label-md text-caption">
        <a
          href={info.visaInfoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          Student Visa Info ↗
        </a>
        {info.workAuthUrl && (
          <a
            href={info.workAuthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Post-Graduation Work Authorization ↗
          </a>
        )}
        {info.testRequirementsUrl && (
          <a
            href={info.testRequirementsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Visa Language Requirements ↗
          </a>
        )}
      </div>
      <p className="mt-md font-caption text-caption text-on-surface-variant/70">
        Official government/institutional sources — not UniPath claims. Rules change; always
        confirm current requirements on the linked page.
      </p>
    </div>
  );
}
