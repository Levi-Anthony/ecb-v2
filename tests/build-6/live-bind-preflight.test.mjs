import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

// Run the real entry path with all external effects replaced. Stop at role
// qualification, before any password change, deployment, or commission.
const source = await readFile(new URL("../../server/ecb-human/live-bind.mjs", import.meta.url), "utf8");
const main = source.slice(source.indexOf("async function main() {"), source.lastIndexOf("\nmain().catch"));

async function preflight(existing, transitions = 0, { checkOnly = false, loginError = null } = {}) {
  const events = [];
  const admin = Object.assign(async () => {
    events.push("role qualification");
    throw new Error("test boundary reached");
  }, { end: async () => events.push("connection closed") });
  const context = vm.createContext({
    postgresModule: async () => () => admin,
    run: (_cmd, args) => args[0] === "branch" ? "expected-branch" : "",
    BRANCH: "expected-branch", REPO: "/fixture", HERE: "/fixture/server/ecb-human",
    TEAM_ID: "test-team", PROJECT_ID: "test-project",
    MIGRATION_SHA: "migration", P0_SHA: "policy",
    readFile: async (path) => path.endsWith(".sql") ? "migration" : "policy",
    sha: (bytes) => bytes, join: (...parts) => parts.join("/"),
    process: { env: {}, argv: checkOnly ? ["--check-installer"] : [] }, console: { log() {} },
    secretPrompt: async () => "synthetic input",
    installerUri: () => ({ toString: () => "synthetic connection" }),
    counts: async () => { if (loginError) throw loginError; return { transitions }; }, onlyScope: async () => existing,
  });
  const invoke = vm.runInContext(`${main}\nmain`, context);
  let error;
  try { await invoke(); } catch (e) { error = e.message; }
  return { events, error };
}

test("read-only installer check closes connection before role inspection or password changes", async () => {
  assert.deepEqual(await preflight(null, 0, { checkOnly: true }), {
    events: ["connection closed"], error: undefined,
  });
});

test("installer authentication rejection is identified without disclosing its raw message", async () => {
  const result = await preflight(null, 0, { checkOnly: true, loginError: { code: "28P01", message: "synthetic private value" } });
  assert.deepEqual(result.events, ["connection closed"]);
  assert.match(result.error, /INSTALLER_AUTH=FAILED/);
  assert.doesNotMatch(result.error, /synthetic private value/);
});

for (const [name, scope] of [["empty canonical installation", null], ["existing inactive scope", { current_transition: null }]]) {
  test(`${name} reaches role qualification`, async () => {
    assert.deepEqual(await preflight(scope), {
      events: ["role qualification", "connection closed"], error: "test boundary reached",
    });
  });
}

for (const [name, scope, transitions] of [
  ["current transition", { current_transition: "synthetic-transition" }, 0],
  ["missing transition field", {}, 0],
  ["transition history", null, 1],
]) {
  test(`${name} stops before role qualification`, async () => {
    const result = await preflight(scope, transitions);
    assert.deepEqual(result.events, ["connection closed"]);
    assert.match(result.error, /transition/i);
  });
}
