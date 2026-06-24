import Link from "next/link";

export default function UniversityNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-container-max flex-col items-center justify-center px-md py-xl text-center">
      <div className="mb-md flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container">
        <span className="material-symbols-outlined text-[40px] text-primary">
          travel_explore
        </span>
      </div>
      <h1 className="mb-sm font-headline-lg text-headline-lg text-on-surface">
        University Not Found
      </h1>
      <p className="mb-lg max-w-md font-body-md text-body-md text-on-surface-variant">
        We couldn&apos;t find a university matching that link. It may have been moved, or
        the address might be mistyped.
      </p>
      <div className="flex flex-col gap-sm sm:flex-row">
        <Link
          href="/universities"
          className="rounded-lg bg-primary px-lg py-3 font-label-md text-on-primary transition-colors hover:bg-primary-container"
        >
          Browse the Directory
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-secondary-container px-lg py-3 font-label-md text-primary transition-colors hover:bg-outline-variant/20"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}
