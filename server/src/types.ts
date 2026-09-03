export type Category =
  | "dev"
  | "design"
  | "marketing"
  | "sales"
  | "productivity"
  | "security"
  | "analytics"
  | "hr"
  | "other";

export type BillingCycle = "monthly" | "annual";
export type SubStatus = "active" | "trial" | "cancelled";
export type FlagType =
  | "inactive_seats"
  | "upcoming_renewal"
  | "trial_drift"
  | "duplicate_spend";
export type FlagStatus = "open" | "resolved" | "dismissed";

export interface SubscriptionRow {
  id: number;
  name: string;
  vendor: string;
  category: Category;
  monthlyCost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  seatsProvisioned: number;
  seatsActive: number;
  owningDepartment: string;
  status: SubStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  name: string;
  vendor: string;
  category: Category;
  monthlyCost: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  seatsProvisioned: number;
  seatsActive: number;
  owningDepartment: string;
  status: SubStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlagRow {
  id: number;
  subscriptionId: number;
  flagType: FlagType;
  status: FlagStatus;
  estimatedMonthlySavings: number | null;
  recommendation: string;
  detectedAt: string;
  resolvedAt: string | null;
  actionTaken: string | null;
}

export interface Alert extends Omit<FlagRow, "id" | "subscriptionId"> {
  id: number;
  subscriptionId: number;
  subscriptionName: string;
  subscriptionVendor: string;
}

export interface EngineFlag {
  subscriptionId: number;
  flagType: FlagType;
  estimatedMonthlySavings: number | null;
  recommendation: string;
}

export interface UpcomingRenewal {
  name: string;
  vendor: string;
  renewalDate: string;
  monthlyCost: number;
}

export interface DashboardSummary {
  totalMonthlySpend: number;
  projectedAnnualSpend: number;
  wastedMonthly: number;
  recoveredTotal: number;
  wastePercent: number;
  upcomingRenewals: UpcomingRenewal[];
}

export interface AnalysisRunSummary {
  flagsByType: Record<FlagType, number>;
  totalPotentialMonthlySavings: number;
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function nowIso(): string {
  return new Date().toISOString();
}
