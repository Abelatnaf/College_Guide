import Image from "next/image";
import { getCountryImage } from "@/lib/countryImages";
import { getUniversityImage } from "@/lib/universityImages";
import { CampusGraphic } from "@/components/ui/CampusGraphic";

/**
 * Location-flavored image band for a university card/hero.
 *
 * Prefers a verified, genuine photo of the university's OWN campus (see the
 * honesty contract in src/lib/universityImages.ts) when one exists. Most
 * universities don't have one, so this falls back to a real photo of the
 * university's actual COUNTRY (city skyline etc.) — never a different
 * country's skyline (see src/lib/countryImages.ts) — and finally to the
 * generated CampusGraphic gradient when neither exists.
 */
export function LocationImage({
  name,
  slug,
  country,
  city,
  className,
  showLabel = true,
  sizes = "(min-width: 768px) 33vw, 100vw",
  priority = false,
}: {
  /** University name — used only for the CampusGraphic fallback. */
  name: string;
  /** University slug — checked against verified per-campus photos first. */
  slug: string;
  country: string;
  /** Optional "City, ST" string shown in the location chip instead of the country/campus label. */
  city?: string;
  className?: string;
  showLabel?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const uniImage = getUniversityImage(slug);
  const countryImage = getCountryImage(country);
  const image = uniImage ?? countryImage;

  if (!image) {
    return <CampusGraphic name={name} className={className} />;
  }

  return (
    <div className={`group/img relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 group-hover/img:scale-105"
      />
      {/* Green brand wash so photos sit inside the design language */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent" />
      {showLabel && (
        <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 font-caption text-[11px] text-white backdrop-blur-sm">
          <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
            location_on
          </span>
          {city ?? (uniImage ? undefined : countryImage?.label)}
        </span>
      )}
    </div>
  );
}
