"use client";

import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { OpsAppShell } from "@/components/ops/ops-app-shell";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <OpsAppShell>{children}</OpsAppShell>
    </DashboardProvider>
  );
}
