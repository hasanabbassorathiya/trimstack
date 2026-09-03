import type { AnalyzeInput } from "../engine/wasteEngine.js";

interface SeedRow extends Omit<AnalyzeInput, "id" | "renewalDate"> {
  vendor: string;
  renewalOffsetDays: number;
}

// 24-row demo catalog. Offsets are relative to seed time so the demo never
// goes stale. Coverage: all 9 categories, 5 departments, all four flag types
// triggered, plus several clean subscriptions with no flags.
export const SEED_CATALOG: SeedRow[] = [
  // --- Inactive seats (F2 flag 1) ---
  { name: "Slack", vendor: "Salesforce", category: "productivity", monthlyCost: 460, owningDepartment: "Engineering", status: "active", seatsProvisioned: 322, seatsActive: 201, renewalOffsetDays: 90 },
  { name: "Figma", vendor: "Figma Inc", category: "design", monthlyCost: 230, owningDepartment: "Design", status: "active", seatsProvisioned: 60, seatsActive: 13, renewalOffsetDays: 120 },
  { name: "Zoom", vendor: "Zoom Video", category: "productivity", monthlyCost: 189, owningDepartment: "Sales", status: "active", seatsProvisioned: 100, seatsActive: 62, renewalOffsetDays: 200 },
  { name: "Jira", vendor: "Atlassian", category: "dev", monthlyCost: 420, owningDepartment: "Engineering", status: "active", seatsProvisioned: 180, seatsActive: 96, renewalOffsetDays: 75 },

  // --- Upcoming renewals (flag 2) ---
  { name: "Salesforce", vendor: "Salesforce", category: "sales", monthlyCost: 1150, owningDepartment: "Sales", status: "active", seatsProvisioned: 40, seatsActive: 38, renewalOffsetDays: 21 },
  { name: "Confluence", vendor: "Atlassian", category: "productivity", monthlyCost: 310, owningDepartment: "Engineering", status: "active", seatsProvisioned: 150, seatsActive: 150, renewalOffsetDays: 28 },

  // --- Trial drift (flag 3) ---
  { name: "Mixpanel", vendor: "Mixpanel", category: "analytics", monthlyCost: 140, owningDepartment: "Marketing", status: "trial", seatsProvisioned: 25, seatsActive: 25, renewalOffsetDays: 9 },
  { name: "Greenhouse", vendor: "Greenhouse", category: "hr", monthlyCost: 520, owningDepartment: "People", status: "trial", seatsProvisioned: 30, seatsActive: 30, renewalOffsetDays: 12 },

  // --- Duplicate spend (flag 4): analytics cluster across departments ---
  { name: "Tableau", vendor: "Salesforce", category: "analytics", monthlyCost: 900, owningDepartment: "Finance", status: "active", seatsProvisioned: 20, seatsActive: 20, renewalOffsetDays: 150 },
  { name: "Looker", vendor: "Google", category: "analytics", monthlyCost: 620, owningDepartment: "Marketing", status: "active", seatsProvisioned: 15, seatsActive: 15, renewalOffsetDays: 60 },
  // (Mixpanel trial above is category=analytics too but trial status excludes it from duplicate detection)

  // --- Clean subscriptions (no flags) ---
  { name: "GitHub", vendor: "Microsoft", category: "dev", monthlyCost: 340, owningDepartment: "Engineering", status: "active", seatsProvisioned: 85, seatsActive: 84, renewalOffsetDays: 240 },
  { name: "1Password", vendor: "AgileBits", category: "security", monthlyCost: 145, owningDepartment: "Engineering", status: "active", seatsProvisioned: 90, seatsActive: 90, renewalOffsetDays: 300 },
  { name: "Notion", vendor: "Notion Labs", category: "productivity", monthlyCost: 160, owningDepartment: "People", status: "active", seatsProvisioned: 70, seatsActive: 70, renewalOffsetDays: 45 },
  { name: "Datadog", vendor: "Datadog", category: "analytics", monthlyCost: 780, owningDepartment: "Engineering", status: "active", seatsProvisioned: 50, seatsActive: 50, renewalOffsetDays: 180 },
  { name: "HubSpot", vendor: "HubSpot", category: "marketing", monthlyCost: 560, owningDepartment: "Marketing", status: "active", seatsProvisioned: 35, seatsActive: 34, renewalOffsetDays: 95 },
  { name: "Zendesk", vendor: "Zendesk", category: "sales", monthlyCost: 285, owningDepartment: "Sales", status: "active", seatsProvisioned: 45, seatsActive: 45, renewalOffsetDays: 130 },
  { name: "Asana", vendor: "Asana", category: "productivity", monthlyCost: 210, owningDepartment: "Design", status: "active", seatsProvisioned: 40, seatsActive: 40, renewalOffsetDays: 210 },
  { name: "Rippling", vendor: "Rippling", category: "hr", monthlyCost: 470, owningDepartment: "People", status: "active", seatsProvisioned: 60, seatsActive: 60, renewalOffsetDays: 260 },
  { name: "Expensify", vendor: "Expensify", category: "hr", monthlyCost: 190, owningDepartment: "Finance", status: "active", seatsProvisioned: 50, seatsActive: 50, renewalOffsetDays: 55 },
  { name: "Canva", vendor: "Canva", category: "design", monthlyCost: 120, owningDepartment: "Marketing", status: "active", seatsProvisioned: 25, seatsActive: 25, renewalOffsetDays: 170 },

  // --- Cancelled (never flags, still visible in registry) ---
  { name: "Trello", vendor: "Atlassian", category: "productivity", monthlyCost: 150, owningDepartment: "Engineering", status: "cancelled", seatsProvisioned: 80, seatsActive: 0, renewalOffsetDays: -30 },

  // --- Trial NOT near renewal (no trial_drift; far date) ---
  { name: "Webflow", vendor: "Webflow", category: "design", monthlyCost: 240, owningDepartment: "Marketing", status: "trial", seatsProvisioned: 12, seatsActive: 12, renewalOffsetDays: 40 },

  // --- Extra dev cluster for table depth ---
  { name: "Sentry", vendor: "Functional Software", category: "dev", monthlyCost: 260, owningDepartment: "Engineering", status: "active", seatsProvisioned: 45, seatsActive: 45, renewalOffsetDays: 110 },

  // --- Other category (9th) ---
  { name: "Calendly", vendor: "Calendly", category: "other", monthlyCost: 90, owningDepartment: "Sales", status: "active", seatsProvisioned: 30, seatsActive: 30, renewalOffsetDays: 65 },
];
