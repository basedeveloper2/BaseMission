import { describe, it, expect, vi, beforeEach } from "vitest";

describe("users wallet endpoint", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 503 when database is not connected", async () => {
    vi.doMock("../db", () => ({
      getSupabase: () => null,
      checkSupabase: async () => false,
    }));
    const { buildApp } = await import("../app");
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/users/wallet",
      payload: { address: "0xabc" },
    });
    expect(res.statusCode).toBe(503);
  });

  it("upserts wallet and returns 200 with user", async () => {
    vi.doMock("../db", () => {
      const usersState: any = { upsertPayload: null };
      const supabaseMock = {
        from: (table: string) => {
          if (table === "quests") {
            return {
              select: async () => ({ data: null, count: 10, error: null }),
            };
          }
          if (table === "users") {
            let mode: "select" | "upsert" = "select";
            const builder: any = {
              select: () => builder,
              eq: () => builder,
              single: async () => (mode === "select" ? { data: null, error: null } : { data: { id: "user123", ...usersState.upsertPayload }, error: null }),
              upsert: (payload: any) => {
                usersState.upsertPayload = payload;
                mode = "upsert";
                return builder;
              },
            };
            return builder;
          }
          return {
            select: async () => ({ data: [], count: 0, error: null }),
          };
        },
      };
      return {
        getSupabase: () => supabaseMock,
        checkSupabase: async () => true,
      };
    });
    const { buildApp } = await import("../app");
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/users/wallet",
      payload: { address: "0xAbC" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.address).toBe("0xabc");
  });
});
