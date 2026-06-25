"use client";

import { useState } from "react";
import Link from "next/link";
import { useShortlist, useApplications } from "@/components/providers/StorageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

/**
 * Right-cluster nav actions: shortlist (with live count), applications, and an
 * optional, frictionless account control. When Supabase isn't configured, no
 * auth UI renders at all — anonymous users see only the shortlist/apps links.
 */
export function NavActions({ mobile = false }: { mobile?: boolean }) {
  const { shortlist } = useShortlist();
  const { applications } = useApplications();
  const { enabled, user, openAuth, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const count = shortlist.length;
  const appCount = applications.length;

  if (mobile) {
    return (
      <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
        <Link
          href="/shortlist"
          className="flex items-center justify-between rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
        >
          <span className="flex items-center gap-sm">
            <span className="material-symbols-outlined">bookmark</span> Shortlist
          </span>
          {count > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 font-label-md text-caption text-on-primary">
              {count}
            </span>
          )}
        </Link>
        <Link
          href="/applications"
          className="flex items-center justify-between rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
        >
          <span className="flex items-center gap-sm">
            <span className="material-symbols-outlined">assignment</span> Applications
          </span>
          {appCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 font-label-md text-caption text-on-primary">
              {appCount}
            </span>
          )}
        </Link>
        {enabled &&
          (user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-sm rounded-lg px-4 py-3 text-left font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              <span className="material-symbols-outlined">logout</span> Sign out
            </button>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-sm rounded-lg px-4 py-3 text-left font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              <span className="material-symbols-outlined">login</span> Sign in to sync
            </button>
          ))}
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1 md:flex">
      <NavIcon href="/shortlist" icon="bookmark" label="Shortlist" badge={count} />
      <NavIcon href="/applications" icon="assignment" label="Applications" badge={appCount} />
      {enabled &&
        (user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container font-label-md text-label-md text-primary"
            >
              {(user.email?.[0] ?? "U").toUpperCase()}
            </button>
            {menuOpen && (
              <>
                <button
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-xl">
                  <p className="truncate px-3 py-2 font-caption text-caption text-on-surface-variant">
                    {user.email}
                  </p>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-sm rounded-lg px-3 py-2 text-left font-body-md text-body-md text-on-surface hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={openAuth}
            className="ml-1 rounded-full border border-outline-variant px-4 py-1.5 font-label-md text-label-md text-primary transition-colors hover:border-primary"
          >
            Sign in
          </button>
        ))}
    </div>
  );
}

function NavIcon({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: string;
  label: string;
  badge: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary",
      )}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 font-label-md text-[10px] text-on-primary">
          {badge}
        </span>
      )}
    </Link>
  );
}
