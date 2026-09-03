import { Router } from "express";
import { createFlagsRepository } from "../db/flagsRepository.js";
import { validate, notFound, HttpError } from "../validation/validate.js";
import { resolveAlertSchema } from "../validation/schemas.js";
import type Database from "better-sqlite3";

export function alertsRouter(db: Database.Database): Router {
  const repo = createFlagsRepository(db);
  const router = Router();

  router.get("/", (req, res) => {
    const status =
      req.query.status === "resolved" || req.query.status === "dismissed"
        ? req.query.status
        : "open";
    res.json(repo.listByStatus(status));
  });

  router.post("/:id/resolve", validate(resolveAlertSchema), (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: { message: "Invalid alert id" } });
      return;
    }
    const existing = repo.get(id);
    if (!existing) {
      next(notFound("Alert"));
      return;
    }
    if (existing.status !== "open") {
      next(new HttpError(409, `Alert is already ${existing.status}`));
      return;
    }
    const resolved = repo.resolve(id, req.body.actionTaken);
    res.json(resolved);
  });

  router.post("/:id/dismiss", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: { message: "Invalid alert id" } });
      return;
    }
    const existing = repo.get(id);
    if (!existing) {
      next(notFound("Alert"));
      return;
    }
    if (existing.status !== "open") {
      next(new HttpError(409, `Alert is already ${existing.status}`));
      return;
    }
    res.json(repo.dismiss(id));
  });

  return router;
}
