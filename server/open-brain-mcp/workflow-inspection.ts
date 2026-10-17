/** Shared read contract for the Node and managed Edge adapters. No command port. */
export const workflowContract = "ecos:workflow-governance:1.0.0";
export const workflowInspectDescription =
  `${workflowContract}. Recover the containing outcome, current stage, required unpaid obligations, child returns, scope decisions, proof history, observer health and exact next action. Omit cycle_id to inspect native roots. Returns a snapshot at invocation, not perpetual currentness or authorization to act. Zero balance does not follow from local PASS or deployment.`;
export const workflowInspectAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
export type WorkflowReader = {
  inspect: (cycleId?: string) => Promise<unknown>;
};
export type WorkflowRpc = (
  name: string,
  args: Record<string, unknown>,
) => Promise<{ data: unknown; error: unknown }>;

/** Uses only the installed runtime-key-guarded facade, never internal SQL. */
export function createWorkflowReader(rpc: WorkflowRpc): WorkflowReader {
  return {
    async inspect(cycleId) {
      if (
        cycleId !== undefined &&
        !/^(?:00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff|[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i
          .test(cycleId)
      ) {
        throw new Error("workflow_invalid_cycle_id");
      }
      const { data, error } = await rpc("ecb_workflow_inspect", {
        p_cycle_id: cycleId ?? null,
      });
      if (error || data === null || data === undefined) {
        throw new Error(
          "workflow_unavailable",
        );
      }
      return data;
    },
  };
}

/** Never reflect provider messages, keys, SQL or caller-chosen error suffixes. */
export function workflowInspectFailure(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code = message === "workflow_invalid_cycle_id" ||
      message === "workflow_recover_denied"
    ? message
    : "workflow_unavailable";
  return {
    error: code,
    contract: workflowContract,
    recovery:
      "Recover through the existing authorized connection; preserve this failure and retry inspection after its access/runtime dependency is resolved. No current cycle state or paid debt is established by this failure.",
  };
}
