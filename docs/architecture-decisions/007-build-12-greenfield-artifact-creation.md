STATUS: PROPOSED CORRECTIVE DECISION
DISPOSITION: DECISION_RECORD
DATE: 2026-09-15 UTC

# BUILD 12 — Greenfield Artifact creation correction

## Correction

The first BUILD 12 implementation mechanically passed its tests but was not derived narrowly enough from ECB v2 greenfield architecture. It introduced a generic version-family model (`artifact_key`, `artifact_type`, numbered versions, native supersession links, latest-version selection, generic provenance/media metadata) before tracing those choices to governing v2 sources.

Mechanical success does not promote those choices into architecture.

This corrective slice uses only already-governing greenfield obligations and already-qualified ordinary-operation machinery.

## Governing greenfield derivation

1. **Artifact is a logical primitive.** The Build Contract defines Artifact as an immutable or versioned representation produced or used by the system.
2. **Persistent first-class subjects have universal identity.** Build 2 requires persistent first-class Artifacts to have stable Referent identity; identity may precede description, classification, or other bindings.
3. **Referent is not representation.** Artifact content does not become the identity or standing of whatever it may represent.
4. **Relations remain Claim semantics.** Build 4 and the Build Contract place referent-to-referent relation truth in Claims. A native `supersedes_version_id` relation would create a second relation truth store.
5. **Current is not newest.** No fetch operation may silently treat latest insertion order as semantic currentness.
6. **Ordinary operation identity is already solved.** Build 11 supplies stable operation identity, request digest comparison, replay reconciliation, conflict behavior, and bounded runtime authorization. BUILD 12 should reuse that machinery rather than invent a second operation protocol.
7. **Specialized BUILD 5B artifacts remain specialized evidence.** Their transformation/checker receipt grammar is not generalized into ordinary Artifact architecture.

## Corrected physical slice

The current earned ordinary need is creation and exact retrieval of immutable text Artifacts.

Physicalization:

- one `public.text_artifacts` native table;
- each row's UUID is also its Referent UUID;
- exact text content plus recording time only;
- rows are immutable;
- ordinary creation is idempotent through Build 11 `ordinary_operations`;
- same operation + changed input conflicts;
- distinct operations with identical content create distinct Artifacts;
- fetch is by durable Artifact UUID;
- no artifact key, type taxonomy, native version number, native supersession relation, generic provenance blob, created-by ontology, media-type taxonomy, latest-version behavior, or automatic standing/currentness.

A later representation that replaces, revises, or supersedes another is initially another Artifact Referent. If the relationship matters semantically, it must be expressed through the existing Claim/relation grammar under separately warranted relation vocabulary rather than hidden in native Artifact storage.

## Corrective handling of the first BUILD 12 installation

At correction time the canonical first implementation contains exactly one Artifact object and one Artifact Version, both created solely by the assistant as a conversational semantic seed. Neither has Claims, Evidence Links, nor ordinary-operation dependencies.

The corrective migration must abort unless those facts still hold. If they hold, it may remove that assistant-created native data and its now-orphaned Referent identities while preserving the episode in Git/migration history as evidence of the failed derivation.

The conversational seed is not reinstalled. Semantic contracts must be recovered or derived from greenfield v2 sources under their own authority before persistence.

## Reopening conditions

Reopen Artifact physicalization only when an actual operation requires a distinction absent from this slice, such as:

- non-text Artifact payloads;
- semantic version families;
- supersession/currentness designation;
- richer provenance required independently of Claims/Evidence Links;
- stable human aliases distinct from Referent UUIDs.

Such a distinction is then derived from greenfield primitives and evidence before promotion.
