import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial display serif — headlines only; Inter stays the workhorse for
// body/UI text. The opsz axis keeps large sizes elegant and small sizes sturdy.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "UniPath — Find Your University Path",
  description:
    "Explore universities and majors, compare schools side by side, and find your best-fit university with UniPath's match quiz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${fraunces.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-on-surface antialiased">
        <Providers>
          <AmbientBackground />
          <Suspense fallback={<div className="hairline h-16 border-b bg-surface" />}>
            <Navbar />
          </Suspense>
          <div className="flex-grow">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
