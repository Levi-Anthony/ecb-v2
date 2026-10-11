/**
 * ECO-202: bounded domain-native semantic discrimination from already recovered
 * protocol specification and execution evidence. No text classification by labels,
 * no provider call, no new ontology, and no generated standing.
 *
 * This producer only supplies an LL position when an independently supplied
 * native verification receipt binds an enacted occurrence to a versioned rule
 * system with a discriminating admissible/inadmissible contrast. A trusted, independently wired native verifier must recover and bind the
 * receipt itself; a caller-supplied boolean is never sufficient evidence. Failed or incomplete evidence preserves LL UNKNOWN.
 */
import {
  inquiryBasisRef, questionForward, type Disclosure, type ExactEvidence, type InquiryRequest,
} from './orchestration.js';
import {
  QUADRANT_COORDINATES, QUADRANT_DISCLOSURE_CONTRACT, type SituatedContext,
} from './urg-core.js';

export const SEMANTIC_PROTOCOL_PRODUCER = 'ecos:semantic-protocol-producer:0.1.0' as const;

export type NativeVerification = {
  /** Produced by an independently bound native verifier, not copied from input. */
  verifier_ref: string;
  verification_receipt: ExactEvidence;
  protocol_ref: string;
  protocol_digest: string;
  execution_ref: string;
  execution_digest: string;
  occurrence_ref: string;
  focal_referent_id: string;
  boundary_ref: string;
};

export type ProtocolEvidencePair = {
  protocol: ExactEvidence;
  execution: ExactEvidence;
};

/** A trusted native capability must obtain and verify its own proof of occurrence. */
export type ProtocolSemanticPorts = {
  verifyNative(request: InquiryRequest, pair: ProtocolEvidencePair): Promise<NativeVerification | null>;
};

export type ProtocolSemanticsResult = {
  disposition: 'DISCLOSED_LL' | 'LL_UNKNOWN';
  reason: string;
  disclosure: Disclosure;
};

type Transition = { from: string; action: string; to?: string; decision: 'ALLOW' | 'DENY' };
type ProtocolSpec = {
  contract: 'ecos:domain-protocol:v1';
  edition: string;
  boundary_ref: string;
  transitions: Transition[];
};
type ExecutionReceipt = {
  contract: 'ecos:domain-protocol-execution:v1';
  protocol_edition: string;
  protocol_ref: string;
  protocol_digest: string;
  focal_referent_id: string;
  boundary_ref: string;
  occurrence_ref: string;
  from: string;
  action: string;
  to: string;
  decision: 'ALLOW' | 'DENY';
};

const nonblank = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;
const recoverable = (e: ExactEvidence) =>
  nonblank(e.referent_id) && nonblank(e.content) && nonblank(e.digest) &&
  nonblank(e.custody_ref) && Array.isArray(e.source_refs) && e.source_refs.length > 0 &&
  e.source_refs.every(nonblank) && e.currentness === 'CURRENT';

function parseObject(text: string): Record<string, unknown> | null {
  try {
    const o: unknown = JSON.parse(text);
    return o !== null && typeof o === 'object' && !Array.isArray(o) ? o as Record<string, unknown> : null;
  } catch { return null; }
}
function transition(x: unknown): x is Transition {
  if (x === null || typeof x !== 'object' || Array.isArray(x)) return false;
  const t = x as Record<string, unknown>;
  return nonblank(t.from) && nonblank(t.action) && (t.decision === 'ALLOW' || t.decision === 'DENY')
    && (t.to === undefined || nonblank(t.to));
}

/**
 * Domain-native case only: the protocol's rule and the actual occurrence are
 * separate, exactly recovered referents. A simulation or mapper-authored account
 * is not an attested occurrence. A negative physical-domain control therefore
 * cannot be promoted by merely filling in a plausible LL label.
 */
