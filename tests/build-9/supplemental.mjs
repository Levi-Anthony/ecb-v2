import assert from "node:assert/strict";
import * as s from "./support.mjs";
const {
  admin,
  make,
  run,
  open,
  publish,
  returned,
  reenter,
  observe,
  inspect,
  fixture,
  uuid,
  source,
  save,
  close,
} = s;
const controls = [];
try {
  const f = await make();
  await open(f);
  const q = await publish(f);
  await returned(f, q.judgment);
  await reenter(f);
  for (const missing of ["payload", "history"]) {
    await admin.begin(async (db) => {
      await db`alter table public.artifacts disable trigger reject_build_5b_artifact_mutation`;
      if (missing === "payload") {
        await db`delete from public.artifacts where id=${f.versions.witnesses}::uuid`;
      } else {
        await db`update public.artifacts set context_id=${f.scope}::uuid where id=${q.event}::uuid`;
      }
      const card = (await db`select ecb9.inspect(${f.p}::uuid) x`)[0].x;
      assert.equal(card.present.disposition, "HOLD");
      controls.push({ id: "P13", control: "missing " + missing, card });
      throw Error("rollback-probe");
    }).catch((e) => assert.equal(e.message, "rollback-probe"));
  }
  // A valid successor requalifies the exact changed basis, rejects old result
  // reuse, and performs a new child and independent parent reentry.
  const v = await fixture(f, {
    kind: "applicability",
    subject: f.subjects.applicability,
    applicable: true,
    revision: "fresh independent remit",
  });
  await observe(f, "applicability", v);
  assert.equal((await reenter(f)).result.disposition, "REQUALIFY");
  const successor = {
    ...f.c,
    prior_version: f.p,
    prior_result_disposition:
      "retain as history; fresh inquiry and judgment required",
    dependencies: {
      ...f.dependencies,
      applicability: { ...f.dependencies.applicability, version: v },
    },
  };
  const p =
    (await admin`select ecb9.bind(${f.scope}::uuid,${
      admin.json(successor)
    }) id`)[0].id;
  const next = { p };
  await open(next);
  const nq = await publish(next);
  let error;
  try {
    await returned(next, q.judgment);
  } catch (e) {
    error = e.message;
  }
  assert.match(error, /binding/);
  await returned(next, nq.judgment);
  assert.equal((await reenter(next)).result.disposition, "CONTINUE");
  controls.push({
    id: "P08/P10",
    control: "explicit successor and fresh qualification after drift",
    prior: f.p,
    p,
    error,
    card: await inspect(next),
  });
  // Drift before child opening cannot be laundered into the opening baseline.
  const pre = await make();
  const pv = await fixture(pre, { ...pre.g, revision: "changed" });
  await observe(pre, "governance", pv);
  const denied = await open(pre);
  assert.equal(denied.opened, false);
  assert.equal(denied.route, "REQUALIFY");
  controls.push({ id: "P08", control: "pre-open basis drift", denied });
  const missing = await make();
  await observe(missing, "method", missing.versions.method, false);
  const no = await open(missing);
  assert.equal(no.route, "HOLD");
  controls.push({
    id: "P04/P05",
    control: "pre-open observation incomplete",
    no,
  });
  // Declared fixture observer cannot add an undeclared source and silently alter scope.
  let e;
  try {
    await observe(f, "undeclared", v);
  } catch (x) {
    e = x.message;
  }
  assert.match(e, /undeclared/);
  controls.push({ id: "P14", control: "undeclared writer source", error: e });
  console.log("supplemental PASS");
} catch (e) {
  process.exitCode = 1;
  controls.push({
    result: "FAIL",
    classification: "M/T pending diagnosis",
    error: e.message,
    stack: e.stack,
  });
  console.error(e);
} finally {
  save(process.argv[2] ?? "supplemental-results.json", {
    result: process.exitCode ? "FAIL" : "PASS",
    controls,
  });
  await close();
}
