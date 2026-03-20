/**
 * Types for dashboard API (GET /dashboard) and related endpoints.
 */

export interface DashboardAccount {
  account_id: string;
  email: string;
  name: string | null;
  plan_display_name: string;
}

export interface DashboardSubscriptionLimits {
  slack_workspaces?: number;
  requests_per_day?: number;
  messages_per_thread?: number;
  knowledge_facts?: number;
  team_members?: number;
  jira_sites?: number;
  github_orgs?: number;
  [key: string]: number | undefined;
}

export interface DashboardSubscriptionUsage {
  slack_workspaces?: number;
  requests_today?: number;
  knowledge_facts?: number;
  team_members?: number;
  [key: string]: number | undefined;
}

export interface DashboardSubscription {
  tier: string;
  status: string;
  current_period_end?: string;
  billing_period_start?: string;
  limits?: DashboardSubscriptionLimits;
  usage?: DashboardSubscriptionUsage;
}

export interface DashboardWorkspace {
  id: string;
  slack_workspace_name: string;
  slack_workspace_id?: string;
  integrations: { jira: boolean; github: boolean };
  created_at?: string;
}

export interface DashboardResponse {
  account: DashboardAccount;
  subscription: DashboardSubscription;
  workspaces: DashboardWorkspace[];
}

/** GET /subscription/usage?days=1|7|30 */
export interface SubscriptionUsageResponse {
  period_days: number;
  daily: { date: string; requests: number }[];
  total_requests: number;
}

export interface DashboardIssueItem {
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  labels: string[];
  url?: string | null;
  reason: string;
}

export interface IssueHealthResponse {
  workspace_id: string;
  workspace_name?: string;
  jira_connected: boolean;
  headline: string;
  focus_count: number;
  blockers_count: number;
  high_priority_count: number;
  ownership: { owned: number; unowned: number };
  top_items: DashboardIssueItem[];
  error?: string;
}

export interface BlockerLedgerResponse {
  workspace_id: string;
  workspace_name?: string;
  jira_connected: boolean;
  total: number;
  needs_owner: DashboardIssueItem[];
  assigned: DashboardIssueItem[];
  error?: string;
}

export interface OpsFeedItem extends DashboardIssueItem {
  event_type: "blocked" | "unowned" | "high_priority" | "stale";
  stale_days: number;
  updated_at?: string | null;
}

export interface OpsFeedResponse {
  workspace_id: string;
  workspace_name?: string;
  jira_connected: boolean;
  items: OpsFeedItem[];
  error?: string;
}

export interface GithubPrOpsItem {
  repo: string;
  number: number;
  title: string;
  author: string;
  url?: string | null;
  updated_at?: string | null;
  stale_days: number;
  assignees: string[];
  requested_reviewers: string[];
  event_type: "review_needed" | "unassigned" | "stale";
}

export interface GithubPrOpsResponse {
  workspace_id: string;
  workspace_name?: string;
  github_connected: boolean;
  repo?: string;
  items: GithubPrOpsItem[];
  error?: string;
}

export interface UnifiedOpsItem {
  source: "jira" | "github";
  id: string;
  title: string;
  subtitle: string;
  url?: string | null;
  rank: number;
  stale_days: number;
  raw?: Record<string, unknown>;
}

export interface UnifiedOpsResponse {
  workspace_id: string;
  workspace_name?: string;
  integration: "all" | "jira" | "github";
  total: number;
  items: UnifiedOpsItem[];
}
