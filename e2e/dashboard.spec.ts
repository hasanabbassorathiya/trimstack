import { test, expect } from "@playwright/test";

// F4 — the 60-second value moment: fresh install shows all five metrics,
// alerts panel, subscriptions table, and renewals list without any clicks.

test("dashboard renders all F4 sections and five metrics", async ({ page }) => {
  await page.goto("/");

  for (const label of [
    /total monthly spend/i,
    /projected annual/i,
    /wasted monthly/i,
    /recovered/i,
    /waste as .*%|waste %/i,
  ]) {
    await expect(page.getByText(label).first()).toBeVisible();
  }

  await expect(page.getByText(/optimization alerts/i).first()).toBeVisible();
  await expect(page.getByText(/upcoming renewals/i).first()).toBeVisible();
  await expect(page.locator("table").first()).toBeVisible();

  // Seeded data renders as rows (bootstrap analysis ran at first boot)
  const rows = page.locator("table tbody tr");
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThanOrEqual(20);

  // Metric values are present and currency-formatted (mono)
  const hero = page.getByText(/wasted monthly/i).first().locator("xpath=..");
  await expect(hero).toContainText(/\$\d/);
});
