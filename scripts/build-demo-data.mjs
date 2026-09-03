#!/usr/bin/env node
// Builds the static demo snapshot for GitHub Pages from the running API
// (http://localhost:3001). Writes web/public/demo/data.json:
//   { subscriptions: Subscription[], alerts: Alert[] }
// The hosted demo is read-only for editing; resolve/dismiss operate on
// in-memory copies in the browser (staticDemo.ts).

const API = process.env.API_URL ?? "http://localhost:3001";

async function main() {
  const [subsRes, alertsRes] = await Promise.all([
    fetch(`${API}/api/subscriptions`),
    fetch(`${API}/api/alerts?status=open`),
  ]);
  if (!subsRes.ok || !alertsRes.ok) {
    console.error(`API not ready (subs ${subsRes.status}, alerts ${alertsRes.status}) — start dev servers first`);
    process.exit(2);
  }
  const subscriptions = await subsRes.json();
  const alerts = await alertsRes.json();
  const data = { subscriptions, alerts };
  const fs = await import("node:fs/promises");
  await fs.mkdir("web/public/demo", { recursive: true });
  await fs.writeFile("web/public/demo/data.json", JSON.stringify(data, null, 2));
  const waste = alerts.reduce((sum, a) => sum + (a.estimatedMonthlySavings ?? 0), 0);
  console.log(
    `demo snapshot: ${subscriptions.length} subscriptions, ${alerts.length} open alerts, $${waste.toFixed(2)}/mo potential waste`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
