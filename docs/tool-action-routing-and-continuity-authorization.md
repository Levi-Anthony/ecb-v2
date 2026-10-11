STATUS: GOVERNING OPERATIONAL PROFILE
DISPOSITION: ACTIVE
AUTHORITY: Principal commission captured in Greenfield v2 BRAIN thought 2a315af0-0ed6-44c8-bed1-b34d7b4c3d02
SCOPE: ECOS tool-action routing, BRAIN-first continuity, Linear downstream mutation envelope

# Tool Action Routing and Continuity Authorization

**Date:** 6 October 2026, America/Phoenix

## Purpose

Remove false tool friction without broadening authority.

This profile separates four questions that must not collapse:

1. **Destination** — which system may receive information.
2. **Action class** — what kind of effect is being attempted.
3. **Commission** — whether the current Principal instruction authorizes that effect class.
4. **Standing** — what authority, warrant, or currentness the written result itself carries.

A connected tool, accessible destination, successful write, or repeated use does not confer standing or broader mutation authority.

## BRAIN-first continuity rule

For commissioned ECOS continuity, preservation, reconciliation, or propagation work:

1. capture the governing instruction, material finding, or continuity packet in **Greenfield v2 BRAIN** first when that capture path is available;
2. preserve the returned durable receipt / Thought identity;
3. propagate only the downstream effects warranted by the current commission;
4. read back and verify consequential downstream writes;
5. if first-class capture is unavailable, fail visibly and preserve an exact reentry condition rather than silently reversing source priority or claiming completed preservation.

BRAIN-first is a custody and routing rule. It does not make BRAIN content governing merely by possession.

**Managed documents — Principal direction, 11 October 2026.** Real ECOS documents must live in and be managed by Greenfield, with accountable ownership, current standing and recoverable source/edition pointers. Greenfield v2 BRAIN is first-class custody; existing owning human document surfaces carry the reader-facing view. Repository files serve the managed implementation/source role. Library documents may be optional copies, but a Library or sandbox Markdown download must not be the sole access path. The Principal reports that Library Markdown downloads do not work in the mobile chat app; return a readable managed-document link. Preserve this direction in Greenfield custody and propagate it with current document work. Source: BRAIN `c73c3209-2f9a-49b1-9698-30a43ca66304`.

## Standing Linear destination authorization

The Principal has explicitly authorized **Linear as a downstream ECOS continuity destination**, with Greenfield v2 BRAIN remaining the first-class capture destination.

Within an already commissioned continuity, reconciliation, or propagation operation, the following Linear actions may proceed without a separate destination-confirmation round:

- append comments to existing relevant ECOS issues;
- add continuity notices or bounded content updates to existing ECOS documents;
- update existing continuity/tracking records;
- propagate source, receipt, standing, reentry, dependency, and verification pointers;
- read back and verify those mutations.

The authorization above is an **action envelope**, not unrestricted Linear control.

The following remain separately gated unless the active commission explicitly includes them:

- create a new ECO issue or other new governance object;
- change issue workflow state or phase status;
- delete or archive content;
- reassign ownership or assignee;
- change priority, due date, project/cycle allocation, or other coordination commitments;
- make or encode a new governance/authority commitment;
- perform another destructive or structurally consequential mutation not required by the commissioned continuity operation.

## Action classes

Before dispatch, classify the intended effect using the narrowest truthful class.

### A. Capture / preserve

Examples: BRAIN Thought capture, source custody, immutable receipt preservation.

Default: proceed when capture is within the current work commission and the destination is already authorized.

### B. Continuity propagation

Examples: existing Linear issue comment, existing tracking-document update, reentry/source pointer propagation.

Default: proceed under the standing Linear envelope when the parent continuity/reconciliation commission is active.

### C. Operational transition

Examples: issue-state transition, activation/deactivation, disposition transition, assignment/priority changes.

Default: require explicit authorization in the active commission or an independently governing route that already grants it.

### D. Governance / destructive mutation

Examples: deletion, authority-policy change, ownership transfer, creation of a new governing object whose existence itself changes coordination or standing.

Default: require explicit current authorization. Possession of credentials or destination authorization is insufficient.

When an action contains effects from more than one class, use the highest-consequence class.

## Permission-layer rule

Do not broaden ChatGPT plugin/app permissions merely because an authorized action failed.

Before changing permissions, identify the exact failing layer:

- advertised tool schema / argument validation;
- connector reflection or cache;
- MCP server authorization/validation;
- ChatGPT app permission/action review;
- workspace/admin restriction;
- downstream application authorization.

Broaden permissions only when the demonstrated blocker is actually the permission layer and the broader permission is necessary for the intended action.

