import { createHash } from 'node:crypto';
import { z } from 'zod';

export const COMMISSION_CONTRACT = 'ecos:current-commission:1.0.0';
export const commissionInstructions = 'Before consequential ECOS product or engineering work, call get_current_commission (no arguments) to recover the current governing decisions and next action. Apply its source, standing and authority limits. If unavailable, report the exact recovery gap and continue only supported work. Custody and deployment are not proof of consumer reception; this guidance does not grant action permission.';

export const commissionProjectionSchema = z.strictObject({
  contract: z.literal(COMMISSION_CONTRACT),
  source: z.strictObject({ artifact_id: z.string().uuid(), sha256: z.string().regex(/^[a-f0-9]{64}$/), edition: z.string().min(1) }),
  authority_refs: z.array(z.string().uuid()).min(1),
  standing: z.literal('PRINCIPAL_DIRECTED_DISTRIBUTION'),
  summary: z.string().min(1).max(8000),
  next_action: z.string().min(1).max(2000),
  limitations: z.string().min(1).max(2000),
});
export type CommissionProjection = z.infer<typeof commissionProjectionSchema>;
export type CommissionAnchor = {
  id: string;
  disposition: { revision_id: string; state: string };
  projection: { artifact_id: string; kind: 'ACTION' | 'HOLD'; content: string };
};
export type CommissionPorts = {
  fetchThought(id: string): Promise<CommissionAnchor | null>;
  fetchArtifact(id: string): Promise<{ id: string; content: string } | null>;
};
export const commissionDigest = (content: string) => createHash('sha256').update(content, 'utf8').digest('hex');

export class CommissionUnavailable extends Error {
  constructor(public readonly code: string) { super(code); }
}

/** No discovery, representation repair, persistent writes or process-global current-head cache. */
export async function getCurrentCommission(anchorId: string | undefined, ports: CommissionPorts) {
  if (!anchorId || !z.string().uuid().safeParse(anchorId).success) throw new CommissionUnavailable('commission_anchor_unconfigured');
  let anchor: CommissionAnchor | null;
  try { anchor = await ports.fetchThought(anchorId); }
  catch { throw new CommissionUnavailable('commission_anchor_unavailable'); }
  if (!anchor || anchor.id !== anchorId || !z.string().uuid().safeParse(anchor.disposition?.revision_id).success
    || !z.string().uuid().safeParse(anchor.projection?.artifact_id).success
    || anchor.disposition.state !== 'current_commission' || anchor.projection?.kind !== 'ACTION')
    throw new CommissionUnavailable('commission_head_unqualified');
  let projection: CommissionProjection;
  try { projection = commissionProjectionSchema.parse(JSON.parse(anchor.projection.content)); }
  catch { throw new CommissionUnavailable('commission_projection_invalid'); }
  let source: { id: string; content: string } | null;
  try { source = await ports.fetchArtifact(projection.source.artifact_id); }
  catch { throw new CommissionUnavailable('commission_source_unavailable'); }
  if (!source || source.id !== projection.source.artifact_id) throw new CommissionUnavailable('commission_source_unavailable');
  if (commissionDigest(source.content) !== projection.source.sha256
    || !source.content.split('\n').includes(`Edition: ${projection.source.edition}`))
    throw new CommissionUnavailable('commission_source_binding_mismatch');
  let exit: CommissionAnchor | null;
  try { exit = await ports.fetchThought(anchorId); }
  catch { throw new CommissionUnavailable('commission_head_revalidation_failed'); }
  if (!exit || exit.id !== anchor.id || exit.disposition?.revision_id !== anchor.disposition.revision_id
    || exit.disposition.state !== anchor.disposition.state || exit.projection?.artifact_id !== anchor.projection.artifact_id
    || exit.projection.kind !== anchor.projection.kind || exit.projection.content !== anchor.projection.content)
    throw new CommissionUnavailable('commission_head_changed');
  return { ...projection, anchor_id: anchorId, revision_id: anchor.disposition.revision_id,
    projection_artifact_id: anchor.projection.artifact_id, source_content: source.content, selection: 'CURRENT_AT_READ_REVALIDATION',
    qualification: 'Source bytes and current-head binding checked; authorized adoption does not prove empirical success or consumer uptake.' };
}

export function commissionFailure(error: unknown) {
  return { error: error instanceof CommissionUnavailable ? error.code : 'commission_unavailable',
    recovery: 'Recover the admitted distribution anchor, its current disposition and exact bound source through authorized runtime operations; then retry. Do not substitute search ranking or a historical edition.',
    contract: COMMISSION_CONTRACT };
}

