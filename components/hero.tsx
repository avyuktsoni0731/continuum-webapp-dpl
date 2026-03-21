"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Workflow } from "lucide-react";

export function Hero() {
  return (
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
            Now in Private Beta
          </Badge>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <Link
            href="/ops"
            className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-sm shadow-cyan-500/10 transition-colors hover:bg-cyan-500/20"
          >
            <Workflow className="h-4 w-4 text-cyan-300" />
            Continuum Ops — Jira &amp; GitHub command center
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div> */}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] font-serif font-medium"
        >
          Unify your work <br />
          <span className="text-muted-foreground/40 italic">in one flow</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty"
        >
          Stop context switching between your tools. Continuum orchestrates the
          platforms your team already uses through natural language in Slack—with
          smart delegation, always-on context, and intelligent automation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="pt-2"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-medium text-lg hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/25"
          >
            Get early access
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-md mx-auto pt-4"
          id="waitlist"
        >
          <WaitlistForm />
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="pt-12 relative"
        >
          {/* <div className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-2 shadow-2xl">
            <div className="rounded-xl border border-border bg-background/50 overflow-hidden aspect-video flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent pointer-events-none" />
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center border border-border shadow-xl mx-auto group-hover:scale-110 transition-transform cursor-pointer">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-accent border-b-[8px] border-b-transparent ml-1" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Watch the Demo
                </p>
              </div>
            </div>
          </div> */}

          {/* Decorative lines like in Brillance */}
          <div className="absolute -bottom-10 left-0 w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
