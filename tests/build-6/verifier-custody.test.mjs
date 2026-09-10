import assert from "node:assert/strict";
import { mkdtemp, rm, stat, readFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { verifierCredential, qualifyVerifier } from "../../server/ecb-human/verifier-custody.mjs";

async function directory(t) {
  const path = await mkdtemp(join(tmpdir(), "ecb-verifier-test-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test("successful provisioning is private and retries reuse without rotation", async (t) => {
  const path = await directory(t), applied = [];
  const apply = async p => applied.push(p);
  const first = await verifierCredential(path, "synthetic-target", apply);
  assert.equal(await verifierCredential(path, "synthetic-target", apply), first);
  assert.equal(applied.length, 1);
  assert.equal((await stat(path)).mode & 0o777, 0o700);
  assert.equal((await stat(join(path, "verifier-runtime.json"))).mode & 0o777, 0o600);
  await assert.rejects(verifierCredential(path, "different-target", apply), /does not match/);
  assert.equal(applied.length, 1);
});

test("lost application acknowledgement preserves identical credential for recovery", async (t) => {
  const path = await directory(t), applied = [];
  await assert.rejects(verifierCredential(path, "synthetic", async p => {
    applied.push(p); throw new Error("synthetic private error");
  }), /outcome is unknown/);
  const record = JSON.parse(await readFile(join(path, "verifier-runtime.json"), "utf8"));
  assert.equal(record.state, "prepared");
  await verifierCredential(path, "synthetic", async p => applied.push(p));
  assert.equal(applied.length, 2);
  assert.equal(applied[0] === applied[1], true);
});

test("unsafe permissions stop before another credential application", async (t) => {
  const path = await directory(t);
  await verifierCredential(path, "synthetic", async () => {});
  await chmod(join(path, "verifier-runtime.json"), 0o644);
  await assert.rejects(verifierCredential(path, "synthetic", async () => assert.fail("must not mutate")), /cannot be safely read/);
});

const identity = { role: "ecb_human_verifier", elevated: false, owner: false, service: false };
test("authentication failure closes connection and retries once after bounded quiet interval", async () => {
  let attempts = 0, closed = 0;
  const pauses = [];
  const db = await qualifyVerifier(() => {
    const attempt = ++attempts;
    return Object.assign(async () => {
      if (attempt === 1) throw { code: "28P01" };
      return [identity];
    }, { end: async () => { closed++; } });
  }, async ms => pauses.push(ms), () => {});
  assert.equal(attempts, 2);
  assert.equal(closed, 1);
  assert.equal(pauses.reduce((a, b) => a + b), 120000);
  await db.end();
});

test("repeated verifier rejection is distinct and never emits raw authentication errors", async () => {
  let attempts = 0, closed = 0;
  await assert.rejects(qualifyVerifier(() => {
    attempts++;
    return Object.assign(async () => { throw { code: "28P01", message: "synthetic private value" }; }, { end: async () => { closed++; } });
  }, async () => {}, () => {}), error => {
    assert.match(error.message, /VERIFIER_AUTH=FAILED/);
    assert.doesNotMatch(error.message, /synthetic private value/);
    return true;
  });
  assert.equal(attempts, 2);
  assert.equal(closed, 2);
});

test("elevated role rejects immediately without an authentication retry", async () => {
  let closed = false;
  await assert.rejects(qualifyVerifier(() => Object.assign(async () => [{ ...identity, elevated: true }], {
    end: async () => { closed = true; },
  }), async () => assert.fail("must not retry"), () => {}), /failed local qualification/);
  assert.equal(closed, true);
});
