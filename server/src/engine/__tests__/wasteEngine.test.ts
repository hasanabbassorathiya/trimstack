import { describe, it, expect } from "vitest";
import { analyzeSubscriptions } from "../wasteEngine.js";
import { sub, TODAY, dateIn } from "./fixtures.js";

const flagsOf = (id: number, type: string, result: ReturnType<typeof analyzeSubscriptions>) =>
  result.filter((f) => f.subscriptionId === id && f.flagType === type);

describe("inactive seats", () => {
  it("computes exact savings: 60 provisioned, 13 active, $230/mo → $180.17", () => {
    const result = analyzeSubscriptions(
      [sub({ id: 1, seatsProvisioned: 60, seatsActive: 13, monthlyCost: 230 })],
      TODAY,
    );
    const flags = flagsOf(1, "inactive_seats", result);
    expect(flags).toHaveLength(1);
    expect(flags[0].estimatedMonthlySavings).toBe(180.17);
  });

  it("computes exact savings: 322 provisioned, 121 active, $460/mo → $287.14", () => {
    const result = analyzeSubscriptions(
      [sub({ id: 1, seatsProvisioned: 322, seatsActive: 121, monthlyCost: 460 })],
      TODAY,
    );
    expect(flagsOf(1, "inactive_seats", result)[0].estimatedMonthlySavings).toBe(287.14);
  });

  it("scales with the unused fraction and no flag when fully used or cancelled", () => {
    const full = analyzeSubscriptions([sub({ id: 1, seatsActive: 10 })], TODAY);
    expect(flagsOf(1, "inactive_seats", full)).toHaveLength(0);

    const cancelled = analyzeSubscriptions(
      [sub({ id: 2, status: "cancelled", seatsActive: 1 })],
      TODAY,
    );
    expect(flagsOf(2, "inactive_seats", cancelled)).toHaveLength(0);

    const half = analyzeSubscriptions([sub({ id: 3, seatsActive: 5, monthlyCost: 100 })], TODAY);
    expect(flagsOf(3, "inactive_seats", half)[0].estimatedMonthlySavings).toBe(50);
  });

  it("still flags inactive seats on trials (waste is waste) with recommendation naming the seat count", () => {
    const result = analyzeSubscriptions(
      [sub({ id: 1, status: "trial", seatsProvisioned: 40, seatsActive: 10, monthlyCost: 240, renewalDate: dateIn(90) })],
      TODAY,
    );
    const flags = flagsOf(1, "inactive_seats", result);
    expect(flags[0].estimatedMonthlySavings).toBe(180);
    expect(flags[0].recommendation).toContain("30 unused seats");
  });
});

describe("upcoming renewal", () => {
  it("flags at exactly 30 days and 1 day, not at 31 days or past-due", () => {
    const at30 = analyzeSubscriptions([sub({ id: 1, renewalDate: dateIn(30) })], TODAY);
    expect(flagsOf(1, "upcoming_renewal", at30)).toHaveLength(1);

    const at1 = analyzeSubscriptions([sub({ id: 1, renewalDate: dateIn(1) })], TODAY);
    expect(flagsOf(1, "upcoming_renewal", at1)).toHaveLength(1);

    const at31 = analyzeSubscriptions([sub({ id: 1, renewalDate: dateIn(31) })], TODAY);
    expect(flagsOf(1, "upcoming_renewal", at31)).toHaveLength(0);

    const pastDue = analyzeSubscriptions([sub({ id: 1, renewalDate: dateIn(-1) })], TODAY);
    expect(flagsOf(1, "upcoming_renewal", pastDue)).toHaveLength(0);
  });

  it("never flags cancelled subs", () => {
    const result = analyzeSubscriptions(
      [sub({ id: 1, status: "cancelled", renewalDate: dateIn(10) })],
      TODAY,
    );
    expect(result.filter((f) => f.subscriptionId === 1)).toHaveLength(0);
  });

  it("carries null savings (risk notice, not a dollar figure)", () => {
    const result = analyzeSubscriptions([sub({ id: 1, renewalDate: dateIn(15) })], TODAY);
    expect(flagsOf(1, "upcoming_renewal", result)[0].estimatedMonthlySavings).toBeNull();
  });
});

