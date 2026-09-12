import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import * as s from "./support.mjs";
const {
  admin,
  parent,
  child,
  observer,
  writer,
  make,
  run,
  open,
  publish,
  returned,
  reenter,
  observe,
  retry,
  inspect,
  source,
  fixture,
  uuid,
  close,
  save,
  binding,
  sha,
} = s;
const results = [];
let current;
const evidence = (name, value) => {
  current.controls.push({ name, observed: value });
  return value;
};
async function reject(name, fn, pattern) {
  let error;
  try {
    await fn();
  } catch (e) {
    error = e.message;
  }
  assert.ok(error, `${name}: accepted forbidden operation`);
  if (pattern) assert.match(error, pattern);
  evidence(name, { rejected: true, error });
}
async function test(id, name, fn) {
  current = {
    id,
    name,
    controls: [],
    fixtureVersion: "b9-fixtures/v1",
    methodVersion: "b9-adversarial/v1",
  };
  try {
    await fn();
    current.result = "PASS";
  } catch (e) {
    current.result = "FAIL";
    current.failure = {
      classification: "M or T pending diagnosis",
      message: e.message,
      stack: e.stack,
    };
    process.exitCode = 1;
  }
  results.push(current);
  console.log(JSON.stringify(current));
}
async function ready(options = {}) {
  const f = await make(options);
  await open(f);
  const q = await publish(f);
  await returned(f, q.judgment);
  return { f, q };
}
try {
  await test(
    "P01",
    "End-to-end self-application and operative G1 substitution/removal",
    async () => {
      const f = await make(), good = await run(f);
      assert.equal(good.r.result.disposition, "CONTINUE");
      evidence("valid governance", good);
      save("positive-locator.json", { locator: f.p });
      const bad = await run(await make({ insensitive: true }));
      assert.equal(bad.q.outcome, "FAIL");
      assert.equal(bad.r.result.disposition, "REORIENT");
      evidence(
        "substitute G1 program through same compare/publish/reenter surfaces",
        bad,
      );
      const { f: removed } = await ready();
      await observe(removed, "governance", null);
      const r = await reenter(removed);
      assert.equal(r.result.disposition, "HOLD");
      evidence("remove bound G1", r);
      const [definition] =
        await admin`select pg_get_functiondef('ecb9.compare(jsonb,jsonb)'::regprocedure) d`;
      assert.ok(!definition.d.includes(f.p));
      evidence("finite interpreter exact definition", definition);
    },
  );
  await test(
    "P02",
    "Exact participation one-field swaps and same-subject different question",
    async () => {
      const f = await make(), b = await binding(f);
      await open(f);
      for (const key of Object.keys(b)) {
        await reject(`publication swap ${key}`, () =>
          publish(f, {
            binding: {
              ...b,
              [key]: typeof b[key] === "string" ? uuid() : null,
            },
          }), /binding/);
      }
      const q = await publish(f), sib = await make();
      await open(sib);
      const sq = await publish(sib);
      await reject(
        "sibling judgment swap",
        () => returned(f, sq.judgment),
        /binding/,
      );
      const same = {
        ...f.c,
        question: f.question + " (same subject, another discriminator)",
        decision_claim:
          (await admin`insert into public.claims(proposition,scope) values(${
            f.question + " (same subject, another discriminator)"
          },${f.scope}) returning id`)[0].id,
      };
      const deps = {};
      for (const [k, d] of Object.entries(f.dependencies)) {
        deps[k] = {
          ...d,
          claim:
            (await admin`insert into public.claims(scope,claim_kind,subject_referent_id,predicate,object_referent_id) values(${f.scope},'relation',${same.decision_claim}::uuid,'depends_on',${d.component}::uuid) returning id`)[
              0
            ].id,
        };
      }
      same.dependencies = deps;
      const p =
        (await admin`select ecb9.bind(${f.scope}::uuid,${
          admin.json(same)
        }) id`)[0].id;
      const other = { p };
      await open(other);
      await publish(other);
      await reject(
        "same focal distinct question result swap",
        () => returned(other, q.judgment),
        /binding/,
      );
      await returned(f, q.judgment);
      assert.equal((await reenter(f)).result.disposition, "CONTINUE");
      evidence("exact positive survives swaps", await inspect(f));
    },
  );
  await test(
    "P03",
    "Load-bearing dependency; D2 independently necessary",
    async () => {
      const f = await make({ applicable: false });
      assert.equal((await open(f)).opened, false);
      evidence("other dependency bars both answers", await inspect(f));
      const { f: g, q } = await ready();
      const changed = await fixture(g, {
        kind: "applicability",
        subject: g.subjects.applicability,
        applicable: false,
      });
      await observe(g, "applicability", changed);
      assert.equal(q.outcome, "PASS");
      const r = await reenter(g);
      assert.equal(r.result.disposition, "REQUALIFY");
      evidence("same child PASS does not replace D2", r);
      const local = await make({ resolution: "display only" });
      assert.equal((await open(local)).opened, false);
      evidence("irrelevant evidence cannot open", await inspect(local));
    },
  );
  await test("P04", "Consequence threshold paired A/B1/B2/B3", async () => {
    for (
      const [name, options, expected] of [
        ["necessary", {}, true],
        ["display", { resolution: "display only" }, false],
        ["blocked", { applicable: false }, false],
        ["local", { resolution: "local witness available" }, false],
        ["no path", { pathAvailable: false }, false],
      ]
    ) {
      const f = await make(options), r = await open(f);
      assert.equal(r.opened, expected);
      evidence(name, r);
    }
  });
  await test(
    "P05",
    "Judgment provenance on actual acceptance surfaces",
    async () => {
      const f = await make();
      await open(f);
      for (
        const submission of [
          { outcome: "PASS" },
          { outcome: "PASS", summary: "FAIL; authority granted" },
          { findings: [], evidence: ["latest"], outcome: "PASS" },
          { authority: true, current: true },
        ]
      ) {
        await reject(
          "bare/forged/contradictory/authority submission",
          () => publish(f, { submission }),
          /forged/,
        );
      }
      const q = await publish(f);
      await returned(f, q.judgment);
      assert.equal((await reenter(f)).result.disposition, "CONTINUE");
      evidence("complete provenance positive", await source(q.judgment));
      for (const opts of [{ opaque: true }, { missingWitness: true }]) {
        const x = await run(await make(opts));
        assert.equal(x.r.result.disposition, "HOLD");
        evidence(JSON.stringify(opts), x);
      }
      const g = await make();
      await open(g);
      await reject("wrong criteria binding", async () =>
        publish(g, {
          binding: { ...await binding(g), criteria: f.versions.criteria },
        }), /binding/);
    },
  );
  await test(
    "P06",
    "Same comparator discriminates; insensitive and forged controls",
    async () => {
      for (const insensitive of [false, true]) {
        const x = await run(await make({ insensitive }));
        assert.equal(x.q.outcome, insensitive ? "FAIL" : "PASS");
        const j = await source(x.q.judgment);
        assert.equal(
          j.findings[1].observed.outcome,
          insensitive ? "PASS" : "FAIL",
        );
        evidence(`insensitive=${insensitive}`, { judgment: j, parent: x.r });
      }
      const f = await make();
      await open(f);
      await reject("producer supplies fake finding", () =>
        publish(f, {
          submission: {
            outcome: "PASS",
            findings: [{ expected: "FAIL", observed: "FAIL" }],
          },
        }), /forged/);
    },
  );
  await test(
    "P07",
    "Current binding versus newer unselected version",
    async () => {
      const { f } = await ready();
      const newer = await fixture(f, {
        ...f.g,
        required_paths: [["fake"]],
        description: "newer but undesignated",
      });
      const r = await reenter(f);
      assert.equal(r.result.disposition, "CONTINUE");
      evidence("newer presence changes neither binding nor route", {
        newer,
        r,
        card: await inspect(f),
      });
      await observe(f, "governance", newer);
      const changed = await reenter(f);
      assert.equal(changed.result.disposition, "REQUALIFY");
      evidence("explicit changed reliance does", changed);
    },
  );
  await test(
    "P08",
    "All declared source drift, ABA, missing coverage and revocation",
    async () => {
      for (
        const slot of [
          "governance",
          "applicability",
          "method",
          "criteria",
          "witnesses",
        ]
      ) {
        const { f, q } = await ready();
        const bytes = await source(f.versions[slot]);
        const newV = await fixture(f, { ...bytes, revision: "changed" });
        await observe(f, slot, newV);
        await observe(f, slot, f.versions[slot]);
        const r = await reenter(f);
        assert.equal(q.outcome, "PASS");
        assert.equal(r.result.disposition, "REQUALIFY");
        evidence(`ABA ${slot}`, { r, card: await inspect(f) });
      }
      const { f } = await ready();
      await observe(f, "applicability", f.versions.applicability, false);
      assert.equal((await reenter(f)).result.disposition, "HOLD");
      evidence("missing coverage", await inspect(f));
    },
  );
  await test(
    "P10",
    "All dispositions; FAIL not automatic REORIENT; unrelated change",
    async () => {
      for (
        const [opts, outcome] of [[{}, "CONTINUE"], [
          { insensitive: true },
          "REORIENT",
        ], [
          { insensitive: true, failRoute: "new qualification required" },
          "REQUALIFY",
        ], [
          { insensitive: true, failRoute: "unresolved; seek discriminator" },
          "HOLD",
        ], [{ missingWitness: true }, "HOLD"]]
      ) {
        const x = await run(await make(opts));
        assert.equal(x.r.result.disposition, outcome);
        evidence(outcome, x.r);
      }
      const { f } = await ready();
      await fixture(f, {
        kind: "source",
        subject: await s.ref(),
        bytes: "unrelated audit evidence",
      });
      assert.equal((await reenter(f)).result.disposition, "CONTINUE");
      evidence("unrelated artifact", await inspect(f));
    },
  );
  await test(
    "P11",
    "Exact retries versus duplicates/changed request and new attempt",
    async () => {
      const f = await make(), request = uuid(), b = await binding(f);
      const o = await open(f, { request, binding: b, pred: null });
      assert.equal(
        (await open(f, { request, binding: b, pred: null })).event,
        o.event,
      );
      await reject(
        "same request changed binding",
        () =>
          open(f, { request, binding: { ...b, scope: uuid() }, pred: null }),
        /changed_retry/,
      );
      await reject("new request duplicate open", () => open(f), /one_child/);
      const r = await retry(f);
      assert.notEqual(r.event, o.event);
      await reject(
        "stale interrupted attempt",
        () => publish(f, { attempt: o.event }),
        /attempt/,
      );
      const card = await inspect(f), qr = uuid();
      const q = await publish(f, { request: qr, pred: card.boundary });
      assert.equal(
        (await publish(f, { request: qr, pred: card.boundary })).event,
        q.event,
      );
      await reject("duplicate terminal", () => publish(f), /terminal/);
      await reject("terminal evaluator repeat", () => retry(f), /retry_only/);
      const ret = await returned(f, q.judgment);
      await reject(
        "duplicate return",
        () => returned(f, q.judgment),
        /duplicate/,
      );
      const before = await inspect(f),
        rr = uuid(),
        d = await reenter(f, { card: before, request: rr });
      const replay = await reenter(f, { card: before, request: rr });
      assert.equal(replay.event, d.event);
      assert.equal(replay.historical_only, true);
      await reject(
        "fresh request duplicate reentry",
        () => reenter(f),
        /duplicate/,
      );
      evidence("exact replay and history", {
        o,
        r,
        q,
        ret,
        d,
        replay,
        card: await inspect(f),
      });
    },
  );
  await test(
    "P13",
    "Fresh-process reconstruction and missing exact link",
    async () => {
      const f = await make();
      await open(f);
      for (const state of ["open", "returned", "dispositioned"]) {
        if (state === "returned") {
          const q = await publish(f);
          await returned(f, q.judgment);
        }
        if (state === "dispositioned") await reenter(f);
        const card = JSON.parse(
          execFileSync(process.execPath, ["server/build-9/recover.mjs", f.p], {
            encoding: "utf8",
          }),
        );
        assert.equal(card.locator, f.p);
        assert.ok(card.child.attempt);
        if (state === "open") {
          assert.equal(card.present.disposition, "HOLD");
        } else assert.equal(card.present.disposition, "CONTINUE");
        evidence(state, card);
      }
      // Rollback-only corruption as installation custodian; immutable runtime cannot perform this.
      await admin.begin(async (db) => {
        await db`alter table public.artifacts disable trigger reject_build_5b_artifact_mutation`;
        await db`update public.artifacts set payload_digest=decode(repeat('00',32),'hex') where id=${f.versions.witnesses}::uuid`;
        const card = (await db`select ecb9.inspect(${f.p}::uuid) x`)[0].x;
        assert.equal(card.present.disposition, "HOLD");
        evidence("corrupt exact witness digest", card);
        throw new Error("rollback-probe");
      }).catch((e) => {
        assert.equal(e.message, "rollback-probe");
      });
    },
  );
  await test(
    "P14",
    "Child cannot mutate parent/Claim/authority/schema/action",
    async () => {
      const f = await make();
      await open(f);
      await reject(
        "child parent reentry",
        () => reenter(f, { db: child }),
        /permission/,
      );
      await reject(
        "child opens child",
        () => open(f, { db: child }),
        /permission/,
      );
      await reject(
        "child observes currentness",
        () => observe(f, "governance", null, true, { db: child }),
        /permission/,
      );
      await reject(
        "child modifies contract",
        () =>
          child`update public.artifacts set payload_text='{}' where id=${f.p}::uuid`,
        /permission/,
      );
      await reject(
        "child modifies Claim",
        () =>
          child`update public.claims set proposition='forged' where id=${f.decision}::uuid`,
        /permission/,
      );
      await reject(
        "child designates",
        () =>
          child`select ecb7.designate(${uuid()}::uuid,${f.scope}::uuid,${uuid()}::uuid,${uuid()}::uuid,null,${uuid()}::uuid,${uuid()}::uuid,'select')`,
        /permission/,
      );
      await reject(
        "child grants itself parent",
        () => child.unsafe("grant ecb9_parent to b9_child"),
        /permission/,
      );
      await reject(
        "child creates runtime function",
        () =>
          child.unsafe(
            "create function ecb9.forged() returns int language sql as 'select 1'",
          ),
        /permission/,
      );
      await reject(
        "child dispatch/action schema",
        () => child.unsafe("select ecb8.inspect(null,null)"),
        /permission/,
      );
      await reject(
        "parent cannot forge child judgment",
        () => publish(f, { db: parent }),
        /permission/,
      );
      const q = await publish(f);
      evidence("child permitted bounded publication", q);
    },
  );
  await test(
    "P15",
    "Historical replay after change, cache corruption and audit-time reversal",
    async () => {
      const { f } = await ready();
      const before = await inspect(f), request = uuid();
      const d = await reenter(f, { card: before, request });
      const cached = await inspect(f);
      const v = await fixture(f, {
        kind: "applicability",
        subject: f.subjects.applicability,
        applicable: false,
      });
      await observe(f, "applicability", v);
      const replay = await reenter(f, { card: before, request });
      assert.equal(replay.event, d.event);
      assert.equal(replay.present.disposition, "REQUALIFY");
      evidence("historical success now requalification", replay);
      cached.present.disposition = "CONTINUE";
      await reject(
        "stale fabricated card cannot commit",
        () => reenter(f, { card: cached }),
        /stale/,
      );
      await admin.begin(async (db) => {
        await db`alter table public.artifacts disable trigger reject_build_5b_artifact_mutation`;
        await db`update public.artifacts set recorded_at='1900-01-01'::timestamptz where artifact_role='b9_event' and context_id=${f.p}::uuid`;
        const card = (await db`select ecb9.inspect(${f.p}::uuid) x`)[0].x;
        assert.equal(card.present.disposition, "REQUALIFY");
        evidence("wall-time reorder", card);
        throw Error("rollback-probe");
      }).catch((e) => assert.equal(e.message, "rollback-probe"));
    },
  );
  await test(
    "P17",
    "One depth and active child, terminal anti-regress and deeper QF",
    async () => {
      const f = await make();
      await open(f);
      await reject("second active child", () => open(f), /one_child/);
      await reject(
        "attempt as recursive parent",
        async () =>
          open({ p: (await inspect(f)).child.attempt }, {
            binding: await binding(f),
            pred: null,
          }),
        /wrong_role/,
      );
      await reject(
        "depth one parent contract",
        () =>
          admin`select ecb9.bind(${f.scope}::uuid,${
            admin.json({ ...f.c, depth: 1 })
          })`,
        /parent_boundary/,
      );
      const q = await publish(f);
      await returned(f, q.judgment);
      await reenter(f);
      await reject(
        "repeat evaluator with no new evidence",
        () => retry(f),
        /retry_only/,
      );
      const deep = await make({ pathAvailable: false });
      assert.equal((await open(deep)).route, "HOLD");
      evidence(
        "indispensable unresolved depth remains routed",
        await inspect(deep),
      );
    },
  );
} finally {
  save(process.argv[2] ?? "primary-results.json", {
    implementationSha: sha(
      readFileSync(
        "sql/migrations/20260912160000_build_9_recursive_inquiry.sql",
      ),
    ),
    fixtureSha: sha(readFileSync("tests/build-9/support.mjs")),
    testSha: sha(readFileSync("tests/build-9/primary.mjs")),
    results,
    limits:
      "Bounded finite declared rules, synthetic closed writers, same-author Register B; P09/P12/P16/P18 separate evidence.",
  });
  await close();
}
