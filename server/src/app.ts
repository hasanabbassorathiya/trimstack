import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

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

export default app;
