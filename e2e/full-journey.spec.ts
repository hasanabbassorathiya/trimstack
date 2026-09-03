import { test, expect } from "@playwright/test";
import { createWasteSubscription, deleteSubscription, parseCurrency, alertRowFor } from "./helpers";

// T27 — full user journeys against the live seeded app.
// (a) 60-second value moment (b) add -> analyze -> resolve -> Recovered
// (c) landing -> CTA -> dashboard

const BASE = process.env.BASE_URL ?? "http://localhost:5173";

test("journey: fresh dashboard shows waste with zero user actions", async ({ page }) => {
  await page.goto("/");
  await page.getByText(/wasted monthly/i).first().waitFor({ timeout: 10_000 });
  await expect(page.locator("table tbody tr").first()).toBeVisible();
  const alertCount = await page
    .getByText(/inactive seats|upcoming renewal|trial drift|duplicate spend/i)
    .count();
  expect(alertCount).toBeGreaterThan(0);
});

test("journey: add subscription, run analysis, resolve, Recovered increases", async ({ page, request }) => {
  test.setTimeout(90_000);
  await page.goto("/");

  // --- Add subscription via the form (UI journey, not API) ---
  await page.getByRole("button", { name: /add subscription/i }).click();
  const dialog = page.locator("[role='dialog']");
  await dialog.waitFor();

  const stamp = Date.now();
  await dialog.getByLabel(/^name/i).fill(`QA Journey Tool ${stamp}`);
  await dialog.getByLabel(/vendor/i).fill("QA Journey Vendor");
  await dialog.getByLabel(/category/i).selectOption("dev");
  await dialog.getByLabel(/monthly cost/i).fill("360");
  await dialog.getByLabel(/renewal date/i).fill(
    new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
  );
  await dialog.getByLabel(/seats provisioned/i).fill("50");
  await dialog.getByLabel(/seats active/i).fill("5");
  await dialog.getByLabel(/department/i).fill("Engineering");
  await dialog.getByRole("button", { name: /add subscription|save/i }).click();

  const newRow = page.getByText(`QA Journey Tool ${stamp}`).first();
  await newRow.waitFor({ timeout: 10_000 }); // row appears without reload

  // --- Run analysis ---
  await page.getByRole("button", { name: /run analysis/i }).click();
  const alertRow = alertRowFor(page, `QA Journey Tool ${stamp}`);
  await alertRow.waitFor({ timeout: 15_000 });

  // Savings math visible: 360 x 45/50 = $324.00/mo potential
  await expect(alertRow).toContainText(/324/);

  // --- Resolve ---
  const recoveredText = page.getByText(/recovered/i).first().locator("xpath=..");
  const before = parseCurrency(await recoveredText.innerText());

  await alertRow.getByRole("button", { name: /resolve/i }).click();
  const resolveDialog = page.locator("[role='dialog']");
  await resolveDialog.getByLabel(/what did you do|action/i).fill("Cancelled unused seats");
  await resolveDialog.getByRole("button", { name: /^resolve$/i }).click();

  await expect
    .poll(async () => parseCurrency(await recoveredText.innerText()), { timeout: 10_000 })
    .toBeGreaterThan(before);

  // --- Cleanup via API (cascade removes flags too). External API changes
  // aren't pushed to an already-loaded page (no realtime sync in v1 scope),
  // so verify on a fresh load.
  const subs = await request.get(`${BASE}/api/subscriptions?q=${encodeURIComponent(`QA Journey Tool ${stamp}`)}`);
  const list = (await subs.json()) as Array<{ id: number }>;
  for (const s of list) await deleteSubscription(request, s.id);
  await page.reload();
  await page.getByText(/wasted monthly/i).first().waitFor();
  await expect(page.getByText(`QA Journey Tool ${stamp}`)).toHaveCount(0);
});

test("journey: landing -> CTA -> dashboard", async ({ page }) => {
  await page.goto("/landing");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const cta = page.getByRole("button", { name: /open the dashboard/i }).first();
  await cta.click();
  await expect(page.getByText(/wasted monthly/i).first()).toBeVisible({ timeout: 10_000 });
  // URL updated by pushState routing
  expect(page.url()).not.toContain("/landing");
});
