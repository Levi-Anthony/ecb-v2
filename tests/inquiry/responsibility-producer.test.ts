import test from 'node:test';
import assert from 'node:assert/strict';
import { produceResponsibilitySet, extractNormativeClauses, type RecoveredSource } from '../../server/responsibility-producer.ts';
import type { ResponsibilitySetInput, SemanticSetAssessment, RecoverEditionSnapshot } from '../../server/responsibility-set.ts';
import type { NativePackageDescriptor } from '../../server/domain-admission.ts';

const source: RecoveredSource = {
  ref: 'fixture:obligation', content: 'The worker SHALL recover governing sources.\nThe worker MUST validate intended use.\nOther narrative.',
  basis_digest: 'fixture:native-edition', custody_ref: 'fixture:custody',
  source_refs: ['fixture:obligation'], currentness: 'CURRENT',
};
const input = { inquiry_basis_ref: 'fixture:inquiry', intended_use: 'qualify use at consumer boundary',
  obligation_ref: source.ref, responsibility_ids: ['source-recovery', 'use-validation'],
  candidate_content: 'Recover governing source, validate its declared consumer use, and preserve the received result.',
  required_native_package_ids: [] as string[] };
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
const withNative = { ...input, native_packages: [nativePackage],
  required_native_package_ids: [nativePackage.id] };
const qualifiedNative = async (id: string) => id === nativePackage.id
  ? { descriptor: structuredClone(nativePackage), currentness: 'CURRENT' as const } : null;
