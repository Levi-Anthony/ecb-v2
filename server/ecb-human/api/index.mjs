import { createApp } from "../app.mjs";
import { connectVerifier } from "../db.mjs";
let app;
const INERT_RESPONSE = '{"error":"service_unavailable","outcome":"unknown"}';
function failClosed(res) {
  res.writeHead(503, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  res.end(INERT_RESPONSE);
}
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "https://ecos.effortlessconnection.com");
    if (url.pathname === "/" || url.pathname === "/intervene") {
      return failClosed(res);
    }
    app ??= connectVerifier().then(createApp).catch((e) => {
      app = undefined;
      throw e;
    });
    return await (await app)(req, res);
  } catch {
    failClosed(res);
  }
}
