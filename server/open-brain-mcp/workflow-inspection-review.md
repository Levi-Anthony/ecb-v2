# Distinct workflow inspection review receipt

Scope: commissioned Thought 82624227-44b0-40ce-b544-f86e57e53745; independent reviewer context /root/review_workflow_reader. Read-only source/test review; no release, credentials, database operations, or external-record writes.

Reviewed working tree fix/eco-219-edge-commission-exposure, HEAD 28ea84c209e4057c1261e6bc05dbbfc082514903, against origin/main 6727ef52159b76affbe0f68049aaf396363451b1 and original PR108 c49a713f3db650c3601d1055d9eaeff7f5331da2. Review conclusions apply only to hashes below.

Verdict: no blocking code defect found; local source package suitable for authorized exposure qualification. Deployment, live SQL identity/grants, managed discovery, client invocation and native receiving incorporation are NOT established by this review.

Findings:
- Edge uses the existing bearer check before MCP discovery/call dispatch. Reader obtains only ecb_workflow_inspect through the existing anon client with x-ecb-runtime-key; no new controller or identity enrollment.
- No Edge workflow_command tool or command port added; tests assert absent command discovery. Shared Node adapter retains its existing recover/transition scope boundary and command functionality.
- Default omitted cycle maps to p_cycle_id:null; root/child UUIDs map unaltered. Repeated calls dispatch anew; no cache. SQL default is roots (all roots in source), not inferred current-cycle selection.
- Denied/missing RPC, null result and transport throw sanitize to workflow_unavailable. Unconfigured port returns workflow_recover_denied. Arbitrary workflow_* provider text does not escape the exact allowlist.
- SQL source: facade calls ecb11.assert_runtime_key before ecb_workflow.inspect; inspect is STABLE and performs SELECT-only assembly including current evidence-digest paid checks from the later currentness migration. Private workflow tables have RLS and revoked role access. Source grants execute for BOTH existing facade functions to anon/authenticated; adapter read-only behavior is not a database read-only credential guarantee. No live grants proved.
- Description explicitly limits returns to invocation snapshots and disclaims perpetual currentness/authority; data is forwarded without turning debt or observer UNKNOWN into PASS.
- Shared Node/Edge contract adequately centralizes name/version, discovery description, annotations and error allowlist. Runtime factories remain distinct by platform and are not falsely claimed identical.

Resolved finding: Edge reader now accepts RFC nil/max UUIDs consistently with the Zod/Node schema, with a dedicated MCP dispatch regression. No unresolved code findings.

Commands/results:
1. cd server/open-brain-mcp; deno test --allow-env --allow-net index.test.ts current-commission.test.ts workflow-inspection.test.ts: PASS 20/20 originally; final exact CI command `deno test --no-check --frozen --config server/open-brain-mcp/deno.json --node-modules-dir=auto --allow-net --allow-env server/open-brain-mcp/` PASS 21/21 (12 ingress/runtime + 4 commission + 5 workflow).
2. npm run typecheck:workflow: PASS.
3. npm run test:workflow: PASS 3/3.
4. Independent deno eval importing createWorkflowReader, workflowInspectFailure and installed Zod: omitted UUID dispatched null; uppercase v4 dispatched unchanged; nil/max accepted by Zod but rejected before RPC; caller-chosen workflow_recover_denied suffix sanitized to workflow_unavailable; exactly 2 RPC invocations for 4 inputs.
5. Inspected diff to origin/main and c49a713 plus installed controller/currentness SQL. No live management attempt; parent reports -32600 denial. No workaround/bypass attempted.

Limits: mocks prove adapter behavior, not deployed controller identity/schema, installed grants, actual bearer availability, managed catalog refresh, or hosted end-to-end/native effects. Those remain separate release/client/native receipts.

Final expanded review:
- Reran npm run typecheck:workflow and npm run test:workflow: PASS; npm run test:mcp PASS 34/34. Catalog expectation correctly adds workflow_inspect to idempotent tools; existing command annotations remain untouched.
- .github/workflows/eco-218-oauth.yml now triggers on Edge-only PR changes, workflow governance source/tests, and runs the full Edge test directory plus Node workflow typecheck/tests. The exact Edge CI command passes locally; no hosted Actions result asserted.
- vercel.json adds only this candidate branch to existing deploymentEnabled:false controls. This is source configuration suppressing that branch's Vercel Git deployments, not proof of platform execution or suppression on main.
- README activation package correctly separates source read-only audit from live definition/grant proof; identifies management -32600 as action-layer denial rather than DB result; preserves existing credential route, prior payload rollback, fresh client discovery/invocation and BRAIN-first receipts. No live success claimed.
- Release authorization wording should be read against the actual recovered commission: obtain any still-required authorization for the exact effect, rather than re-requesting authorization already granted. Review does not independently establish that commission's release scope.

SHA256:
40155ea423323f72bea10b9a94c9a8faefe81793a7474e1598abb2bc97e572b3  server/open-brain-mcp/index.ts
af10fcfce47056df07df0816a63cef3b703d5041c23da680473321952bd3000e  server/open-brain-mcp/workflow-inspection.ts
cc24925af308906f5866d5df85faed43d8bcb73b71d2208357f23995fb98156f  server/open-brain-mcp/workflow-inspection.test.ts
300fb216e86f2edbf49be13397e2486de6846450d7694e0175f1278521079304  server/open-brain-mcp/index.test.ts
c493785b42a512ea4aa721cfd5e283b997d990e17df382e6ee94095ef21f6b7a  server/workflow-governance.ts
a51e44a14e76841ee052dff3fe81f506cbea1e209db5938429c847a046f27145  tests/mcp-protocol.test.ts
7ea4eadbbb5b2320fe733249421c669b377bbd3a8581141ed6ecdfa5e825663c  .github/workflows/eco-218-oauth.yml
045e094edbba1dcb255bcaa20242592218a16d918d133c7563622cc712da25ef  vercel.json
299246168f129894bd82e1131cc0773e972ac9f496664fb3e9715397450798cc  server/open-brain-mcp/README.md
e764e21bc9c42090bdf41ed92ee4b335d6df7a15e74a694ed534eb3be1fe0e0e  sql/migrations/20261010221105_workflow_governance.sql
a35ed17e02c2a1978954494cf1c932a3da349a875f659a64284185f020d1ba0b  sql/migrations/20261010221941_workflow_currentness.sql
