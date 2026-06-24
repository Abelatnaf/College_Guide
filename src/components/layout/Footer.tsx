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
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to a real newsletter endpoint.
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="no-print w-full border-t border-outline-variant bg-surface-container-low py-xl">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-md md:grid-cols-3 md:px-lg">
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

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">
            Stay Updated
          </h4>
          <p className="font-caption text-caption text-on-surface-variant">
            Get the latest admission tips and deadlines.
          </p>
          <form onSubmit={onSubscribe} className="flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border border-outline-variant bg-white px-4 py-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Email address"
              type="email"
              required
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="rounded-lg bg-primary px-4 py-2 text-on-primary transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
          <p className="pt-4 font-caption text-caption text-on-surface-variant">
            © 2024 UniPath. Empowering future scholars.
          </p>
        </div>
      </div>
    </footer>
  );
}
