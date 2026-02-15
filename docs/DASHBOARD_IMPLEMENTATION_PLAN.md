# Dashboard Implementation Plan

This plan aligns the Continuum webapp dashboard with the Cursor-style dashboard (screenshots) and the updated backend API. It covers layout, pages, API usage, and component-level tasks.

---

## 1. Current state vs target

| Area | Current | Target |
|------|---------|--------|
| **Dashboard layout** | Single full-width page, no sidebar | Sidebar with user info + nav; main content area |
| **Data loading** | Separate `GET /workspaces` + `GET /subscription` | Overview uses `GET /dashboard` (single call); other pages use specific endpoints |
| **Navigation** | Links to pricing/home only | Overview, Usage, Integrations, Billing & Invoices (and optional Settings, Members) |
| **Plan display** | Badge only | Plan cards (upgrade options + current plan) with “Current” tag |
| **Usage** | None | Usage page: chart (1d/7d/30d), table, Export CSV |
| **Integrations** | Workspaces list on main page | Dedicated Integrations page (workspaces + connect actions, optional “Invite team”) |
| **Billing** | Link to pricing | Billing & Invoices page (period, included usage, invoices if backend supports) |

---

## 2. API usage summary

| Page / action | Endpoint(s) | Notes |
|---------------|-------------|--------|
| **Overview** | `GET /dashboard` | Single call: account, subscription (full + usage), workspaces |
| **Usage** | `GET /subscription`, `GET /subscription/usage?days=1\|7\|30` | Subscription for limits/period; usage for chart + table |
| **Export CSV** | `GET /subscription/usage/export?days=30` | Proxy via API route; return CSV with download disposition |
| **Integrations** | `GET /workspaces` | Already used; add Integrations page that consumes it |
| **Plan cards (any page)** | `GET /plans` (or local pricing data) + current tier from `GET /dashboard` or `GET /subscription` | Mark “Current” from `subscription.tier` or `account.plan_display_name` |
| **Sidebar (plan / user)** | From `GET /dashboard.account` or `GET /auth/me` | `account.name`, `account.email`, `account.plan_display_name` |

---

## 3. Suggested implementation order

### Phase 1: Layout and data foundation

1. **Dashboard layout with sidebar**
   - Add `app/dashboard/layout.tsx` that:
     - Wraps all `/dashboard` and `/dashboard/*` routes.
     - Renders a **sidebar** (left) and a **main content** area (right).
     - Sidebar: user block (name, `plan_display_name`, email) + nav links (Overview, Usage, Integrations, Billing & Invoices; optionally Settings, Members, Docs, Contact).
     - Fetches **account** (and optionally subscription) for sidebar once (e.g. via `GET /dashboard` or `GET /auth/me`), and passes down or provides via a small dashboard context.
   - Ensure middleware still protects `/dashboard` and `/dashboard/*` (existing matcher is fine).

2. **Use `GET /dashboard` on Overview**
   - Replace current dashboard page’s dual fetch with a single `GET /dashboard`.
   - Types: `account` (`account_id`, `email`, `name`, `plan_display_name`), `subscription` (full object including `billing_period_start`, `limits`, `usage`, `current_period_end`, etc.), `workspaces` (array with `id`, `slack_workspace_name`, `integrations.jira`, `integrations.github`).
   - Keep existing behavior: Razorpay success params → `POST /api/subscription/confirm` → replace URL → refetch. Prefer refetching via `GET /dashboard` so the layout/sidebar and Overview both see updated subscription.

3. **Optional: `GET /auth/me` for sidebar-only**
   - If you want the sidebar to load with minimal data (e.g. no workspaces), you can use `GET /auth/me` in the layout just for `plan_display_name` and name/email. Otherwise, using `GET /dashboard` in the layout (or on Overview and lifting account to layout) is enough.

### Phase 2: Overview page content

4. **Overview page structure**
   - **Route:** `app/dashboard/page.tsx` (or `app/dashboard/overview/page.tsx` and redirect `/dashboard` → `/dashboard/overview`).
   - **Data:** From layout or page: `GET /dashboard` → use `account`, `subscription`, `workspaces`.

5. **Plan cards (Overview)**
   - **Data:** `GET /plans` for list of plans (or reuse `lib/pricing-data.ts`); current plan from `subscription.tier` or `account.plan_display_name` (normalize to a single “current tier” value).
   - **UI:** Grid of cards (e.g. Pro+, Ultra, Pro). Each card: name, price, short description, CTA. Current plan card: show “Current” tag and “Manage subscription” (e.g. link to pricing or Billing).
   - **On-Demand card (optional):** If backend supports on-demand usage, add a card “On-Demand Usage is Off” with “Enable On-Demand Usage”; otherwise skip or stub.

6. **Analytics block (Overview)**
   - **Data:** `subscription.limits`, `subscription.usage` (e.g. `requests_today` vs `requests_per_day`), and for the chart `GET /subscription/usage?days=30` (default).
   - **UI:** Date range label (e.g. from `billing_period_start` to `current_period_end`), tabs 1d / 7d / 30d. Metric line: e.g. “Requests” or “Usage” with `usage.requests_today` / `limits.requests_per_day`. Line chart: X = date, Y = `daily[].requests` from `GET /subscription/usage`.

### Phase 3: Usage page

7. **Usage page route**
   - **Route:** `app/dashboard/usage/page.tsx`.
   - **Data:** `GET /subscription` (limits, usage, billing period), `GET /subscription/usage?days=1|7|30` (controlled by tab).

