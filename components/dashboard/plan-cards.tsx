"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS, type PricingTier, type TierId } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";

function getCurrentTierId(tier: string | undefined): TierId | null {
  if (!tier) return null;
  const normalized = tier.toLowerCase();
  if (["free", "starter", "pro", "enterprise"].includes(normalized)) {
    return normalized as TierId;
  }
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("starter")) return "starter";
  if (normalized.includes("enterprise")) return "enterprise";
  return "free";
}

function PlanCard({
  tier,
  isCurrent,
}: {
  tier: PricingTier;
  isCurrent: boolean;
}) {
  const priceLabel =
    tier.period === "user/month"
      ? `${tier.priceDisplay}/${tier.period}`
      : tier.priceDisplay;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/50 p-6 transition-colors",
        isCurrent ? "border-accent/50" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif text-lg font-medium">{tier.name}</h3>
        {isCurrent && (
          <Badge variant="secondary" className="text-xs">
            Current
          </Badge>
        )}
      </div>
      <p className="mt-1 text-2xl font-medium text-foreground">
        {tier.priceDisplay}
        {tier.period && (
          <span className="text-sm font-normal text-muted-foreground">
            /{tier.period}
          </span>
        )}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
      <div className="mt-4">
        {isCurrent ? (
          <Link href="/dashboard/billing">
            <Button variant="outline" size="sm" className="rounded-full">
              Manage subscription
            </Button>
          </Link>
        ) : tier.id === "enterprise" ? (
          <Link href="/contact">
            <Button variant="outline" size="sm" className="rounded-full">
              {tier.cta}
            </Button>
          </Link>
        ) : (
          <Link href="/pricing">
            <Button size="sm" className="rounded-full">
              Upgrade to {tier.name}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function PlanCards({ currentTier }: { currentTier: string | undefined }) {
  const currentId = getCurrentTierId(currentTier);
  const tiersToShow = PRICING_TIERS.filter((t) => t.id !== "free");

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-medium">Plans</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiersToShow.map((tier) => (
          <PlanCard
            key={tier.id}
            tier={tier}
            isCurrent={currentId === tier.id}
          />
        ))}
      </div>
    </div>
  );
}
