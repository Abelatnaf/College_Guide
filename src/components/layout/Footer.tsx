"use client";

import { useState } from "react";
import Link from "next/link";

const EXPLORE_LINKS = [
  { label: "Universities", href: "/universities" },
  { label: "Majors", href: "/majors" },
  { label: "Compare", href: "/compare" },
  { label: "Match Quiz", href: "/quiz" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "UniPath", url });
        return;
      } catch {
        // user cancelled the native share sheet, fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard blocked (no focus / permission / insecure context) — fail quietly
      }
    }
  };

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
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label="Homepage"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-lg">language</span>
            </Link>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this page"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </button>
            <Link
              href="/contact"
              aria-label="Email us"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-primary transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-lg">alternate_email</span>
            </Link>
            {copied && (
              <span className="font-caption text-caption text-primary">Link copied!</span>
            )}
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
