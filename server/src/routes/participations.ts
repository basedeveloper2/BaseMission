import { FastifyInstance } from "fastify";
import { getSupabase } from "../db";
import { checkBadges } from "../constants/badges";

export async function registerParticipationRoutes(app: FastifyInstance) {
  app.route({
    method: "POST",
    url: "/api/v1/participations/join",
    schema: {
      description: "Join a quest for a user by address and quest slug",
      tags: ["participations"],
      body: {
        type: "object",
        required: ["address", "slug"],
        properties: {
          address: { type: "string" },
          slug: { type: "string" },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            questId: { type: "string" },
            status: { type: "string" },
            progress: { type: "integer" },
          },
        },
        400: { type: "object", properties: { error: { type: "string" } } },
        404: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } },
        503: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    handler: async (req, reply) => {
      const s = getSupabase();
      if (!s) return reply.code(503).send({ error: "Database not connected" });
      try {
        const { address, slug } = (req as any).body || {};
        if (!address || !slug) return reply.code(400).send({ error: "address and slug required" });
        const { data: user } = await s.from("users").select("id,category").eq("address", String(address).toLowerCase()).single();
        let userId = user?.id as string | undefined;
        let userCategory = user?.category as string | undefined;
        if (!userId) {
          // Try to upsert to handle race conditions where user might have been created
          const { data: created, error } = await s.from("users").upsert({ address: String(address).toLowerCase(), isactive: true }, { onConflict: "address" }).select().single();
          if (error) throw error;
          userId = created?.id as string | undefined;
          userCategory = created?.category as string | undefined;
        }
        const { data: quest } = await s.from("quests").select("id,audiencecategory").eq("slug", String(slug).toLowerCase()).single();
        if (!quest) return reply.code(404).send({ error: "quest not found" });
        if (userCategory && quest.audiencecategory && userCategory !== quest.audiencecategory) {
          return reply.code(400).send({ error: "quest not available for your category" });
        }
        const { data: part } = await s.from("participations").upsert({ userid: userId, questid: quest.id, status: "joined", progress: 0 }, { onConflict: "userid,questid" }).select().single();
        return reply.code(200).send({
          _id: String(part?.id),
          userId: String(part?.userid),
          questId: String(part?.questid),
          status: part?.status || "joined",
          progress: part?.progress || 0,
        });
      } catch (e) {
        return reply.code(500).send({ error: "Failed to join quest" });
      }
    },
  });

  app.route({
    method: "POST",
    url: "/api/v1/participations/complete",
    schema: {
      description: "Complete a quest for a user",
      tags: ["participations"],
      body: {
        type: "object",
        required: ["address", "slug"],
        properties: {
          address: { type: "string" },
          slug: { type: "string" },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            xp: { type: "integer" },
            level: { type: "integer" },
            awarded: { type: "boolean" },
            newBadges: { type: "array", items: { type: "string" } }
          },
        },
        400: { type: "object", properties: { error: { type: "string" } } },
        404: { type: "object", properties: { error: { type: "string" } } },
        500: { type: "object", properties: { error: { type: "string" } } },
        503: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    handler: async (req, reply) => {
      const s = getSupabase();
      if (!s) return reply.code(503).send({ error: "Database not connected" });
      try {
        const { address, slug } = (req as any).body || {};
        if (!address || !slug) return reply.code(400).send({ error: "address and slug required" });
        
        const { data: user } = await s.from("users").select("id,xp,category").eq("address", String(address).toLowerCase()).single();
        if (!user) return reply.code(404).send({ error: "User not found" });
        
        const { data: quest } = await s.from("quests").select("id,rewardvalue,audiencecategory").eq("slug", String(slug).toLowerCase()).single();
        if (!quest) return reply.code(404).send({ error: "Quest not found" });

        if (user.category && quest.audiencecategory && user.category !== quest.audiencecategory) {
             return reply.code(400).send({ error: "Quest not available for your category" });
        }

        const { data: existingPart } = await s.from("participations").select("status").eq("userid", user.id).eq("questid", quest.id).single();
        
        if (existingPart?.status === "completed") {
          return reply.code(200).send({ status: "completed", xp: user.xp, awarded: false });
        }

        // Mark completed
        // Note: Using snake_case for DB columns if necessary, but schema says camelCase (userId, questId)
        // Wait, schema.sql: userId uuid not null
        // However, Supabase client might handle casing.
        // Let's explicitly try to ensure it matches the read pattern if read fails
        await s.from("participations").upsert({ 
            userid: user.id, 
            questid: quest.id, 
            status: "completed", 
            progress: 100 
        }, { onConflict: "userid,questid" });

        // Award XP
        const reward = quest.rewardvalue || 0;
        let newXp = user.xp;
        let newLevel = Math.floor(newXp / 1000);
        
        if (reward > 0) {
            newXp = (user.xp || 0) + reward;
            newLevel = Math.floor(newXp / 1000);
            await s.from("users").update({ xp: newXp, level: newLevel }).eq("id", user.id);
        }

        // --- BADGE CHECK ---
        let newBadges: string[] = [];
        try {
            // Get stats
            const { count: questsCompleted } = await s.from("participations").select("*", { count: "exact", head: true }).eq("userid", user.id).eq("status", "completed");
            // Get today's quests
            const todayStart = new Date();
            todayStart.setHours(0,0,0,0);
            const { count: questsToday } = await s.from("participations")
                .select("*", { count: "exact", head: true })
                .eq("userid", user.id)
                .eq("status", "completed")
                .gte("joinedAt", todayStart.toISOString()); // Assuming joinedAt is close to completion or we should track completedAt

            // Get existing badges
            const { data: existingBadges } = await s.from("user_badges").select("badgeId").eq("userId", user.id);
            const currentBadgeIds = (existingBadges || []).map((b: any) => b.badgeId || b.badgeid);

            const now = new Date();
            const badgesToAward = checkBadges(
                currentBadgeIds, 
                { questsCompleted: (questsCompleted || 0) + 1, questsToday: (questsToday || 0) + 1 }, // +1 for current
                { hour: now.getHours(), day: now.getDay() }
            );

            if (badgesToAward.length > 0) {
                for (const badgeId of badgesToAward) {
                    await s.from("user_badges").upsert({ userId: user.id, badgeId }, { onConflict: "userId,badgeId" });
                }
                newBadges = badgesToAward;
            }
        } catch (err) {
            console.error("Badge check failed:", err);
            // Don't fail the request if badges fail
        }
        // -------------------

        return reply.code(200).send({ status: "completed", xp: newXp, level: newLevel, awarded: true, newBadges });
      } catch (e: any) {
        return reply.code(500).send({ error: e.message || "Failed to complete quest" });
      }
    },
  });
}
