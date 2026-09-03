import Database from "better-sqlite3";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";

const DDL = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  vendor TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dev','design','marketing','sales','productivity','security','analytics','hr','other')),
  monthly_cost REAL NOT NULL CHECK (monthly_cost > 0),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly','annual')),
  renewal_date TEXT NOT NULL,
  seats_provisioned INTEGER NOT NULL CHECK (seats_provisioned >= 0),
  seats_active INTEGER NOT NULL CHECK (seats_active >= 0 AND seats_active <= seats_provisioned),
  owning_department TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','trial','cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('inactive_seats','upcoming_renewal','trial_drift','duplicate_spend')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  estimated_monthly_savings REAL,
  recommendation TEXT NOT NULL,
  detected_at TEXT NOT NULL,
  resolved_at TEXT,
  action_taken TEXT,
  UNIQUE (subscription_id, flag_type)
);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_cost ON subscriptions(monthly_cost);
CREATE INDEX IF NOT EXISTS idx_subs_renewal ON subscriptions(renewal_date);
CREATE INDEX IF NOT EXISTS idx_flags_status ON flags(status);
`;

export function createDatabase(dbPath?: string): Database.Database {
  const path = resolve(dbPath ?? process.env.DB_PATH ?? "server/data/trimstack.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("foreign_keys = ON");
  db.exec(DDL);
  return db;
}

// Test helper: isolated throwaway DB per test file
export function createTempDatabase(): Database.Database {
  const dir = mkdtempSync(`${tmpdir()}/trimstack-test-`);
  return createDatabase(`${dir}/test.sqlite`);
}
