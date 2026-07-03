import { avatarColorFor, initialsFor } from "@/lib/universityLogo";

/**
 * A tasteful, deterministic CSS gradient composition standing in for a
 * university "banner photo" — this app has no licensed photography of any
 * specific campus, so rather than hotlink stock/placeholder images that
 * falsely imply a real photo, we render an obviously-designed graphic built
 * from the university's own color + initials plus a Material Symbols icon.
 */
export function CampusGraphic({
  name,
  className,
  icon = "account_balance",
}: {
  name: string;
  className?: string;
  icon?: string;
}) {
  const color = avatarColorFor(name);
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 55%, ${color}88 100%)`,
      }}
      aria-hidden="true"
    >
      <span
        className="material-symbols-outlined absolute -bottom-4 -right-4 select-none text-white/15"
        style={{ fontSize: 140 }}
      >
        {icon}
      </span>
      <span className="relative z-10 font-headline-lg text-headline-lg font-bold tracking-wide text-white/90">
        {initialsFor(name)}
      </span>
    </div>
  );
}
