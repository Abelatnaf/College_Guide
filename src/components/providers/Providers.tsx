"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { AccessProvider } from "@/components/auth/AccessProvider";
import { AccessGate } from "@/components/auth/AccessGate";
import { StorageProvider } from "@/components/providers/StorageProvider";

/**
 * Client-side provider stack mounted once at the root layout.
 *
 * - LazyMotion (domAnimation, strict) loads only the motion features we use
 *   (~15-25KB) and enforces the lightweight `m.*` components everywhere.
 * - MotionConfig reducedMotion="user" makes every animation respect
 *   prefers-reduced-motion (transforms drop, gentle opacity remains).
 * - ThemeProvider is pinned to dark: the app is dark-only now (the light
 *   palette survives solely for print/PDF via the @media print override).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <AccessProvider>
              <StorageProvider>
                <AccessGate>{children}</AccessGate>
                <AuthDialog />
              </StorageProvider>
            </AccessProvider>
          </AuthProvider>
        </ThemeProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
