import { FastifyInstance } from "fastify";
import { getSupabase } from "../db";

// Shared function to perform the draw
export async function performDraw() {
  const s = getSupabase();
  if (!s) throw new Error("Database not connected");

  // Calculate start of week (Monday)
  const now = new Date();
  const day = now.getDay(); 
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  // Check if winner already exists for this week
  const { data: existing } = await s
    .from("lottery_winners")
    .select("id")
    .eq("week_start", weekStart.toISOString())
    .single();

  if (existing) {
    console.log("Draw already happened for this week:", weekStart.toISOString());
    return null;
  }

  // Fetch eligible users
  const { data: participations, error } = await s
      .from("participations")
      .select("userid")
      .eq("status", "completed")
      .gte("joinedat", weekStart.toISOString());

  if (error) throw error;

  const userCounts: Record<string, number> = {};
  (participations || []).forEach((p: any) => {
      const uid = p.userId || p.userid;
      if (uid) userCounts[uid] = (userCounts[uid] || 0) + 1;
  });

  const eligibleIds = Object.keys(userCounts).filter(uid => userCounts[uid] > 25);

  if (eligibleIds.length === 0) {
      console.log("No eligible users for draw");
      return null;
  }

  // Pick random winner
  const winnerId = eligibleIds[Math.floor(Math.random() * eligibleIds.length)];

  // Save winner
  const { data: saved, error: saveError } = await s
    .from("lottery_winners")
    .insert({
        week_start: weekStart.toISOString(),
        winner_id: winnerId,
        drawn_at: new Date().toISOString()
    })
    .select()
    .single();

  if (saveError) {
      // Handle race condition if run multiple times
      if (saveError.code === '23505') { // unique_violation
          console.log("Draw race condition caught, skipping");
          return null;
      }
      throw saveError;
  }

  return saved;
}

export async function registerLotteryRoutes(app: FastifyInstance) {
  app.route({
    method: "GET",
    url: "/api/v1/lottery/eligible",
    schema: {
      description: "Get users eligible for weekly lottery (> 25 completed quests this week)",
      tags: ["lottery"],
      querystring: {
        type: "object",
        properties: {
            limit: { type: "integer", default: 50 }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            eligibleUsers: { 
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        userId: { type: "string" },
                        handle: { type: "string" },
                        avatarUrl: { type: "string" },
                        questCount: { type: "integer" }
                    }
                }
            },
            weekStart: { type: "string" },
            totalEligible: { type: "integer" }
          },
        },
        500: { type: "object", properties: { error: { type: "string" } } },
        503: { type: "object", properties: { error: { type: "string" } } },
      },
    },
    handler: async (req, reply) => {
      const s = getSupabase();
      if (!s) return reply.code(503).send({ error: "Database not connected" });
      try {
        const now = new Date();
        const day = now.getDay(); 
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const { data: participations, error } = await s
            .from("participations")
            .select("userid")
            .eq("status", "completed")
            .gte("joinedat", weekStart.toISOString());

        if (error) throw error;

        const userCounts: Record<string, number> = {};
        (participations || []).forEach((p: any) => {
            const uid = p.userId || p.userid;
            if (uid) {
                userCounts[uid] = (userCounts[uid] || 0) + 1;
            }
        });

        const eligibleIds = Object.keys(userCounts).filter(uid => userCounts[uid] > 25);

        if (eligibleIds.length === 0) {
            return { eligibleUsers: [], weekStart: weekStart.toISOString(), totalEligible: 0 };
        }

        const { data: users } = await s
            .from("users")
            .select("id, handle, avatarurl")
            .in("id", eligibleIds);

        const result = (users || []).map((u: any) => ({
            userId: u.id,
            handle: u.handle,
            avatarUrl: u.avatarUrl || u.avatar_url || u.avatarurl,
            questCount: userCounts[u.id]
        })).sort((a, b) => b.questCount - a.questCount);

        return {
            eligibleUsers: result,
            weekStart: weekStart.toISOString(),
            totalEligible: result.length
        };

      } catch (e: any) {
        return reply.code(500).send({ error: e.message || "Failed to fetch eligible users" });
      }
    },
  });

  app.route({
    method: "GET",
    url: "/api/v1/lottery/latest-winner",
    schema: {
        description: "Get the latest lottery winner",
        tags: ["lottery"],
        response: {
            200: {
                type: "object",
                properties: {
                    winner: {
                        type: "object",
                        nullable: true,
                        properties: {
                            userId: { type: "string" },
                            handle: { type: "string" },
                            avatarUrl: { type: "string" },
                            weekStart: { type: "string" },
                            drawnAt: { type: "string" }
                        }
                    },
                    nextDraw: { type: "string" }
                }
            },
            500: { type: "object", properties: { error: { type: "string" } } },
            503: { type: "object", properties: { error: { type: "string" } } }
        }
    },
    handler: async (req, reply) => {
        const s = getSupabase();
        if (!s) return reply.code(503).send({ error: "Database not connected" });
        try {
            // Get latest winner
            const { data: latest } = await s
                .from("lottery_winners")
                .select("week_start, drawn_at, winner_id")
                .order("week_start", { ascending: false })
                .limit(1)
                .single();

            let winner = null;
            if (latest) {
                const { data: user } = await s
                    .from("users")
                    .select("handle, avatarurl")
                    .eq("id", latest.winner_id)
                    .single();
                
                if (user) {
                    winner = {
                        userId: latest.winner_id,
                        handle: user.handle,
                        avatarUrl: user.avatarurl,
                        weekStart: latest.week_start,
                        drawnAt: latest.drawn_at
                    };
                }
            }

            // Calculate next draw (Next Saturday 22:00 SAST)
            // SAST is UTC+2
            // Saturday 22:00 SAST = Saturday 20:00 UTC
            const now = new Date();
            const nextDraw = new Date(now);
            nextDraw.setUTCHours(20, 0, 0, 0);
            
            // Move to next Saturday
            // day 0=Sun, 6=Sat
            const day = nextDraw.getUTCDay();
            const diff = 6 - day; // days until saturday
            nextDraw.setUTCDate(nextDraw.getUTCDate() + diff);
            
            // If we are already past this Saturday 20:00 UTC, add 7 days
            if (nextDraw.getTime() <= now.getTime()) {
                nextDraw.setUTCDate(nextDraw.getUTCDate() + 7);
            }

            return { winner, nextDraw: nextDraw.toISOString() };

        } catch (e: any) {
            return reply.code(500).send({ error: e.message || "Failed to fetch latest winner" });
        }
    }
  });

  // Manual Trigger (Optional, for testing)
  app.route({
    method: "POST",
    url: "/api/v1/lottery/trigger",
    handler: async (req, reply) => {
        try {
            const result = await performDraw();
            return { status: result ? "drawn" : "skipped", result };
        } catch (e: any) {
            return reply.code(500).send({ error: e.message });
        }
    }
  });
}
