# ECO-190 — Qualification return: dependency-history contradiction
Date: 2026-09-24 America/Phoenix (execution evidence 2026-09-25 UTC).
Register B. Disposition: HOLD — material contradiction reproduced; Move remains open. No production cutover or qualification PASS.

## Recovered frontier and authority
Live-read ECO-190, checkpoint 6e66fe88-bcc6-443e-8d27-80157df18ed1, reconciled physical design ca725ea6-3ed3-42c6-9f5b-aa0115b8640e, ECO-189 Shape c3471982-ee45-46fb-9557-a8549506cf4f, ECO-191 Shape a772bbf2-f8f4-4ceb-9fc7-e5cbb20e345e, canonical ecb-v2-brain (vezxivrvhakclxuvxzso), candidate source and deployed Preview.

The checkpoint opening capability-blocked language is historical, superseded by its later bootstrap-pass update. Direct canonical queries and the live consumer confirmed epoch 0 and bootstrap custody. The Supabase list-projects response omitted the canonical project; explicit authorized queries reached its installed schema and data. Do not substitute the separately listed open-brain project.

Verified Preview: dpl_EYqYfGAxBZdtAvEGXWiqEt19pxBQ, READY, temporary host commit cc8d8d58773632bd5ecae044a5d85bd8c15f10fe. Deployed api/coordination.ts blob 8df052d0da79844c2b3251559a47769c08b96dae matches move/eco-190-coordination-core-v2 and contains caller operation-ID repair 4fcb5ed2b1a89ba3162365be9536aa8ad877f74a.

## Real material-change result
PASS for the bounded change itself, not overall qualification.

Canonical episode ffcbbc5c-d2fd-54f3-a433-ac1710010ba4 advanced 0 → 1.
Source head: 714bca62-2fbc-5e44-9649-f09f9e9bf46c.
New head: c6fd8edd-db2b-51ab-bcb6-c7da50937fb8, recorded 2026-09-25T02:17:47.981583Z.
Reconciliation: ELIGIBLE at external reliance epoch 1 and consumer epoch 1.
Bridge Artifact: 1197fb75-db77-4fd2-b4ba-244fd88ab9b2.
Realization bundle Artifact: c8c280c1-ec8a-4865-8db7-24f1c77ade3f.
Destination qualification basis: 3375b111-23dd-4a4c-bb06-39f7a072aec8.
Source retention, continuity decision, transport, affected-old review, destination disclosure, coverage, current-use binding and reconciliation are retained in the canonical receipt. Focal Referent and PGO identities were retained; use/basis and realization changed.

The HTTP return was not reliably delivered. Database inspection established the committed result. Do not retry material-change merely because a client reported access failure: its operation has already committed.

## Real negative-control results
All seven controls implemented in action=negative-controls returned pass=true and are canonically retained:
1. Same operation and request replays.
2. Changed request under same operation conflicts (ecb11_operation_conflict).
3. Missing runtime capability blocks (ecb11_runtime_unauthorized).
4. Stale external reliance is localized.
5. Stale external reliance blocks positive change.
6. Disconnected/unobserved consumer is not installed.
7. Disconnected consumer blocks positive change.

Receipt: 00673066-3c47-5071-81df-255e11c22bc6.
Evidence Artifact: aba65552-12f2-487a-b8a6-6e6ac505cebb.
Replay-control receipt: 558ddd83-a472-51e2-b14e-747523e5b142.
These are seven implemented controls, not proof that the complete commissioned control matrix passed. The material-change handler's separate control response was not recovered and those pass flags are not certified here.

## Material contradiction — same endpoint, changed history
The negative-control routine marked the external reliance STALE, restored it CURRENT, disconnected the consumer, and restored it CONNECTED/OBSERVED. Both dependency heads advanced 1 → 2 → 3.

Live state after restoration:
- Episode epoch: 1; head c6fd8edd-db2b-51ab-bcb6-c7da50937fb8.
- Episode current_use.expected_reliance_epoch: 1.
- Actual reliance a05a601b-92e2-5f8f-9990-93d95d60d917 epoch: 3.
- Episode current_use.expected_consumer_epoch: 1.
- Actual consumer 4037e243-7e20-519a-a4ab-0f106009db38 epoch: 3.
- Consumer-returned projection.stale_or_unauthorized: [].

