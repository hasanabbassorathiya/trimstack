import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("error envelope", () => {
  it("returns 404 with JSON envelope for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: "Not found" } });
  });

  it("returns 400 with envelope for malformed JSON bodies", async () => {
    const res = await request(app)
      .post("/api/echo-test")
      .set("Content-Type", "application/json")
      .send("{invalid json");
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("message");
  });
});
