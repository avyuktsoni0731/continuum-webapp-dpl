"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import { validateAccessCode } from "@/lib/beta-access";

interface BetaAccessGateProps {
  children: React.ReactNode;
  onAccessGranted: () => void;
}

export function BetaAccessGate({ children, onAccessGranted }: BetaAccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);

  // Check if already granted in this session (useEffect to avoid render issues)
  useEffect(() => {
    if (typeof window !== "undefined" && !granted) {
      const alreadyGranted = sessionStorage.getItem("beta_access_granted") === "true";
      if (alreadyGranted) {
        setGranted(true);
        onAccessGranted();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Small delay for UX
    setTimeout(() => {
      if (validateAccessCode(code)) {
        setGranted(true);
        // Store in sessionStorage so it persists during session
        if (typeof window !== "undefined") {
          sessionStorage.setItem("beta_access_granted", "true");
          sessionStorage.setItem("beta_access_code", code);
        }
        onAccessGranted();
      } else {
        setError("Invalid access code. Please try again or request access.");
      }
      setLoading(false);
    }, 300);
  };

  if (granted) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative">
      {/* Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
      >
        <nav className="flex items-center justify-between px-6 py-2 bg-card/50 backdrop-blur-xl border border-border rounded-full shadow-2xl shadow-black/50">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-serif text-lg font-bold tracking-tight">
              Continuum
            </span>
          </Link>
          <Link href="/#waitlist">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-foreground text-white hover:bg-foreground/90 transition-all border-none font-medium"
            >
              Join Waitlist
            </Button>
          </Link>
        </nav>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <Lock className="w-8 h-8 text-accent" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-medium">
              Private Beta
            </h1>
            <p className="text-muted-foreground">
              Continuum is currently in private beta. Enter your access code to
              continue.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter access code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              className="rounded-full h-12 text-center text-lg font-mono tracking-wider"
              autoFocus
              disabled={loading}
            />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all border-none font-medium"
          >
            {loading ? "Verifying..." : "Continue"}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an access code?{" "}
          <a
            href="/"
            className="text-accent hover:underline"
          >
            Join the waitlist
          </a>
          {" "}to request beta access.
        </p>
      </motion.div>
    </div>
  );
}
