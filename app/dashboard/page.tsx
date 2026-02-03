"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Slack,
  ArrowRight,
  Loader2,
  Plus,
  Database,
  Github,
  ExternalLink,
} from "lucide-react";
import { apiFetch, dispatchUnauthorized } from "@/lib/api";

interface Workspace {
  id: string;
  slack_workspace_name: string;
  slack_workspace_id: string;
  integrations: { jira: boolean; github: boolean };
  created_at: string;
}

interface Subscription {
  tier: string;
  status: string;
  current_period_end?: string;
  limits?: Record<string, number>;
  usage?: Record<string, number>;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingSlack, setAddingSlack] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
      return;
    }
    if (status !== "authenticated" || !session?.accessToken) return;

    const fetchData = async () => {
      try {
        const [wsRes, subRes] = await Promise.all([
          apiFetch<{ workspaces: Workspace[] }>("/workspaces", {}, session.accessToken),
          apiFetch<Subscription>("/subscription", {}, session.accessToken).catch(
            () => null
          ),
        ]);
        setWorkspaces(wsRes.workspaces || []);
        setSubscription(subRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const confirmPayment = async () => {
      const razorpay_payment_id = searchParams.get("razorpay_payment_id");
      const razorpay_payment_link_id = searchParams.get("razorpay_payment_link_id");
      const razorpay_signature = searchParams.get("razorpay_signature");

      if (
        searchParams.get("success") === "true" &&
        razorpay_payment_id &&
        razorpay_payment_link_id &&
        razorpay_signature
      ) {
        try {
          const res = await fetch("/api/subscription/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id,
              razorpay_payment_link_id,
              razorpay_payment_link_reference_id:
                searchParams.get("razorpay_payment_link_reference_id") || "",
              razorpay_payment_link_status:
                searchParams.get("razorpay_payment_link_status") || "",
              razorpay_signature,
            }),
          });

          if (!res.ok) {
            if (res.status === 401) dispatchUnauthorized();
            const err = await res.json().catch(() => ({}));
            setConfirmError(
              (err as { message?: string; detail?: string })?.message ||
              (err as { message?: string; detail?: string })?.detail ||
              "Failed to confirm subscription"
            );
          } else {
            // Clean URL to prevent re-confirming on refresh
            window.history.replaceState({}, "", "/dashboard");
          }
        } catch (err) {
          setConfirmError("Failed to confirm subscription");
        }
      }

      await fetchData();
    };

    confirmPayment();
  }, [session, status, router, searchParams]);

  const handleAddToSlack = async () => {
    if (!session?.accessToken) return;
    setAddingSlack(true);
    try {
      const res = await fetch("/api/slack/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirect_uri: `${window.location.origin}/setup`,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatchUnauthorized();
        return;
      }
      if (data.install_url) {
        window.location.href = data.install_url;
      } else {
        throw new Error(data.error || "Failed to get install URL");
      }
    } catch (err) {
      console.error(err);
      setAddingSlack(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="relative pt-40 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-medium">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your workspaces and connect Slack
            </p>
            {subscription && (
              <div className="mt-4 inline-flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/50 text-white capitalize"
                >
                  {subscription.tier}
                </Badge>
                {subscription.status && (
                  <span className="text-sm text-muted-foreground">
                    • {subscription.status}
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Add to Slack CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card/50 p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-xl font-serif font-medium mb-2">
                  Add Continuum to Slack
                </h2>
                <p className="text-muted-foreground text-sm">
                  Install Continuum in a new workspace to get started. You can
                  connect Jira and GitHub after installation.
                </p>
              </div>
              <Button
                onClick={handleAddToSlack}
                disabled={addingSlack}
                className="rounded-full px-8 py-6 bg-[#4A154B] hover:bg-[#5A1B5B] text-white font-medium shrink-0"
              >
                {addingSlack ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Slack className="w-5 h-5 mr-2" />
                    Add to Slack
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Workspaces list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-serif font-medium mb-4">
              Your workspaces
            </h2>
            {workspaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center">
                <Plus className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No workspaces yet. Add Continuum to Slack to get started.
                </p>
                <Button
                  onClick={handleAddToSlack}
                  disabled={addingSlack}
                  variant="outline"
                  className="rounded-full"
                >
                  Add your first workspace
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/setup?workspace_id=${ws.id}`}
                    className="block rounded-xl border border-border bg-card/50 p-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#4A154B]/20 flex items-center justify-center">
                          <Slack className="w-6 h-6 text-[#4A154B]" />
                        </div>
                        <div>
                          <h3 className="font-medium">{ws.slack_workspace_name}</h3>
                          <div className="flex gap-2 mt-1">
                            {ws.integrations?.jira && (
                              <Badge variant="outline" className="text-xs">
                                <Database className="w-3 h-3 mr-1" />
                                Jira
                              </Badge>
                            )}
                            {ws.integrations?.github && (
                              <Badge variant="outline" className="text-xs">
                                <Github className="w-3 h-3 mr-1" />
                                GitHub
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-4"
          >
            <Link href="/pricing">
              <Button variant="outline" className="rounded-full">
                View plans
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="rounded-full">
                Back to home
              </Button>
            </Link>
          </motion.div>

          {confirmError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm"
            >
              {confirmError}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen">
          <Navbar />
          <section className="relative pt-40 pb-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
            </div>
          </section>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
