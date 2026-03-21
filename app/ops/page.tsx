"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Loader2,
  ShieldAlert,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  BlockerLedgerResponse,
  DashboardIssueItem,
  GithubOpsConfigResponse,
  GithubOrgsResponse,
  GithubPrOpsResponse,
  GithubReposResponse,
  IssueHealthResponse,
  OpsFeedResponse,
  UnifiedOpsBriefResponse,
  UnifiedOpsItem,
  UnifiedOpsResponse,
} from "@/lib/types/dashboard";
import {
  eventLabel,
  parseSubtitleChips,
  parseUnifiedId,
  shortRepoLabel,
  splitBriefLines,
} from "@/lib/ops-format";
import Image from "next/image";

/** Shows ~3 dense rows; remaining items scroll inside (keeps page height manageable). */
function OpsScrollList({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  /** Taller rows (e.g. IssueRow + actions) — still ~3 visible. */
  variant?: "default" | "tall";
}) {
  return (
    <div
      className={cn(
        "min-h-0 touch-pan-y space-y-2 overflow-y-auto overscroll-y-auto rounded-md pr-1 [-webkit-overflow-scrolling:touch]",
        variant === "tall"
          ? "max-h-[min(55vh,32rem)]"
          : "max-h-[min(50vh,24rem)]",
        className
      )}
    >
      {children}
    </div>
  );
}

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
  const statusText = item.status || "Unknown";
  /** Avoid duplicate “Blocked” when status already reads blocked */
  const showBlockedChip = blocked && !/blocked/i.test(statusText);
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 transition-colors",
        blocked ? "border-border bg-card/40" : "border-border bg-card/30"
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-foreground underline-offset-2 hover:underline"
            >
              {item.key}
            </a>
          ) : (
            <span className="text-sm font-semibold text-foreground">{item.key}</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-foreground">{item.summary}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {showBlockedChip && (
          <Badge className="border-red-500/40 bg-red-500/15 text-[10px] text-red-300">Blocked</Badge>
        )}
        <Badge className={cn("border text-[10px]", priorityTone(item.priority))}>
          {item.priority || "None"}
        </Badge>
        <Badge className={cn("border text-[10px]", statusTone(item.status, blocked))}>
          {statusText}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
        <span className="rounded bg-muted/40 px-1.5 py-0.5">Owner: {item.assignee || "Unassigned"}</span>
        {!!item.labels?.length && (
          <span className="min-w-0 max-w-full break-words rounded bg-muted/40 px-1.5 py-0.5">
            Labels: {item.labels.join(", ")}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
        <span className="text-muted-foreground/70">Why:</span> {item.reason}
      </p>
    </div>
  );
}

function MetaChips({ subtitle }: { subtitle: string }) {
  const chips = parseSubtitleChips(subtitle);
  if (chips.length === 0) {
    return <p className="break-words text-xs leading-relaxed text-muted-foreground">{subtitle}</p>;
  }
  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={`${c.label}-${c.value}`}
          className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] shadow-sm"
        >
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-violet-300/90">
            {c.label}
          </span>
          <span className="min-w-0 break-words text-foreground/90">{c.value}</span>
        </span>
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: "jira" | "github" }) {
  if (source === "jira") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/35 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200">
        <Ticket className="h-3 w-3" />
        Jira
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/35 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
      <GitBranch className="h-3 w-3" />
      GitHub
    </span>
  );
}

function githubPrMetaLine(item: GithubPrOpsResponse["items"][number]) {
  return `Event: ${eventLabel(item.event_type)} | Author: ${item.author} | Reviewers: ${item.requested_reviewers.length} | Assignees: ${item.assignees.length}`;
}

