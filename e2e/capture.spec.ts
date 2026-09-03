import { test, expect } from "@playwright/test";
import { createWasteSubscription, deleteSubscription } from "./helpers";
import { alertRowFor } from "./helpers";

const SHOT = (name: string) => `qa-screenshots/${name}.png`;

test("@capture dashboard — desktop/tablet/mobile evidence", async ({ page }, testInfo) => {
  await page.goto("/");
  // Mobile renders stacked cards (no table) — wait on data either way
  await page.getByText(/wasted monthly/i).first().waitFor();
  await page
    .locator('section[aria-label="Optimization alerts"]')
    .first()
    .waitFor();
  await page.screenshot({ path: SHOT(`dashboard-${testInfo.project.name}`), fullPage: true });
});

test("@capture dark mode (forced) — dashboard", async ({ page }, testInfo) => {
  // Distinct filename: this test runs under every @capture project and forces
  // .dark — must never clobber the light captures from test 1.
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.getByText(/wasted monthly/i).first().waitFor();
  await page.screenshot({
    path: SHOT(`dashboard-forced-dark-${testInfo.project.name}`),
    fullPage: true,
  });
});

test("@capture run-analysis before/after", async ({ page, request }, testInfo) => {
  const sub = await createWasteSubscription(request);
  try {
    await page.goto("/");
    await page.getByText(/wasted monthly/i).first().waitFor();
    await page.screenshot({ path: SHOT(`run-analysis-before-${testInfo.project.name}`) });
    await page.getByRole("button", { name: /run analysis/i }).click();
    const alertRow = alertRowFor(page, sub.name);
    await expect(alertRow).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: SHOT(`run-analysis-after-${testInfo.project.name}`) });
  } finally {
    await deleteSubscription(request, sub.id);
  }
});

test("@capture resolve-alert before/after", async ({ page, request }, testInfo) => {
  const sub = await createWasteSubscription(request);
  try {
    await page.goto("/");
    await page.getByRole("button", { name: /run analysis/i }).click();
    const alertRow = alertRowFor(page, sub.name);
    await expect(alertRow).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: SHOT(`resolve-before-${testInfo.project.name}`) });

    await alertRow.getByRole("button", { name: /resolve/i }).click();
    const dialog = page.locator("[role='dialog']");
    await dialog.waitFor();
    await dialog.getByLabel(/what did you do|action/i).fill("Removed unused seats");
    await page.screenshot({ path: SHOT(`resolve-dialog-${testInfo.project.name}`) });
    await dialog.getByRole("button", { name: /^resolve$/i }).click();
    await expect(alertRow).not.toBeVisible({ timeout: 5_000 });
    await page.screenshot({ path: SHOT(`resolve-after-${testInfo.project.name}`) });
  } finally {
    await deleteSubscription(request, sub.id);
  }
});

test("@capture landing page — all viewports", async ({ page }, testInfo) => {
  await page.goto("/landing");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.screenshot({ path: SHOT(`landing-${testInfo.project.name}`), fullPage: true });
});
