import type { Metadata } from "next";
import { Suspense } from "react";
import { DirectoryClient } from "./DirectoryClient";

export const metadata: Metadata = {
  title: "University Directory — UniPath",
  description:
    "Browse and filter universities by country, tuition, acceptance rate, scholarships, and global ranking.",
};

function DirectoryFallback() {
  return (
    <div className="mx-auto max-w-container-max px-md py-xl md:px-lg">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-container" />
      <div className="mt-lg grid grid-cols-1 gap-md lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl border border-outline-variant/20 bg-surface-container-lowest"
          />
        ))}
      </div>
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <Suspense fallback={<DirectoryFallback />}>
      <DirectoryClient />
    </Suspense>
  );
}
