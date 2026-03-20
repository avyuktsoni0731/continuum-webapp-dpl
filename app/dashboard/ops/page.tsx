"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  BlockerLedgerResponse,
  DashboardIssueItem,
  GithubPrOpsResponse,
  IssueHealthResponse,
  OpsFeedResponse,
  UnifiedOpsResponse,
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

interface AssignIssuePayload {
  workspace_id: string;
  issue_key: string;
  assignee_name: string;
}

interface GithubActionPayload {
  workspace_id: string;
  repo: string;
  pr_number: number;
  usernames: string[];
}

interface TeamMemberOption {
  name: string;
  aliases: string[];
  github?: string | null;
  skills: string[];
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
  const [opsFeed, setOpsFeed] = useState<OpsFeedResponse | null>(null);
  const [githubOps, setGithubOps] = useState<GithubPrOpsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignIssue, setAssignIssue] = useState<DashboardIssueItem | null>(null);
  const [assigneeInput, setAssigneeInput] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [githubActionType, setGithubActionType] = useState<"assign" | "review" | null>(null);
  const [githubActionItem, setGithubActionItem] = useState<GithubPrOpsResponse["items"][number] | null>(null);
  const [githubUserInput, setGithubUserInput] = useState("");
  const [githubSelected, setGithubSelected] = useState("");
  const [githubActing, setGithubActing] = useState(false);
  const [integrationFilter, setIntegrationFilter] = useState<"all" | "jira" | "github">("all");
  const [unifiedOps, setUnifiedOps] = useState<UnifiedOpsResponse | null>(null);

  const loadData = async (targetWorkspaceId: string) => {
    if (status !== "authenticated" || !session?.accessToken || !targetWorkspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [h, l, feed, gh, teamRes, unified] = await Promise.all([
        apiFetch<IssueHealthResponse>(
          `/dashboard/issue-health?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<BlockerLedgerResponse>(
          `/dashboard/blocker-ledger?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<OpsFeedResponse>(
          `/dashboard/ops-feed?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<GithubPrOpsResponse>(
          `/dashboard/github-pr-ops?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<{ workspace_id: string; members: TeamMemberOption[] }>(
          `/dashboard/team-members?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<UnifiedOpsResponse>(
          `/dashboard/unified-ops?workspace_id=${targetWorkspaceId}&integration=${integrationFilter}`,
          {},
          session.accessToken
        ),
      ]);
      setHealth(h);
      setLedger(l);
      setOpsFeed(feed);
      setGithubOps(gh);
      setTeamMembers(teamRes.members || []);
      setUnifiedOps(unified);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load issue ops");
      setHealth(null);
      setLedger(null);
      setOpsFeed(null);
      setGithubOps(null);
      setTeamMembers([]);
      setUnifiedOps(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId && jiraWorkspaces.length > 0) {
      setWorkspaceId(jiraWorkspaces[0].id);
    }
  }, [jiraWorkspaces, workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    void loadData(workspaceId);
  }, [session?.accessToken, status, workspaceId, integrationFilter]);

  const openAssignModal = (item: DashboardIssueItem) => {
    setAssignIssue(item);
    const guessed =
      item.assignee && item.assignee !== "Unassigned" ? item.assignee : "";
    setAssigneeInput(guessed);
    setSelectedAssignee("");
  };

  const submitAssign = async () => {
    if (!assignIssue || !workspaceId || !session?.accessToken) return;
    const assignee = (selectedAssignee || assigneeInput).trim();
    if (!assignee) {
      setError("Assignee is required.");
      return;
    }
    setAssigning(true);
    setError(null);
    try {
      const payload: AssignIssuePayload = {
        workspace_id: workspaceId,
        issue_key: assignIssue.key,
        assignee_name: assignee,
      };
      await apiFetch("/dashboard/assign", {
        method: "POST",
        body: JSON.stringify(payload),
      }, session.accessToken);
      setAssignIssue(null);
      setAssigneeInput("");
      setSelectedAssignee("");
      await loadData(workspaceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign issue");
    } finally {
      setAssigning(false);
    }
  };

  const githubHandles = useMemo(
    () =>
      teamMembers
        .map((m) => (m.github || "").trim().replace(/^@/, ""))
        .filter((v, i, arr) => !!v && arr.indexOf(v) === i),
    [teamMembers]
  );

  const unifiedActivity = useMemo(() => (unifiedOps?.items || []).slice(0, 15), [unifiedOps]);

  const openGithubModal = (item: GithubPrOpsResponse["items"][number], type: "assign" | "review") => {
    setGithubActionItem(item);
    setGithubActionType(type);
    setGithubUserInput("");
    setGithubSelected("");
  };

  const submitGithubAction = async () => {
    if (!workspaceId || !session?.accessToken || !githubActionItem || !githubActionType) return;
    const usernames = (githubSelected || githubUserInput)
      .split(",")
      .map((s) => s.trim().replace(/^@/, ""))
      .filter(Boolean);
    if (usernames.length === 0) {
      setError("Provide at least one GitHub username.");
      return;
    }
    setGithubActing(true);
    setError(null);
    try {
      const payload: GithubActionPayload = {
        workspace_id: workspaceId,
        repo: githubActionItem.repo,
        pr_number: githubActionItem.number,
        usernames,
      };
      if (githubActionType === "assign") {
        await apiFetch("/dashboard/github/assign-pr", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: payload.workspace_id,
            repo: payload.repo,
            pr_number: payload.pr_number,
            assignees: payload.usernames,
          }),
        }, session.accessToken);
      } else {
        await apiFetch("/dashboard/github/request-review", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: payload.workspace_id,
            repo: payload.repo,
            pr_number: payload.pr_number,
            reviewers: payload.usernames,
          }),
        }, session.accessToken);
      }
      setGithubActionItem(null);
      setGithubActionType(null);
      setGithubUserInput("");
      setGithubSelected("");
      await loadData(workspaceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "GitHub action failed");
    } finally {
      setGithubActing(false);
    }
  };

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
            <div className="mt-3 inline-flex rounded-lg border border-border bg-card/40 p-1">
              <button
                type="button"
                className={cn("rounded-md px-3 py-1 text-xs", integrationFilter === "all" ? "bg-muted text-foreground" : "text-muted-foreground")}
                onClick={() => setIntegrationFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={cn("rounded-md px-3 py-1 text-xs", integrationFilter === "jira" ? "bg-muted text-foreground" : "text-muted-foreground")}
                onClick={() => setIntegrationFilter("jira")}
              >
                Jira
              </button>
              <button
                type="button"
                className={cn("rounded-md px-3 py-1 text-xs", integrationFilter === "github" ? "bg-muted text-foreground" : "text-muted-foreground")}
                onClick={() => setIntegrationFilter("github")}
              >
                GitHub
              </button>
            </div>
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

        {!loading && (
          <div className="rounded-2xl border border-border bg-card/30 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Unified Activity</h2>
              <Badge className="border-border bg-card/40 text-muted-foreground">
                {unifiedActivity.length} ranked events
              </Badge>
            </div>
            {unifiedActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events for current filter.
              </p>
            ) : (
              <div className="space-y-2">
                {unifiedActivity.map((item) => (
                  <div key={`unified-${item.id}`} className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                              {item.id}
                            </a>
                          ) : (
                            item.id
                          )}{" "}
                          - {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Source: {item.source} | {item.subtitle}
                        </p>
                      </div>
                      <Badge className="border-border bg-card/40 text-muted-foreground">{item.source}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && health && integrationFilter !== "github" && (
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
                <div key={item.key} className="space-y-2">
                  <IssueRow item={item} />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => openAssignModal(item)}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && opsFeed && integrationFilter !== "github" && (
          <div className="rounded-2xl border border-border bg-card/30 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Ops Feed</h2>
              <Badge className="border-border bg-card/40 text-muted-foreground">
                {opsFeed.items.length} attention events
              </Badge>
            </div>
            {opsFeed.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No urgent events right now. Your issue stream looks stable.
              </p>
            ) : (
              <div className="space-y-2">
                {opsFeed.items.slice(0, 10).map((item) => (
                  <div key={`feed-${item.key}-${item.event_type}`} className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.key} - {item.summary}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Event: {item.event_type.replace("_", " ")} | Owner: {item.assignee || "Unassigned"} | Status: {item.status || "Unknown"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => openAssignModal(item)}>
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && githubOps && integrationFilter !== "jira" && (
          <div className="rounded-2xl border border-border bg-card/30 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">GitHub PR Ops</h2>
              <Badge className="border-border bg-card/40 text-muted-foreground">
                {githubOps.items.length} PR events
              </Badge>
            </div>
            {!githubOps.github_connected ? (
              <p className="text-sm text-muted-foreground">
                GitHub is not connected for this workspace.
              </p>
            ) : githubOps.error ? (
              <p className="text-sm text-muted-foreground">
                {githubOps.error}
              </p>
            ) : githubOps.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No PR attention events right now.
              </p>
            ) : (
              <div className="space-y-2">
                {githubOps.items.slice(0, 10).map((item) => (
                  <div key={`gh-${item.repo}-${item.number}`} className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                              {item.repo} #{item.number}
                            </a>
                          ) : (
                            <span>{item.repo} #{item.number}</span>
                          )}{" "}
                          - {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Event: {item.event_type.replace("_", " ")} | Author: {item.author} | Reviewers: {item.requested_reviewers.length || 0} | Assignees: {item.assignees.length || 0}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => openGithubModal(item, "review")}>
                          Request review
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => openGithubModal(item, "assign")}>
                          Assign PR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && ledger && integrationFilter !== "github" && (
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
                    (ledger.needs_owner || []).map((item) => (
                      <div key={`n-${item.key}`} className="space-y-2">
                        <IssueRow item={item} />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => openAssignModal(item)}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-2 rounded-xl border border-border bg-card/40 p-3">
                  <h3 className="text-sm font-semibold">Assigned blockers</h3>
                  {(ledger.assigned || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assigned blockers.</p>
                  ) : (
                    (ledger.assigned || []).map((item) => (
                      <div key={`a-${item.key}`} className="space-y-2">
                        <IssueRow item={item} />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => openAssignModal(item)}
                          >
                            Reassign
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {assignIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl">
              <h3 className="text-base font-semibold">Confirm Assignment</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Assign <span className="font-medium text-foreground">{assignIssue.key}</span> to:
              </p>
              <input
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                placeholder="Enter name or alias"
              />
              {teamMembers.length > 0 && (
                <select
                  value={selectedAssignee}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAssignee(val);
                    if (val) setAssigneeInput(val);
                  }}
                  className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">Select from team directory (optional)</option>
                  {teamMembers.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                      {m.aliases?.length ? ` (${m.aliases.join(", ")})` : ""}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Team aliases are resolved on the backend before Jira update.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (assigning) return;
                    setAssignIssue(null);
                    setAssigneeInput("");
                    setSelectedAssignee("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={submitAssign} disabled={assigning}>
                  {assigning ? "Assigning..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {githubActionItem && githubActionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl">
              <h3 className="text-base font-semibold">
                {githubActionType === "assign" ? "Assign PR" : "Request PR Review"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {githubActionItem.repo} #{githubActionItem.number}
              </p>
              <input
                value={githubUserInput}
                onChange={(e) => setGithubUserInput(e.target.value)}
                className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                placeholder="GitHub username(s), comma separated"
              />
              {githubHandles.length > 0 && (
                <select
                  value={githubSelected}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGithubSelected(val);
                    if (val) setGithubUserInput(val);
                  }}
                  className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">Select from team GitHub handles (optional)</option>
                  {githubHandles.map((h) => (
                    <option key={h} value={h}>
                      @{h}
                    </option>
                  ))}
                </select>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (githubActing) return;
                    setGithubActionItem(null);
                    setGithubActionType(null);
                    setGithubUserInput("");
                    setGithubSelected("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={submitGithubAction} disabled={githubActing}>
                  {githubActing ? "Applying..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

