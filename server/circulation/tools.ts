import type { McpServer, ScopeChallengeHandler } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { differentiation, composition, validateOutput } from './profile.js';

type Capability = 'recover' | 'preserve' | 'transition';
export type CirculationDependencies = {
  check: (capability: Capability) => ScopeChallengeHandler;
  dispatch: (operation: string, payload: Record<string, unknown>, actor: string) => Promise<unknown>;
  embed: (text: string) => Promise<number[]>;
};
const id = z.string().uuid();
const text = z.string().min(1);
const object = z.record(z.string(), z.unknown());
const operation = { operation_id: id, work_id: id, mechanism_id: id };
const workAccount = z.strictObject({
  id,focal_id:id,whole_id:id.nullable(),remit_revision_id:id,predecessor_id:id.nullable(),
  point_of_view:text,noticed_contrast:text,boundary:text,orientation:text,frame:text,question:text,intended_use:text,
  process_coordinate:object,return_route:text,parts:z.array(z.strictObject({referent_id:id,role:text})),reseating_reason:text.optional(),
});
export const contracts = {
  discover_capability: { capability: 'recover', description: 'Discover circulation recipes, exact operation contract, work/remit/currentness and visible failure. Discovery grants no effect authority.', schema: { work_id: id.optional() } },
  recover_work: { capability: 'recover', description: 'Reconstitute situated work, remit, mechanisms, processing, current-use basis, corpus coverage and observer expiry.', schema: { work_id: id.optional() } },
  inspect_processing: { capability: 'recover', description: 'Inspect admitted/pending/failed work, attempts, outcomes and independent liveness evidence.', schema: { work_id: id.optional() } },
  fetch_referent: { capability: 'recover', description: 'Fetch exact native circulation/Thought/Artifact/Claim identity, editions and evidence. Fetch before reliance.', schema: { referent_id: id } },
  traverse_structure: { capability: 'recover', description: 'Traverse typed encountered source, constituent, lineage and assertion neighborhoods. Encountered graph is not complete destination discovery.', schema: { referent_id: id } },
  search_structure: { capability: 'recover', description: 'Discover derived structure with lexical/vector candidates and declared coverage/degradation. Scores confer no authority.', schema: { query: text, work_id: id.optional(), limit: z.number().int().min(1).max(50).default(10) } },
  request_processing: { capability: 'transition', description: 'Commission source processing under an exact active remit/mechanism. Optional immutable work account permits changed purpose/reinspection without overwriting the prior seat.', schema: { operation_id: id, work_id: id.optional(), work: workAccount.optional(), source_id: id, mechanism_id: id, predecessor_activity_id: id.optional() } },
  assimilate_corpus: { capability: 'transition', description: 'Preserve one frozen manifest member and complete legacy envelope/both representations, then atomically admit processing. Import does not adopt legacy authority.', schema: { ...operation, corpus_id: id, envelope: object, envelope_bytes: text, envelope_digest: z.string().regex(/^[0-9a-f]{64}$/) } },
  record_derivation: { capability: 'preserve', description: 'Preserve a typed differentiation and exact anchors/participants/relations under remit; retain unassessed Claims and continuation separately from source custody.', schema: { ...operation, source_id: id, bundle: differentiation } },
  compose_account: { capability: 'preserve', description: 'Preserve a situated account, exact members/reasons and alternative/repair lineage; current-use requires separate reconciliation.', schema: { ...operation, source_id: id, bundle: composition } },
  reconcile_use: { capability: 'transition', description: 'Bind a use assessment against its exact predecessor, complete declared dependency editions/work epoch, old review AND destination disclosure. Blocking UNKNOWN cannot pass.', schema: { operation_id: id, work_id: id, use_key: text, account_id: id, expected_predecessor_id: id.nullable(), work_epoch: text,
    dependencies:z.array(z.strictObject({subject_id:id,digest:z.string().regex(/^[0-9a-f]{64}$/),work_epoch:text,role:text})).min(1),
    requirements:z.array(z.strictObject({requirement:text,direction:z.enum(['old_dependency','destination_discovery']),blocking:z.boolean(),
      disposition:z.enum(['SATISFIED','UNSATISFIED','UNKNOWN']),basis:object})).min(2), coverage: object, authority_basis: text, checker_basis: object, verdict: z.enum(['SATISFIED', 'UNSATISFIED', 'UNKNOWN']) } },
  record_observation: { capability: 'preserve', description: 'Preserve an explicitly situated observation, measurement or independent reuse. Quantity alone and recurrence grant no standing/currentness.', schema: { operation_id: id, work_id: id, subject_id: id, method_edition: text, result: z.unknown(), time_basis: object, frame: text, resolution: text, purpose: text, conditions: object, unknowns: z.array(text),
    kind: z.enum(['observation', 'measurement', 'independent_reuse', 'reported_outcome', 'repeated_capture']), participants: z.array(z.strictObject({subject_id:id,role:text})), quantity: z.number().optional(), unit: text.optional(), instrument_id: id.optional(), tare: object.optional(), calibration: object.optional(), uncertainty: object.optional() } },
} satisfies Record<string, { capability: Capability; description: string; schema: Record<string, z.ZodType> }>;

