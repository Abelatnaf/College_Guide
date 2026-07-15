"use client";

import { Icon } from "@/components/ui/Icon";

export interface UniversityFilters {
  country: string; // "All" or a country name
  region: string; // "All" or a Region value
  maxTuition: number; // 0 – 100000
  acceptance: string[]; // subset of ["elite", "competitive", "accessible"]
  scholarshipOnly: boolean;
  ranking: string; // "all" | "top50" | "top100" | "top500"
  search: string;
  sort: string; // "ranking" | "tuition" | "alpha" | "acceptance"
}

export const DEFAULT_FILTERS: UniversityFilters = {
  country: "All",
  region: "All",
  maxTuition: 100000,
  acceptance: [],
  scholarshipOnly: false,
  ranking: "all",
  search: "",
  sort: "ranking",
};

const REGION_OPTIONS = [
  { value: "All", label: "All Regions" },
  { value: "USA", label: "United States" },
  { value: "Europe", label: "Europe" },
  { value: "Canada", label: "Canada" },
  { value: "China", label: "China" },
  { value: "UAE", label: "UAE" },
  { value: "Australia", label: "Australia" },
  { value: "Japan", label: "Japan" },
  { value: "South Korea", label: "South Korea" },
  { value: "India", label: "India" },
];

const ACCEPTANCE_OPTIONS = [
  { value: "elite", label: "Elite (< 10%)" },
  { value: "competitive", label: "Competitive (10–30%)" },
  { value: "accessible", label: "Accessible (> 30%)" },
];

const RANKING_OPTIONS = [
  { value: "all", label: "Any Ranking" },
  { value: "top50", label: "Top 50" },
  { value: "top100", label: "Top 100" },
  { value: "top500", label: "Top 500" },
];

interface FilterSidebarProps {
  filters: UniversityFilters;
  countries: string[];
  onChange: (patch: Partial<UniversityFilters>) => void;
  onClear: () => void;
}

export function FilterSidebar({ filters, countries, onChange, onClear }: FilterSidebarProps) {
  const toggleAcceptance = (value: string) => {
    const next = filters.acceptance.includes(value)
      ? filters.acceptance.filter((v) => v !== value)
      : [...filters.acceptance, value];
    onChange({ acceptance: next });
  };

  return (
    <div className="hairline sticky top-28 rounded-2xl border bg-surface-container-lowest p-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-headline-md text-lg font-bold text-primary">Filters</h2>
        <button
          onClick={onClear}
          className="font-label-md text-caption text-primary underline"
        >
          Clear all
        </button>
      </div>

      {/* Country */}
      <div className="mb-8">
        <label className="mb-3 block font-micro text-micro uppercase text-on-surface-variant">
          Country
        </label>
        <div className="relative">
          <select
            value={filters.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full appearance-none rounded-lg border-none bg-surface-container-low px-4 py-3 text-body-md focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
        </div>
      </div>

      {/* Region */}
      <div className="mb-8">
        <label className="mb-3 block font-micro text-micro uppercase text-on-surface-variant">
          Region
        </label>
        <div className="relative">
          <select
            value={filters.region}
            onChange={(e) => onChange({ region: e.target.value })}
            className="w-full appearance-none rounded-lg border-none bg-surface-container-low px-4 py-3 text-body-md focus:ring-2 focus:ring-primary/20"
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
        </div>
      </div>

      {/* Tuition Range */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <label className="font-label-md text-label-md text-on-surface-variant">
            Tuition Range
          </label>
          <span className="text-caption font-semibold text-primary">
            $0 – ${Math.round(filters.maxTuition / 1000)}k
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100000}
          step={5000}
          value={filters.maxTuition}
          onChange={(e) => onChange({ maxTuition: Number(e.target.value) })}
          className="slider-emerald w-full"
        />
      </div>

      {/* Acceptance Rate */}
      <div className="mb-8">
        <label className="mb-3 block font-micro text-micro uppercase text-on-surface-variant">
          Acceptance Rate
        </label>
        <div className="space-y-3">
          {ACCEPTANCE_OPTIONS.map((opt) => (
            <label key={opt.value} className="group flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={filters.acceptance.includes(opt.value)}
                onChange={() => toggleAcceptance(opt.value)}
                className="h-5 w-5 cursor-pointer rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="ml-3 text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Scholarship toggle */}
      <div className="mb-8 flex items-center justify-between">
        <label className="font-label-md text-label-md text-on-surface-variant">
          Scholarship Available
        </label>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={filters.scholarshipOnly}
            onChange={(e) => onChange({ scholarshipOnly: e.target.checked })}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-secondary-container after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
        </label>
      </div>

      {/* Global Ranking */}
      <div className="mb-4">
        <label className="mb-3 block font-micro text-micro uppercase text-on-surface-variant">
          Global Ranking
        </label>
        <div className="space-y-3">
          {RANKING_OPTIONS.map((opt) => (
            <label key={opt.value} className="group flex cursor-pointer items-center">
              <input
                type="radio"
                name="ranking"
                checked={filters.ranking === opt.value}
                onChange={() => onChange({ ranking: opt.value })}
                className="h-5 w-5 cursor-pointer border-outline-variant text-primary focus:ring-primary"
              />
              <span className="ml-3 text-body-md text-on-surface-variant transition-colors group-hover:text-primary">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
