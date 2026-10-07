import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateDIBoundary, type DomainAdmissionRequest } from '../../server/domain-admission.ts';
import { systemsEngineeringNativePackages } from '../../server/native-packages/systems-engineering.ts';

const request = (responsibilities: DomainAdmissionRequest['responsibilities']): DomainAdmissionRequest => ({
  domain: 'systems-engineering', inquiry_basis_ref: 'sha256:inquiry',
  package_ids: systemsEngineeringNativePackages.map(p => p.id), responsibilities,
});
const base = {
  construct_ref: 'SysML Viewpoint', source_lane: 'CURRENT_PRACTICE' as const,
  source_refs: ['https://www.omg.org/spec/SysML/2.0/About-SysML'],
  native_package_ids: ['se:omg:sysml:2.0'], relation_type: 'OVERLAP' as const,
  prior_art: { checked: true, evidence_refs: ['https://www.omg.org/spec/SysML/2.0/About-SysML'] },
};

test('adequate native coverage is inherited', () => {
  const result = evaluateDIBoundary(request([{ ...base, id: 'viewpoint', problem_solved: 'Frame stakeholder concerns.', native_coverage: 'ADEQUATE' }]), systemsEngineeringNativePackages);
  assert.equal(result.decisions[0].disposition, 'INHERIT');
  assert.equal(result.disposition, 'READY');
});

test('adequate native semantics plus cross-domain targets federate', () => {
  const result = evaluateDIBoundary(request([{ ...base, id: 'view-to-referent', problem_solved: 'Bind native view semantics to an ECOS referent.', native_coverage: 'ADEQUATE',
    requires_cross_domain_correspondence: true, correspondence_targets: ['ecos:referent:R'] }]), systemsEngineeringNativePackages);
  assert.equal(result.decisions[0].disposition, 'FEDERATE');
});

test('extension requires named unmet obligation, mechanism and falsifier', () => {
  const result = evaluateDIBoundary(request([{ ...base, id: 'reseat', problem_solved: 'Make a focal-referent change explicit.', native_coverage: 'PARTIAL',
    unmet_obligation: 'Distinguish representation change from focal-referent replacement.', ecos_mechanism_refs: ['URG:Reseat'],
    falsifier: 'Demote if native semantics provide an equivalent typed focal-referent transition.' }]), systemsEngineeringNativePackages);
  assert.equal(result.decisions[0].disposition, 'EXTEND');
  assert.equal(result.decisions[0].standing, 'CURRENT_DECISION');
});

test('unchecked native prior art blocks required extension claims', () => {
  const result = evaluateDIBoundary(request([{ ...base, id: 'novelty', problem_solved: 'Claim an ECOS extension.', native_coverage: 'NONE', required_for_current_use: true,
    prior_art: { checked: false, evidence_refs: [] }, unmet_obligation: 'Something new.', ecos_mechanism_refs: ['ECOS:X'], falsifier: 'Native equivalent exists.' }]), systemsEngineeringNativePackages);
  assert.equal(result.decisions[0].disposition, 'QUALIFY');
  assert.equal(result.disposition, 'HOLD');
  assert.deepEqual(result.unresolved_refs, ['novelty']);
});

test('unavailable native source never becomes an extension automatically', () => {
  const result = evaluateDIBoundary(request([{ ...base, id: 'unavailable', problem_solved: 'Unknown native coverage.', native_coverage: 'UNAVAILABLE', required_for_current_use: true,
    prior_art: { checked: true, evidence_refs: [], unavailable_reason: 'Authoritative source unavailable.' }, unmet_obligation: 'Possible gap.', ecos_mechanism_refs: ['ECOS:X'], falsifier: 'Native equivalent exists.' }]), systemsEngineeringNativePackages);
  assert.equal(result.decisions[0].disposition, 'QUALIFY');
  assert.ok(result.decisions[0].gate_codes.includes('NATIVE_SOURCE_UNAVAILABLE'));
});

test('contradictory adequate plus unmet atom is forced back to qualification', () => {
  const result = evaluateDIBoundary(request([{ ...base, id: 'split-me', problem_solved: 'Overbroad atomic responsibility.', native_coverage: 'ADEQUATE', required_for_current_use: true,
    unmet_obligation: 'Claims a remaining gap.' }]), systemsEngineeringNativePackages);
  assert.equal(result.decisions[0].disposition, 'QUALIFY');
  assert.ok(result.decisions[0].gate_codes.includes('ATOMIZATION_CONFLICT'));
});
