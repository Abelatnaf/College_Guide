import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom lets component tests render React into a fake browser DOM.
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      // Mirror the "@/*" -> "./src/*" alias from tsconfig.json so imports
      // resolve the same way tests do as in the app.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
