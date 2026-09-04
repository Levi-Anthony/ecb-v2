STATUS: ACTIVE
DISPOSITION: PROJECTION  
ROLE: Ordered persistence migrations for active Build Units

# Migrations

BUILD 0 migrations:

- `20260903235721_build_0_atomic_thoughts.sql` — pgvector, the canonical atomic `thoughts` table, RLS, and service-role-only similarity search;
- `20260904000010_build_0_least_privilege.sql` — removes Supabase's default service-role update/delete table privileges.

BUILD 2 migration:

- `20260904093341_build_2_universal_referents.sql` — atomically activates the identity-only Referent registry, backfills existing Thoughts, installs the invoker registration trigger and immediate same-UUID coupling, and applies the frozen least-privilege boundary.

Add only migrations licensed by the active Build Unit.
