import assert from 'node:assert/strict';
import test from 'node:test';
import { assessResponsibilitySet, type ResponsibilitySetInput, type SemanticSetAssessment } from '../../server/responsibility-set.ts';

const digest = 'a'.repeat(64);
const source = 'fixture:governing-obligation';
const input: ResponsibilitySetInput = {
  inquiry_basis_ref: 'fixture:basis', intended_use: 'select an inspection mechanism',
  obligation_ref: source, responsibility_ids: ['source-recovery', 'consumer-use'],
  candidate_digest: 'c'.repeat(64),
  source_editions: [{ ref: source, digest }],
};
const assessment: SemanticSetAssessment = {
  inquiry_basis_ref: input.inquiry_basis_ref, intended_use: input.intended_use,
  obligation_ref: source, source_editions: [...input.source_editions],
  candidate_digest: input.candidate_digest,
  required_responsibility_ids: ['source-recovery', 'consumer-use'],
  excluded_responsibility_ids: [], unresolved_refs: [],
  criterion: 'Both necessary responsibilities support the declared inspection use',
  method: 'independently reviewed source-to-use responsibility account',
  assessor_ref: 'fixture:independent-review', evidence_refs: [source],
  judgment: 'VALIDATED',
};
const recover = async (ref: string) => ({ ref, digest, currentness: 'CURRENT' as const });

test('verified bindings and independently attributed intended-use validation remain separate', async () => {
  const r = await assessResponsibilitySet(input, assessment, recover);
  assert.equal(r.verification.status, 'VERIFIED');
  assert.equal(r.validation.status, 'VALIDATED');
  assert.equal(r.disposition, 'READY');
});

test('omitting a necessary responsibility is not hidden by successful classifications of those supplied', async () => {
  const r = await assessResponsibilitySet({ ...input, responsibility_ids: ['source-recovery'] }, assessment, recover);
  assert.equal(r.disposition, 'HOLD');
  assert.equal(r.verification.status, 'UNVERIFIED');
  assert(r.verification.reasons.includes('RESPONSIBILITY_SET_MISMATCH'));
  assert.notEqual(r.validation.status, 'VALIDATED');
});

test('unsupported completeness assertion cannot claim validation without a semantic assessor', async () => {
  const r = await assessResponsibilitySet(input, undefined, recover);
  assert.equal(r.disposition, 'HOLD');
  assert.equal(r.validation.status, 'UNKNOWN');
  assert(r.unresolved_refs.includes('semantic_responsibility_set_assessment'));
});

test('changed inquiry basis or governing source edition invalidates carried assessment', async () => {
  const changed = await assessResponsibilitySet({ ...input, inquiry_basis_ref: 'fixture:new-basis' }, assessment, recover);
  assert.equal(changed.disposition, 'HOLD');
  assert(changed.verification.reasons.includes('ASSESSMENT_BASIS_MISMATCH'));
  const stale = await assessResponsibilitySet(input, assessment, async ref => ({ ref, digest: 'b'.repeat(64), currentness: 'CURRENT' }));
  assert.equal(stale.disposition, 'HOLD');
  assert(stale.verification.reasons.some(s => s.startsWith('SOURCE_EDITION_NOT_CURRENT')));
});

test('semantic uncertainty is not silently promoted by passing structural verification', async () => {
  const r = await assessResponsibilitySet(input, { ...assessment, judgment: 'UNKNOWN',
    unresolved_refs: ['fixture:possible-excluded-requirement'] }, recover);
  assert.equal(r.verification.status, 'VERIFIED');
  assert.equal(r.validation.status, 'UNKNOWN');
  assert.equal(r.disposition, 'HOLD');
  assert(r.unresolved_refs.includes('fixture:possible-excluded-requirement'));
});

test('caller-submitted attestation is not part of the ordinary public input contract', async () => {
  const r = await assessResponsibilitySet(input, undefined);
  assert.equal(r.validation.status, 'UNKNOWN');
  assert(r.verification.reasons.includes('SOURCE_EDITION_RECOVERY_UNAVAILABLE'));
});


