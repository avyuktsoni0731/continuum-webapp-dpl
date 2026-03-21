"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Workflow,
  BarChart3,
  Plug,
  CreditCard,
  Menu,
  Loader2,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/ops", label: "Continuum Ops", icon: Workflow, accent: true },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function OpsAppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { account, loading } = useDashboard();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/ops");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar — Continuum Ops as its own product surface */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/ops" className="flex min-w-0 items-center gap-2">
              <Image
                src="/Continuum_Ops_AI_Full_Logo_2.png"
                alt="Continuum Ops"
                width={160}
                height={16}
                className="h-8 w-auto object-contain object-left"
                priority
              />
            </Link>
            <span className="hidden md:inline text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Command center
            </span>
          </div>
          <div className="hidden flex-wrap items-center gap-1 md:flex">
            {topNav.map(({ href, label, icon: Icon, accent }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  accent
                    ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden flex-shrink-0 text-right text-xs text-muted-foreground md:block">
            {loading ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading…
              </span>
            ) : account ? (
              <>
                <p className="font-medium text-foreground">{account.name || "Account"}</p>
                <p className="truncate max-w-[12rem]">{account.plan_display_name}</p>
              </>
            ) : null}
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border/60 px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {topNav.map(({ href, label, icon: Icon, accent }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    accent
                      ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="relative">
        {children}
      </main>
    </div>
  );
}
