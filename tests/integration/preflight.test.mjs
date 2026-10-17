import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateIndex, affectedAreas, inspectOpenPRConflicts, report } from '../../scripts/integration/preflight.mjs';
const map = JSON.parse(readFileSync(new URL('../../integration/capability-map.v0.1.json',import.meta.url),'utf8'));
const clone = () => structuredClone(map);

test('current projection resolves source pointers and full PGO discrimination', () => {
  assert.deepEqual(validateIndex(map),[]);
  assert.ok(map.pgo.definition_of_done.some(v=>v.includes('Principal')));
  assert.ok(map.pgo.discrimination.hinders.some(v=>v.includes('PR #109')));
});
test('PGO dilution fails when method, examples and terminal end state are erased', () => {
  const weak=clone();
  weak.pgo.intended_end_state = '';
  weak.pgo.definition_of_done = [];
  delete weak.pgo.discrimination.method;
  weak.pgo.discrimination.helps=[];
  weak.pgo.discrimination.hinders=[];
  const result=validateIndex(weak).join('\n');
  for(const name of ['intended_end_state','definition_of_done','discrimination.method','discrimination.helps','discrimination.hinders']) assert.ok(result.includes(name), name);
});
test('untraceable adapter and duplicate capability fail structural check', () => {
  const bad=clone();
  bad.capabilities[0].physical_adapter.source = 'not/an/existing/adapter.ts';
  bad.capabilities.push(structuredClone(bad.capabilities[0]));
  const err=validateIndex(bad).join('\n');
  assert.match(err,/unresolved repository source/);
  assert.match(err,/duplicate ID/);
});
test('PR change families distinguish overlapping human identity and Edge commission work', () => {
  assert.deepEqual(affectedAreas(['server/personal-workspace.ts','api/app.ts','server/oauth-consent.ts']),['human-door-identity']);
  assert.deepEqual(affectedAreas(['server/open-brain-mcp/current-commission.ts']),['commission-delivery']);
  assert.deepEqual(affectedAreas(['server/workflow-governance.ts','research/formal-semantics/foo.md']),['native-work','semantic-contract']);
});
test('no live credentials gives UNVERIFIED, never a false clean result', async () => {
  const result=await inspectOpenPRConflicts(undefined,undefined,undefined);
  assert.equal(result.state,'UNVERIFIED');
  assert.match(report(map,[],result),/Live PR overlap scan: UNVERIFIED/);
});

test('semantic contract cannot be replaced by the list of missing tests or a generic adapter pointer', () => {
  const wrong=clone();
  wrong.capabilities[0].semantic_contract.meaning=wrong.capabilities[0].acceptance.missing;
  delete wrong.capabilities[1].physical_adapter.description;
  const problems=validateIndex(wrong).join('\n');
  assert.match(problems,/portable contract collapsed/);
  assert.match(problems,/physical_adapter.description/);
});


test('RED-TEAM WITNESS (known gap): syntactically valid but substantively weakened PGO passes structural preflight', () => {
  // This proves only structural-validator insufficiency; it is not an independent red-team certification.
  // Preserve the original full-PGO baseline and every source pointer. Change only decision-bearing semantics.
  const diluted = clone();
  diluted.pgo.intended_end_state = 'Report the repository build as a completed personal application';
  diluted.pgo.definition_of_done = [
    'GitHub Actions shows passing tests',
    'A hosted deployment reports READY'
  ];
  diluted.pgo.discrimination.method =
    'Prefer locally easy checkmarks even where no real person can use the result';
  diluted.pgo.discrimination.method_example =
    'A deployment is called a successful user journey without observing any user action';
  diluted.pgo.discrimination.helps = [
    'Count repository changes as completed capabilities',
    'Treat deployment as sufficient evidence of product value'
  ];
  diluted.pgo.discrimination.hinders = [
    'Ask whether the Principal can complete a real task',
    'Inspect whether actual Greenfield native state changed'
  ];
  const errors = validateIndex(diluted);
  assert.deepEqual(errors, [], 'Current structural preflight accepts deliberate attenuation; attack witness');
  assert.notEqual(diluted.pgo.intended_end_state, map.pgo.intended_end_state);
  assert.notEqual(diluted.pgo.discrimination.method, map.pgo.discrimination.method);
});

