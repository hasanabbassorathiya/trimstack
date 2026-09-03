import { useCallback, useEffect, useState } from "react";
import type { Alert } from "../api/types";
import { listAlerts } from "../api/client";

interface AlertsState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

export function useAlerts(): AlertsState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AlertsState>({
    alerts: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    try {
      const alerts = await listAlerts("open");
      setState({ alerts, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load alerts",
      }));
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...state, refetch };
}
