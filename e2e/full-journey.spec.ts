import { test, expect } from "@playwright/test";
import { createWasteSubscription, deleteSubscription, parseCurrency } from "./helpers";

// T27 — full user journeys against the live seeded app.
// (a) 60-second value moment: fresh dashboard shows waste with zero clicks
// (b) add subscription -> run analysis -> resolve -> Recovered increases
// (c) landing -> CTA -> dashboard

test("journey: fresh dashboard shows waste with zero user actions", async ({ page }) => {
  // Bootstrap analysis (first boot) means a fresh install shows metrics + alerts
  await page.goto("/");
  await page.getByText(/wasted monthly/i).first().waitFor({ timeout: 10_000 });
  await expect(page.locator("table tbody tr").first()).toBeVisible();
  // At least one open alert exists from the seeded dataset (bootstrap run)
  const alertCount = await page.getByText(/inactive seats|upcoming renewal|trial drift|duplicate spend/i).count();
  expect(alertCount).toBeGreaterThan(0);
});

test("journey: add subscription, run analysis, resolve, Recovered increases", async ({ page, request }) => {
  test.setTimeout(90_000);
  await page.goto("/");

  // --- Add subscription via the form (UI journey, not API) ---
  await page.getByRole("button", { name: /add subscription/i }).click();
  const form = page.locator("[role='dialog'], form").first();
  await form.waitFor();

  const stamp = Date.now();
  await form.getByLabel(/^name/i).fill(`QA Journey Tool ${stamp}`);
  await form.getByLabel(/vendor/i).fill("QA Journey Vendor");
  await form.getByLabel(/monthly cost/i).fill("360");
  await form.getByLabel(/renewal date/i).fill(new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10));
  await form.getByLabel(/seats provisioned/i).fill("50");
  await form.getByLabel(/seats active/i).fill("5");
  await form.getByLabel(/department/i).fill("QA Journey Dept");
  await form.getByRole("button", { name: /add subscription|save/i }).click();

  const newRow = page.getByText(`QA Journey Tool ${stamp}`).first();
  await newRow.waitFor({ timeout: 10_000 }); // row appears without reload

  // --- Run analysis ---
  await page.getByRole("button", { name: /run analysis/i }).click();
  const alertRow = page
    .locator("li, [role='listitem'], div")
    .filter({ hasText: `QA Journey Tool ${stamp}` })
    .last();
  await alertRow.waitFor({ timeout: 15_000 });

  // Savings math visible: 360 x 45/50 = $324.00/mo potential
  await expect(alertRow).toContainText(/324/);

  // --- Resolve ---
  const recoveredText = page.getByText(/recovered/i).first().locator("xpath=..");
  const before = parseCurrency(await recoveredText.innerText());

  await alertRow.getByRole("button", { name: /resolve/i }).click();
  const dialog = page.locator("[role='dialog']");
  await dialog.getByLabel(/what did you do|action/i).fill("Cancelled unused seats");
  await dialog.getByRole("button", { name: /^resolve$/i }).click();

  await expect
    .poll(async () => parseCurrency(await recoveredText.innerText()), { timeout: 10_000 })
    .toBeGreaterThan(before);

  // --- Cleanup via API (cascade removes flags too) ---
  const subs = await request.get(`${process.env.BASE_URL ?? "http://localhost:5173"}/api/subscriptions?q=${encodeURIComponent(`QA Journey Tool ${stamp}`)}`);
  const list = (await subs.json()) as Array<{ id: number }>;
  for (const s of list) await deleteSubscription(request, s.id);
  await expect(newRow).not.toBeVisible({ timeout: 5_000 });
});

test("journey: landing -> CTA -> dashboard", async ({ page }) => {
  await page.goto("/landing");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const cta = page.getByRole("link", { name: /open the dashboard|dashboard/i }).first();
  await cta.click();
  await expect(page.getByText(/wasted monthly/i).first()).toBeVisible({ timeout: 10_000 });
});
