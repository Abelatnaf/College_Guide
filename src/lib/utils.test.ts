import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatNumber, slugify } from "./utils";

describe("slugify", () => {
  it("lowercases and hyphenates a plain string", () => {
    expect(slugify("Harvard University")).toBe("harvard-university");
  });

  it("collapses punctuation and repeated separators", () => {
    expect(slugify("MIT — Computer Science!!")).toBe("mit-computer-science");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
    expect(slugify("*starred*")).toBe("starred");
  });
});

describe("formatCurrency", () => {
  it("formats USD with a symbol, thousands separators, and no decimals", () => {
    expect(formatCurrency(56000)).toBe("$56,000");
  });

  it("rounds to whole units", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });
});

describe("formatNumber", () => {
  it("adds thousands separators without a currency symbol", () => {
    expect(formatNumber(23000)).toBe("23,000");
  });
});

describe("cn", () => {
  it("merges class names and lets later Tailwind classes win", () => {
    // twMerge should keep only the last conflicting padding class.
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
