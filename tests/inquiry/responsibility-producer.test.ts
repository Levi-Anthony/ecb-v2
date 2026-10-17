import test from 'node:test';
import assert from 'node:assert/strict';
import { produceResponsibilitySet, extractNormativeClauses, type RecoveredSource } from '../../server/responsibility-producer.ts';
import type { ResponsibilitySetInput, SemanticSetAssessment } from '../../server/responsibility-set.ts';
import type { NativePackageDescriptor } from '../../server/domain-admission.ts';

const source: RecoveredSource = {
  ref: 'fixture:obligation', content: 'The worker SHALL recover governing sources.\nThe worker MUST validate intended use.\nOther narrative.',
  basis_digest: 'fixture:native-edition', custody_ref: 'fixture:custody',
  source_refs: ['fixture:obligation'], currentness: 'CURRENT',
};
const input = { inquiry_basis_ref: 'fixture:inquiry', intended_use: 'qualify use at consumer boundary',
  obligation_ref: source.ref, responsibility_ids: ['source-recovery', 'use-validation'],
  candidate_content: 'Recover governing source, validate its declared consumer use, and preserve the received result.' };
const read = async () => ({ ...source });
const review = (set: ResponsibilitySetInput): SemanticSetAssessment => ({
  inquiry_basis_ref: set.inquiry_basis_ref, intended_use: set.intended_use,
  obligation_ref: set.obligation_ref, source_editions: [...set.source_editions],
  candidate_digest: set.candidate_digest,
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
test('verbatim source offsets survive CRLF line endings', () => {
  const content = 'Intro\r\nWorker SHALL recover source.\r\nWorker MUST report changes.';
  const found = extractNormativeClauses({ ...source, content });
  assert.equal(found.length, 2);
  for (const item of found) assert.equal(content.slice(item.start, item.end), item.excerpt);
});

test('no source and empty lexical match cannot manufacture semantic adequacy', async () => {
  const absent = await produceResponsibilitySet(input, { recoverSource: async () => null });
  assert.equal(absent.proposal.status, 'SOURCE_UNAVAILABLE');
  assert.equal(absent.assessment.disposition, 'HOLD');
  assert.deepEqual(extractNormativeClauses({ ...source, content: 'Purely implicit obligations.' }), []);
});


const nativePackage: NativePackageDescriptor = {
  id: 'fixture:package', domain: 'systems-engineering', name: 'Qualified source specimen',
  authority_ref: 'fixture:authorized-body', edition_ref: 'fixture:edition-1',
  semantic_scope: ['governing requirements'], source_refs: ['fixture:publication'],
  status: 'ACTIVE', access_routes: [], validation_routes: [], currentness_routes: [],
};
const withNative = { ...input, native_packages: [nativePackage] };
const qualifiedNative = async (id: string) => id === nativePackage.id
  ? { descriptor: structuredClone(nativePackage), currentness: 'CURRENT' as const } : null;

test('reviewer-visible recovered provenance is edition-bound across exact re-read', async () => {
  let reads = 0;
  const result = await produceResponsibilitySet(input, {
    recoverSource: async () => ({ ...source, source_refs: [
      ++reads === 1 ? 'fixture:original-provenance' : 'fixture:substituted-provenance',
    ] }),
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.some(x =>
    x.startsWith('SOURCE_EDITION_NOT_CURRENT_OR_UNRECOVERABLE')));
});
test('unqualified or missing provenance cannot yield a fresh READY', async () => {
  for (const refs of [[], [''], ['fixture:dup', 'fixture:dup']]) {
    const result = await produceResponsibilitySet(input, {
      recoverSource: async () => ({ ...source, source_refs: refs }),
      semanticReview: async set => review(set),
    });
    assert.equal(result.proposal.status, 'SOURCE_UNAVAILABLE');
    assert.equal(result.assessment.disposition, 'HOLD');
  }
});
test('qualified unchanged provenance remains positive, and order alone is harmless', async () => {
  let reads = 0;
  const result = await produceResponsibilitySet(input, {
    recoverSource: async () => ({ ...source, source_refs: ++reads === 1
      ? ['fixture:first', 'fixture:second'] : ['fixture:second', 'fixture:first'] }),
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'READY');
});
test('native package requires an actual CURRENT qualified reread, not its ACTIVE label', async () => {
  for (const recoverNativePackage of [undefined,
    async (id: string) => ({ descriptor: nativePackage, currentness: 'UNKNOWN' as const })]) {
    const result = await produceResponsibilitySet(withNative, {
      recoverSource: read, recoverNativePackage, semanticReview: async set => review(set),
    });
    assert.equal(result.assessment.disposition, 'HOLD');
    assert(result.assessment.verification.reasons.some(x =>
      x.startsWith('SOURCE_EDITION_NOT_CURRENT_OR_UNRECOVERABLE:native-package:')));
  }
});
test('native package current, unchanged and freshly assessed can remain scoped READY', async () => {
  const result = await produceResponsibilitySet(withNative, {
    recoverSource: read, recoverNativePackage: qualifiedNative,
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'READY');
  assert(result.assessment.verification.source_editions.some(s => s.ref ===
    'native-package:' + nativePackage.id));
});
test('same package ID cannot reuse assessment after edition/authority/scope/status/provenance change', async () => {
  let oldReview: SemanticSetAssessment | undefined;
  const initial = await produceResponsibilitySet(withNative, {
    recoverSource: read, recoverNativePackage: qualifiedNative,
    semanticReview: async set => (oldReview = review(set)),
  });
  assert.equal(initial.assessment.disposition, 'READY');
  const variants: NativePackageDescriptor[] = [
    { ...nativePackage, edition_ref: 'fixture:edition-2' },
    { ...nativePackage, authority_ref: 'fixture:other-authority' },
    { ...nativePackage, semantic_scope: ['unrelated scope'] },
    { ...nativePackage, status: 'HISTORICAL' },
    { ...nativePackage, source_refs: ['fixture:different-publication'] },
  ];
  for (const descriptor of variants) {
    const result = await produceResponsibilitySet({ ...input, native_packages: [descriptor] }, {
      recoverSource: read, recoverNativePackage: async () =>
        ({ descriptor, currentness: 'CURRENT' as const }),
      semanticReview: async () => structuredClone(oldReview!),
    });
    assert.notEqual(result.proposal.candidate_digest, initial.proposal.candidate_digest);
    assert.equal(result.assessment.disposition, 'HOLD');
    assert(result.assessment.verification.reasons.includes('ASSESSMENT_CANDIDATE_MISMATCH'));
  }
});
test('native descriptor changes between candidate and exact reread are denied', async () => {
  const changed = { ...nativePackage, authority_ref: 'fixture:new-authority' };
  const result = await produceResponsibilitySet(withNative, {
    recoverSource: read,
    recoverNativePackage: async () => ({ descriptor: changed, currentness: 'CURRENT' as const }),
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.some(x =>
    x.startsWith('SOURCE_EDITION_NOT_CURRENT_OR_UNRECOVERABLE:native-package:')));
});
