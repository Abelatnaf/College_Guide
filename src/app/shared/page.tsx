"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/components/auth/AuthProvider";
import { acceptShare, listSharedWithMe, listSharesAddressedToMe, type Share, type SharedWithMeEntry } from "@/lib/sharing";

const SCOPE_LABEL: Record<string, string> = {
  profile: "Academic profile",
  applications: "Applications",
  shortlist: "Shortlist",
};

export default function SharedPage() {
  const { enabled, user, loading: authLoading, openAuth } = useAuth();
  const [pending, setPending] = useState<Share[]>([]);
  const [accepted, setAccepted] = useState<SharedWithMeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const refresh = async () => {
    const [addressed, sharedWithMe] = await Promise.all([listSharesAddressedToMe(), listSharedWithMe()]);
    setPending(addressed.filter((s) => s.status === "pending"));
    setAccepted(sharedWithMe);
    setLoading(false);
  };

  useEffect(() => {
    if (user) refresh();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAccept = async (id: string) => {
    setAccepting(id);
    await acceptShare(id);
    setAccepting(null);
    refresh();
  };

  return (
    <main className="mx-auto max-w-3xl px-md py-xl md:px-lg">
      <PageHeader
        icon="diversity_1"
        title="Shared with You"
        description="Read-only views that students have shared with you as a parent or counselor."
      />

      {!enabled ? (
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg font-body-md text-body-md text-on-surface-variant">
          Accounts aren&apos;t enabled on this deployment, so sharing isn&apos;t available.
        </p>
      ) : authLoading ? null : !user ? (
        <div className="rounded-xl border border-primary/30 bg-secondary-container/40 p-lg text-center">
          <p className="mb-md font-body-md text-body-md text-on-surface">
            Sign in with the email a student shared with to see what they&apos;ve shared with you.
          </p>
          <button
            onClick={openAuth}
            className="rounded-lg bg-primary px-lg py-2 font-label-md text-on-primary transition-colors hover:bg-primary-container"
          >
            Sign in
          </button>
        </div>
      ) : loading ? null : (
        <div className="space-y-gutter">
          {pending.length > 0 && (
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
              <h3 className="mb-md font-headline-md text-headline-md">Pending invites</h3>
              <ul className="space-y-sm">
                {pending.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-sm rounded-lg bg-surface-container-low p-md"
                  >
                    <span className="font-body-md text-body-md text-on-surface">
                      Invite for {s.scope.map((sc) => SCOPE_LABEL[sc]).join(", ")}
                    </span>
                    <button
                      onClick={() => handleAccept(s.id)}
                      disabled={accepting === s.id}
                      className="rounded-lg bg-primary px-md py-2 font-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-40"
                    >
                      {accepting === s.id ? "Accepting…" : "Accept"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {accepted.length > 0 ? (
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg">
              <h3 className="mb-md font-headline-md text-headline-md">Accepted</h3>
              <ul className="space-y-sm">
                {accepted.map((s) => (
                  <li key={s.ownerId}>
                    <Link
                      href={`/shared/${s.ownerId}`}
                      className="flex items-center justify-between gap-sm rounded-lg bg-surface-container-low p-md transition-colors hover:border-primary"
                    >
                      <div>
                        <p className="font-body-md text-body-md font-semibold text-on-surface">
                          {s.ownerDisplayName ?? "A student"}
                        </p>
                        <p className="font-caption text-caption text-on-surface-variant">
                          {s.scope.map((sc) => SCOPE_LABEL[sc]).join(", ")}
                        </p>
                      </div>
                      <Icon name="arrow_forward" className="text-on-surface-variant" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            pending.length === 0 && (
              <p className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg text-center font-body-md text-body-md text-on-surface-variant">
                Nothing has been shared with you yet.
              </p>
            )
          )}
        </div>
      )}
    </main>
  );
}
