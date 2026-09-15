STATUS: BUILD 12 GREENFIELD ARTIFACT CORRECTION — CANONICAL DB VERIFIED; CORRECTED PRODUCTION RUNTIME DEPLOYING
DISPOSITION: FIRST BUILD 12 PHYSICALIZATION REJECTED AS ARCHITECTURE; GREENFIELD CORRECTION QUALIFIED + MERGED; CANONICAL DATABASE CORRECTED; PRODUCTION RUNTIME CUTOVER NOT YET VERIFIED
ROLE: Canonical reentry projection
AUTHORITY: Principal source-provenance correction, 2026-09-15 + governing ECB v2 greenfield sources + ADR 007 + PR #43 qualification
CANONICAL MAIN: cb5592270c332d139133fd8f2b0bd6bfae09cfc0
CANONICAL BRAIN: Supabase ecb-v2-brain / vezxivrvhakclxuvxzso
CANONICAL BUILD-12 CORRECTION: build_12_greenfield_artifact_correction / VERIFIED
QUALIFIED CORRECTED PREVIEW: Vercel dpl_Syrvnb9pC2vypfm77v5XmNMx6gKs / READY
CORRECTED PRODUCTION DEPLOYMENT: Vercel dpl_BEU5JDYCZv9reQgoQepmi5UksAQZ / DEPLOYING AT LAST VERIFICATION
CANONICAL_BUILD7_DATABASE_INSTALL=NONE
CANONICAL_BUILD8_DATABASE_INSTALL=NONE
CANONICAL_BUILD9_DATABASE_INSTALL=NONE
CANONICAL_BUILD10_DATABASE_INSTALL=NONE
CANONICAL_BUILD11_DATABASE_INSTALL=VERIFIED
CANONICAL_BUILD12_GREENFIELD_ARTIFACT_INSTALL=VERIFIED
REAL_MASTER_KEY_AUTHORITY=QUESTION_FORWARD
REAL_ACTION_AUTHORITY=QUESTION_FORWARD
REAL_ACTION_EFFECT=NONE

# Read this first

ECB v2 remains greenfield.

When the Principal says to build a missing capability in ECB v2, derive it explicitly from the governing greenfield architecture before physicalizing it. Do not import ECB v1 merely because it exists. Do not promote a plausible assistant-designed schema merely because it works mechanically.

Mechanical success is necessary evidence for implementation; it is not architectural authority.

For the Build 12 correction, the governing source map is recorded in:

- `docs/architecture-decisions/007-build-12-greenfield-artifact-creation.md`
- `research/build-12-greenfield-correction/SOURCE_MAP.md`
- `research/build-12-greenfield-correction/BOUNDARY.md`

# Current Build 12 state

The first Build 12 implementation created a generic Artifact/version-family subsystem with stable keys, type labels, numbered versions, native supersession links, generic provenance/media metadata, and latest-version fetch behavior. It mechanically qualified, but the derivation was wrong: those distinctions were introduced before being traced to the ECB v2 greenfield grammar.

That implementation is historical evidence only. It is not accepted architecture.

The Principal clarified that “build it” meant to base the capability explicitly on greenfield work rather than imported legacy or invented structure. PR #43 corrected the physicalization accordingly.

The canonical database now contains the corrected Artifact slice:

- `public.text_artifacts`
- native columns exactly `id`, `content`
- `id` is also the Artifact's universal Referent identity
- Artifact rows are immutable
- Referent `registered_at` supplies registration time; no duplicate Artifact timestamp is invented
- `public.ecb12_create_artifact(uuid,text)`
- `public.ecb12_fetch_artifact(uuid)`
- Build 11 `ordinary_operations` supplies operation identity, exact replay reconciliation, and changed-input conflict
- direct ordinary table mutation is not granted

The corrected database was verified after canonical installation:

- old `artifact_objects` absent
- old `artifact_versions` absent
- old `create_artifact_version` RPC absent
- old `fetch_artifact_by_key` RPC absent
- `text_artifacts` present and empty immediately after correction
- corrected create/fetch RPCs present
- both assistant-created semantic-seed Referents removed

# Artifact semantic boundary

Current ordinary Artifact capability is intentionally narrow because that is what the greenfield derivation presently supports.

Artifact is a persistent first-class Referent with an exact immutable text representation.

Artifact creation does NOT by itself confer:

- truth;
- epistemic standing;
- currentness;
- applicability;
- authority;
- acceptance;
- authorization;
- identity with a represented Referent;
- a supersession/revision relationship to another Artifact.

If a later Artifact revises or supersedes another and that relation matters semantically, represent the relation through the existing Claim/relation grammar when warranted. Do not recreate a competing native relation truth store for convenience.

