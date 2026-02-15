"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import type {
  DashboardAccount,
  DashboardResponse,
  DashboardSubscription,
  DashboardWorkspace,
} from "@/lib/types/dashboard";

interface DashboardContextValue {
  account: DashboardAccount | null;
  subscription: DashboardSubscription | null;
  workspaces: DashboardWorkspace[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [account, setAccount] = useState<DashboardAccount | null>(null);
  const [subscription, setSubscription] = useState<DashboardSubscription | null>(null);
  const [workspaces, setWorkspaces] = useState<DashboardWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DashboardResponse>(
        "/dashboard",
        {},
        session.accessToken
      );
      setAccount(data.account);
      setSubscription(data.subscription);
      setWorkspaces(data.workspaces ?? []);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      setAccount(null);
      setSubscription(null);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const value: DashboardContextValue = {
    account,
    subscription,
    workspaces,
    loading,
    error,
    refetch: fetchDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}
