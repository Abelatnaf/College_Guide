import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { universities, getUniversityBySlug } from "@/data/universities";
import {
  getMajorDetails,
  getPercentileContext,
  getSimilarUniversities,
} from "@/lib/universityComparisons";
import { UniversityDetail } from "./UniversityDetail";

export function generateStaticParams() {
  return universities.map((u) => ({ slug: u.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const u = getUniversityBySlug(params.slug);
  if (!u) return { title: "University Not Found — UniPath" };
  return {
    title: `${u.name} — UniPath`,
    description: u.description,
  };
}

export default function UniversityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const university = getUniversityBySlug(params.slug);
  if (!university) notFound();
  // Computed at build time on the server so the client profile bundle never
  // imports the full universities/majors data arrays.
  return (
    <UniversityDetail
      university={university}
      similar={getSimilarUniversities(university)}
      percentile={getPercentileContext(university)}
      majorDetails={getMajorDetails(university)}
    />
  );
}
