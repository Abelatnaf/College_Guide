import Link from "next/link";
import { universities } from "@/data/universities";
import { majors } from "@/data/majors";

const FILL_1 = { fontVariationSettings: "'FILL' 1" } as const;

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
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-xl pb-24 md:py-32">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-fixed opacity-20 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-tertiary-fixed opacity-10 blur-2xl" />
        <div className="relative z-10 mx-auto max-w-container-max px-md md:px-lg">
          <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-2">
            <div className="space-y-md text-center lg:text-left">
              <div className="inline-flex animate-fade-in items-center gap-xs rounded-full bg-secondary-container px-sm py-1 font-label-md text-[12px] text-on-secondary-container">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{universityCount}+ universities in our directory</span>
              </div>
              <h1 className="max-w-xl font-headline-xl-mobile text-headline-xl-mobile leading-tight text-on-background md:font-headline-xl md:text-headline-xl">
                Find Your <span className="italic text-primary">Perfect</span> University
              </h1>
              <p className="mx-auto max-w-lg font-body-lg text-body-lg text-on-surface-variant lg:mx-0">
                Take a short quiz to get matched with schools that fit your budget,
                grades, and goals, see honest admission-chance estimates for each one,
                and compare your shortlist side by side — all in one place.
              </p>
              <div className="flex flex-col items-center justify-center gap-md pt-md sm:flex-row lg:justify-start">
                <Link
                  href="/quiz"
                  className="flex h-14 w-full items-center justify-center gap-base rounded-lg bg-primary px-lg font-label-md text-body-md text-on-primary transition-all hover:brightness-105 hover:shadow-lg sm:w-auto"
                >
                  Get Started
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="flex h-14 w-full items-center justify-center rounded-lg bg-surface-container-low px-lg font-label-md text-body-md text-primary transition-all hover:bg-surface-container sm:w-auto"
                >
                  See How It Works
                </a>
              </div>
              <div className="flex items-center justify-center gap-md pt-sm lg:justify-start">
                <div className="flex -space-x-2">
                  {[
                    { bg: "bg-primary-fixed text-on-primary-fixed-variant", icon: "school" },
                    { bg: "bg-secondary-container text-primary", icon: "menu_book" },
                    { bg: "bg-tertiary-fixed text-on-tertiary-fixed-variant", icon: "public" },
                  ].map(({ bg, icon }) => (
                    <div
                      key={icon}
                      className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white ${bg}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </div>
                  ))}
                </div>
                <span className="font-caption text-caption text-on-surface-variant">
                  {majorCount} fields of study, matched to your goals
                </span>
              </div>
            </div>

            {/* Visual side */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-square w-full overflow-hidden rounded-[32px] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed via-primary-fixed-dim to-tertiary-fixed opacity-90" />
                <span
                  className="material-symbols-outlined absolute -bottom-10 -right-10 select-none text-on-primary-fixed-variant/20"
                  style={{ fontSize: 260 }}
                >
                  school
                </span>
                <Link
                  href="/universities/stanford"
                  className="glass-panel absolute bottom-md left-md right-md rounded-xl border border-white/30 p-md shadow-lg transition-transform hover:-translate-y-1"
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
              </div>
              <div className="absolute -top-6 -right-6 flex items-center gap-sm rounded-xl border border-outline-variant bg-white p-md shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container">
                  <span className="material-symbols-outlined text-white">
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
          <div className="mb-xl space-y-sm text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Tools for Your Journey
            </h2>
            <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Everything you need to move from &quot;where should I go?&quot; to
              &quot;I&apos;m enrolled.&quot;
            </p>
          </div>
          <div className="grid grid-cols-1 gap-md md:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="card-hover-shadow group flex flex-col rounded-[16px] border border-outline-variant/30 bg-surface-container-lowest p-xl"
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
            ))}
          </div>
        </div>
      </section>

      {/* Bento Section */}
      <section className="py-xl">
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <div className="grid h-auto grid-cols-1 grid-rows-2 gap-md md:h-[600px] md:grid-cols-4">
            <div className="relative flex flex-col justify-end overflow-hidden rounded-[24px] bg-primary p-xl md:col-span-2 md:row-span-2">
              <div className="absolute inset-0 opacity-40">
                <span
                  className="material-symbols-outlined absolute -bottom-12 -right-12 select-none text-white"
                  style={{ fontSize: 320 }}
                >
                  diversity_3
                </span>
              </div>
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
            </div>

            <Link
              href="/affordability-finder"
              className="group flex items-center justify-between overflow-hidden rounded-[24px] bg-surface-container-highest p-lg md:col-span-2"
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
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[48px] text-primary">
                  payments
                </span>
              </div>
            </Link>

            <Link
              href="#how-it-works"
              className="group flex flex-col justify-between rounded-[24px] bg-secondary-container p-lg transition-all hover:-translate-y-0.5"
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

            <Link
              href="/contact"
              className="group flex flex-col justify-between rounded-[24px] bg-tertiary-fixed p-lg transition-all hover:-translate-y-0.5"
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
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section
        id="how-it-works"
        className="border-y border-outline-variant/20 bg-surface-bright py-xl scroll-mt-20"
      >
        <div className="mx-auto max-w-container-max px-md md:px-lg">
          <div className="grid grid-cols-1 items-center gap-xl rounded-[24px] border border-outline-variant/30 bg-white p-lg shadow-lg md:p-xl lg:grid-cols-2">
            <div>
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
            <div className="flex flex-col items-center rounded-xl bg-primary-container/10 p-md text-center">
              <div className="mb-md flex h-20 w-20 items-center justify-center rounded-full bg-primary-container shadow-xl">
                <span className="material-symbols-outlined text-[40px] text-white">
                  rocket_launch
                </span>
              </div>
              <p className="mb-xs font-headline-md text-headline-md text-primary">
                Ready when you are
              </p>
              <p className="mb-md text-body-md text-on-surface-variant">
                Build your profile to unlock school matches tailored just for you.
              </p>
              <Link
                href="/quiz"
                className="rounded-lg bg-primary px-lg py-sm font-bold text-white"
              >
                Start My Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
