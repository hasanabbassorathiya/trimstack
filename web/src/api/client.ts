import type {
  Alert,
  AnalysisRunSummary,
  DashboardSummary,
  Subscription,
  SubscriptionInput,
  SubscriptionPatch,
} from "./types";

export class ApiError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(
    status: number,
    message: string,
    details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
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
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  const qs = search.toString();
  return request<Subscription[]>(`/subscriptions${qs ? `?${qs}` : ""}`);
}

export function getSubscription(id: number): Promise<Subscription> {
  return request<Subscription>(`/subscriptions/${id}`);
}

export function createSubscription(input: SubscriptionInput): Promise<Subscription> {
  return request<Subscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSubscription(id: number, patch: SubscriptionPatch): Promise<Subscription> {
  return request<Subscription>(`/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export function deleteSubscription(id: number): Promise<void> {
  return request<void>(`/subscriptions/${id}`, { method: "DELETE" });
}

export function runAnalysis(): Promise<AnalysisRunSummary> {
  return request<AnalysisRunSummary>("/analysis/run", { method: "POST" });
}

export function listAlerts(status: "open" | "resolved" | "dismissed" = "open"): Promise<Alert[]> {
  return request<Alert[]>(`/alerts?status=${status}`);
}

export function resolveAlert(id: number, actionTaken: string): Promise<Alert> {
  return request<Alert>(`/alerts/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ actionTaken }),
  });
}

export function dismissAlert(id: number): Promise<Alert> {
  return request<Alert>(`/alerts/${id}/dismiss`, { method: "POST" });
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/dashboard/summary");
}

export function getAlertsCsvUrl(): string {
  return "/api/export/alerts.csv";
}
