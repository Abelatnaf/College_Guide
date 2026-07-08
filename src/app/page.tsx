import Image from "next/image";
import Link from "next/link";
import { universities } from "@/data/universities";
import { majors } from "@/data/majors";
import { applicationFees } from "@/data/applicationFees";
import { Reveal } from "@/components/ui/Reveal";
import { CountUpStat } from "@/components/ui/CountUpStat";
import { HeroCta } from "@/components/ui/HeroCta";
import { UniversityMarquee } from "@/components/ui/UniversityMarquee";
import { Stagger } from "@/components/motion/Stagger";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Tilt3D } from "@/components/motion/Tilt3D";
import { ScrollParallax } from "@/components/motion/ScrollParallax";
import { CinematicHeroMedia } from "@/components/hero/CinematicHeroMedia";

const FEATURES = [
  {
    index: "01",
    href: "/majors",
    icon: "science",
    title: "Explore Majors",
    body: "Discover fields of study that align with your natural strengths and future market demand. Take our assessment to find your match.",
    cta: "Browse Fields",
  },
  {
    index: "02",
    href: "/universities",
    icon: "public",
    title: "Find Universities",
    body: "Search schools globally with filters for tuition, campus life, ranking, and acceptance rates. Find your dream campus today.",
    cta: "Search Schools",
  },
  {
    index: "03",
    href: "/compare",
    icon: "compare_arrows",
    title: "Compare Schools",
    body: "Weigh the pros and cons of your top choices side by side, across dozens of the metrics that actually matter.",
    cta: "Start Comparing",
  },
];

