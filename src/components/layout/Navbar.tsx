"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavActions } from "@/components/layout/NavActions";

const NAV_LINKS = [
  { label: "Majors", href: "/majors" },
  { label: "Universities", href: "/universities" },
  { label: "Compare", href: "/compare" },
  { label: "Calculator", href: "/calculator" },
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
        "no-print sticky top-0 z-50 w-full overflow-visible border-b border-outline-variant/70 transition-all duration-300 ease-in-out",
        scrolled
          ? "bg-surface-container-lowest/80 shadow-md backdrop-blur-xl"
          : "bg-gradient-to-b from-surface to-surface/95 shadow-sm backdrop-blur-sm",
      )}
    >
      {/* Glossy top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-md md:px-lg">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-base">
          <span
            className="material-symbols-outlined text-[32px] text-primary transition-transform duration-300 ease-out group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:drop-shadow-[0_2px_8px_rgba(0,105,72,0.45)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
          <span className="font-headline-md text-headline-md font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary group-hover:to-primary">
            UniPath
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative rounded-full px-4 py-2 font-body-md text-body-md transition-all duration-200",
                isActive(link.href)
                  ? "font-bold text-primary"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              <span className="relative z-10">{link.label}</span>
              <span
                className={cn(
                  "absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 to-primary/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                  isActive(link.href) && "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ease-out group-hover:w-2/3",
                  isActive(link.href) && "w-2/3",
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-md">
          <form
            onSubmit={submitSearch}
            className="hidden items-center rounded-full border border-outline-variant bg-surface-container-low/80 px-4 py-2 shadow-inner backdrop-blur-sm transition-all duration-200 focus-within:border-primary/60 focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_3px_rgba(0,105,72,0.12)] hover:border-primary/40 lg:flex"
          >
            <button
              type="submit"
              aria-label="Search schools"
              className="material-symbols-outlined mr-2 text-on-surface-variant transition-colors duration-200 hover:text-primary"
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

          <NavActions />

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
        <div className="animate-fade-in border-t border-outline-variant bg-surface-container-lowest/95 px-md py-md backdrop-blur-xl md:hidden">
          <form
            onSubmit={submitSearch}
            className="mb-md flex items-center rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 shadow-inner transition-all duration-200 focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(0,105,72,0.12)]"
          >
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
                  "rounded-lg px-4 py-3 font-body-md text-body-md transition-all duration-200 active:scale-[0.98]",
                  isActive(link.href)
                    ? "bg-gradient-to-r from-secondary-container to-secondary-container/70 font-bold text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <NavActions mobile />
        </div>
      )}
    </header>
  );
}
