import test, { after } from "node:test";
import assert from "node:assert/strict";
import {
  admin,
  capacities,
  close,
  connect,
  copy,
  doc,
  evaluate,
  evaluator,
  executor,
  fixture,
  grant,
  make,
  method,
  observe,
  producer,
  qualify,
  retain,
  save,
  select,
  uuid,
} from "./support.mjs";
import { recover } from "../../server/build-7/recover.mjs";
after(close);
const findings = [];
const expect = (x, outcome, obligation, reason) => {
  assert.equal(x.result.outcome, outcome);
  if (obligation) {
    const f = x.result.findings.find((x) => x.obligation === obligation);
    assert.ok(f);
    assert.equal(f.status, outcome);
    if (reason) assert.match(JSON.stringify(f), reason);
  }
  findings.push({
    candidate: x.id,
    evaluation: x.result.id,
    outcome,
    obligation,
  });
};
after(() => save("primary-findings.json", findings));
test("T5 two source-sensitive specimens: correct and defective controls", async () => {
  for (const kind of ["thermostat", "human"]) {
    const f = await make(kind);
    const good = await evaluate(f);
    expect(good, "PASS");
    const bad = copy(f.candidate);
    bad.conclusions[0].answer = !bad.conclusions[0].answer;
    expect(
      await evaluate(f, bad),
      "FAIL",
      "comparison",
      /access_or_consequence_substitution/,
    );
  }
});

