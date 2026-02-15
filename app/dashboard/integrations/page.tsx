"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Slack,
  Github,
  GitBranch,
  Database,
  Layout,
  ExternalLink,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dispatchUnauthorized } from "@/lib/api";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

const INTEGRATIONS = [
  {
    id: "slack",
    name: "Slack",
    description: "Add Continuum to Slack for Cloud Agents, Bugbot, and enhanced codebase context.",
    icon: Slack,
    connectLabel: "Add to Slack",
    isSlack: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect GitHub for Cloud Agents, Bugbot and enhanced codebase context.",
    icon: Github,
    connectLabel: "Connect",
    isSlack: false,
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "Connect GitLab for Cloud Agents, Bugbot and enhanced codebase context.",
    icon: GitBranch,
    connectLabel: "Connect",
    isSlack: false,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Connect Jira for issues, sprints, and project context.",
    icon: Database,
    connectLabel: "Connect",
    isSlack: false,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Connect a Linear workspace to delegate issues to Cloud Agents.",
    icon: Layout,
    connectLabel: "Connect",
    isSlack: false,
  },
] as const;

export default function DashboardIntegrationsPage() {
  const { data: session } = useSession();
  const { workspaces, subscription, loading } = useDashboard();
  const [addingSlack, setAddingSlack] = useState(false);

  const handleAddToSlack = async () => {
    if (!session?.accessToken) return;
    setAddingSlack(true);
    try {
      const res = await fetch("/api/slack/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirect_uri: `${window.location.origin}/setup`,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatchUnauthorized();
        return;
      }
      if (data.install_url) {
        window.location.href = data.install_url;
      } else {
        throw new Error(data.error || "Failed to get install URL");
      }
    } catch (err) {
      console.error(err);
      setAddingSlack(false);
    }
  };

  const firstWorkspaceId = workspaces[0]?.id;

  /** First workspace that has this integration enabled (for "Manage" link). */
  const getWorkspaceForIntegration = (integrationId: string) => {
    if (integrationId === "github") {
      return workspaces.find((w) => w.integrations?.github);
    }
    if (integrationId === "jira") {
      return workspaces.find((w) => w.integrations?.jira);
    }
    return undefined;
  };

  const isIntegrationConnected = (integrationId: string) =>
    !!getWorkspaceForIntegration(integrationId);

  const teamMembersUsed = subscription?.usage?.team_members ?? 0;
  const teamMembersLimit = subscription?.limits?.team_members ?? 1;
  const atTeamLimit = teamMembersLimit > 0 && teamMembersUsed >= teamMembersLimit;

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
        <div>
          <h1 className="font-serif text-2xl font-medium sm:text-3xl">Integrations</h1>
          <p className="mt-2 text-muted-foreground">
            Connect your tools. Manage connections per workspace below.
          </p>
        </div>

        {/* Integration rows */}
        <div className="space-y-3">
          <h2 className="font-medium text-foreground">Services</h2>
          <div className="space-y-2 rounded-xl border border-border bg-card/30 divide-y divide-border overflow-hidden">
            {INTEGRATIONS.map(({ id, name, description, icon: Icon, connectLabel, isSlack }) => (
              <div
                key={id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{name}</h3>
                      {!isSlack && isIntegrationConnected(id) && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:pl-4">
                  {isSlack ? (
                    <Button
                      size="sm"
                      className="rounded-full bg-[#4A154B] hover:bg-[#5A1B5B] text-white/90"
                      onClick={handleAddToSlack}
                      disabled={addingSlack}
                    >
                      {addingSlack ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {connectLabel}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  ) : (() => {
                    const connected = isIntegrationConnected(id);
                    const targetWorkspace = getWorkspaceForIntegration(id) ?? workspaces[0];
                    const setupHref = targetWorkspace
                      ? `/setup?workspace_id=${targetWorkspace.id}`
                      : "/dashboard";
                    return (
                      <Link href={setupHref}>
                        <Button size="sm" variant="outline" className="rounded-full">
                          {workspaces.length === 0
                            ? "Add Slack first"
                            : connected
                              ? "Manage"
                              : connectLabel}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected workspaces */}
        <div className="space-y-3">
          <h2 className="font-medium text-foreground">Connected workspaces</h2>
          {workspaces.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/20 p-8 text-center">
              <Slack className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">
                No workspaces yet. Add Continuum to Slack above to get started.
              </p>
              <Button
                className="mt-4 rounded-full"
                onClick={handleAddToSlack}
                disabled={addingSlack}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Slack
              </Button>
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-border bg-card/30 overflow-hidden">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/setup?workspace_id=${ws.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B]/20">
                      <Slack className="h-4 w-4 text-[#4A154B]" />
                    </div>
                    <span className="font-medium">{ws.slack_workspace_name}</span>
                    <div className="flex gap-1.5">
                      {ws.integrations?.jira && (
                        <Badge variant="outline" className="text-xs">
                          Jira
                        </Badge>
                      )}
                      {ws.integrations?.github && (
                        <Badge variant="outline" className="text-xs">
                          GitHub
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Invite Team Members */}
        <div className="rounded-xl border border-border bg-card/50 p-6">
          <h2 className="font-medium text-foreground">Invite team members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accelerate your team with admin controls, analytics, and enterprise-grade security.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {teamMembersUsed} / {teamMembersLimit} members
            </span>
            {atTeamLimit ? (
              <Link href="/pricing">
                <Button size="sm" className="rounded-full">
                  Upgrade for more members
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full" disabled>
                Invite your team (coming soon)
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
