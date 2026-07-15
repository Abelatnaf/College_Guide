"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

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
    <footer className="no-print hairline relative w-full overflow-hidden border-t bg-surface-container-lowest/60">
      <div className="mx-auto max-w-container-max px-md pb-md pt-xl md:px-lg">
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          {/* Brand */}
          <div className="space-y-md">
            <Link href="/" className="flex items-baseline gap-0.5">
              <span className="text-[20px] font-bold tracking-tight text-on-surface">Uni</span>
              <span className="font-display text-[22px] italic text-primary">Path</span>
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            </Link>
            <p className="max-w-xs font-body-md text-body-md text-on-surface-variant">
              Helping students find their perfect academic home through data-driven
              insights and mentorship.
            </p>
            <div className="flex items-center gap-sm">
              <Link
                href="/"
                aria-label="Homepage"
                className="hairline flex h-9 w-9 items-center justify-center rounded-full border text-on-surface-variant transition-all hover:border-primary/50 hover:text-primary hover:shadow-glow-sm"
              >
                <Icon name="language" className="text-lg" />
              </Link>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share this page"
                className="hairline flex h-9 w-9 items-center justify-center rounded-full border text-on-surface-variant transition-all hover:border-primary/50 hover:text-primary hover:shadow-glow-sm"
              >
                <Icon name="share" className="text-lg" />
              </button>
              <Link
                href="/contact"
                aria-label="Email us"
                className="hairline flex h-9 w-9 items-center justify-center rounded-full border text-on-surface-variant transition-all hover:border-primary/50 hover:text-primary hover:shadow-glow-sm"
              >
                <Icon name="alternate_email" className="text-lg" />
              </Link>
              {copied && (
                <span className="font-caption text-caption text-primary">Link copied!</span>
              )}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-md">
              <h4 className="font-micro text-micro uppercase text-primary">Explore</h4>
              <ul className="space-y-2.5">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-md">
              <h4 className="font-micro text-micro uppercase text-primary">Company</h4>
              <ul className="space-y-2.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="hairline mt-xl flex items-center justify-between border-t pt-md">
          <p className="font-caption text-caption text-on-surface-variant">
            © 2024 UniPath. Empowering future scholars.
          </p>
          <p className="hidden font-micro text-micro uppercase text-on-surface-variant/60 sm:block">
            Made for students, everywhere
          </p>
        </div>
      </div>

      {/* Oversized watermark wordmark bleeding off the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden"
      >
        <p className="-mb-[0.34em] text-center font-display text-[clamp(90px,16vw,240px)] font-medium leading-none tracking-tight text-primary/[0.07]">
          UniPath
        </p>
      </div>
    </footer>
  );
}
