import { buildApp } from "../server/src/app";

export default async function handler(req: any, res: any) {
  const app = await buildApp();
  await app.ready();
  app.server.emit('request', req, res);
}
