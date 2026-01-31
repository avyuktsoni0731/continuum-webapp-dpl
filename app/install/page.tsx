"use client";

import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BetaAccessGate } from "@/components/beta-access-gate";
import { motion } from "framer-motion";
import { Check, Slack, Github, Database, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.continuumworks.app";
const BETA_ENABLED = process.env.NEXT_PUBLIC_BETA_ENABLED === "true";

export default function InstallPage() {
  const [accessGranted, setAccessGranted] = useState(false);

  // Check if already granted in this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const alreadyGranted = sessionStorage.getItem("beta_access_granted") === "true";
      if (alreadyGranted) {
        setAccessGranted(true);
      }
    }
  }, []);

  const installContent = (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
        {/* Background elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-[120px] -z-10 rounded-full"
        />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge
              variant="outline"
              className="px-4 py-1.5 border-accent text-foreground bg-accent/5 rounded-full font-medium text-sm"
            >
              Install Continuum
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] font-serif font-medium"
          >
            Add Continuum <br />
            <span className="text-muted-foreground/40 italic">to Slack</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty"
          >
            Install Continuum in your Slack workspace to start orchestrating your
            tools through natural language. Get set up in under 2 minutes.
          </motion.p>

          {/* Add to Slack Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="pt-8"
          >
            <a
              href={`${API_URL}/slack/install?redirect_uri=${encodeURIComponent(
                typeof window !== "undefined"
                  ? `${window.location.origin}/setup`
                  : "https://continuumworks.app/setup"
              )}`}
              className="inline-block group"
            >
              <div className="flex items-center gap-4 px-8 py-5 bg-[#4A154B] hover:bg-[#5A1B5B] text-white rounded-full font-medium text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-[#4A154B]/30">
                <Slack className="w-6 h-6" />
                <span>Add to Slack</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
            <p className="mt-4 text-xs text-muted-foreground/60 uppercase tracking-[0.2em]">
              Requires workspace admin approval
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              What You Get
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              Everything you need to orchestrate your engineering tools from Slack.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Smart Delegation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-border bg-card/50 p-8 space-y-4"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif">Smart Delegation</h3>
              <p className="text-sm text-muted-foreground">
                Ask "who should I assign this PR to?" and get intelligent
                suggestions based on expertise, workload, and availability.
              </p>
            </motion.div>

            {/* Multi-Tool Integration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl border border-border bg-card/50 p-8 space-y-4"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif">Unified Tools</h3>
              <p className="text-sm text-muted-foreground">
                Connect your existing platforms. Ask about tasks, PRs, and
                statuses across all your tools in one place.
              </p>
            </motion.div>

            {/* Always-on Context */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl border border-border bg-card/50 p-8 space-y-4"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif">Always-on Context</h3>
              <p className="text-sm text-muted-foreground">
                Persistent memory tracks team skills, task history, and review
                patterns across all interactions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Documentation Link */}
      <section className="py-16 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              New to Continuum? Check out our comprehensive documentation.
            </p>
            <Link
              href="/docs/introduction"
              className="inline-flex items-center gap-2 text-white hover:text-accent/80 transition-colors font-medium"
            >
              View Documentation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="py-24 px-4 border-t border-border/50 bg-linear-to-b from-background to-card/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-serif">Quick Setup</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
              Get started in three simple steps.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex gap-6 items-start"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-serif text-xl font-bold">
                1
              </div>
              <div className="grow space-y-2">
                <h3 className="text-2xl font-serif">Install to Slack</h3>
                <p className="text-muted-foreground">
                  Click "Add to Slack" above and authorize Continuum in your
                  workspace. Admins may need to approve the installation.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-6 items-start"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-serif text-xl font-bold">
                2
              </div>
              <div className="grow space-y-2">
                <h3 className="text-2xl font-serif">Connect Integrations</h3>
                <p className="text-muted-foreground">
                  Optionally connect Jira, GitHub, or other platforms to unlock
                  full functionality. These can be configured after installation.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-6 items-start"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-serif text-xl font-bold">
                3
              </div>
              <div className="grow space-y-2">
                <h3 className="text-2xl font-serif">Start Using</h3>
                <p className="text-muted-foreground">
                  Start asking questions in Slack! Try: "Who should I assign this
                  PR to?" or "Show me my open tasks."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl leading-tight"
          >
            Ready to get <br />
            <span className="italic text-accent">started?</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a
              href={`${API_URL}/slack/install?redirect_uri=${encodeURIComponent(
                typeof window !== "undefined"
                  ? `${window.location.origin}/setup`
                  : "https://continuumworks.app/setup"
              )}`}
              className="inline-block group"
            >
              <div className="flex items-center gap-4 px-12 py-6 bg-[#4A154B] hover:bg-[#5A1B5B] text-white rounded-full font-serif text-2xl font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-[#4A154B]/30">
                <Slack className="w-7 h-7" />
                <span>Add to Slack</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );

  // If beta is enabled, show access gate
  if (BETA_ENABLED) {
    return (
      <BetaAccessGate onAccessGranted={() => setAccessGranted(true)}>
        {installContent}
      </BetaAccessGate>
    );
  }

  // Otherwise, show content directly
  return installContent;
}