/** Compact title line for unified list rows (short repo + PR# or Jira key). */
function UnifiedRowHeading({
  item,
  linkUrl,
}: {
  item: UnifiedOpsItem;
  linkUrl?: string | null;
}) {
  const parsed = parseUnifiedId(item.id);
  const inner =
    parsed.source === "github" ? (
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-mono text-xs text-violet-300/90" title={item.id.replace(/^github:/, "")}>
          {parsed.secondary}
        </span>
        <span className="font-semibold text-foreground">{parsed.primary}</span>
      </span>
    ) : (
      <span className="font-semibold text-sky-200">{parsed.primary}</span>
    );
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge source={parsed.source} />
          {linkUrl ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 underline-offset-2 hover:underline"
            >
              {inner}
            </a>
          ) : (
            inner
          )}
        </div>
        <p className="mt-1 text-sm font-medium leading-snug text-foreground line-clamp-1">{item.title}</p>
      </div>
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
  const opsWorkspaces = useMemo(
    () => workspaces.filter((w) => w.integrations?.jira || w.integrations?.github),
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
  const [githubConfig, setGithubConfig] = useState<GithubOpsConfigResponse | null>(null);
  const [githubOrgs, setGithubOrgs] = useState<GithubOrgsResponse["orgs"]>([]);
  const [githubRepos, setGithubRepos] = useState<GithubReposResponse["repos"]>([]);
  const [repoSource, setRepoSource] = useState<"org" | "personal">("org");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoSaving, setRepoSaving] = useState(false);
  const [opsBrief, setOpsBrief] = useState<UnifiedOpsBriefResponse | null>(null);
  const [briefRefreshing, setBriefRefreshing] = useState(false);

  const loadData = async (targetWorkspaceId: string) => {
    if (status !== "authenticated" || !session?.accessToken || !targetWorkspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [h, l, feed, gh, teamRes, unified, ghCfg, ghOrgs, brief] = await Promise.all([
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
        apiFetch<GithubOpsConfigResponse>(
          `/dashboard/github/config?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<GithubOrgsResponse>(
          `/dashboard/github/orgs?workspace_id=${targetWorkspaceId}`,
          {},
          session.accessToken
        ),
        apiFetch<UnifiedOpsBriefResponse>(
          `/dashboard/unified-ops/brief?workspace_id=${targetWorkspaceId}&integration=${integrationFilter}`,
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
      setGithubConfig(ghCfg);
      setOpsBrief(brief);
      const orgs = ghOrgs.orgs || [];
      setGithubOrgs(orgs);
      const orgFromCfg = (ghCfg.default_repo || "").split("/")[0] || "";
      const orgFallback = orgs[0]?.login || "";
      const hasOrgMatch = !!orgFromCfg && orgs.some((o) => o.login === orgFromCfg);
      const resolvedSource: "org" | "personal" = hasOrgMatch || !!orgFallback ? "org" : "personal";
      setRepoSource(resolvedSource);
      const resolvedOrg = resolvedSource === "org" ? (orgFromCfg || orgFallback) : "";
      setSelectedOrg(resolvedOrg);
      setSelectedRepo(ghCfg.default_repo || "");
      if (resolvedSource === "org" && resolvedOrg) {
        await loadReposForOrg(resolvedOrg, targetWorkspaceId);
      } else {
        await loadPersonalRepos(targetWorkspaceId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load issue ops");
      setHealth(null);
      setLedger(null);
      setOpsFeed(null);
      setGithubOps(null);
      setTeamMembers([]);
      setUnifiedOps(null);
      setGithubConfig(null);
      setGithubOrgs([]);
      setGithubRepos([]);
      setOpsBrief(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId && opsWorkspaces.length > 0) {
      setWorkspaceId(opsWorkspaces[0].id);
    }
  }, [opsWorkspaces, workspaceId]);

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

  const unifiedActivity = useMemo(() => unifiedOps?.items || [], [unifiedOps]);
  const unifiedSummary = unifiedOps?.summary;
  const topRiskItems = useMemo(
    () =>
      (unifiedSummary?.top_risks || [])
        .map((risk) => (unifiedOps?.items || []).find((item) => item.id === risk.id))
        .filter((item): item is NonNullable<typeof item> => !!item),
    [unifiedOps?.items, unifiedSummary?.top_risks]
  );

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

  const loadReposForOrg = async (orgLogin: string, targetWorkspaceId?: string) => {
    const wsId = targetWorkspaceId || workspaceId;
    if (!wsId || !session?.accessToken || !orgLogin) return;
    try {
      const reposRes = await apiFetch<GithubReposResponse>(
        `/dashboard/github/repos?workspace_id=${wsId}&org=${encodeURIComponent(orgLogin)}`,
        {},
        session.accessToken
      );
      setGithubRepos(reposRes.repos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load repos");
      setGithubRepos([]);
    }
  };

  const loadPersonalRepos = async (targetWorkspaceId?: string) => {
    const wsId = targetWorkspaceId || workspaceId;
    if (!wsId || !session?.accessToken) return;
    try {
      const reposRes = await apiFetch<GithubReposResponse>(
        `/dashboard/github/repos?workspace_id=${wsId}`,
        {},
        session.accessToken
      );
      setGithubRepos(reposRes.repos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load personal repos");
      setGithubRepos([]);
    }
  };

  const saveGithubRepo = async () => {
    if (!workspaceId || !session?.accessToken || !selectedRepo) return;
    setRepoSaving(true);
    setError(null);
    try {
      await apiFetch(
        "/dashboard/github/config",
        {
          method: "POST",
          body: JSON.stringify({ workspace_id: workspaceId, default_repo: selectedRepo }),
        },
        session.accessToken
      );
      await loadData(workspaceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save default repo");
    } finally {
      setRepoSaving(false);
    }
  };

  const refreshOpsBrief = async () => {
    if (!workspaceId || !session?.accessToken) return;
    setBriefRefreshing(true);
    setError(null);
    try {
      const updated = await apiFetch<UnifiedOpsBriefResponse>(
        `/dashboard/unified-ops/brief/refresh?workspace_id=${workspaceId}&integration=${integrationFilter}`,
        { method: "POST" },
        session.accessToken
      );
      setOpsBrief(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh brief");
    } finally {
      setBriefRefreshing(false);
    }
  };

  const sidebarVisible = integrationFilter !== "github";

  const briefDisplayLines = useMemo(() => {
    const raw = opsBrief?.text?.trim() || "";
    if (!raw) return ["Daily AI brief is being prepared."];
    const lines = splitBriefLines(raw);
    return lines.length ? lines : [raw];
  }, [opsBrief?.text]);

  return (
    <section className="relative min-h-screen min-w-0 overflow-x-hidden pb-8 pt-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      />
      <div className="relative mx-auto min-w-0 max-w-7xl space-y-4 px-3 sm:space-y-5 sm:px-6">
        <div className="rounded-2xl border border-border/70 bg-card/50 p-4 shadow-xl shadow-black/25 ring-1 ring-white/5 backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                Command center
              </p>
              <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Unified Ops</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Blockers, ownership, and merge flow across Jira and GitHub—at a glance.
              </p>
              <div className="mt-4 inline-flex max-w-full flex-wrap rounded-xl border border-border/80 bg-muted/30 p-1">
                <button
                  type="button"
                  className={cn(
                    "min-h-[40px] min-w-[4.5rem] flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:min-w-0 sm:flex-none",
                    integrationFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIntegrationFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={cn(
                    "min-h-[40px] min-w-[4.5rem] flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:min-w-0 sm:flex-none",
                    integrationFilter === "jira" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIntegrationFilter("jira")}
                >
                  Jira
                </button>
                <button
                  type="button"
                  className={cn(
                    "min-h-[40px] min-w-[4.5rem] flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:min-w-0 sm:flex-none",
                    integrationFilter === "github" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIntegrationFilter("github")}
                >
                  GitHub
                </button>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Workspace</label>
              <select
                value={workspaceId ?? ""}
                onChange={(e) => setWorkspaceId(e.target.value || null)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-inner sm:min-w-64"
              >
                {opsWorkspaces.length === 0 ? (
                  <option value="">No workspace with Jira/GitHub connected</option>
                ) : (
                  opsWorkspaces.map((w) => (
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
          <div className="rounded-xl border border-border bg-card/40 p-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />
            Loading ops data…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && (
          <>
            <div className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/10 via-card/60 to-card/30 p-4 shadow-lg ring-1 ring-indigo-500/10 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center">
                  <Image src="/Continuum_Ops_AI_Full_Logo_2.png" alt="Continuum Ops AI Logo" width={200} height={12} />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full shrink-0 rounded-full sm:w-auto"
                  onClick={refreshOpsBrief}
                  disabled={briefRefreshing || (opsBrief?.refresh_remaining ?? 0) <= 0}
                >
                  {briefRefreshing ? "Refreshing…" : "Refresh"}
                </Button>
              </div>
              <OpsScrollList className="mt-3 space-y-0">
                <ul className="space-y-1.5 border-t border-border/50 pt-3 text-sm leading-relaxed text-foreground/90">
                  {briefDisplayLines.map((line, i) => (
                    <li key={i} className="flex min-w-0 gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400/80" aria-hidden />
                      <span className="min-w-0 break-words">{line}</span>
                    </li>
                  ))}
                </ul>
              </OpsScrollList>
              <p className="mt-4 text-xs text-muted-foreground">
                Generated {opsBrief?.generated_at ? new Date(opsBrief.generated_at).toLocaleString() : "—"} · Refreshes left today:{" "}
                <span className="font-medium text-foreground">{opsBrief?.refresh_remaining ?? 0}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3 ring-1 ring-inset ring-red-500/10">
                <p className="text-[11px] font-medium text-muted-foreground">Critical attention</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-red-300">{unifiedSummary?.kpis.critical ?? 0}</p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 ring-1 ring-inset ring-amber-500/10">
                <p className="text-[11px] font-medium text-muted-foreground">Needs owner</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-amber-300">{unifiedSummary?.kpis.needs_owner ?? 0}</p>
              </div>
              <div className="rounded-lg border border-orange-500/25 bg-orange-500/5 p-3 ring-1 ring-inset ring-orange-500/10">
                <p className="text-[11px] font-medium text-muted-foreground">Stale</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-orange-300">{unifiedSummary?.kpis.stale ?? 0}</p>
              </div>
              <div className="rounded-lg border border-sky-500/25 bg-sky-500/5 p-3 ring-1 ring-inset ring-sky-500/10">
                <p className="text-[11px] font-medium text-muted-foreground">High priority</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-sky-300">{unifiedSummary?.kpis.high_priority ?? 0}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm break-words text-muted-foreground">
              {unifiedSummary?.insight || "Unified command-center insight will appear here once data is available."}
            </div>
          </>
        )}

        {!loading && (
          <div
            className={cn(
              "grid min-w-0 gap-4 lg:gap-6",
              sidebarVisible ? "lg:grid-cols-12" : "lg:grid-cols-1"
            )}
          >
            <div className={cn("min-w-0 space-y-4", sidebarVisible ? "lg:col-span-8" : "lg:col-span-12")}>
              {topRiskItems.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/5 to-card/40 p-4 shadow-lg ring-1 ring-amber-500/10">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                    <div className="min-w-0">
                      <h2 className="font-serif text-base font-semibold text-foreground sm:text-lg">Top risks</h2>
                      <p className="text-xs text-muted-foreground">Highest-impact items for the current filter</p>
                    </div>
                    <Badge className="w-fit shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-100">
                      {topRiskItems.length} prioritized
                    </Badge>
                  </div>
                  <OpsScrollList>
                    {topRiskItems.map((item) => {
                      const raw = (item.raw || {}) as Record<string, unknown>;
                      const isJira = item.source === "jira";
                      const isGithub = item.source === "github";
                      return (
                        <div key={`risk-${item.id}`} className="rounded-xl border border-border/80 bg-card/50 p-3 shadow-sm">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <UnifiedRowHeading item={item} linkUrl={item.url} />
                              <div className="mt-2 border-t border-border/40 pt-2">
                                <MetaChips subtitle={item.subtitle} />
                              </div>
                            </div>
                            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                              {isJira && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full rounded-full sm:w-auto"
                                  onClick={() =>
                                    openAssignModal({
                                      key: String(raw.key || item.id.replace(/^jira:/, "")),
                                      summary: String(raw.summary || item.title),
                                      status: String(raw.status || ""),
                                      priority: String(raw.priority || ""),
                                      assignee: String(raw.assignee || ""),
                                      labels: Array.isArray(raw.labels) ? (raw.labels as string[]) : [],
                                      url: typeof raw.url === "string" ? raw.url : item.url,
                                      reason: String(raw.reason || item.subtitle),
                                    })
                                  }
                                >
                                  Assign
                                </Button>
                              )}
                              {isGithub && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full rounded-full sm:w-auto"
                                    onClick={() =>
                                      openGithubModal(
                                        {
                                          repo: String(raw.repo || ""),
                                          number: Number(raw.number || 0),
                                          title: String(raw.title || item.title),
                                          author: String(raw.author || "Unknown"),
                                          url: typeof raw.url === "string" ? raw.url : item.url,
                                          updated_at: typeof raw.updated_at === "string" ? raw.updated_at : null,
                                          stale_days: Number(raw.stale_days || item.stale_days || 0),
                                          assignees: Array.isArray(raw.assignees) ? (raw.assignees as string[]) : [],
                                          requested_reviewers: Array.isArray(raw.requested_reviewers)
                                            ? (raw.requested_reviewers as string[])
                                            : [],
                                          event_type:
                                            (String(raw.event_type || "review_needed") as GithubPrOpsResponse["items"][number]["event_type"]),
                                        },
                                        "review"
                                      )
                                    }
                                  >
                                    Request review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full rounded-full sm:w-auto"
                                    onClick={() =>
                                      openGithubModal(
                                        {
                                          repo: String(raw.repo || ""),
                                          number: Number(raw.number || 0),
                                          title: String(raw.title || item.title),
                                          author: String(raw.author || "Unknown"),
                                          url: typeof raw.url === "string" ? raw.url : item.url,
                                          updated_at: typeof raw.updated_at === "string" ? raw.updated_at : null,
                                          stale_days: Number(raw.stale_days || item.stale_days || 0),
                                          assignees: Array.isArray(raw.assignees) ? (raw.assignees as string[]) : [],
                                          requested_reviewers: Array.isArray(raw.requested_reviewers)
                                            ? (raw.requested_reviewers as string[])
                                            : [],
                                          event_type:
                                            (String(raw.event_type || "unassigned") as GithubPrOpsResponse["items"][number]["event_type"]),
                                        },
                                        "assign"
                                      )
                                    }
                                  >
                                    Assign PR
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </OpsScrollList>
                </div>
              )}

              <div className="rounded-2xl border border-cyan-500/15 bg-card/40 p-4 shadow-xl shadow-black/10 ring-1 ring-cyan-500/10">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg font-semibold">Unified activity</h2>
                    <p className="text-xs text-muted-foreground">Ranked events across Jira and GitHub</p>
                  </div>
                  <Badge className="w-fit shrink-0 border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                    {unifiedActivity.length} ranked events
                  </Badge>
                </div>
                {unifiedActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events for current filter.</p>
                ) : (
                  <OpsScrollList>
                    {unifiedActivity.map((item) => (
                      <div key={`unified-${item.id}`} className="rounded-xl border border-border/80 bg-card/50 p-3">
                        <UnifiedRowHeading item={item} linkUrl={item.url} />
                        <div className="mt-2 border-t border-border/40 pt-2">
                          <MetaChips subtitle={`Source: ${item.source} | ${item.subtitle}`} />
                        </div>
                      </div>
                    ))}
                  </OpsScrollList>
                )}
              </div>

              {githubOps && integrationFilter !== "jira" && (
                <div className="rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/5 to-card/40 p-4 shadow-lg ring-1 ring-violet-500/10">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg font-semibold">GitHub PR ops</h2>
                      <p className="text-xs text-muted-foreground">Pull requests needing attention</p>
                    </div>
                    <Badge className="w-fit shrink-0 border-violet-500/30 bg-violet-500/10 text-violet-100">
                      {githubOps.items.length} PR events
                    </Badge>
                  </div>
                  <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border/80 bg-card/40 p-3 sm:grid-cols-2 md:grid-cols-3">
                    <select
                      value={repoSource}
                      onChange={(e) => {
                        const val = e.target.value as "org" | "personal";
                        setRepoSource(val);
                        setSelectedRepo("");
                        if (val === "org") {
                          const nextOrg = selectedOrg || githubOrgs[0]?.login || "";
                          setSelectedOrg(nextOrg);
                          if (nextOrg) {
                            void loadReposForOrg(nextOrg);
                          } else {
                            setGithubRepos([]);
                          }
                        } else {
                          setSelectedOrg("");
                          void loadPersonalRepos();
                        }
                      }}
                      className="min-w-0 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="org">Organization repos</option>
                      <option value="personal">Personal/all accessible repos</option>
                    </select>
                    <select
                      value={selectedOrg}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedOrg(val);
                        setSelectedRepo("");
                        if (val) void loadReposForOrg(val);
                      }}
                      disabled={repoSource !== "org"}
                      className="min-w-0 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">{repoSource === "org" ? "Select org" : "Org not required"}</option>
                      {githubOrgs.map((o) => (
                        <option key={o.login} value={o.login}>
                          {o.name} ({o.login})
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="min-w-0 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select repo</option>
                      {githubRepos.map((r) => (
                        <option key={r.full_name} value={r.full_name}>
                          {r.full_name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={saveGithubRepo}
                      disabled={repoSaving || !selectedRepo}
                      className="w-full min-h-[40px] sm:min-h-0 md:col-span-1 md:w-auto"
                    >
                      {repoSaving ? "Saving..." : "Set Default Repo"}
                    </Button>
                    <p className="text-xs text-muted-foreground sm:col-span-2 md:col-span-3">
                      Current default: <span className="text-foreground">{githubConfig?.default_repo || "Not set"}</span>
                    </p>
                    {repoSource === "org" && githubOrgs.length === 0 && (
                      <p className="text-xs text-muted-foreground sm:col-span-2 md:col-span-3">
                        No orgs visible for this token. Switch to Personal/all accessible repos or reconnect GitHub with org access.
                      </p>
                    )}
                  </div>
                  {!githubOps.github_connected ? (
                    <p className="text-sm text-muted-foreground">GitHub is not connected for this workspace.</p>
                  ) : githubOps.error ? (
                    <p className="text-sm text-muted-foreground">{githubOps.error}</p>
                  ) : githubOps.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No PR attention events right now.</p>
                  ) : (
                    <OpsScrollList>
                      {githubOps.items.map((item) => (
                        <div key={`gh-${item.repo}-${item.number}`} className="rounded-xl border border-border/80 bg-card/50 p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <SourceBadge source="github" />
                                {item.url ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-violet-200 underline-offset-2 hover:underline"
                                  >
                                    #{item.number}
                                  </a>
                                ) : (
                                  <span className="font-semibold text-violet-200">#{item.number}</span>
                                )}
                                <span
                                  className="min-w-0 max-w-full break-all font-mono text-xs text-muted-foreground sm:max-w-[min(100%,220px)] sm:truncate"
                                  title={item.repo}
                                >
                                  {shortRepoLabel(item.repo)}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
                              <div className="mt-2 border-t border-border/40 pt-2">
                                <MetaChips subtitle={githubPrMetaLine(item)} />
                              </div>
                            </div>
                            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-full sm:w-auto"
                                onClick={() => openGithubModal(item, "review")}
                              >
                                Request review
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-full sm:w-auto"
                                onClick={() => openGithubModal(item, "assign")}
                              >
                                Assign PR
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </OpsScrollList>
                  )}
                </div>
              )}

            </div>

            {sidebarVisible && (
              <aside className="min-w-0 space-y-4 lg:col-span-4 lg:pr-1">
                {health && (
                  <div className="rounded-2xl border border-border/80 bg-card/40 p-4 shadow-sm">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <h2 className="min-w-0 shrink-0 font-serif text-lg font-semibold">Issue health</h2>
                      <Badge
                        className={cn(
                          "w-fit max-w-full items-start justify-start gap-1 whitespace-normal text-left wrap-break-word sm:max-w-[min(100%,18rem)]",
                          "border",
                          health.headline.toLowerCase().includes("risk")
                            ? "border-orange-500/40 bg-orange-500/15 text-orange-300"
                            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        )}
                      >
                        {health.headline.toLowerCase().includes("risk") ? (
                          <ShieldAlert className="mr-1 h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5 shrink-0" />
                        )}
                        {health.headline}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="rounded-md border border-border bg-card/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Focus</p>
                          <p className="mt-0.5 text-base font-semibold tabular-nums text-sky-300">{health.focus_count}</p>
                        </div>
                        <div className="rounded-md border border-border bg-card/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Blockers</p>
                          <p className="mt-0.5 text-base font-semibold tabular-nums text-red-300">{health.blockers_count}</p>
                        </div>
                        <div className="rounded-md border border-border bg-card/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">High</p>
                          <p className="mt-0.5 text-base font-semibold tabular-nums text-orange-300">{health.high_priority_count}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="rounded-md border border-border bg-card/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Owned</p>
                          <p className="mt-0.5 text-base font-semibold tabular-nums text-emerald-300">{health.ownership.owned}</p>
                        </div>
                        <div className="rounded-md border border-border bg-card/40 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Unowned</p>
                          <p className="mt-0.5 text-base font-semibold tabular-nums text-amber-300">{health.ownership.unowned}</p>
                        </div>
                      </div>
                    </div>
                    <OpsScrollList variant="tall" className="mt-3">
                      {(health.top_items || []).map((item) => (
                        <div key={item.key} className="space-y-1.5">
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
                    </OpsScrollList>
                  </div>
                )}

                {opsFeed && (
                  <div className="rounded-2xl border border-border/80 bg-card/40 p-4 shadow-sm">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="min-w-0 font-serif text-lg font-semibold">Ops feed</h2>
                      <Badge className="w-fit shrink-0 border-border bg-card/40 text-muted-foreground">
                        {opsFeed.items.length} attention events
                      </Badge>
                    </div>
                    {opsFeed.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No urgent events right now. Your issue stream looks stable.
                      </p>
                    ) : integrationFilter === "all" ? (
                      <details open className="group rounded-xl border border-border/60 bg-card/30">
                        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                          Attention events ({opsFeed.items.length}) — may overlap unified activity
                        </summary>
                        <div className="border-t border-border/50 p-2 pt-2">
                          <OpsScrollList>
                            {opsFeed.items.map((item) => (
                              <div key={`feed-${item.key}-${item.event_type}`} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <p className="break-words text-sm font-medium text-foreground">
                                      {item.key} — {item.summary}
                                    </p>
                                    <div className="mt-2">
                                      <MetaChips
                                        subtitle={`Event: ${eventLabel(item.event_type)} | Owner: ${item.assignee || "Unassigned"} | Status: ${item.status || "Unknown"}`}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full shrink-0 rounded-full sm:w-auto"
                                    onClick={() => openAssignModal(item)}
                                  >
                                    Assign
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </OpsScrollList>
                        </div>
                      </details>
                    ) : (
                      <OpsScrollList>
                        {opsFeed.items.map((item) => (
                          <div key={`feed-${item.key}-${item.event_type}`} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-medium text-foreground">
                                  {item.key} — {item.summary}
                                </p>
                                <div className="mt-2">
                                  <MetaChips
                                    subtitle={`Event: ${eventLabel(item.event_type)} | Owner: ${item.assignee || "Unassigned"} | Status: ${item.status || "Unknown"}`}
                                  />
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full shrink-0 rounded-full sm:w-auto"
                                onClick={() => openAssignModal(item)}
                              >
                                Assign
                              </Button>
                            </div>
                          </div>
                        ))}
                      </OpsScrollList>
                    )}
                  </div>
                )}

                {ledger && (
                  <div className="rounded-2xl border border-red-500/15 bg-card/40 p-4 shadow-sm ring-1 ring-red-500/10">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="min-w-0 font-serif text-lg font-semibold">Blocker ledger</h2>
                      <Badge className="w-fit shrink-0 border-red-500/40 bg-red-500/15 text-red-300">
                        {ledger.total} active blockers
                      </Badge>
                    </div>
                    {ledger.total === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        No blockers detected for this workspace.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card/40 p-2.5">
                          <h3 className="text-sm font-semibold">Needs owner</h3>
                          {(ledger.needs_owner || []).length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No unassigned blockers.</p>
                          ) : (
                            <OpsScrollList variant="tall" className="mt-2">
                              {(ledger.needs_owner || []).map((item) => (
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
                              ))}
                            </OpsScrollList>
                          )}
                        </div>
                        <div className="rounded-xl border border-border bg-card/40 p-2.5">
                          <h3 className="text-sm font-semibold">Assigned blockers</h3>
                          {(ledger.assigned || []).length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">No assigned blockers.</p>
                          ) : (
                            <OpsScrollList variant="tall" className="mt-2">
                              {(ledger.assigned || []).map((item) => (
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
                              ))}
                            </OpsScrollList>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </aside>
            )}
          </div>
        )}

        {assignIssue && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
            <div className="max-h-[90vh] w-full max-w-md touch-pan-y overflow-y-auto overscroll-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl">
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
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (assigning) return;
                    setAssignIssue(null);
                    setAssigneeInput("");
                    setSelectedAssignee("");
                  }}
                >
                  Cancel
                </Button>
                <Button className="w-full sm:w-auto" onClick={submitAssign} disabled={assigning}>
                  {assigning ? "Assigning..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {githubActionItem && githubActionType && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
            <div className="max-h-[90vh] w-full max-w-md touch-pan-y overflow-y-auto overscroll-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl">
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
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
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
                <Button className="w-full sm:w-auto" onClick={submitGithubAction} disabled={githubActing}>
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

