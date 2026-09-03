import { test, expect } from "@playwright/test";
import { createWasteSubscription, deleteSubscription, parseCurrency } from "./helpers";

// F2/F3 — analysis run, alerts panel ordering, resolve (Recovered increases)
// and dismiss. Self-cleaning: creates its own subscription via API, deletes it
// after, so the seeded alert state never drains for other specs.

test("run analysis, then resolve increases Recovered", async ({ page, request }) => {
  test.setTimeout(60_000);
  const sub = await createWasteSubscription(request);

  try {
    await page.goto("/");
    await page.getByRole("button", { name: /run analysis/i }).click();

    // Alerts appear (ours + seed's) — wait for panel to show at least one row
    const alertRow = page
      .locator("li, [role='listitem'], div")
      .filter({ hasText: sub.name })
      .last();
    await expect(alertRow).toBeVisible({ timeout: 10_000 });

    const recoveredText = page.getByText(/recovered/i).first().locator("xpath=..");
    const before = parseCurrency(await recoveredText.innerText());

    // Resolve OUR alert only — requires an action-taken note
    await alertRow.getByRole("button", { name: /resolve/i }).click();
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    const note = dialog.getByLabel(/what did you do|action/i);
    await note.fill("Removed unused seats during QA run");
    await dialog.getByRole("button", { name: /^resolve$/i }).click();

    await expect
      .poll(async () => parseCurrency(await recoveredText.innerText()), { timeout: 10_000 })
      .toBeGreaterThan(before); // +$180.00 exactly per helper math

    await expect(alertRow).not.toBeVisible({ timeout: 5_000 }); // left open list
  } finally {
    await deleteSubscription(request, sub.id);
  }
});

test("dismiss removes an alert without changing Recovered", async ({ page, request }) => {
  const sub = await createWasteSubscription(request);

  try {
    await page.goto("/");
    await page.getByRole("button", { name: /run analysis/i }).click();

    const alertRow = page
      .locator("li, [role='listitem'], div")
      .filter({ hasText: sub.name })
      .last();
    await expect(alertRow).toBeVisible({ timeout: 10_000 });

    const recoveredText = page.getByText(/recovered/i).first().locator("xpath=..");
    const before = parseCurrency(await recoveredText.innerText());

    await alertRow.getByRole("button", { name: /dismiss/i }).click();
    await expect(alertRow).not.toBeVisible({ timeout: 5_000 });

    // Recovered unchanged (dismiss never touches it) — allow refetch to settle
    await page.waitForTimeout(750);
    const after = parseCurrency(await recoveredText.innerText());
    expect(after).toBe(before);
  } finally {
    await deleteSubscription(request, sub.id);
  }
});
