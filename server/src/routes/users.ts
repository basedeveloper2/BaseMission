import { FastifyInstance } from "fastify";
import { getSupabase } from "../db";


export async function registerUsersRoutes(app: FastifyInstance) {
  app.route({
    method: "GET",
    url: "/api/v1/users",
    schema: {
      description: "List users",
      tags: ["users"],
      querystring: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 500, default: 100 },
          offset: { type: "integer", minimum: 0, default: 0 },
          sort: { type: "string", enum: ["createdAt", "handle", "address", "xp", "level"], default: "createdAt" },
          order: { type: "string", enum: ["asc", "desc"], default: "desc" },
          q: { type: "string" },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  handle: { type: "string" },
                  address: { type: "string" },
                  createdAt: { type: "string" },
                  xp: { type: "integer" },
                  level: { type: "integer" },
                  avatarUrl: { type: "string" },
                  category: { type: "string" },
                  estimatedCost: { type: "string" },
                },
              },
            },
            total: { type: "integer" },
          },
        },
        401: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        503: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        500: {
          type: "object",
          properties: { error: { type: "string" } },
        },
      },
    },
    handler: async (req, reply) => {
      if (process.env.API_TOKEN) {
        const auth = req.headers["authorization"] || "";
        const expected = `Bearer ${process.env.API_TOKEN}`;
        if (auth !== expected) {
          return reply.code(401).send({ error: "Unauthorized" });
        }
      }

      const s = getSupabase();
      if (!s) return reply.code(503).send({ error: "Database not connected" });
      try {
        const { limit = 100, offset = 0, sort = "createdAt", order = "desc", q } = (req as any).query || {};
        const sortSafe = (() => {
          if (sort === "xp" || sort === "address" || sort === "handle") return sort;
          if (sort === "createdAt") return "createdat";
          if (sort === "level") return "level";
          return "xp";
        })();
        let query = s.from("users").select("*", { count: "exact" });
        if (q) {
          query = query.or(`handle.ilike.%${q}%,address.ilike.%${q}%`);
        }
        query = query.order(sortSafe, { ascending: order === "asc" }).range(offset, offset + limit - 1);
        const { data, count, error } = await query;
        if (error) return reply.code(500).send({ error: error.message || "Failed to fetch users" });
        const items = (data || []).map((u: any) => ({
          _id: String(u.id),
          handle: u.handle,
          address: u.address,
          createdAt: u.createdAt || u.created_at || u.createdat,
          xp: u.xp,
          level: typeof u.level === "number" ? u.level : Math.floor((u.xp || 0) / 1000),
          avatarUrl: u.avatarUrl || u.avatar_url || u.avatarurl,
          estimatedCost: u.estimatedCost || u.estimated_cost,
          category: u.category,
        }));
        return reply.code(200).send({ items, total: count || items.length });
      } catch (e: any) {
        return reply.code(500).send({ error: e?.message || "Failed to fetch users" });
      }
    },
  });

  app.route({
    method: "POST",
    url: "/api/v1/users/wallet",
    schema: {
      description: "Upsert user by wallet address",
      tags: ["users"],
      body: {
        type: "object",
        required: ["address"],
        properties: {
          address: { type: "string" },
          handle: { type: "string" },
          avatarUrl: { type: "string" },
          category: { type: "string" },
          estimatedCost: { type: "string" },
        },
        additionalProperties: true,
      },
      response: {
        200: {
          type: "object",
          properties: {
            _id: { type: "string" },
            address: { type: "string" },
            handle: { type: "string" },
            walletConnectedAt: { type: "string" },
          },
        },
        400: { type: "object", properties: { error: { type: "string" } } },
        503: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    handler: async (req, reply) => {
      try {
        const s = getSupabase();
        if (!s) return reply.code(503).send({ error: "Database not connected" });
        const { address, handle, avatarUrl, category, estimatedCost } = (req as any).body || {};
        if (!address || typeof address !== "string") return reply.code(400).send({ error: "address required" });
        const addr = address.toLowerCase();
        const now = new Date().toISOString();
        const xpMap: Record<string, number> = { newcomer: 50, builder: 120, creator: 100, defi: 110 };
        const { data: existing } = await s.from("users").select("id,xp,handle,category").eq("address", addr).single();
        const hadHandle = !!existing?.handle;
        const chosenCategory = String(category || existing?.category || "").toLowerCase();
        const awardXp = !!handle && !hadHandle ? (xpMap[chosenCategory] || 0) : 0;
        const newXp = (existing?.xp || 0) + awardXp;
        const newLevel = Math.floor(newXp / 1000);
        const updateFieldsBase: any = { xp: newXp, level: newLevel, wallet_connected_at: now };
        if (category) updateFieldsBase.category = chosenCategory;
        if (avatarUrl) updateFieldsBase.avatar_url = String(avatarUrl);
        if (estimatedCost) updateFieldsBase.estimated_cost = String(estimatedCost);
        if (existing?.id) {
          const updateWithHandle = handle ? { ...updateFieldsBase, handle: String(handle).toLowerCase() } : updateFieldsBase;
          let currentPayload = updateWithHandle;
          let { data, error } = await s.from("users").update(currentPayload).eq("id", existing.id).select().single();
          
          // Retry loop for missing columns
          let retries = 0;
          while (error && String(error.message || "").includes("Could not find the") && retries < 5) {
             const match = String(error.message).match(/'(\w+)' column/);
             if (match && match[1]) {
                 const col = match[1];
                 const { [col]: _, ...rest } = currentPayload;
                 currentPayload = rest;
                 ({ data, error } = await s.from("users").update(currentPayload).eq("id", existing.id).select().single());
                 retries++;
             } else {
                 break;
             }
          }

          if (error && String(error.message || "").toLowerCase().includes("unique")) {
            currentPayload = updateFieldsBase;
            ({ data, error } = await s.from("users").update(currentPayload).eq("id", existing.id).select().single());
            
            // Retry loop for missing columns again for unique fallback
            retries = 0;
            while (error && String(error.message || "").includes("Could not find the") && retries < 5) {
               const match = String(error.message).match(/'(\w+)' column/);
               if (match && match[1]) {
                   const col = match[1];
                   const { [col]: _, ...rest } = currentPayload;
                   currentPayload = rest;
                   ({ data, error } = await s.from("users").update(currentPayload).eq("id", existing.id).select().single());
                   retries++;
               } else {
                   break;
               }
            }
          }
          if (error) {
            (app as any).log?.error?.({ err: error }, "Supabase update users failed");
            return reply.code(500).send({ error: error.message || "Failed to update user" });
          }
          return reply.code(200).send(data || { address: addr, xp: newXp });
        }
        // Insert path; try with handle first, then without on unique conflict
        let currentPayload = handle ? { address: addr, ...updateFieldsBase, handle: String(handle).toLowerCase() } : { address: addr, ...updateFieldsBase };
        let { data, error } = await s.from("users").upsert(currentPayload, { onConflict: "address" }).select().single();
        
        // Retry loop for missing columns
        let retries = 0;
        while (error && String(error.message || "").includes("Could not find the") && retries < 5) {
           const match = String(error.message).match(/'(\w+)' column/);
           if (match && match[1]) {
               const col = match[1];
               const { [col]: _, ...rest } = currentPayload;
               currentPayload = rest;
               ({ data, error } = await s.from("users").upsert(currentPayload, { onConflict: "address" }).select().single());
               retries++;
           } else {
               break;
           }
        }

        if (error && String(error.message || "").toLowerCase().includes("unique")) {
          currentPayload = { address: addr, ...updateFieldsBase };
          ({ data, error } = await s.from("users").upsert(currentPayload, { onConflict: "address" }).select().single());
          
          // Retry loop for missing columns again
          retries = 0;
          while (error && String(error.message || "").includes("Could not find the") && retries < 5) {
             const match = String(error.message).match(/'(\w+)' column/);
             if (match && match[1]) {
                 const col = match[1];
                 const { [col]: _, ...rest } = currentPayload;
                 currentPayload = rest;
                 ({ data, error } = await s.from("users").upsert(currentPayload, { onConflict: "address" }).select().single());
                 retries++;
             } else {
                 break;
             }
          }
        }
        if (error) {
          (app as any).log?.error?.({ err: error }, "Supabase insert users failed");
          return reply.code(500).send({ error: error.message || "Failed to insert user" });
        }
        return reply.code(200).send(data || { address: addr, xp: newXp });
      } catch (e) {
        (app as any).log?.error?.({ err: e }, "Wallet route exception");
        return reply.code(500).send({ error: (e as any)?.message || "Failed to upsert wallet" });
      }
    },
  });
}