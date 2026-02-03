import type React from "react";
import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { StructuredData } from "@/components/structured-data";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app"),
  title: {
    default: "Continuum | Unified Intelligence for Teams",
    template: "%s | Continuum",
  },
  description:
    "Stop context switching between your tools. Continuum orchestrates the platforms your team already uses through natural language in Slack—with smart delegation, always-on context, and intelligent automation.",
  keywords: [
    "productivity",
    "team collaboration",
    "Slack bot",
    "Jira integration",
    "GitHub integration",
    "developer tools",
    "workflow automation",
    "context switching",
    "engineering productivity",
    "AI agent",
    "smart delegation",
    "task management",
    "dev tools",
    "team intelligence",
  ],
  authors: [{ name: "Continuum" }],
  creator: "Continuum",
  publisher: "Continuum",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/Continuum_Logo.png",
    apple: "/Continuum_Logo.png",
    shortcut: "/Continuum_Logo.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app",
    siteName: "Continuum",
    title: "Continuum | Unified Intelligence for Teams",
    description:
      "Stop context switching between your tools. Continuum orchestrates the platforms your team already uses through natural language in Slack—with smart delegation, always-on context, and intelligent automation.",
    images: [
      {
        url: "/twitter-og.png",
        width: 1200,
        height: 630,
        alt: "Continuum - Unified Intelligence for Teams",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Continuum | Unified Intelligence for Teams",
    description:
      "Stop context switching between your tools. Continuum orchestrates the platforms your team already uses through natural language in Slack.",
    images: ["/twitter-og.png"],
    creator: "@avyukt_soni",
    site: "@avyukt_soni",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://continuumworks.app",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <StructuredData />
        <GoogleAnalytics />
        <AuthSessionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
