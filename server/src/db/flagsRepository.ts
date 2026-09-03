import type Database from "better-sqlite3";
import { nowIso, round2, round1 } from "../types.js";
import type { Alert, DashboardSummary, FlagStatus, FlagType, UpcomingRenewal } from "../types.js";

export function createFlagsRepository(db: Database.Database) {
  function listByStatus(status: FlagStatus): Alert[] {
    const rows = db
      .prepare(
        `SELECT f.id, f.subscription_id, f.flag_type, f.status, f.estimated_monthly_savings,
                f.recommendation, f.detected_at, f.resolved_at, f.action_taken,
                s.name AS subscription_name, s.vendor AS subscription_vendor
         FROM flags f JOIN subscriptions s ON s.id = f.subscription_id
         WHERE f.status = ?
         ORDER BY f.estimated_monthly_savings IS NULL, f.estimated_monthly_savings DESC`,
      )
      .all(status) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: row.id as number,
      subscriptionId: row.subscription_id as number,
      subscriptionName: row.subscription_name as string,
      subscriptionVendor: row.subscription_vendor as string,
      flagType: row.flag_type as FlagType,
      status: row.status as FlagStatus,
      estimatedMonthlySavings: (row.estimated_monthly_savings as number | null) ?? null,
      recommendation: row.recommendation as string,
      detectedAt: row.detected_at as string,
      resolvedAt: (row.resolved_at as string | null) ?? null,
      actionTaken: (row.action_taken as string | null) ?? null,
    }));
  }

  function get(id: number): Alert | undefined {
    const rows = db
      .prepare(
        `SELECT f.id, f.subscription_id, f.flag_type, f.status, f.estimated_monthly_savings,
                f.recommendation, f.detected_at, f.resolved_at, f.action_taken,
                s.name AS subscription_name, s.vendor AS subscription_vendor
         FROM flags f JOIN subscriptions s ON s.id = f.subscription_id
         WHERE f.id = ?`,
      )
      .all(id) as Array<Record<string, unknown>>;
    const row = rows[0];
    if (!row) return undefined;
    return {
      id: row.id as number,
      subscriptionId: row.subscription_id as number,
      subscriptionName: row.subscription_name as string,
      subscriptionVendor: row.subscription_vendor as string,
      flagType: row.flag_type as FlagType,
      status: row.status as FlagStatus,
      estimatedMonthlySavings: (row.estimated_monthly_savings as number | null) ?? null,
      recommendation: row.recommendation as string,
      detectedAt: row.detected_at as string,
      resolvedAt: (row.resolved_at as string | null) ?? null,
      actionTaken: (row.action_taken as string | null) ?? null,
    };
  }

  function resolve(id: number, actionTaken: string): Alert | undefined {
    const result = db
      .prepare(
        "UPDATE flags SET status = 'resolved', resolved_at = ?, action_taken = ? WHERE id = ? AND status = 'open'",
      )
      .run(nowIso(), actionTaken, id);
    return result.changes > 0 ? get(id) : undefined;
  }

  function dismiss(id: number): Alert | undefined {
    const result = db
      .prepare("UPDATE flags SET status = 'dismissed', resolved_at = ? WHERE id = ? AND status = 'open'")
      .run(nowIso(), id);
    return result.changes > 0 ? get(id) : undefined;
  }

  function summary(): DashboardSummary {
    const spend = db
      .prepare("SELECT COALESCE(SUM(monthly_cost), 0) AS total FROM subscriptions WHERE status IN ('active','trial')")
      .get() as { total: number };
    const wasted = db
      .prepare("SELECT COALESCE(SUM(estimated_monthly_savings), 0) AS total FROM flags WHERE status = 'open'")
      .get() as { total: number };
    const recovered = db
      .prepare("SELECT COALESCE(SUM(estimated_monthly_savings), 0) AS total FROM flags WHERE status = 'resolved'")
      .get() as { total: number };

    const cutoff = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const renewals = db
      .prepare(
        `SELECT name, vendor, renewal_date, monthly_cost FROM subscriptions
         WHERE status != 'cancelled' AND renewal_date >= ? AND renewal_date <= ?
         ORDER BY renewal_date ASC`,
      )
      .all(today, cutoff) as Array<{ name: string; vendor: string; renewal_date: string; monthly_cost: number }>;

    const totalSpend = round2(spend.total);
    const wastedMonthly = round2(wasted.total);

    return {
      totalMonthlySpend: totalSpend,
      projectedAnnualSpend: round2(totalSpend * 12),
      wastedMonthly,
      recoveredTotal: round2(recovered.total),
      wastePercent: totalSpend > 0 ? round1((wastedMonthly / totalSpend) * 100) : 0,
      upcomingRenewals: renewals.map((r) => ({
        name: r.name,
        vendor: r.vendor,
        renewalDate: r.renewal_date,
        monthlyCost: r.monthly_cost,
      })) satisfies UpcomingRenewal[],
    };
  }

  return { listByStatus, get, resolve, dismiss, summary };
}
