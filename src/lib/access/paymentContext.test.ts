import { describe, it, expect } from "vitest";
import { contextKeyForPathname, setPaymentContext, consumePaymentContextLabel } from "./paymentContext";

describe("contextKeyForPathname", () => {
  it("maps a known feature path to its context key", () => {
    expect(contextKeyForPathname("/path")).toBe("path");
    expect(contextKeyForPathname("/cost-to-apply")).toBe("cost-to-apply");
    expect(contextKeyForPathname("/quiz")).toBe("quiz");
  });

  it("returns null for paths with no mapped context", () => {
    expect(contextKeyForPathname("/")).toBeNull();
    expect(contextKeyForPathname("/about")).toBeNull();
  });

  it("uses only the first path segment", () => {
    expect(contextKeyForPathname("/path/deeper/nested")).toBe("path");
  });
});

describe("setPaymentContext / consumePaymentContextLabel", () => {
  it("round-trips a stored context to its human label", () => {
    setPaymentContext("quiz");
    expect(consumePaymentContextLabel()).toBe("your other 2 quiz matches");
  });

  it("clears itself after being read once", () => {
    setPaymentContext("path");
    consumePaymentContextLabel();
    expect(consumePaymentContextLabel()).toBeNull();
  });

  it("returns null when nothing was ever set", () => {
    expect(consumePaymentContextLabel()).toBeNull();
  });
});
