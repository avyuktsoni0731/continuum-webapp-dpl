"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Plug,
  CreditCard,
  FileText,
  Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardAccount } from "@/lib/types/dashboard";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/billing", label: "Billing & Invoices", icon: CreditCard },
];

const footerItems = [
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/contact", label: "Contact Us", icon: Mail },
];

export function DashboardSidebar({
  account,
  loading,
}: {
  account: DashboardAccount | null;
  loading: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sticky top-0 flex h-screen min-h-0 w-[280px] shrink-0 flex-col border-r border-border bg-card/30">
      {/* Continuum Logo */}
      <div className="border-b border-border p-4 flex flex-row">
        <Image src="/Continuum_Logo.png" alt="Continuum" width={40} height={40} />
        <span className="font-serif text-xl font-bold tracking-tight flex items-center justify-center pl-1">
          Continuum
        </span>
      </div>


      {/* User block */}
      <div className="border-b border-border p-4">
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : account ? (
          <div>
            <p className="font-medium text-foreground">
              {account.name || "Account"}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {account.plan_display_name} · {account.email}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not loaded</p>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-accent/15 text-white"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer links */}
      <div className="border-t border-border p-3 space-y-0.5">
        {footerItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
