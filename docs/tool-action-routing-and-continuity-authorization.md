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

## ECB-v2-BRAIN capture contract

Canonical and deployed MCP behavior requires a caller-supplied `operation_id` UUID — a Universally Unique Identifier used as the stable idempotency identity for the operation.

Required ordinary capture contract:

- `operation_id: UUID`
- `content: nonblank string`
- `source: nonblank string`

Optional fields currently include:

- `captured_at`
- `producer_context`
- `parent_receipt_id`
- `processing_mode`

The October 6 tool-friction incident demonstrated a consumer-reflection defect: ChatGPT exposed a stale/narrower capture schema omitting `operation_id`, while the live MCP validator required it. Supplying the live required UUID succeeded without changing permissions.

**Required repair:** the tool-facing schema presented to consumers must match the deployed server contract. Do not remove caller-controlled operation identity merely to accommodate a stale consumer schema.

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

## Known non-blocking platform defect

An attempted app-specific ChatGPT permission update returned `404 Action not found`.

Current disposition: record as non-blocking platform/tooling evidence. Do not make it an ECOS critical-path dependency while the existing permission mode permits the authorized actions. Reopen only if an otherwise valid, currently authorized operation is demonstrably blocked by the permission layer.

## Reentry

When tool friction recurs:

1. identify the intended action class;
2. recover the active commission and destination envelope;
3. locate the exact rejecting layer;
4. repair the narrowest demonstrated defect;
5. do not compensate for a schema/contract defect by granting broader permission;
6. preserve the result in BRAIN first and route owning deltas to the relevant continuity surfaces.
