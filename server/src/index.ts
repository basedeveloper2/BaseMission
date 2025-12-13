import "dotenv/config";
import { buildApp } from "./app";
import { checkSupabase } from "./db";
import { startScheduler } from "./scheduler";

const app = await buildApp();
app.get("/health", async () => {
  const ok = await checkSupabase();
  return { status: "ok", db: ok ? "connected" : "disconnected" };
});

startScheduler();

const port = 4000;
try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
