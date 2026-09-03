import { Router } from "express";
import { createFlagsRepository } from "../db/flagsRepository.js";
import type Database from "better-sqlite3";

export function dashboardRouter(db: Database.Database): Router {
  const repo = createFlagsRepository(db);
  const router = Router();

  router.get("/summary", (_req, res) => {
    res.json(repo.summary());
  });

  return router;
}
