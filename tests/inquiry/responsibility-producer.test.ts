import test from 'node:test';
import assert from 'node:assert/strict';
import { produceResponsibilitySet, extractNormativeClauses, type RecoveredSource } from '../../server/responsibility-producer.ts';
import type { SemanticSetAssessment } from '../../server/responsibility-set.ts';

const source: RecoveredSource = {
  ref: 'fixture:obligation', content: 'The worker SHALL recover governing sources.\nThe worker MUST validate intended use.\nOther narrative.',
  basis_digest: 'fixture:native-edition', custody_ref: 'fixture:custody',
  source_refs: ['fixture:obligation'], currentness: 'CURRENT',
};
const input = { inquiry_basis_ref: 'fixture:inquiry', intended_use: 'qualify use at consumer boundary',
  obligation_ref: source.ref, responsibility_ids: ['source-recovery', 'use-validation'] };
const read = async () => ({ ...source });
const review = (set: typeof input & { source_editions: { ref: string; digest: string }[] }): SemanticSetAssessment => ({
  inquiry_basis_ref: set.inquiry_basis_ref, intended_use: set.intended_use,
  obligation_ref: set.obligation_ref, source_editions: [...set.source_editions],
  required_responsibility_ids: ['source-recovery', 'use-validation'], excluded_responsibility_ids: [],
  unresolved_refs: [], criterion: 'Both explicit governing clauses are addressed for this consumer',
  method: 'Independent exact-source semantic review', assessor_ref: 'fixture:separate-reviewer',
  evidence_refs: [source.ref], judgment: 'VALIDATED',
});

test('source-first producer yields exact anchored clauses, but no autonomous validation', async () => {
  const p = await produceResponsibilitySet(input, { recoverSource: read });
  assert.equal(p.proposal.status, 'SOURCE_RECOVERED');
  assert.equal(p.proposal.candidate_clauses.length, 2);
  assert.match(p.proposal.candidate_clauses[0].excerpt, /SHALL recover/);
  assert.equal(p.assessment.disposition, 'HOLD');
  assert.equal(p.assessment.validation.status, 'UNKNOWN');
});
test('independent attributed assessment can be checked against actual re-read source and consumer', async () => {
  const p = await produceResponsibilitySet(input, { recoverSource: read,
    semanticReview: async set => review(set) });
  assert.equal(p.assessment.verification.status, 'VERIFIED');
  assert.equal(p.assessment.validation.status, 'VALIDATED');
  assert.equal(p.assessment.disposition, 'READY');
});
test('actual source with omitted obligation cannot be accepted by independent reviewer', async () => {
  const p = await produceResponsibilitySet({ ...input, responsibility_ids: ['source-recovery'] }, {
    recoverSource: read, semanticReview: async set => review(set),
  });
  assert.equal(p.assessment.disposition, 'HOLD');
  assert(p.assessment.verification.reasons.includes('RESPONSIBILITY_SET_MISMATCH'));
});
test('source changed between assessment and exact re-read blocks validation', async () => {
  let count = 0;
  const p = await produceResponsibilitySet(input, {
    recoverSource: async () => ({ ...source, content: (++count === 1 ? source.content : source.content + '\nExtra SHALL obligation.') }),
    semanticReview: async set => review(set),
  });
  assert.equal(p.assessment.disposition, 'HOLD');
  assert(p.assessment.verification.reasons.some(x => x.startsWith('SOURCE_EDITION_NOT_CURRENT_OR_UNRECOVERABLE')));
});
test('unknown governing currentness cannot be promoted from byte-equivalent source', async () => {
  const p = await produceResponsibilitySet(input, {
    recoverSource: async () => ({ ...source, currentness: 'UNKNOWN' }),
    semanticReview: async set => review(set),
  });
  assert.equal(p.assessment.disposition, 'HOLD');
  assert.equal(p.assessment.verification.status, 'UNVERIFIED');
});
test('no source and empty lexical match cannot manufacture semantic adequacy', async () => {
  const absent = await produceResponsibilitySet(input, { recoverSource: async () => null });
  assert.equal(absent.proposal.status, 'SOURCE_UNAVAILABLE');
  assert.equal(absent.assessment.disposition, 'HOLD');
  assert.deepEqual(extractNormativeClauses({ ...source, content: 'Purely implicit obligations.' }), []);
});
