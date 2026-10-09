import assert from 'node:assert/strict';
import test from 'node:test';
import { assessResponsibilitySet, type ResponsibilitySetInput, type SemanticSetAssessment } from '../../server/responsibility-set.ts';

const digest = 'a'.repeat(64);
const source = 'fixture:governing-obligation';
const input: ResponsibilitySetInput = {
  inquiry_basis_ref: 'fixture:basis', intended_use: 'select an inspection mechanism',
  obligation_ref: source, responsibility_ids: ['source-recovery', 'consumer-use'],
  source_editions: [{ ref: source, digest }],
};
const assessment: SemanticSetAssessment = {
  inquiry_basis_ref: input.inquiry_basis_ref, intended_use: input.intended_use,
  obligation_ref: source, source_editions: [...input.source_editions],
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
