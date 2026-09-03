import { test, expect } from "@playwright/test";

// F1 — registry table: renders seeded subscriptions, server-side search by
// name/vendor, server-side sort by cost and renewal date with aria-sort.

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
  await search.fill("");

  // Find the cost column index dynamically from its header
  const costIndex = await page
    .locator("th")
    .filter({ hasText: /cost/i })
    .first()
    .evaluate((th) => th.cellIndex);

  const readCosts = async (): Promise<number[]> =>
    rows.evaluateAll((trs, idx) =>
      trs
        .map((tr) => tr.cells[idx]?.textContent ?? "")
        .map((t) => Number(t.replace(/[^0-9.]/g, "")) || 0)
        .filter((n) => n > 0),
    );

  const costHeader = page
    .locator("th")
    .filter({ hasText: /cost/i })
    .getByRole("button");

  // First click: sorted one direction; second click: reversed
  await costHeader.click();
  const first = await readCosts();
  await costHeader.click();
  const second = await readCosts();

  const isAsc = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] <= v);
  const isDesc = (a: number[]) => a.every((v, i) => i === 0 || a[i - 1] >= v);
  expect(isAsc(first) || isDesc(first)).toBe(true);
  expect(isAsc(second) || isDesc(second)).toBe(true);
  expect(isAsc(first)).not.toBe(isAsc(second)); // direction toggled

  // aria-sort reflects state on the sortable header cell
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
  // Toggling again must not error and must keep the table populated
  await renewalHeader.click();
  expect(await rows.count()).toBeGreaterThanOrEqual(20);
});