// F5: exercise malformed provider receipts as runtime data, regardless of their
// compile-time TypeScript declarations. Every case must return, not throw.
test('F5 null/undefined/sparse and malformed coherent-snapshot editions return UNVERIFIED/HOLD', async () => {
  const multi = { ...input, source_editions: [
    ...input.source_editions, { ref: 'native-package:fixture:sysml', digest },
  ] };
  const assessed = { ...assessment, source_editions: [...multi.source_editions] };
  const qualified = multi.source_editions.map(e => ({ ...e, currentness: 'CURRENT' as const }));
  const sparse = [...qualified] as unknown[];
  delete sparse[0];
  const cases: Array<[string, unknown[]]> = [
    ['null', [null, qualified[1]]],
    ['undefined', [undefined, qualified[1]]],
    ['sparse', sparse],
    ['primitive', ['invalid', qualified[1]]],
    ['empty object', [{}, qualified[1]]],
    ['missing ref', [{ digest, currentness: 'CURRENT' }, qualified[1]]],
    ['blank ref', [{ ref: '', digest, currentness: 'CURRENT' }, qualified[1]]],
    ['missing digest', [{ ref: source, currentness: 'CURRENT' }, qualified[1]]],
    ['malformed digest', [{ ref: source, digest: 'not-a-digest', currentness: 'CURRENT' }, qualified[1]]],
    ['wrong currentness', [{ ...qualified[0], currentness: 'UNKNOWN' }, qualified[1]]],
    ['duplicate ref', [qualified[1], qualified[1]]],
  ];
  for (const [label, malformed] of cases) {
    const result = await assessResponsibilitySet(multi, assessed,
      async ref => ({ ref, digest, currentness: 'CURRENT' }),
      async () => ({
        snapshot_ref: 'fixture:apparently-qualified',
        consistency: 'ATOMIC_CURRENT_SELECTION' as const,
        source_editions: malformed as typeof qualified,
      }));
    assert.equal(result.disposition, 'HOLD', label);
    assert.equal(result.verification.status, 'UNVERIFIED', label);
    assert.equal(result.validation.status, 'UNKNOWN', label);
    assert.equal(result.verification.snapshot_ref, null, label);
    assert(result.verification.reasons.includes('SOURCE_EDITION_COHERENT_SNAPSHOT_UNVERIFIED'), label);
    assert(result.unresolved_refs.includes('SOURCE_EDITION_COHERENT_SNAPSHOT_UNVERIFIED'), label);
  }
});
test('F5 exact coherent positive and unresolved question behavior are preserved', async () => {
  const multi = { ...input, source_editions: [
    ...input.source_editions, { ref: 'native-package:fixture:sysml', digest },
  ] };
  const reviewed = { ...assessment, source_editions: [...multi.source_editions] };
  const snapshot = async (requested: typeof multi.source_editions) => ({
    snapshot_ref: 'fixture:verified-snapshot',
    consistency: 'ATOMIC_CURRENT_SELECTION' as const,
    source_editions: requested.map(e => ({ ...e, currentness: 'CURRENT' as const })),
  });
  const ready = await assessResponsibilitySet(multi, reviewed, recover, snapshot);
  assert.equal(ready.disposition, 'READY');
  assert.equal(ready.verification.snapshot_ref, 'fixture:verified-snapshot');
  const unresolved = await assessResponsibilitySet(multi,
    { ...reviewed, unresolved_refs: ['fixture:unresolved-criterion'] }, recover, snapshot);
  assert.equal(unresolved.disposition, 'HOLD');
  assert.equal(unresolved.verification.status, 'VERIFIED');
  assert.equal(unresolved.verification.snapshot_ref, 'fixture:verified-snapshot');
  assert(unresolved.unresolved_refs.includes('fixture:unresolved-criterion'));
});
