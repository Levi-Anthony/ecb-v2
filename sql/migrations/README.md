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

Add only migrations licensed by the active Build Unit.
