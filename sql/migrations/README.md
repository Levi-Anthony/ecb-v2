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

Add only migrations licensed by the active Build Unit.
