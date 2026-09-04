-- BUILD 3 — Claims + Standing + Evidence Links
-- Atomic activation of assertion Claims, historical evidence lineage, and
-- database-derived Thought revision anchors.

begin;

create extension if not exists pgcrypto with schema extensions;

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  proposition text not null,
  scope text not null,
  claim_kind text not null,
  origin text not null,
  epistemic_standing text not null,
  asserted_at timestamptz not null,
  constraint claims_proposition_nonempty
    check (length(btrim(proposition)) > 0),
  constraint claims_scope_nonempty
    check (length(btrim(scope)) > 0),
  constraint claims_kind_assertion
    check (claim_kind = 'assertion'),
  constraint claims_origin_ecb_inference
    check (origin = 'ecb_inference'),
  constraint claims_standing_unassessed
    check (epistemic_standing = 'unassessed'),
  constraint claims_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable
);

create table public.evidence_links (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null,
  evidence_referent_id uuid not null,
  role text not null,
  evidence_revision_scheme text not null,
  evidence_revision_digest bytea not null,
  linked_at timestamptz not null,
  constraint evidence_links_role_used_as_basis
    check (role = 'used_as_basis'),
  constraint evidence_links_revision_scheme_v1
    check (evidence_revision_scheme = 'ecb_thought_revision_v1_sha256'),
  constraint evidence_links_revision_digest_sha256
    check (octet_length(evidence_revision_digest) = 32),
  constraint evidence_links_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint evidence_links_claim_fkey
    foreign key (claim_id)
    references public.claims (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint evidence_links_evidence_referent_fkey
    foreign key (evidence_referent_id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable
);

create function public.prepare_claim()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.referents (id)
  values (new.id);

  new.claim_kind := 'assertion';
  new.origin := 'ecb_inference';
  new.epistemic_standing := 'unassessed';
  new.asserted_at := pg_catalog.transaction_timestamp();

  return new;
end;
$$;

revoke all on function public.prepare_claim()
  from public, anon, authenticated, service_role;

create trigger claims_prepare
before insert on public.claims
for each row
execute function public.prepare_claim();

create function public.prepare_evidence_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  evidence_content text;
  evidence_source text;
  evidence_captured_at timestamptz;
  content_octets bytea;
  source_octets bytea;
  captured_at_microseconds bigint;
  digest_input bytea;
begin
  select thought.content, thought.source, thought.captured_at
  into strict evidence_content, evidence_source, evidence_captured_at
  from public.thoughts as thought
  where thought.id = new.evidence_referent_id
  for share;

  if not pg_catalog.isfinite(evidence_captured_at) then
    raise exception 'BUILD 3 evidence captured_at must be finite'
      using errcode = '22008';
  end if;

  content_octets := pg_catalog.convert_to(evidence_content, 'UTF8');
  source_octets := pg_catalog.convert_to(evidence_source, 'UTF8');
  captured_at_microseconds :=
    (extract(epoch from evidence_captured_at) * 1000000)::bigint;

  digest_input :=
    pg_catalog.convert_to('ECB-THOUGHT-REVISION-V1', 'UTF8')
    || pg_catalog.decode('00', 'hex')
    || pg_catalog.decode('01', 'hex')
    || pg_catalog.int8send(pg_catalog.octet_length(content_octets)::bigint)
    || content_octets
    || pg_catalog.decode('02', 'hex')
    || pg_catalog.int8send(pg_catalog.octet_length(source_octets)::bigint)
    || source_octets
    || pg_catalog.decode('03', 'hex')
    || pg_catalog.int8send(8::bigint)
    || pg_catalog.int8send(captured_at_microseconds);

  insert into public.referents (id)
  values (new.id);

  new.role := 'used_as_basis';
  new.evidence_revision_scheme := 'ecb_thought_revision_v1_sha256';
  new.evidence_revision_digest := extensions.digest(digest_input, 'sha256');
  new.linked_at := pg_catalog.transaction_timestamp();

  return new;
exception
  when no_data_found then
    raise exception 'BUILD 3 evidence Thought % is unavailable', new.evidence_referent_id
      using errcode = 'P0002';
end;
$$;

revoke all on function public.prepare_evidence_link()
  from public, anon, authenticated, service_role;

create trigger evidence_links_prepare
before insert on public.evidence_links
for each row
execute function public.prepare_evidence_link();

insert into public.claims (id, proposition, scope)
values (
  '0f89e778-b16e-4840-9129-a2aa3eb6f697',
  'The described scene contains both a brass heron and a violet staircase.',
  'worked_trace_03:gt01_interpretation'
);

insert into public.evidence_links (id, claim_id, evidence_referent_id)
values (
  '4c6c0f50-a936-4da6-bb09-233f93320639',
  '0f89e778-b16e-4840-9129-a2aa3eb6f697',
  '19a949ea-a8fc-4250-a386-fa64e5530180'
);

alter table public.claims enable row level security;
alter table public.evidence_links enable row level security;

revoke all on table public.claims
  from public, anon, authenticated, service_role;
revoke all on table public.evidence_links
  from public, anon, authenticated, service_role;

grant select on table public.claims to service_role;
grant insert (id, proposition, scope) on table public.claims to service_role;
grant select on table public.evidence_links to service_role;
grant insert (id, claim_id, evidence_referent_id)
  on table public.evidence_links to service_role;

do $$
declare
  public_tables text[];
  public_functions text[];
  claim_columns text[];
  link_columns text[];
  restrictive_foreign_keys integer;
  build_3_policies integer;
  fixture_rows integer;
  fixture_digest text;
  fixture_asserted_at timestamptz;
  fixture_linked_at timestamptz;
  probe_residue integer;
begin
  if pg_catalog.current_setting('server_encoding') <> 'UTF8' then
    raise exception 'BUILD 3 requires UTF8 server encoding';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_extension as extension
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto'
      and namespace.nspname = 'extensions'
  ) then
    raise exception 'BUILD 3 pgcrypto dependency is absent from extensions';
  end if;

  select pg_catalog.array_agg(table_name order by table_name)
  into public_tables
  from information_schema.tables
  where table_schema = 'public'
    and table_type = 'BASE TABLE';

  if public_tables is distinct from
    array['claims', 'evidence_links', 'referents', 'thoughts'] then
    raise exception 'BUILD 3 public table surface drifted: %', public_tables;
  end if;

  if exists (
    select 1
    from information_schema.views
    where table_schema = 'public'
  ) then
    raise exception 'BUILD 3 produced a public view';
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
    raise exception 'BUILD 3 public function surface drifted: %', public_functions;
  end if;

  select pg_catalog.array_agg(column_name order by ordinal_position)
  into claim_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'claims';

  select pg_catalog.array_agg(column_name order by ordinal_position)
  into link_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'evidence_links';

  if claim_columns is distinct from array[
      'id', 'proposition', 'scope', 'claim_kind', 'origin',
      'epistemic_standing', 'asserted_at'
    ] then
    raise exception 'BUILD 3 Claim columns drifted: %', claim_columns;
  end if;

  if link_columns is distinct from array[
      'id', 'claim_id', 'evidence_referent_id', 'role',
      'evidence_revision_scheme', 'evidence_revision_digest', 'linked_at'
    ] then
    raise exception 'BUILD 3 Evidence Link columns drifted: %', link_columns;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('claims', 'evidence_links')
      and (
        is_nullable <> 'NO'
        or data_type not in (
          'uuid', 'text', 'bytea', 'timestamp with time zone'
        )
        or (column_name <> 'id' and column_default is not null)
      )
  ) or exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('claims', 'evidence_links')
      and column_name = 'id'
      and column_default <> 'gen_random_uuid()'
  ) then
    raise exception 'BUILD 3 column type, nullability, or default drifted';
  end if;

  if (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::pg_catalog.regclass
        and contype = 'p'
    ) <> 1
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::pg_catalog.regclass
        and contype = 'c'
    ) <> 5
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::pg_catalog.regclass
        and contype = 'f'
    ) <> 1
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::pg_catalog.regclass
        and contype = 'u'
    ) <> 0
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.evidence_links'::pg_catalog.regclass
        and contype = 'p'
    ) <> 1
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.evidence_links'::pg_catalog.regclass
        and contype = 'c'
    ) <> 3
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.evidence_links'::pg_catalog.regclass
        and contype = 'f'
    ) <> 3
    or (
      select count(*)
      from pg_catalog.pg_constraint
      where conrelid = 'public.evidence_links'::pg_catalog.regclass
        and contype = 'u'
    ) <> 0 then
    raise exception 'BUILD 3 native constraint surface drifted';
  end if;

  select count(*)
  into restrictive_foreign_keys
  from pg_catalog.pg_constraint
  where conrelid in (
      'public.claims'::pg_catalog.regclass,
      'public.evidence_links'::pg_catalog.regclass
    )
    and contype = 'f'
    and not condeferrable
    and not condeferred
    and confupdtype = 'r'
    and confdeltype = 'r';

  if restrictive_foreign_keys <> 4 then
    raise exception 'BUILD 3 restrictive foreign-key surface drifted';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.evidence_links'::pg_catalog.regclass
      and contype = 'f'
      and confrelid = 'public.thoughts'::pg_catalog.regclass
  ) then
    raise exception 'BUILD 3 Evidence Link must not depend on Thought retention';
  end if;

  if (
      select count(*)
      from pg_catalog.pg_trigger
      where tgrelid in (
          'public.claims'::pg_catalog.regclass,
          'public.evidence_links'::pg_catalog.regclass
        )
        and not tgisinternal
    ) <> 2
    or (
      select count(*)
      from pg_catalog.pg_proc as procedure
      join pg_catalog.pg_namespace as namespace
        on namespace.oid = procedure.pronamespace
      where namespace.nspname = 'public'
        and procedure.proname in ('prepare_claim', 'prepare_evidence_link')
    ) <> 2 then
    raise exception 'BUILD 3 trigger/function surface drifted';
  end if;

  if not exists (
      select 1
      from pg_catalog.pg_proc as procedure
      join pg_catalog.pg_namespace as namespace
        on namespace.oid = procedure.pronamespace
      where namespace.nspname = 'public'
        and procedure.proname = 'prepare_claim'
        and not procedure.prosecdef
        and procedure.proconfig @> array['search_path=""']
        and not pg_catalog.has_function_privilege('anon', procedure.oid, 'execute')
        and not pg_catalog.has_function_privilege('authenticated', procedure.oid, 'execute')
        and not pg_catalog.has_function_privilege('service_role', procedure.oid, 'execute')
    ) or not exists (
      select 1
      from pg_catalog.pg_proc as procedure
      join pg_catalog.pg_namespace as namespace
        on namespace.oid = procedure.pronamespace
      where namespace.nspname = 'public'
        and procedure.proname = 'prepare_evidence_link'
        and procedure.prosecdef
        and procedure.proowner = pg_catalog.to_regrole(current_user)::oid
        and procedure.proconfig @> array['search_path=""']
        and not pg_catalog.has_function_privilege('anon', procedure.oid, 'execute')
        and not pg_catalog.has_function_privilege('authenticated', procedure.oid, 'execute')
        and not pg_catalog.has_function_privilege('service_role', procedure.oid, 'execute')
    ) then
    raise exception 'BUILD 3 trigger-function security boundary drifted';
  end if;

  select count(*)
  into build_3_policies
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in ('claims', 'evidence_links');

  if build_3_policies <> 0
    or not (
      select relrowsecurity
      from pg_catalog.pg_class
      where oid = 'public.claims'::pg_catalog.regclass
    )
    or not (
      select relrowsecurity
      from pg_catalog.pg_class
      where oid = 'public.evidence_links'::pg_catalog.regclass
    ) then
    raise exception 'BUILD 3 RLS boundary drifted';
  end if;

  if not pg_catalog.has_table_privilege('service_role', 'public.claims', 'select')
    or pg_catalog.has_table_privilege('service_role', 'public.claims', 'insert')
    or pg_catalog.has_table_privilege('service_role', 'public.claims', 'update')
    or pg_catalog.has_table_privilege('service_role', 'public.claims', 'delete')
    or not pg_catalog.has_column_privilege('service_role', 'public.claims', 'id', 'insert')
    or not pg_catalog.has_column_privilege('service_role', 'public.claims', 'proposition', 'insert')
    or not pg_catalog.has_column_privilege('service_role', 'public.claims', 'scope', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.claims', 'claim_kind', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.claims', 'origin', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.claims', 'asserted_at', 'insert')
    or not pg_catalog.has_table_privilege('service_role', 'public.evidence_links', 'select')
    or pg_catalog.has_table_privilege('service_role', 'public.evidence_links', 'insert')
    or pg_catalog.has_table_privilege('service_role', 'public.evidence_links', 'update')
    or pg_catalog.has_table_privilege('service_role', 'public.evidence_links', 'delete')
    or not pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'id', 'insert')
    or not pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'claim_id', 'insert')
    or not pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'evidence_referent_id', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'role', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'evidence_revision_scheme', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'evidence_revision_digest', 'insert')
    or pg_catalog.has_column_privilege('service_role', 'public.evidence_links', 'linked_at', 'insert') then
    raise exception 'BUILD 3 service-role grant surface drifted';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles as role
    where role.rolname in ('anon', 'authenticated')
      and (
        pg_catalog.has_any_column_privilege(
          role.rolname, 'public.claims', 'select, insert, update'
        )
        or pg_catalog.has_table_privilege(
          role.rolname, 'public.claims', 'delete'
        )
        or pg_catalog.has_any_column_privilege(
          role.rolname, 'public.evidence_links', 'select, insert, update'
        )
        or pg_catalog.has_table_privilege(
          role.rolname, 'public.evidence_links', 'delete'
        )
      )
  ) then
    raise exception 'BUILD 3 client role access drifted';
  end if;

  select count(*),
    min(pg_catalog.encode(link.evidence_revision_digest, 'hex')),
    min(claim.asserted_at),
    min(link.linked_at)
  into fixture_rows, fixture_digest, fixture_asserted_at, fixture_linked_at
  from public.claims as claim
  join public.evidence_links as link on link.claim_id = claim.id
  join public.referents as claim_referent on claim_referent.id = claim.id
  join public.referents as link_referent on link_referent.id = link.id
  where claim.id = '0f89e778-b16e-4840-9129-a2aa3eb6f697'
    and claim.proposition = 'The described scene contains both a brass heron and a violet staircase.'
    and claim.scope = 'worked_trace_03:gt01_interpretation'
    and claim.claim_kind = 'assertion'
    and claim.origin = 'ecb_inference'
    and claim.epistemic_standing = 'unassessed'
    and link.id = '4c6c0f50-a936-4da6-bb09-233f93320639'
    and link.evidence_referent_id = '19a949ea-a8fc-4250-a386-fa64e5530180'
    and link.role = 'used_as_basis'
    and link.evidence_revision_scheme = 'ecb_thought_revision_v1_sha256';

  if fixture_rows <> 1
    or fixture_digest <> '5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55'
    or fixture_asserted_at is distinct from fixture_linked_at then
    raise exception 'BUILD 3 canonical fixture drifted';
  end if;

  if not exists (
    select 1
    from public.thoughts
    where id = '19a949ea-a8fc-4250-a386-fa64e5530180'
      and content = 'GT01: The brass heron waits beneath the violet staircase.'
      and source = 'golden_trace_01'
      and captured_at = '2026-09-04T00:12:35.225093+00:00'::timestamptz
      and embedding_model = 'gte-small'
      and extensions.vector_dims(embedding) = 384
  ) then
    raise exception 'BUILD 3 GT01 baseline drifted';
  end if;

  if (
      select count(*)
      from public.referents
    ) <> 4
    or (
      select count(*)
      from public.claims
    ) <> 1
    or (
      select count(*)
      from public.evidence_links
    ) <> 1 then
    raise exception 'BUILD 3 canonical object count drifted';
  end if;

  select count(*)
  into probe_residue
  from public.referents
  where id in (
    'cf0ca1fc-a4f7-487b-aea5-cfb23a467919',
    'c85a5356-0930-4c94-a30d-cfd0e53a0a42',
    '6c7cc7be-c23f-434f-a8eb-927cbe80b99b'
  );

  if probe_residue <> 0 then
    raise exception 'BUILD 3 probe residue exists during activation';
  end if;
end;
$$;

commit;
