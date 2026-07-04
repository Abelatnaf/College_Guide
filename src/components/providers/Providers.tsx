"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { StorageProvider } from "@/components/providers/StorageProvider";

/** Client-side provider stack mounted once at the root layout. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <StorageProvider>
          {children}
          <AuthDialog />
        </StorageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
