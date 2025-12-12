import { describe, it, expect, vi } from "vitest";

describe("Auth on /api/v1/users", () => {
  it("rejects when API_TOKEN is set and header missing", async () => {
    process.env.API_TOKEN = "secret";
    vi.doMock("../src/db", () => ({
      getSupabase: () => null,
      checkSupabase: async () => false,
    }));
    const { buildApp } = await import("../src/app");
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/v1/users" });
    expect(res.statusCode).toBe(401);
    delete process.env.API_TOKEN;
  });

  it("accepts with correct Bearer token", async () => {
    process.env.API_TOKEN = "secret";
    vi.doMock("../src/db", () => ({
      getSupabase: () => null,
      checkSupabase: async () => false,
    }));
    const { buildApp } = await import("../src/app");
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/v1/users", headers: { authorization: "Bearer secret" } });
    expect([200, 503]).toContain(res.statusCode);
    delete process.env.API_TOKEN;
  });
});
