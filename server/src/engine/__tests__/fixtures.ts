import type { AnalyzeInput } from "../wasteEngine.js";
import type { SubStatus } from "../../types.js";

export function sub(overrides: Partial<AnalyzeInput> & { id: number }): AnalyzeInput {
  return {
    name: `Tool ${overrides.id}`,
    category: "other",
    monthlyCost: 100,
    renewalDate: new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
    seatsProvisioned: 10,
    seatsActive: 10,
    owningDepartment: "Engineering",
    status: "active" as SubStatus,
    ...overrides,
  };
}

export const TODAY = new Date("2026-09-03T00:00:00Z");

export function dateIn(days: number): string {
  return new Date(Date.UTC(2026, 8, 3 + days)).toISOString().slice(0, 10);
}
