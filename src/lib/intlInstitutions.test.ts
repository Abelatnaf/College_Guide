import { describe, it, expect } from "vitest";
import { intlInstitutions, intlCountries, searchIntlInstitutions, curatedSlugForIntl } from "./intlInstitutions";

describe("intlInstitutions dataset", () => {
  it("has a large, real dataset with no US entries (covered separately by the US directory)", () => {
    expect(intlInstitutions.length).toBeGreaterThan(1000);
    expect(intlInstitutions.every((i) => i.country !== "United States")).toBe(true);
  });

  it("every entry has a unique id and a non-empty name/country", () => {
    const ids = new Set(intlInstitutions.map((i) => i.id));
    expect(ids.size).toBe(intlInstitutions.length);
    expect(intlInstitutions.every((i) => i.name.length > 0 && i.country.length > 0)).toBe(true);
  });
});

describe("intlCountries", () => {
  it("returns a sorted, deduplicated list covering a wide range of countries", () => {
    const countries = intlCountries();
    expect(countries.length).toBeGreaterThan(100);
    expect(countries).toEqual([...countries].sort());
    expect(new Set(countries).size).toBe(countries.length);
  });
});

describe("searchIntlInstitutions", () => {
  it("paginates results and reports correct totals", () => {
    const page1 = searchIntlInstitutions({ page: 1, perPage: 10 });
    expect(page1.items).toHaveLength(10);
    expect(page1.total).toBe(intlInstitutions.length);
    expect(page1.totalPages).toBe(Math.ceil(intlInstitutions.length / 10));
  });

  it("filters by country", () => {
    const [someCountry] = intlCountries();
    const result = searchIntlInstitutions({ country: someCountry, perPage: 10000 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((i) => i.country === someCountry)).toBe(true);
  });

  it("filters by a case-insensitive name search", () => {
    const target = intlInstitutions[0];
    const needle = target.name.slice(0, 6);
    const result = searchIntlInstitutions({ q: needle.toUpperCase(), perPage: 10000 });
    expect(result.items.some((i) => i.id === target.id)).toBe(true);
  });

  it("clamps an out-of-range page to the last valid page", () => {
    const result = searchIntlInstitutions({ page: 999999, perPage: 10 });
    expect(result.page).toBe(result.totalPages);
  });
});

describe("curatedSlugForIntl", () => {
  it("returns undefined for an id with no curated match", () => {
    expect(curatedSlugForIntl("not-a-real-id")).toBeUndefined();
  });

  it("resolves the University of Oxford to its curated rich profile", () => {
    const oxford = intlInstitutions.find((i) => i.name === "University of Oxford" && i.country === "United Kingdom");
    expect(oxford).toBeDefined();
    expect(curatedSlugForIntl(oxford!.id)).toBe("oxford");
  });
});
