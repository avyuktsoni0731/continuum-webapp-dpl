"use client";

import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function DashboardBillingPage() {
  const { subscription, loading } = useDashboard();

  if (loading) {
    return (
      <section className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </section>
    );
  }

  return (
    <section className="p-8 pb-20">
      <div className="max-w-4xl">
        <h1 className="font-serif text-3xl font-medium">Billing & Invoices</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and view invoices. Current plan:{" "}
          {subscription?.tier ?? "—"}
        </p>
      </div>
    </section>
  );
}
