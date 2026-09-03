import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import type Database from "better-sqlite3";
import { subscriptionsRouter } from "./routes/subscriptions.js";
import { analysisRouter } from "./routes/analysis.js";
import { alertsRouter } from "./routes/alerts.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { exportRouter } from "./routes/export.js";
import { seedIfEmpty, runAnalysisOnDb } from "./db/seed.js";

export function createApp(db: Database.Database): express.Express {
  // First-run bootstrap: seed + inline analysis so a fresh install shows
  // waste on the dashboard immediately (Success Criterion #1). No scheduler.
  if (seedIfEmpty(db)) {
    runAnalysisOnDb(db);
  }

  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api/subscriptions", subscriptionsRouter(db));
  app.use("/api/analysis", analysisRouter(db));
  app.use("/api/alerts", alertsRouter(db));
  app.use("/api/dashboard", dashboardRouter(db));
  app.use("/api/export", exportRouter(db));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: { message: "Not found" } });
  });

  app.use((err: Error & { status?: number; details?: unknown[] }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status ?? 500;
    if (status >= 500) {
      console.error(err);
    }
    res.status(status).json({
      error: {
        message: status >= 500 ? "Internal server error" : err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  });

  return app;
}
