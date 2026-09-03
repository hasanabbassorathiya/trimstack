import { describe, it, expect } from "vitest";
import { subscriptionCreateSchema, subscriptionUpdateSchema, resolveAlertSchema } from "../validation/schemas.js";

const valid = {
  name: "Figma",
  vendor: "Figma Inc",
  category: "design" as const,
  monthlyCost: 230,
  billingCycle: "monthly" as const,
  renewalDate: "2026-10-15",
  seatsProvisioned: 60,
  seatsActive: 13,
  owningDepartment: "Design",
  status: "active" as const,
};

describe("subscriptionCreateSchema", () => {
  it("accepts a valid payload", () => {
    expect(subscriptionCreateSchema.parse(valid).name).toBe("Figma");
  });

  it("rejects invalid category/status/billingCycle", () => {
    expect(subscriptionCreateSchema.safeParse({ ...valid, category: "nope" }).success).toBe(false);
    expect(subscriptionCreateSchema.safeParse({ ...valid, status: "paused" }).success).toBe(false);
    expect(subscriptionCreateSchema.safeParse({ ...valid, billingCycle: "weekly" }).success).toBe(false);
  });

  it("rejects non-positive cost and non-integer/negative seats", () => {
    expect(subscriptionCreateSchema.safeParse({ ...valid, monthlyCost: 0 }).success).toBe(false);
    expect(subscriptionCreateSchema.safeParse({ ...valid, monthlyCost: -5 }).success).toBe(false);
    expect(subscriptionCreateSchema.safeParse({ ...valid, seatsProvisioned: 2.5 }).success).toBe(false);
    expect(subscriptionCreateSchema.safeParse({ ...valid, seatsActive: -1 }).success).toBe(false);
  });

  it("rejects invalid calendar dates", () => {
    expect(subscriptionCreateSchema.safeParse({ ...valid, renewalDate: "2026-02-30" }).success).toBe(false);
    expect(subscriptionCreateSchema.safeParse({ ...valid, renewalDate: "10/15/2026" }).success).toBe(false);
  });

  it("rejects seatsActive > seatsProvisioned (cross-field)", () => {
    const res = subscriptionCreateSchema.safeParse({ ...valid, seatsActive: 61 });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].path).toContain("seatsActive");
    }
  });
});

describe("subscriptionUpdateSchema", () => {
  it("accepts partial updates and re-validates cross-field when both present", () => {
    expect(subscriptionUpdateSchema.parse({ name: "New" }).name).toBe("New");
    expect(subscriptionUpdateSchema.safeParse({ seatsProvisioned: 5, seatsActive: 10 }).success).toBe(false);
  });
});

describe("resolveAlertSchema", () => {
  it("requires non-empty actionTaken", () => {
    expect(resolveAlertSchema.safeParse({ actionTaken: "" }).success).toBe(false);
    expect(resolveAlertSchema.parse({ actionTaken: "Downgraded seats" }).actionTaken).toBe("Downgraded seats");
  });
});
