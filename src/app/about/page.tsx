import Link from "next/link";

export const metadata = {
  title: "About — UniPath",
  description: "Why UniPath exists and what it helps students do.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="mb-md font-headline-xl text-headline-xl-mobile md:text-headline-xl">
          About UniPath
        </h1>
        <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          UniPath helps students cut through the noise of university research —
          comparing tuition, acceptance rates, majors, and campus life side by
          side, so the decision of where to apply is based on data instead of
          guesswork.
        </p>
      </section>

      <section className="mx-auto mt-xl grid max-w-3xl gap-lg md:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
          <span className="material-symbols-outlined mb-sm text-3xl text-primary">
            travel_explore
          </span>
          <h3 className="mb-xs font-headline-sm text-headline-sm">What we do</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Curate university and major data into a searchable, comparable
            directory — no application fees, no spam, just information.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
          <span className="material-symbols-outlined mb-sm text-3xl text-primary">
            insights
          </span>
          <h3 className="mb-xs font-headline-sm text-headline-sm">
            How we match
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Our match quiz scores every school against your region, budget,
            GPA, and intended major to surface realistic, relevant picks.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
          <span className="material-symbols-outlined mb-sm text-3xl text-primary">
            groups
          </span>
          <h3 className="mb-xs font-headline-sm text-headline-sm">Who it&apos;s for</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Students applying internationally who need to compare schools
            across countries and currencies in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-xl max-w-3xl rounded-2xl bg-secondary-container p-lg text-center">
        <h2 className="mb-sm font-headline-md text-headline-md text-on-secondary-container">
          Ready to find your match?
        </h2>
        <Link
          href="/quiz"
          className="mt-sm inline-block rounded-lg bg-primary px-lg py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container"
        >
          Take the Match Quiz
        </Link>
      </section>
    </main>
  );
}