test("T1 focal drift, representation identity and harmless rendering", async () => {
  const f = await make();
  const c = copy(f.candidate);
  c.expression =
    "Only the external observation distinguishes the stipulated cases; the native observation does not.";
  expect(await evaluate(f, c), "PASS");
  c.focal = uuid();
  expect(await evaluate(f, c), "FAIL", "focal_identity");
  const alias = copy(f.candidate);
  const id = uuid();
  alias.focal = id;
  await producer`insert into public.artifacts(id,artifact_role,context_id,payload_text) values(${id}::uuid,'b7_candidate',${f.scope}::uuid,${
    JSON.stringify(alias)
  })`;
  const result = await qualify(evaluator, id, f.contract, uuid());
  expect({ id, result }, "FAIL", "focal_identity");
});
test("T2 mapper, access and frame cannot collapse; source alias permutation follows supplied source", async () => {
  const f = await make();
  for (const key of ["mapper", "access", "frame"]) {
    const c = copy(f.candidate);
    if (key === "mapper") c.mappings[0].mapper = f.focal;
    if (key === "access") c.mappings[0].access = "first_person";
    if (key === "frame") c.mappings[0].frame.anchor = f.mapper;
    expect(await evaluate(f, c), "FAIL", "mapping_access");
  }
  const g = copy(f.grammarData);
  const [a, b] = f.tokens;
  [g.aliases[a], g.aliases[b]] = [g.aliases[b], g.aliases[a]];
  const gid = await fixture("b7_grammar", f.focal, g), c = copy(f.candidate);
  c.grammar = gid;
  // Exchange token identities only: unchanged familiar expression text must not override supplied aliases.
  c.mappings = c.mappings.map((m) => ({ ...m, token: m.token === a ? b : a }));
  const { bind } = await import("./support.mjs");
  await bind(c);
  expect(await evaluate(f, c), "FAIL", "comparison");
  c.conclusions.forEach((x) => x.answer = !x.answer);
  expect(await evaluate(f, c), "PASS");
  expect(await evaluate(f), "PASS"); // reversal
});
test("T3 six dispositions per capacity, actual removal and Question Forward calibration", async () => {
  const { bind } = await import("./support.mjs");
  const f = await make();
  for (const k of capacities) {
    for (
      const status of [
        "rich",
        "minimal",
        "unresolved",
        "non_live",
        "unsupported",
      ]
    ) {
      const c = copy(f.candidate);
      c.dispositions[k].status = status;
      c.dispositions[k].alternative_consequences = ["same", "same"];
      expect(await evaluate(f, c), "PASS");
    }
    const g = copy(f.grammarData);
    delete g.capacities[k];
    g.interpretation_sources = [];
    const c = copy(f.candidate);
    c.grammar = await fixture("b7_grammar", f.focal, g);
    await bind(c);
    expect(
      await evaluate(f, c),
      "INCOMPLETE",
      "structural_supply",
      /structural_support_unavailable/,
    );
  }
  for (const question of ["", "Is it good?"]) {
    const c = copy(f.candidate);
    c.question_forward.question = question;
    expect(await evaluate(f, c), "FAIL", "resolution_question_forward");
  }
  const c = copy(f.candidate);
  c.dispositions.types.status = "unresolved";
  c.dispositions.types.alternative_consequences = ["allow", "deny"];
  expect(await evaluate(f, c), "INDETERMINATE", "resolution_question_forward");
  delete c.dispositions.types;
  c.omission_challenges.types =
    "The stipulated measurement discrimination uses only the retained native observations; a changed sensing type re-enters through the focal question";
  expect(await evaluate(f, c), "PASS");
  delete c.omission_challenges.types;
  expect(await evaluate(f, c), "FAIL", "resolution_question_forward");
});
test("A/B/C hidden-model-substitution: A supported; B capacity unavailable; C labels removed, capacity retained", async () => {
  const { bind } = await import("./support.mjs");
  const f = await make();
  expect(await evaluate(f), "PASS");
  const missing = copy(f.grammarData);
  delete missing.capacities.directional_frame;
  missing.interpretation_sources = [];
  const b = copy(f.candidate);
  b.grammar = await fixture("b7_grammar", f.focal, missing);
  await bind(b);
  expect(await evaluate(f, b), "INCOMPLETE", "structural_supply");
  const labels = copy(f.grammarData);
  for (const v of Object.values(labels.capacities)) delete v.label;
  const c = copy(f.candidate);
  c.grammar = await fixture("b7_grammar", f.focal, labels);
  await bind(c);
  expect(await evaluate(f, c), "PASS");
  save("ablation.json", {
    claim:
      "externally supplied source-sensitive architectural behavior and qualification gating only",
    A: "PASS",
    B: "INCOMPLETE structural_support_unavailable",
    C: "PASS retained capacity; not a capacity ablation",
    internal_model_visibility: false,
  });
});
test("T4 Level/Stage/State and one-Line/whole-Referent substitutions fail", async () => {
  const f = await make("human");
  for (
    const mutation of ["level_stage", "state_stage", "whole_referent", "type"]
  ) {
    const c = copy(f.candidate);
    if (mutation === "level_stage") c.coordinates[0].dimension = "stage";
    if (mutation === "state_stage") c.coordinates[3].dimension = "stage";
    if (mutation === "whole_referent") c.coordinates[2].line = null;
    if (mutation === "type") c.coordinates[5].value = "unearned_typology";
    expect(await evaluate(f, c), "FAIL", "coordinates");
  }
  expect(await evaluate(f), "PASS");
});
test("T5/T6 producer success and dimensional promotions supply no qualification", async () => {
  const f = await make();
  for (
    const dimension of [
      "truth",
      "warrant",
      "authority",
      "designation",
      "currentness",
      "execution_authorization",
      "first_person_access",
    ]
  ) {
    const c = copy(f.candidate);
    c.promotions = [dimension];
    expect(await evaluate(f, c), "FAIL", "non_promotion");
  }
  const c = copy(f.candidate);
  c.producer_succeeded = true;
  c.PASS = true;
  c.conclusions[0].answer = true;
  expect(await evaluate(f, c), "FAIL", "comparison");
  const x = await evaluate(f);
  await assert.rejects(
    producer`select ecb7.publish(${uuid()}::uuid,'[]'::jsonb,${method})`,
    /permission denied/,
  );
  await assert.rejects(
    producer`insert into public.artifacts(id,artifact_role,context_id,payload_text) values(${uuid()}::uuid,'b7_evaluation',${x.id}::uuid,'{"outcome":"PASS"}')`,
    /protected_build7_role/,
  );
  await assert.rejects(
    producer`update ecb7.scopes set current_event=${x.id}::uuid where id=${f.scope}::uuid`,
    /permission denied/,
  );
  await assert.rejects(
    producer`update public.artifacts set payload_text='{}' where id=${x.id}::uuid`,
    /permission denied/,
  );
});
test("T7 exact synthetic designation; all invalid authority paths leave no currentness", async () => {
  const f = await make(), x = await evaluate(f), o = await observe(f);
  expect(x, "PASS");
  assert.equal((await recover(executor, f.scope, o)).status, "no_designation");
  const wrong = [
    { issuer: "forged" },
    { actor: "another_actor" },
    { scope: uuid() },
    { candidate: uuid() },
    { evaluation: uuid() },
    { predecessor: uuid() },
    { operation: "policy_succession" },
    { temporal: null },
    {
      temporal: {
        act: "interval",
        from: "2000-01-01",
        until: "2001-01-01",
        continuing_effect: "historical_act_only",
      },
    },
  ];
  for (const extra of wrong) {
    const g = await grant(f, x, null, extra);
    await assert.rejects(select(f, x, null, g, o));
    assert.equal(
      (await recover(executor, f.scope, o)).status,
      "no_designation",
    );
  }
  await assert.rejects(
    select(f, x, null, uuid(), o),
    /exact_payload_unavailable/,
  );
  const revoked = await grant(f, x),
    revObs = await observe(f, f.candidate, { revoked_grants: [revoked] });
  await assert.rejects(select(f, x, null, revoked, revObs), /grant_revoked/);
  const bad = copy(f.candidate);
  bad.conclusions[0].answer = true;
  const failed = await evaluate(f, bad);
  const badGrant = await grant(f, failed);
  await assert.rejects(
    select(f, failed, null, badGrant, o),
    /qualification_not_pass/,
  );
  const g = await grant(f, x), event = await select(f, x, null, g, o);
  const r = await recover(executor, f.scope, o);
  assert.equal(r.status, "recovered");
  assert.equal(r.current_selection, x.id);
  assert.equal(r.execution_authorized, false);
  const withdrawalGrant = await grant(f, x, event.event, {
    operation: "withdraw",
  });
  const wd = await select(
    f,
    x,
    event.event,
    withdrawalGrant,
    o,
    uuid(),
    "withdraw",
  );
  assert.equal(
    (await recover(executor, f.scope, o)).status,
    "selection_withdrawn",
  );
  const restoreGrant = await grant(f, x, wd.event);
  await select(f, x, wd.event, restoreGrant, o);
  assert.equal((await recover(executor, f.scope, o)).current_selection, x.id);
});
test("T8/T10 exact cold episode, polished substitution, changed basis, confirmation and separate re-designation", async () => {
  const { bind } = await import("./support.mjs");
  const f = await make(),
    x = await evaluate(f),
    o = await observe(f),
    g = await grant(f, x);
  const ev = await select(f, x, null, g, o);
  const polished = copy(f.candidate);
  polished.expression =
    "The external path discriminates these cases; the native path does not.";
  expect(await evaluate(f, polished), "PASS");
  const first = await recover(executor, f.scope, o);
  assert.equal(first.current_selection, x.id);
  assert.equal(first.expression.expression, f.candidate.expression);
  const changed = await observe(f, f.candidate, {
    dependencies: {
      ...f.candidate.dependencies,
      [f.snapshots[0]]: "changed_calibration",
    },
  });
  const drift = await recover(executor, f.scope, changed);
  assert.equal(drift.status, "requalification_required");
  assert.equal(drift.current_selection, x.id);
  assert.equal(drift.reliance.gaps[0].dependency, f.snapshots[0]);
  const confirm = await observe(f);
  assert.equal((await recover(executor, f.scope, confirm)).status, "recovered");
  const confirmed = await qualify(evaluator, x.id, f.contract, uuid());
  assert.equal(confirmed.outcome, "PASS");
  assert.notEqual(confirmed.id, x.result.id);
  const src = await doc(admin, f.snapshots[0]);
  src.calibration = "v2";
  const snapshot = await fixture("b7_snapshot", f.focal, src);
  const c = copy(f.candidate);
  c.parent = x.id;
  c.snapshots = [snapshot, ...c.snapshots.slice(1)];
  // New semantic basis keeps the exact short wording; every mapping and coordinate is explicitly rebound.
  c.coordinates.forEach((v) => {
    if (v.snapshot === f.snapshots[0]) v.snapshot = snapshot;
  });
  const gg = copy(f.grammarData);
  gg.aliases[f.tokens[0]].snapshot = snapshot;
  c.grammar = await fixture("b7_grammar", f.focal, gg);
  const m = c.mappings[0];
  m.snapshot = snapshot;
  m.claim = uuid();
  await producer`insert into public.claims(id,proposition,scope) values(${m.claim}::uuid,${
    JSON.stringify({
      focal: m.focal,
      anchor: m.frame.anchor,
      relation: m.frame.relation,
      mapper: m.mapper,
      source: m.snapshot,
      access: m.access,
    })
  },${f.scope})`;
  await bind(c);
  const next = await evaluate(f, c);
  expect(next, "PASS");
  assert.equal((await recover(executor, f.scope, o)).current_selection, x.id);
  const nextObs = await observe(f, c), ng = await grant(f, next, ev.event);
  await select(f, next, ev.event, ng, nextObs);
  const second = await recover(executor, f.scope, nextObs);
  assert.equal(second.current_selection, next.id);
  assert.equal(second.chain.length, 2);
  assert.equal(second.expression.expression, first.expression.expression);
  assert.notDeepEqual(
    second.expression.dependencies,
    first.expression.dependencies,
  );
  save("cold-input.json", {
    database: "postgres://b7_actor@127.0.0.1:55440/build7",
    scope: f.scope,
    observation: nextObs,
    interpretation_locators: [
      "linear:ECO-94/document/e8eb0117-6e1a-454c-807b-cd2bbd63c034",
    ],
  });
  save("cold-expected.json", {
    candidate: next.id,
    earlier: x.id,
    expression: first.expression.expression,
  });
  save("episode.json", { first, drift, confirmation: confirmed, second });
});
test("T9 competing designations serialize, rollback permits waiter, ABA and exact retry", async () => {
  const f = await make(),
    a = await evaluate(f),
    b = await evaluate(f),
    o = await observe(f);
  const ga = await grant(f, a), gb = await grant(f, b);
  const db2 = connect("b7_actor");
  try {
    const req = uuid();
    const both = await Promise.allSettled([
      select(f, a, null, ga, o, req),
      select(f, b, null, gb, o, uuid(), "select", db2),
    ]);
    assert.equal(both.filter((x) => x.status === "fulfilled").length, 1);
    assert.match(
      both.find((x) => x.status === "rejected").reason.message,
      /stale_predecessor/,
    );
    const r = await recover(executor, f.scope, o);
    const winner = r.current_selection === a.id ? a : b;
    const wg = winner === a ? ga : gb;
    const original = both[0].status === "fulfilled" ? req : null;
    if (original) {
      const retry = await select(f, winner, null, wg, o, original);
      assert.equal(retry.event, r.historical_designation);
      assert.equal(retry.recovered, true);
      await assert.rejects(
        select(f, b, null, wg, o, original),
        /request_conflict/,
      );
    }
    const ag = await grant(f, a, r.historical_designation),
      toA = await select(f, a, r.historical_designation, ag, o);
    const bg = await grant(f, b, toA.event),
      toB = await select(f, b, toA.event, bg, o);
    const again = await grant(f, a, toB.event);
    await select(f, a, toB.event, again, o);
    const stale = await grant(f, b, toA.event);
    await assert.rejects(
      select(f, b, toA.event, stale, o),
      /stale_predecessor/,
    );
    const f2 = await make(),
      x = await evaluate(f2),
      ob = await observe(f2),
      g = await grant(f2, x);
    let release, held;
    const barrier = new Promise((r) => held = r);
    const unblock = new Promise((r) => release = r);
    const tx = executor.begin(async (tx) => {
      await select(f2, x, null, g, ob, uuid(), "select", tx);
      held();
      await unblock;
      throw Error("intentional rollback");
    });
    await barrier;
    let finished = false;
    const waiter = select(f2, x, null, g, ob, uuid(), "select", db2).then(
      (r) => {
        finished = true;
        return r;
      },
    );
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(finished, false);
    release();
    await assert.rejects(tx, /intentional rollback/);
    assert.ok((await waiter).event);
  } finally {
    await db2.end();
  }
});
test("T9 unknown acknowledgement, exact recovery after act expiry, temporal continuing effects", async () => {
  const f = await make(), x = await evaluate(f), o = await observe(f);
  const g = await grant(f, x, null, {
      temporal: {
        act: "interval",
        from: "2000-01-01",
        until: new Date(Date.now() + 800).toISOString(),
        continuing_effect: "historical_act_only",
      },
    }),
    request = uuid();
  await select(f, x, null, g, o, request); // Deliberately discard the successful response (client acknowledgement loss).
  await new Promise((r) => setTimeout(r, 850));
  const r = await select(f, x, null, g, o, request);
  assert.equal(r.recovered, true);
  assert.equal((await recover(executor, f.scope, o)).status, "recovered");
  const ng = await grant(f, x, r.event, {
    temporal: { act: "until_revoked", continuing_effect: "unrevoked" },
  });
  await select(f, x, r.event, ng, o);
  const revoked = await observe(f, f.candidate, { revoked_grants: [ng] });
  const rr = await recover(executor, f.scope, revoked);
  assert.equal(rr.status, "requalification_required");
  assert.equal(rr.reliance.gaps[0].reason, "continuing_authority_condition");
});
test("T10/T11 local evidence and upward pressure retained; no rigid slots or silent rule change", async () => {
  const { bind } = await import("./support.mjs");
  const f = await make();
  const c = copy(f.candidate), src = await doc(admin, f.snapshots[1]);
  src.local_evidence = [{
    id: "novel",
    text:
      "An unanticipated observer can discriminate a contrast outside the present native path.",
    challenges_rule: "directional_frame",
  }];
  const id = await fixture("b7_snapshot", f.focal, src);
  c.snapshots.push(id);
  await bind(c);
  expect(await evaluate(f, c), "FAIL", "evidence_pressure");
  c.evidence_dispositions = [{
    snapshot: id,
    evidence: "novel",
    finding: "Preserve this new source alongside existing native limit",
    rule: "directional_frame",
    governing_route: "human governing disposition under unchanged ECO-94",
    affected_decision: "whether native limitation remains applicable",
  }];
  expect(await evaluate(f, c), "PASS");
  c.governing_revision = "silently_rewritten";
  expect(await evaluate(f, c), "FAIL", "evidence_pressure");
  const unrelated = await observe(f, f.candidate, {
    dependencies: { ...f.candidate.dependencies, embedding: "changed" },
  });
  const x = await evaluate(f), g = await grant(f, x);
  await select(f, x, null, g, unrelated);
  const r = await recover(executor, f.scope, unrelated);
  assert.equal(r.status, "recovered");
  assert.equal(r.execution_authorized, false);
  assert.ok(!("recursive_work" in r));
});

