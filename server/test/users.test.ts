import { describe, it, expect, beforeAll, vi } from "vitest";

describe("GET /api/v1/users", () => {
  beforeAll(() => {
    const usersItems = [
      { id: "1", handle: "tester", address: "0xabc", created_at: new Date().toISOString(), xp: 0, level: 0 },
    ];
    const supabaseMock = {
      from: (table: string) => {
        if (table === "quests") {
          return {
            select: async () => ({ data: null, count: 10, error: null }),
          };
        }
        if (table === "users") {
          const builder: any = {
            select: () => builder,
            or: () => builder,
            order: () => builder,
            range: () => Promise.resolve({ data: usersItems, count: usersItems.length, error: null }),
          };
          return builder;
        }
        return {
          select: async () => ({ data: [], count: 0, error: null }),
        };
      },
    };
    vi.doMock("../src/db", () => ({
      getSupabase: () => supabaseMock,
      checkSupabase: async () => true,
    }));
  });

  it("returns users items array", async () => {
    const { buildApp } = await import("../src/app");
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/v1/users" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items[0].handle).toBe("tester");
    expect(typeof body.total).toBe("number");
  });
});
