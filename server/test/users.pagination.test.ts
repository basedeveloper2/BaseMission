import { describe, it, expect, beforeAll, vi } from "vitest";

describe("Pagination /api/v1/users", () => {
  beforeAll(() => {
    const usersItems = Array.from({ length: 5 }, (_, i) => ({ id: String(i), handle: `u${i}`, address: `0x${i}` }));
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

  it("returns items and total", async () => {
    const { buildApp } = await import("../src/app");
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/v1/users?limit=2&offset=0" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.total).toBe(5);
  });
});
