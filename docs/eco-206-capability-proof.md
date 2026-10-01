STATUS: NON-PRODUCTION PROOF IN PROGRESS — NO PRODUCTION PROMOTION
DISPOSITION: ECO-206 IMPLEMENTATION AND QUALIFICATION EVIDENCE

# Ordinary MCP capability authorization proof

ECO-206 implements the ECO-201 logical RECOVER / PRESERVE / TRANSITION seam on the
six-tool ordinary Model Context Protocol (MCP) server. It leaves the existing
`ECB_BRAIN_KEY_SHA256` credential as an explicit full-ordinary compatibility
credential. The server maps an authenticated credential to verified MCP
`AuthInfo`, then the SDK's per-tool `scopeChallenge` denies an insufficient
grant before the handler and database Remote Procedure Call (RPC) run. The
same server factory continues to serve modern 2026-07-28 and legacy clients.

## Preview credential configuration

`ECB_MCP_CAPABILITY_GRANTS` is an optional server-only JSON array. Each entry
has a SHA-256 hex digest of a separately generated bearer secret, a technical
client identifier, and a nonempty subset of `recover`, `preserve`, `transition`:

```json
[
  {
    "key_sha256": "<64 lowercase hex characters>",
    "client_id": "preview-recovery-client",
    "capabilities": ["recover"]
  }
]
```

Do not store plaintext credentials in source, logs, Linear, or this document.
Keep the raw secret in the authorized client/secret store and the digest in
Preview environment configuration only. Do not set this variable in Production
as part of ECO-206. Invalid configuration, a duplicate digest, or a collision
with the compatibility credential fails closed with HTTP 503. An absent array
preserves compatibility access but cannot prove differentiated Preview access.

The current proof vocabulary maps to `ecb:recover`, `ecb:preserve`, and
`ecb:transition` inside MCP request authorization. These are proof-specific
technical scope strings, not semantic standing or a final OAuth provider API.
There is no authorization server, metadata discovery, token issuance, or
automatic step-up in this bearer realization. An under-granted client gets
HTTP 403 `insufficient_scope`; it must obtain a separately authorized
credential outside this protocol flow. Host behavior for real OAuth step-up,
scope accumulation, token lifetime, and revocation remains a later decision.

## Tool mapping and composed work

| Capability | Tools |
| --- | --- |
| RECOVER | `fetch`, `fetch_artifact`, `search` |
| PRESERVE | `capture_thought`, `create_artifact` |
| TRANSITION | `set_thought_disposition` |

A new shaped projection needs an Artifact from `create_artifact` (PRESERVE)
before `set_thought_disposition` (TRANSITION) can bind it. A transition using
an already existing suitable Artifact need not grant the caller creation.
Credentials can express a combination without merging the two capability
families. A capability grant never overrides operation identity, replay,
expected-revision currentness, database constraints, or human authority.

`search` still calls the existing bounded `repairMissing()` scan before
retrieval. Its `RECOVER` grant covers invocation, not generic maintenance
authority. The scan can cover missing representations outside the query's
result and is limited to 100 per call; repeated calls and their resource
effects require live observation before calling the service effect bounded
across an entire workflow.

## Evidence and limits

The server logs a compact `ordinary_capability_decision` with policy version,
technical client ID, required capability, allow/deny, and a syntactically
bounded operation ID when present. It logs no bearer secret or digest. Runtime
logs are technical-access evidence, not canonical standing or an ordinary
operation receipt. Denied requests do not reach the handler or consume a
durable operation ID.

Local tests exercise both protocol eras, all six authorization mappings,
full-ordinary compatibility, denial before RPC, a composed preservation and
stale transition, and invalid configuration. Mocked RPCs demonstrate that
the transition still passes exact predecessor identity and surfaces a
database currentness conflict. They do not prove the protected Preview
consumer, real Brain behavior, representation repair cost, an OAuth issuer,
or production conformance.

Before a production-install decision, exercise an isolated Preview deployment
with separately configured Preview credentials: inventory and permitted
reads; pre-handler denials with no database effects; an authorized bounded
ordinary operation and replay/currentness evidence only when a legitimate
non-disposable work item warrants it; repeated `search` repair observation;
and a real connected consumer when the host can bind to Preview. Inspect
runtime errors and authorization logs, and identify the exact active
Production deployment and alias before any later promotion. ECO-206 itself
stops before merge, production promotion, database schema/data changes made
merely for proof, and predecessor retirement.
