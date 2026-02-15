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
