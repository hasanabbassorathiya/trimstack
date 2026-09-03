import { test, expect } from "@playwright/test";

// F1 — registry table: seeded rows render, server-side search by name/vendor,
// server-side sort by cost with aria-sort. Desktop project only (mobile renders
// stacked cards, not the table).

test("subscriptions table: search filters and cost sort toggles", async ({ page }) => {
  await page.goto("/");

  const rows = page.locator("table tbody tr");
  await rows.first().waitFor();
  const initialCount = await rows.count();
  expect(initialCount).toBeGreaterThanOrEqual(20);

  // Search by seeded vendor/name (seed catalog includes Figma)
  const search = page.getByLabel(/search/i);
  await search.fill("fig");
  await expect
    .poll(async () => await rows.count(), { timeout: 5_000 })
    .toBeLessThan(initialCount);
  expect((await page.getByText(/figma/i).count())).toBeGreaterThan(0);
  await search.fill("");
  await expect.poll(async () => await rows.count(), { timeout: 5_000 }).toBe(initialCount);

  const costIndex = await page
    .locator("th")
    .filter({ hasText: /cost/i })
    .first()
    .evaluate((th) => th.cellIndex);

  const readCosts = async (): Promise<number[]> =>
    rows.evaluateAll(
      (trs, idx) =>
        trs
          .map((tr) => (tr as HTMLTableRowElement).cells[idx as number]?.textContent ?? "")
          .map((t) => Number(t.replace(/[^0-9.]/g, "")) || 0)
          .filter((n) => n > 0),
      costIndex,
    );

  const costHeader = page
    .locator("th")
    .filter({ hasText: /cost/i })
    .getByRole("button");

  // First click sorts; wait for the refetch to settle before reading
  await costHeader.click();
  await page.waitForTimeout(600);
  const first = await readCosts();

  await costHeader.click();
  await page.waitForTimeout(600);
  const second = await readCosts();

  const isAsc = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] <= v);
  const isDesc = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] >= v);
  expect(isAsc(first) || isDesc(first)).toBe(true);
  expect(isAsc(second) || isDesc(second)).toBe(true);
  expect(isAsc(first)).not.toBe(isAsc(second)); // direction toggled

  const sortState = await page
    .locator("th")
    .filter({ hasText: /cost/i })
    .first()
    .getAttribute("aria-sort");
  expect(sortState).toMatch(/ascending|descending/);
});

test("renewal date header is sortable", async ({ page }) => {
  await page.goto("/");
  const renewalHeader = page
    .locator("th")
    .filter({ hasText: /renewal/i })
    .getByRole("button");
  await renewalHeader.click();
  const rows = page.locator("table tbody tr");
  await expect(rows.first()).toBeVisible();
  await page.waitForTimeout(600);
  await renewalHeader.click();
  await page.waitForTimeout(600);
  expect(await rows.count()).toBeGreaterThanOrEqual(20);
});
