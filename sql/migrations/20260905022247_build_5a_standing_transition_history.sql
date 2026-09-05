-- BUILD 5A — Immutable Events + Standing Transition History
-- Atomic activation of the immutable, Referent-backed standing transition record
-- that is the only legal path for changing a Claim's applied epistemic standing.
-- No view, resolver, RPC, index, Artifact, or transformation receipt.

begin;

create table public.claim_standing_transitions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null,
  from_standing text not null,
  to_standing text not null,
  basis_evidence_link_id uuid not null,
  observed_revision_digest bytea not null,
  recorded_at timestamptz not null,
  constraint claim_standing_transitions_from_vocabulary
    check (from_standing in ('unassessed', 'basis_qualified', 'revalidation_required')),
  constraint claim_standing_transitions_to_vocabulary
    check (to_standing in ('unassessed', 'basis_qualified', 'revalidation_required')),
  constraint claim_standing_transitions_changes_standing
    check (from_standing <> to_standing),
  constraint claim_standing_transitions_digest_sha256
    check (octet_length(observed_revision_digest) = 32),
  constraint claim_standing_transitions_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint claim_standing_transitions_claim_referent_fkey
    foreign key (claim_id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint claim_standing_transitions_basis_referent_fkey
    foreign key (basis_evidence_link_id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable
);

create function public.thought_revision_digest(evidence_referent_id uuid)
returns bytea
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
  where thought.id = evidence_referent_id
  for share;

  if not pg_catalog.isfinite(evidence_captured_at) then
    raise exception 'BUILD 5A evidence captured_at must be finite'
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

  return extensions.digest(digest_input, 'sha256');
exception
  when no_data_found then
    raise exception 'BUILD 5A evidence Thought % is unavailable', evidence_referent_id
      using errcode = 'P0002';
end;
$$;

revoke all on function public.thought_revision_digest(uuid)
  from public, anon, authenticated, service_role;

create function public.prepare_claim_standing_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  basis_claim_id uuid;
  basis_evidence_referent_id uuid;
  applied_standing text;
begin
  insert into public.referents (id)
  values (new.id);

  select link.claim_id, link.evidence_referent_id
  into strict basis_claim_id, basis_evidence_referent_id
  from public.evidence_links as link
  where link.id = new.basis_evidence_link_id;

  if basis_claim_id <> new.claim_id then
    raise exception
      'BUILD 5A basis Evidence Link % does not declare a basis for Claim %',
      new.basis_evidence_link_id, new.claim_id
      using errcode = '23514';
  end if;

  select claim.epistemic_standing
  into strict applied_standing
  from public.claims as claim
  where claim.id = new.claim_id
  for update;

  if applied_standing <> new.from_standing then
    raise exception
      'BUILD 5A declared prior standing % does not match applied standing %',
      new.from_standing, applied_standing
      using errcode = '40001';
  end if;

  new.observed_revision_digest :=
    public.thought_revision_digest(basis_evidence_referent_id);
  new.recorded_at := pg_catalog.transaction_timestamp();

  update public.claims
  set epistemic_standing = new.to_standing
  where id = new.claim_id;

  return new;
exception
  when no_data_found then
    raise exception
      'BUILD 5A subject Claim or basis Evidence Link is unavailable'
      using errcode = 'P0002';
end;
$$;

revoke all on function public.prepare_claim_standing_transition()
  from public, anon, authenticated, service_role;

create trigger claim_standing_transitions_prepare
before insert on public.claim_standing_transitions
for each row
execute function public.prepare_claim_standing_transition();

alter table public.claims
  drop constraint claims_standing_unassessed;

alter table public.claims
  add constraint claims_standing_vocabulary
    check (
      epistemic_standing in
        ('unassessed', 'basis_qualified', 'revalidation_required')
    );

insert into public.claim_standing_transitions (
  id, claim_id, from_standing, to_standing, basis_evidence_link_id
)
values (
  'a6925494-a862-441b-a361-5f5ec41dc9dc',
  '0f89e778-b16e-4840-9129-a2aa3eb6f697',
  'unassessed',
  'basis_qualified',
  '4c6c0f50-a936-4da6-bb09-233f93320639'
);

alter table public.claim_standing_transitions enable row level security;

revoke all on table public.claim_standing_transitions
  from public, anon, authenticated, service_role;

grant select on table public.claim_standing_transitions to service_role;
grant insert (
  id, claim_id, from_standing, to_standing, basis_evidence_link_id
) on table public.claim_standing_transitions to service_role;

do $$
declare
  public_tables text[];
  public_functions text[];
  transition_columns text[];
  transition_constraints text[];
  restrictive_foreign_keys integer;
  transition_row public.claim_standing_transitions%rowtype;
  subject_claim public.claims%rowtype;
  dependent_claim public.claims%rowtype;
  relation_claim public.claims%rowtype;
  preserved_link public.evidence_links%rowtype;
begin
  select pg_catalog.array_agg(table_name order by table_name)
  into public_tables
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE';

  if public_tables is distinct from array[
      'claim_standing_transitions', 'claims', 'evidence_links', 'referents', 'thoughts'
    ] then
    raise exception 'BUILD 5A public table surface drifted: %', public_tables;
  end if;

  if exists (
    select 1 from information_schema.views where table_schema = 'public'
  ) then
    raise exception 'BUILD 5A produced a public view';
  end if;

  select pg_catalog.array_agg(procedure.proname order by procedure.proname, procedure.oid)
  into public_functions
  from pg_catalog.pg_proc as procedure
  join pg_catalog.pg_namespace as namespace
    on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public';

  if public_functions is distinct from array[
      'prepare_claim', 'prepare_claim_standing_transition', 'prepare_evidence_link',
      'register_thought_referent', 'search_thoughts', 'thought_revision_digest'
    ] then
    raise exception 'BUILD 5A public function surface drifted: %', public_functions;
  end if;

  select pg_catalog.array_agg(column_name order by ordinal_position)
  into transition_columns
  from information_schema.columns
  where table_schema = 'public' and table_name = 'claim_standing_transitions';

  if transition_columns is distinct from array[
      'id', 'claim_id', 'from_standing', 'to_standing',
      'basis_evidence_link_id', 'observed_revision_digest', 'recorded_at'
    ] then
    raise exception 'BUILD 5A transition columns drifted: %', transition_columns;
  end if;

  select pg_catalog.array_agg(conname order by conname)
  into transition_constraints
  from pg_catalog.pg_constraint
  where conrelid = 'public.claim_standing_transitions'::regclass
    and contype in ('c', 'f');

  if transition_constraints is distinct from array[
      'claim_standing_transitions_basis_referent_fkey',
      'claim_standing_transitions_changes_standing',
      'claim_standing_transitions_claim_referent_fkey',
      'claim_standing_transitions_digest_sha256',
      'claim_standing_transitions_from_vocabulary',
      'claim_standing_transitions_referent_fkey',
      'claim_standing_transitions_to_vocabulary'
    ] then
    raise exception 'BUILD 5A transition constraint surface drifted: %', transition_constraints;
  end if;

  select count(*)
  into restrictive_foreign_keys
  from pg_catalog.pg_constraint
  where conrelid = 'public.claim_standing_transitions'::regclass
    and contype = 'f'
    and confrelid = 'public.referents'::regclass
    and not condeferrable
    and not condeferred
    and confupdtype = 'r'
    and confdeltype = 'r';

  if restrictive_foreign_keys <> 3 then
    raise exception 'BUILD 5A restrictive transition foreign keys drifted: %',
      restrictive_foreign_keys;
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.claim_standing_transitions'::regclass
      and contype = 'f'
      and confrelid <> 'public.referents'::regclass
  ) then
    raise exception 'BUILD 5A transition depends on a native record table';
  end if;

  if (
      select count(*) from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::regclass
        and conname = 'claims_standing_vocabulary'
    ) <> 1
    or exists (
      select 1 from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::regclass
        and conname = 'claims_standing_unassessed'
    )
    or (
      select count(*) from pg_catalog.pg_constraint
      where conrelid = 'public.claims'::regclass and contype in ('c', 'f')
    ) <> 10 then
    raise exception 'BUILD 5A changed the Claim constraint surface beyond the standing vocabulary';
  end if;

  if has_table_privilege('service_role', 'public.claims', 'update')
    or has_table_privilege('service_role', 'public.claims', 'delete')
    or has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'update') then
    raise exception 'BUILD 5A weakened the Claim no-UPDATE posture';
  end if;

  if not (
      select relrowsecurity from pg_catalog.pg_class
      where oid = 'public.claim_standing_transitions'::regclass
    )
    or (
      select count(*) from pg_catalog.pg_policies
      where schemaname = 'public' and tablename = 'claim_standing_transitions'
    ) <> 0 then
    raise exception 'BUILD 5A transition RLS boundary drifted';
  end if;

  if not has_table_privilege('service_role', 'public.claim_standing_transitions', 'select')
    or has_table_privilege('service_role', 'public.claim_standing_transitions', 'insert')
    or has_table_privilege('service_role', 'public.claim_standing_transitions', 'update')
    or has_table_privilege('service_role', 'public.claim_standing_transitions', 'delete')
    or not has_column_privilege('service_role', 'public.claim_standing_transitions', 'claim_id', 'insert')
    or has_column_privilege('service_role', 'public.claim_standing_transitions', 'observed_revision_digest', 'insert')
    or has_column_privilege('service_role', 'public.claim_standing_transitions', 'recorded_at', 'insert')
    or has_any_column_privilege('anon', 'public.claim_standing_transitions', 'select, insert, update')
    or has_any_column_privilege('authenticated', 'public.claim_standing_transitions', 'select, insert, update') then
    raise exception 'BUILD 5A transition privilege boundary drifted';
  end if;

  if has_function_privilege('service_role', 'public.thought_revision_digest(uuid)', 'execute')
    or has_function_privilege('anon', 'public.thought_revision_digest(uuid)', 'execute')
    or has_function_privilege('authenticated', 'public.thought_revision_digest(uuid)', 'execute') then
    raise exception 'BUILD 5A left a revision-digest function callable';
  end if;

  select * into transition_row
  from public.claim_standing_transitions
  where id = 'a6925494-a862-441b-a361-5f5ec41dc9dc';

  if transition_row.claim_id <> '0f89e778-b16e-4840-9129-a2aa3eb6f697'
    or transition_row.from_standing <> 'unassessed'
    or transition_row.to_standing <> 'basis_qualified'
    or transition_row.basis_evidence_link_id <> '4c6c0f50-a936-4da6-bb09-233f93320639'
    or pg_catalog.encode(transition_row.observed_revision_digest, 'hex')
       <> '5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55'
    or transition_row.recorded_at <> pg_catalog.transaction_timestamp() then
    raise exception 'BUILD 5A canonical transition fixture drifted';
  end if;

  if not exists (
    select 1 from public.referents where id = 'a6925494-a862-441b-a361-5f5ec41dc9dc'
  ) then
    raise exception 'BUILD 5A transition Referent coupling is absent';
  end if;

  select * into subject_claim
  from public.claims where id = '0f89e778-b16e-4840-9129-a2aa3eb6f697';

  if subject_claim.epistemic_standing <> 'basis_qualified'
    or subject_claim.claim_kind <> 'assertion'
    or subject_claim.origin <> 'ecb_inference'
    or subject_claim.proposition
       <> 'The described scene contains both a brass heron and a violet staircase.'
    or subject_claim.scope <> 'worked_trace_03:gt01_interpretation'
    or subject_claim.asserted_at <> '2026-09-04 16:39:38.624321+00'::timestamptz then
    raise exception 'BUILD 5A did not apply the transition to Claim C exactly';
  end if;

  select * into dependent_claim
  from public.claims where id = 'c7f7d330-e778-4ae5-be96-3a172bea1166';
  select * into relation_claim
  from public.claims where id = 'cb429206-5abd-4adb-8ff9-d6d6a885034c';

  if dependent_claim.epistemic_standing <> 'unassessed'
    or relation_claim.epistemic_standing <> 'unassessed'
    or relation_claim.claim_kind <> 'relation'
    or relation_claim.predicate <> 'depends_on'
    or relation_claim.subject_referent_id <> 'c7f7d330-e778-4ae5-be96-3a172bea1166'
    or relation_claim.object_referent_id <> '0f89e778-b16e-4840-9129-a2aa3eb6f697' then
    raise exception 'BUILD 5A propagated a standing change to C2 or relation Claim R';
  end if;

  select * into preserved_link
  from public.evidence_links where id = '4c6c0f50-a936-4da6-bb09-233f93320639';

  if preserved_link.role <> 'used_as_basis'
    or preserved_link.evidence_revision_scheme <> 'ecb_thought_revision_v1_sha256'
    or pg_catalog.encode(preserved_link.evidence_revision_digest, 'hex')
       <> '5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55'
    or preserved_link.claim_id <> '0f89e778-b16e-4840-9129-a2aa3eb6f697'
    or preserved_link.evidence_referent_id <> '19a949ea-a8fc-4250-a386-fa64e5530180' then
    raise exception 'BUILD 5A mutated accepted Evidence Link L';
  end if;

  if (select count(*) from public.claim_standing_transitions) <> 1
    or (select count(*) from public.claims) <> 3
    or (select count(*) from public.evidence_links) <> 1
    or (select count(*) from public.referents) <> 7
    or (select count(*) from public.thoughts) <> 1 then
    raise exception 'BUILD 5A canonical expansion is not exactly one transition and one Referent';
  end if;
end;
$$;

commit;
