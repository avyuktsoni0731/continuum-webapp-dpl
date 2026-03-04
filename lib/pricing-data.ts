/**
 * Pricing data – synced with api.continuumworks.app/plans
 * Static fallback matches API; use fetchPlans() for live data.
 */

export type TierId = "free" | "starter" | "pro" | "enterprise";

export interface PricingTier {
  id: TierId;
  name: string;
  price: number | null;
  priceYearly: number | null;
  priceDisplay: string;
  priceYearlyDisplay?: string;
  period: string | null;
  cta: string;
  highlighted: boolean;
  description: string;
  headline: string;
}

/** API plan tier shape from GET /plans */
export interface ApiPlanTier {
  id: string;
  name: string;
  price: number | null;
  price_display: string;
  price_yearly?: number;
  period: string | null;
  razorpay_plan_id_monthly?: string | null;
  razorpay_plan_id_yearly?: string | null;
  limits?: Record<string, number>;
  features?: string[];
  contact_sales?: boolean;
}

export interface ApiPlansResponse {
  tiers: ApiPlanTier[];
  annual_discount_percent?: number;
}

/** Fetch plans from API; returns null on failure. */
export async function fetchPlans(): Promise<PricingTier[] | null> {
  const base = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "https://api.continuumworks.app") : (process.env.NEXT_PUBLIC_API_URL || "https://api.continuumworks.app");
  try {
    const res = await fetch(`${base}/plans`);
    if (!res.ok) return null;
    const data = (await res.json()) as ApiPlansResponse;
    if (!Array.isArray(data.tiers)) return null;
    return data.tiers.map(mapApiTierToPricingTier).filter(Boolean) as PricingTier[];
  } catch {
    return null;
  }
}

function mapApiTierToPricingTier(t: ApiPlanTier): PricingTier | null {
  const id = t.id?.toLowerCase() as TierId | undefined;
  if (!id || !["free", "starter", "pro", "enterprise"].includes(id)) return null;
  const price = t.price ?? null;
  const priceYearly = t.price_yearly ?? null;
  return {
    id,
    name: t.name || t.id,
    price,
    priceYearly,
    priceDisplay: t.price_display ?? (price != null ? `₹${price}` : "Contact us"),
    priceYearlyDisplay: priceYearly != null ? `₹${priceYearly}` : undefined,
    period: t.period ?? null,
    cta: t.contact_sales ? "Contact sales" : "Get started",
    highlighted: id === "pro",
    description: getTierDescription(id, t),
    headline: getTierHeadline(id),
  };
}

function getTierDescription(id: TierId, t: ApiPlanTier): string {
  if (id === "free") return "Everything you need to try Continuum. One workspace, core integrations.";
  if (id === "starter") return "Remove limits. Multiple workspaces, more context, email support.";
  if (id === "pro") return "Advanced AI delegation, analytics, unlimited usage, priority support.";
  if (id === "enterprise") return "SSO, SLA, self-host, and custom integrations for large orgs.";
  return "";
}

function getTierHeadline(id: TierId): string {
  if (id === "free") return "Start building habits";
  if (id === "starter") return "For growing teams";
  if (id === "pro") return "For teams that move fast";
  if (id === "enterprise") return "For organizations with strict requirements";
  return "";
}

/** Static tiers matching api.continuumworks.app/plans (fallback when fetch fails) */
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    priceDisplay: "₹0",
    priceYearlyDisplay: "₹0",
    period: null,
    cta: "Get started",
    highlighted: false,
    description:
      "Everything you need to try Continuum. One workspace, core integrations.",
    headline: "Start building habits",
  },
  {
    id: "starter",
    name: "Starter",
    price: 649,
    priceYearly: 541,
    priceDisplay: "₹649",
    priceYearlyDisplay: "₹541",
    period: "user/month",
    cta: "Get started",
    highlighted: false,
    description:
      "Remove limits. Multiple workspaces, more context, email support.",
    headline: "For growing teams",
  },
  {
    id: "pro",
    name: "Pro",
    price: 1149,
    priceYearly: 958,
    priceDisplay: "₹1,149",
    priceYearlyDisplay: "₹958",
    period: "user/month",
    cta: "Get started",
    highlighted: true,
    description:
      "Advanced AI delegation, analytics, unlimited usage, priority support.",
    headline: "For teams that move fast",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    priceYearly: null,
    priceDisplay: "Contact us",
    period: null,
    cta: "Contact sales",
    highlighted: false,
    description: "SSO, SLA, self-host, and custom integrations for large orgs.",
    headline: "For organizations with strict requirements",
  },
];

export type FeatureValue = boolean | string;

export interface FeatureItem {
  name: string;
  free: FeatureValue;
  starter: FeatureValue;
  pro: FeatureValue;
  enterprise: FeatureValue;
}

export interface FeatureCategory {
  category: string;
  items: FeatureItem[];
}

export const FEATURE_MATRIX: FeatureCategory[] = [
  {
    category: "Core Features",
    items: [
      {
        name: "Natural language queries in Slack",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Jira integration (read/write, JQL)",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "GitHub integration (PRs, issues, merge)",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Rich Slack Block Kit formatting",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Conversation memory (thread context)",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Multi-turn follow-up conversations",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Usage Limits",
    items: [
      {
        name: "Slack workspaces",
        free: "1",
        starter: "3",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Requests per day",
        free: "7",
        starter: "500",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Messages per thread (memory)",
        free: "10",
        starter: "30",
        pro: "100",
        enterprise: "100",
      },
      {
        name: "Knowledge facts (team memory)",
        free: "5",
        starter: "50",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Team members",
        free: "1",
        starter: "15",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Jira sites",
        free: "1",
        starter: "1",
        pro: "Unlimited",
        enterprise: "Custom",
      },
      {
        name: "GitHub orgs",
        free: "1",
        starter: "1",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "AI & Delegation",
    items: [
      {
        name: "Basic skill-based delegation",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Task history learning",
        free: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Advanced AI delegation (workload, expertise)",
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Delegation analytics & insights",
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Standup / workload summaries",
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Integrations",
    items: [
      {
        name: "Jira Cloud",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "GitHub.com",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Multiple Jira sites",
        free: false,
        starter: false,
        pro: "Roadmap",
        enterprise: "Custom",
      },
      {
        name: "GitHub Enterprise",
        free: false,
        starter: false,
        pro: "Roadmap",
        enterprise: "Custom",
      },
      {
        name: "Google Calendar",
        free: false,
        starter: false,
        pro: "Roadmap",
        enterprise: "Roadmap",
      },
      {
        name: "Custom integrations",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Security & Admin",
    items: [
      {
        name: "OAuth encryption (credentials at rest)",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Per-workspace data isolation",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Admin roles",
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Audit log",
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "SSO (SAML)",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "SCIM provisioning",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "IP allowlisting",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "Self-hosted deployment",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        name: "Docs & community",
        free: true,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Email support",
        free: false,
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "Priority support (24h)",
        free: false,
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Dedicated success manager",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "SLA",
        free: false,
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];
