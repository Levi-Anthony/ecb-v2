-- BUILD 4 — Typed Relation Claims
-- Atomic activation of one typed referent-to-referent relation Claim inside the
-- single Claim truth store. No new table, function, view, resolver, RPC, or index.

begin;

alter table public.claims
  add column subject_referent_id uuid,
  add column predicate text,
  add column object_referent_id uuid;

alter table public.claims
  drop constraint claims_kind_assertion,
  drop constraint claims_proposition_nonempty;

alter table public.claims
  alter column proposition drop not null,
  alter column claim_kind set default 'assertion';

alter table public.claims
  add constraint claims_kind_vocabulary
    check (claim_kind in ('assertion', 'relation')),
  add constraint claims_kind_exclusive_shape
    check (
      (
        claim_kind = 'assertion'
        and proposition is not null
        and length(btrim(proposition)) > 0
        and subject_referent_id is null
        and predicate is null
        and object_referent_id is null
      )
      or
      (
        claim_kind = 'relation'
        and proposition is null
        and subject_referent_id is not null
        and predicate is not null
        and object_referent_id is not null
      )
    ),
  add constraint claims_predicate_vocabulary
    check (predicate is null or predicate = 'depends_on'),
  add constraint claims_depends_on_not_self
    check (
      not (
        predicate = 'depends_on'
        and subject_referent_id = object_referent_id
      )
    ),
  add constraint claims_subject_referent_fkey
    foreign key (subject_referent_id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  add constraint claims_object_referent_fkey
    foreign key (object_referent_id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable;

create or replace function public.prepare_claim()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.referents (id)
  values (new.id);

  new.origin := 'ecb_inference';
  new.epistemic_standing := 'unassessed';
  new.asserted_at := pg_catalog.transaction_timestamp();

  return new;
end;
$$;

revoke all on function public.prepare_claim()
  from public, anon, authenticated, service_role;

insert into public.claims (id, proposition, scope)
values (
  'c7f7d330-e778-4ae5-be96-3a172bea1166',
  'The described scene contains at least two distinct objects.',
  'worked_trace_06:gt01_interpretation_dependency'
);

insert into public.claims (
  id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
)
values (
  'cb429206-5abd-4adb-8ff9-d6d6a885034c',
  'worked_trace_06:claim_dependency',
  'relation',
  'c7f7d330-e778-4ae5-be96-3a172bea1166',
  'depends_on',
  '0f89e778-b16e-4840-9129-a2aa3eb6f697'
);

revoke all on table public.claims
  from public, anon, authenticated, service_role;

grant select on table public.claims to service_role;
grant insert (
  id, proposition, scope, claim_kind,
  subject_referent_id, predicate, object_referent_id
) on table public.claims to service_role;

do $$
declare
  public_tables text[];
  public_functions text[];
  claim_columns text[];
  relation_foreign_keys integer;
  claim_constraints text[];
  claim_policy_count integer;
  relation_row public.claims%rowtype;
  dependent_row public.claims%rowtype;
  preserved_claim public.claims%rowtype;
  preserved_link public.evidence_links%rowtype;
begin
  select pg_catalog.array_agg(table_name order by table_name)
  into public_tables
  from information_schema.tables
  where table_schema = 'public'
    and table_type = 'BASE TABLE';

  if public_tables is distinct from
    array['claims', 'evidence_links', 'referents', 'thoughts'] then
    raise exception 'BUILD 4 added or removed a public table: %', public_tables;
  end if;

  if exists (
    select 1 from information_schema.views where table_schema = 'public'
  ) then
    raise exception 'BUILD 4 produced a public view';
  end if;

  select pg_catalog.array_agg(procedure.proname order by procedure.proname, procedure.oid)
  into public_functions
  from pg_catalog.pg_proc as procedure
  join pg_catalog.pg_namespace as namespace
    on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public';

  if public_functions is distinct from array[
      'prepare_claim', 'prepare_evidence_link',
      'register_thought_referent', 'search_thoughts'
    ] then
    raise exception 'BUILD 4 added or removed a public function: %', public_functions;
  end if;

  select pg_catalog.array_agg(column_name order by ordinal_position)
  into claim_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'claims';

  if claim_columns is distinct from array[
      'id', 'proposition', 'scope', 'claim_kind', 'origin',
      'epistemic_standing', 'asserted_at',
      'subject_referent_id', 'predicate', 'object_referent_id'
    ] then
    raise exception 'BUILD 4 Claim columns drifted: %', claim_columns;
  end if;

  select pg_catalog.array_agg(conname order by conname)
  into claim_constraints
  from pg_catalog.pg_constraint
  where conrelid = 'public.claims'::regclass
    and contype in ('c', 'f');

  if claim_constraints is distinct from array[
      'claims_depends_on_not_self',
      'claims_kind_exclusive_shape',
      'claims_kind_vocabulary',
      'claims_object_referent_fkey',
      'claims_origin_ecb_inference',
      'claims_predicate_vocabulary',
      'claims_referent_fkey',
      'claims_scope_nonempty',
      'claims_standing_unassessed',
      'claims_subject_referent_fkey'
    ] then
    raise exception 'BUILD 4 Claim constraint surface drifted: %', claim_constraints;
  end if;

  select count(*)
  into relation_foreign_keys
  from pg_catalog.pg_constraint
  where conrelid = 'public.claims'::regclass
    and contype = 'f'
    and confrelid = 'public.referents'::regclass
    and not condeferrable
    and not condeferred
    and confupdtype = 'r'
    and confdeltype = 'r';

  if relation_foreign_keys <> 3 then
    raise exception 'BUILD 4 restrictive Claim foreign keys drifted: %', relation_foreign_keys;
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.claims'::regclass
      and contype = 'f'
      and confrelid <> 'public.referents'::regclass
  ) then
    raise exception 'BUILD 4 Claim endpoint depends on a native record table';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.claims'::regclass
      and contype = 'u'
  ) or exists (
    select 1
    from pg_catalog.pg_index
    where indrelid = 'public.claims'::regclass
      and indisunique
      and indexrelid <> (
        select conindid from pg_catalog.pg_constraint
        where conrelid = 'public.claims'::regclass and contype = 'p'
      )
  ) then
    raise exception 'BUILD 4 introduced a uniqueness rule over Claims';
  end if;

  select count(*)
  into claim_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public' and tablename = 'claims';

  if claim_policy_count <> 0
    or not (
      select relrowsecurity from pg_catalog.pg_class
      where oid = 'public.claims'::regclass
    ) then
    raise exception 'BUILD 4 Claim RLS or policy boundary drifted';
  end if;

  if not has_table_privilege('service_role', 'public.claims', 'select')
    or has_table_privilege('service_role', 'public.claims', 'insert')
    or has_table_privilege('service_role', 'public.claims', 'update')
    or has_table_privilege('service_role', 'public.claims', 'delete')
    or not has_column_privilege('service_role', 'public.claims', 'claim_kind', 'insert')
    or not has_column_privilege('service_role', 'public.claims', 'subject_referent_id', 'insert')
    or not has_column_privilege('service_role', 'public.claims', 'predicate', 'insert')
    or not has_column_privilege('service_role', 'public.claims', 'object_referent_id', 'insert')
    or has_column_privilege('service_role', 'public.claims', 'origin', 'insert')
    or has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'insert')
    or has_column_privilege('service_role', 'public.claims', 'asserted_at', 'insert')
    or has_any_column_privilege('anon', 'public.claims', 'select, insert, update')
    or has_any_column_privilege('authenticated', 'public.claims', 'select, insert, update') then
    raise exception 'BUILD 4 Claim privilege boundary drifted';
  end if;

  select * into relation_row
  from public.claims
  where id = 'cb429206-5abd-4adb-8ff9-d6d6a885034c';

  if relation_row.claim_kind <> 'relation'
    or relation_row.proposition is not null
    or relation_row.scope <> 'worked_trace_06:claim_dependency'
    or relation_row.origin <> 'ecb_inference'
    or relation_row.epistemic_standing <> 'unassessed'
    or relation_row.subject_referent_id <> 'c7f7d330-e778-4ae5-be96-3a172bea1166'
    or relation_row.predicate <> 'depends_on'
    or relation_row.object_referent_id <> '0f89e778-b16e-4840-9129-a2aa3eb6f697' then
    raise exception 'BUILD 4 relation Claim fixture drifted';
  end if;

  select * into dependent_row
  from public.claims
  where id = 'c7f7d330-e778-4ae5-be96-3a172bea1166';

  if dependent_row.claim_kind <> 'assertion'
    or dependent_row.proposition
       <> 'The described scene contains at least two distinct objects.'
    or dependent_row.scope <> 'worked_trace_06:gt01_interpretation_dependency'
    or dependent_row.origin <> 'ecb_inference'
    or dependent_row.epistemic_standing <> 'unassessed'
    or dependent_row.subject_referent_id is not null
    or dependent_row.predicate is not null
    or dependent_row.object_referent_id is not null then
    raise exception 'BUILD 4 dependent assertion Claim fixture drifted';
  end if;

  if not exists (
      select 1 from public.referents
      where id = 'c7f7d330-e778-4ae5-be96-3a172bea1166'
    )
    or not exists (
      select 1 from public.referents
      where id = 'cb429206-5abd-4adb-8ff9-d6d6a885034c'
    ) then
    raise exception 'BUILD 4 fixture Referent coupling is absent';
  end if;

  if dependent_row.asserted_at <> relation_row.asserted_at then
    raise exception 'BUILD 4 activation did not assert both Claims in one transaction';
  end if;

  select * into preserved_claim
  from public.claims
  where id = '0f89e778-b16e-4840-9129-a2aa3eb6f697';

  if preserved_claim.claim_kind <> 'assertion'
    or preserved_claim.proposition
       <> 'The described scene contains both a brass heron and a violet staircase.'
    or preserved_claim.scope <> 'worked_trace_03:gt01_interpretation'
    or preserved_claim.origin <> 'ecb_inference'
    or preserved_claim.epistemic_standing <> 'unassessed'
    or preserved_claim.subject_referent_id is not null
    or preserved_claim.predicate is not null
    or preserved_claim.object_referent_id is not null then
    raise exception 'BUILD 4 did not preserve accepted BUILD 3 Claim C';
  end if;

  select * into preserved_link
  from public.evidence_links
  where id = '4c6c0f50-a936-4da6-bb09-233f93320639';

  if preserved_link.claim_id <> '0f89e778-b16e-4840-9129-a2aa3eb6f697'
    or preserved_link.evidence_referent_id <> '19a949ea-a8fc-4250-a386-fa64e5530180'
    or preserved_link.role <> 'used_as_basis'
    or preserved_link.evidence_revision_scheme <> 'ecb_thought_revision_v1_sha256'
    or pg_catalog.encode(preserved_link.evidence_revision_digest, 'hex')
       <> '5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55' then
    raise exception 'BUILD 4 did not preserve accepted BUILD 3 Evidence Link L';
  end if;

  if (select count(*) from public.claims) <> 3
    or (select count(*) from public.evidence_links) <> 1
    or (select count(*) from public.referents) <> 6
    or (select count(*) from public.thoughts) <> 1 then
    raise exception 'BUILD 4 canonical expansion is not exactly two Claims and two Referents';
  end if;
end;
$$;

commit;
