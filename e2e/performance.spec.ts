import { test, expect } from "@playwright/test";

// T27 — performance: dashboard interactive < 3s locally; key API calls < 200ms.
// Playwright navigation timing for the page; direct fetch for API sampling.

test("dashboard becomes interactive in < 3s", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  // Interactive = metric strip rendered (not skeletons)
  await page.getByText(/wasted monthly/i).first().waitFor({ timeout: 10_000 });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(3_000);
});

test("key API calls respond < 200ms (p95 sanity)", async ({ page }) => {
  const base = process.env.BASE_URL ?? "http://localhost:5173";

  const timeFetch = async (path: string) => {
    const t0 = Date.now();
    const res = await page.request.get(`${base}${path}`);
    expect(res.ok()).toBeTruthy();
    return Date.now() - t0;
  };

  for (const path of ["/api/health", "/api/subscriptions", "/api/dashboard/summary"]) {
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) samples.push(await timeFetch(path));
    samples.sort((a, b) => a - b);
    const p95 = samples[Math.min(4, samples.length - 1)];
    expect(p95, `${path} p95 ${p95}ms`).toBeLessThan(200);
  }
});
