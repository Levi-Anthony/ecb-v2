import assert from "node:assert/strict";
import * as t from "./support.mjs";
import { execute, status } from "../../server/build-8/action.mjs";
const results = [];
try {
  for (const crashed of [false, true]) {
    const f = await t.make(),
      r = await t.ready(f),
      ad = await t.control(f, "admit", r.au);
    const input = {
      scope: f.scope,
      action: f.action,
      admission: ad.event,
      predecessor: ad.event,
      request: t.uuid(),
    };
    if (crashed) {
      await t.control(f, "start", ad.event, {
        p: ad.event,
        request: input.request,
      });
    }
    const first = await execute(t.actor, input), before = await t.head(f);
    for (let i = 0; i < 10; i++) {
      const replay = await execute(t.actor, input);
      assert.equal(replay.native.effect_count, crashed ? 0 : 1);
    }
    assert.equal(await t.head(f), before);
    assert.equal(
      first.status,
      crashed ? "RECONCILE_REQUIRED" : "EFFECT_ESTABLISHED",
    );
    if (crashed) {
      const st = Object.keys(first.starts)[0];
      await t.control(f, "reconcile", st);
      const fresh = await t.control(f, "admit", r.au);
      const result = await execute(t.actor, {
        ...input,
        admission: fresh.event,
        predecessor: fresh.event,
        request: t.uuid(),
      });
      assert.equal(result.native.effect_count, 1);
    }
    results.push({ crashed, first: first.status, replay_event_appends: 0 });
  }
  console.log("Dispatch replay PASS");
} finally {
  t.save("dispatch.json", {
    proof_class: "atomic-ledger synthetic target only",
    results,
  });
  await t.close();
}
