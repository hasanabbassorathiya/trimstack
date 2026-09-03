import type { APIRequestContext } from "@playwright/test";

// Shared E2E helpers — self-cleaning state via the API so QA loops never
// drain the seeded alerts (resolve is permanent until its subscription is deleted).

const BASE = process.env.BASE_URL ?? "http://localhost:5173";

const futureDate = (days: number): string =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

// Deterministic waste: 40 provisioned / 10 active seats at $240/mo
// → inactive-seats flag with savings 240 x 30/40 = $180.00 exactly.
// Renewal 90 days out (no renewal/trial flags); unique department + "other"
// category keeps duplicate-spend behavior out of the assertion path.
export async function createWasteSubscription(request: APIRequestContext) {
  const res = await request.post(`${BASE}/api/subscriptions`, {
    data: {
      name: `QA Waste Tool ${Date.now()}`,
      vendor: "QA Vendor",
      category: "other",
      monthlyCost: 240,
      billingCycle: "monthly",
      renewalDate: futureDate(90),
      seatsProvisioned: 40,
      seatsActive: 10,
      owningDepartment: "QA Department",
      status: "active",
      notes: "created by E2E self-cleaning helper",
    },
  });
  if (res.status() !== 201) {
    throw new Error(`create subscription failed: ${res.status()} ${await res.text()}`);
  }
  return (await res.json()) as { id: number; name: string };
}

export async function deleteSubscription(request: APIRequestContext, id: number) {
  const res = await request.delete(`${BASE}/api/subscriptions/${id}`);
  if (res.status() !== 204) {
    throw new Error(`delete subscription ${id} failed: ${res.status()}`);
  }
}

// Parse "$1,234.56" (or "$1,234") into a number.
export function parseCurrency(text: string): number {
  const match = text.replace(/,/g, "").match(/\$(\d+(\.\d+)?)/);
  if (!match) throw new Error(`no currency value in "${text}"`);
  return Number(match[1]);
}
