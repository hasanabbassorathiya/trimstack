import { test, expect } from "@playwright/test";

// NFR — Light/Dark/System theme toggle: deterministic cycle, persistence
// across reload, and System mode following the OS color scheme.
// Cycle is light -> dark -> system; stored default is "system".

async function currentTheme(page: import("@playwright/test").Page): Promise<string> {
  const label = (await page.getByRole("button", { name: /theme/i }).getAttribute("aria-label")) ?? "";
  const match = label.match(/Theme: (\w+)\./i);
  if (!match) throw new Error(`cannot parse theme from "${label}"`);
  return match[1].toLowerCase();
}

test("theme cycles through three states and persists across reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" }); // deterministic system resolution
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /theme/i });
  await expect(toggle).toBeVisible();

  // Normalize to a known start: cycle to system (which resolves light here)
  for (let i = 0; i < 3; i++) {
    if ((await currentTheme(page)) === "system") break;
    await toggle.click();
  }
  expect(await currentTheme(page)).toBe("system");
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  // system -> light -> dark
  await toggle.click();
  expect(await currentTheme(page)).toBe("light");
  await toggle.click();
  expect(await currentTheme(page)).toBe("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);

  // Persistence across reload (stored key + FOUC script)
  await page.reload();
  expect(await currentTheme(page)).toBe("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);

  // Restore system for other specs
  await toggle.click();
  expect(await currentTheme(page)).toBe("system");
});

test("system theme follows OS color scheme live", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /theme/i });

  for (let i = 0; i < 3; i++) {
    if ((await currentTheme(page)) === "system") break;
    await toggle.click();
  }
  expect(await currentTheme(page)).toBe("system");

  // OS flips dark -> app goes dark without reload
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5_000 });

  // And back
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/, { timeout: 5_000 });
});