Current disposition: retain the inherited **Allow low-risk actions** setting for both ECB-v2-BRAIN and Linear. Both ordinary BRAIN capture and authorized Linear continuity writes have succeeded under this setting.

## ECB-v2-BRAIN capture contract — current 11 October 2026

**Current contract `ecb-v2-capture/0.5.3` (verified on the actual connected consumer):** `content` and `source` are required. `operation_id` is *optional*, preferred when the consumer exposes it. **If the invoking client cannot send `operation_id`, supply an explicit stable `captured_at` timestamp**. The server derives a deterministic UUIDv8 from authenticated client identity, exact source/content, and the normalized timestamp. Neither an arbitrary new timestamp per retry nor a different source/content is the same logical operation. If both identity inputs are absent, the server correctly fails with `capture_operation_identity_required` before persistence.

Current connected ChatGPT BRAIN tool exposure omits `operation_id` but **does accept `captured_at`**. The ordinary worker should capture once with an actual, retained event timestamp, preserve the returned operation and Thought identifiers, and exact-fetch/read back. If acknowledgement is lost, replay with **identical content/source/captured_at**, not a newly generated timestamp. Avoid presenting the missing field as a persistent capture blocker or a reason for app-permission changes. A separate authorized provider/worker remit is still needed for trusted semantic circulation; ordinary Thought custody does not grant semantic standing.

**Hosted observation, 11 October:** unchanged app permissions; a `capture_thought` request using `captured_at=2026-10-11T07:48:38.344Z` succeeded with operation `4eddd1ff-de6c-83b0-86d3-5b4ad2310968` and Thought `974057e6-917c-4888-8a94-cb7ff1dde689`; exact `fetch` returned the retained content and source; identical replay reported `replayed=true` and the same IDs. This is a **real connected-consumer custody/idempotency receipt**, not proof of semantic-circulation deployment, generalized client capability, or permission-control availability.

The **6 October observation** that the server required a supplied UUID was true of that earlier tested contract/surface, and the field-injection route succeeded. It is **superseded for today's deployed capture/0.5.3 server**; retain as dated failure history, not as current instructions. Continue to expose the optional `operation_id` in the connected tool definition (ECO-218), because caller control matters for multi-step operation custody. The refreshed consumer need not make it mandatory; match the **live `tools/list` required-fields set**.

The source-contract and fallback already have deterministic tests in `tests/mcp-protocol.test.ts`. Do not weaken database idempotency or actor validation to accommodate a stale consumer snapshot.

## Contract-conformance qualification

For each deployed MCP tool whose write semantics depend on required fields or annotations, qualification must compare:

1. canonical source schema;
2. local `tools/list` schema;
3. deployed `tools/list` schema;
4. connected-consumer reflected schema when that surface is inspectable.

At minimum verify:

- required versus optional fields;
- UUID/enumeration/format constraints;
- `readOnlyHint`, `destructiveHint`, and `idempotentHint`;
- server/tool contract version marker;
- deployed commit/version identity.

A mismatch between the live validator and the schema presented to the invoking consumer is **contract-degraded**, even when knowledgeable callers can manually supply the hidden field.

## Connected-consumer schema snapshot

OpenAI's current custom-MCP app behavior freezes the approved tool/input snapshot in ChatGPT. Later MCP-server changes do **not** automatically update that connected-consumer schema.

Therefore a live-server / connected-consumer mismatch is repaired at the app-approval surface, not by weakening the server contract:

1. an authorized workspace admin/owner opens the custom app's action controls;
2. use **Refresh** to pull changed actions/definitions where that control is available;
3. review the diff and publish/approve the updated action definition;
4. if the workspace/app state does not support updating the published app, recreate and republish the custom app against the same trusted MCP endpoint;
5. verify a fresh chat sees the **actual current** schema: `content` and `source` required, optional `operation_id: UUID`, optional `captured_at: ISO timestamp` with documented identity fallback, tool annotations, and the current contract version.

Until that human-only authenticated UI step is completed, the current consumer may still preserve safely through the **verified stable-`captured_at` fallback**. The reflected-schema mismatch remains **contract-degraded** for callers needing direct operation-ID control; it is not itself a blanket write prohibition.

BRAIN receipt for this exact platform finding: `f656fd8f-73f0-433b-89ab-c11a87d360cd`.

## Known non-blocking platform defect

An attempted app-specific ChatGPT permission update returned `404 Action not found`.

Current disposition: record as non-blocking platform/tooling evidence. Do not make it an ECOS critical-path dependency while the existing permission mode permits the authorized actions. Reopen only if an otherwise valid, currently authorized operation is demonstrably blocked by the permission layer.

