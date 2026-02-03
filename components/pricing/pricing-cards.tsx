"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_TIERS, type PricingTier } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  yearly?: boolean;
  onYearlyChange?: (yearly: boolean) => void;
  showToggle?: boolean;
  compact?: boolean;
  /** When provided, used instead of default Link navigation */
  onTierSelect?: (tierId: string, isContactSales: boolean) => void | Promise<void>;
}

export function PricingCards({
  yearly = false,
  onYearlyChange,
  showToggle = true,
  compact = false,
  onTierSelect,
}: PricingCardsProps) {
  const tiers = compact ? PRICING_TIERS.filter((t) => t.id !== "enterprise") : PRICING_TIERS;

  return (
    <div className="space-y-10">
      {showToggle && onYearlyChange && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-card border border-border">
            <button
              onClick={() => onYearlyChange(false)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                !yearly ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => onYearlyChange(true)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                yearly ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 border-accent",
                  yearly ? "bg-background text-foreground border-background" : "text-white"
                )}
              >
                Save 20%
              </Badge>
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "grid gap-6",
          compact ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {tiers.map((tier, i) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            yearly={yearly}
            index={i}
            compact={compact}
            onTierSelect={onTierSelect}
          />
        ))}
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  yearly,
  index,
  compact,
  onTierSelect,
}: {
  tier: PricingTier;
  yearly: boolean;
  index: number;
  compact: boolean;
  onTierSelect?: (tierId: string, isContactSales: boolean) => void | Promise<void>;
}) {
  const isEnterprise = tier.id === "enterprise";
  const price =
    isEnterprise || tier.price === null
      ? tier.priceDisplay
      : yearly && tier.priceYearly != null
        ? `$${tier.priceYearly.toFixed(2)}`
        : tier.priceDisplay;

  const isContactCta = tier.cta.toLowerCase().includes("contact");

  const handleClick = () => {
    if (onTierSelect) {
      onTierSelect(tier.id, isContactCta);
    }
  };

  const buttonContent = (
    <Button
      className={cn(
        "w-full rounded-full font-medium",
        tier.highlighted
          ? "bg-accent text-accent-foreground hover:bg-accent/90"
          : "bg-foreground text-background hover:bg-foreground/90"
      )}
      size="lg"
    >
      {tier.cta}
    </Button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative rounded-2xl border p-6 md:p-8 flex flex-col",
        tier.highlighted
          ? "border-accent bg-accent/5 shadow-xl shadow-accent/10"
          : "border-border bg-card/50",
        compact && "p-6"
      )}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-accent text-accent-foreground border-0 text-xs">
            Most popular
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-serif font-medium">{tier.name}</h3>
        <p className="text-sm text-muted-foreground">{tier.description}</p>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-serif font-medium tracking-tight">
            {price}
          </span>
          {tier.period && (
            <span className="text-muted-foreground text-sm">{tier.period}</span>
          )}
        </div>

        {!compact &&
          (onTierSelect ? (
            <button onClick={handleClick} className="block w-full">
              {buttonContent}
            </button>
          ) : (
            <Link
              href={isContactCta ? "/#get-started" : "/install"}
              className="block"
            >
              {buttonContent}
            </Link>
          ))}
      </div>
    </motion.div>
  );
}
