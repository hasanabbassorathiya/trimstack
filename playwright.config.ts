import { defineConfig } from "@playwright/test";

// T24 — E2E + QA evidence capture.
// Runs against an ALREADY-RUNNING app (orchestrator owns server lifecycle):
//   web :5173 (proxies /api to :3001) — override with BASE_URL.
// Evidence output: qa-screenshots/ (PNGs) + test-results.json (JSON reporter).
// workers: 1 — specs mutate shared dev-DB state (resolve/dismiss); sequential keeps them deterministic.

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [["line"], ["json", { outputFile: "test-results.json" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5173",
    trace: "retain-on-failure",
    channel: "chrome", // system Chrome — avoids the Playwright CDN download
  },
  projects: [
    // Functional specs + evidence captures
    { name: "desktop", use: { viewport: { width: 1280, height: 720 } } },
    // Evidence captures only (grep-tagged)
    { name: "tablet", grep: /@capture/, use: { viewport: { width: 768, height: 1024 } } },
    { name: "mobile", grep: /@capture/, use: { viewport: { width: 375, height: 667 } } },
    { name: "dark", grep: /@capture/, use: { viewport: { width: 1280, height: 720 }, colorScheme: "dark" } },
  ],
});
