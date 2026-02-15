"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import type { SubscriptionUsageResponse } from "@/lib/types/dashboard";

export type UsageDays = 1 | 7 | 30;

export function useSubscriptionUsage(days: UsageDays) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<SubscriptionUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<SubscriptionUsageResponse>(
        `/subscription/usage?days=${days}`,
        {},
        session.accessToken
      );
      setData(result);
    } catch (err) {
      console.error("Subscription usage fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load usage");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days, session?.accessToken, status]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { data, loading, error, refetch: fetchUsage };
}
