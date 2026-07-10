"use client";

import { useEffect, useState } from "react";
import { createShare, listMyOwnedShares, revokeShare, type Share, type ShareScope } from "@/lib/sharing";

const SCOPE_OPTIONS: { key: ShareScope; label: string }[] = [
  { key: "profile", label: "Academic profile" },
  { key: "applications", label: "Applications" },
  { key: "shortlist", label: "Shortlist" },
];

export function ShareProgressSection() {
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<ShareScope[]>(["profile", "applications", "shortlist"]);
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const owned = await listMyOwnedShares();
    setLoading(false);
    setShares(owned);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleScope = (key: ShareScope) =>
    setScope((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));

  const handleCreate = async () => {
    if (!email.trim() || scope.length === 0 || creating) return;
    setCreating(true);
    const ok = await createShare(email, scope);
    setCreating(false);
    if (ok) {
      setEmail("");
      refresh();
    }
  };

  const handleRevoke = async (id: string) => {
    await revokeShare(id);
    refresh();
  };

  return (
    <div className="mt-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <h3 className="mb-sm font-headline-md text-headline-md">Share your progress</h3>
      <p className="mb-md font-caption text-caption text-on-surface-variant">
        Give a parent or counselor a read-only view of your profile, applications, or shortlist.
        There&apos;s no automatic email — after adding them, send them the{" "}
        <a href="/shared" className="text-primary hover:underline">
          /shared
        </a>{" "}
        link yourself so they can sign in and accept.
      </p>

      <div className="flex flex-col gap-sm sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@example.com"
          className="flex-1 rounded-lg border-2 border-outline-variant bg-surface p-sm font-body-md text-body-md focus:border-primary focus:ring-0"
        />
        <button
          onClick={handleCreate}
          disabled={!email.trim() || scope.length === 0 || creating}
          className="shrink-0 rounded-lg bg-primary px-lg py-sm font-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-40"
        >
          {creating ? "Adding…" : "Add"}
        </button>
      </div>
      <div className="mt-sm flex flex-wrap gap-md">
        {SCOPE_OPTIONS.map((o) => (
          <label key={o.key} className="flex items-center gap-1 font-caption text-caption text-on-surface-variant">
            <input
              type="checkbox"
              checked={scope.includes(o.key)}
              onChange={() => toggleScope(o.key)}
              className="accent-primary"
            />
            {o.label}
          </label>
        ))}
      </div>

      {!loading && shares.length > 0 && (
        <ul className="mt-md divide-y divide-outline-variant/40">
          {shares.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-sm py-2">
              <div>
                <p className="font-body-md text-body-md text-on-surface">{s.granteeEmail}</p>
                <p className="font-caption text-caption text-on-surface-variant">
                  {s.status === "accepted" ? "Accepted" : "Pending"} · {s.scope.join(", ")}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(s.id)}
                className="font-label-md text-label-md text-on-surface-variant hover:text-error"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
