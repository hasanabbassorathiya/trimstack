import { Router } from "express";
import { createSubscriptionsRepository } from "../db/subscriptionsRepository.js";
import { subscriptionCreateSchema, subscriptionUpdateSchema } from "../validation/schemas.js";
import { validate, notFound } from "../validation/validate.js";
import type Database from "better-sqlite3";

export function subscriptionsRouter(db: Database.Database): Router {
  const repo = createSubscriptionsRepository(db);
  const router = Router();

  router.get("/", (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const sort = req.query.sort === "cost" || req.query.sort === "renewal" ? req.query.sort : undefined;
    const order = req.query.order === "asc" || req.query.order === "desc" ? req.query.order : undefined;
    res.json(repo.list({ q, sort, order }));
  });

  router.get("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: { message: "Invalid subscription id" } });
      return;
    }
    const sub = repo.get(id);
    if (!sub) {
      next(notFound("Subscription"));
      return;
    }
    res.json(sub);
  });

  router.post("/", validate(subscriptionCreateSchema), (req, res) => {
    res.status(201).json(repo.create(req.body));
  });

  router.put("/:id", validate(subscriptionUpdateSchema), (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: { message: "Invalid subscription id" } });
      return;
    }
    const current = repo.get(id);
    if (!current) {
      next(notFound("Subscription"));
      return;
    }
    // Merge-then-validate: cross-field rules checked on effective values
    const merged = { ...current, ...req.body };
    const parsed = subscriptionCreateSchema.safeParse(merged);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          message: "Validation failed",
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.map(String).join(".") || "body",
            message: issue.message,
          })),
        },
      });
      return;
    }
    res.json(repo.update(id, parsed.data));
  });

  router.delete("/:id", (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: { message: "Invalid subscription id" } });
      return;
    }
    if (!repo.remove(id)) {
      next(notFound("Subscription"));
      return;
    }
    res.status(204).end();
  });

  return router;
}
