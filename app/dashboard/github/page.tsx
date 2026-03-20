"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type {
  GithubOpsConfigResponse,
  GithubOrgsResponse,
  GithubReposResponse,
} from "@/lib/types/dashboard";

export default function DashboardGithubPage() {
  const { data: session, status } = useSession();
  const { workspaces } = useDashboard();
  const githubWorkspaces = useMemo(
    () => workspaces.filter((w) => w.integrations?.github),
    [workspaces]
  );
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GithubOpsConfigResponse | null>(null);
  const [orgs, setOrgs] = useState<GithubOrgsResponse["orgs"]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [repos, setRepos] = useState<GithubReposResponse["repos"]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");

  useEffect(() => {
    if (!workspaceId && githubWorkspaces.length > 0) {
      setWorkspaceId(githubWorkspaces[0].id);
    }
  }, [workspaceId, githubWorkspaces]);

  const load = async (targetWorkspaceId: string) => {
    if (status !== "authenticated" || !session?.accessToken || !targetWorkspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [cfg, orgRes] = await Promise.all([
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
      ]);
      setConfig(cfg);
      setOrgs(orgRes.orgs || []);

      const fallbackOrg = (orgRes.orgs || [])[0]?.login || "";
      const orgFromRepo = (cfg.default_repo || "").split("/")[0] || fallbackOrg;
      setSelectedOrg(orgFromRepo);

      if (orgFromRepo) {
        const repoRes = await apiFetch<GithubReposResponse>(
          `/dashboard/github/repos?workspace_id=${targetWorkspaceId}&org=${encodeURIComponent(orgFromRepo)}`,
          {},
          session.accessToken
        );
        setRepos(repoRes.repos || []);
      } else {
        setRepos([]);
      }
      setSelectedRepo(cfg.default_repo || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load GitHub settings");
      setConfig(null);
      setOrgs([]);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId) return;
    void load(workspaceId);
  }, [workspaceId, status, session?.accessToken]);

  const onOrgChange = async (org: string) => {
    if (!workspaceId || !session?.accessToken) return;
    setSelectedOrg(org);
    setSelectedRepo("");
    setRepos([]);
    if (!org) return;
    setLoading(true);
    setError(null);
    try {
      const repoRes = await apiFetch<GithubReposResponse>(
        `/dashboard/github/repos?workspace_id=${workspaceId}&org=${encodeURIComponent(org)}`,
        {},
        session.accessToken
      );
      setRepos(repoRes.repos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load org repos");
    } finally {
      setLoading(false);
    }
  };

  const saveDefaultRepo = async () => {
    if (!workspaceId || !session?.accessToken || !selectedRepo) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(
        "/dashboard/github/config",
        {
          method: "POST",
          body: JSON.stringify({
            workspace_id: workspaceId,
            default_repo: selectedRepo,
          }),
        },
        session.accessToken
      );
      await load(workspaceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save default repo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pb-8">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-medium sm:text-3xl">GitHub Ops Setup</h1>
          <p className="mt-2 text-muted-foreground">
            Choose org and repo to power GitHub sections in Unified Ops and Issue Ops.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/30 p-5">
          <label className="mb-1 block text-xs text-muted-foreground">Workspace</label>
          <select
            value={workspaceId ?? ""}
            onChange={(e) => setWorkspaceId(e.target.value || null)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:max-w-sm"
          >
            {githubWorkspaces.length === 0 ? (
              <option value="">No GitHub-connected workspace</option>
            ) : (
              githubWorkspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.slack_workspace_name}
                </option>
              ))
            )}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card/30 p-5 space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading GitHub data...
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">
                  Current default repo:{" "}
                  <span className="text-foreground font-medium">{config?.default_repo || "Not set"}</span>
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Organization</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => void onOrgChange(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:max-w-sm"
                >
                  <option value="">Select an org</option>
                  {orgs.map((o) => (
                    <option key={o.login} value={o.login}>
                      {o.name} ({o.login})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Repository</label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a repo</option>
                  {repos.map((r) => (
                    <option key={r.full_name} value={r.full_name}>
                      {r.full_name} {r.private ? "(private)" : "(public)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveDefaultRepo} disabled={saving || !selectedRepo}>
                  {saving ? "Saving..." : "Save Default Repo"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

