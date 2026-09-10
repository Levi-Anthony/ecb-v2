// New fixture authored after post-repair-freeze.json. Not the earlier aliquot holdout.
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
      "docs/build-receipts/evidence/build-7/post-repair-freeze.json",
      root,
    ),
    "utf8",
  ),
);
function unchanged() {
  for (const [path, hash] of Object.entries(freeze.files)) {
    assert.equal(
      createHash("sha256").update(readFileSync(new URL(path, root))).digest(
        "hex",
      ),
      hash,
      path,
    );
  }
}
test("New T12: another participant’s report, affirmative group convention, uneven Lines and expression-only lie", async () => {
  unchanged();
  const f = await make("human"), c = copy(f.candidate), g = copy(f.grammarData);
  const correct =
    "The retained report belongs to the other participant; the group’s separately recorded signals satisfy its convention.";
  const defective =
    "The retained report is the focal participant’s own report; the group’s separately recorded signals satisfy its convention.";
  const q = {
    question:
      "Whose attributed report and which explicit participant signals distinguish an individual preference from agreement under this group’s convention?",
    change: "an attributed transcript or explicit consent signal changes",
    notice: "retained transcript and group-signal revision observation",
    reentry:
      "C2 re-examines only the affected attribution or agreement comparison",
    consequence:
      "change the permitted attribution or agreement conclusion without inferring anyone’s experience",
  };
  for (let index = 0; index < f.snapshots.length; index++) {
    const source = await doc(admin, f.snapshots[index]);
    source.source = `holdout://joint-review-session/${index}`;
    source.version = "unseen-relational-1";
    source.limits =
      "synthetic statements and stipulated convention only; access does not confer standing or authority";
    if (index === 0) {
      source.speaker = f.mapper;
      source.report = "Continue";
      for (const x of source.coordinates) {
        if (x.line === "sensing") x.line = "comprehension";
        if (x.line === "switching") x.line = "consent";
        if (x.dimension === "stage") {
          x.value = x.line === "comprehension" ? "practiced" : "initial";
        }
      }
    }
    if (index === 1) {
      source.report = "Continue";
      source.speaker = f.focal;
    }
    if (index === 2) source.signals = [...source.participants];
    const replacement = await fixture("b7_snapshot", f.focal, source);
    c.snapshots[index] = replacement;
    g.aliases[f.tokens[index]].snapshot = replacement;
    const m = c.mappings[index];
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
    if (index === 0) {
      c.coordinates = source.coordinates.map((x) => ({
        ...x,
        snapshot: replacement,
      }));
    }
  }
  c.grammar = await fixture("b7_grammar", f.focal, g);
  f.ct.question_forward = q;
  for (const cmp of f.ct.comparisons) {
    if (cmp.kind === "reported_preference") cmp.preference = "Continue";
  }
  f.ct.expression_interpretations = {
    [correct]: { testimony: false, inference: false, convention: true },
    [defective]: { testimony: true, inference: false, convention: true },
  };
  f.contract = await fixture("b7_contract", f.focal, f.ct);
  c.contract = f.contract;
  await admin`update ecb7.scopes set contract=${f.contract}::uuid where id=${f.scope}::uuid`;
  c.expression = correct;
  c.conclusions = [{ comparison: "report", answer: false }, {
    comparison: "inferred",
    answer: false,
  }, { comparison: "agreement", answer: true }];
  c.question_forward = q;
  for (const d of Object.values(c.dispositions)) d.question_forward = q;
  await bind(c);
  const valid = await evaluate(f, c);
  assert.equal(valid.result.outcome, "PASS");
  const lie = copy(c);
  lie.expression = defective;
  const falseExpression = await evaluate(f, lie);
  assert.equal(falseExpression.result.outcome, "FAIL");
  assert.equal(
    falseExpression.result.findings.find((x) => x.obligation === "comparison")
      .witness[0].reason,
    "expression_consequence_substitution",
  );
  const collapse = copy(c);
  collapse.coordinates.find((x) => x.dimension === "stage").line = null;
  const falseCoordinate = await evaluate(f, collapse);
  assert.equal(falseCoordinate.result.outcome, "FAIL");
  assert.equal(
    falseCoordinate.result.findings.find((x) => x.obligation === "coordinates")
      .status,
    "FAIL",
  );
  const o = await observe(f, c), grantId = await grant(f, valid);
  await select(f, valid, null, grantId, o);
  const recovered = await recover(executor, f.scope, o);
  assert.equal(recovered.status, "recovered");
  assert.equal(recovered.current_selection, valid.id);
  assert.equal(recovered.expression.expression, correct);
  const driftObservation = await observe(f, c, {
    dependencies: {
      ...c.dependencies,
      [c.snapshots[2]]: "changed_group_signal_revision",
    },
  });
  const drift = await recover(executor, f.scope, driftObservation);
  assert.equal(drift.status, "requalification_required");
  assert.equal(drift.current_selection, valid.id);
  assert.deepEqual(drift.reliance.constrained_comparisons, ["agreement"]);
  assert.deepEqual(drift.reliance.unaffected_comparisons, [
    "report",
    "inferred",
  ]);
  unchanged();
  save("holdout-post-repair.json", {
    authored_after: freeze.frozen_at,
    fixture: "another participant report and unanimous group convention",
    independent_author: false,
    implementation_unchanged: true,
    valid,
    falseExpression,
    falseCoordinate,
    recovered,
    drift,
  });
});
