import type Database from "better-sqlite3";
import { SEED_CATALOG } from "./seedData.js";
import { analyzeSubscriptions } from "../engine/wasteEngine.js";
import { nowIso } from "../types.js";
import type { EngineFlag } from "../types.js";

function dateIn(days: number): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days))
    .toISOString()
    .slice(0, 10);
}

export function seedIfEmpty(db: Database.Database): boolean {
  const count = (db.prepare("SELECT COUNT(*) AS n FROM subscriptions").get() as { n: number }).n;
  if (count > 0) return false; // idempotent: never duplicates

  const insertSub = db.prepare(
    "INSERT INTO subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, seats_provisioned, seats_active, owning_department, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  const rows = SEED_CATALOG.map((row) => ({
    ...row,
    renewalDate: dateIn(row.renewalOffsetDays),
    billingCycle: row.renewalOffsetDays > 150 ? ("annual" as const) : ("monthly" as const),
  }));

  const ids: number[] = [];
  const insertAll = db.transaction(() => {
    for (const row of rows) {
      const result = insertSub.run(
        row.name, row.vendor, row.category, row.monthlyCost, row.billingCycle,
        row.renewalDate, row.seatsProvisioned, row.seatsActive, row.owningDepartment,
        row.status, null, nowIso(), nowIso(),
      );
      ids.push(Number(result.lastInsertRowid));
    }
  });
  insertAll();
  return true;
}

// Bootstrap analysis: run once inline after first seed so a fresh install
// shows waste on the dashboard immediately (Success Criterion #1). No scheduler.
export function runAnalysisOnDb(db: Database.Database): EngineFlag[] {
  const rows = db
    .prepare(
      "SELECT id, name, category, monthly_cost, renewal_date, seats_provisioned, seats_active, owning_department, status FROM subscriptions",
    )
    .all() as Array<{
    id: number;
    name: string;
    category: EngineFlag extends never ? never : string;
    monthly_cost: number;
    renewal_date: string;
    seats_provisioned: number;
    seats_active: number;
    owning_department: string;
    status: string;
  }>;

  const flags = analyzeSubscriptions(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as never,
      monthlyCost: r.monthly_cost,
      renewalDate: r.renewal_date,
      seatsProvisioned: r.seats_provisioned,
      seatsActive: r.seats_active,
      owningDepartment: r.owning_department,
      status: r.status as never,
    })),
  );

  upsertFlags(db, flags);
  return flags;
}

function upsertFlags(db: Database.Database, flags: EngineFlag[]): void {
  const existing = db
    .prepare("SELECT subscription_id, flag_type, status FROM flags")
    .all() as Array<{ subscription_id: number; flag_type: string; status: string }>;
  const existingKeys = new Set(existing.map((f) => `${f.subscription_id}:${f.flag_type}`));

  const insertFlag = db.prepare(
    "INSERT INTO flags (subscription_id, flag_type, status, estimated_monthly_savings, recommendation, detected_at) VALUES (?, ?, 'open', ?, ?, ?)",
  );
  const updateFlag = db.prepare(
    "UPDATE flags SET estimated_monthly_savings = ?, recommendation = ?, detected_at = ? WHERE subscription_id = ? AND flag_type = ? AND status = 'open'",
  );
  // Undetected + still open: remove from the open list (resolved/dismissed preserved forever)
  const deleteOpen = db.prepare(
    "DELETE FROM flags WHERE subscription_id = ? AND flag_type = ? AND status = 'open'",
  );

  const detectedKeys = new Set(flags.map((f) => `${f.subscriptionId}:${f.flagType}`));

  const apply = db.transaction(() => {
    for (const flag of flags) {
      const key = `${flag.subscriptionId}:${flag.flagType}`;
      if (existingKeys.has(key)) {
        updateFlag.run(
          flag.estimatedMonthlySavings, flag.recommendation, nowIso(),
          flag.subscriptionId, flag.flagType,
        );
      } else {
        insertFlag.run(
          flag.subscriptionId, flag.flagType,
          flag.estimatedMonthlySavings, flag.recommendation, nowIso(),
        );
      }
    }
    for (const ex of existing) {
      const key = `${ex.subscription_id}:${ex.flag_type}`;
      if (!detectedKeys.has(key) && ex.status === "open") {
        deleteOpen.run(ex.subscription_id, ex.flag_type);
      }
    }
  });
  apply();
}
