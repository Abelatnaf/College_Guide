"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Majors", href: "/majors" },
  { label: "Universities", href: "/universities" },
  { label: "Compare", href: "/compare" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inited = useRef(false);

  // Seed the input from the URL when landing on the directory.
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/universities?search=${encodeURIComponent(q)}` : "/universities");
  };

  return (
    <header
      className={cn(
        "no-print sticky top-0 z-50 w-full border-b border-outline-variant transition-all duration-200 ease-in-out",
        scrolled
          ? "bg-surface-container-lowest/90 shadow-md backdrop-blur-md"
          : "bg-surface shadow-sm",
      )}
    >
      <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-md md:px-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-base">
          <span
            className="material-symbols-outlined text-[32px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary">
            UniPath
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-lg md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-body-md text-body-md transition-colors duration-200",
                isActive(link.href)
                  ? "border-b-2 border-primary font-bold text-primary"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-md">
          <form
            onSubmit={submitSearch}
            className="hidden items-center rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 lg:flex"
          >
            <button
              type="submit"
              aria-label="Search schools"
              className="material-symbols-outlined mr-2 text-on-surface-variant"
            >
              search
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 border-none bg-transparent text-body-md focus:ring-0"
              placeholder="Search schools..."
              type="text"
            />
          </form>

          <button className="rounded-lg bg-primary px-6 py-2.5 font-label-md text-label-md text-on-primary transition-all hover:bg-primary-container active:scale-95">
            Sign In
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex items-center p-2 text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-outline-variant bg-surface px-md py-md md:hidden">
          <form onSubmit={submitSearch} className="mb-md flex items-center rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2">
            <span className="material-symbols-outlined mr-2 text-on-surface-variant">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none bg-transparent text-body-md focus:ring-0"
              placeholder="Search schools..."
              type="text"
            />
          </form>
          <nav className="flex flex-col gap-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-3 font-body-md text-body-md transition-colors",
                  isActive(link.href)
                    ? "bg-secondary-container font-bold text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