/** Prepared distribution artifact, not a new governing source. Source bytes stay in the existing Artifact. */
export function prepareCommissionProjection(sourceContent: string, artifactId: string, authorityRefs: string[]): CommissionProjection {
  const edition = sourceContent.split('\n').find(line => line.startsWith('Edition: '))?.slice(9);
  return commissionProjectionSchema.parse({ contract: COMMISSION_CONTRACT,
    source: { artifact_id: artifactId, sha256: commissionDigest(sourceContent), edition }, authority_refs: authorityRefs,
    standing: 'PRINCIPAL_DIRECTED_DISTRIBUTION',
    summary: 'ECOS is a real personal application for the Principal. Mobile-first web is ratified; preserve native-app optionality and keep business logic portable. Deliver one complete personal journey: capture, recover current source-qualified context, authorize an action, execute in its service, verify the outcome and resume from current state. Assess the installed ecb_workflow substrate for native work/project views; Linear remains optional internal coordination. The Principal owns product/theory acceptance and serves as physical hands, eyes and ears when explicitly needed; the technical lead chooses and justifies engineering decisions. Greenfield BRAIN owns forward working state; valuable legacy ECB remains source-qualified archival evidence. Authorized ChatGPT, Claude, Codex and future consumers each require real reception qualification. Include accounts, devices, credentials, backups, cost and fallback within the system boundary. Compare architecture by whole-product benefit, cross-cutting leverage and full lifecycle/omission cost; arbitrary minimality is no veto. Distinguish described, code-present, installed, deployed, mechanically verified and actual-use validation. Ground Path requires native predicate checking before reliance and claim-local revocation after contradiction; scoped stipulation and actionable incompleteness do not prove actual facts. Preserve historical sources and qualified unrelated work. Boot v4 remains provisional.',
    next_action: 'Demonstrate an independent newly connected authorized worker recovering and using this commission without a Principal recap. Then deliver the mobile-first complete personal workflow, including a usable native work view and one authorized real service action.',
    limitations: 'Distribution projection of Principal decisions, not independent empirical proof. Repository commits, BRAIN custody and deployment READY do not establish client reception. No destructive migrations, account/credential changes, direct production release or bypass of denied operations is authorized by recovery. Ground Path Shape and test evidence retain their scoped standing.',
  });
}

export type CommissionInstallPorts = CommissionPorts & {
  capture(input: { operationId: string; content: string; source: string; processingMode: 'raw_only' }): Promise<{ thought: { id: string }; disposition: { revision_id: string } }>;
  createArtifact(input: { operationId: string; content: string }): Promise<{ artifact: { id: string; content: string } }>;
  setDisposition(input: { operationId: string; thoughtId: string; expectedRevisionId: string; disposition: string;
    projectionArtifactId: string; projectionKind: 'ACTION' }): Promise<{ disposition: { revision_id: string } }>;
};

/** Explicit operator-only release operation. The read tool never calls this function. No SQL or schema edits. */
export async function installCommissionProjection(projection: CommissionProjection, operations: { capture: string; artifact: string; transition: string },
  ports: CommissionInstallPorts, update?: { anchorId: string; expectedRevisionId: string }) {
  projection = commissionProjectionSchema.parse(projection);
  for (const id of Object.values(operations)) z.string().uuid().parse(id);
  if (new Set(Object.values(operations)).size !== 3) throw new CommissionUnavailable('commission_operation_identity_conflict');
  if (update) { z.string().uuid().parse(update.anchorId); z.string().uuid().parse(update.expectedRevisionId); }
  const source = await ports.fetchArtifact(projection.source.artifact_id);
  if (!source || source.id !== projection.source.artifact_id || commissionDigest(source.content) !== projection.source.sha256
    || !source.content.split('\n').includes(`Edition: ${projection.source.edition}`))
    throw new CommissionUnavailable('commission_source_binding_mismatch');
  const content = JSON.stringify(projection);
  const artifact = (await ports.createArtifact({ operationId: operations.artifact, content })).artifact;
  const readback = await ports.fetchArtifact(artifact.id);
  if (artifact.content !== content || readback?.content !== content || readback.id !== artifact.id)
    throw new CommissionUnavailable('commission_projection_readback_mismatch');
  const anchor = update ?? await ports.capture({ operationId: operations.capture, processingMode: 'raw_only',
    content: 'ECOS current-commission distribution anchor. Its current predecessor-checked disposition selects the operative projection; original capture content does not select an edition.',
    source: 'ecos_current_commission_distribution_anchor' }).then(r => ({ anchorId: r.thought.id, expectedRevisionId: r.disposition.revision_id }));
  const transition = await ports.setDisposition({ operationId: operations.transition, thoughtId: anchor.anchorId,
    expectedRevisionId: anchor.expectedRevisionId, disposition: 'current_commission', projectionArtifactId: artifact.id, projectionKind: 'ACTION' });
  const current = await getCurrentCommission(anchor.anchorId, ports);
  if (current.revision_id !== transition.disposition.revision_id || current.projection_artifact_id !== artifact.id)
    throw new CommissionUnavailable('commission_installation_superseded');
  return current;
}
