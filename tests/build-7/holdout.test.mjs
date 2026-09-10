// Authored after pre-holdout-freeze.json. Do not tune the implementation to this specimen.
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  admin,
  bind,
  close,
  copy,
  doc,
  evaluate,
  executor,
  fixture,
  grant,
  make,
  observe,
  producer,
  save,
  select,
  uuid,
} from "./support.mjs";
import { recover } from "../../server/build-7/recover.mjs";
after(close);
const root = new URL("../../", import.meta.url);
const freeze = JSON.parse(
  readFileSync(
    new URL(
      "docs/build-receipts/evidence/build-7/pre-holdout-freeze.json",
      root,
    ),
    "utf8",
  ),
);
function unchanged() {
  for (const [p, hash] of Object.entries(freeze.files)) {
    assert.equal(
      createHash("sha256").update(readFileSync(new URL(p, root))).digest("hex"),
      hash,
      `holdout implementation changed: ${p}`,
    );
  }
}
test("T12 untuned aliquot-detector: timing/source contrast, uneven Lines and changed-basis cold recovery", async () => {
  unchanged();
  const f = await make(), c = copy(f.candidate);
  const question = {
    question:
      "Which aliquot-detector observations distinguish the stipulated concentrations before the sixty-second decision boundary?",
    change:
      "retained trace establishes distinct native reports before sixty seconds",
    notice: "detector trace revision probe",
    reentry: "C2 requalification of native comparison",
    consequence:
      "permit the concentration distinction only if the bounded source trace supports it",
  };
  const grammar = copy(f.grammarData);
  const snapshots = [];
  for (let index = 0; index < 2; index++) {
    const old = f.snapshots[index], src = await doc(admin, old);
    src.source = `holdout://aliquot-detector/${index}`;
    src.version = "holdout-1";
    src.limits =
      "synthetic stipulated trace only; no instrument truth or act authorization";
    src.observations = index === 0 ? [11, 12] : [11, 11];
    src.latency = index === 0 ? 90 : 1;
    if (index === 0) {
      src.coordinates.find((x) =>
        x.dimension === "stage" && x.line === "sensing"
      ).value = "validated";
      src.coordinates.find((x) =>
        x.dimension === "stage" && x.line === "switching"
      ).value = "prototype";
      src.coordinates.find((x) => x.dimension === "type").value =
        "sampled_aliquot";
    }
    const id = await fixture("b7_snapshot", f.focal, src);
    snapshots.push(id);
    grammar.aliases[f.tokens[index]].snapshot = id;
    const m = c.mappings[index];
    m.snapshot = id;
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
    for (const coord of c.coordinates) {
      if (coord.snapshot === old) {
        coord.snapshot = id;
        const fact = src.coordinates.find((x) =>
          x.dimension === coord.dimension && x.line === coord.line &&
          x.subject === coord.subject
        );
        coord.value = fact.value;
      }
    }
  }
  c.snapshots = snapshots;
  c.grammar = await fixture("b7_grammar", f.focal, grammar);
  f.ct.question_forward = question;
  f.contract = await fixture("b7_contract", f.focal, f.ct);
  c.contract = f.contract;
  await admin`update ecb7.scopes set contract=${f.contract}::uuid where id=${f.scope}::uuid`;
  c.question_forward = question;
  Object.values(c.dispositions).forEach((x) => x.question_forward = question);
  c.expression =
    "The source-dependent distinction must arrive before the sixty-second decision boundary.";
  c.identity_basis =
    "one stipulated aliquot detector, distinct from the external reader and sample container";
  c.conclusions = [{ comparison: "native", answer: false }, {
    comparison: "external",
    answer: false,
  }];
  await bind(c);
  const good = await evaluate(f, c);
  assert.equal(good.result.outcome, "PASS");
  const defect = copy(c);
  defect.conclusions[0].answer = true;
  const bad = await evaluate(f, defect);
  assert.equal(bad.result.outcome, "FAIL");
  assert.equal(
    bad.result.findings.find((x) => x.obligation === "comparison").witness[0]
      .reason,
    "access_or_consequence_substitution",
  );
  const collapsed = copy(c);
  collapsed.coordinates.find((x) =>
    x.dimension === "stage" && x.line === "sensing"
  ).line = null;
  const wrong = await evaluate(f, collapsed);
  assert.equal(wrong.result.outcome, "FAIL");
  assert.equal(
    wrong.result.findings.find((x) => x.obligation === "coordinates").status,
    "FAIL",
  );
  const o = await observe(f, c), g = await grant(f, good);
  await select(f, good, null, g, o);
  const recovered = await recover(executor, f.scope, o);
  assert.equal(recovered.current_selection, good.id);
  assert.equal(recovered.expression.expression, c.expression);
  const changed = await observe(f, c, {
    dependencies: {
      ...c.dependencies,
      [snapshots[0]]: "new_native_latency_20_seconds",
    },
  });
  const drift = await recover(executor, f.scope, changed);
  assert.equal(drift.status, "requalification_required");
  assert.equal(drift.current_selection, good.id);
  assert.deepEqual(drift.reliance.constrained_comparisons, ["native"]);
  assert.deepEqual(drift.reliance.unaffected_comparisons, ["external"]);
  unchanged();
  save("holdout.json", {
    authored_after: freeze.frozen_at,
    independent_author: false,
    fixture:
      "aliquot detector with distinguishable but late native trace and nondiscriminating external trace",
    good,
    bad,
    coordinate_defect: wrong,
    recovered,
    drift,
    implementation_unchanged: true,
  });
});
