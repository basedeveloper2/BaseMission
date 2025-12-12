import { FastifyInstance } from "fastify";
import { getSupabase } from "../db";

export async function registerQuestsRoutes(app: FastifyInstance) {
  app.route({
    method: "GET",
    url: "/api/v1/quests",
    schema: {
      description: "List quests with optional user participation",
      tags: ["quests"],
      querystring: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 200, default: 50 },
          offset: { type: "integer", minimum: 0, default: 0 },
          address: { type: "string" },
          status: { type: "string", enum: ["draft", "active", "archived"], default: "active" },
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
                  id: { type: "string" },
                  slug: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  xpReward: { type: "integer" },
                  progress: { type: "integer" },
                  status: { type: "string" },
                  category: { type: "string" },
                  audienceCategory: { type: "string" },
                  day: { type: "integer" },
                },
              },
            },
            total: { type: "integer" },
          },
        },
        503: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    handler: async (req, reply) => {
      const s = getSupabase();
      if (!s) return reply.code(503).send({ error: "Database not connected" });
      try {
        const { limit = 50, offset = 0, address, status = "active" } = (req as any).query || {};
        let userId: string | null = null;
        let userCategory: string | null = null;
        if (address) {
          const { data: u } = await s.from("users").select("id,category").eq("address", String(address).toLowerCase()).single();
          if (u) {
            userId = String(u.id);
            userCategory = u.category || null;
          }
        }
        let q = s.from("quests").select("id,slug,title,description,rewardtype,rewardvalue,status,category,audiencecategory,day", { count: "exact" }).eq("status", status);
        if (userCategory) {
          // Fix: Use lowercase column name as verified in DB
          q = q.eq("audiencecategory", userCategory);
        }
        q = q.order("displayorder", { ascending: true }).order("createdat", { ascending: false }).range(offset, offset + limit - 1);
        const { data: quests, count } = await q;

        let participationByQuestId: Record<string, { progress: number; status: string }> = {};
        if (userId) {
           const { data: allParts } = await s.from("participations").select("*");
           // console.log("All parts dump:", JSON.stringify(allParts, null, 2));
           
           const parts = (allParts || []).filter((p: any) => {
               // The DB might return `userid` but we have `userId`.
               // Or maybe the userId in DB is not matching because of some other reason?
               // Let's assume the upsert worked.
               // Check if the IDs match directly or via lowercase
               const pUserId = p.userId || p.userid || p.user_id;
               return String(pUserId).toLowerCase() === String(userId).toLowerCase();
           });
           
           participationByQuestId = Object.fromEntries((parts || []).map((p: any) => {
              const qId = p.questId || p.questid;
              // IMPORTANT: The DB stores questId. We need to match it against String(q.id) which is the ID of the quest.
              return [String(qId), { progress: p.progress || 0, status: p.status || "joined" }];
           }));
        }
        // Debug logging for specific user
        if (address && String(address).includes("persist")) {
             // console.log("User ID resolved:", userId);
             // console.log("Map:", participationByQuestId);
        }
        
        const items = (quests || []).map((q: any) => ({
          id: String(q.id),
          slug: q.slug,
          title: q.title,
          description: q.description || "",
          xpReward: (q.rewardType || q.rewardtype) === "xp" ? (q.rewardValue || q.rewardvalue || 0) : 0,
          progress: participationByQuestId[String(q.id)]?.progress ?? 0,
          status: participationByQuestId[String(q.id)]?.status === "completed" ? "completed" : (q.status === "active" ? "active" : "locked"),
          category: q.category || undefined,
          audienceCategory: q.audienceCategory || q.audiencecategory || undefined,
          day: q.day || undefined,
        }));
        return reply.code(200).send({ items, total: count || items.length });
      } catch (e) {
        return reply.code(500).send({ error: "Failed to fetch quests" });
      }
    },
  });
}
