import { universities } from "@/data/universities";

/**
 * Infinite scrolling strip of top university names — the editorial
 * "ticker" between the hero and the first section. Pure CSS animation
 * (server-rendered, zero JS): the row is duplicated once and translated
 * -50%, so the loop is seamless. `motion-safe:` leaves it static under
 * prefers-reduced-motion.
 */
export function UniversityMarquee() {
  const names = [...universities]
    .sort((a, b) => a.globalRanking - b.globalRanking)
    .slice(0, 18)
    .map((u) => u.name);

  const Row = () => (
    <>
      {names.map((name) => (
        <span key={name} className="flex shrink-0 items-center gap-8">
          <span className="whitespace-nowrap font-display text-[22px] italic text-on-surface-variant/50 md:text-[26px]">
            {name}
          </span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-primary/50" />
        </span>
      ))}
    </>
  );

  return (
    <div className="hairline marquee-mask overflow-hidden border-y py-md" aria-hidden>
      <div className="flex w-max gap-8 motion-safe:animate-marquee">
        <Row />
        <Row />
      </div>
    </div>
  );
}
