import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  close,
  copy,
  evaluate,
  executor,
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
const results = [];
after(() => save("expression-repair.json", results));
test("C2 original contradictory short expression fails despite correct typed conclusions", async () => {
  const original = JSON.parse(
    readFileSync(
      new URL(
        "../../docs/build-receipts/evidence/build-7/expression-defect-discovery.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const f = await make(), bad = copy(f.candidate);
  bad.expression = original.actual.result.basis.expression;
  const x = await evaluate(f, bad);
  assert.equal(x.result.outcome, "FAIL");
  const finding = x.result.findings.find((v) => v.obligation === "comparison");
  assert.equal(
    finding.witness[0].reason,
    "expression_consequence_substitution",
  );
  const o = await observe(f), g = await grant(f, x);
  await assert.rejects(select(f, x, null, g, o), /qualification_not_pass/);
  assert.equal((await recover(executor, f.scope, o)).status, "no_designation");
  results.push({ case: "original retained defect", result: x });
});
test("C2 human expression cannot promote inferred access or collective agreement", async () => {
  const f = await make("human");
  const c = copy(f.candidate);
  c.expression =
    "The mapper’s inference is the participant’s direct report and establishes collective agreement.";
  const x = await evaluate(f, c);
  assert.equal(x.result.outcome, "FAIL");
  assert.equal(
    x.result.findings.find((v) => v.obligation === "comparison").witness[1]
      .reason,
    "expression_consequence_substitution",
  );
  results.push({ case: "human expression collapse", result: x });
});
test("C2 unsupported wording cannot substitute self-declared meaning; valid paraphrase passes", async () => {
  const f = await make(), c = copy(f.candidate);
  c.expression =
    "A new expression whose meaning the declared method has not established.";
  c.expression_interpretations = {
    [c.expression]: { native: false, measurement: true },
  };
  const x = await evaluate(f, c);
  assert.equal(x.result.outcome, "INCOMPLETE");
  assert.equal(
    x.result.findings.find((v) => v.obligation === "comparison").witness[0]
      .reason,
    "expression_interpretation_unavailable",
  );
  await assert.rejects(
    producer`insert into public.artifacts(id,artifact_role,context_id,payload_text) values(${uuid()}::uuid,'b7_contract',${f.focal}::uuid,'{"synthetic":true}')`,
    /protected_build7_role/,
  );
  c.expression =
    "Only the external observation distinguishes the stipulated cases; the native observation does not.";
  const valid = await evaluate(f, c);
  assert.equal(valid.result.outcome, "PASS");
  results.push({
    case: "unknown versus declared equivalent wording",
    unknown: x,
    valid,
  });
});
