import { createApp } from "../app.mjs";
import { connectVerifier } from "../db.mjs";
let app;
export default async function handler(req, res) {
  try {
    app ??= connectVerifier().then(createApp).catch((e) => {
      app = undefined;
      throw e;
    });
    return await (await app)(req, res);
  } catch {
    res.writeHead(503, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    });
    res.end('{"error":"service_unavailable","outcome":"unknown"}');
  }
}