describe("trial drift", () => {
  it("flags trial renewing in exactly 14 days, not 15, and only trials", () => {
    const at14 = analyzeSubscriptions([sub({ id: 1, status: "trial", renewalDate: dateIn(14) })], TODAY);
    expect(flagsOf(1, "trial_drift", at14)).toHaveLength(1);
    // A trial within 14d gets ONLY trial_drift (never also upcoming_renewal)
    expect(flagsOf(1, "upcoming_renewal", at14)).toHaveLength(0);

    const at15 = analyzeSubscriptions([sub({ id: 1, status: "trial", renewalDate: dateIn(15) })], TODAY);
    expect(flagsOf(1, "trial_drift", at15)).toHaveLength(0);
    // But an active sub at 15d still gets the plain renewal flag at ≤30
    expect(flagsOf(1, "upcoming_renewal", at15)).toHaveLength(1);

    const activeAt14 = analyzeSubscriptions([sub({ id: 1, status: "active", renewalDate: dateIn(14) })], TODAY);
    expect(flagsOf(1, "trial_drift", activeAt14)).toHaveLength(0);
    expect(flagsOf(1, "upcoming_renewal", activeAt14)).toHaveLength(1);
  });
});

describe("duplicate spend", () => {
  it("3 active same-category subs across 2 departments: cheapest exempt, others flagged with own cost", () => {
    const result = analyzeSubscriptions(
      [
        sub({ id: 1, category: "analytics", monthlyCost: 1150, owningDepartment: "Marketing" }),
        sub({ id: 2, category: "analytics", monthlyCost: 460, owningDepartment: "Finance" }),
        sub({ id: 3, category: "analytics", monthlyCost: 300, owningDepartment: "Engineering" }),
      ],
      TODAY,
    );
    const dup = result.filter((f) => f.flagType === "duplicate_spend");
    expect(dup.map((f) => f.subscriptionId).sort()).toEqual([1, 2]); // cheapest (id 3) exempt
    expect(dup.find((f) => f.subscriptionId === 1)!.estimatedMonthlySavings).toBe(1150);
    expect(dup.find((f) => f.subscriptionId === 2)!.estimatedMonthlySavings).toBe(460);
  });

  it("same department duplicates: no flags; single-sub category: no flags", () => {
    const sameDept = analyzeSubscriptions(
      [
        sub({ id: 1, category: "dev", monthlyCost: 100, owningDepartment: "Engineering" }),
        sub({ id: 2, category: "dev", monthlyCost: 90, owningDepartment: "Engineering" }),
      ],
      TODAY,
    );
    expect(sameDept.filter((f) => f.flagType === "duplicate_spend")).toHaveLength(0);

    const single = analyzeSubscriptions([sub({ id: 3, category: "hr" })], TODAY);
    expect(single).toHaveLength(0);
  });

  it("ignores cancelled subs in duplicate detection and tie-breaks cheapest by name", () => {
    const withCancelled = analyzeSubscriptions(
      [
        sub({ id: 1, category: "design", monthlyCost: 100, owningDepartment: "A" }),
        sub({ id: 2, category: "design", monthlyCost: 90, owningDepartment: "B", status: "cancelled" }),
      ],
      TODAY,
    );
    expect(withCancelled.filter((f) => f.flagType === "duplicate_spend")).toHaveLength(0);

    // Tie on cost: cheaper-by-name (Alpha) exempt; Beta flagged
    const tie = analyzeSubscriptions(
      [
        sub({ id: 1, name: "Beta Tool", category: "design", monthlyCost: 100, owningDepartment: "A" }),
        sub({ id: 2, name: "Alpha Tool", category: "design", monthlyCost: 100, owningDepartment: "B" }),
      ],
      TODAY,
    );
    const dup = tie.filter((f) => f.flagType === "duplicate_spend");
    expect(dup.map((f) => f.subscriptionId)).toEqual([1]);
  });
});

describe("determinism and boundaries", () => {
  it("empty input produces no flags; identical input produces identical output", () => {
    expect(analyzeSubscriptions([], TODAY)).toEqual([]);
    const a = analyzeSubscriptions([sub({ id: 1, seatsActive: 2 })], TODAY);
    const b = analyzeSubscriptions([sub({ id: 1, seatsActive: 2 })], TODAY);
    expect(a).toEqual(b);
  });

  it("output is sorted by subscription id then flag type", () => {
    const result = analyzeSubscriptions(
      [
        sub({ id: 2, seatsActive: 1, renewalDate: dateIn(10) }),
        sub({ id: 1, seatsActive: 1, renewalDate: dateIn(10) }),
      ],
      TODAY,
    );
    expect(result.map((f) => f.subscriptionId)).toEqual([1, 1, 2, 2]);
  });
});
