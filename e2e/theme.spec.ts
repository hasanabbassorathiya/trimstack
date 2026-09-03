import { test, expect } from "@playwright/test";

// NFR — Light/Dark/System theme toggle: cycling, persistence across reload,
// and System mode following the OS color scheme. Toggle aria-label announces
// state per frontend-design-spec §2.

const THEMES = ["light", "dark", "system"] as const;

test("theme cycles through three states and persists across reload", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: /theme/i });
  await expect(toggle).toBeVisible();

  // Cycle light -> dark -> system; after each click the doc class flips when resolved-dark
  await toggle.click(); // -> dark
  await expect(page.locator("html")).toHaveClass(/dark/);
  await toggle.click(); // -> system
  // system resolves via emulation (default light unless colorScheme: dark project)
  await toggle.click(); // -> light
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  // Persist: set dark explicitly, reload, still dark
  await toggle.click(); // -> dark again
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/); // FOUC script + stored key

  // Restore default (system) for other specs
  await toggle.click(); // -> system
});

test("system theme follows OS color scheme live", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /theme/i });

  // Ensure we are in system mode
  for (let i = 0; i < THEMES.length; i++) {
    const label = (await toggle.getAttribute("aria-label")) ?? "";
    if (/system/i.test(label)) break;
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute("aria-label", /system/i, { timeout: 5_000 });

  // Emulate OS dark -> app goes dark without reload
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5_000 });

  // And back
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/, { timeout: 5_000 });
});
