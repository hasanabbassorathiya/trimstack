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
export type AlertStatus = "open" | "resolved" | "dismissed";

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

export type SubscriptionInput = Omit<Subscription, "id" | "createdAt" | "updatedAt" | "notes"> & {
  notes?: string | null;
};
export type SubscriptionPatch = Partial<SubscriptionInput>;

export interface Alert {
  id: number;
  subscriptionId: number;
  subscriptionName: string;
  subscriptionVendor: string;
  flagType: FlagType;
  status: AlertStatus;
  estimatedMonthlySavings: number | null;
  recommendation: string;
  detectedAt: string;
  resolvedAt: string | null;
  actionTaken: string | null;
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

export interface ErrorEnvelope {
  error: {
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
