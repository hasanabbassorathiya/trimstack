import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiError, listSubscriptions, createSubscription } from "./client";
import { computeSummary, applySearchAndSort } from "./staticDemo";
import type { Alert, Subscription } from "./types";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client error envelope parsing", () => {
  it("throws ApiError with envelope message and field details on 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              message: "Validation failed",
              details: [{ field: "seatsActive", message: "cannot exceed provisioned" }],
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const err = await createSubscription({
      name: "x",
      vendor: "x",
      category: "other",
      monthlyCost: 10,
      billingCycle: "monthly",
      renewalDate: "2026-10-01",
      seatsProvisioned: 10,
      seatsActive: 20,
      owningDepartment: "x",
      status: "active",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("Validation failed");
    expect(err.details?.[0].field).toBe("seatsActive");
  });

  it("throws ApiError with fallback message on non-JSON error bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("gateway timeout", { status: 502 })));

    const err = await listSubscriptions().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(502);
    expect(err.message).toContain("502");
  });

  it("returns parsed JSON on success and passes query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await listSubscriptions({ q: "fig", sort: "desc" as never });
    expect(result).toEqual([]);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/subscriptions?q=fig&sort=desc");
  });
});

// Demo-mode functions are pure data logic — always testable
const sub = (over: Partial<Subscription>): Subscription => ({
  id: 1,
  name: "Tool",
  vendor: "V",
  category: "dev",
  monthlyCost: 100,
  billingCycle: "monthly",
  renewalDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
  seatsProvisioned: 10,
  seatsActive: 10,
  owningDepartment: "Eng",
  status: "active",
  notes: null,
  createdAt: "2026-09-03T00:00:00Z",
  updatedAt: "2026-09-03T00:00:00Z",
  ...over,
});

describe("staticDemo: search and sort", () => {
  it("searches name/vendor case-insensitively and sorts by cost desc", () => {
    const rows = [
      sub({ id: 1, name: "Figma", vendor: "Figma Inc", monthlyCost: 230 }),
      sub({ id: 2, name: "Slack", vendor: "Salesforce", monthlyCost: 460 }),
      sub({ id: 3, name: "Notion", vendor: "Notion Labs", monthlyCost: 160 }),
    ];
    expect(applySearchAndSort(rows, { q: "FIG" }).map((s) => s.name)).toEqual(["Figma"]);
    expect(applySearchAndSort(rows, { q: "labs" }).map((s) => s.name)).toEqual(["Notion"]);
    expect(applySearchAndSort(rows, { sort: "cost", order: "desc" }).map((s) => s.name)).toEqual([
      "Slack",
      "Figma",
      "Notion",
    ]);
    expect(applySearchAndSort(rows, { sort: "cost", order: "asc" }).map((s) => s.name)).toEqual([
      "Notion",
      "Figma",
      "Slack",
    ]);
  });
});

describe("staticDemo: summary math matches server semantics", () => {
  it("excludes cancelled from spend, sums open/resolved, 60-day renewals, waste %", () => {
    const far = new Date(Date.now() + 120 * 86_400_000).toISOString().slice(0, 10);
    const near = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
    const subs = [
      sub({ id: 1, monthlyCost: 100, renewalDate: near }),
      sub({ id: 2, monthlyCost: 200, renewalDate: far, status: "cancelled" }),
      sub({ id: 3, monthlyCost: 300, renewalDate: far, status: "trial" }),
    ];
    const alerts: Alert[] = [
      {
        id: 1,
        subscriptionId: 1,
        subscriptionName: "Tool",
        subscriptionVendor: "V",
        flagType: "inactive_seats",
        status: "open",
        estimatedMonthlySavings: 50,
        recommendation: "Downgrade seats",
        detectedAt: "t",
        resolvedAt: null,
        actionTaken: null,
      },
      {
        id: 2,
        subscriptionId: 3,
        subscriptionName: "Trial Tool",
        subscriptionVendor: "V",
        flagType: "trial_drift",
        status: "resolved",
        estimatedMonthlySavings: 30,
        recommendation: "Decide on trial",
        detectedAt: "t",
        resolvedAt: "t2",
        actionTaken: "kept",
      },
    ];

    const s = computeSummary(subs, alerts);
    expect(s.totalMonthlySpend).toBe(400); // 100 active + 300 trial, cancelled excluded
    expect(s.projectedAnnualSpend).toBe(4800);
    expect(s.wastedMonthly).toBe(50); // open only
    expect(s.recoveredTotal).toBe(30); // resolved only
    expect(s.wastePercent).toBe(12.5); // 50/400
    expect(s.upcomingRenewals.map((r) => r.name)).toEqual(["Tool"]); // only within 60d + non-cancelled
  });
});
