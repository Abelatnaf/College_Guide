import Image from "next/image";
import Link from "next/link";
import { universities } from "@/data/universities";
import { majors } from "@/data/majors";
import { applicationFees } from "@/data/applicationFees";
import { Reveal } from "@/components/ui/Reveal";
import { CountUpStat } from "@/components/ui/CountUpStat";
import { HeroCta } from "@/components/ui/HeroCta";
import { Stagger } from "@/components/motion/Stagger";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { GlobeLoader } from "@/components/three/GlobeLoader";

const FEATURES = [
  {
    href: "/majors",
    icon: "science",
    iconWrap: "bg-secondary-container text-primary",
    title: "Explore Majors",
    body: "Discover fields of study that align with your natural strengths and future market demand. Take our assessment to find your match.",
    cta: "Browse Fields",
  },
  {
    href: "/universities",
    icon: "public",
    iconWrap: "bg-primary-fixed-dim text-on-primary-fixed-variant",
    title: "Find Universities",
    body: "Search schools globally with filters for tuition, campus life, ranking, and acceptance rates. Find your dream campus today.",
    cta: "Search Schools",
  },
  {
    href: "/compare",
    icon: "compare_arrows",
    iconWrap: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    title: "Compare Schools",
    body: "Utilize our side-by-side comparison tool to weigh the pros and cons of your top choices across dozens of critical metrics.",
    cta: "Start Comparing",
  },
];