test("T8 fresh process reconstructs exact retained surface without fixture or producer imports", async () => {
  const { spawnSync } = await import("node:child_process");
  const { readFileSync } = await import("node:fs");
  const root = new URL(
    "../../docs/build-receipts/evidence/build-7/",
    import.meta.url,
  );
  const run = spawnSync(process.execPath, [
    new URL("./cold.mjs", import.meta.url).pathname,
    new URL("cold-input.json", root).pathname,
    new URL("cold-output.json", root).pathname,
  ], { encoding: "utf8", env: { PATH: process.env.PATH } });
  assert.equal(run.status, 0, run.stderr);
  const expected = JSON.parse(
    readFileSync(new URL("cold-expected.json", root), "utf8"),
  );
  const actual = JSON.parse(
    readFileSync(new URL("cold-output.json", root), "utf8"),
  );
  assert.equal(actual.current_selection, expected.candidate);
  assert.equal(actual.expression.expression, expected.expression);
  assert.equal(actual.chain.length, 2);
  assert.ok(actual.grammar.capacities.quadrants);
  assert.ok(actual.grant.synthetic);
  assert.ok(
    Object.values(actual.retained).some((x) =>
      x.artifact_role === "b7_snapshot"
    ),
  );
});
test("T8 missing decision-bearing bytes and broken event/pointer history are explicitly unavailable", async () => {
  const f = await make(),
    x = await evaluate(f),
    o = await observe(f),
    g = await grant(f, x);
  const event = await select(f, x, null, g, o);
  // Fault injection only inside a rolled-back custody transaction in the disposable database.
  await admin.begin(async (tx) => {
    await tx.unsafe(
      "alter table public.artifacts disable trigger reject_build_5b_artifact_mutation",
    );
    await tx`delete from public.artifacts where id=${f.snapshots[0]}::uuid`;
    const r = await recover({ begin: (_mode, fn) => fn(tx) }, f.scope, o);
    assert.equal(r.status, "incomplete");
    assert.match(r.reason, /exact_payload_unavailable/);
    throw Error("rollback_fault_probe");
  }).catch((e) => {
    assert.match(e.message, /rollback_fault_probe/);
  });
  assert.equal((await recover(executor, f.scope, o)).status, "recovered");
  await admin.begin(async (tx) => {
    await tx`update ecb7.scopes set current_event=null where id=${f.scope}::uuid`;
    const r = await recover({ begin: (_mode, fn) => fn(tx) }, f.scope, o);
    assert.equal(r.status, "conflicting_history");
    throw Error("rollback_fault_probe");
  }).catch((e) => assert.match(e.message, /rollback_fault_probe/));
  assert.equal(
    (await recover(executor, f.scope, o)).historical_designation,
    event.event,
  );
});
test("C2 committed attempts, unknown terminal, exact publication retry and wrong method", async () => {
  const { examine } = await import("../../server/build-7/qualification.mjs");
  const f = await make(), id = await retain(f), a = uuid();
  await evaluator`select ecb7.attempt(${a}::uuid,${id}::uuid)`;
  assert.equal((await doc(evaluator, a)).status, "pending");
  const fs = await examine(evaluator, id, f.contract);
  await assert.rejects(
    evaluator`select ecb7.publish(${a}::uuid,${
      evaluator.json(fs)
    },'forged_method')`,
    /method_binding/,
  );
  const [r] = await evaluator`select ecb7.publish(${a}::uuid,${
    evaluator.json(fs)
  },${method}) as id`;
  const [retry] = await evaluator`select ecb7.publish(${a}::uuid,${
    evaluator.json(fs)
  },${method}) as id`;
  assert.equal(r.id, retry.id);
  await assert.rejects(
    evaluator.begin(async (tx) => {
      const attempt = uuid();
      await tx`select ecb7.attempt(${attempt}::uuid,${id}::uuid)`;
      await tx`select ecb7.publish(${attempt}::uuid,${tx.json(fs)},${method})`;
    }),
    /committed_attempt_required/,
  );
});
test("AP-03 required normative comparator absent with present inputs is INDETERMINATE", async () => {
  const { bind } = await import("./support.mjs");
  const f = await make("human");
  f.ct.comparisons[0].kind = "arbitrary_normative_truth";
  f.contract = await fixture("b7_contract", f.focal, f.ct);
  f.candidate.contract = f.contract;
  await admin`update ecb7.scopes set contract=${f.contract}::uuid where id=${f.scope}::uuid`;
  await bind(f.candidate);
  expect(await evaluate(f), "INDETERMINATE", "comparison");
});

