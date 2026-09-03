import { Router } from "express";
import { createFlagsRepository } from "../db/flagsRepository.js";
import { serializeAlertsCsv, csvWithBom } from "../export/csv.js";
import type Database from "better-sqlite3";

export function exportRouter(db: Database.Database): Router {
  const repo = createFlagsRepository(db);
  const router = Router();

  router.get("/alerts.csv", (_req, res) => {
    const csv = serializeAlertsCsv(repo.listByStatus("open"));
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="trimstack-waste-report.csv"');
    res.send(csvWithBom(csv));
  });

  return router;
}
