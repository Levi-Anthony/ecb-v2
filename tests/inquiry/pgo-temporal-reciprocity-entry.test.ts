import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

// DOCUMENTARY REGRESSION ONLY. These checks cannot certify model interpretation,
// Level truth, native State, hosted semantic use or chat-client instruction uptake.
// They bind project-visible entry instructions to the already-earned contracts.
async function source(path: string): Promise<string> {
  return readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
}

const paths = {
  entry: 'AGENTS.md',
  discovery: 'docs/worker-entry-evidence-discovery.md',
  practice: 'docs/working-preferences-constructive-di.md',
  inquiry: 'docs/inquiry-orchestration.md',
  repair: 'research/formal-semantics/2026-10-11-PGO-Temporal-Reciprocal-Constitution-Repair.md',
  pgo: 'research/formal-semantics/PGO-Directed-Situated-Referent-Orchestration-Profile-v0.1.md',
  state: 'research/urg-kernel/State-Formal-Contract-v1.0.md',
  fullcore: 'research/urg-kernel/URG-Core-Register-B-Candidate-v1.0.md',
  frontier: 'research/formal-semantics/Situated-Referent-Discovery-Frontier.md',
  level: 'research/urg-kernel/Level-Quadrant-Formal-Contract-v1.0.md',
  quadrant: 'research/urg-kernel/Quadrant-Disclosure-Contract-v3.0.md',
};

test('ordinary worker entry recovers PGO before decomposition without source-only uptake claims', async () => {
  const [entry, discovery, practice] = await Promise.all([
    source(paths.entry), source(paths.discovery), source(paths.practice),
  ]);
  for (const text of [entry, discovery, practice]) {
    assert.match(text, /PGO/i);
    assert.match(text, /before (?:consequential |choosing )?(?:mapping|choosing|deriving|forming|decomposition|architect|claims)?/i);
    assert.match(text, /top-down/i);
    assert.match(text, /bottom-up/i);
    assert.match(text, /actual|State|occasion/i);
    assert.match(text, /intended mapper/i);
    assert.match(text, /proposed|hypothesized/i);
  }
  assert.match(entry, /not proof of cross-client projection uptake/i);
  assert.match(discovery, /actually load this file/i);
  assert.match(practice, /GÖDEL|Gödel|Gödel|smuggled-standing/i);
});

test('reciprocal functional–constituent D&I preserves temporal State and Level evidence', async () => {
  const [inquiry, repair, state, level, quadrant] = await Promise.all([
    source(paths.inquiry), source(paths.repair), source(paths.state), source(paths.level), source(paths.quadrant),
  ]);
  const basis = 'State(R,B,Ω,F,o)';
  assert.ok(state.includes(basis), 'State contract must retain explicit occurrence and basis');
  assert.match(state, /StateTransition/);
  assert.match(state, /ReviseBoundary/);
  assert.match(level, /W_L\s*=\s*\(C, O, d\)/);
  assert.match(level, /asymmetry/i);
  assert.match(quadrant, /Individual\/Relational/);
  assert.match(quadrant, /Left\/Right/);
  assert.match(inquiry, /State\(R,B,Ω,F,o\)=x/);
  assert.match(inquiry, /function/i);
  assert.match(inquiry, /constitut/i);
  assert.match(inquiry, /Neither direction can settle the other/);
  assert.match(repair, /realization\/allocation/i);
  assert.match(repair, /constitutive Level witness/i);
  assert.match(repair, /functional organization/i);
  assert.match(repair, /participatory relation of one referent may be constitutive/i);
});

test('the error-to-repair chain keeps speculative mapper standing and Boot HALT visible', async () => {
  const [repair, entry, practice] = await Promise.all([
    source(paths.repair), source(paths.entry), source(paths.practice),
  ]);
  assert.match(repair, /The assistant.s sentence/i);
  assert.match(repair, /which are constituents depends on the referent and its boundary/i);
  assert.match(repair, /actually participating/i);
  assert.match(repair, /smuggled standing/i);
  assert.match(repair, /PROPOSED\/HYPOTHESIZED/i);
  assert.match(repair, /Question Forward/);
  assert.match(repair, /The original Boot System Shape\/v4 installation remains HALTed/i);
  assert.match(entry, /HALTed/);
  assert.match(practice, /The original Boot System Shape\/v4 installation remains HALTed/i);
  assert.match(repair, /not.*actual.*ChatGPT\/Claude.*consumer uptake/i);
});


