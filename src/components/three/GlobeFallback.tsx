/**
 * Pure-CSS globe. This is what SSR emits and what low/off-tier devices keep
 * permanently — no WebGL, no JS, no layout shift. A dark emerald sphere with a
 * lit highlight, glowing rim, and a scatter of static "pins".
 */
const PINS = [
  { top: "28%", left: "42%" },
  { top: "36%", left: "60%" },
  { top: "48%", left: "33%" },
  { top: "52%", left: "68%" },
  { top: "62%", left: "50%" },
  { top: "40%", left: "48%" },
  { top: "58%", left: "40%" },
];

export function GlobeFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-[82%] max-w-[440px]">
        {/* soft outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
        {/* the sphere */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(90,240,184,0.35), rgba(5,19,13,0.92) 55%, rgba(4,8,6,1) 78%)",
            boxShadow:
              "0 0 90px rgba(52,211,153,0.28), inset 0 0 70px rgba(52,211,153,0.14)",
          }}
        />
        {/* emerald rim */}
        <div className="absolute inset-0 rounded-full ring-1 ring-primary/40" />
        {/* pins */}
        {PINS.map((p, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-primary-fixed shadow-glow-sm"
            style={{ top: p.top, left: p.left }}
          />
        ))}
      </div>
    </div>
  );
}
