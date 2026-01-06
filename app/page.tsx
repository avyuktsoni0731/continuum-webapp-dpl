"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Toaster } from "@/components/sonner";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />

      {/* "Ready" Section inspired by Brillance */}
      <section
        ref={ctaRef}
        id="get-started"
        className="py-32 px-4 border-t border-border/50 bg-linear-to-b from-background to-card/20"
      >
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-8xl leading-tight"
          >
            Ready to reclaim <br />
            <span className="italic text-accent">your flow?</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-muted-foreground text-xl max-w-lg mx-auto">
              Join hundreds of engineering teams eliminating context switching
              with Continuum.
            </p>
            <div className="w-full max-w-md">
              <button
                onClick={() => {
                  const waitlistElement = document.getElementById("waitlist");
                  if (waitlistElement) {
                    waitlistElement.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
                className="w-full py-4 px-8 bg-foreground text-background rounded-full font-serif text-2xl font-medium hover:scale-[1.02] transition-transform active:scale-95 shadow-2xl shadow-white/5"
              >
                Reserve your spot
              </button>
              <p className="mt-4 text-xs text-muted-foreground/60 uppercase tracking-[0.2em]">
                Limited beta slots available each month
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-20 px-4 border-t border-border bg-card/10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              {/* <div className="w-5 h-5 bg-accent rounded-full" /> */}
              <span className="font-serif text-xl font-bold tracking-tight">
                Continuum
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The intelligent productivity agent for high-performance
              engineering teams.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-4">
              <p className="font-medium uppercase tracking-wider text-[10px] text-muted-foreground">
                Product
              </p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById("features");
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById("features");
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    Integrations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById("get-started");
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-medium uppercase tracking-wider text-[10px] text-muted-foreground">
                Company
              </p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById("features");
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById("get-started");
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById("waitlist");
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-medium uppercase tracking-wider text-[10px] text-muted-foreground">
                Connect
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://x.com/avyukt_soni"
                    className="hover:text-accent transition-colors"
                    target="_blank"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/avyuktsoni0731"
                    className="hover:text-accent transition-colors"
                    target="_blank"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/avyuktsoni0731/"
                    className="hover:text-accent transition-colors"
                    target="_blank"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto pt-20 flex flex-col md:flex-row justify-between text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] gap-4"
        >
          <p>© 2026 Continuum</p>
          <div className="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </motion.div>
      </footer>
      <Toaster position="top-center" theme="dark" />
    </main>
  );
}
