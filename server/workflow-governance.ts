import type { McpServer, ScopeChallengeHandler } from '@modelcontextprotocol/server';
import { z } from 'zod';

export const workflowContract = 'ecos:workflow-governance:1.0.0';
const id = z.string().uuid();
const text = z.string().trim().min(1).max(20000);
const stage = z.enum(['plan','implement','verify','deploy','validate','metabolize','close']);
export const obligationSchema = z.strictObject({
  id, stage, requirement: text, outcome_consequence: text, criterion: text,
  method_ref: text, validator_actor: text, owner_route: text, independent: z.boolean().optional(),
});
const identity = { operation_id: id, cycle_id: id };
const base = { ...identity, expected_version: z.number().int().min(1) };
const decision = { ...base, action: z.literal('decide'), proposal_id: id,
  reason: text, affected_old_support: text, destination_obligations: text };
export const workflowCommandSchema = z.discriminatedUnion('action', [
  z.strictObject({ ...identity, action: z.literal('create'), commission_id: id,
    focal_ref: id, containing_ref: id, parent_id: id.optional(), parent_obligation_id: id.optional(),
    owner_issue: text, outcome: text, orientation: text, boundary: text, acceptance: text, edition: text,
    obligations: z.array(obligationSchema).min(7).max(200),
  }).refine(x => Boolean(x.parent_id) === Boolean(x.parent_obligation_id), 'Parent cycle and return obligation must be bound together.'),
  z.strictObject({ ...base, action: z.literal('result'), obligation_id: id, edition: text,
    status: z.enum(['PASS','FAIL','UNKNOWN']), method_ref: text, executor_actor: text, observation: text,
    evidence: z.array(z.strictObject({ ref: id, digest: z.string().regex(/^[a-f0-9]{64}$/) })).max(50),
    valid_until: z.string().datetime({ offset: true }).optional(),
  }),
  z.strictObject({ ...base, action: z.literal('advance') }),
  z.strictObject({ ...base, action: z.literal('propose'), proposal_id: id, affected_obligation_id: id,
    title: text, salience: text, significance: text, importance: text, decision_consequence: text,
    omission_failure: text, source_ref: id,
  }),
  z.strictObject({ ...decision, disposition: z.enum(['REQUIRED','FUTURE','REJECTED','DUPLICATE']),
    obligation: obligationSchema.optional(), owner_route: text.optional(), reentry_trigger: text.optional(),
    no_current_acceptance_effect: text.optional(), duplicate_obligation_id: id.optional(),
  }).superRefine((x,ctx) => {
    if (x.disposition === 'REQUIRED' && !x.obligation) ctx.addIssue({code:'custom',message:'A required discovery needs a bounded obligation.'});
    if (x.disposition === 'FUTURE' && (!x.owner_route || !x.reentry_trigger || !x.no_current_acceptance_effect))
      ctx.addIssue({code:'custom',message:'A future opportunity needs custody, a trigger and its effect on current acceptance.'});
    if (x.disposition === 'DUPLICATE' && !x.duplicate_obligation_id) ctx.addIssue({code:'custom',message:'A duplicate needs the actual obligation identity.'});
    if (x.disposition !== 'REQUIRED' && x.obligation) ctx.addIssue({code:'custom',message:'Only explicit REQUIRED admission may add work.'});
  }),
  z.strictObject({ ...base, action: z.literal('reopen'), reason: text, edition: text }),
]);
export type WorkflowCommand = z.infer<typeof workflowCommandSchema>;
export type WorkflowPorts = {
  inspect: (cycleId?: string) => Promise<unknown>;
  command: (action: string, payload: Record<string,unknown>, actor: string) => Promise<unknown>;
};
export async function executeWorkflow(input: unknown, actor: string, ports: WorkflowPorts) {
  if (!actor?.trim()) throw new Error('workflow_actor_missing');
  const parsed = workflowCommandSchema.parse(input);
  const { action, ...payload } = parsed;
  return ports.command(action,payload,actor);
}
export function workflowError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const code = /workflow_[a-z_]+/.exec(message)?.[0] ?? 'workflow_unavailable';
  return { error: code, recovery: 'Inspect the current cycle; resolve only the named missing evidence, decision, authority or version before retrying.',
    contract: workflowContract };
}
export function registerWorkflowTools(server: McpServer, ports: WorkflowPorts,
  check: (capability: 'recover'|'transition') => ScopeChallengeHandler) {
  server.registerTool('workflow_inspect', {
    title: 'Inspect Production Cycle',
    description: `${workflowContract}. Recover the containing outcome, current stage, required unpaid obligations, child returns, scope decisions, proof history, observer health and exact next action. Zero balance does not follow from local PASS or deployment.`,
    annotations: {readOnlyHint:true,destructiveHint:false,openWorldHint:false},
    scopeChallenge: check('recover'), inputSchema:{cycle_id:id.optional()},
  }, async ({cycle_id}) => {
    try { return {content:[{type:'text' as const,text:JSON.stringify(await ports.inspect(cycle_id))}]}; }
    catch(error){return {isError:true,content:[{type:'text' as const,text:JSON.stringify(workflowError(error))}]};}
  });
  server.registerTool('workflow_command', {
    title: 'Govern Production Cycle',
    description: `${workflowContract}. Apply one typed, atomic, edition-bound workflow operation under an already registered Principal commission. Requires stable operation identity; updates require expected_version. Actor comes from authentication. Required work remains debt until source-bound results and the full cycle discharge it. Does not activate external workers or confer authority.`,
    annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},
    scopeChallenge:check('transition'), inputSchema:{command:workflowCommandSchema},
  }, async ({command},context) => {
    try{return {content:[{type:'text' as const,text:JSON.stringify(await executeWorkflow(command,context.http?.authInfo?.clientId ?? '',ports))}]};}
    catch(error){return {isError:true,content:[{type:'text' as const,text:JSON.stringify(workflowError(error))}]};}
  });
}
