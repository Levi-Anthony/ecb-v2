import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { produceResponsibilitySet, type ResponsibilityProposalInput, type RecoveredSource } from '../../server/responsibility-producer.ts';
import { assessResponsibilitySet, type ResponsibilitySetInput, type SemanticSetAssessment } from '../../server/responsibility-set.ts';

// Real derivative shape; simulated trusted source/assessor ports. These fixtures
// qualify binding behavior, not this historical map's current semantic adequacy.
const map = JSON.parse(readFileSync(new URL('../../integration/capability-map.v0.1.json', import.meta.url), 'utf8'));
const source: RecoveredSource = {
  ref: 'fixture:independently-selected-governing-source', content: 'The worker SHALL preserve the containing purpose and verify the intended receiving effect.',
  custody_ref: 'fixture:source-custody', basis_digest: 'fixture:source-edition',
  source_refs: ['fixture:principal-instruction'], currentness: 'CURRENT',
};
const inputFor = (candidate: typeof map): ResponsibilityProposalInput => ({
  inquiry_basis_ref: 'fixture:source-bound-reception', intended_use: 'qualify this bounded derivative for contribution to the containing personal workflow',
  obligation_ref: source.ref, responsibility_ids: candidate.capabilities.map((c: { id: string }) => c.id),
  candidate_content: JSON.stringify(candidate),
});
const review = (set: ResponsibilitySetInput): SemanticSetAssessment => ({
  inquiry_basis_ref: set.inquiry_basis_ref, intended_use: set.intended_use, obligation_ref: set.obligation_ref,
  candidate_digest: set.candidate_digest, source_editions: structuredClone(set.source_editions),
  required_responsibility_ids: map.capabilities.map((c: { id: string }) => c.id), excluded_responsibility_ids: [],
  unresolved_refs: [], criterion: 'Fixture assessor qualifies this bounded contribution, not completion of the parent workflow.',
  method: 'Simulated independently wired semantic port; no autonomous language judgment claimed',
  assessor_ref: 'fixture:separately-wired-reviewer', evidence_refs: [source.ref], judgment: 'VALIDATED',
});
const recoverSource = async () => structuredClone(source);
async function acceptedBaseline() {
  let assessment!: SemanticSetAssessment;
  const result = await produceResponsibilitySet(inputFor(map), { recoverSource,
    semanticReview: async (set, evidence) => {
      assert.equal(evidence.candidate.content, JSON.stringify(map));
      assert.equal(evidence.candidate.digest, set.candidate_digest);
      assessment = review(set);
      return structuredClone(assessment);
    } });
  assert.equal(result.assessment.disposition, 'READY');
  return { result, assessment };
}

test('positive scoped contribution is usable without pretending the containing outcome is complete', async () => {
  const { result } = await acceptedBaseline();
  assert.equal(result.assessment.validation.status, 'VALIDATED');
  assert.match(result.assessment.validation.criterion!, /not completion of the parent/);
  assert.match(result.proposal.limitations.join(' '), /not meaning, actual use, installation or action authority/);
});

const attacks: [string, (candidate: typeof map) => void][] = [
  ['reverse semantic contract', c => { c.capabilities[0].semantic_contract.meaning = 'A local build replaces the containing purpose and grants standing.'; }],
  ['unsupported actual-use standing', c => { c.capabilities[0].physical_adapter.standing = 'ACTUAL_USE_VALIDATED'; }],
  ['CI substituted for mobile acceptance', c => { c.requirements[1].acceptance = 'GitHub Actions succeeds'; }],
  ['one-character placeholder evasion', c => { c.capabilities[0].semantic_contract.meaning = c.capabilities[0].acceptance.missing + '.'; }],
  ['containing system shrunk to repo CI deployment', c => { c.pgo.containing_whole = 'Repository, CI and deployment only'; }],
  ['omit three capabilities and requirements', c => { c.capabilities = c.capabilities.slice(0, 1); c.requirements = c.requirements.slice(0, 1); }],
  ['fabricated current source revision', c => { c.baseline.main_sha = 'f'.repeat(40); }],
];
for (const [name, change] of attacks) test('receiving boundary withholds reused assessment: ' + name, async () => {
  const { result: before, assessment } = await acceptedBaseline();
  const changed = structuredClone(map); change(changed);
  const result = await produceResponsibilitySet(inputFor(changed), { recoverSource,
    semanticReview: async () => structuredClone(assessment) });
  assert.notEqual(result.proposal.candidate_digest, before.proposal.candidate_digest);
  assert.equal(result.assessment.disposition, 'HOLD');
  assert.equal(result.assessment.validation.status, 'UNKNOWN');
  assert(result.assessment.verification.reasons.includes('ASSESSMENT_CANDIDATE_MISMATCH'));
});

