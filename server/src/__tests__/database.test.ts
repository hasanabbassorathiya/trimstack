import { describe, it, expect } from "vitest";
import { createTempDatabase } from "../db/database.js";

describe("database", () => {
  it("applies schema idempotently and supports insert/read", () => {
    const db = createTempDatabase();

    const insert = db.prepare(
      "INSERT INTO subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, seats_provisioned, seats_active, owning_department, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const result = insert.run(
      "Test Tool", "Test Vendor", "dev", 100, "monthly", "2026-10-01",
      10, 5, "Engineering", "active", null, "2026-09-03T00:00:00Z", "2026-09-03T00:00:00Z",
    );
    expect(result.lastInsertRowid).toBe(1);

    const row = db.prepare("SELECT name, monthly_cost, seats_active FROM subscriptions WHERE id = ?").get(1) as {
      name: string;
      monthly_cost: number;
      seats_active: number;
    };
    expect(row.name).toBe("Test Tool");
    expect(row.monthly_cost).toBe(100);
    expect(row.seats_active).toBe(5);

    // Re-running DDL is a no-op (idempotent boot)
    db.exec("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT)");
    const count = db.prepare("SELECT COUNT(*) AS n FROM subscriptions").get() as { n: number };
    expect(count.n).toBe(1);
  });

  it("enforces the seats CHECK constraint", () => {
    const db = createTempDatabase();
    const insert = db.prepare(
      "INSERT INTO subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, seats_provisioned, seats_active, owning_department, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    expect(() =>
      insert.run("Bad", "V", "dev", 10, "monthly", "2026-10-01", 5, 10, "X", "active", null, "t", "t"),
    ).toThrow();
  });

  it("enforces the flags unique key and cascade delete", () => {
    const db = createTempDatabase();
    const insertSub = db.prepare(
      "INSERT INTO subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, seats_provisioned, seats_active, owning_department, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    insertSub.run("S", "V", "dev", 10, "monthly", "2026-10-01", 10, 2, "X", "active", null, "t", "t");

    const insertFlag = db.prepare(
      "INSERT INTO flags (subscription_id, flag_type, status, estimated_monthly_savings, recommendation, detected_at) VALUES (?, ?, ?, ?, ?, ?)",
    );
    insertFlag.run(1, "inactive_seats", "open", 8.0, "Downgrade 8 unused seats in S", "t");
    expect(() => insertFlag.run(1, "inactive_seats", "open", 8.0, "dup", "t")).toThrow();

    db.prepare("DELETE FROM subscriptions WHERE id = ?").run(1);
    const flags = db.prepare("SELECT COUNT(*) AS n FROM flags").get() as { n: number };
    expect(flags.n).toBe(0); // cascade removed
  });
});
