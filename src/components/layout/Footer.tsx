import Link from "next/link";

const EXPLORE_LINKS = [
  { label: "Universities", href: "/universities" },
  { label: "Majors", href: "/majors" },
  { label: "Compare", href: "/compare" },
  { label: "Match Quiz", href: "/quiz" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export function Footer() {
  return (
    <footer className="no-print w-full border-t border-outline-variant bg-surface-container-low py-xl">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-md md:grid-cols-2 md:px-lg">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-base">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              UniPath
            </span>
          </Link>
          <p className="max-w-xs font-body-md text-body-md text-on-surface-variant">
            Helping students find their perfect academic home through data-driven
            insights and mentorship.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Website"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-lg">language</span>
            </a>
            <a
              href="#"
              aria-label="Share"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
            <a
              href="#"
              aria-label="Email"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-lg">alternate_email</span>
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-4">
            <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">
              Explore
            </h4>
            <ul className="space-y-2">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-caption text-caption text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">
              Company
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-caption text-caption text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-xl max-w-container-max border-t border-outline-variant px-md pt-md md:px-lg">
        <p className="font-caption text-caption text-on-surface-variant">
          © 2024 UniPath. Empowering future scholars.
        </p>
      </div>
    </footer>
  );
}
