import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { renderCivPortabilityMatrix, validateCivPortabilityMatrix, type CivsPortabilityMatrix } from '../../server/civs.ts';

const matrix=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission-portability-v0.1.json', import.meta.url),'utf8')) as CivsPortabilityMatrix;
const human=readFileSync(new URL('../../docs/civs-domain-semantic-admission-portability.md', import.meta.url),'utf8');

test('WP6 matrix validates and its human projection is exact',()=>{
  assert.deepEqual(validateCivPortabilityMatrix(matrix),{valid:true,errors:[]});
  assert.equal(renderCivPortabilityMatrix(matrix),human);
  assert.equal(matrix.portable_contract.standing,'NOT_ESTABLISHED');
});
test('pure evaluator and integrated ordinary-use dependencies remain separate',()=>{
  assert(matrix.realizations.some(x=>x.dependency_class==='SEMANTIC_EVALUATOR'));
  assert(matrix.realizations.some(x=>x.dependency_class==='CANONICAL_RECOVERY'));
  assert(matrix.realizations.some(x=>x.dependency_class==='DEPLOYMENT_HOST'));
});
test('degradation is visible and never promotes standing',()=>{
  const by=new Map(matrix.degradation_cases.map(x=>[x.ref,x]));
  assert.equal(by.get('wp6:d:no-graphics')?.disposition,'CONTINUE');
  assert.equal(by.get('wp6:d:stale-consumer')?.disposition,'HOLD');
  assert.equal(by.get('wp6:d:native-source-down')?.disposition,'HOLD');
  assert.equal(by.get('wp6:d:brain-capture-drift')?.disposition,'DEGRADE');
  assert.equal(by.get('wp6:d:ci-down')?.disposition,'DEGRADE');
  for(const c of matrix.degradation_cases){assert(c.retained_capabilities.length);assert(c.lost_capabilities.length);assert(c.visible_signals.length);assert(c.reentry_route.length);}
  assert(matrix.cross_case_invariants.some(x=>x.includes('never upgrades semantic standing')));
});
test('native source loss QUALIFY/HOLDs rather than defaulting to EXTEND',()=>{
  const c=matrix.degradation_cases.find(x=>x.ref==='wp6:d:native-source-down')!;
  assert(c.visible_signals.includes('NATIVE_SOURCE_UNAVAILABLE'));
  assert.equal(c.disposition,'HOLD');
  assert(matrix.cross_case_invariants.some(x=>x.includes('never automatic ECOS extension')));
});
