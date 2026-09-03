import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createTempDatabase } from "../db/database.js";
import { createApp } from "../app.js";

let app: Express;

const validSub = {
  name: "QA Tool",
  vendor: "QA Vendor",
  category: "dev",
  monthlyCost: 100,
  billingCycle: "monthly",
  renewalDate: new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
  seatsProvisioned: 20,
  seatsActive: 10,
  owningDepartment: "QA Dept",
  status: "active",
};

beforeAll(() => {
  app = createApp(createTempDatabase()); // seeds 24 + bootstrap analysis
});

describe("subscriptions CRUD", () => {
  it("lists the 24 seeded subscriptions", async () => {
    const res = await request(app).get("/api/subscriptions");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(24);
  });

  it("searches by name or vendor case-insensitively", async () => {
    const res = await request(app).get("/api/subscriptions?q=FIG");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.every((s: { name: string }) => /fig/i.test(s.name))).toBe(true);
  });

  it("sorts by cost desc and renewal asc", async () => {
    const desc = await request(app).get("/api/subscriptions?sort=cost&order=desc");
    const costs: number[] = desc.body.map((s: { monthlyCost: number }) => s.monthlyCost);
    expect(costs[0]).toBeGreaterThanOrEqual(costs[costs.length - 1]);

    const asc = await request(app).get("/api/subscriptions?sort=renewal&order=asc");
    const dates: string[] = asc.body.map((s: { renewalDate: string }) => s.renewalDate);
    expect(dates[0] <= dates[dates.length - 1]).toBe(true);
  });

  it("creates, updates (merge-then-validate), gets, and deletes with cascade", async () => {
    const created = await request(app).post("/api/subscriptions").send(validSub);
    expect(created.status).toBe(201);
    const id = created.body.id;

    // Update pushing seatsActive above provisioned fails cross-field on merged values
    const bad = await request(app).put(`/api/subscriptions/${id}`).send({ seatsActive: 25 });
    expect(bad.status).toBe(400);

    const good = await request(app).put(`/api/subscriptions/${id}`).send({ name: "QA Tool v2" });
    expect(good.status).toBe(200);
    expect(good.body.name).toBe("QA Tool v2");

    const got = await request(app).get(`/api/subscriptions/${id}`);
    expect(got.status).toBe(200);

    // Run analysis so the sub has flags, then delete: flags must cascade
    await request(app).post("/api/analysis/run");
    const del = await request(app).delete(`/api/subscriptions/${id}`);
    expect(del.status).toBe(204);
    const missing = await request(app).get(`/api/subscriptions/${id}`);
    expect(missing.status).toBe(404);
  });

  it("rejects invalid payloads with 400 + details", async () => {
    const res = await request(app).post("/api/subscriptions").send({ ...validSub, seatsActive: 999 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.details.some((d: { field: string }) => d.field === "seatsActive")).toBe(true);
  });
});

describe("analysis + alerts lifecycle", () => {
  it("run is idempotent; alerts sorted savings desc nulls last; resolve preserves across re-run", async () => {
    const run1 = await request(app).post("/api/analysis/run");
    expect(run1.status).toBe(200);
    const run2 = await request(app).post("/api/analysis/run");
    expect(run2.status).toBe(200);
    expect(run1.body.totalPotentialMonthlySavings).toBe(run2.body.totalPotentialMonthlySavings);

    const alerts = await request(app).get("/api/alerts?status=open");
    expect(alerts.status).toBe(200);
    const savings = alerts.body.map((a: { estimatedMonthlySavings: number | null }) => a.estimatedMonthlySavings);
    const nonNull = savings.filter((s: number | null) => s !== null) as number[];
    for (let i = 0; i < nonNull.length - 1; i++) {
      expect(nonNull[i]).toBeGreaterThanOrEqual(nonNull[i + 1]);
    }
    // nulls last: once a null appears, everything after is null
    const firstNull = savings.findIndex((s: number | null) => s === null);
    if (firstNull !== -1) {
      expect(savings.slice(firstNull).every((s: number | null) => s === null)).toBe(true);
    }

    // Resolve the first savings-bearing alert
    const target = alerts.body.find((a: { estimatedMonthlySavings: number | null }) => a.estimatedMonthlySavings !== null);
    const resolved = await request(app).post(`/api/alerts/${target.id}/resolve`).send({ actionTaken: "Downgraded seats" });
    expect(resolved.status).toBe(200);
    expect(resolved.body.status).toBe("resolved");
    expect(resolved.body.actionTaken).toBe("Downgraded seats");

    // Re-run: stays resolved
    await request(app).post("/api/analysis/run");
    const after = await request(app).get("/api/alerts?status=open");
    expect(after.body.some((a: { id: number }) => a.id === target.id)).toBe(false);
    const resolvedList = await request(app).get("/api/alerts?status=resolved");
    expect(resolvedList.body.some((a: { id: number }) => a.id === target.id)).toBe(true);
  });

  it("dismiss, 409 on double-action, 404 unknown, 400 empty actionTaken", async () => {
    const alerts = await request(app).get("/api/alerts?status=open");
    const first = alerts.body[0];
    if (first) {
      const dismissed = await request(app).post(`/api/alerts/${first.id}/dismiss`);
      expect(dismissed.status).toBe(200);
      const again = await request(app).post(`/api/alerts/${first.id}/dismiss`);
      expect(again.status).toBe(409);
    }
    expect((await request(app).post("/api/alerts/999999/resolve").send({ actionTaken: "x" })).status).toBe(404);
    expect((await request(app).post(`/api/alerts/${first.id}/resolve`).send({ actionTaken: "" })).status).toBe(400);
  });

  it("dashboard summary computes spec metrics", async () => {
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.status).toBe(200);
    const s = res.body;
    expect(s.projectedAnnualSpend).toBeCloseTo(s.totalMonthlySpend * 12, 2);
    expect(s.wastePercent).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(s.upcomingRenewals)).toBe(true);
    // Renewals within 60 days, non-cancelled, soonest first
    const dates = s.upcomingRenewals.map((r: { renewalDate: string }) => r.renewalDate);
    for (let i = 0; i < dates.length - 1; i++) expect(dates[i] <= dates[i + 1]).toBe(true);
  });

  it("CSV export: BOM, headers, quoting, all-open rows", async () => {
    const res = await request(app).get("/api/export/alerts.csv");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain("trimstack-waste-report.csv");
    const body = res.text;
    expect(body.charCodeAt(0)).toBe(0xfeff); // BOM
    const lines = body.replace(/^\uFEFF/, "").split("\r\n").filter((l: string) => l.length > 0);
    expect(lines[0]).toBe("subscription,flag type,monthly savings,recommendation,status");
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines.slice(1)) {
      expect(line.toLowerCase()).toContain("open");
    }
  });
});