/** Fixture of a qualified atomic selection, not a real normative reader. */
const qualifiedSnapshot: RecoverEditionSnapshot = async requested => ({
  snapshot_ref: 'fixture:transaction:qualified-atomic-selection',
  consistency: 'ATOMIC_CURRENT_SELECTION',
  source_editions: requested.map(e => ({ ...e, currentness: 'CURRENT' })),
});

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
    recoverEditionSnapshot: qualifiedSnapshot, semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'READY');
  assert.equal(result.assessment.verification.snapshot_ref, 'fixture:transaction:qualified-atomic-selection');
  assert(result.assessment.verification.source_editions.some(s => s.ref ===
    'native-package:' + nativePackage.id));
});
test('same package ID cannot reuse assessment after edition/authority/scope/status/provenance change', async () => {
  let oldReview: SemanticSetAssessment | undefined;
  const initial = await produceResponsibilitySet(withNative, {
    recoverSource: read, recoverNativePackage: qualifiedNative,
    recoverEditionSnapshot: qualifiedSnapshot, semanticReview: async set => (oldReview = review(set)),
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
      recoverEditionSnapshot: qualifiedSnapshot,
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
    recoverEditionSnapshot: qualifiedSnapshot,
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.some(x =>
    x.startsWith('SOURCE_EDITION_NOT_CURRENT_OR_UNRECOVERABLE:native-package:')));
});

test('F3 omitted required native dependency cannot obtain a READY assessment or digest', async () => {
  const other = { ...nativePackage, id: 'fixture:sysml', edition_ref: 'fixture:sysml-edition' };
  const omitted = await produceResponsibilitySet({
    ...input, native_packages: [nativePackage],
    required_native_package_ids: [nativePackage.id, other.id],
  }, {
    recoverSource: read, recoverNativePackage: qualifiedNative,
    recoverEditionSnapshot: qualifiedSnapshot, semanticReview: async set => review(set),
  });
  assert.equal(omitted.assessment.disposition, 'HOLD');
  assert.equal(omitted.proposal.candidate_digest, '');
  assert(omitted.assessment.verification.reasons.includes('CANDIDATE_EDITION_MISSING'));
});
test('F3 full dependency closure binds a same-ID native authority/edition/status change', async () => {
  const other = { ...nativePackage, id: 'fixture:sysml', edition_ref: 'fixture:sysml-edition' };
  const baseline = { ...input, required_native_package_ids: [nativePackage.id, other.id],
    native_packages: [nativePackage, other] };
  let heldAssessment: SemanticSetAssessment | undefined;
  const accepted = await produceResponsibilitySet(baseline, {
    recoverSource: read,
    recoverNativePackage: async id => ({ descriptor: id === other.id ? other : nativePackage,
      currentness: 'CURRENT' as const }),
    recoverEditionSnapshot: qualifiedSnapshot,
    semanticReview: async set => (heldAssessment = review(set)),
  });
  assert.equal(accepted.assessment.disposition, 'READY');
  assert(accepted.assessment.verification.source_editions.some(e => e.ref === 'native-package:' + other.id));
  for (const edited of [
    { ...other, authority_ref: 'fixture:other-authority' },
    { ...other, edition_ref: 'fixture:other-edition' },
    { ...other, status: 'HISTORICAL' as const },
  ]) {
    const replay = await produceResponsibilitySet({ ...baseline, native_packages: [nativePackage, edited] }, {
      recoverSource: read,
      recoverNativePackage: async id => ({ descriptor: id === other.id ? edited : nativePackage,
        currentness: 'CURRENT' as const }),
      recoverEditionSnapshot: qualifiedSnapshot,
      semanticReview: async () => structuredClone(heldAssessment!),
    });
    assert.notEqual(replay.proposal.candidate_digest, accepted.proposal.candidate_digest);
    assert.equal(replay.assessment.disposition, 'HOLD');
    assert(replay.assessment.verification.reasons.includes('ASSESSMENT_CANDIDATE_MISMATCH'));
  }
});
test('F4 revocation during later package reread cannot be promoted by sequential CURRENT', async () => {
  let governing = { ...source };
  let rereads = 0;
  const result = await produceResponsibilitySet(withNative, {
    recoverSource: async () => { rereads++; return { ...governing }; },
    recoverNativePackage: async () => {
      governing = { ...governing, currentness: 'STALE', basis_digest: 'fixture:revoked' };
      return { descriptor: nativePackage, currentness: 'CURRENT' as const };
    },
    semanticReview: async set => review(set),
    // No qualified atomic selection; the old algorithm returned READY here.
  });
  assert.equal(rereads, 2);
  assert.equal(governing.currentness, 'STALE');
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.includes('SOURCE_EDITION_COHERENT_SNAPSHOT_UNAVAILABLE'));
  assert.equal(result.assessment.verification.snapshot_ref, null);
});
test('F4 qualified end-of-window snapshot observes source revocation during package read', async () => {
  let governing = { ...source };
  const result = await produceResponsibilitySet(withNative, {
    recoverSource: async () => ({ ...governing }),
    recoverNativePackage: async () => {
      governing = { ...source, currentness: 'STALE', basis_digest: 'fixture:revoked' };
      return { descriptor: nativePackage, currentness: 'CURRENT' as const };
    },
    recoverEditionSnapshot: async requested => ({
      snapshot_ref: 'fixture:atomic-revocation-evidence',
      consistency: 'ATOMIC_CURRENT_SELECTION',
      source_editions: requested.map(e => ({
        ...e, currentness: e.ref === source.ref ? 'STALE' as const : 'CURRENT' as const,
      })),
    }),
    semanticReview: async set => review(set),
  });
  assert.equal(governing.currentness, 'STALE');
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.includes('SOURCE_EDITION_COHERENT_SNAPSHOT_UNVERIFIED'));
});
test('coherent snapshot cannot omit an earlier native dependency or use a casual token', async () => {
  for (const receipt of [
    { snapshot_ref: '', consistency: 'ATOMIC_CURRENT_SELECTION' as const,
      source_editions: [{ ref: source.ref, digest: '0'.repeat(64), currentness: 'CURRENT' as const }] },
    { snapshot_ref: 'fixture:token', consistency: 'ATOMIC_CURRENT_SELECTION' as const,
      source_editions: [] },
  ]) {
    const result = await produceResponsibilitySet(withNative, {
      recoverSource: read, recoverNativePackage: qualifiedNative,
      recoverEditionSnapshot: async () => receipt,
      semanticReview: async set => review(set),
    });
    assert.equal(result.assessment.disposition, 'HOLD');
    assert(result.assessment.verification.reasons.includes('SOURCE_EDITION_COHERENT_SNAPSHOT_UNVERIFIED'));
  }
});

// F5 producer integration: the malformed trusted-port response must not
// escape the responsibility-set receipt boundary as a thrown exception.
test('F5 malformed native source snapshot is returned as accountable HOLD by producer', async () => {
  const second = { ...nativePackage, id: 'fixture:sysml', edition_ref: 'fixture:sysml-edition' };
  const full = { ...input, required_native_package_ids: [nativePackage.id, second.id],
    native_packages: [nativePackage, second] };
  for (const invalid of [null, undefined]) {
    const produced = await produceResponsibilitySet(full, {
      recoverSource: read,
      recoverNativePackage: async id => ({
        descriptor: id === second.id ? second : nativePackage,
        currentness: 'CURRENT' as const,
      }),
      recoverEditionSnapshot: async requested => ({
        snapshot_ref: 'fixture:malformed-snapshot',
        consistency: 'ATOMIC_CURRENT_SELECTION' as const,
        source_editions: [invalid, ...requested.slice(1).map(e =>
          ({ ...e, currentness: 'CURRENT' as const }))] as unknown as
          Array<{ ref: string; digest: string; currentness: 'CURRENT' | 'STALE' | 'UNKNOWN' }>,
      }),
      semanticReview: async set => review(set),
    });
    assert.equal(produced.assessment.disposition, 'HOLD');
    assert.equal(produced.assessment.verification.status, 'UNVERIFIED');
    assert.equal(produced.assessment.verification.snapshot_ref, null);
    assert(produced.assessment.verification.reasons.includes('SOURCE_EDITION_COHERENT_SNAPSHOT_UNVERIFIED'));
  }
});

