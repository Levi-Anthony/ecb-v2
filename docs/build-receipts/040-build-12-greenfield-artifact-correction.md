STATUS: QUALIFIED + CANONICAL DB INSTALLED + PRODUCTION RUNTIME VERIFIED
DISPOSITION: BUILD 12 CORRECTION RECEIPT
DATE: 2026-09-15 UTC

# BUILD 12 — Greenfield Artifact creation correction

## Principal correction

The first BUILD 12 physicalization was mechanically successful but architecturally invalid as a basis for future work because it was not derived explicitly from ECB v2 greenfield architecture.

The Principal clarified the commission: when asking to “build it,” the intended source was greenfield ECB v2 work, not imported legacy and not assistant-invented schema.

This source correction governs the corrected Build 12 result.

## Rejected first physicalization

The first implementation introduced a generic Artifact/version-family model containing, among other things:

- stable human artifact keys;
- artifact type labels;
- numbered versions;
- native supersession links;
- generic provenance/media/created-by metadata;
- latest-version fetch behavior.

Those choices mechanically passed their own tests. That did not make them greenfield architecture.

One material conflict was explicit: native `supersedes_version_id` stored referent-to-referent relation truth outside the existing Claim/relation grammar.

The conversationally reconstructed semantic seed `semantic-contract.integral-holonic-grammar-core` was also rejected as a canonical semantic source because its payload came from chat reconstruction rather than greenfield source recovery/derivation.

The rejected episode remains in Git and migration history as evidence. It is not governing architecture.

## Greenfield source derivation

The correction was derived from already-governing ECB v2 work:

- Artifact is a logical primitive: an immutable or versioned representation produced or used by the system.
- Every persistent first-class Artifact has stable Referent identity.
- Referent identity may precede description, classification, or richer native binding.
- Artifact representation does not become the represented Referent or confer standing.
- Referent-to-referent relation truth belongs in Claims.
- `current != newest`.
- BUILD 11 already supplies ordinary operation identity, replay reconciliation, changed-input conflict, and bounded runtime authorization.
- BUILD 5B Artifact receipts remain specialized greenfield prior evidence rather than a generic Artifact ontology.

Decision/source records:

- `docs/architecture-decisions/007-build-12-greenfield-artifact-creation.md`
- `research/build-12-greenfield-correction/SOURCE_MAP.md`
- `research/build-12-greenfield-correction/BOUNDARY.md`

## Corrected physical slice

The currently earned ordinary Artifact capability is deliberately small:

`public.text_artifacts`

with native columns exactly:

- `id uuid`
- `content text`

The Artifact UUID is also its universal Referent UUID. Registration time remains in the Referent registry rather than being duplicated in the native Artifact row.

Native Artifact rows are immutable.

Ordinary operations:

- `public.ecb12_create_artifact(uuid,text)`
- `public.ecb12_fetch_artifact(uuid)`

Creation reuses BUILD 11 `ordinary_operations` for stable operation identity, replay reconciliation, and changed-input conflict.

There is no native Artifact key, type taxonomy, semantic version number, supersession relation, generic provenance blob, created-by taxonomy, media-type taxonomy, or latest-version selection.

## Safety gate and canonical correction

Before canonical correction, the live database was checked twice.

Observed first-pass Build 12 state:

- one `artifact_objects` row;
- one `artifact_versions` row;
- zero Artifact ordinary operations;
- zero Claim dependencies;
- zero Evidence Link dependencies;
- zero ordinary-operation dependencies;
- the sole object was the assistant-created conversational semantic seed.

The forward corrective migration encoded that state as an aborting safety gate. It would not remove the first-pass surface if reality differed.

Canonical migration:

`build_12_greenfield_artifact_correction`

Result after installation:

- `artifact_objects`: absent;
- `artifact_versions`: absent;
- rejected version-creation RPC: absent;
- rejected stable-key fetch RPC: absent;
- `text_artifacts`: present;
- corrected create/fetch RPCs: present;
- `text_artifacts` row count immediately after correction: 0;
- both assistant-created semantic-seed Referents: absent.

No user-authored semantic graph or ordinary operation was deleted.

## Mechanical qualification

PR #43 reconstructed the exact first Build 12 state—including the rejected semantic seed—then applied the correction.

Passing workflow:

- workflow: `BUILD 12 greenfield artifact correction`
- run: `34960153353`
- job: `104351546947`
- candidate head: `6e59c105673422fdf5c837c594d993bd441f25cd`

The passing path proved:

- exact rejected state reconstruction;
- correction-gate behavior;
- removal of unearned key/version surfaces;
- universal Referent coupling;
- exact text round-trip;
- same-operation/same-input replay;
- same-operation/changed-input conflict;
- distinct-operation/same-content distinct Artifact identity;
- exact-ID fetch with no newest/current inference;
- Artifact immutability;
- bounded ordinary RPC access;
- corrected runtime tool declarations.

## Repository and runtime

Corrective PR:

- PR #43 — `Build 12: correct Artifact creation to greenfield derivation`
- merged main: `cb5592270c332d139133fd8f2b0bd6bfae09cfc0`

Qualified corrected preview:

- `dpl_Syrvnb9pC2vypfm77v5XmNMx6gKs` — READY

Corrected production deployment:

- `dpl_BEU5JDYCZv9reQgoQepmi5UksAQZ` — READY

The public production `/api` endpoint was then fetched and returned exactly this ordinary tool inventory:

- `capture_thought`
- `search`
- `fetch`
- `create_artifact`
- `fetch_artifact`

The rejected `create_artifact_version` and `fetch_artifact_by_key` tools were absent.

## Standing and nonclaims

This receipt qualifies the corrected implementation at Register B. It does not create additional semantic standing.

It does not establish:

- a general document-management ontology;
- semantic Artifact version families;
- Artifact supersession/currentness semantics;
- a canonical Integral holonic semantic contract;
- automatic semantic promotion;
- generalized workflow/policy machinery.

The rejected conversational semantic seed must not be recreated from chat memory or its old migration payload.

Future semantic-contract persistence begins with greenfield source recovery/derivation and separate acceptance.

## Reentry

Artifact implementation correction is complete and production-qualified.

The separately pre-existing BUILD 11 consumer-routing question remains distinct: a healthy Vercel production deployment does not by itself establish what endpoint an actual ChatGPT/custom-app/other consumer is using.

Do not retire the predecessor Supabase ordinary runtime solely because Build 12 is production-qualified. Establish consumer routing and one live consumer operation first.
