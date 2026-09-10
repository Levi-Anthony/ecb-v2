import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  expected,
  executorUriFromCustody,
  failureText,
  runSuccession,
  validateRequest,
} from "../../server/ecb-human/succession-custody.mjs";

const secret = "A".repeat(64);
const policyId = randomUUID();
const transitionId = randomUUID();
const decisionId = randomUUID();
const request = () => ({
  scope: expected.scope,
  decision: decisionId,
  request_id: randomUUID(),
  policy_digest: expected.policy_digest,
  predecessor: expected.predecessor,
});
async function custody(change = {}) {
  const dir = await mkdtemp(join(tmpdir(), "ecb-p1-custody-"));
  await chmod(dir, 0o700);
  const record = {
    version: 1,
    target: `executor:${expected.project}:aws-0-us-west-1.pooler.supabase.com`,
    password: secret,
    state: "applied",
    ...change,
  };
  const path = join(dir, "verifier-runtime.json");
  await writeFile(path, JSON.stringify(record), { mode: 0o600 });
  await chmod(path, 0o600);
  return { dir, path };
}
function committed(r) {
  return {
    outcome: "committed",
    transition: {
      id: transitionId,
      scope: r.scope,
      predecessor: r.predecessor,
      decision: r.decision,
      policy: policyId,
      h: randomUUID(),
      remit: randomUUID(),
      binding: randomUUID(),
      obligations: [
        "install_exact_successor",
        "preserve_h_remit_history_and_exhaustion",
      ],
      executor: "ecb_governance_executor",
      request_id: r.request_id,
    },
  };
}
function view(r, result) {
  return {
    scope: { current_transition: result.transition.id },
    subjects: [{ id: policyId, kind: "policy", digest: r.policy_digest }],
    decisions: [{
      id: r.decision,
      operation: "succession",
      policy: policyId,
      predecessor: r.predecessor,
      basis: r.predecessor,
      h: result.transition.h,
    }],
  };
}

test("exact P1 candidate is the selected one-field successor", async () => {
  const p0 = await readFile("docs/build-shape/008-build-6-p0-candidate.json", "utf8");
  const p1 = await readFile("docs/build-shape/008-build-6-p1-candidate.json", "utf8");
  assert.equal(Buffer.byteLength(p1), 563);
  assert.equal(createHash("sha256").update(p1).digest("hex"), expected.policy_digest);
  assert.equal(p1, p0.replace('"requires_human_explanation": false', '"requires_human_explanation": true'));
});

test("public request is pinned to first-P1 scope, predecessor and digest", () => {
  const r = request();
  assert.deepEqual(validateRequest(r), r);
  for (const changed of [
    { scope: randomUUID() },
    { predecessor: randomUUID() },
    { policy_digest: "0".repeat(64) },
    { extra: true },
  ]) assert.throws(() => validateRequest({ ...r, ...changed }), /Unexpected first-P1/);
});

test("retained applied executor custody reconstructs only the restricted target in memory", async () => {
  const c = await custody();
  try {
    const uri = new URL(await executorUriFromCustody(c.dir));
    assert.equal(uri.hostname, "aws-0-us-west-1.pooler.supabase.com");
    assert.equal(uri.port, "6543");
    assert.equal(uri.pathname, "/postgres");
    assert.equal(decodeURIComponent(uri.username), `ecb_governance_executor.${expected.project}`);
    assert.equal(decodeURIComponent(uri.password), secret);
    assert.equal(uri.search, "");
    assert(!failureText().includes(secret));
    assert(!failureText().includes(uri.hostname));
  } finally { await rm(c.dir, { recursive: true, force: true }); }
});

test("unsafe, wrong-target and non-applied custody reject before connection", async () => {
  const badState = await custody({ state: "prepared" });
  const badTarget = await custody({ target: `executor:${expected.project}:attacker.example` });
  const unsafe = await custody();
  try {
    await assert.rejects(() => executorUriFromCustody(badState.dir), /does not match/);
    await assert.rejects(() => executorUriFromCustody(badTarget.dir), /does not match/);
    await chmod(unsafe.path, 0o644);
    await assert.rejects(() => executorUriFromCustody(unsafe.dir), /Unsafe private executor record/);
  } finally {
    await Promise.all([badState, badTarget, unsafe].map((c) => rm(c.dir, { recursive: true, force: true })));
  }
});

test("established absence causes exactly one effect then fresh cold recovery", async () => {
  const c = await custody();
  const r = request();
  const result = committed(r);
  const calls = [];
  let connections = 0;
  const connect = async () => ({
    n: ++connections,
    async end() { calls.push(`end${this.n}`); },
  });
  const perform = async (db, action) => {
    calls.push(`${db.n}:${action}`);
    if (db.n === 1 && action === "recover") return { outcome: "not_committed", current_transition: r.predecessor, scope_locked: true };
    if (db.n === 1 && action === "execute") return result;
    if (action === "inspect") return view(r, result);
    if (db.n === 2 && action === "recover") return result;
    throw new Error("unexpected test operation");
  };
  try {
    const receipt = await runSuccession({ directory: c.dir, request: r, connect, perform });
    assert.equal(receipt.P1, "PASS");
    assert.equal(receipt.transition, transitionId);
    assert.equal(receipt.cold_recovery, "PASS");
    assert.deepEqual(calls, [
      "1:recover", "1:execute", "1:inspect", "end1",
      "2:recover", "2:inspect", "end2",
    ]);
    assert(!JSON.stringify(receipt).includes(secret));
  } finally { await rm(c.dir, { recursive: true, force: true }); }
});

test("exact prior success skips effect and still cold-recovers", async () => {
  const c = await custody();
  const r = request();
  const result = committed(r);
  const calls = [];
  let connections = 0;
  const connect = async () => ({ n: ++connections, async end() {} });
  const perform = async (db, action) => {
    calls.push(`${db.n}:${action}`);
    if (action === "recover") return result;
    if (action === "inspect") return view(r, result);
    if (action === "execute") assert.fail("execute must not run after recovered success");
  };
  try {
    await runSuccession({ directory: c.dir, request: r, connect, perform });
    assert.deepEqual(calls, ["1:recover", "1:inspect", "2:recover", "2:inspect"]);
  } finally { await rm(c.dir, { recursive: true, force: true }); }
});

test("mismatched recovery or failed cold recovery cannot authorize another effect", async () => {
  const c = await custody();
  const r = request();
  let connections = 0, executed = 0;
  const connect = async () => ({ n: ++connections, async end() {} });
  try {
    await assert.rejects(() => runSuccession({
      directory: c.dir,
      request: r,
      connect,
      perform: async (_db, action) => {
        if (action === "recover") return { outcome: "not_committed", current_transition: randomUUID(), scope_locked: true };
        if (action === "execute") executed++;
      },
    }), /safe execution eligibility/);
    assert.equal(executed, 0);

    connections = 0;
    const result = committed(r);
    await assert.rejects(() => runSuccession({
      directory: c.dir,
      request: r,
      connect,
      perform: async (db, action) => {
        if (db.n === 1 && action === "recover") return { outcome: "not_committed", current_transition: r.predecessor, scope_locked: true };
        if (db.n === 1 && action === "execute") { executed++; return result; }
        if (db.n === 1 && action === "inspect") return view(r, result);
        if (db.n === 2 && action === "recover") return { outcome: "not_committed", current_transition: transitionId, scope_locked: true };
        if (db.n === 2 && action === "inspect") return view(r, result);
      },
    }), /Committed succession/);
    assert.equal(executed, 1);
  } finally { await rm(c.dir, { recursive: true, force: true }); }
});
