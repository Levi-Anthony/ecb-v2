STATUS: ACTIVE
DISPOSITION: PROJECTION  
ROLE: Ordered persistence migrations for active Build Units

# Migrations

BUILD 0 migrations:

- `20260903235721_build_0_atomic_thoughts.sql` — pgvector, the canonical atomic `thoughts` table, RLS, and service-role-only similarity search;
- `20260904000010_build_0_least_privilege.sql` — removes Supabase's default service-role update/delete table privileges.

Add only migrations licensed by the active Build Unit.
