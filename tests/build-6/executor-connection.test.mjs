import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import postgres from "../../server/ecb-human/node_modules/postgres/src/index.js";

const qualified = { name: "ecb_governance_executor", login: "ecb_governance_executor", elevated: false,
  owner: false, verifier: false, service: false, can_execute: true, can_issue_decisions: false };
let identity = qualified, failure, closed = 0;
const calls = [];
globalThis.__build6ExecutorPostgres = (url, options) => {
  calls.push({ url, options });
  return Object.assign(async () => {
    if (failure) throw failure;
    return [identity];
  }, { end: async () => { closed++; } });
};
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "postgres" && context.parentURL.endsWith("/ecb-human/executor.mjs")) {
      return { url: "data:text/javascript,export default globalThis.__build6ExecutorPostgres", shortCircuit: true };
    }
    return next(specifier, context);
  },
});
const { connectExecutor } = await import("../../server/ecb-human/executor.mjs");
hooks.deregister();
delete globalThis.__build6ExecutorPostgres;
const env = { EXECUTOR_DATABASE_URL: "postgres://synthetic@localhost/test?sslmode=disable" };

test("executor supplies scoped CA and strict TLS despite URI flags", async () => {
  const db = await connectExecutor(env);
  const { url, options } = calls.at(-1);
  const pem = await readFile(new URL("../../server/ecb-human/certs/supabase-root-2021.crt", import.meta.url), "utf8");
  const parsed = postgres(url, options);
  assert.equal(parsed.options.ssl.ca, pem);
  assert.equal(parsed.options.ssl.rejectUnauthorized, true);
  assert.equal(parsed.options.ssl.checkServerIdentity, undefined);
  await parsed.end();
  await db.end();
});

test("missing or mixed-custody credentials reject before contact", async () => {
  const before = calls.length;
  await assert.rejects(connectExecutor({}), /restricted executor/);
  for (const key of ["HUMAN_DATABASE_URL", "INSTALLER_DATABASE_URL", "SERVICE_ROLE_KEY", "JWT_SECRET", "POSTGRES_URL", "SETUP_SECRET"])
    await assert.rejects(connectExecutor({ ...env, [key]: "synthetic" }), /forbidden credential/);
  assert.equal(calls.length, before);
});

test("wrong login, elevation, forbidden membership and human entry each reject and close", async () => {
  for (const change of [
    { name: "postgres" }, { login: "postgres" }, { elevated: true }, { owner: true },
    { verifier: true }, { service: true }, { can_execute: false }, { can_issue_decisions: true },
  ]) {
    identity = { ...qualified, ...change };
    const before = closed;
    await assert.rejects(connectExecutor(env), /unqualified executor/);
    assert.equal(closed, before + 1);
  }
  identity = qualified;
});

test("failed qualification query closes the attempted connection", async () => {
  failure = new Error("synthetic connection failure");
  const before = closed;
  await assert.rejects(connectExecutor(env), /synthetic connection failure/);
  assert.equal(closed, before + 1);
  failure = undefined;
});
