import { test, expect } from "@playwright/test";
import { createWasteSubscription, deleteSubscription } from "./helpers";

// T24 evidence captures — tagged @capture: run under tablet/mobile/dark
// projects (plus desktop) to produce the qa-screenshots/ set for Evidence QA
// and Reality Check. Screenshots land in qa-screenshots/ relative to cwd.

const SHOT = (name: string) => `qa-screenshots/${name}.png`;

test("@capture dashboard — desktop/tablet/mobile evidence", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.locator("table tbody tr").first().waitFor();
  await expect(page.getByText(/wasted monthly/i).first()).toBeVisible();
  await page.screenshot({ path: SHOT(`dashboard-${testInfo.project.name}`), fullPage: true });
});

test("@capture dark mode — dashboard", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  // Force .dark explicitly for a deterministic dark capture (independent of toggle state)
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.locator("table tbody tr").first().waitFor();
  await page.screenshot({ path: SHOT(`dashboard-${testInfo.project.name}`), fullPage: true });
});

test("@capture run-analysis before/after", async ({ page, request }, testInfo) => {
  const sub = await createWasteSubscription(request);
  try {
    await page.goto("/");
    await page.screenshot({ path: SHOT(`run-analysis-before-${testInfo.project.name}`) });
    await page.getByRole("button", { name: /run analysis/i }).click();
    await page
      .getByText(sub.name)
      .last()
      .waitFor({ timeout: 10_000 });
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
    const alertRow = page
      .locator("li, [role='listitem'], div")
      .filter({ hasText: sub.name })
      .last();
    await alertRow.waitFor({ timeout: 10_000 });
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
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: SHOT(`landing-${testInfo.project.name}`), fullPage: true });
});
