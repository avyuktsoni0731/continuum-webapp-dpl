"use client";

import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function DashboardUsagePage() {
  const { loading } = useDashboard();

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
        <h1 className="font-serif text-3xl font-medium">Usage</h1>
        <p className="mt-2 text-muted-foreground">
          View your usage history and export data. Chart and export coming soon.
        </p>
      </div>
    </section>
  );
}
