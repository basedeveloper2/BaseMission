import { buildApp } from "../server/src/app";

export default async function handler(req: any, res: any) {
  try {
    const app = await buildApp();
    await app.ready();
    app.server.emit('request', req, res);
  } catch (err: any) {
    console.error("Error initializing Fastify app:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal Server Error", details: err.message }));
  }
}
