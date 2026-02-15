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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardAccount } from "@/lib/types/dashboard";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  mobileOpen,
  onMobileClose,
}: {
  account: DashboardAccount | null;
  loading: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Continuum Logo + mobile close */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex flex-row items-center">
          <Image src="/Continuum_Logo.png" alt="Continuum" width={40} height={40} />
          <span className="font-serif text-xl font-bold tracking-tight pl-1">
            Continuum
          </span>
        </div>
        {onMobileClose && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
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
      <nav className="flex-1 space-y-0.5 overflow-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onMobileClose}
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
      <div className="border-t border-border p-3 space-y-0.5 shrink-0">
        {footerItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onMobileClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </>
  );

  const asideClass = cn(
    "fixed inset-y-0 left-0 z-40 flex h-screen w-[280px] flex-col border-r border-border bg-card/30 transition-transform duration-200 ease-out",
    "md:translate-x-0",
    mobileOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {onMobileClose && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onMobileClose}
          className={cn(
            "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden",
            mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
          )}
        />
      )}
      <aside className={asideClass}>
        {sidebarContent}
      </aside>
    </>
  );
}
