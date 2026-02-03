"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { FeatureComparisonTable } from "@/components/pricing/feature-comparison-table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FAQ } from "@/components/pricing/faq";
import { Loader2, CheckCircle } from "lucide-react";
import { apiFetch, dispatchUnauthorized } from "@/lib/api";

const FAQ_ITEMS = [
  {
    q: "How is billing calculated?",
    a: "We charge per active user per month. Users are counted when they interact with Continuum in Slack. Billing is prorated when you add or remove team members.",
  },
  {
    q: "Is there a free trial for paid tiers?",
    a: "Yes. Starter and Pro plans come with a 14-day free trial. No credit card required to start. You can upgrade or downgrade at any time.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "On Free and Starter, you'll receive a notification when approaching limits. We'll suggest upgrading to continue without interruption. Pro and Enterprise have unlimited usage.",
  },
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes. You can change your billing cycle at any time from your workspace settings. Switching to yearly mid-cycle will prorate the remainder.",
  },
  {
    q: "What's included in Enterprise?",
    a: "Enterprise includes everything in Pro, plus SSO (SAML), SCIM provisioning, IP allowlisting, self-hosted deployment, dedicated success manager, SLA, and custom integrations. Contact sales for pricing.",
  },
];

function PricingContent() {
  const [yearly, setYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  // Fetch subscription when logged in
  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    apiFetch<{ tier: string }>("/subscription", {}, session.accessToken)
      .then((data) => setActiveTier(data.tier))
      .catch(() => setActiveTier(null));
  }, [session?.accessToken, status]);

  const handleTierSelect = async (tierId: string, isContactSales: boolean) => {
    if (isContactSales) {
      window.location.href = "/#get-started";
      return;
    }
    if (tierId === "free") {
      if (status === "authenticated") {
        router.push("/dashboard");
      } else {
        router.push("/register?callbackUrl=/dashboard");
      }
      return;
    }
    if (tierId === "starter" || tierId === "pro") {
      if (status !== "authenticated" || !session?.accessToken) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/pricing")}`);
        return;
      }
      setCheckoutLoading(tierId);
      try {
        const res = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: tierId,
            billing_interval: yearly ? "yearly" : "monthly",
          }),
        });
        const data = await res.json();
        if (res.status === 401) {
          dispatchUnauthorized();
          return;
        }
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error(data.error || "Checkout failed");
        }
      } catch (err) {
        console.error(err);
        setCheckoutLoading(null);
      }
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-serif leading-tight"
          >
            One AI agent.{" "}
            <span className="text-muted-foreground/60 italic">Jira, GitHub,</span>{" "}
            and Slack in one place.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Ask in plain English. Get answers in Slack. No more tab-switching.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-muted-foreground/80"
          >
            Free to start. Scale as you grow.
          </motion.p>
        </div>
      </section>

      {/* Success / Canceled banners */}
      {success === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 mb-4"
        >
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-green-500 font-medium">
              Payment successful! Your subscription is now active.
            </p>
          </div>
        </motion.div>
      )}
      {canceled === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 mb-4"
        >
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-muted-foreground">
              Checkout was canceled. You can try again whenever you&apos;re ready.
            </p>
          </div>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <PricingCards
            yearly={yearly}
            onYearlyChange={setYearly}
            showToggle={true}
            compact={false}
            onTierSelect={checkoutLoading ? undefined : handleTierSelect}
            activeTier={activeTier}
          />
          {checkoutLoading && (
            <div className="flex justify-center mt-4 gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to checkout...</span>
            </div>
          )}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 border-t border-border/50 bg-background/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-serif">
              Compare all features
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature mapped so you can compare tiers at a glance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-border bg-card/30 p-4 md:p-6 overflow-hidden">
              <FeatureComparisonTable />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-serif">
              Frequently asked questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FAQ items={FAQ_ITEMS} />
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="enterprise"
        className="py-24 px-4 border-t border-border/50 bg-card/10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-serif">
            Still have questions?
          </h2>
          <p className="text-muted-foreground text-lg">
            Contact our team for custom pricing, enterprise deployments, or
            anything else.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8"
              >
                Start free — no credit card
              </Button>
            </Link>
            <Link href="/#get-started">
              <Button variant="outline" size="lg" className="rounded-full">
                Contact sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="font-serif font-bold text-foreground hover:opacity-80">
            Continuum
          </Link>
          <div className="flex gap-6">
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/install" className="hover:text-foreground transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 px-4 text-center text-muted-foreground">
          Loading...
        </section>
      </main>
    }>
      <PricingContent />
    </Suspense>
  );
}
