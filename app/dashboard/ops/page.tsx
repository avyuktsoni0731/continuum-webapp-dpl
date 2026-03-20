"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { apiFetch } from "@/lib/api";
import type {
  BlockerLedgerResponse,
  DashboardIssueItem,
  IssueHealthResponse,
} from "@/lib/types/dashboard";
import { useEffect } from "react";

function IssueRow({ item }: { item: DashboardIssueItem }) {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-3">
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
      </div>
      <p className="mt-1 text-sm text-foreground">{item.summary}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Status: {item.status || "—"} • Priority: {item.priority || "—"} • Owner:{" "}
        {item.assignee || "Unassigned"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Why: {item.reason}</p>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-medium sm:text-3xl">Issue Ops</h1>
            <p className="mt-1 text-muted-foreground">
              Shared Jira reality for blockers, ownership, and top attention items.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Workspace</label>
            <select
              value={workspaceId ?? ""}
              onChange={(e) => setWorkspaceId(e.target.value || null)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
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
          <div className="rounded-xl border border-border bg-card/30 p-5">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-medium">Issue Health Brief</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {health.headline}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
              <div className="rounded-md border border-border p-2">Focus: {health.focus_count}</div>
              <div className="rounded-md border border-border p-2">Blockers: {health.blockers_count}</div>
              <div className="rounded-md border border-border p-2">High priority: {health.high_priority_count}</div>
              <div className="rounded-md border border-border p-2">Owned: {health.ownership.owned}</div>
              <div className="rounded-md border border-border p-2">Unowned: {health.ownership.unowned}</div>
            </div>
            <div className="mt-4 space-y-2">
              {(health.top_items || []).slice(0, 8).map((item) => (
                <IssueRow key={item.key} item={item} />
              ))}
            </div>
          </div>
        )}

        {!loading && ledger && (
          <div className="rounded-xl border border-border bg-card/30 p-5">
            <h2 className="mb-3 font-medium">Blocker Ledger</h2>
            {ledger.total === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                No blockers detected for this workspace.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Needs owner</h3>
                  {(ledger.needs_owner || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No unassigned blockers.</p>
                  ) : (
                    (ledger.needs_owner || []).map((item) => <IssueRow key={`n-${item.key}`} item={item} />)
                  )}
                </div>
                <div className="space-y-2">
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