test('F6 sparse recovered source_refs never give SOURCE_RECOVERED or READY', async () => {
  const holes = new Array<string>(1);
  const variants: unknown[] = [holes, [undefined], [null], [''], ['fixture:ok', , 'fixture:other']];
  for (const refs of variants) {
    let assessorCalls = 0;
    const result = await produceResponsibilitySet(input, {
      recoverSource: async () => ({ ...source, source_refs: refs as string[] }),
      semanticReview: async set => { assessorCalls++; return review(set); },
    });
    assert.equal(result.proposal.status, 'SOURCE_UNAVAILABLE');
    assert.equal(result.assessment.disposition, 'HOLD');
    assert.equal(result.assessment.verification.status, 'UNVERIFIED');
    assert(result.assessment.verification.reasons.includes('SOURCE_EDITION_BASIS_INCOMPLETE'));
    assert.equal(assessorCalls, 0);
    assert(result.assessment.unresolved_refs.includes('semantic_responsibility_set_assessment'));
  }
});
test('F6 sparse required native dependencies cannot silently become an empty qualified set', async () => {
  for (const ids of [new Array<string>(1), [undefined] as unknown as string[],
    ['fixture:native', , 'fixture:other'] as string[]]) {
    let assessorCalls = 0;
    const result = await produceResponsibilitySet({ ...input,
      required_native_package_ids: ids,
    }, {
      recoverSource: read,
      semanticReview: async set => { assessorCalls++; return review(set); },
    });
    assert.equal(result.proposal.candidate_digest, '');
    assert.equal(result.assessment.disposition, 'HOLD');
    assert(result.assessment.verification.reasons.includes('CANDIDATE_EDITION_MISSING'));
    assert.equal(assessorCalls, 0);
    assert(result.assessment.unresolved_refs.includes('CANDIDATE_EDITION_MISSING'));
  }
});
test('F6 sparse native scope/provenance and package list cannot qualify', async () => {
  for (const field of ['semantic_scope', 'source_refs'] as const) {
    let assessorCalls = 0;
    const result = await produceResponsibilitySet({ ...input,
      native_packages: [{ ...nativePackage, [field]: new Array<string>(1) }],
      required_native_package_ids: [nativePackage.id],
    }, {
      recoverSource: read, recoverNativePackage: qualifiedNative,
      recoverEditionSnapshot: qualifiedSnapshot,
      semanticReview: async set => { assessorCalls++; return review(set); },
    });
    assert.equal(result.assessment.disposition, 'HOLD');
    assert.equal(result.proposal.candidate_digest, '');
    assert.equal(assessorCalls, 0);
  }
  const sparsePackages = new Array<NativePackageDescriptor>(1);
  const result = await produceResponsibilitySet({ ...input,
    native_packages: sparsePackages, required_native_package_ids: [],
  }, { recoverSource: read, semanticReview: async set => review(set) });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert.equal(result.proposal.candidate_digest, '');
});
test('F7 malformed semanticReview arrays remain an accountable producer HOLD', async () => {
  const sparse = new Array<string>(1);
  const changes: Array<[string, Record<string, unknown>]> = [
    ['required absent', { required_responsibility_ids: undefined }],
    ['required sparse', { required_responsibility_ids: sparse }],
    ['excluded null', { excluded_responsibility_ids: null }],
    ['excluded sparse', { excluded_responsibility_ids: sparse }],
    ['unresolved absent', { unresolved_refs: undefined }],
    ['unresolved sparse', { unresolved_refs: sparse }],
    ['evidence absent', { evidence_refs: undefined }],
    ['evidence sparse', { evidence_refs: sparse }],
    ['evidence explicit undefined', { evidence_refs: [undefined] }],
    ['evidence null', { evidence_refs: [null] }],
    ['source editions absent', { source_editions: undefined }],
  ];
  for (const [label, change] of changes) {
    const result = await produceResponsibilitySet(input, {
      recoverSource: read,
      semanticReview: async set => ({ ...review(set), ...change }) as SemanticSetAssessment,
    });
    assert.equal(result.assessment.disposition, 'HOLD', label);
    assert.equal(result.assessment.verification.status, 'UNVERIFIED', label);
    assert.equal(result.assessment.validation.status, 'UNKNOWN', label);
    assert(result.assessment.verification.reasons.includes('SEMANTIC_ASSESSMENT_PAYLOAD_INVALID'), label);
    assert(result.assessment.unresolved_refs.includes('SEMANTIC_ASSESSMENT_PAYLOAD_INVALID'), label);
    assert(result.assessment.unresolved_refs.includes('semantic_responsibility_set_assessment'), label);
    assert.deepEqual(result.assessment.validation.evidence_refs, [], label);
  }
});
