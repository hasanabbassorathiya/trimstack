import { useCallback, useEffect, useState } from "react";
import type { DashboardSummary } from "../api/types";
import { getDashboardSummary } from "../api/client";

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<DashboardState>({
    summary: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    try {
      const summary = await getDashboardSummary();
      setState({ summary, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load dashboard",
      }));
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}
