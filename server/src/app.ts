import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import { registerUsersRoutes } from "./routes/users";
import { registerParticipationRoutes } from "./routes/participations";
import { checkSupabase, getSupabase } from "./db";
import { registerQuestsRoutes } from "./routes/quests";
import { registerLotteryRoutes } from "./routes/lottery";
import { z } from "zod";

export async function buildApp() {
  const app = Fastify({ logger: true });
  const EnvSchema = z.object({
    API_CORS_ORIGIN: z.string().optional(),
    API_RATE_LIMIT_MAX: z.string().optional(),
    API_RATE_LIMIT_WINDOW: z.string().optional(),
    API_TOKEN: z.string().optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  });
  const env = EnvSchema.safeParse(process.env);
  if (!env.success) {
    app.log.warn({ err: env.error }, "Invalid environment variables");
  }
  const supabaseOK = await checkSupabase();
  if (!supabaseOK) {
    app.log.warn({ url: process.env.SUPABASE_URL }, "Supabase not connected");
  } else {
    app.log.info({ url: process.env.SUPABASE_URL }, "Supabase connected");
    // Seed in background to not block startup
    (async () => {
        try {
            const s = getSupabase()!;
            const { count } = await s.from("quests").select("id", { count: "exact", head: true });
            if (!count || count < 10) {
              const categories: { key: "newcomer" | "builder" | "creator" | "defi"; xp: number }[] = [
                { key: "newcomer", xp: 50 },
                { key: "builder", xp: 120 },
                { key: "creator", xp: 100 },
                { key: "defi", xp: 110 },
              ];
              for (const cat of categories) {
                for (let day = 1; day <= 3; day++) {
                  const slug = `${cat.key}-quest-${day}`;
                  await s.from("quests").upsert({ slug, title: `${cat.key} quest ${day}`, description: `${cat.key} quest ${day}`, status: "active", rewardType: "xp", rewardValue: cat.xp, audienceCategory: cat.key, day, displayOrder: day }, { onConflict: "slug" });
                }
              }
              app.log.info("Seeded sample per-category quests to Supabase");
            }
          } catch (e) {
            app.log.warn({ err: e }, "Failed to seed Supabase default data");
          }
    })().catch(err => app.log.error(err));
  }
  await app.register(cors, { origin: process.env.API_CORS_ORIGIN || true, allowedHeaders: ["authorization", "content-type"] });
  await app.register(helmet);
  await app.register(rateLimit, {
    global: true,
    max: Number(process.env.API_RATE_LIMIT_MAX || 300),
    timeWindow: process.env.API_RATE_LIMIT_WINDOW || "1 minute",
    ban: 2,
  });
  await app.register(swagger, {
    openapi: {
      info: { title: "Base Missions API", version: "1.0.0" },
    },
  });
  // OpenAPI JSON available at /documentation/json
  await registerUsersRoutes(app);
  await registerQuestsRoutes(app);
  await registerParticipationRoutes(app);
  await registerLotteryRoutes(app);

  app.get("/api/v1/status", async () => ({ status: "ok", db: (await checkSupabase()) ? "connected" : "disconnected" }));
  return app;
}
