"use client";

import { Badge } from "@/components/ui/badge";
import {
  Github,
  Database,
  MessageSquare,
  Zap,
  Users,
  Brain,
  Server,
  Workflow,
  ShieldCheck,
  GitBranch,
  Plug2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      className="py-24 px-4 bg-background/50 relative"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto space-y-20">
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
            Platform Features
          </Badge>
          <h2 className="text-5xl md:text-7xl font-serif">
            Intelligent Orchestration
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Continuum isn't just a bot. It's an autonomous layer that sits
            between you and your engineering stack.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-6 md:auto-rows-[240px]">
          {/* Smart Delegation Engine - Main Feature */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-8 md:row-span-2 rounded-3xl border border-border bg-card/50 overflow-hidden group relative p-6 md:p-10 flex flex-col md:justify-end gap-6 md:gap-0"
          >
            {/* Icons - positioned differently on mobile vs desktop */}
            <div className="flex gap-3 md:gap-4 md:absolute md:top-10 md:right-10 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500 justify-center md:justify-start">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#202124] border border-border flex items-center justify-center p-2 md:p-3 shadow-xl transform group-hover:-translate-y-2 transition-transform">
                <Users className="w-full h-full text-white" />
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#0052CC] border border-border flex items-center justify-center p-2 md:p-3 shadow-xl transform group-hover:-translate-y-4 transition-transform delay-75">
                <GitBranch className="w-full h-full text-white" />
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#EA4335] border border-border flex items-center justify-center p-2 md:p-3 shadow-xl transform group-hover:-translate-y-2 transition-transform delay-150">
                <Brain className="w-full h-full text-white" />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 relative z-10">
              <h3 className="text-3xl md:text-4xl">Smart Delegation Engine</h3>
              <p className="text-muted-foreground text-base md:text-lg max-w-md">
                Ask "who should I assign this PR to?" and get intelligent
                suggestions based on code expertise, current workload, review
                quality history, and availability.
              </p>
            </div>
          </motion.div>

          {/* Always-on Context */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-4 rounded-3xl border border-border bg-card/50 p-8 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
              <Server className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">Always-on Context</h3>
              <p className="text-sm text-muted-foreground">
                Persistent memory tracks team skills, task history, review
                patterns, and conversation context across all interactions.
              </p>
            </div>
          </motion.div>

          {/* Agent Orchestration */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-4 rounded-3xl border border-border bg-card/50 p-8 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
              <Workflow className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">Multi-Step Orchestration</h3>
              <p className="text-sm text-muted-foreground">
                Execute complex workflows in one command: "Check availability
                for @sarah, assign her to KAN-123, and notify the team in
                Slack."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Second Row of Features */}
        <div className="grid md:grid-cols-12 gap-6 md:auto-rows-[240px]">
          {/* Multi-Tool Synergy */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:col-span-6 md:row-span-2 rounded-3xl border border-border bg-card/50 overflow-hidden group relative p-6 md:p-10 flex flex-col md:justify-end gap-6 md:gap-0"
          >
            <div className="flex gap-3 md:gap-4 md:absolute md:top-10 md:right-10 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500 justify-center md:justify-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#202124] border border-border flex items-center justify-center p-2 md:p-3 shadow-xl">
                <Github className="w-full h-full text-white" />
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#0052CC] border border-border flex items-center justify-center p-2 md:p-3 shadow-xl">
                <Database className="w-full h-full text-white" />
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#6366F1] border border-border flex items-center justify-center p-2 md:p-3 shadow-xl">
                <Plug2 className="w-full h-full text-white" />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 relative z-10">
              <h3 className="text-3xl md:text-4xl">Multi-Tool Synergy</h3>
              <p className="text-muted-foreground text-base md:text-lg max-w-md">
                Connect the platforms your team already uses. Ask about tasks,
                see linked PRs, check statuses, and get answers—all in a single
                Slack thread.
              </p>
            </div>
          </motion.div>

          {/* Policy Engine */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="md:col-span-3 rounded-3xl border border-border bg-card/50 p-8 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">Policy Engine</h3>
              <p className="text-sm text-muted-foreground">
                Smart decision rules: "Don't assign to someone with 5+ open
                tasks" or "Alert if sprint velocity is below target."
              </p>
            </div>
          </motion.div>

          {/* Natural Language */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="md:col-span-3 rounded-3xl border border-border bg-card/50 p-8 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">Natural Language</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions in plain English, get actions executed in
                real-time.
              </p>
            </div>
          </motion.div>

          {/* Smart Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="md:col-span-6 rounded-3xl border border-border bg-card/50 p-8 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif">Smart Triggers</h3>
              <p className="text-sm text-muted-foreground">
                Auto-detect stale PRs, monitor CI failures, identify blockers,
                and surface critical updates through event-based webhooks.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
