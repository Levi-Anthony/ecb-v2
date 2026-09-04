import {
  assertTracePass,
  type Candidate,
  type Comparison,
  evaluateQualification,
  type Fixture,
} from "./harness.ts";

const here = new URL("./", import.meta.url);
const traces = new URL("./traces/", here);

async function readJson<T>(name: string): Promise<T> {
  return JSON.parse(await Deno.readTextFile(new URL(name, here))) as T;
}

async function writeJson(name: string, value: unknown): Promise<void> {
  await Deno.writeTextFile(new URL(name, traces), `${JSON.stringify(value, null, 2)}\n`);
}

const fixture = await readJson<Fixture>("fixture.json");
const candidate = await readJson<Candidate>("independent-candidate.json");
const comparison = await readJson<Comparison>("completed-comparison.json");

const missing = evaluateQualification(fixture, candidate, null);
const completed = evaluateQualification(fixture, candidate, comparison);
const driftedComparison = structuredClone(comparison);
driftedComparison.canonical_prior_art.commit = "0000000000000000000000000000000000000000";
const drifted = evaluateQualification(fixture, candidate, driftedComparison);

for (const trace of [missing, completed, drifted]) assertTracePass(trace);

await Deno.mkdir(traces, { recursive: true });
await writeJson("missing-qualification.json", missing);
await writeJson("completed-qualification.json", completed);
await writeJson("drifted-qualification.json", drifted);
await writeJson("execution-summary.json", {
  fixture_id: fixture.fixture_id,
  recorded_at: fixture.recorded_at,
  result: "PASS",
  cases: {
    missing_qualification_encounter: missing.control.prior_art_qualification,
    completed_qualification_encounter: completed.control.prior_art_qualification,
    drifted_qualification_basis: drifted.control.prior_art_qualification,
  },
  freedom_preserved: [missing, completed, drifted].every((trace) =>
    trace.freedom.independent_derivation_preserved
  ),
  installation_seam_crossed: [missing, completed, drifted].some((trace) =>
    trace.control.installation_seam_crossed
  ),
  standing_conferred: [missing, completed, drifted].some((trace) =>
    Object.values(trace.standing).some(Boolean)
  ),
  build_2_opened: [missing, completed, drifted].some((trace) =>
    trace.identity.universal_referents_implemented
  ),
});

console.log(JSON.stringify({ fixture_id: fixture.fixture_id, result: "PASS" }));