test("T9 backend loss preserves committed attempt and rolls back terminal publication", async () => {
  const { examine } = await import("../../server/build-7/qualification.mjs");
  const f = await make(), candidate = await retain(f), attempt = uuid();
  await evaluator`select ecb7.attempt(${attempt}::uuid,${candidate}::uuid)`;
  const fs = await examine(evaluator, candidate, f.contract),
    dead = connect("b7_evaluator");
  let resultId;
  try {
    await dead.unsafe("begin");
    const [pid] = await dead`select pg_backend_pid() as pid`;
    const [r] = await dead`select ecb7.publish(${attempt}::uuid,${
      dead.json(fs)
    },${method}) as id`;
    resultId = r.id;
    await evaluator`select pg_terminate_backend(${pid.pid})`;
    await new Promise((r) => setTimeout(r, 30));
  } finally {
    await dead.end({ timeout: 1 }).catch(() => {});
  }
  assert.equal((await doc(evaluator, attempt)).status, "pending");
  const [state] =
    await admin`select (select count(*)::int from public.artifacts where id=${resultId}::uuid) artifact,(select count(*)::int from public.referents where id=${resultId}::uuid) referent`;
  assert.deepEqual(state, { artifact: 0, referent: 0 });
  const result = await qualify(evaluator, candidate, f.contract, attempt);
  assert.equal(result.outcome, "PASS");
});