export async function produceProtocolSemantics(
  request: InquiryRequest,
  pair: ProtocolEvidencePair | null,
  ports?: ProtocolSemanticPorts,
): Promise<ProtocolSemanticsResult> {
  const basis = inquiryBasisRef(request);
  const unresolved = (reason: string): ProtocolSemanticsResult => {
    const qf = questionForward(request, basis, 'quadrant:LL',
      'Which native field of distinctions actually applies to this focal referent, with a source-bound consequence?',
      'Retain an LL inquiry obligation; a mapper account, interaction or unverified assertion is not automatically a positive LL disclosure.');
    return { disposition: 'LL_UNKNOWN', reason, disclosure: {
      records: [{ ref: `${SEMANTIC_PROTOCOL_PRODUCER}:unknown:${basis}`, record: {
        kind: 'quadrant', context: request.context as SituatedContext,
        disclosure_contract: QUADRANT_DISCLOSURE_CONTRACT, result: 'QUADRANT_UNKNOWN',
        disclosure: 'LL', coordinates: QUADRANT_COORDINATES.LL, qf_ref: qf.unresolved_ref,
        fidelity: { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'UNRESOLVED' },
      }}],
      changes: [], sufficiency: { inquiry_basis_ref: basis, assessment_ref: SEMANTIC_PROTOCOL_PRODUCER,
        satisfied: false, unresolved_refs: [qf.unresolved_ref] },
    }};
  };
  if (!pair || !ports) return unresolved('Native protocol evidence or independent verification capability is unavailable.');
  const { protocol, execution } = pair;
  let verified: NativeVerification | null;
  try {
    verified = await ports.verifyNative(structuredClone(request), structuredClone(pair));
  } catch {
    return unresolved('Native verification failed without a current attributable receipt.');
  }
  const receipt = verified?.verification_receipt;
  if (!verified || !nonblank(verified.verifier_ref) || !receipt || !recoverable(receipt))
    return unresolved('Native verification is absent, partial, stale or unattributed.');
  if (verified.protocol_ref !== protocol.referent_id || verified.protocol_digest !== protocol.digest
    || verified.execution_ref !== execution.referent_id || verified.execution_digest !== execution.digest
    || verified.focal_referent_id !== request.context.referent_id
    || verified.boundary_ref !== request.context.boundary_ref)
    return unresolved('The native verifier did not bind this exact source, execution and focal seat.');
  const proof = parseObject(receipt.content);
  if (!proof || proof.contract !== 'ecos:native-protocol-verification:v1'
    || proof.standing !== 'VERIFIED' || !nonblank(proof.ll_discriminator)
    || !receipt.source_refs.includes(verified.verifier_ref))
    return unresolved('The recovered native verification receipt lacks a current positive articulation account.');
  if (!recoverable(protocol) || !recoverable(execution) || protocol.referent_id === execution.referent_id)
    return unresolved('Exact independent protocol and execution account editions are not recoverable and current.');
  const rawSpec = parseObject(protocol.content), rawRun = parseObject(execution.content);
  if (!rawSpec || !rawRun || rawSpec.contract !== 'ecos:domain-protocol:v1'
    || rawRun.contract !== 'ecos:domain-protocol-execution:v1') return unresolved('This is not a qualified domain protocol/execution pair.');
  const spec = rawSpec as unknown as ProtocolSpec, run = rawRun as unknown as ExecutionReceipt;
  if (!nonblank(spec.edition) || !nonblank(spec.boundary_ref) || !Array.isArray(spec.transitions)
    || !spec.transitions.every(transition) || !nonblank(run.focal_referent_id)
    || !nonblank(run.boundary_ref) || !nonblank(run.occurrence_ref)
    || !nonblank(run.from) || !nonblank(run.action) || !nonblank(run.to)
    || run.decision !== 'ALLOW' || !nonblank(run.protocol_edition)) return unresolved('Protocol or execution is incomplete.');
  if (spec.boundary_ref !== request.context.boundary_ref || run.boundary_ref !== request.context.boundary_ref
    || run.focal_referent_id !== request.context.referent_id
    || run.protocol_ref !== protocol.referent_id || run.protocol_digest !== protocol.digest
    || run.protocol_edition !== spec.edition || verified.occurrence_ref !== run.occurrence_ref)
    return unresolved('Source/occasion, protocol edition, or focal seat mismatched.');
  const matching = spec.transitions.filter(t => t.from === run.from && t.action === run.action);
  if (matching.length !== 1 || matching[0].decision !== 'ALLOW' || matching[0].to !== run.to)
    return unresolved('Observed run and declared allowed transition disagree.');
  // Distinct admissible and inadmissible consequences in one domain-native field.
  // Unmentioned transitions are not presumed forbidden by default.
  const denied = spec.transitions.filter(t => t.from === run.from && t.decision === 'DENY'
    && t.action !== run.action);
  if (denied.length === 0) return unresolved('No source-witnessed discriminating contrast exists at the focal state.');
  const duplicated = new Set(spec.transitions.map(t => `${t.from}\u0000${t.action}`));
  if (duplicated.size !== spec.transitions.length) return unresolved('Ambiguous native transition grammar.');
  const ref = `${SEMANTIC_PROTOCOL_PRODUCER}:LL:${execution.referent_id}`;
  const evidenceRefs = [...new Set([...protocol.source_refs, ...execution.source_refs,
    protocol.referent_id, execution.referent_id, receipt.referent_id])];
  return {
    disposition: 'DISCLOSED_LL',
    reason: 'A verified enacted occurrence participates in versioned native ALLOW/DENY distinctions with independently recovered accounts.',
    disclosure: {
      records: [{ ref, record: {
        kind: 'quadrant', context: request.context as SituatedContext,
        disclosure_contract: QUADRANT_DISCLOSURE_CONTRACT, result: 'QUADRANT_POSITION',
        disclosure: 'LL', coordinates: QUADRANT_COORDINATES.LL,
        content_ref: execution.referent_id, characterization_ref: receipt.referent_id,
        conditions_ref: execution.referent_id,
        fidelity: { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'RELIED_FOR_DECLARED_USE',
          evidence_refs: evidenceRefs, warrant_ref: receipt.referent_id,
          currentness_ref: basis },
      }}],
      account_editions: [protocol, execution, receipt].map(e => ({ ref: e.referent_id, digest: e.digest })),
      changes: [],
      sufficiency: { inquiry_basis_ref: basis, assessment_ref: `${SEMANTIC_PROTOCOL_PRODUCER}:${verified.verifier_ref}`,
        satisfied: false, unresolved_refs: ['quadrant:UL', 'quadrant:UR', 'quadrant:LR'] },
    },
  };
}
