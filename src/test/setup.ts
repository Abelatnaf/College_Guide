// Runs before every test file. Adds jest-dom matchers like
// `toBeInTheDocument()` and auto-cleans the rendered DOM between tests.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
