STATUS: SHAPE OPEN — FIRST ORDINARY SUCCESSION PREPARATION
DISPOSITION: PROJECTION / IMPLEMENTATION SHAPE
DATE: 2026-09-09 America/Phoenix
AUTHORITY: Human-closed P1 Sense in `docs/build-sense/008-build-6-p1.md`

# BUILD 6 Shape — first ordinary succession

## Outcome

Prepare the minimum non-human seam required so that the only remaining pause is Levi's protected P1 authorization, followed by one secret-safe local execution and independent reconstruction.

## Fixed candidate

Materialize exact P1 as the accepted P0 profile with only `requires_human_explanation` changed from JSON boolean `false` to JSON boolean `true`.

Required exact properties:

- format remains `ecb.build6.policy.v1`;
- operation remains `policy_succession`;
- H/remit, authority class, preservation requirements, withdrawal rule, delegation and allowed-operation boundaries are unchanged;
- UTF-8 byte length: 563;
- SHA-256: `2057597b340e7f324176c65847633b776e0d266407988dedbaec001359c39556`.

These bytes are a prepared candidate, not an authorization. They acquire no governing force until the installed H accepts them through the protected human route under operative P0.

## Minimum implementation seam

Add one repo-native local helper for ordinary succession. It must reuse the existing private M2 executor custody record without asking for the installer URI and without printing, exporting or persisting a reconstructed executor URI.

Responsibilities:

1. Require Node 24 and an explicit private custody directory plus exact public request file.
2. Read `verifier-runtime.json` through a no-follow, owner/mode-checked path; require record version 1, state `applied`, exact executor project and Supabase pooler target, and the existing 64-character private password shape.
3. Reconstruct the restricted executor connection only in memory using the fixed executor username/project, target host, port 6543, `/postgres`, strict bundled Supabase CA and no installer/JIT query options.
4. Validate the public request as exactly one succession execution request: scope, committed decision, execution request ID, P1 digest and current predecessor. The helper must not issue human decisions or derive authority from the request file.
5. Open a restricted executor connection and call `recover` first.
6. If recovery reports the exact request already committed, verify the returned transition and proceed directly to cold recovery; do not execute again.
7. If recovery reports `not_committed`, require its authoritative current transition to equal the request predecessor, then execute exactly once.
8. Close the connection, open a fresh restricted connection and `recover` the exact same request. Success requires the committed transition to match scope, decision, request, P1 digest and predecessor.
9. Emit only a secret-free receipt containing bounded public identifiers/status. Any uncertain failure reports `P1=UNCONFIRMED` and directs recovery with the same exact request; no raw database error or credential may be emitted.

## Public request lifecycle

Do not create the real execution request before the protected human decision exists. Prepare only the file format and validation now.

After Levi accepts P1 through WebAuthn:

- independently read canonical state;
- verify one new unwithdrawn succession decision under the exact current predecessor and P1 digest;
- fix a new public execution request with that decision and a fresh request ID;
- persist the request in the repository because it contains no credential or human-session secret;
- run the qualified local helper against retained private executor custody.

## Human review path

No new authorization UI is required for correctness. The existing browser review captures exact bytes, digest, current predecessor and request identity before accept/decline. Shape should prefer a low-error way to load the fixed P1 candidate over manual retyping, but must not add a broader settings/editor surface.

If the smallest safe route is to present the exact repository candidate for copy/paste into the existing policy field, retain that. Add UI/code only if it materially reduces byte/digest error without widening scope.

## Qualification

Before any real P1 authorization:

- exact P1 candidate bytes/digest must be executable-tested;
- private custody parser must reject unsafe ownership/modes, wrong target/project, non-applied state and malformed secret records;
- control flow must prove recover-before-effect, no duplicate effect after prior success, stop on mismatched predecessor/unknown recovery, and fresh-connection cold recovery;
- output tests must prove no credential/URI leakage;
- existing BUILD 6 PG17 and readiness suites must remain green;
- no migration or hosted runtime change should be introduced unless implementation evidence forces it.

## Non-goals

No P1 acceptance, no canonical succession effect, no M1/M2 replay, no credential rotation, no installer ceremony, no hosted executor secret, no new database role, no generic governance CLI, no BUILD 6 closure, no BUILD 7+.

## Shape pass condition

Shape is ready to release the next Move only when exact P1 bytes and the local recovery-first executor seam are qualified, the protected review route is operational with no additional non-human blocker, and the remaining user action is genuinely the P1 human authorization.