`current != newest` remains governing. There is no latest-version Artifact shortcut in the corrected slice.

Reopen Artifact physicalization only when an actual operation requires an additional distinction such as non-text payloads, semantic version families, supersession/currentness designation, richer provenance not expressible through existing grammar, or stable human aliases distinct from Referent UUIDs.

# Rejected semantic seed

The conversation-derived Artifact formerly stored under:

`semantic-contract.integral-holonic-grammar-core`

is not canonical and no longer exists in the canonical database.

It was derived from conversational reconstruction rather than recovered or derived from governing greenfield sources. Do not recreate it from chat memory, the rejected migration payload, or the old content digest.

Any future semantic contract must be recovered or derived from ECB v2 greenfield sources under the appropriate authority, then separately accepted before persistence.

# Repository qualification

PR #43 mechanically reconstructed the exact first Build 12 state—including the rejected conversational seed—then applied the forward correction.

The passing disposable PostgreSQL 17 path proved:

- the correction gate recognizes the exact rejected state;
- cleanup aborts if user/semantic dependencies exist;
- the rejected generic tables and key/version RPCs are removed;
- Artifact identity is universally Referent-backed;
- exact text round-trips;
- same operation + same input replays the same Artifact;
- same operation + changed input conflicts before another effect;
- distinct operations with identical text preserve distinct Artifact identities;
- fetch requires exact Artifact identity and no newest/current inference;
- native Artifact rows are immutable;
- ordinary access is confined to bounded create/fetch RPCs;
- the outward runtime code contains only the corrected Artifact tools.

Passing workflow: BUILD 12 greenfield artifact correction, run `34960153353`, job `104351546947`.

# Ordinary MCP runtime

The corrected runtime code on canonical main advertises the intended ordinary surface:

- `capture_thought`
- `search`
- `fetch`
- `create_artifact`
- `fetch_artifact`

The corrected preview deployment `dpl_Syrvnb9pC2vypfm77v5XmNMx6gKs` is READY.

At the last verification during reconciliation, the production alias was still serving the rejected seven-tool Build 12 runtime while deployment `dpl_BEU5JDYCZv9reQgoQepmi5UksAQZ` was still deploying. Therefore:

**Do not use ordinary Artifact MCP operations until the public production endpoint is verified to advertise exactly the corrected five-tool surface above.**

The existing Thought operations `capture_thought`, `search`, and `fetch` are unchanged by the Artifact correction.

# BUILD 11 residual state

BUILD 11's database/runtime capability remains valid. The Artifact correction reuses its ordinary-operation and runtime-capability machinery rather than replacing it.

The previously recorded consumer-routing distinction still applies unless newer evidence proves otherwise: deployment readiness does not itself prove which endpoint ChatGPT/custom-app/other ordinary consumers are actually using.

Do not infer consumer cutover merely from a healthy Vercel production deployment.

The predecessor Supabase `open-brain-mcp` should remain a rollback path until actual consumer routing is established and a live ordinary operation proves receipt at Vercel. Retire it only after that proof.

# Residual operation-ID custody

Build 11 replay semantics still require the caller to supply the same stable `operation_id` for the same logical consequential operation.

The server/database enforce replay/conflict once that token is supplied. Generation and retention/reuse of the token remain caller/client-adapter custody unless separately physicalized.

This now applies to both Thought capture and Artifact creation.

# Explicit nonclaims

The current system does not establish or install merely through Build 12:

- a general document management ontology;
- a semantic version-family ontology;
- Artifact supersession/currentness semantics;
- a canonical Integral holonic semantic contract;
- automatic semantic promotion;
- generalized workflow/policy machinery;
- real Master-Key designation authority;
- Build 8 action authority/effect;
- Build 7–10 canonical database installation;
- iPhone Action Button capture.

# Exact legitimate reentry seam

First reconcile production runtime deployment:

1. Verify `dpl_BEU5JDYCZv9reQgoQepmi5UksAQZ` reaches READY or identify its replacement if Vercel supersedes it.
2. Fetch the public production `/api` endpoint.
3. Require ordinary tool inventory exactly:
   `capture_thought`, `search`, `fetch`, `create_artifact`, `fetch_artifact`.
4. Confirm the rejected `create_artifact_version` and `fetch_artifact_by_key` tools are absent.
5. Only then declare the Build 12 runtime correction production-qualified.

After that, consumer-routing verification remains a distinct seam. Establish the actual consumer endpoint before claiming ordinary traffic uses Vercel or retiring the predecessor Supabase function.

Do not recreate the rejected semantic seed. Future semantic-contract work begins from greenfield source recovery/derivation, not from the old conversation artifact.
