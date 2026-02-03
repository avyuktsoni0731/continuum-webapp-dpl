import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Continuum. Free to start. Scale as you grow. Plans from $0 to Enterprise with Jira, GitHub, and Slack in one place.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
