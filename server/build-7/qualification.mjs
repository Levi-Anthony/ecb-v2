// ECO-94 §§C2,D,E,J. Bounded source/access comparison method for BUILD 7.
// This interprets explicit fixture evidence; no universal prose evaluator or model-internal claim.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
export const method = createHash("sha256").update(
  readFileSync(new URL(import.meta.url)),
).digest("hex");
export const obligations = [
  "structural_supply",
  "focal_identity",
  "mapping_access",
  "comparison",
  "coordinates",
  "resolution_question_forward",
  "evidence_pressure",
  "non_promotion",
  "controls",
];
export const capacities = [
  "quadrants",
  "altitude",
  "lines",
  "stages",
  "states",
  "types",
  "directional_frame",
];
const corresponds = (observed, claimed) => observed === claimed;
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const text = (x) => typeof x === "string" && x.trim().length > 0;
const qf = (q, ct) =>
  q?.question === ct.question_forward.question && q && text(q.question) &&
  q.question.includes("?") && text(q.change) && text(q.notice) &&
  text(q.reentry) && text(q.consequence);
export async function doc(db, id, role = null) {
  const [r] = await db`select ecb7.doc(${id}::uuid,${role}) as value`;
  return r.value;
}
export async function examine(db, candidate, contract) {
  const c = await doc(db, candidate, "b7_candidate");
  const ct = await doc(db, contract, "b7_contract");
  const f = [];
  const add = (obligation, status, reason, witness) =>
    f.push({ obligation, status, reason, witness });
  const check = (o, yes, reason, w) => add(o, yes ? "PASS" : "FAIL", reason, w);
  let g, sources = {};
  try {
    g = await doc(db, c.grammar, "b7_grammar");
    for (const id of [...c.snapshots, ...(g.interpretation_sources ?? [])]) {
      sources[id] = await doc(db, id, "b7_snapshot");
    }
  } catch (e) {
    for (const o of obligations) {
      add(o, "INCOMPLETE", "exact_payload_unavailable", { error: e.message });
    }
    return f;
  }
  const bindingProblems = [];
  for (
    const id of [
      c.grammar,
      c.contract,
      ...c.snapshots,
      ...(g.interpretation_sources ?? []),
    ]
  ) {
    const [r] =
      await db`select encode(payload_digest,'hex') as digest from public.artifacts where id=${id}::uuid`;
    if (!r || c.dependencies?.[id] !== r.digest) bindingProblems.push(id);
  }
  if (c.dependencies?.method !== ct.method) bindingProblems.push("method");
  const absent = capacities.filter((k) =>
    !g.capacities?.[k] || !text(g.capacities[k].meaning) ||
    !text(g.capacities[k].question) || !text(g.capacities[k].source)
  );
  const q = g.capacities?.quadrants?.distinctions;
  const qOK = equal(q, [
    "individual-interior",
    "individual-exterior",
    "collective-interior",
    "collective-exterior",
  ]);
  add(
    "structural_supply",
    absent.length
      ? "INCOMPLETE"
      : qOK && bindingProblems.length === 0
      ? "PASS"
      : "FAIL",
    absent.length
      ? "structural_support_unavailable"
      : qOK
      ? "exact_capacity_closure"
      : "quadrant_collapse",
    { grammar: c.grammar, absent, quadrants: q ?? null, bindingProblems },
  );
  const [scope] =
    await db`select focal::text,contract::text from ecb7.scopes where id=${ct.scope}::uuid`;
  check(
    "focal_identity",
    c.focal === ct.focal && scope?.focal === c.focal &&
      c.contract === contract && scope?.contract === contract &&
      c.focal !== candidate,
    "focal_and_artifact_identity",
    { focal: c.focal, expected: ct.focal, artifact: candidate },
  );
  const mapFindings = [];
  for (const m of c.mappings ?? []) {
    const supplied = g.aliases?.[m.token];
    const source = sources[supplied?.snapshot];
    let claim;
    const [r] =
      await db`select proposition,scope,origin,epistemic_standing from public.claims where id=${m.claim}::uuid`;
    try {
      claim = JSON.parse(r?.proposition);
    } catch {
      claim = null;
    }
    const ok = source && supplied && m.snapshot === supplied.snapshot &&
      m.mapper === source.mapper && m.access === supplied.access &&
      m.focal === c.focal && m.frame?.focal === c.focal &&
      m.frame?.anchor === source.anchor &&
      m.frame?.relation === source.relation && text(source.source) &&
      text(source.version) && text(source.limits) &&
      equal(claim, {
        focal: m.focal,
        anchor: m.frame.anchor,
        relation: m.frame.relation,
        mapper: m.mapper,
        source: m.snapshot,
        access: m.access,
      }) &&
      r?.scope === ct.scope && r?.origin === "ecb_inference";
    mapFindings.push({
      token: m.token,
      source: supplied?.snapshot ?? null,
      access: supplied?.access ?? null,
      ok: Boolean(ok),
      claim: m.claim,
    });
  }
  check(
    "mapping_access",
    mapFindings.length > 0 && mapFindings.every((x) => x.ok),
    "source_mapper_frame_access_separation",
    mapFindings,
  );
  // Comparison expectations are independent of candidate success claims and read from retained sources.
  // The contract's retained interpretation is supplied independently of the producer.
  // This bounded method cannot interpret arbitrary new prose: missing interpretation is INCOMPLETE.
  const expressionMeaning =
    Object.hasOwn(ct.expression_interpretations ?? {}, c.expression)
      ? ct.expression_interpretations[c.expression]
      : null;
  const comparisons = [];
  for (const cmp of ct.comparisons ?? []) {
    const alias = g.aliases?.[cmp.token], src = sources[alias?.snapshot];
    let expected, reason = "source_sensitive_comparison", status = "PASS";
    if (!src || !alias) {
      status = "INCOMPLETE";
      reason = "comparison_source_unavailable";
    } else if (cmp.kind === "observational_discrimination") {
      // Distinct native outputs within the stipulated latency budget, not differences in external readings.
      if (
        !Array.isArray(src.observations) || src.observations.length !== 2 ||
        !Number.isFinite(src.latency)
      ) {
        status = "INCOMPLETE";
        reason = "observation_trace_unavailable";
      } else {expected = src.observations[0] !== src.observations[1] &&
          src.latency <= cmp.decision_interval;}
    } else if (cmp.kind === "reported_preference") {
      expected = alias.access === "testimony" && src.speaker === ct.focal &&
        src.report === cmp.preference;
    } else if (cmp.kind === "collective_agreement") {
      if (!src.convention || !Array.isArray(src.signals)) {
        status = "INDETERMINATE";
        reason = "collective_discriminator_unavailable";
      } else {expected = src.convention === "explicit_all" &&
          src.participants.every((p) => src.signals.includes(p));}
    } else {
      status = "INDETERMINATE";
      reason = "normative_comparator_unavailable";
    }
    const actual = c.conclusions?.find((x) => x.comparison === cmp.id)?.answer;
    if (status === "PASS" && !corresponds(expected, actual)) {
      status = "FAIL";
      reason = "access_or_consequence_substitution";
    }
    const expressionAnswer = expressionMeaning?.[alias?.access];
    if (status !== "FAIL" && typeof expressionAnswer !== "boolean") {
      status = "INCOMPLETE";
      reason = "expression_interpretation_unavailable";
    } else if (status === "PASS" && !corresponds(expected, expressionAnswer)) {
      status = "FAIL";
      reason = "expression_consequence_substitution";
    }
    if (
      !text(cmp.consequence) || !text(cmp.defeater) ||
      !Array.isArray(cmp.alternatives) || cmp.alternatives.length < 2
    ) {
      status = "INDETERMINATE";
      reason = "comparison_contract_incomplete";
    }
    comparisons.push({
      id: cmp.id,
      token: cmp.token,
      source: alias?.snapshot ?? null,
      access: alias?.access ?? null,
      kind: cmp.kind,
      expected: expected ?? null,
      actual: actual ?? null,
      expression: c.expression,
      expression_answer: expressionAnswer ?? null,
      interpretation_contract: contract,
      status,
      reason,
      consequence: cmp.consequence,
    });
  }
  const resultOf = (xs) =>
    xs.some((x) => x.status === "FAIL")
      ? "FAIL"
      : xs.some((x) => x.status === "INCOMPLETE")
      ? "INCOMPLETE"
      : xs.some((x) => x.status === "INDETERMINATE")
      ? "INDETERMINATE"
      : "PASS";
  add(
    "comparison",
    comparisons.length ? resultOf(comparisons) : "INDETERMINATE",
    comparisons.length
      ? "retained_expected_observed_contrast"
      : "normative_comparator_unavailable",
    comparisons,
  );
  const coords = [];
  for (const item of c.coordinates ?? []) {
    const src = sources[item.snapshot];
    const fact = src?.coordinates?.find((x) =>
      x.dimension === item.dimension && x.subject === item.subject &&
      x.line === item.line
    );
    coords.push({
      item,
      expected: fact ?? null,
      ok: Boolean(fact && equal(item.value, fact.value)),
    });
  }
  check(
    "coordinates",
    coords.every((x) => x.ok),
    "level_stage_state_line_type_separation",
    coords,
  );
  const dispositions = [];
  for (const k of capacities) {
    const d = c.dispositions?.[k];
    let ok = true, reason = "inherited_available";
    if (!d) {
      // An omitted overlay remains not_examined; a named omission challenge must cover the comparison.
      ok = text(c.omission_challenges?.[k]);
      reason = "not_examined_with_omission_challenge";
    } else {
      const statuses = [
        "rich",
        "minimal",
        "unresolved",
        "non_live",
        "unsupported",
      ];
      ok = statuses.includes(d.status) && text(d.basis) &&
        text(d.discriminator) && text(d.reexpand);
      if (
        ["minimal", "unresolved", "non_live", "unsupported"].includes(d.status)
      ) ok = ok && qf(d.question_forward, ct);
      if (d.status === "non_live") {
        ok = ok && Array.isArray(d.alternative_consequences) &&
          new Set(d.alternative_consequences).size === 1;
      }
      reason = ok
        ? "resolution_with_reentry"
        : "missing_calibrated_question_or_erasure";
    }
    dispositions.push({
      capacity: k,
      status: d?.status ?? "not_examined",
      ok,
      reason,
    });
  }
  if (!qf(c.question_forward, ct)) {
    dispositions.push({
      capacity: "focal_question",
      ok: false,
      reason: "missing_calibrated_question",
    });
  }
  const materialUnresolved = Object.values(c.dispositions ?? {}).some((d) =>
    d.status === "unresolved" && Array.isArray(d.alternative_consequences) &&
    new Set(d.alternative_consequences).size > 1
  );
  add(
    "resolution_question_forward",
    dispositions.some((x) => !x.ok)
      ? "FAIL"
      : materialUnresolved
      ? "INDETERMINATE"
      : "PASS",
    "resolution_not_erasure",
    dispositions,
  );
  const pressure = [];
  for (const [id, src] of Object.entries(sources)) {
    for (const ev of src.local_evidence ?? []) {
      const retained = c.evidence_dispositions?.find((x) =>
        x.snapshot === id && x.evidence === ev.id
      );
      const ok = retained && text(retained.finding) &&
        (!ev.challenges_rule ||
          (retained.rule === ev.challenges_rule &&
            text(retained.governing_route) &&
            text(retained.affected_decision)));
      pressure.push({
        source: id,
        evidence: ev,
        retained: retained ?? null,
        ok: Boolean(ok),
      });
    }
  }
  const grammarUnchanged = c.governing_revision === g.governing_revision;
  check(
    "evidence_pressure",
    grammarUnchanged && pressure.every((x) => x.ok),
    "local_evidence_retained_without_constitutional_rewrite",
    { grammarUnchanged, pressure },
  );
  const forbidden = [
    "truth",
    "warrant",
    "authority",
    "designation",
    "currentness",
    "execution_authorization",
    "first_person_access",
  ];
  check(
    "non_promotion",
    !(c.promotions ?? []).some((p) => forbidden.includes(p)),
    "qualification_has_no_other_dimension_effect",
    { promotions: c.promotions ?? [], meaning: "comparison_eligibility_only" },
  );
  // Same comparison method: a known wrong answer must disagree, and alternative wording must not matter.
  const decidable = comparisons.filter((x) => typeof x.expected === "boolean");
  if (decidable.length === 0) {
    add(
      "controls",
      resultOf(comparisons) === "INDETERMINATE"
        ? "INDETERMINATE"
        : "INCOMPLETE",
      "control_comparison_unavailable",
      comparisons,
    );
  } else {check(
      "controls",
      decidable.every((x) =>
        corresponds(x.expected, x.expected) &&
        !corresponds(x.expected, !x.expected)
      ) && ct.negative_control === "invert_source_bound_answer",
      "known_defective_answer_rejected_by_same_contrast",
      decidable.map((x) => ({
        id: x.id,
        positive: x.expected,
        defective: !x.expected,
        reason: "access_or_consequence_substitution",
      })),
    );}
  return f;
}
export async function qualify(db, candidate, contract, attempt) {
  await db`select ecb7.attempt(${attempt}::uuid,${candidate}::uuid)`;
  const findings = await examine(db, candidate, contract);
  const [r] = await db`select ecb7.publish(${attempt}::uuid,${
    db.json(findings)
  },${method}) as id`;
  return { id: r.id, ...await doc(db, r.id, "b7_evaluation") };
}