## Recurring cross-worker friction — route before asking the Principal (11 October 2026)

**Principal direction:** Multiple workers have repeated the same connector and permission-navigation friction. Resolve it at the shared worker/consumer boundary rather than forcing one person through settings on every session. This is a refinement of this **existing** profile, not a new permission schema, issue, primitive, or release gate. ECOS workers operating from a repo source should read this document through `AGENTS.md` and `docs/worker-entry-evidence-discovery.md` **before recommending a connector permission or UI intervention**. Consumer-delivery obligations remain ECO-156/ECO-219; connector reflection remains ECO-218; toolscape observations remain ECO-155.

**Classify a failure by the rejecting component, not by the fact that a tool call failed:**

| Evidence/fingerprint | Local disposition and next action | Must not infer |
| --- | --- | --- |
| Connected `capture_thought` lacks `operation_id` | Use the proven stable-`captured_at` identity route; fetch; identical replay. ECO-218 owns cached action-schema refresh and genuine fresh-chat conformance. | That BRAIN capture is unavailable or app permissions need broadening |
| `capture_operation_identity_required` | Supply one stable event timestamp or explicit operation UUID where exposed. If still rejected, inspect authenticated actor/contract surface and route exact error to ECO-218. | Authorization to generate a different ID/timestamp on every retry |
| `404 Action not found` on ChatGPT's `update_app_permissions` control | **Control-plane action absent.** Record the exact tool/action and continue permitted work with inherited permissions. Only revisit settings when independently proven to be the rejecting layer. | A Supabase/Linear/BRAIN connection failure or need to navigate inaccessible menus |
| `This tool call was blocked by OpenAI's safety checks` before provider execution | **Platform pre-invocation denial**; do not call it a PostgreSQL permission error, MCP validation result or downstream failed mutation. Preserve tool name, intended effect, exact error and receiving work; continue unaffected read-only/authorized steps. Route the affected change to the existing reviewed/authorized execution path, never a disguised payload or broader permission experiment. | That production received the query; that a different spelling is authorized to bypass the guard |
| MCP `401/403`, missing OAuth scope, stale consent or `eco213_remit_denied` | Recover the exact rejecting server/client identity, grant, work/remit and current version; use the designated owner and authenticated approval path. Do not edit credentials or widen effect scope as a diagnostic. | That ChatGPT's global plugin permission is at fault |
| SQL/HTTP validation error from an executed request | Diagnose the contract or query with exact current schema and idempotent operation identity, repair only the proved defect, then read back. | That a green CI, Vercel READY, or an SDK reconnect pays hosted consumer use |

**Principled escalation rule:** A worker should not send the Principal to account menus unless it can name the relevant control, show evidence the exact operation was denied there, and identify the human-only decision the platform actually exposes. The screenshots from iOS and mobile Safari in this incident exposed no plugin permission selector; do not repeat instructions to hunt for it. Maintain default `Allow low-risk actions` unless a separately witnessed access decision warrants change.

**An actionable failure return** records the intended action, tool/schema/edition, exact error and stage, available evidence (did the provider receive it?), bounded effect already achieved, independently useful work completed, relevant owning ECO, and the next exact authorized retry/readback or human-only hinge. A misleading generic “tools blocked” report is not acceptable. A platform refusal may limit that effect; it does **not** cancel source analysis, repo work, validated documentation, or other independent obligations.

**Qualification**: the current BRAIN path has completed a real capture/fetch/identical-replay test under unchanged permissions. Full cross-worker correction requires (a) a visible worker-entry pointer, (b) ECO-218 actual connected action-schema refresh or a verified stable fallback per consumer, (c) ECO-219/156 projection into each applicable worker bootstrap with a cold-reader receipt, and (d) two fresh-consumer runs which do not misdiagnose a missing schema field as an app-permission change. Repo instructions alone do not establish that every ChatGPT, Claude, or Codex worker loaded the profile. Mark individual consumers **UNQUALIFIED** until observed.

### Custody for the 11 October correction

BRAIN Thought `974057e6-917c-4888-8a94-cb7ff1dde689` is the first-class Principal correction; the corresponding replay operation is `4eddd1ff-de6c-83b0-86d3-5b4ad2310968`. Preserve links in existing ECO-155/ECO-218/ECO-219 owner surfaces. Do not open a parallel tool-safety initiative.

## Reentry

When tool friction recurs:

1. identify the intended action class;
2. recover the active commission and destination envelope;
3. locate the exact rejecting layer;
4. repair the narrowest demonstrated defect;
5. do not compensate for a schema/contract defect by granting broader permission;
6. preserve the result in BRAIN first and route owning deltas to the relevant continuity surfaces.
