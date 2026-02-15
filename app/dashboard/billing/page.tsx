"use client";

import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { format, parseISO } from "date-fns";

function formatLimit(value: number | undefined): string {
  if (value === undefined) return "—";
  return value.toLocaleString();
}

export default function DashboardBillingPage() {
  const { subscription, loading } = useDashboard();

  const periodLabel =
    subscription?.billing_period_start && subscription?.current_period_end
      ? `${format(parseISO(subscription.billing_period_start), "MMM d, yyyy")} – ${format(parseISO(subscription.current_period_end), "MMM d, yyyy")}`
      : null;

  const limits = subscription?.limits ?? {};
  const usage = subscription?.usage ?? {};

  const usageRows = [
    {
      label: "Slack workspaces",
      used: usage.slack_workspaces,
      limit: limits.slack_workspaces,
    },
    {
      label: "Requests per day",
      used: usage.requests_today,
      limit: limits.requests_per_day,
    },
    {
      label: "Team members",
      used: usage.team_members,
      limit: limits.team_members,
    },
    {
      label: "Knowledge facts",
      used: usage.knowledge_facts,
      limit: limits.knowledge_facts,
    },
  ].filter((row) => row.limit !== undefined || row.used !== undefined);

  if (loading) {
    return (
      <section className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </section>
    );
  }

  return (
    <section className="pb-8">
      <div className="max-w-4xl space-y-8 sm:space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-medium sm:text-3xl">Billing & Invoices</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your subscription and view usage. Current plan:{" "}
              <span className="font-medium text-foreground capitalize">
                {subscription?.tier ?? "—"}
              </span>
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="rounded-full shrink-0">
              Manage subscription
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Included usage */}
        <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
          <div className="border-b border-border px-3 py-3 sm:px-4">
            <h2 className="font-medium text-sm sm:text-base">Included usage</h2>
            {periodLabel && (
              <p className="text-sm text-muted-foreground">{periodLabel}</p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">Item</th>
                  <th className="px-3 py-2 text-right text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">Used</th>
                  <th className="px-3 py-2 text-right text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">Limit</th>
                </tr>
              </thead>
              <tbody>
                {usageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-sm text-muted-foreground sm:px-4"
                    >
                      No usage data for this period
                    </td>
                  </tr>
                ) : (
                  usageRows.map(({ label, used, limit }) => (
                    <tr
                      key={label}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">{label}</td>
                      <td className="px-3 py-2 text-right text-xs sm:px-4 sm:py-3 sm:text-sm">
                        {formatLimit(used)}
                      </td>
                      <td className="px-3 py-2 text-right text-xs sm:px-4 sm:py-3 sm:text-sm">
                        {formatLimit(limit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-medium">Invoices</h2>
            <p className="text-sm text-muted-foreground">
              Payment history and receipts are available from your plan provider.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Invoices and payment history can be viewed when you manage your
              subscription.
            </p>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="rounded-full">
                Go to plans
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
