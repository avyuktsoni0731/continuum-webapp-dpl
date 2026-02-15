"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { useSubscriptionUsage, type UsageDays } from "@/components/dashboard/use-subscription-usage";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export default function DashboardUsagePage() {
  const { data: session } = useSession();
  const { subscription, loading: dashboardLoading } = useDashboard();
  const [days, setDays] = useState<UsageDays>(30);
  const { data: usageData, loading: usageLoading } = useSubscriptionUsage(days);
  const [exporting, setExporting] = useState(false);

  const periodLabel =
    subscription?.billing_period_start && subscription?.current_period_end
      ? `${format(parseISO(subscription.billing_period_start), "MMM d")} – ${format(parseISO(subscription.current_period_end), "MMM d")}`
      : null;

  const handleExport = () => {
    if (!session?.accessToken) return;
    setExporting(true);
    const url = `/api/subscription/usage/export?days=${days}`;
    window.location.href = url;
    setTimeout(() => setExporting(false), 2000);
  };

  if (dashboardLoading) {
    return (
      <section className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </section>
    );
  }

  return (
    <section className="p-8 pb-20">
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-medium">Usage</h1>
            <p className="mt-1 text-muted-foreground">
              View your usage history and export data.
            </p>
            {periodLabel && (
              <p className="mt-1 text-sm text-muted-foreground">{periodLabel}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {([1, 7, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  days === d
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {d}d
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        <UsageChart data={usageData} loading={usageLoading} height={260} />

        {/* Usage table */}
        <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
          <h2 className="border-b border-border px-4 py-3 font-medium">
            Usage history
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Requests</th>
                </tr>
              </thead>
              <tbody>
                {usageLoading ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : usageData?.daily?.length ? (
                  [...usageData.daily]
                    .reverse()
                    .map(({ date, requests }) => (
                      <tr
                        key={date}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          {format(parseISO(date), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          {requests.toLocaleString()}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                      No usage in this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