test("T4 positive State changes preserve Stage; T11 empty coordinate overlay retains source re-expansion", async () => {
  const { bind } = await import("./support.mjs");
  const f = await make(), c = copy(f.candidate);
  c.coordinates = [];
  expect(await evaluate(f, c), "PASS");
  const src = await doc(admin, f.snapshots[0]);
  src.coordinates.find((x) => x.dimension === "state").value = "heating";
  const replacement = await fixture("b7_snapshot", f.focal, src),
    g = copy(f.grammarData);
  g.aliases[f.tokens[0]].snapshot = replacement;
  c.grammar = await fixture("b7_grammar", f.focal, g);
  c.snapshots[0] = replacement;
  c.coordinates = copy(f.candidate.coordinates);
  for (const x of c.coordinates) {
    if (x.snapshot === f.snapshots[0]) x.snapshot = replacement;
    if (x.dimension === "state") x.value = "heating";
  }
  const m = c.mappings[0];
  m.snapshot = replacement;
  m.claim = uuid();
  await producer`insert into public.claims(id,proposition,scope) values(${m.claim}::uuid,${
    JSON.stringify({
      focal: m.focal,
      anchor: m.frame.anchor,
      relation: m.frame.relation,
      mapper: m.mapper,
      source: m.snapshot,
      access: m.access,
    })
  },${f.scope})`;
  await bind(c);
  expect(await evaluate(f, c), "PASS");
  expect(await evaluate(f), "PASS");
  const wrong = copy(f.candidate);
  wrong.dispositions.types.status = "non_live";
  wrong.dispositions.types.alternative_consequences = ["permit", "deny"];
  expect(await evaluate(f, wrong), "FAIL", "resolution_question_forward");
});

test("Reuse seam: BUILD 5B PASS and BUILD 6 executor do not supply BUILD 7 qualification or authority", async () => {
  const f = await make(), x = await evaluate(f), o = await observe(f);
  const falseQualification = {
    id: x.id,
    result: { id: "6d0b744b-9707-46cb-b771-9085501e93ee" },
  };
  const g = await grant(f, falseQualification);
  await assert.rejects(
    select(f, falseQualification, null, g, o),
    /wrong_artifact_role/,
  );
  assert.equal((await recover(executor, f.scope, o)).status, "no_designation");
  const custody = connect("custodian");
  try {
    await custody.unsafe("set role ecb_governance_executor");
    await assert.rejects(
      select(f, x, null, g, o, uuid(), "select", custody),
      /permission denied/,
    );
  } finally {
    await custody.end();
  }
});