export default function HomePage() {
  const universityCount = universities.length;
  const majorCount = majors.length;
  const verifiedFeeCount = Object.keys(applicationFees).length;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-xl pb-24 md:py-32">
        <div className="relative z-10 mx-auto max-w-container-max px-md md:px-lg">
          <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-2">
            <Stagger className="space-y-md text-center lg:text-left" stagger={0.09} delay={0.05}>
              <StaggerItem>
                <div className="inline-flex items-center gap-xs rounded-full border border-primary/25 bg-secondary-container/50 px-sm py-1 font-label-md text-[12px] text-on-secondary-container backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary">public</span>
                  <span>{universityCount}+ universities in our directory</span>
                </div>
              </StaggerItem>
              <StaggerItem variant="rise">
                <h1 className="max-w-xl font-headline-xl-mobile text-headline-xl-mobile leading-tight text-on-background md:font-headline-xl md:text-headline-xl">
                  Find Your{" "}
                  <span className="italic bg-gradient-to-r from-primary to-tertiary-fixed bg-clip-text text-transparent">
                    Perfect
                  </span>{" "}
                  University
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto max-w-lg font-body-lg text-body-lg text-on-surface-variant lg:mx-0">
                  Take a short quiz to get matched with schools that fit your budget,
                  grades, and goals, see honest admission-chance estimates for each one,
                  and compare your shortlist side by side — all in one place.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col items-center justify-center gap-md pt-md sm:flex-row lg:justify-start">
                  <HeroCta />
                  <a
                    href="#how-it-works"
                    className="flex h-14 w-full items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-low/60 px-lg font-label-md text-body-md text-primary backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface-container sm:w-auto"
                  >
                    See How It Works
                  </a>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center justify-center gap-lg pt-sm lg:justify-start">
                  <div className="text-center lg:text-left">
                    <p className="font-headline-md text-headline-md font-bold text-primary">
                      <CountUpStat value={universityCount} suffix="+" />
                    </p>
                    <p className="font-caption text-caption text-on-surface-variant">Universities</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="font-headline-md text-headline-md font-bold text-primary">
                      <CountUpStat value={majorCount} />
                    </p>
                    <p className="font-caption text-caption text-on-surface-variant">Fields of study</p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="font-headline-md text-headline-md font-bold text-primary">
                      <CountUpStat value={verifiedFeeCount} />
                    </p>
                    <p className="font-caption text-caption text-on-surface-variant">Verified fees</p>
                  </div>
                </div>
              </StaggerItem>
            </Stagger>

            {/* Visual side — interactive procedural globe (drag to spin, hover a
                pin for a school; degrades to a CSS globe on modest devices). */}
            <div className="relative hidden lg:block">
              <GlobeLoader className="relative aspect-square w-full" />
              <Link
                href="/universities/stanford"
                className="glass-panel absolute bottom-2 left-2 right-2 rounded-xl border border-primary/25 p-md shadow-lg transition-transform hover:-translate-y-1"
              >
                <div className="mb-sm flex items-center justify-between">
                  <h4 className="font-label-md text-on-surface">Featured School</h4>
                  <span className="font-bold text-primary">Explore Profile</span>
                </div>
                <div className="flex items-center gap-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed">
                    <span className="material-symbols-outlined text-on-primary-fixed-variant">
                      account_balance
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Stanford University</p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Stanford, California
                    </p>
                  </div>
                </div>
              </Link>
              <div className="glass-panel absolute -top-2 -right-2 flex items-center gap-sm rounded-xl border border-primary/25 p-md shadow-glow">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container">
                  <span className="material-symbols-outlined text-on-tertiary-container">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="font-caption text-caption font-bold uppercase tracking-wider text-on-surface-variant">
                    Directory Size
                  </p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface">
                    {universityCount}+
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-container-low/30 py-xl">
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <Reveal className="mb-xl space-y-sm text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Tools for Your Journey
            </h2>
            <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Everything you need to move from &quot;where should I go?&quot; to
              &quot;I&apos;m enrolled.&quot;
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-md md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.href} delayMs={i * 100}>
                <Link
                  href={f.href}
                  className="card-hover-shadow group flex h-full flex-col rounded-[16px] border border-outline-variant/30 bg-surface-container-lowest p-xl"
                >
                  <div
                    className={`mb-md flex h-16 w-16 items-center justify-center rounded-[12px] ${f.iconWrap}`}
                  >
                    <span className="material-symbols-outlined text-[32px] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="mb-sm font-headline-md text-headline-md text-on-surface">
                    {f.title}
                  </h3>
                  <p className="mb-lg flex-grow font-body-md text-body-md text-on-surface-variant">
                    {f.body}
                  </p>
                  <span className="flex items-center gap-xs font-label-md text-primary transition-all group-hover:gap-base">
                    {f.cta}
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Section */}
      <section className="py-xl">
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <div className="grid h-auto grid-cols-1 grid-rows-2 gap-md md:h-[600px] md:grid-cols-4">
            <Reveal className="relative flex flex-col justify-end overflow-hidden rounded-[24px] p-xl md:col-span-2 md:row-span-2">
              <Image
                src="/images/hero-graduation.jpg"
                alt="Graduates celebrating"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/20" />
              <div className="relative z-10 space-y-sm text-white">
                <span className="rounded-full bg-white/20 px-sm py-1 font-label-md text-caption uppercase backdrop-blur-md">
                  How We&apos;re Different
                </span>
                <h2 className="font-headline-lg text-headline-lg">
                  Know Your Real Chances
                </h2>
                <p className="max-w-sm font-body-md text-body-md opacity-90">
                  Every school gets a Safety, Target, Reach, or High Reach estimate with
                  the reasoning shown right alongside it — not a black-box percentage.
                </p>
                <Link
                  href="/quiz"
                  className="mt-md inline-block rounded-lg bg-white px-lg py-sm font-bold text-primary"
                >
                  Take the Quiz
                </Link>
              </div>
            </Reveal>

            <Reveal delayMs={100} className="md:col-span-2">
              <Link
                href="/affordability-finder"
                className="group flex h-full items-center justify-between overflow-hidden rounded-[24px] bg-surface-container-highest p-lg"
              >
                <div className="max-w-[60%]">
                  <h4 className="mb-xs font-headline-md text-headline-md text-on-surface">
                    Affordability Finder
                  </h4>
                  <p className="text-body-md text-on-surface-variant">
                    See which universities are need-blind and meet full demonstrated need for
                    international students, verified against official aid policies — with sources.
                  </p>
                </div>
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-lowest shadow-md transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[48px] text-primary">
                    payments
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delayMs={150}>
              <Link
                href="#how-it-works"
                className="group flex h-full flex-col justify-between rounded-[24px] bg-secondary-container p-lg transition-all hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[40px] text-primary transition-transform group-hover:scale-110">
                  history_edu
                </span>
                <div>
                  <p className="font-bold text-on-surface">Application Tracker</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Stay on top of every deadline.
                  </p>
                </div>
              </Link>
            </Reveal>

            <Reveal delayMs={200}>
              <Link
                href="/contact"
                className="group flex h-full flex-col justify-between rounded-[24px] bg-tertiary-fixed p-lg transition-all hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[40px] text-on-tertiary-fixed-variant transition-transform group-hover:scale-110">
                  forum
                </span>
                <div>
                  <p className="font-bold text-on-surface">Have Questions?</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Reach out to our team.
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section
        id="how-it-works"
        className="border-y border-outline-variant/20 bg-surface-bright py-xl scroll-mt-20"
      >
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <Reveal className="grid grid-cols-1 items-center gap-xl overflow-hidden rounded-[24px] border border-outline-variant/30 bg-surface-container-lowest shadow-lg lg:grid-cols-2">
            <div className="p-lg md:p-xl">
              <h2 className="mb-md font-headline-lg text-headline-lg">
                How It Works
              </h2>
              <div className="space-y-md">
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
                ].map(({ step, title, body }) => (
                  <div key={step} className="flex items-center gap-md">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                      {step}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-label-md text-on-surface">{title}</h4>
                      <p className="font-caption text-caption text-on-surface-variant">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center p-md text-center">
              <Image
                src="/images/hero-journey.jpg"
                alt="Airplane window view above the clouds"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container/95 via-primary-container/50 to-transparent" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-md flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                  <span className="material-symbols-outlined text-[40px] text-primary">
                    rocket_launch
                  </span>
                </div>
                <p className="mb-xs font-headline-md text-headline-md text-white">
                  Ready when you are
                </p>
                <p className="mb-md max-w-xs text-body-md text-white/90">
                  Build your profile to unlock school matches tailored just for you.
                </p>
                <Link
                  href="/quiz"
                  className="rounded-lg bg-white px-lg py-sm font-bold text-primary"
                >
                  Start My Profile
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
