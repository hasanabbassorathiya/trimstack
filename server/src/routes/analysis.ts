import { Router } from "express";
import { runAnalysisOnDb } from "../db/seed.js";
import { createFlagsRepository } from "../db/flagsRepository.js";
import type Database from "better-sqlite3";
import type { AnalysisRunSummary, FlagType } from "../types.js";

export function analysisRouter(db: Database.Database): Router {
  const flags = createFlagsRepository(db);
  const router = Router();

  router.post("/run", (_req, res) => {
    runAnalysisOnDb(db);
    const open = flags.listByStatus("open");

    const flagsByType: Record<FlagType, number> = {
      inactive_seats: 0,
      upcoming_renewal: 0,
      trial_drift: 0,
      duplicate_spend: 0,
    };
    let total = 0;
    for (const alert of open) {
      flagsByType[alert.flagType] += 1;
      total += alert.estimatedMonthlySavings ?? 0;
    }

    const summary: AnalysisRunSummary = {
      flagsByType,
      totalPotentialMonthlySavings: Math.round(total * 100) / 100,
    };
    res.json(summary);
  });

  return router;
}
