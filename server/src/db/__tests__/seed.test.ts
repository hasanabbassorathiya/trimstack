import { describe, it, expect } from "vitest";
import { createTempDatabase } from "../database.js";
import { seedIfEmpty, runAnalysisOnDb } from "../seed.js";

describe("seed", () => {
  it("seeds exactly 24 subscriptions on first run and never duplicates", () => {
    const db = createTempDatabase();
    expect(seedIfEmpty(db)).toBe(true);
    expect((db.prepare("SELECT COUNT(*) AS n FROM subscriptions").get() as { n: number }).n).toBe(24);

    // Second boot: seed skips entirely
    expect(seedIfEmpty(db)).toBe(false);
    expect((db.prepare("SELECT COUNT(*) AS n FROM subscriptions").get() as { n: number }).n).toBe(24);
  });

  it("covers all 9 categories, 5+ departments, includes trial and cancelled", () => {
    const db = createTempDatabase();
    seedIfEmpty(db);
    const cats = db.prepare("SELECT COUNT(DISTINCT category) AS n FROM subscriptions").get() as { n: number };
    expect(cats.n).toBe(9);
    const depts = db.prepare("SELECT COUNT(DISTINCT owning_department) AS n FROM subscriptions").get() as { n: number };
    expect(depts.n).toBeGreaterThanOrEqual(5);
    const statuses = db.prepare("SELECT DISTINCT status FROM subscriptions").all() as Array<{ status: string }>;
    expect(statuses.map((s) => s.status).sort()).toEqual(["active", "cancelled", "trial"]);
  });

  it("bootstrap analysis triggers all four flag types", () => {
    const db = createTempDatabase();
    seedIfEmpty(db);
    const flags = runAnalysisOnDb(db);
    const types = new Set(flags.map((f) => f.flagType));
    expect(types.has("inactive_seats")).toBe(true);
    expect(types.has("upcoming_renewal")).toBe(true);
    expect(types.has("trial_drift")).toBe(true);
    expect(types.has("duplicate_spend")).toBe(true);
  });

  it("re-running analysis is idempotent (no duplicate rows, stable flags)", () => {
    const db = createTempDatabase();
    seedIfEmpty(db);
    runAnalysisOnDb(db);
    const first = db.prepare("SELECT COUNT(*) AS n FROM flags").get() as { n: number };
    runAnalysisOnDb(db);
    const second = db.prepare("SELECT COUNT(*) AS n FROM flags").get() as { n: number };
    expect(first.n).toBe(second.n);
  });
});
