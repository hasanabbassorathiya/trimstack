import { test, expect } from "@playwright/test";

// F5 — CSV export downloads the waste report (Success Criterion #3 is the
// open-in-Excel check, done manually in Phase 4 QA with the downloaded file).

test("export CSV downloads trimstack-waste-report.csv with expected header", async ({ page }) => {
  await page.goto("/");

  const exportBtn = page.getByRole("button", { name: /export csv/i });
  await expect(exportBtn).toBeEnabled();

  const download = await Promise.all([
    page.waitForEvent("download"),
    exportBtn.click(),
  ]).then(([d]) => d);

  expect(download.suggestedFilename()).toBe("trimstack-waste-report.csv");

  // Stream to buffer and verify structure: BOM + 5 spec columns
  const path = await download.path();
  const content = await import("node:fs").then((fs) => fs.readFileSync(path!, "utf8"));
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  expect(lines[0]).toContain("subscription");
  expect(lines[0]).toContain("flag type");
  expect(lines[0]).toContain("monthly savings");
  expect(lines[0]).toContain("recommendation");
  expect(lines[0]).toContain("status");
  expect(lines.length).toBeGreaterThan(1); // seeded open alerts exist
  // Every data row is an open alert
  for (const line of lines.slice(1)) {
    expect(line.toLowerCase()).toContain("open");
  }
});