8. **Usage UI**
   - Reuse or mirror Overview: date range, 1d / 7d / 30d tabs, same line chart from `subscription/usage.daily`.
   - **Table:** Columns e.g. Date, Requests (and Type/Cost if backend adds them later). Rows from `daily` (and optional “Type” from subscription if available). For now, keep columns aligned to backend: Date, Requests.

9. **Export CSV**
   - **Backend:** `GET /subscription/usage/export?days=30`.
   - **Frontend:** Add API route `GET /api/subscription/usage/export?days=30` that:
     - Uses `getServerSession`, gets `accessToken`, calls backend `GET /subscription/usage/export?days=30` with `Authorization: Bearer <token>`.
     - Returns response with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="usage-export.csv"` (or similar).
   - Usage page: “Export CSV” button that opens `window.location.href = '/api/subscription/usage/export?days=' + selectedDays` (or equivalent) so the file downloads.

### Phase 4: Integrations page

10. **Integrations page route**
    - **Route:** `app/dashboard/integrations/page.tsx`.
    - **Data:** `GET /workspaces` (or from `GET /dashboard.workspaces` if already loaded in layout).

11. **Integrations UI**
    - Section “Integrations”: one row per integration (Slack, Jira, GitHub; optionally GitLab, Linear as placeholders). Each row: icon, name, short description, “Connect” (or “Manage”) with link. Slack: existing “Add to Slack” flow; Jira/GitHub: link to workspace setup (e.g. `/setup?workspace_id=...`) or docs.
    - Show workspace list or “Connected workspaces” with integration status from `workspaces[].integrations` (jira, github).
    - Optional: “Invite Team Members” block; if backend exposes `team_members` limit/usage from `GET /subscription`, show “X / Y members” and CTA to upgrade when at limit.

### Phase 5: Billing & Invoices page

12. **Billing page route**
    - **Route:** `app/dashboard/billing/page.tsx`.
    - **Data:** `GET /subscription` (billing_period_start, current_period_end, limits, usage). Invoices: only if backend adds an endpoint (e.g. `GET /invoices` or list in subscription); otherwise show “Manage in Razorpay” (or Stripe) and a placeholder for future invoices.

13. **Billing UI**
    - “Manage in Razorpay” (or payment provider) button → open customer portal or docs.
    - “Included usage” section: date range from `billing_period_start`–`current_period_end`; table of usage vs limits (e.g. requests, workspaces, team_members) from `subscription.usage` and `subscription.limits`.
    - “Invoices” section: if backend provides invoice list, render table (Date, Description, Status, Amount, link); else “Invoices available in your payment provider account” + link.

### Phase 6: Polish and consistency

14. **Subscription type updates**
    - Extend `Subscription` (and any dashboard types) to include `billing_period_start`, `limits` (slack_workspaces, requests_per_day, messages_per_thread, knowledge_facts, team_members, jira_sites, github_orgs), `usage` (slack_workspaces, requests_today, knowledge_facts, team_members). Use these everywhere (Overview, Usage, Billing).

15. **401 handling**
    - All new client-side fetches should use `apiFetch` from `lib/api.ts` (already dispatches 401 and triggers logout). Ensure API route proxies (e.g. export) return 401 when session is missing so the client can redirect to login if needed.

16. **Redirects**
    - `/dashboard` → show Overview (current dashboard content moved under sidebar). Optionally redirect `/dashboard` to `/dashboard/overview` and keep Overview as the default tab.

---

## 4. File and route checklist

| Item | Path / action |
|------|----------------|
| Dashboard layout (sidebar + main) | `app/dashboard/layout.tsx` |
| Overview (plan cards, analytics, workspaces summary) | `app/dashboard/page.tsx` (or `app/dashboard/overview/page.tsx`) |
| Usage (chart, table, 1d/7d/30d, Export CSV) | `app/dashboard/usage/page.tsx` |
| Integrations (workspaces + connect actions) | `app/dashboard/integrations/page.tsx` |
| Billing & Invoices | `app/dashboard/billing/page.tsx` |
| Export CSV proxy | `app/api/subscription/usage/export/route.ts` (GET, query `days`) |
| Types for dashboard, subscription, usage | `lib/types/dashboard.ts` or under `lib/` |
| Optional: dashboard context (account + subscription for sidebar) | `components/dashboard/dashboard-context.tsx` or similar |

---

## 5. Backend response shapes (reference)

- **GET /dashboard**
  - `account`: `{ account_id, email, name, plan_display_name }`
  - `subscription`: full subscription object (tier, status, billing_period_start, current_period_end, limits, usage)
  - `workspaces`: `[{ id, slack_workspace_name, integrations: { jira, github } }, ...]`

- **GET /subscription**
  - `billing_period_start`, `limits` (slack_workspaces, requests_per_day, messages_per_thread, knowledge_facts, team_members, jira_sites, github_orgs), `usage` (slack_workspaces, requests_today, knowledge_facts, team_members), plus existing fields (tier, status, current_period_end, etc.)

- **GET /subscription/usage?days=1|7|30**
  - `{ period_days, daily: [{ date, requests }], total_requests }`

- **GET /subscription/usage/export?days=30**
  - CSV body; headers: Date, Requests (or as per backend).

---

## 6. Optional / later

- **Settings:** Profile edit (name, email) if backend exposes PATCH /account or similar.
- **Members:** Invite/list members and enforce `team_members` limit from `GET /subscription`.
- **On-Demand Usage:** Toggle and billing only if backend supports it.
- **Spending:** Dedicated spending view if backend adds cost/usage-by-model endpoints.

This plan keeps the backend as the source of truth for limits and usage, uses a single combined call for Overview where possible, and matches the Cursor-style dashboard structure from your screenshots while staying within the current backend API.