The old receipt remains valid historical evidence for epoch-1 dependencies. It is not a new qualification against epoch-3 histories. Restoring visible CURRENT/CONNECTED labels did not reconcile the episode.

Live public.ecb190_fetch_episode source confirms its stale projection checks current status labels and historical reconciliation eligibility but does not compare current_use dependency epochs to live heads. The write validator does enforce those epoch comparisons. This creates inconsistent read/qualification versus write behavior.

Candidate qualify() derives PASS from reconstruction.pass and an empty stale_or_unauthorized list. INFERENCE FROM CODE: it would therefore issue a misleading PASS after this restore. The qualify action was deliberately NOT called; no false-PASS receipt was created.

This contradicts ECO-191's mandatory same-visible-endpoint/different-history rule and ECO-189's derivative currentness contract. It is an implementation contradiction with the accepted contract, not evidence that the architecture must be discarded.

## Stop and preservation
Stopped after the live negative-control return and independent canonical inspection. BRAIN-only reconstruction and final qualification are NOT EXECUTED in this continuation. No code/schema repair was performed after identifying the material contradiction.

Temporary qualification-host branch build/eco-132-r4-runtime-confinement was restored and independently verified at its preserved original SHA:
2234ca9a49eae03b8832ec202b597b8e6889b2da.

Restoring a Git branch does not delete the immutable deployment or revoke its secrets/access. The old deployment remains historical qualification evidence; branch-scoped current reliance must be revalidated before reuse. No production-main merge, alias promotion or provider migration was performed.

The canonical receipts and original history are preserved. Do not rewrite them or roll dependency epochs back to conceal the mismatch.

## Exact reentry
1. Repair the derived read projection to compare the episode's bound dependency identities/epochs against live dependency heads and explicitly report mismatch, with fail-closed treatment of missing decision-bearing data.
2. Make final qualification depend on exact current reconciliation and the required evidence/control inventory, not only an empty status-warning array and file-presence check.
3. After restoring dependency status, require a new attributable episode reconciliation against the restored dependency epochs; retain the prior receipt as history.
4. Add the actual failing round-trip control: CURRENT → STALE → CURRENT and CONNECTED → DISCONNECTED → CONNECTED must leave old episode qualification stale until explicit reconciliation.
5. Resume the full outstanding matrix, BRAIN-only reconstruction/reconstitution, and bounded qualification on a deliberately rebound Preview. Preserve the original-host restoration obligation if temporarily borrowing that branch again.

Do not blindly rerun negative-controls with the same deployment: its intermediate writes have committed and its content depends on changing heads. Recover exact operation/request state before any retry.
No production cutover authority is added.

## Physical allocation and remaining proof
Canonical Referents and immutable text Artifacts hold identities/content; ordinary operations retain replay/conflict; private ecb_coordination tables hold episode/dependency heads and immutable record links; runtime-key-protected RPCs enforce bounded writes; Vercel Preview supplies actual consumer use; fetch_episode derives the human-readable projection.
The failed liability is derivative currentness at the read/final-qualification boundary.

FACT: real consumer change committed; seven controls passed; dependency histories changed; read projection omitted the resulting mismatch; host pointer restored.
INFERENCE: current qualify() would incorrectly return PASS for that state.
UNKNOWN/UNEXECUTED: complete commissioned controls, full BRAIN-only reconstruction and restoration sufficiency, production-use readiness, final qualification.

The bundled reconstruct action checks seven file names for string content. File presence alone must not be promoted to proof of the full ECO-189 governing/configuration/restore package or fresh execution.
No additional generalized planner, workflow engine, provider migration, or ontology mechanism is earned by this finding.

## Access friction and safe retry lesson
Vercel connector calls repeatedly returned SSO redirects; one request nonetheless reached the consumer and committed. A browser navigation reported a client block and later a browser policy refusal; browser use stopped. Supported HTTP access using the connector-issued temporary share link and its cookie completed the negative controls. Secret values and access tokens are excluded from this record.
Never equate a failed response delivery with absence of effects. Inspect canonical operation/head state first.

## Durability
Decision-bearing material-change and negative-control evidence already resides in canonical BRAIN Artifacts/records. This report is an operator qualification return on the issue/checkpoint and GitHub candidate. A separate canonical mirror of this narrative HOLD remains pending because this session exposes no canonical ECB-v2 capture tool/credential; the similarly named ECB connector is not verified as this canonical BRAIN. No capability guard was bypassed to fabricate that mirror.