/** Editorial section header: watermark numeral + eyebrow + serif display title. */
function SectionHeader({
  number,
  eyebrow,
  title,
  className = "",
}: {
  number: string;
  eyebrow: string;
  title: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`relative mb-xl ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 left-0 select-none font-display text-[120px] font-medium leading-none text-stroke-primary opacity-40 md:text-[160px]"
      >
        {number}
      </span>
      <div className="relative pt-8">
        <p className="mb-sm flex items-center gap-sm font-micro text-micro uppercase text-primary">
          <span className="inline-block h-px w-8 bg-primary/60" />
          {eyebrow}
        </p>
        <h2 className="max-w-2xl font-display text-display-lg text-on-surface">{title}</h2>
      </div>
    </Reveal>
  );
}

export default function HomePage() {
  const universityCount = universities.length;
  const majorCount = majors.length;
  const verifiedFeeCount = Object.keys(applicationFees).length;

  return (
    <main>
      {/* ————— Hero ————— */}
      <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="relative z-10 mx-auto max-w-container-max px-md md:px-lg">
          <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1.05fr_0.95fr]">
            <Stagger className="text-center lg:text-left" stagger={0.09} delay={0.05}>
              <StaggerItem>
                <p className="mb-md flex items-center justify-center gap-sm font-micro text-micro uppercase text-primary lg:justify-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  The honest university guide
                  <span className="hidden h-px w-10 bg-primary/50 sm:inline-block" />
                </p>
              </StaggerItem>
              <StaggerItem variant="rise">
                <h1 className="mx-auto max-w-[13ch] font-display text-display-xl text-on-background lg:mx-0">
                  Find the university that fits your{" "}
                  <em className="bg-gradient-to-r from-primary to-tertiary-fixed bg-clip-text not-italic text-transparent [font-style:italic]">
                    life.
                  </em>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto mt-md max-w-lg font-body-lg text-body-lg text-on-surface-variant lg:mx-0">
                  A short quiz matches you with schools that fit your budget, grades,
                  and goals — with honest, explained admission-chance estimates and
                  side-by-side comparison. All in one place, all free.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-lg flex flex-col items-center justify-center gap-md sm:flex-row lg:justify-start">
                  <HeroCta />
                  <a
                    href="#explore"
                    className="hairline flex h-14 w-full items-center justify-center gap-2 rounded-full border px-8 font-label-md text-body-md text-on-surface transition-all duration-300 hover:border-primary/50 hover:text-primary sm:w-auto"
                  >
                    How It Works
                    <span className="material-symbols-outlined text-[18px]">south</span>
                  </a>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="hairline mx-auto mt-xl grid max-w-md grid-cols-3 gap-md border-t pt-md lg:mx-0">
                  {[
                    { value: universityCount, suffix: "+", label: "Universities" },
                    { value: majorCount, suffix: "", label: "Fields of study" },
                    { value: verifiedFeeCount, suffix: "", label: "Verified fees" },
                  ].map((s) => (
                    <div key={s.label} className="text-center lg:text-left">
                      <p className="font-display text-[28px] font-medium text-primary md:text-[34px]">
                        <CountUpStat value={s.value} suffix={s.suffix} />
                      </p>
                      <p className="mt-1 font-micro text-micro uppercase text-on-surface-variant">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </StaggerItem>
            </Stagger>

            {/* Visual side — cinematic campus sequence in a tilted frame with
                floating glass panels at their own depth. */}
            <ScrollParallax strength={24} className="relative hidden lg:block">
              <div className="motion-safe:animate-float-slow">
                <Tilt3D
                  maxTilt={6}
                  className="hairline aspect-[4/5] w-full overflow-hidden rounded-[28px] border shadow-glow-lg"
                >
                  <CinematicHeroMedia className="absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
                  {/* bottom-36 clears the featured-school card overlaid below */}
                  <p className="absolute bottom-36 left-6 right-6 font-display text-[24px] italic leading-snug text-white/90">
                    “The right school is the one that fits — not just the one that’s famous.”
                  </p>
                </Tilt3D>
              </div>

              <Tilt3D maxTilt={14} className="absolute -bottom-4 left-6 right-6 rounded-2xl">
                <Link
                  href="/universities/stanford"
                  className="glass-panel hairline block rounded-2xl border p-md shadow-lg"
                >
                  <div className="mb-sm flex items-center justify-between">
                    <p className="font-micro text-micro uppercase text-on-surface-variant">
                      Featured school
                    </p>
                    <span className="font-label-md text-caption text-primary">
                      Explore →
                    </span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed">
                      <span className="material-symbols-outlined text-on-primary-fixed-variant">
                        account_balance
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-[18px] text-on-surface">
                        Stanford University
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Stanford, California
                      </p>
                    </div>
                  </div>
                </Link>
              </Tilt3D>

              <div className="absolute -right-2 -top-4 motion-safe:animate-float-slower">
                <Tilt3D maxTilt={16} className="rounded-2xl">
                  <div className="glass-panel hairline flex items-center gap-sm rounded-2xl border p-md shadow-glow">
                    <span className="font-display text-[30px] font-medium text-primary">
                      {universityCount}+
                    </span>
                    <p className="max-w-[9ch] font-micro text-micro uppercase leading-relaxed text-on-surface-variant">
                      Schools in the directory
                    </p>
                  </div>
                </Tilt3D>
              </div>
            </ScrollParallax>
          </div>
        </div>
      </section>

      {/* ————— University ticker ————— */}
      <UniversityMarquee />

      {/* ————— 01 · Explore ————— */}
      <section id="explore" className="scroll-mt-20 py-xl md:py-24">
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <SectionHeader
            number="01"
            eyebrow="Explore"
            title={
              <>
                Every tool you need, from{" "}
                <em className="text-primary">“where should I go?”</em> to{" "}
                <em className="text-primary">“I’m enrolled.”</em>
              </>
            }
          />
          <div className="grid grid-cols-1 gap-md md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.href} delayMs={i * 100}>
                <Tilt3D maxTilt={8} className="h-full rounded-2xl">
                  <Link
                    href={f.href}
                    className="hairline group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface-container-lowest p-lg transition-colors duration-300 hover:border-primary/40"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[96px] font-medium leading-none text-primary/[0.07] transition-colors duration-300 group-hover:text-primary/[0.13]"
                    >
                      {f.index}
                    </span>
                    <span className="material-symbols-outlined mb-lg text-[36px] text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      {f.icon}
                    </span>
                    <h3 className="mb-sm font-display text-[24px] text-on-surface">{f.title}</h3>
                    <p className="mb-lg flex-grow font-body-md text-body-md text-on-surface-variant">
                      {f.body}
                    </p>
                    <span className="flex items-center gap-xs font-micro text-micro uppercase text-primary transition-all group-hover:gap-base">
                      {f.cta}
                      <span className="material-symbols-outlined text-[16px]">east</span>
                    </span>
                  </Link>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————— 02 · Decide ————— */}
      <section className="bg-surface-container-low/30 py-xl md:py-24">
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <SectionHeader
            number="02"
            eyebrow="Decide"
            title={
              <>
                Know your <em className="text-primary">real</em> chances — no black boxes.
              </>
            }
          />
          <div className="grid h-auto grid-cols-1 grid-rows-2 gap-md md:h-[560px] md:grid-cols-4">
            <Reveal className="md:col-span-2 md:row-span-2">
              <Tilt3D maxTilt={5} className="relative h-full overflow-hidden rounded-[24px]">
                <Image
                  src="/images/hero-graduation.jpg"
                  alt="Graduates celebrating"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/45 to-background/10" />
                <div className="relative z-10 flex h-full flex-col justify-end p-lg md:p-xl">
                  <p className="mb-sm font-micro text-micro uppercase text-primary">
                    How we’re different
                  </p>
                  <h3 className="mb-sm max-w-md font-display text-display-md text-white">
                    Safety, Target, or Reach — with the reasoning shown.
                  </h3>
                  <p className="mb-md max-w-sm font-body-md text-body-md text-white/80">
                    Every school gets an explained estimate, not a mystery percentage.
                    You see exactly why, right next to the number.
                  </p>
                  <Link
                    href="/quiz"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 font-label-md text-on-primary shadow-glow-sm transition-all hover:shadow-glow"
                  >
                    Take the Quiz
                    <span className="material-symbols-outlined text-[18px]">east</span>
                  </Link>
                </div>
              </Tilt3D>
            </Reveal>

            <Reveal delayMs={100} className="md:col-span-2">
              <Tilt3D maxTilt={8} className="h-full rounded-[24px]">
                <Link
                  href="/affordability-finder"
                  className="hairline group flex h-full items-center justify-between gap-md overflow-hidden rounded-[24px] border bg-surface-container-lowest p-lg transition-colors hover:border-primary/40"
                >
                  <div>
                    <h4 className="mb-xs font-display text-[22px] text-on-surface">
                      Affordability Finder
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Which schools are need-blind and meet full demonstrated need —
                      verified against official aid policies, with sources.
                    </p>
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-[44px] text-primary transition-transform duration-300 group-hover:scale-110">
                    payments
                  </span>
                </Link>
              </Tilt3D>
            </Reveal>

            <Reveal delayMs={150}>
              <Tilt3D maxTilt={10} className="h-full rounded-[24px]">
                <Link
                  href="/applications"
                  className="hairline group flex h-full flex-col justify-between rounded-[24px] border bg-surface-container-lowest p-lg transition-colors hover:border-primary/40"
                >
                  <span className="material-symbols-outlined text-[36px] text-primary transition-transform group-hover:scale-110">
                    history_edu
                  </span>
                  <div>
                    <p className="font-display text-[19px] text-on-surface">Application Tracker</p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Stay on top of every deadline.
                    </p>
                  </div>
                </Link>
              </Tilt3D>
            </Reveal>

            <Reveal delayMs={200}>
              <Tilt3D maxTilt={10} className="h-full rounded-[24px]">
                <Link
                  href="/contact"
                  className="hairline group flex h-full flex-col justify-between rounded-[24px] border bg-primary-container/20 p-lg transition-colors hover:border-primary/40"
                >
                  <span className="material-symbols-outlined text-[36px] text-primary transition-transform group-hover:scale-110">
                    forum
                  </span>
                  <div>
                    <p className="font-display text-[19px] text-on-surface">Have Questions?</p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Reach out to our team.
                    </p>
                  </div>
                </Link>
              </Tilt3D>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ————— 03 · Track ————— */}
      <section id="how-it-works" className="scroll-mt-20 py-xl md:py-24">
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <SectionHeader
            number="03"
            eyebrow="Track"
            title={
              <>
                Three steps from <em className="text-primary">lost</em> to{" "}
                <em className="text-primary">enrolled.</em>
              </>
            }
          />
          <Reveal className="hairline grid grid-cols-1 items-stretch overflow-hidden rounded-[24px] border bg-surface-container-lowest lg:grid-cols-2">
            <div className="p-lg md:p-xl">
              <div className="space-y-lg">
                {[
                  {
                    step: "1",
                    title: "Create a Profile",
                    body: "Answer a few questions about your budget, grades, and goals.",
                  },
                  {
                    step: "2",
                    title: "Get Matched",
                    body: "See a shortlist with honest, explained admission-chance estimates.",
                  },
                  {
                    step: "3",
                    title: "Track Your Applications",
                    body: "Keep deadlines and statuses for every school in one place.",
                  },
                ].map(({ step, title, body }, i, arr) => (
                  <div key={step} className="relative flex gap-md">
                    {i < arr.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[22px] top-12 h-[calc(100%+8px)] w-px bg-outline-variant/40"
                      />
                    )}
                    <span className="hairline flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-surface font-display text-[20px] italic text-primary">
                      {step}
                    </span>
                    <div className="pt-1.5">
                      <h4 className="font-display text-[20px] text-on-surface">{title}</h4>
                      <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ScrollParallax strength={30} className="relative min-h-[300px]">
              <Image
                src="/images/hero-journey.jpg"
                alt="Airplane window view above the clouds"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center p-lg text-center">
                <p className="mb-xs font-display text-display-md italic text-white">
                  Ready when you are.
                </p>
                <p className="mb-md max-w-xs font-body-md text-body-md text-white/80">
                  Build your profile to unlock school matches tailored just for you.
                </p>
                <Link
                  href="/quiz"
                  className="rounded-full bg-primary px-6 py-3 font-label-md text-on-primary shadow-glow-sm transition-all hover:shadow-glow"
                >
                  Start My Profile
                </Link>
              </div>
            </ScrollParallax>
          </Reveal>
        </div>
      </section>

      {/* ————— Closing CTA ————— */}
      <section className="hairline border-t py-xl md:py-28">
        <div className="mx-auto max-w-container-max px-md text-center md:px-lg">
          <Reveal>
            <p className="mb-sm font-micro text-micro uppercase text-primary">Free, forever</p>
            <h2 className="mx-auto max-w-[16ch] font-display text-display-lg text-on-surface">
              Your path starts <em className="text-primary">here.</em>
            </h2>
            <div className="mt-lg flex justify-center">
              <HeroCta />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
