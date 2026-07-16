import { describe, it, expect } from "vitest";
import { FREE_PREVIEW_SLUGS, isFreePreviewSlug } from "./freePreview";

describe("isFreePreviewSlug", () => {
  it("is true for every slug in the featured list", () => {
    for (const slug of FREE_PREVIEW_SLUGS) {
      expect(isFreePreviewSlug(slug)).toBe(true);
    }
  });

  it("is false for a slug not in the featured list", () => {
    expect(isFreePreviewSlug("some-random-school")).toBe(false);
  });

  it("is false for the bulk US institution directory route's slug-shaped segment", () => {
    expect(isFreePreviewSlug("us-directory")).toBe(false);
  });
});
