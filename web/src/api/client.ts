import type {
  Alert,
  AnalysisRunSummary,
  DashboardSummary,
  Subscription,
  SubscriptionInput,
  SubscriptionPatch,
} from "./types";
import { ApiError } from "./errors";
import {
  demoCreateSubscription,
  demoDeleteSubscription,
  demoDismissAlert,
  demoGetDashboardSummary,
  demoListAlerts,
  demoListSubscriptions,
  demoResolveAlert,
  demoRunAnalysis,
  demoUpdateSubscription,
  exportAlertsCsv,
} from "./staticDemo";

export { ApiError };

// VITE_DEMO=1 builds the read-only hosted snapshot (GitHub Pages); unset
// builds talk to the Express API through the Vite proxy.
const DEMO = import.meta.env.VITE_DEMO === "1";

export function isDemoMode(): boolean {
  return DEMO;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let details: Array<{ field: string; message: string }> | undefined;
    try {
      const body = (await res.json()) as {
        error?: { message?: string; details?: Array<{ field: string; message: string }> };
      };
      if (body?.error?.message) message = body.error.message;
      details = body?.error?.details;
    } catch {
      // non-JSON error body — keep the fallback message
    }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface ListParams {
  q?: string;
  sort?: "cost" | "renewal";
  order?: "asc" | "desc";
}

export function listSubscriptions(params: ListParams = {}): Promise<Subscription[]> {
  if (DEMO) return demoListSubscriptions(params);
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  const qs = search.toString();
  return request<Subscription[]>(`/subscriptions${qs ? `?${qs}` : ""}`);
}

export function getSubscription(id: number): Promise<Subscription> {
  if (DEMO) return demoGetSnapshotSub(id);
  return request<Subscription>(`/subscriptions/${id}`);
}

async function demoGetSnapshotSub(id: number): Promise<Subscription> {
  const { demoGetSubscription } = await import("./staticDemo");
  return demoGetSubscription(id);
}

export function createSubscription(input: SubscriptionInput): Promise<Subscription> {
  if (DEMO) return demoCreateSubscription();
  return request<Subscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSubscription(id: number, patch: SubscriptionPatch): Promise<Subscription> {
  if (DEMO) return demoUpdateSubscription();
  return request<Subscription>(`/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export function deleteSubscription(id: number): Promise<void> {
  if (DEMO) return demoDeleteSubscription();
  return request<void>(`/subscriptions/${id}`, { method: "DELETE" });
}

export function runAnalysis(): Promise<AnalysisRunSummary> {
  if (DEMO) return demoRunAnalysis();
  return request<AnalysisRunSummary>("/analysis/run", { method: "POST" });
}

export function listAlerts(status: "open" | "resolved" | "dismissed" = "open"): Promise<Alert[]> {
  if (DEMO) return demoListAlerts(status);
  return request<Alert[]>(`/alerts?status=${status}`);
}

export function resolveAlert(id: number, actionTaken: string): Promise<Alert> {
  if (DEMO) return demoResolveAlert(id, actionTaken);
  return request<Alert>(`/alerts/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ actionTaken }),
  });
}

export function dismissAlert(id: number): Promise<Alert> {
  if (DEMO) return demoDismissAlert(id);
  return request<Alert>(`/alerts/${id}/dismiss`, { method: "POST" });
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  if (DEMO) return demoGetDashboardSummary();
  return request<DashboardSummary>("/dashboard/summary");
}

export function getAlertsCsvUrl(): string {
  return "/api/export/alerts.csv";
}

// Export entry point that works in both modes: server mode downloads via the
// API endpoint; demo mode generates the same RFC 4180 file client-side.
export async function downloadAlertsCsv(openAlerts: Alert[]): Promise<void> {
  if (DEMO) {
    await exportAlertsCsv(openAlerts);
    return;
  }
  window.location.assign(getAlertsCsvUrl());
}
