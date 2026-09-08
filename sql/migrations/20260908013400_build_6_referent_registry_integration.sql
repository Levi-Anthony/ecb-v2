-- BUILD 6 construction correction — universal Referent registry integration.
--
-- BUILD 2 intentionally left public.referents with RLS enabled and zero policies because its
-- ordinary writer is service_role (BYPASSRLS). BUILD 6's purpose-specific NOLOGIN native owner is
-- intentionally NOT BYPASSRLS, yet every new first-class native record must still acquire universal
-- Referent identity. Add only the two operations already granted to that owner: read and fresh
-- identity registration. Existing roles gain nothing and RLS remains enabled.

create policy build6_native_referent_select
  on public.referents
  for select
  to ecb_governance_native
  using (true);

create policy build6_native_referent_insert
  on public.referents
  for insert
  to ecb_governance_native
  with check (true);

do $check$
declare
  build6_policy_count integer;
begin
  if not (select relrowsecurity from pg_catalog.pg_class
          where oid='public.referents'::pg_catalog.regclass) then
    raise exception 'BUILD 6 Referent integration disabled predecessor RLS';
  end if;

  select pg_catalog.count(*) into build6_policy_count
  from pg_catalog.pg_policies
  where schemaname='public' and tablename='referents'
    and policyname in ('build6_native_referent_select','build6_native_referent_insert')
    and roles = array['ecb_governance_native']::name[];
  if build6_policy_count <> 2 then
    raise exception 'BUILD 6 Referent integration policy surface is incomplete';
  end if;

  if pg_catalog.has_table_privilege('ecb_governance_native','public.referents','UPDATE')
     or pg_catalog.has_table_privilege('ecb_governance_native','public.referents','DELETE')
     or pg_catalog.has_table_privilege('ecb_governance_verifier','public.referents','INSERT')
     or pg_catalog.has_table_privilege('ecb_governance_executor','public.referents','INSERT') then
    raise exception 'BUILD 6 Referent integration enlarged mutation privileges';
  end if;
end;
$check$;
