import type React from "react";
import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { GoogleAnalytics } from "@/components/google-analytics";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Continuum| Unified Intelligence for Teams",
  description:
    "Eliminate context switching with an intelligent productivity agent that unifies Jira, GitHub, and other dev tools in Slack.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <GoogleAnalytics />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
