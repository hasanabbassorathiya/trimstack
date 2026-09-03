import type { EngineFlag, SubStatus, Subscription } from "../types.js";
import { round2 } from "../types.js";

export interface AnalyzeInput {
  id: number;
  name: string;
  category: Subscription["category"];
  monthlyCost: number;
  renewalDate: string;
  seatsProvisioned: number;
  seatsActive: number;
  owningDepartment: string;
  status: SubStatus;
}

function daysUntil(renewalDate: string, today: Date): number {
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const r = new Date(`${renewalDate}T00:00:00Z`).getTime();
  return Math.round((r - t) / 86_400_000);
}

export function analyzeSubscriptions(subscriptions: AnalyzeInput[], today: Date = new Date()): EngineFlag[] {
  const flags: EngineFlag[] = [];

  for (const sub of subscriptions) {
    if (sub.status === "cancelled") continue; // cancelled subs never flag

    const days = daysUntil(sub.renewalDate, today);

    if (sub.status === "trial" && days >= 0 && days <= 14) {
      flags.push({
        subscriptionId: sub.id,
        flagType: "trial_drift",
        estimatedMonthlySavings: null,
        recommendation: `Decide on ${sub.name} trial before it auto-converts`,
      });
    } else if (days >= 0 && days <= 30) {
      flags.push({
        subscriptionId: sub.id,
        flagType: "upcoming_renewal",
        estimatedMonthlySavings: null,
        recommendation: `Review ${sub.name} before it renews`,
      });
    }

    if (sub.seatsProvisioned > sub.seatsActive) {
      const unused = sub.seatsProvisioned - sub.seatsActive;
      const savings = round2((sub.monthlyCost * unused) / sub.seatsProvisioned);
      flags.push({
        subscriptionId: sub.id,
        flagType: "inactive_seats",
        estimatedMonthlySavings: savings,
        recommendation: `Downgrade ${unused} unused seats in ${sub.name}`,
      });
    }
  }

  // Duplicate spend: active subs grouped by category, only across DIFFERENT departments
  const active = subscriptions.filter((s) => s.status === "active");
  const byCategory = new Map<string, AnalyzeInput[]>();
  for (const sub of active) {
    const group = byCategory.get(sub.category) ?? [];
    group.push(sub);
    byCategory.set(sub.category, group);
  }

  for (const group of byCategory.values()) {
    if (group.length < 2) continue;
    const departments = new Set(group.map((s) => s.owningDepartment));
    if (departments.size < 2) continue;

    // Cheapest is exempt; ties broken by name for determinism
    const sorted = [...group].sort(
      (a, b) => a.monthlyCost - b.monthlyCost || a.name.localeCompare(b.name),
    );
    const [exempt, ...rest] = sorted;
    for (const sub of rest) {
      flags.push({
        subscriptionId: sub.id,
        flagType: "duplicate_spend",
        estimatedMonthlySavings: sub.monthlyCost,
        recommendation: `Cancel duplicate ${sub.category} tool ${sub.name} — keep ${exempt.name}`,
      });
    }
  }

  flags.sort((a, b) => a.subscriptionId - b.subscriptionId || a.flagType.localeCompare(b.flagType));
  return flags;
}