export function registerCirculationTools(server: McpServer, deps: CirculationDependencies) {
  for (const [name, contract] of Object.entries(contracts)) {
    server.registerTool(name, {
      description: contract.description, scopeChallenge: deps.check(contract.capability), inputSchema: contract.schema,
      annotations: { readOnlyHint: contract.capability === 'recover', destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async (payload, context) => {
      try {
        const actor = context.http?.authInfo?.clientId;
        if (!actor) throw new Error('actor_missing');
        if (name === 'search_structure') {
          try { (payload as Record<string, unknown>).query_embedding = await deps.embed(String(payload.query)); }
          catch { (payload as Record<string, unknown>).query_embedding = null; }
        }
        if (name === 'record_derivation' || name === 'compose_account') {
          const args = payload as Record<string, unknown>;
          if (name === 'record_derivation') {
            const fetched = await deps.dispatch('fetch_referent', { referent_id: args.source_id }, actor) as { native_records: { native_type: string; record: Record<string, string> }[] };
            const source = fetched.native_records.find(x => x.native_type === 'source_occurrences')?.record;
            if (!source) throw new Error('source_unavailable');
            const carriers = new Map<string, string>();
            for (const carrier of [source.carrier_id, source.original_carrier_id].filter(Boolean)) {
              const f = await deps.dispatch('fetch_referent', { referent_id: carrier }, actor) as { artifact?: { content: string }; thought?: { content: string } };
              const content = f.artifact?.content ?? f.thought?.content;
              if (content === undefined) throw new Error('source_carrier_unavailable');
              carriers.set(carrier, content);
            }
            args.bundle = validateOutput('differentiate', args.bundle, carriers);
          } else args.bundle = validateOutput('compose', args.bundle, new Map());
        }
        let value = await deps.dispatch(name, payload as Record<string, unknown>, actor);
        if (name==='discover_capability'||name==='recover_work') value={
          ...(value as Record<string,unknown>),area:'ECOS circulation',purpose:'trusted capture, cold participation and corpus assimilation',
          operation_contracts:Object.fromEntries(Object.entries(contracts).map(([operation,c])=>[operation,{
            capability:c.capability,description:c.description,input_schema:z.toJSONSchema(z.strictObject(c.schema)),
          }])),
          recipe:['Recover exact work/remit/mechanism and processing status.','Fetch source/output and inspect its basis.',
            'Use the declared operation schema under the active remit.','Inspect propagation, failure, coverage and separate current-use assessment.'],
        };
        return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        const code = /^eco213_[a-z_]+$/.test(message) ? message : 'eco213_operation_failed';
        return { isError: true, content: [{ type: 'text' as const, text: JSON.stringify({ error: code, recovery: 'recover_work / inspect_processing' }) }] };
      }
    });
  }
}
