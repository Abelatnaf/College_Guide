"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavActions } from "@/components/layout/NavActions";

const NAV_LINKS = [
  { label: "Command Center", href: "/path" },
  { label: "Majors", href: "/majors" },
  { label: "Universities", href: "/universities" },
  { label: "Compare", href: "/compare" },
  { label: "Calculator", href: "/calculator" },
  { label: "Ask AI", href: "/chat" },
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
        "no-print hairline sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out",
        scrolled
          ? "bg-surface/85 shadow-[0_8px_32px_rgb(var(--shadow-ambient)/0.18)] backdrop-blur-xl"
          : "bg-surface/60 backdrop-blur-md",
      )}
    >
      {/* Emerald sheen along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-md md:px-lg">
        {/* Wordmark — sans "Uni" against serif-italic "Path" */}
        <Link href="/" className="group flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary">
            Uni
          </span>
          <span className="font-display text-[24px] italic text-primary">Path</span>
          <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
        </Link>

        {/* Desktop nav — tracked-out editorial labels */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative whitespace-nowrap px-3.5 py-2 font-micro text-micro uppercase transition-colors duration-200",
                isActive(link.href)
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary transition-all duration-300",
                  isActive(link.href) ? "opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-60",
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-md">
          <form
            onSubmit={submitSearch}
            className="hairline hidden items-center rounded-full border bg-surface-container-low/50 px-4 py-1.5 backdrop-blur-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-glow-sm hover:border-primary/30 lg:flex"
          >
            <button
              type="submit"
              aria-label="Search schools"
              className="material-symbols-outlined mr-2 text-[20px] text-on-surface-variant transition-colors duration-200 hover:text-primary"
            >
              search
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 border-none bg-transparent text-body-md focus:ring-0"
              placeholder="Search schools…"
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
        <div className="hairline animate-fade-in border-t bg-surface/95 px-md py-md backdrop-blur-xl md:hidden">
          <form
            onSubmit={submitSearch}
            className="hairline mb-md flex items-center rounded-full border bg-surface-container-low px-4 py-2 transition-all duration-200 focus-within:border-primary/50"
          >
            <span className="material-symbols-outlined mr-2 text-on-surface-variant">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none bg-transparent text-body-md focus:ring-0"
              placeholder="Search schools…"
              type="text"
            />
          </form>
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "hairline border-b px-1 py-3.5 font-micro text-micro uppercase transition-colors duration-200 active:scale-[0.98]",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
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
