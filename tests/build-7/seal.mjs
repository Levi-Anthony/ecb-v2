// Read-only audit of this disposable proof; never repairs or designates state.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { admin, close, evidenceDir, method, save } from "./support.mjs";
const read = (name) =>
  JSON.parse(readFileSync(new URL(name, evidenceDir), "utf8"));
try {
  const freeze = read("post-repair-freeze.json");
  const hashes = {};
  for (const [path, expected] of Object.entries(freeze.files)) {
    hashes[path] = createHash("sha256").update(readFileSync(path)).digest(
      "hex",
    );
    assert.equal(hashes[path], expected, `frozen implementation: ${path}`);
  }
  const cases = read("primary-findings.json");
  const outcomes = {};
  for (const c of cases) outcomes[c.outcome] = (outcomes[c.outcome] ?? 0) + 1;
  const holdout = read("holdout-post-repair.json");
  assert.equal(holdout.implementation_unchanged, true);
  const [audit] = await admin`select
    (select count(*)::int from ecb7.scopes where synthetic) synthetic_scopes,
    (select count(*)::int from ecb7.scopes where not synthetic) nonsynthetic_scopes,
    (select count(*)::int from public.artifacts where artifact_role='b7_grant' and (payload_text::jsonb->>'synthetic') is distinct from 'true') nonsynthetic_grants,
    (select count(*)::int from ecb_governance.transitions) build6_transitions,
    (select count(*)::int from public.artifacts where artifact_role='b7_designation') synthetic_designations,
    (select count(*)::int from public.artifacts a left join public.referents r on r.id=a.id where r.id is null) missing_artifact_referents,
    (select count(*)::int from public.claims c left join public.referents r on r.id=c.id where r.id is null) missing_claim_referents,
    (select count(*)::int from public.claims where epistemic_standing<>'unassessed' and id<>'0f89e778-b16e-4840-9129-a2aa3eb6f697') new_standing_promotions`;
  for (
    const k of [
      "nonsynthetic_scopes",
      "nonsynthetic_grants",
      "build6_transitions",
      "missing_artifact_referents",
      "missing_claim_referents",
      "new_standing_promotions",
    ]
  ) assert.equal(audit[k], 0, k);
  const published =
    await admin`select payload_text::jsonb->>'method' method, payload_text::jsonb->>'outcome' outcome,count(*)::int count from public.artifacts where artifact_role='b7_evaluation' group by 1,2 order by 1,2`;
  save("summary.json", {
    sealed_at: new Date().toISOString(),
    acceptance:
      "repaired C2; post-repair checks only restore the bounded claim",
    current_method: method,
    freeze_verified: hashes,
    primary_groups: 19,
    primary_asserted_semantic_cases: cases.length,
    primary_asserted_outcomes: outcomes,
    expression_repair_groups: 3,
    expression_repair_outcomes: { PASS: 1, FAIL: 2, INCOMPLETE: 1 },
    new_untuned_holdout_groups: 1,
    new_untuned_holdout_outcomes: { PASS: 1, FAIL: 2 },
    independent_holdout_author: false,
    authority_negative_cases: 12,
    inherited_behavioral_checks: {
      count: 10,
      disposition:
        "previous clean rehearsal retained; unchanged SQL/recovery; not rerun for C2-only repair",
    },
    historical_acceptance:
      "Pre-repair acceptance suspended after original false PASS; original defect and first holdout retained as historical evidence, not current qualification.",
    published_evaluations_by_method: published,
    audit,
    canonical_effects: "NONE",
    status: "READY FOR HUMAN METABOLIZE",
  });
  console.log(
    JSON.stringify({ method, outcomes, audit, freeze: "unchanged" }, null, 2),
  );
} finally {
  await close();
}
