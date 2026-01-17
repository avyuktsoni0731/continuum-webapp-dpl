"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
    >
      <nav className="flex items-center justify-between px-6 py-2 bg-card/50 backdrop-blur-xl border border-border rounded-full shadow-2xl shadow-black/50">
        <div className="flex items-center gap-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
          >
            {/* <CHANGE> Updated orange-accent to accent */}
            {/* <div className="w-6 h-6 bg-accent rounded-full animate-pulse" /> */}
            <span className="font-serif text-lg font-bold tracking-tight">
              Continuum
            </span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-foreground transition-colors"
            >
              Integrations
            </button>
            <Link
              href="/install"
              className="hover:text-foreground transition-colors"
            >
              Install
            </Link>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => scrollToSection("waitlist")}
          className="rounded-full bg-foreground text-white hover:bg-foreground/90 transition-all border-none font-medium"
        >
          Join Waitlist
        </Button>
      </nav>
    </motion.header>
  );
}
