// Authored only AFTER freeze.json. First execution is the untuned holdout;
// later executions are regressions of this retained case, not new holdouts.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import * as t from "./support.mjs";
import { execute, status } from "../../server/build-8/action.mjs";
const record = {
  authored_after_freeze: "2026-09-11T19:00:50Z",
  started_at: new Date().toISOString(),
  proof_class: "atomic-ledger synthetic target only",
  authorship: "same worker; not independent-author proof",
  pressure:
    "interpreted paraphrase plus unsupported/contradictory semantic controls; lost effect transaction, explicit fence, unused admission after expiry, slow effect with mixed exact replay and status storm, lost ACK, post-effect revocation",
};
execFileSync(process.execPath, ["tests/build-8/seal.mjs", "--check"]);
record.freeze_sha256 = createHash("sha256").update(
  readFileSync("docs/build-receipts/evidence/build-8/freeze.json"),
).digest("hex");
const pending = [];
try {
  const f = await t.make();
  record.locator = { scope: f.scope, action: f.action };
  const semantic = [];
  for (
    const [name, c, want] of [
      ["paraphrase", { ...f.candidate, expression: f.paraphrase }, "PASS"],
      ["paraphrase with contradictory maximum", {
        ...f.candidate,
        expression: f.paraphrase,
        max_effects: 2,
      }, "FAIL"],
      ["uninterpreted elaboration", {
        ...f.candidate,
        expression: f.paraphrase + " Trust me.",
      }, "INCOMPLETE"],
    ]
  ) {
    const id = await t.propose(f, c), q = await t.qualify(f, id);
    assert.equal(q.outcome, want);
    semantic.push({ name, id, q, expected: want });
  }
  record.semantic = semantic;
  const positive = semantic[0],
    g = await t.grant(f, positive.id, positive.q),
    au = await t.authorize(f, positive.id, positive.q, g);
  const ad = await t.control(f, "admit", au.event),
    st = await t.control(f, "start", ad.event);
  const db = t.connect();
  try {
    await db.begin("isolation level read committed", async (tx) => {
      await t.control(f, "effect", st.event, { db: tx, p: st.event });
      throw Error("HOLDOUT_LOST_TRANSACTION");
    });
  } catch (e) {
    assert.equal(e.message, "HOLDOUT_LOST_TRANSACTION");
  } finally {
    await db.end();
  }
  const uncertain = await status(t.observer, f.scope, f.action);
  assert.equal(uncertain.status, "RECONCILE_REQUIRED");
  assert.equal(uncertain.native.effect_count, 0);
  const before = await t.head(f);
  for (let i = 0; i < 7; i++) await status(t.observer, f.scope, f.action);
  assert.equal(await t.head(f), before);
  const fence = await t.control(f, "reconcile", st.event);
  record.fenced = fence.event;
  await t.env(f, "tick", { tick: 19 });
  const fresh = await t.control(f, "admit", au.event);
  await t.env(f, "tick", { tick: 21 });
  const startPredecessor = await t.head(f), request = t.uuid();
  const start = await t.control(f, "start", fresh.event, {
    p: startPredecessor,
    request,
  });
  const executor = t.connect();
  let release, entered, failed;
  const gate = new Promise((r) => release = r),
    entry = new Promise((r, j) => {
      entered = r;
      failed = j;
    });
  const effect = executor.begin(
    "isolation level read committed",
    async (tx) => {
      const result = await t.control(f, "effect", start.event, {
        db: tx,
        p: start.event,
      });
      entered(result);
      await gate;
      return result;
    },
  ).catch((e) => {
    failed(e);
    throw e;
  }).finally(() => executor.end());
  const native = await entry;
  // Actual exact start-command replays queue behind this effect; status uses the
  // bounded NOWAIT observation. Neither path can fence or dispatch the start again.
  const replays = Array.from({ length: 9 }, async () => {
    const db = t.connect();
    try {
      return await execute(db, {
        scope: f.scope,
        action: f.action,
        admission: fresh.event,
        predecessor: startPredecessor,
        request,
      });
    } finally {
      await db.end();
    }
  });
  const observations = await Promise.all(
    Array.from({ length: 13 }, async () => {
      const db = t.connect("b8_observer");
      try {
        return await status(db, f.scope, f.action);
      } finally {
        await db.end();
      }
    }),
  );
  assert.ok(
    observations.every((r) =>
      r.status === "UNKNOWN / IN_FLIGHT" && r.retry === "HOLD"
    ),
  );
  release();
  await effect;
  await Promise.all(replays);
  // No acknowledgement is published; observation is independently recovered.
  await t.env(f, "revoke_grant", { grant: g });
  const final = await status(t.observer, f.scope, f.action);
  assert.equal(final.native.effect_count, 1);
  assert.equal(final.native.value, 1);
  assert.equal(final.legitimate, true);
  assert.equal(final.acks.length, 0);
  assert.equal(final.retry, "HOLD");
  assert.equal(final.present.applicable, false);
  assert.equal(final.entitlement.remaining_occurrences, 0);
  assert.equal(final.ordered.filter((e) => e.kind === "fence").length, 1);
  assert.equal(Object.keys(final.starts).length, 2);
  assert.equal(Object.keys(final.admissions).length, 2);
  record.observation_unavailable = observations[0];
  record.mixed_storm = {
    exact_replays: 9,
    status_checks: 13,
    fences_added: 0,
    extra_starts: 0,
  };
  record.native_terminal = native.event;
  record.final = final;
  record.result = "PASS";
  console.log("Untuned post-freeze holdout PASS");
} catch (e) {
  record.result = "FAIL";
  record.error = e.stack;
  throw e;
} finally {
  record.finished_at = new Date().toISOString();
  t.save("holdout.json", record);
  await t.close();
}
