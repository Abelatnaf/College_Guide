/**
 * The app-wide ambient backdrop, mounted once in the root layout. Pure CSS
 * — two softly "breathing" gold/sage orbs plus an edge vignette. No JS,
 * no canvas, no WebGL: cheap enough to render unconditionally on every
 * device, and `motion-safe:` keeps the breathing animation off entirely under
 * prefers-reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-1/2 top-[-25%] h-[65vmax] w-[65vmax] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px] motion-safe:animate-aurora-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[48vmax] w-[48vmax] rounded-full bg-tertiary/10 blur-[130px] motion-safe:animate-aurora-slower" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,transparent_55%,rgb(var(--background)/0.65))]" />
    </div>
  );
}
