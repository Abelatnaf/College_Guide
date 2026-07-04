import Image from "next/image";
import type { Region } from "@/types";
import { getRegionImage } from "@/lib/regionImages";
import { CampusGraphic } from "@/components/ui/CampusGraphic";

/**
 * Location-flavored image band for a university card/hero.
 *
 * Renders a real, free-license photo of the university's REGION (city
 * skyline etc.) with a green gradient wash and an honest location chip —
 * deliberately never claiming to depict the university's actual campus
 * (see the honesty contract in src/lib/regionImages.ts). Falls back to the
 * generated CampusGraphic when no region photo exists.
 */
export function LocationImage({
  name,
  region,
  city,
  className,
  showLabel = true,
  sizes = "(min-width: 768px) 33vw, 100vw",
  priority = false,
}: {
  /** University name — used only for the CampusGraphic fallback. */
  name: string;
  region: Region;
  /** Optional "City, ST" string shown in the location chip instead of the region label. */
  city?: string;
  className?: string;
  showLabel?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const image = getRegionImage(region);

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
          {city ?? image.label}
        </span>
      )}
    </div>
  );
}
