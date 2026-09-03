import type { Alert } from "../types.js";

const FLAG_LABELS: Record<Alert["flagType"], string> = {
  inactive_seats: "Inactive seats",
  upcoming_renewal: "Upcoming renewal",
  trial_drift: "Trial drift",
  duplicate_spend: "Duplicate spend",
};

export const CSV_HEADERS = ["subscription", "flag type", "monthly savings", "recommendation", "status"];

function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function serializeAlertsCsv(alerts: Alert[]): string {
  const lines: string[] = [CSV_HEADERS.join(",")];
  for (const alert of alerts) {
    const savings =
      alert.estimatedMonthlySavings !== null ? alert.estimatedMonthlySavings.toFixed(2) : "";
    const row = [
      alert.subscriptionName,
      FLAG_LABELS[alert.flagType],
      savings,
      alert.recommendation,
      alert.status,
    ];
    lines.push(row.map(escapeField).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

export function csvWithBom(csv: string): Buffer {
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, "utf8")]);
}
