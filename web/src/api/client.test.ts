import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiError, listSubscriptions, createSubscription } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client error envelope parsing", () => {
  it("throws ApiError with envelope message and field details on 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              message: "Validation failed",
              details: [{ field: "seatsActive", message: "cannot exceed provisioned" }],
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const err = await createSubscription({
      name: "x",
      vendor: "x",
      category: "other",
      monthlyCost: 10,
      billingCycle: "monthly",
      renewalDate: "2026-10-01",
      seatsProvisioned: 10,
      seatsActive: 20,
      owningDepartment: "x",
      status: "active",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("Validation failed");
    expect(err.details?.[0].field).toBe("seatsActive");
  });

  it("throws ApiError with fallback message on non-JSON error bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("gateway timeout", { status: 502 })));

    const err = await listSubscriptions().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(502);
    expect(err.message).toContain("502");
  });

  it("returns parsed JSON on success and passes query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await listSubscriptions({ q: "fig", sort: "cost", order: "desc" });
    expect(result).toEqual([]);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/subscriptions?q=fig&sort=cost&order=desc");
  });
});