test('ordinary inquiry profile cannot present retired Quadrant seat/burden generator as current instruction', async () => {
  const [profile, v3, repair] = await Promise.all([
    source(paths.pgo), source(paths.quadrant), source(paths.repair),
  ]);
  assert.match(profile, /O3 — Traverse Quadrant at fixed R\/B — corrected current reading/);
  const current = profile.split('### O3 — Traverse Quadrant at fixed R/B — corrected current reading')[1]
    .split('**HISTORICAL 6 OCTOBER TEXT')[0];
  for (const assertion of ['UL** — Individual × Left', 'UR** — Individual × Right',
    'LL** — Relational × Left', 'LR** — Relational × Right']) {
    assert.ok(current.includes(assertion), 'Current O3 missing '+assertion);
  }
  assert.match(current, /provisional candidate set/i);
  assert.doesNotMatch(current, /UL = Constitutive x Governing/);
  const legacy = profile.split('**HISTORICAL 6 OCTOBER TEXT')[1];
  assert.match(legacy, /UL = Constitutive x Governing/);
  assert.match(profile, /## 7. Quadrant-generator disposition — current versus superseded/);
  const disposition = profile.split('## 7. Quadrant-generator disposition — current versus superseded')[1]
    .split('**HISTORICAL POSITION')[0];
  assert.match(disposition, /Individual\/Relational × Left\/Right/);
  assert.match(disposition, /retired/);
  assert.match(disposition, /provisional candidates/i);
  assert.match(v3, /Individual\/Relational/);
  assert.match(repair, /Neither direction alone can settle/);
  assert.match(profile, /PGO-adequacy addition/);
  assert.match(profile, /simultaneously|reciprocally/i);
});


test('inherited State/full-core/frontier examples disclose supersession locally, preserving their historical source', async () => {
  const [state, fullcore, frontier] = await Promise.all([
    source(paths.state), source(paths.fullcore), source(paths.frontier),
  ]);
  // The underlying State v1 contract is still the source of State semantics;
  // only its older Quadrant labels are retired.
  assert.match(state.slice(0,1250), /CROSS-CONTRACT CURRENTNESS/i);
  const stateSection=state.split('### State × Quadrant')[1]?.split('### State × Level')[0]??'';
  assert.match(stateSection, /CURRENT V3-QUALIFIED READING/);
  assert.ok(stateSection.indexOf('CURRENT V3-QUALIFIED READING') < stateSection.indexOf('C+D'));
  assert.match(stateSection, /historical reference only/i);
  assert.match(stateSection, /A determinate constitutive configuration question is C\+D/);
  assert.match(stateSection, /A determinate participatory relation question is P\+D/);
  assert.match(state, /State\(R,B,Ω,F,o\) = x/);

  const coreSection=fullcore.split('### Quadrant')[1]?.split('### Direction')[0]??'';
  assert.match(coreSection, /CURRENT CROSS-EDITION OVERRIDE/);
  assert.match(coreSection, /Individual\/Relational × Left\/Right/);
  assert.ok(coreSection.indexOf('CURRENT CROSS-EDITION OVERRIDE') < coreSection.indexOf('Q_B(R)='));
  assert.match(coreSection, /retired/i);
  assert.match(coreSection, /one provisional candidate set among several/i);
  assert.match(coreSection, /Q_B\(R\)=\{Constitutive,Participatory\}×\{Governing,Determinate\}/);

  const compareSection=frontier.split('**CURRENTNESS OF THIS DATED COMPARISON')[1]
    ?.split('## 3. Reciprocal bootstrap')[0]??'';
  assert.match(compareSection, /superseded/);
  assert.match(compareSection, /Individual\/Relational × Left\/Right/);
  assert.match(compareSection, /ECO-221's current contract/);
  assert.ok(compareSection.indexOf('superseded') < compareSection.indexOf("ECO-221's current contract"));
});
