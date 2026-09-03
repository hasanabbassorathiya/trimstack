import type {
  Alert,
  AnalysisRunSummary,
  DashboardSummary,
  Subscription,
  UpcomingRenewal,
} from "./types";
import { ApiError } from "./errors";

// Static demo mode for GitHub Pages: the dashboard runs entirely in the
// browser against a build-time snapshot of the seeded demo company
// (scripts/build-demo-data.ts). Resolve/dismiss/export work on in-memory
// state; editing is disabled (the snapshot is read-only by design).

export interface DemoData {
  subscriptions: Subscription[];
  alerts: Alert[];
}

let state: DemoData | null = null;
let loadPromise: Promise<DemoData> | null = null;

async function getState(): Promise<DemoData> {
  if (state) return state;
  loadPromise ??= (async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}demo/data.json`);
    if (!res.ok) throw new ApiError(503, "Demo data is unavailable");
    const data = (await res.json()) as DemoData;
    state = { subscriptions: data.subscriptions, alerts: data.alerts };
    return state;
  })();
  return loadPromise;
}

// Test hook: inject state directly, bypassing the fetch.
export function _setDemoStateForTests(data: DemoData): void {
  state = data;
  loadPromise = null;
}

const round2 = (x: number) => Math.round(x * 100) / 100;
const round1 = (x: number) => Math.round(x * 10) / 10;

const isoDateIn = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

export function applySearchAndSort(
  subscriptions: Subscription[],
  params: { q?: string; sort?: "cost" | "renewal"; order?: "asc" | "desc" } = {},
): Subscription[] {
  let rows = subscriptions;
  if (params.q) {
    const needle = params.q.toLowerCase();
    rows = rows.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) || s.vendor.toLowerCase().includes(needle),
    );
  }
  const sorted = [...rows];
  if (params.sort === "cost") {
    sorted.sort((a, b) =>
      params.order === "asc" ? a.monthlyCost - b.monthlyCost : b.monthlyCost - a.monthlyCost,
    );
  } else if (params.sort === "renewal") {
    sorted.sort((a, b) =>
      params.order === "asc"
        ? a.renewalDate.localeCompare(b.renewalDate)
        : b.renewalDate.localeCompare(a.renewalDate),
    );
  } else {
    sorted.sort((a, b) => a.id - b.id);
  }
  return sorted;
}

export function computeSummary(subscriptions: Subscription[], alerts: Alert[]): DashboardSummary {
  const spendSubs = subscriptions.filter((s) => s.status !== "cancelled");
  const totalMonthlySpend = round2(spendSubs.reduce((sum, s) => sum + s.monthlyCost, 0));
  const wastedMonthly = round2(
    alerts
      .filter((a) => a.status === "open")
      .reduce((sum, a) => sum + (a.estimatedMonthlySavings ?? 0), 0),
  );
  const recoveredTotal = round2(
    alerts
      .filter((a) => a.status === "resolved")
      .reduce((sum, a) => sum + (a.estimatedMonthlySavings ?? 0), 0),
  );

  const today = isoDateIn(0);
  const cutoff = isoDateIn(60);
  const upcomingRenewals: UpcomingRenewal[] = spendSubs
    .filter((s) => s.renewalDate >= today && s.renewalDate <= cutoff)
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .map((s) => ({
      name: s.name,
      vendor: s.vendor,
      renewalDate: s.renewalDate,
      monthlyCost: s.monthlyCost,
    }));

  return {
    totalMonthlySpend,
    projectedAnnualSpend: round2(totalMonthlySpend * 12),
    wastedMonthly,
    recoveredTotal,
    wastePercent: totalMonthlySpend > 0 ? round1((wastedMonthly / totalMonthlySpend) * 100) : 0,
    upcomingRenewals,
  };
}

export const DEMO_CSV_HEADERS = [
  "subscription",
  "flag type",
  "monthly savings",
  "recommendation",
  "status",
];

const FLAG_LABELS: Record<Alert["flagType"], string> = {
  inactive_seats: "Inactive seats",
  upcoming_renewal: "Upcoming renewal",
  trial_drift: "Trial drift",
  duplicate_spend: "Duplicate spend",
};

function escapeField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function serializeDemoCsv(alerts: Alert[]): string {
  const lines = [DEMO_CSV_HEADERS.join(",")];
  for (const a of alerts) {
    const savings =
      a.estimatedMonthlySavings !== null ? a.estimatedMonthlySavings.toFixed(2) : "";
    lines.push(
      [a.subscriptionName, FLAG_LABELS[a.flagType], savings, a.recommendation, a.status]
        .map(escapeField)
        .join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

export function analysisSummary(alerts: Alert[]): AnalysisRunSummary {
  const flagsByType = {
    inactive_seats: 0,
    upcoming_renewal: 0,
    trial_drift: 0,
    duplicate_spend: 0,
  };
  let total = 0;
  for (const a of alerts) {
    if (a.status === "open") {
      flagsByType[a.flagType] += 1;
      total += a.estimatedMonthlySavings ?? 0;
    }
  }
  return { flagsByType, totalPotentialMonthlySavings: round2(total) };
}

export async function demoListSubscriptions(
  params: { q?: string; sort?: "cost" | "renewal"; order?: "asc" | "desc" } = {},
): Promise<Subscription[]> {
  const s = await getState();
  return applySearchAndSort(s.subscriptions, params);
}

export async function demoGetSubscription(id: number): Promise<Subscription> {
  const s = await getState();
  const found = s.subscriptions.find((x) => x.id === id);
  if (!found) throw new ApiError(404, "Subscription not found");
  return found;
}

async function readOnly(): Promise<never> {
  throw new ApiError(
    503,
    "The hosted demo is a read-only snapshot. Run the app locally to edit subscriptions.",
  );
}

export async function demoCreateSubscription(): Promise<never> {
  return readOnly();
}

export async function demoUpdateSubscription(): Promise<never> {
  return readOnly();
}

export async function demoDeleteSubscription(): Promise<never> {
  return readOnly();
}

export async function demoRunAnalysis(): Promise<AnalysisRunSummary> {
  const s = await getState();
  return analysisSummary(s.alerts);
}

export async function demoListAlerts(
  status: "open" | "resolved" | "dismissed" = "open",
): Promise<Alert[]> {
  const s = await getState();
  return s.alerts
    .filter((a) => a.status === status)
    .sort((a, b) => {
      const aSavings = a.estimatedMonthlySavings;
      const bSavings = b.estimatedMonthlySavings;
      if (aSavings === null && bSavings === null) return a.id - b.id;
      if (aSavings === null) return 1;
      if (bSavings === null) return -1;
      return bSavings - aSavings || a.id - b.id;
    });
}

export async function demoResolveAlert(id: number, actionTaken: string): Promise<Alert> {
  const s = await getState();
  const alert = s.alerts.find((a) => a.id === id);
  if (!alert) throw new ApiError(404, "Alert not found");
  if (alert.status !== "open") throw new ApiError(409, `Alert is already ${alert.status}`);
  if (!actionTaken.trim()) throw new ApiError(400, "Validation failed");
  alert.status = "resolved";
  alert.resolvedAt = new Date().toISOString();
  alert.actionTaken = actionTaken;
  return { ...alert };
}

export async function demoDismissAlert(id: number): Promise<Alert> {
  const s = await getState();
  const alert = s.alerts.find((a) => a.id === id);
  if (!alert) throw new ApiError(404, "Alert not found");
  if (alert.status !== "open") throw new ApiError(409, `Alert is already ${alert.status}`);
  alert.status = "dismissed";
  alert.resolvedAt = new Date().toISOString();
  return { ...alert };
}

export async function demoGetDashboardSummary(): Promise<DashboardSummary> {
  const s = await getState();
  return computeSummary(s.subscriptions, s.alerts);
}

// Client-side CSV download for demo mode (server endpoint does not exist on Pages)
export async function exportAlertsCsv(alerts: Alert[]): Promise<void> {
  const csv = serializeDemoCsv(alerts.filter((a) => a.status === "open"));
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "trimstack-waste-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}
