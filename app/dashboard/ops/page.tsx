"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  BlockerLedgerResponse,
  DashboardIssueItem,
  IssueHealthResponse,
} from "@/lib/types/dashboard";
import { useEffect } from "react";

function isBlocked(item: DashboardIssueItem) {
  const labels = item.labels || [];
  return (
    labels.some((l) => l.toLowerCase() === "blocked") ||
    /blocked|on hold|waiting|stuck|needs info|pending/i.test(item.status || "")
  );
}

function priorityTone(priority: string) {
  const p = (priority || "").toLowerCase();
  if (/(critical|highest|p0|urgent)/.test(p)) return "text-red-300 border-red-500/40 bg-red-500/15";
  if (/(high|p1)/.test(p)) return "text-orange-300 border-orange-500/40 bg-orange-500/15";
  if (/(medium|p2)/.test(p)) return "text-amber-300 border-amber-500/40 bg-amber-500/15";
  return "text-muted-foreground border-border bg-card/40";
}

function statusTone(status: string, blocked: boolean) {
  if (blocked) return "text-red-300 border-red-500/40 bg-red-500/15";
  if (/done|closed|resolved/i.test(status || "")) return "text-emerald-300 border-emerald-500/40 bg-emerald-500/15";
  if (/review|in progress/i.test(status || "")) return "text-sky-300 border-sky-500/40 bg-sky-500/15";
  return "text-muted-foreground border-border bg-card/40";
}

function IssueRow({ item }: { item: DashboardIssueItem }) {
  const blocked = isBlocked(item);
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-colors",
        blocked ? "border-border bg-card/40" : "border-border bg-card/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground underline-offset-2 hover:underline"
              >
                {item.key}
              </a>
            ) : (
              <span className="font-semibold text-foreground">{item.key}</span>
            )}
            {blocked && (
              <Badge className="border-red-500/40 bg-red-500/15 text-red-300">Blocked</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-foreground">{item.summary}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Badge className={cn("border", priorityTone(item.priority))}>
            {item.priority || "None"}
          </Badge>
          <Badge className={cn("border", statusTone(item.status, blocked))}>
            {item.status || "Unknown"}
          </Badge>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-muted/40 px-2 py-1">Owner: {item.assignee || "Unassigned"}</span>
        {!!item.labels?.length && (
          <span className="rounded-md bg-muted/40 px-2 py-1">
            Labels: {item.labels.join(", ")}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Why selected: {item.reason}</p>
    </div>
  );
}

export default function DashboardOpsPage() {
  const { data: session, status } = useSession();
  const { workspaces } = useDashboard();
  const jiraWorkspaces = useMemo(
    () => workspaces.filter((w) => w.integrations?.jira),
    [workspaces]
  );
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [health, setHealth] = useState<IssueHealthResponse | null>(null);
  const [ledger, setLedger] = useState<BlockerLedgerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId && jiraWorkspaces.length > 0) {
      setWorkspaceId(jiraWorkspaces[0].id);
    }
  }, [jiraWorkspaces, workspaceId]);

  useEffect(() => {
    const run = async () => {
      if (status !== "authenticated" || !session?.accessToken || !workspaceId) return;
      setLoading(true);
      setError(null);
      try {
        const [h, l] = await Promise.all([
          apiFetch<IssueHealthResponse>(
            `/dashboard/issue-health?workspace_id=${workspaceId}`,
            {},
            session.accessToken
          ),
          apiFetch<BlockerLedgerResponse>(
            `/dashboard/blocker-ledger?workspace_id=${workspaceId}`,
            {},
            session.accessToken
          ),
        ]);
        setHealth(h);
        setLedger(l);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load issue ops");
        setHealth(null);
        setLedger(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [session?.accessToken, status, workspaceId]);

  return (
    <section className="pb-8">
      <div className="max-w-5xl space-y-6">
        <div className="rounded-2xl border border-border/70 bg-card/30 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
            <h1 className="font-serif text-2xl font-medium sm:text-3xl">Issue Ops</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Shared Jira reality for blockers, ownership, and top attention items.
            </p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Workspace</label>
              <select
                value={workspaceId ?? ""}
                onChange={(e) => setWorkspaceId(e.target.value || null)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:min-w-64"
              >
                {jiraWorkspaces.length === 0 ? (
                  <option value="">No Jira-connected workspace</option>
                ) : (
                  jiraWorkspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.slack_workspace_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-border bg-card/30 p-8 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            Loading issue ops…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && health && (
          <div className="rounded-2xl border border-border bg-card/30 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-medium">Issue Health Brief</h2>
              <Badge
                className={cn(
                  "border",
                  health.headline.toLowerCase().includes("risk")
                    ? "border-orange-500/40 bg-orange-500/15 text-orange-300"
                    : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                )}
              >
                {health.headline.toLowerCase().includes("risk") ? (
                  <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                )}
                {health.headline}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
              <div className="rounded-lg border border-border bg-card/40 p-2.5">
                <p className="text-xs text-muted-foreground">Focus</p>
                <p className="mt-0.5 text-sky-300 font-semibold">{health.focus_count}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/40 p-2.5">
                <p className="text-xs text-muted-foreground">Blockers</p>
                <p className="mt-0.5 text-red-300 font-semibold">{health.blockers_count}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/40 p-2.5">
                <p className="text-xs text-muted-foreground">High Priority</p>
                <p className="mt-0.5 text-orange-300 font-semibold">{health.high_priority_count}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/40 p-2.5">
                <p className="text-xs text-muted-foreground">Owned</p>
                <p className="mt-0.5 text-emerald-300 font-semibold">{health.ownership.owned}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/40 p-2.5">
                <p className="text-xs text-muted-foreground">Unowned</p>
                <p className="mt-0.5 text-amber-300 font-semibold">{health.ownership.unowned}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {(health.top_items || []).slice(0, 8).map((item) => (
                <IssueRow key={item.key} item={item} />
              ))}
            </div>
          </div>
        )}

        {!loading && ledger && (
          <div className="rounded-2xl border border-border bg-card/30 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Blocker Ledger</h2>
              <Badge className="border-red-500/40 bg-red-500/15 text-red-300">
                {ledger.total} active blockers
              </Badge>
            </div>
            {ledger.total === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                No blockers detected for this workspace.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-border bg-card/40 p-3">
                  <h3 className="text-sm font-semibold">Needs owner</h3>
                  {(ledger.needs_owner || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No unassigned blockers.</p>
                  ) : (
                    (ledger.needs_owner || []).map((item) => <IssueRow key={`n-${item.key}`} item={item} />)
                  )}
                </div>
                <div className="space-y-2 rounded-xl border border-border bg-card/40 p-3">
                  <h3 className="text-sm font-semibold">Assigned blockers</h3>
                  {(ledger.assigned || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assigned blockers.</p>
                  ) : (
                    (ledger.assigned || []).map((item) => <IssueRow key={`a-${item.key}`} item={item} />)
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

