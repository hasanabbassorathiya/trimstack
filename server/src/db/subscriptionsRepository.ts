import type Database from "better-sqlite3";
import type { Subscription } from "../types.js";
import { nowIso } from "../types.js";
import type { SubscriptionCreateInput } from "../validation/schemas.js";

function rowToSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as number,
    name: row.name as string,
    vendor: row.vendor as string,
    category: row.category as Subscription["category"],
    monthlyCost: row.monthly_cost as number,
    billingCycle: row.billing_cycle as Subscription["billingCycle"],
    renewalDate: row.renewal_date as string,
    seatsProvisioned: row.seats_provisioned as number,
    seatsActive: row.seats_active as number,
    owningDepartment: row.owning_department as string,
    status: row.status as Subscription["status"],
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const SELECT_ALL = "SELECT * FROM subscriptions";
const SELECT_BY_ID = "SELECT * FROM subscriptions WHERE id = ?";

// Fixed ORDER BY matrix — sort/order values are validated constants, never interpolated.
const ORDER_CLAUSES: Record<string, string> = {
  "id:asc": " ORDER BY id ASC",
  "cost:desc": " ORDER BY monthly_cost DESC",
  "cost:asc": " ORDER BY monthly_cost ASC",
  "renewal:desc": " ORDER BY renewal_date DESC",
  "renewal:asc": " ORDER BY renewal_date ASC",
};

export function createSubscriptionsRepository(db: Database.Database) {
  function list(params: { q?: string; sort?: "cost" | "renewal"; order?: "asc" | "desc" }): Subscription[] {
    const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);
    let sql = SELECT_ALL;
    const args: unknown[] = [];
    if (params.q) {
      sql += " WHERE (name LIKE ? ESCAPE '\\' OR vendor LIKE ? ESCAPE '\\')";
      const pattern = `%${escapeLike(params.q)}%`;
      args.push(pattern, pattern);
    }
    const key = params.sort ? `${params.sort}:${params.order ?? "desc"}` : "id:asc";
    sql += ORDER_CLAUSES[key];
    const rows = (
      params.q ? db.prepare(sql).all(...(args as [])) : db.prepare(sql).all()
    ) as Record<string, unknown>[];
    return rows.map(rowToSubscription);
  }

  function get(id: number): Subscription | undefined {
    const row = db.prepare(SELECT_BY_ID).get(id) as Record<string, unknown> | undefined;
    return row ? rowToSubscription(row) : undefined;
  }

  function create(input: SubscriptionCreateInput): Subscription {
    const now = nowIso();
    const result = db
      .prepare(
        "INSERT INTO subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, seats_provisioned, seats_active, owning_department, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        input.name, input.vendor, input.category, input.monthlyCost, input.billingCycle,
        input.renewalDate, input.seatsProvisioned, input.seatsActive, input.owningDepartment,
        input.status, input.notes ?? null, now, now,
      );
    return get(Number(result.lastInsertRowid))!;
  }

  function update(id: number, merged: SubscriptionCreateInput): Subscription {
    db.prepare(
      "UPDATE subscriptions SET name = ?, vendor = ?, category = ?, monthly_cost = ?, billing_cycle = ?, renewal_date = ?, seats_provisioned = ?, seats_active = ?, owning_department = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?",
    ).run(
      merged.name, merged.vendor, merged.category, merged.monthlyCost, merged.billingCycle,
      merged.renewalDate, merged.seatsProvisioned, merged.seatsActive, merged.owningDepartment,
      merged.status, merged.notes ?? null, nowIso(), id,
    );
    return get(id)!;
  }

  function remove(id: number): boolean {
    const result = db.prepare("DELETE FROM subscriptions WHERE id = ?").run(id);
    return result.changes > 0;
  }

  return { list, get, create, update, remove };
}
