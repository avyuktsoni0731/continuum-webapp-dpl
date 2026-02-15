"use client";

import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function DashboardIntegrationsPage() {
  const { workspaces, loading } = useDashboard();

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
        <h1 className="font-serif text-3xl font-medium">Integrations</h1>
        <p className="mt-2 text-muted-foreground">
          Connect GitHub, GitLab, Slack, and Linear. You have{" "}
          {workspaces.length} workspace(s) connected.
        </p>
      </div>
    </section>
  );
}
