"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { Check } from "lucide-react";

/**
 * Compact pricing tiers section for the landing page
 */
export function PricingTiers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [yearly, setYearly] = useState(false);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    apiFetch<{ tier: string }>("/subscription", {}, session.accessToken)
      .then((data) => setActiveTier(data.tier))
      .catch(() => setActiveTier(null));
  }, [session?.accessToken, status]);

  const tiers = PRICING_TIERS.filter((t) => t.id !== "enterprise");

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 px-4 border-t border-border/50 bg-background/50"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 border-border rounded-full font-medium text-xs uppercase tracking-wider"
          >
            Pricing
          </Badge>
          <h2 className="text-5xl md:text-7xl font-serif">
            Simple, transparent pricing
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Free to start. Scale as you grow. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-card border border-border">
              <button
                onClick={() => setYearly(false)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  !yearly ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {tiers.map((tier, i) => {
            const isEnterprise = tier.id === "enterprise";
            const price =
              isEnterprise || tier.price === null
                ? tier.priceDisplay
                : yearly && tier.priceYearly != null
                  ? `$${tier.priceYearly.toFixed(2)}`
                  : tier.priceDisplay;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col",
                  tier.highlighted
                    ? "border-accent bg-accent/5 shadow-xl shadow-accent/10"
                    : "border-border bg-card/50"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground border-0 text-xs">
                      Most popular
                    </Badge>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-medium">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tier.description}
                  </p>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-serif font-medium tracking-tight">
                      {price}
                    </span>
                    {tier.period && (
                      <span className="text-muted-foreground text-sm">
                        {tier.period}
                      </span>
                    )}
                  </div>

                  {activeTier === tier.id ? (
                    <div className="block pt-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-full font-medium border-green-500/50 bg-green-500/10 text-green-500 cursor-default"
                        size="sm"
                        disabled
                      >
                        <Check className="w-3 h-3 mr-1.5" />
                        Current plan
                      </Button>
                    </div>
                  ) : (
                    <Link href="/pricing" className="block pt-2">
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full rounded-full font-medium",
                          tier.highlighted &&
                          "border-accent bg-accent/10 text-accent hover:bg-accent/20"
                        )}
                        size="sm"
                      >
                        View details
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm mb-4">
            Need SSO, SLA, or self-hosted deployment?
          </p>
          <Link href="/pricing#enterprise">
            <Button variant="outline" className="rounded-full">
              View Enterprise options
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
