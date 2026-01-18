"use client";

import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Github,
  Database,
  Check,
  ArrowRight,
  Slack,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.continuumworks.app";

interface SetupStatus {
  workspace_id: string;
  workspace_name: string;
  slack_workspace_id: string;
  integrations: {
    jira: {
      connected: boolean;
      connect_url: string;
    };
    github: {
      connected: boolean;
      connect_url: string;
    };
  };
}

function SetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workspaceId = searchParams.get("workspace_id");
  const success = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const fetchSetupStatus = async (id: string) => {
    try {
      const redirectUri = typeof window !== "undefined" 
        ? encodeURIComponent(window.location.href)
        : "";
      const res = await fetch(
        `${API_URL}/setup/status?workspace_id=${id}&redirect_uri=${redirectUri}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Workspace not found. Please install Continuum first.");
        }
        throw new Error(`Failed to load setup status (${res.status})`);
      }

      const data = await res.json();
      setStatus(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load setup status");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle errors from OAuth callback
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        invalid_code:
          "The authorization code expired. Please try installing again.",
        invalid_client: "Configuration error. Please contact support.",
        bad_redirect_uri: "Redirect URI mismatch. Please contact support.",
        installation_failed: "Installation failed. Please try again.",
      };
      setError(errorMessages[errorParam] || `Error: ${errorParam}`);
      setLoading(false);
      return;
    }

    // Check for workspace_id
    if (!workspaceId) {
      setError("No workspace ID found. Please install Continuum first.");
      setLoading(false);
      return;
    }

    // Fetch setup status (only on client)
    if (typeof window !== "undefined") {
      fetchSetupStatus(workspaceId);
    }
  }, [workspaceId, errorParam]);

  // Refresh status when returning from OAuth (page becomes visible)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      !workspaceId ||
      loading
    ) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !loading) {
        // Refresh status after a short delay to allow backend to process
        setTimeout(() => {
          fetchSetupStatus(workspaceId);
        }, 1000);
      }
    };

    // Check on mount if page is visible
    if (document.visibilityState === "visible") {
      handleVisibilityChange();
    }

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [workspaceId, loading]);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="relative pt-40 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground"
            >
              Loading setup status...
            </motion.p>
          </div>
        </section>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="relative pt-40 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-destructive" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-serif"
            >
              Setup Error
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              {error}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <Link
                href="/install"
                className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:scale-[1.02] transition-transform"
              >
                Try Installing Again
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    );
  }

  // No workspace found
  if (!status) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="relative pt-40 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-serif"
            >
              Workspace Not Found
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground"
            >
              No workspace found. Please install Continuum first.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/install"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-full font-medium hover:bg-accent/10 transition-colors"
              >
                Go to Install Page
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
        {/* Background elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-[120px] -z-10 rounded-full"
        />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Success banner */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl rounded-2xl border border-green-500/30 bg-green-500/10 p-6"
            >
              <div className="flex items-center gap-3 justify-center">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-green-500 font-medium">
                  Continuum has been installed to your Slack workspace!
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: success ? 0.2 : 0 }}
          >
            <Badge
              variant="outline"
              className="px-4 py-1.5 border-accent text-foreground bg-accent/5 rounded-full font-medium text-sm"
            >
              Setup Your Workspace
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: success ? 0.3 : 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] font-serif font-medium"
          >
            Welcome, <br />
            <span className="text-accent italic">{status.workspace_name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: success ? 0.5 : 0.4 }}
            className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty"
          >
            Connect your tools to unlock the full power of Continuum. You can
            skip this step and connect integrations later from Slack.
          </motion.p>
        </div>
      </section>

      {/* Integration Cards */}
      <section className="py-24 px-4 border-t border-border/50 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-serif">
              Connect Integrations
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              Link your tools to enable smart delegation, cross-tool queries,
              and intelligent automation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Jira */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`rounded-3xl border ${
                status.integrations.jira.connected
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-border bg-card/50"
              } p-10 space-y-6 group hover:border-accent/50 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-[#0052CC] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-8 h-8 text-white" />
                </div>
                {status.integrations.jira.connected && (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-serif">Jira</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect Jira to manage tasks, track sprint velocity, get
                  intelligent task assignments, and monitor blockers.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Features:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>Task and sprint management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>Smart delegation based on workload</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>Velocity tracking and alerts</span>
                  </li>
                </ul>
              </div>
              <a
                href={status.integrations.jira.connect_url}
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium group/link"
              >
                {status.integrations.jira.connected
                  ? "Reconnect Jira"
                  : "Connect Jira"}
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* GitHub */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`rounded-3xl border ${
                status.integrations.github.connected
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-border bg-card/50"
              } p-10 space-y-6 group hover:border-accent/50 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-[#202124] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Github className="w-8 h-8 text-white" />
                </div>
                {status.integrations.github.connected && (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-serif">GitHub</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect GitHub to track PRs, review code, get smart delegation
                  suggestions based on code expertise, and monitor CI/CD status.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Features:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>PR tracking and review management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>Code expertise-based delegation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>Stale PR detection and alerts</span>
                  </li>
                </ul>
              </div>
              <a
                href={status.integrations.github.connect_url}
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium group/link"
              >
                {status.integrations.github.connected
                  ? "Reconnect GitHub"
                  : "Connect GitHub"}
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12 space-y-6"
          >
            <p className="text-muted-foreground">
              Integrations can be connected later from Slack. Start using
              Continuum with basic features right away!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Need help?</span>
              <Link
                href="/docs/introduction"
                className="text-accent hover:text-accent/80 transition-colors font-medium"
              >
                View Documentation →
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://slack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-serif text-lg font-medium hover:scale-[1.02] transition-transform active:scale-95 shadow-2xl shadow-white/5"
              >
                <Slack className="w-5 h-5" />
                <span>Open Slack</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-full font-medium hover:bg-accent/10 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen">
          <Navbar />
          <section className="relative pt-40 pb-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </section>
        </main>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
