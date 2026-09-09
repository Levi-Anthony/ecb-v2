import { createApp } from "../app.mjs";
import { connectVerifier } from "../db.mjs";
let app;
const INERT_RESPONSE = '{"error":"service_unavailable","outcome":"unknown"}';
export function initializationFailureCategory(error) {
  if (error?.code === "28P01") return "database_authentication_failed";
  if (["SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "UNABLE_TO_GET_ISSUER_CERT_LOCALLY", "CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID"].includes(error?.code)) return "database_tls_failed";
  if (error?.message === "human runtime contains forbidden credential configuration") return "forbidden_runtime_configuration";
  if (error?.message === "restricted human database connection required") return "missing_runtime_connection";
  if (error?.message === "unqualified verifier role") return "unqualified_verifier_role";
  return "initialization_failed";
}
function failClosed(res) {
  res.writeHead(503, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  res.end(INERT_RESPONSE);
}
export default async function handler(req, res) {
  try {
    app ??= connectVerifier().then(createApp).catch((e) => {
      app = undefined;
      // Log only a closed set of categories, never database messages or secrets.
      console.error(`ecb-human: ${initializationFailureCategory(e)}`);
      throw e;
    });
    return await (await app)(req, res);
  } catch {
    failClosed(res);
  }
}
