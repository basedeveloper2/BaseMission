import "dotenv/config";
import { buildApp } from "./app";
import { checkSupabase } from "./db";

const app = await buildApp();
app.get("/health", async () => {
  const ok = await checkSupabase();
  return { status: "ok", db: ok ? "connected" : "disconnected" };
});

const port = Number(process.env.PORT || 4000);
await app.listen({ port, host: "0.0.0.0" });