test('exact bytes and structural coverage without a semantic reviewer earn no reliance', async () => {
  const result = await produceResponsibilitySet(inputFor(map), { recoverSource });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert.equal(result.assessment.validation.status, 'UNKNOWN');
});
test('a genuinely revised scoped candidate can be used after a new source-bound assessment', async () => {
  const revised = structuredClone(map);
  revised.pgo.definition_of_done.push('This child returns a source-qualified receiving repair; whole-product completion remains separate.');
  const result = await produceResponsibilitySet(inputFor(revised), { recoverSource, semanticReview: async set => review(set) });
  assert.equal(result.assessment.disposition, 'READY');
});
test('VALIDATED with unresolved semantic questions cannot emit READY', async () => {
  const result = await produceResponsibilitySet(inputFor(map), { recoverSource,
    semanticReview: async set => ({ ...review(set), unresolved_refs: ['fixture:unproved-receiving-effect'] }) });
  assert.equal(result.assessment.verification.status, 'VERIFIED');
  assert.equal(result.assessment.disposition, 'HOLD');
  assert.equal(result.assessment.validation.status, 'UNKNOWN');
  assert(result.assessment.unresolved_refs.includes('fixture:unproved-receiving-effect'));
});
test('recency/byte identity cannot replace qualified source currentness', async () => {
  const result = await produceResponsibilitySet(inputFor(map), {
    recoverSource: async () => ({ ...source, currentness: 'UNKNOWN' }), semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.some(r => r.startsWith('SOURCE_EDITION_NOT_CURRENT')));
});
test('explicitly selected new governing edition is checked at its own qualified scope', async () => {
  const result = await produceResponsibilitySet(inputFor(map), {
    recoverSource: async () => ({ ...source, content: source.content + '\nAn authorized in-scope supersession MUST be followed.', basis_digest: 'fixture:explicitly-selected-scope-edition' }),
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'READY');
  // The trusted reader selected this edition; the producer did not rank it by date.
});
test('source edition changing while reviewed invalidates the received assessment', async () => {
  let n = 0;
  const result = await produceResponsibilitySet(inputFor(map), {
    recoverSource: async () => ({ ...source, basis_digest: ++n === 1 ? 'fixture:old' : 'fixture:new' }),
    semanticReview: async set => review(set),
  });
  assert.equal(result.assessment.disposition, 'HOLD');
});
test('an assessor cannot mutate its copy of the received candidate basis to reuse another judgment', async () => {
  const { assessment } = await acceptedBaseline();
  const changed = structuredClone(map); attacks[0][1](changed);
  const result = await produceResponsibilitySet(inputFor(changed), { recoverSource,
    semanticReview: async (set, evidence) => {
      set.candidate_digest = assessment.candidate_digest;
      evidence.candidate.content = JSON.stringify(map);
      return structuredClone(assessment);
    } });
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.includes('ASSESSMENT_CANDIDATE_MISMATCH'));
});
test('missing full derivative content cannot reuse an identity-only assessment', async () => {
  const { assessment } = await acceptedBaseline();
  let called = false;
  const result = await produceResponsibilitySet({ ...inputFor(map), candidate_content: '' }, { recoverSource,
    semanticReview: async () => { called = true; return assessment; } });
  assert.equal(called, false);
  assert.equal(result.assessment.disposition, 'HOLD');
  assert(result.assessment.verification.reasons.includes('CANDIDATE_EDITION_MISSING'));
});
test('asynchronous source reads cannot rewrite the direct assessment basis', async () => {
  const { assessment } = await acceptedBaseline();
  const input: ResponsibilitySetInput = {
    inquiry_basis_ref: assessment.inquiry_basis_ref, intended_use: assessment.intended_use,
    obligation_ref: assessment.obligation_ref, candidate_digest: 'e'.repeat(64),
    responsibility_ids: assessment.required_responsibility_ids, source_editions: assessment.source_editions,
  };
  const result = await assessResponsibilitySet(input, assessment, async ref => {
    input.candidate_digest = assessment.candidate_digest;
    return { ref, digest: assessment.source_editions[0].digest, currentness: 'CURRENT' };
  });
  assert.equal(result.disposition, 'HOLD');
  assert.equal(result.candidate_digest, 'e'.repeat(64));
});
