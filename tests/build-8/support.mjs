import assert from "node:assert/strict";
import { createHash, randomUUID as uuid } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import postgres from "../build-7/node_modules/postgres/src/index.js";
import { b7 } from "./inherited.mjs";
export { b7, uuid };
export const connect = (u = "b8_actor") =>
  postgres(`postgres://${u}@127.0.0.1:55441/build8`, {
    max: 1,
    prepare: false,
    onnotice: () => {},
  });
export const admin = connect("postgres"),
  actor = connect(),
  other = connect("b8_other"),
  evaluator = connect("b8_evaluator"),
  observer = connect("b8_observer");
export const close = () =>
  Promise.all(
    [admin, actor, other, evaluator, observer].map((x) => x.end()).concat(
      b7.close(),
    ),
  );
export const save = (name, data) => {
  mkdirSync("docs/build-receipts/evidence/build-8", { recursive: true });
  writeFileSync(
    `docs/build-receipts/evidence/build-8/${name}`,
    JSON.stringify(data, null, 2) + "\n",
  );
};
export const doc = async (id, db = admin) =>
  JSON.parse(
    (await db`select payload_text from public.artifacts where id=${id}::uuid`)[
      0
    ].payload_text,
  );
export async function inspect(f, db = observer) {
  return (await db`select ecb8.inspect(${f.scope}::uuid,${f.action}::uuid) x`)[
    0
  ].x;
}
export async function head(f) {
  const r = await inspect(f);
  if (!r.history) throw Error(JSON.stringify(r));
  return r.history.head;
}
export async function basis(f, j) {
  return (await admin`select ecb8.fixture(${f.scope}::uuid,${f.action}::uuid,${
    admin.json(j)
  },${await head(f)}::uuid) id`)[0].id;
}
export async function env(f, k, d) {
  return (await admin`select ecb8.fixture_event(${f.scope}::uuid,${f.action}::uuid,${k},${
    admin.json(d)
  },${await head(f)}::uuid) id`)[0].id;
}
export async function propose(f, c = f.candidate) {
  return (await b7
    .producer`select ecb8.propose(${f.scope}::uuid,${f.action}::uuid,${
    typeof c === "string" ? c : JSON.stringify(c)
  }) id`)[0].id;
}
export async function qualify(f, id, ct = f.contract) {
  const q =
    (await evaluator`select ecb8.qualify(${f.scope}::uuid,${f.action}::uuid,${id}::uuid,${ct}::uuid,${await head(
      f,
    )}::uuid) id`)[0].id;
  return { id: q, ...await doc(q) };
}
export async function grant(f, id, q, predecessor = null, extra = {}) {
  return basis(f, {
    kind: "grant",
    scope: f.scope,
    action: f.action,
    synthetic: true,
    issuer: "A_TEST",
    actor: f.actor,
    login: "b8_actor",
    target: f.target,
    operation: "advance_one",
    envelope: id,
    evaluation: q.id,
    predecessor,
    temporal: f.candidate.temporal,
    rights: ["withdraw", "revoke"],
    ...extra,
  });
}
export async function authorize(
  f,
  id,
  q,
  g,
  prior = null,
  db = actor,
  p = undefined,
  request = uuid(),
) {
  return (await db`select ecb8.authorize(${f.scope}::uuid,${f.action}::uuid,${id}::uuid,${q.id}::uuid,${g}::uuid,${prior}::uuid,${
    p === undefined ? await head(f) : p
  }::uuid,${request}::uuid) x`)[0].x;
}
export async function control(f, op, subject, options = {}) {
  const db = options.db ?? actor,
    p = Object.hasOwn(options, "p") ? options.p : await head(f),
    request = options.request ?? uuid();
  return (await db`select ecb8.control(${f.scope}::uuid,${f.action}::uuid,${op},${subject}::uuid,${p}::uuid,${request}::uuid) x`)[
    0
  ].x;
}
export async function ready(f) {
  const id = await propose(f), q = await qualify(f, id);
  assert.equal(q.outcome, "PASS", JSON.stringify(q));
  const g = await grant(f, id, q), au = await authorize(f, id, q, g);
  return { id, q, g, au: au.event };
}
export async function started(f) {
  const r = await ready(f),
    ad = await control(f, "admit", r.au),
    st = await control(f, "start", ad.event);
  return { ...r, ad: ad.event, st: st.event };
}
export async function make() {
  const orientation = await b7.make("thermostat");
  const x = await b7.evaluate(orientation);
  assert.equal(x.result.outcome, "PASS");
  const obs = await b7.observe(orientation),
    g = await b7.grant(orientation, x),
    sel = await b7.select(orientation, x, null, g, obs);
  const f = {
    scope: orientation.scope,
    action: await b7.ref(),
    target: await b7.ref(),
    actor: await b7.ref(),
    orientation,
  };
  const principals = {
    b8_actor: f.actor,
    b8_other: await b7.ref(),
    b8_evaluator: await b7.ref(),
    b8_observer: await b7.ref(),
    postgres: await b7.ref(),
  };
  const orient = { key: x.id, evaluation: x.result.id, designation: sel.event };
  // Explicit independently supplied fixture contract. Never obtain expected
  // action semantics or expression meanings from the BUILD 8 checker.
  const required = {};
  const roles = {};
  const initialIds = [
    x.id,
    x.result.id,
    sel.event,
    g,
    obs,
    orientation.grammar,
    orientation.contract,
    ...orientation.snapshots,
  ];
  const gram = await doc(orientation.grammar);
  initialIds.push(...gram.interpretation_sources);
  const q7 = await doc(x.result.id);
  initialIds.push(q7.attempt);
  const des =
    await admin`select context_id from public.artifacts where id=${sel.event}::uuid`;
  initialIds.push(des[0].context_id);
  const dependencies = {};
  for (const id of [...new Set(initialIds)]) {
    const [r] =
      await admin`select artifact_role,encode(payload_digest,'hex') digest from public.artifacts where id=${id}::uuid`;
    roles[id] = r;
    required[id] = { role: r.artifact_role };
    dependencies[id] = "1";
  }
  required[orientation.snapshots[0]].access = "native";
  required[orientation.snapshots[1]].access = "external";
  const initial = {
    kind: "target_initial",
    scope: f.scope,
    action: f.action,
    synthetic: true,
    target: f.target,
    actor: f.actor,
    actor_login: "b8_actor",
    principals,
    dependencies,
  };
  f.initial =
    (await admin`select ecb8.fixture(${f.scope}::uuid,${f.action}::uuid,${
      admin.json(initial)
    },null) id`)[0].id;
  const [method] =
    await admin`select pg_get_functiondef('ecb8.examine(uuid,uuid)'::regprocedure) definition`;
  f.expression =
    `Advance target ${f.target} by one from value 0 at revision 0; at most one effect for action ${f.action}`;
  f.paraphrase =
    `For action ${f.action}, increment ${f.target} once from 0 at revision 0, using external discrimination.`;
  f.wrong = `Advance target ${f.target} twice for action ${f.action}`;
  const meaning = {
    target: f.target,
    action: f.action,
    from_value: 0,
    revision: 0,
    delta: 1,
    maximum: 1,
    access: "external",
  };
  f.ct = {
    kind: "contract",
    scope: f.scope,
    action: f.action,
    synthetic: true,
    target: f.target,
    actor: f.actor,
    initial: f.initial,
    orientation: orient,
    required,
    interpretations: {
      [f.expression]: meaning,
      [f.paraphrase]: meaning,
      [f.wrong]: { ...meaning, delta: 2 },
      "Comparator has no resolved interpretation": null,
      "The native sensor supplies the discrimination": {
        ...meaning,
        access: "native",
      },
      "Advance a different target by one": { ...meaning, target: uuid() },
    },
    method: createHash("sha256").update(method.definition).digest("hex"),
    method_definition: method.definition,
    limits:
      "Finite supplied meanings, synthetic external-discrimination contract; eligibility only; atomic-ledger target only; same-worker implementation and tests.",
  };
  f.contract = await basis(f, f.ct);
  // New contract is a named exact dependency, with its own source-specific token.
  await env(f, "dependency", { source: f.contract, revision: "1" });
  const [cr] =
    await admin`select encode(payload_digest,'hex') digest from public.artifacts where id=${f.contract}::uuid`;
  const manifest = Object.fromEntries(
    Object.entries(roles).map((
      [id, r],
    ) => [id, { role: r.artifact_role, digest: r.digest, revision: "1" }]),
  );
  manifest[f.contract] = { role: "b8_basis", digest: cr.digest, revision: "1" };
  f.candidate = {
    scope: f.scope,
    action: f.action,
    target: f.target,
    actor: f.actor,
    operation: "advance_one",
    from_value: 0,
    target_revision: 0,
    ready: true,
    delta: 1,
    max_effects: 1,
    orientation: orient,
    dependencies: manifest,
    method: f.ct.method,
    contract: f.contract,
    expression: f.expression,
    observation_access: "external",
    temporal: {
      issue: [10, 12],
      admit: [10, 20],
      effect_before: 30,
      unrevoked_through_effect: true,
    },
    retry: "observe_then_explicit_fence_before_fresh_admission",
  };
  return f;
}
