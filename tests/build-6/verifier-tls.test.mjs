import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import postgres from "../../server/ecb-human/node_modules/postgres/src/index.js";

// Intercept only database I/O while exercising the actual runtime initializer.
const calls = [];
let identity = { role: "ecb_human_verifier", elevated: false, owner: false, service: false };
let closed = false;
globalThis.__build6TlsPostgres = (url, options) => {
  calls.push({ url, options });
  return Object.assign(async () => [identity], { end: async () => { closed = true; } });
};
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "postgres" && context.parentURL.endsWith("/ecb-human/db.mjs")) {
      return { url: "data:text/javascript,export default globalThis.__build6TlsPostgres", shortCircuit: true };
    }
    return next(specifier, context);
  },
});
const { connectVerifier } = await import("../../server/ecb-human/db.mjs");
hooks.deregister();
delete globalThis.__build6TlsPostgres;

test("runtime supplies the retained Supabase CA with strict TLS without NODE_EXTRA_CA_CERTS", async () => {
  await connectVerifier({ HUMAN_DATABASE_URL: "postgres://synthetic@localhost/test?sslmode=disable" });
  const { url, options } = calls.at(-1);
  assert.equal(options.ssl.rejectUnauthorized, true);
  const pem = await readFile(new URL("../../server/ecb-human/certs/supabase-root-2021.crt", import.meta.url), "utf8");
  assert.equal(options.ssl.ca, pem);
  const cert = new X509Certificate(pem);
  assert.equal(cert.ca, true);
  assert.equal(cert.fingerprint256, "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA");
  assert(Date.now() > Date.parse(cert.validFrom) && Date.now() < Date.parse(cert.validTo));
  // The pinned driver's real option parser must not let URI flags weaken TLS.
  const sql = postgres(url, options);
  assert.equal(sql.options.ssl.rejectUnauthorized, true);
  assert.equal(sql.options.ssl.ca, pem);
  assert.equal(sql.options.ssl.checkServerIdentity, undefined);
  await sql.end();
});

test("adding CA trust does not bypass verifier role qualification", async () => {
  identity = { role: "postgres", elevated: true, owner: true, service: false };
  await assert.rejects(connectVerifier({ HUMAN_DATABASE_URL: "postgres://synthetic@localhost/test" }), /unqualified verifier role/);
  assert.equal(closed, true);
});

test("forbidden and missing credentials still fail before database access", async () => {
  const before = calls.length;
  await assert.rejects(connectVerifier({ HUMAN_DATABASE_URL: "synthetic", INSTALLER_DATABASE_URL: "synthetic" }), /forbidden credential/);
  await assert.rejects(connectVerifier({}), /restricted human database connection required/);
  assert.equal(calls.length, before);
});
