import {
  assertTracePass,
  type Candidate,
  type Comparison,
  evaluateQualification,
  type Fixture,
} from "./harness.ts";

const here = new URL("./", import.meta.url);

async function readJson<T>(name: string): Promise<T> {
  return JSON.parse(await Deno.readTextFile(new URL(name, here))) as T;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const fixture = await readJson<Fixture>("fixture.json");
const candidate = await readJson<Candidate>("independent-candidate.json");
const comparison = await readJson<Comparison>("completed-comparison.json");

Deno.test("missing encounter preserves derivation and leaves qualification unfinished", () => {
  const trace = evaluateQualification(fixture, candidate, null);
  assertTracePass(trace);
  assert(trace.case === "missing_qualification_encounter", "wrong_case");
  assert(
    trace.awareness.detected_condition === "required_encounter_omitted",
    "omission_not_detected",
  );
  assert(trace.comparison === null, "missing_case_has_comparison");
});

Deno.test("pinned comparison completes only the fixture qualification requirement", () => {
  const trace = evaluateQualification(fixture, candidate, comparison);
  assertTracePass(trace);
  assert(trace.case === "completed_qualification_encounter", "wrong_case");
  assert(
    trace.comparison?.canonical_commit === fixture.required_prior_art.commit,
    "wrong_prior_art_pin",
  );
  assert((trace.comparison?.independently_derived_count ?? 0) > 0, "independent_results_missing");
  assert((trace.comparison?.already_present_count ?? 0) > 0, "prior_art_results_missing");
  assert((trace.comparison?.conflict_or_difference_count ?? 0) > 0, "differences_missing");
  assert(Object.values(trace.standing).every((value) => value === false), "standing_conferred");
});

Deno.test("prior-art pin drift routes through Awareness and Control", () => {
  const drifted = structuredClone(comparison);
  drifted.canonical_prior_art.commit = "0000000000000000000000000000000000000000";
  const trace = evaluateQualification(fixture, candidate, drifted);
  assertTracePass(trace);
  assert(trace.case === "drifted_qualification_basis", "drift_not_classified");
  assert(trace.awareness.detected_condition === "qualification_basis_drift", "drift_not_detected");
});

Deno.test("candidate must remain independent and non-authoritative", () => {
  const contaminated = structuredClone(candidate);
  contaminated.prior_art_seen = true;
  let error = "";
  try {
    evaluateQualification(fixture, contaminated, null);
  } catch (caught) {
    error = String(caught);
  }
  assert(error.includes("independent_derivation_boundary_violated"), "contamination_was_accepted");
});

Deno.test("durable UUID implies addressability without opening Universal Referents", () => {
  const trace = evaluateQualification(fixture, candidate, comparison);
  assert(
    trace.identity.durable_uuid_implies_stable_referential_addressability,
    "addressability_missing",
  );
  assert(!trace.identity.universal_referents_implemented, "universal_referents_opened");
});
