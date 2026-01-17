"use client";

import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to setup page with workspace_id and success params
    const workspaceId = searchParams.get("workspace_id");
    const success = searchParams.get("success");

    if (workspaceId) {
      // Redirect to setup page
      router.replace(`/setup?workspace_id=${workspaceId}${success ? "&success=true" : ""}`);
    } else {
      // No workspace_id, redirect to install
      router.replace("/install");
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
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
            Redirecting to setup page...
          </motion.p>
        </div>
      </section>
    </main>
  );
}

export default function InstallSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}
