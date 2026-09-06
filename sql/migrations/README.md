STATUS: ACTIVE
DISPOSITION: PROJECTION  
ROLE: Ordered persistence migrations for active Build Units

# Migrations

BUILD 0 migrations:

- `20260903235721_build_0_atomic_thoughts.sql` — pgvector, the canonical atomic `thoughts` table, RLS, and service-role-only similarity search;
- `20260904000010_build_0_least_privilege.sql` — removes Supabase's default service-role update/delete table privileges.

BUILD 2 migration:

- `20260904093341_build_2_universal_referents.sql` — atomically activates the identity-only Referent registry, backfills existing Thoughts, installs the invoker registration trigger and immediate same-UUID coupling, and applies the frozen least-privilege boundary.

BUILD 3 migration:

- `20260904163938_build_3_claims_evidence_links.sql` — atomically activates assertion Claims and historical Evidence Links as same-UUID Referent-backed records, derives the frozen Thought revision digest inside the Link transaction, installs the bounded least-privilege boundary, and inserts Worked Trace 03 Claim C and Link L.

BUILD 4 migration:

- `20260904215929_build_4_typed_relation_claims.sql` — atomically adds the three kind-exclusive relation columns to `public.claims`, replaces the superseded BUILD 3 Claim constraints with the kind, shape, predicate, and predicate-scoped self-relation constraints, installs the two restrictive endpoint foreign keys to `public.referents`, replaces `prepare_claim`, widens the service-role insert columns while preserving database ownership of origin, standing, and assertion time, and inserts Worked Trace 06 Claim C2 and relation Claim R. It adds no table and no function.

BUILD 5A migration:

- `20260905022247_build_5a_standing_transition_history.sql` — atomically creates the immutable, Referent-backed `public.claim_standing_transitions` record that is the only legal path for changing a Claim's applied epistemic standing, adds the non-callable `thought_revision_digest` and `prepare_claim_standing_transition` functions and the row-level BEFORE INSERT trigger, replaces the single-value Claim standing constraint with the three-value vocabulary, applies the frozen least-privilege boundary without granting any UPDATE on Claims, and inserts transition TR1 qualifying Claim C against its declared basis.

BUILD 5B migration:

- `20260906014257_build_5b_versioned_artifacts.sql` — creates the immutable, Referent-backed `public.artifacts` store with five native record roles, database-derived specifications, attempt payloads and Transformation Receipts, the two `SECURITY INVOKER` trigger functions, the row-level preparation trigger and the statement-level mutation rejector, one partial unique index giving at most one terminal receipt per attempt, RLS with zero policies, and the frozen least-privilege boundary. It changes no existing table, function or grant.

  Unlike its predecessors this file carries **no** `BEGIN`/`COMMIT`. The bound Output Contract requires the runner to wrap the exact file bytes and a parameterized migration-ledger write in one single outer transaction. `tests/build-5b/runner.ts` implements that mechanism and rollback-probes it before applying. It is not yet applied to canonical state.

BUILD 5B migration (executed; human Metabolize pending):

- `20260906014257_build_5b_versioned_artifacts.sql` — immutable Referent-backed Artifacts, fixed transformation requests, committed check attempts and bounded grounding/preservation receipts. Exact migration bytes and the ledger commit atomically through the qualified runner; the seven pre-check fixtures and two receipts commit in separate later transactions. See [execution evidence](../../docs/build-receipts/007-build-5b.md).

Add only migrations licensed by the active Build Unit.
