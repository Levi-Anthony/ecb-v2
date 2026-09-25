-- ECO-138 — ECOS universal admission aperture: neutral encounter provenance + active disposition.
--
-- Governing laws:
--   * admission transfers custody, not authority;
--   * capture broadly, think selectively;
--   * canonical Thought evidence is not rewritten by custody metadata;
--   * operational disposition is not epistemic standing, truth, authority, priority, or routing;
--   * unknown/unresolved is legitimate current state;
--   * BUILD 11 ordinary operation identity remains the replay/conflict protocol.

begin;

create schema eco138;
revoke all on schema eco138 from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Admission encounter context. This table adds only facts about the custody
-- transfer encounter; Thought content/source remain the canonical evidence.
-- ---------------------------------------------------------------------------

create table public.thought_admissions (
  operation_id uuid primary key,
  producer_context text,
  parent_operation_id uuid,
  constraint thought_admissions_operation_fkey
    foreign key (operation_id)
    references public.ordinary_operations (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_admissions_parent_operation_fkey
    foreign key (parent_operation_id)
    references public.ordinary_operations (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_admissions_context_nonempty
    check (producer_context is null or length(producer_context) > 0),
  constraint thought_admissions_parent_not_self
    check (parent_operation_id is null or parent_operation_id <> operation_id)
);

comment on table public.thought_admissions is
  'ECO-138 neutral custody-transfer context keyed by the admission operation. This is provenance, not a Claim, standing, authority, route, priority, or interpretation.';

alter table public.thought_admissions enable row level security;
revoke all on table public.thought_admissions
  from public, anon, authenticated, service_role;

-- Existing BUILD 11 capture receipts are legitimate legacy admissions with no
-- additional producer context. Do not invent context or parentage.
insert into public.thought_admissions (operation_id)
select operation.id
from public.ordinary_operations as operation
where operation.operation_kind = 'capture_thought'
on conflict (operation_id) do nothing;

-- ---------------------------------------------------------------------------
-- Active operational disposition. Revisions are immutable first-class
-- Referents; one small mutable head per Thought provides exact currentness.
-- The current pointer never erases history.
-- ---------------------------------------------------------------------------

create table public.thought_disposition_revisions (
  id uuid primary key,
  thought_id uuid not null,
  predecessor_revision_id uuid,
  disposition text not null,
  reentry_condition text,
  recorded_at timestamptz not null default transaction_timestamp(),
  constraint thought_disposition_revisions_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_disposition_revisions_thought_fkey
    foreign key (thought_id)
    references public.thoughts (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_disposition_revisions_predecessor_fkey
    foreign key (predecessor_revision_id)
    references public.thought_disposition_revisions (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_disposition_revisions_disposition_nonempty
    check (length(btrim(disposition)) > 0),
  constraint thought_disposition_revisions_reentry_nonempty
    check (reentry_condition is null or length(reentry_condition) > 0)
);

comment on table public.thought_disposition_revisions is
  'ECO-138 immutable operational-disposition history for admitted Thought evidence. Disposition answers what ECOS is doing with the material now; it does not confer epistemic or governance standing.';

create table public.thought_disposition_heads (
  thought_id uuid primary key,
  current_revision_id uuid not null unique,
  constraint thought_disposition_heads_thought_fkey
    foreign key (thought_id)
    references public.thoughts (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_disposition_heads_revision_fkey
    foreign key (current_revision_id)
    references public.thought_disposition_revisions (id)
    on update restrict
    on delete restrict
    not deferrable
);

comment on table public.thought_disposition_heads is
  'ECO-138 exact current operational-disposition pointer. Currentness is explicit and must never be inferred from newest revision.';

alter table public.thought_disposition_revisions enable row level security;
alter table public.thought_disposition_heads enable row level security;
revoke all on table public.thought_disposition_revisions
  from public, anon, authenticated, service_role;
revoke all on table public.thought_disposition_heads
  from public, anon, authenticated, service_role;

create function eco138.prepare_disposition_revision()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  predecessor_thought_id uuid;
begin
  if new.predecessor_revision_id is not null then
    select revision.thought_id
    into strict predecessor_thought_id
    from public.thought_disposition_revisions as revision
    where revision.id = new.predecessor_revision_id;

    if predecessor_thought_id <> new.thought_id then
      raise exception 'eco138_disposition_predecessor_subject_mismatch'
        using errcode = '23514';
    end if;
  end if;

  insert into public.referents (id) values (new.id);
  new.recorded_at := pg_catalog.transaction_timestamp();
  return new;
end;
$$;

create function eco138.reject_disposition_revision_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'eco138_disposition_revision_immutable'
    using errcode = '55000';
end;
$$;

revoke all on function eco138.prepare_disposition_revision()
  from public, anon, authenticated, service_role;
revoke all on function eco138.reject_disposition_revision_mutation()
  from public, anon, authenticated, service_role;

create trigger thought_disposition_revisions_prepare
before insert on public.thought_disposition_revisions
for each row
execute function eco138.prepare_disposition_revision();

create trigger thought_disposition_revisions_immutable
before update or delete on public.thought_disposition_revisions
for each row
execute function eco138.reject_disposition_revision_mutation();

-- Establish a truthful current disposition for evidence that predates this
-- mechanism. The migration records present initialization time; it does not
-- pretend the disposition existed historically.
create temporary table eco138_backfill_dispositions on commit drop as
select thought.id as thought_id, gen_random_uuid() as revision_id
from public.thoughts as thought
left join public.thought_disposition_heads as head
  on head.thought_id = thought.id
where head.thought_id is null;

insert into public.thought_disposition_revisions (
  id, thought_id, predecessor_revision_id, disposition, reentry_condition
)
select revision_id, thought_id, null, 'unresolved', null
from eco138_backfill_dispositions;

insert into public.thought_disposition_heads (thought_id, current_revision_id)
select thought_id, revision_id
from eco138_backfill_dispositions;

-- ---------------------------------------------------------------------------
-- Request identity. New admissions include optional producer context and parent
-- receipt in deterministic equivalence. Legacy BUILD 11 operation receipts keep
-- their original V1 digest and replay law.
-- ---------------------------------------------------------------------------

create function eco138.admission_request_digest(
  p_content text,
  p_source text,
  p_captured_at timestamptz,
  p_producer_context text,
  p_parent_operation_id uuid
)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  base_digest bytea;
  context_octets bytea;
  digest_input bytea;
begin
  base_digest := ecb11.capture_request_digest(
    p_content,
    p_source,
    p_captured_at
  );

  if p_producer_context is not null and length(p_producer_context) = 0 then
    raise exception 'eco138_producer_context_empty'
      using errcode = '22023';
  end if;

  digest_input :=
    pg_catalog.convert_to('ECO138-ADMISSION-REQUEST-V1', 'UTF8')
    || pg_catalog.decode('00', 'hex')
    || base_digest
    || pg_catalog.decode('04', 'hex');

  if p_producer_context is null then
    digest_input := digest_input || pg_catalog.decode('00', 'hex');
  else
    context_octets := pg_catalog.convert_to(p_producer_context, 'UTF8');
    digest_input :=
      digest_input
      || pg_catalog.decode('01', 'hex')
      || pg_catalog.int8send(pg_catalog.octet_length(context_octets)::bigint)
      || context_octets;
  end if;

  digest_input := digest_input || pg_catalog.decode('05', 'hex');
  if p_parent_operation_id is null then
    digest_input := digest_input || pg_catalog.decode('00', 'hex');
  else
    digest_input :=
      digest_input
      || pg_catalog.decode('01', 'hex')
      || pg_catalog.uuid_send(p_parent_operation_id);
  end if;

  return extensions.digest(digest_input, 'sha256');
end;
$$;

create function eco138.disposition_request_digest(
  p_thought_id uuid,
  p_expected_revision_id uuid,
  p_disposition text,
  p_reentry_condition text
)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  disposition_octets bytea;
  reentry_octets bytea;
  digest_input bytea;
begin
  if p_thought_id is null or p_expected_revision_id is null then
    raise exception 'eco138_disposition_identity_required'
      using errcode = '22023';
  end if;
  if p_disposition is null or length(btrim(p_disposition)) = 0 then
    raise exception 'eco138_disposition_required'
      using errcode = '22023';
  end if;
  if p_reentry_condition is not null and length(p_reentry_condition) = 0 then
    raise exception 'eco138_reentry_condition_empty'
      using errcode = '22023';
  end if;

  disposition_octets := pg_catalog.convert_to(p_disposition, 'UTF8');
  digest_input :=
    pg_catalog.convert_to('ECO138-DISPOSITION-REQUEST-V1', 'UTF8')
    || pg_catalog.decode('00', 'hex')
    || pg_catalog.uuid_send(p_thought_id)
    || pg_catalog.uuid_send(p_expected_revision_id)
    || pg_catalog.int8send(pg_catalog.octet_length(disposition_octets)::bigint)
    || disposition_octets
    || pg_catalog.decode('01', 'hex');

  if p_reentry_condition is null then
    digest_input := digest_input || pg_catalog.decode('00', 'hex');
  else
    reentry_octets := pg_catalog.convert_to(p_reentry_condition, 'UTF8');
    digest_input :=
      digest_input
      || pg_catalog.decode('01', 'hex')
      || pg_catalog.int8send(pg_catalog.octet_length(reentry_octets)::bigint)
      || reentry_octets;
  end if;

  return extensions.digest(digest_input, 'sha256');
end;
$$;

revoke all on function eco138.admission_request_digest(text, text, timestamptz, text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function eco138.disposition_request_digest(uuid, uuid, text, text)
  from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Extend the existing capture aperture without changing its public tool name.
-- Old operation identities retain BUILD 11 V1 replay semantics. New operations
-- use the ECO-138 digest and create admission provenance + neutral disposition.
-- ---------------------------------------------------------------------------

drop function public.ecb11_capture_thought(uuid, text, text, timestamptz);

create function public.ecb11_capture_thought(
  p_operation_id uuid,
  p_content text,
  p_source text,
  p_captured_at timestamptz default null,
  p_producer_context text default null,
  p_parent_operation_id uuid default null
)
returns table (
  operation_id uuid,
  thought_id uuid,
  content text,
  source text,
  captured_at timestamptz,
  replayed boolean,
  producer_context text,
  parent_operation_id uuid,
  disposition_revision_id uuid,
  disposition text,
  reentry_condition text,
  disposition_recorded_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_digest bytea;
  existing_operation public.ordinary_operations;
  existing_thought public.thoughts;
  new_thought_id uuid;
  effective_captured_at timestamptz;
  new_revision_id uuid;
  admission_context text;
  admission_parent uuid;
  current_revision public.thought_disposition_revisions;
  parent_result uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb11_operation_id_required'
      using errcode = '22023';
  end if;
  if p_producer_context is not null and length(p_producer_context) = 0 then
    raise exception 'eco138_producer_context_empty'
      using errcode = '22023';
  end if;

  -- Stable operation identity serializes before choosing an effect.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text, 0)
  );

  select operation.*
  into existing_operation
  from public.ordinary_operations as operation
  where operation.id = p_operation_id;

  if found then
    if existing_operation.operation_kind = 'capture_thought' then
      if p_producer_context is not null or p_parent_operation_id is not null then
        raise exception 'ecb11_operation_conflict'
          using errcode = '23505';
      end if;
      request_digest := ecb11.capture_request_digest(
        p_content, p_source, p_captured_at
      );
    elsif existing_operation.operation_kind = 'capture_thought_admission' then
      request_digest := eco138.admission_request_digest(
        p_content,
        p_source,
        p_captured_at,
        p_producer_context,
        p_parent_operation_id
      );
    else
      raise exception 'ecb11_operation_conflict'
        using errcode = '23505';
    end if;

    if existing_operation.request_digest <> request_digest then
      raise exception 'ecb11_operation_conflict'
        using errcode = '23505';
    end if;

    select thought.*
    into strict existing_thought
    from public.thoughts as thought
    where thought.id = existing_operation.result_referent_id;

    select admission.producer_context, admission.parent_operation_id
    into admission_context, admission_parent
    from public.thought_admissions as admission
    where admission.operation_id = p_operation_id;

    select revision.*
    into strict current_revision
    from public.thought_disposition_heads as head
    join public.thought_disposition_revisions as revision
      on revision.id = head.current_revision_id
    where head.thought_id = existing_thought.id;

    return query
    select
      p_operation_id,
      existing_thought.id,
      existing_thought.content,
      existing_thought.source,
      existing_thought.captured_at,
      true,
      admission_context,
      admission_parent,
      current_revision.id,
      current_revision.disposition,
      current_revision.reentry_condition,
      current_revision.recorded_at;
    return;
  end if;

  -- Validate the direct encounter parent without converting it into a Claim.
  if p_parent_operation_id is not null then
    select operation.result_referent_id
    into parent_result
    from public.ordinary_operations as operation
    where operation.id = p_parent_operation_id
      and operation.operation_kind in ('capture_thought', 'capture_thought_admission');

    if parent_result is null
      or not exists (
        select 1 from public.thoughts as thought where thought.id = parent_result
      ) then
      raise exception 'eco138_parent_admission_unavailable'
        using errcode = 'P0002';
    end if;
  end if;

  request_digest := eco138.admission_request_digest(
    p_content,
    p_source,
    p_captured_at,
    p_producer_context,
    p_parent_operation_id
  );

  new_thought_id := gen_random_uuid();
  effective_captured_at := coalesce(
    p_captured_at,
    pg_catalog.transaction_timestamp()
  );
  new_revision_id := gen_random_uuid();

  insert into public.thoughts (id, content, source, captured_at)
  values (new_thought_id, p_content, p_source, effective_captured_at);

  insert into public.ordinary_operations (
    id, operation_kind, request_digest, result_referent_id
  )
  values (
    p_operation_id,
    'capture_thought_admission',
    request_digest,
    new_thought_id
  );

  insert into public.thought_admissions (
    operation_id, producer_context, parent_operation_id
  )
  values (
    p_operation_id, p_producer_context, p_parent_operation_id
  );

  insert into public.thought_disposition_revisions (
    id, thought_id, predecessor_revision_id, disposition, reentry_condition
  )
  values (
    new_revision_id, new_thought_id, null, 'unresolved', null
  );

  insert into public.thought_disposition_heads (
    thought_id, current_revision_id
  )
  values (new_thought_id, new_revision_id);

  select revision.*
  into strict current_revision
  from public.thought_disposition_revisions as revision
  where revision.id = new_revision_id;

  return query
  select
    p_operation_id,
    new_thought_id,
    p_content,
    p_source,
    effective_captured_at,
    false,
    p_producer_context,
    p_parent_operation_id,
    current_revision.id,
    current_revision.disposition,
    current_revision.reentry_condition,
    current_revision.recorded_at;
end;
$$;

revoke all on function public.ecb11_capture_thought(uuid, text, text, timestamptz, text, uuid)
  from public, authenticated, service_role;
grant execute on function public.ecb11_capture_thought(uuid, text, text, timestamptz, text, uuid)
  to anon;

-- ---------------------------------------------------------------------------
-- Exact operational-disposition transition. The vocabulary remains open text;
-- the mechanism guarantees history/currentness, not semantic interpretation.
-- ---------------------------------------------------------------------------

create function public.eco138_set_thought_disposition(
  p_operation_id uuid,
  p_thought_id uuid,
  p_expected_revision_id uuid,
  p_disposition text,
  p_reentry_condition text default null
)
returns table (
  operation_id uuid,
  thought_id uuid,
  disposition_revision_id uuid,
  predecessor_revision_id uuid,
  disposition text,
  reentry_condition text,
  recorded_at timestamptz,
  replayed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_digest bytea;
  existing_operation public.ordinary_operations;
  current_revision_id uuid;
  created_revision public.thought_disposition_revisions;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb11_operation_id_required'
      using errcode = '22023';
  end if;

  request_digest := eco138.disposition_request_digest(
    p_thought_id,
    p_expected_revision_id,
    p_disposition,
    p_reentry_condition
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text, 0)
  );

  select operation.*
  into existing_operation
  from public.ordinary_operations as operation
  where operation.id = p_operation_id;

  if found then
    if existing_operation.operation_kind <> 'set_thought_disposition'
      or existing_operation.request_digest <> request_digest then
      raise exception 'ecb11_operation_conflict'
        using errcode = '23505';
    end if;

    select revision.*
    into strict created_revision
    from public.thought_disposition_revisions as revision
    where revision.id = existing_operation.result_referent_id;

    return query
    select
      p_operation_id,
      created_revision.thought_id,
      created_revision.id,
      created_revision.predecessor_revision_id,
      created_revision.disposition,
      created_revision.reentry_condition,
      created_revision.recorded_at,
      true;
    return;
  end if;

  perform 1 from public.thoughts as thought where thought.id = p_thought_id;
  if not found then
    raise exception 'eco138_thought_unavailable'
      using errcode = 'P0002';
  end if;

  -- Serialize disposition transitions independently from operation retries.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_thought_id::text, 138)
  );

  select head.current_revision_id
  into strict current_revision_id
  from public.thought_disposition_heads as head
  where head.thought_id = p_thought_id
  for update;

  if current_revision_id <> p_expected_revision_id then
    raise exception 'eco138_disposition_predecessor_conflict'
      using errcode = '40001';
  end if;

  insert into public.thought_disposition_revisions (
    id,
    thought_id,
    predecessor_revision_id,
    disposition,
    reentry_condition
  )
  values (
    gen_random_uuid(),
    p_thought_id,
    p_expected_revision_id,
    p_disposition,
    p_reentry_condition
  )
  returning * into created_revision;

  update public.thought_disposition_heads
  set current_revision_id = created_revision.id
  where thought_id = p_thought_id;

  insert into public.ordinary_operations (
    id, operation_kind, request_digest, result_referent_id
  )
  values (
    p_operation_id,
    'set_thought_disposition',
    request_digest,
    created_revision.id
  );

  return query
  select
    p_operation_id,
    created_revision.thought_id,
    created_revision.id,
    created_revision.predecessor_revision_id,
    created_revision.disposition,
    created_revision.reentry_condition,
    created_revision.recorded_at,
    false;
end;
$$;

revoke all on function public.eco138_set_thought_disposition(uuid, uuid, uuid, text, text)
  from public, authenticated, service_role;
grant execute on function public.eco138_set_thought_disposition(uuid, uuid, uuid, text, text)
  to anon;

-- ---------------------------------------------------------------------------
-- One cold-recovery RPC. p_id may be either a Thought identity or its admission
-- operation/receipt identity. The same result keeps evidence, custody context,
-- representation readiness, and current operational disposition separable.
-- ---------------------------------------------------------------------------

create function public.eco138_fetch_thought(
  p_id uuid,
  p_model_id text
)
returns table (
  id uuid,
  content text,
  source text,
  captured_at timestamptz,
  representation_ready boolean,
  admission_operation_id uuid,
  admission_committed_at timestamptz,
  producer_context text,
  parent_operation_id uuid,
  disposition_revision_id uuid,
  disposition text,
  reentry_condition text,
  disposition_recorded_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  resolved_thought_id uuid;
  admission_operation_id_value uuid;
  admission_committed_at_value timestamptz;
  producer_context_value text;
  parent_operation_id_value uuid;
  current_revision public.thought_disposition_revisions;
begin
  perform ecb11.assert_runtime_key();

  if p_model_id is null or length(btrim(p_model_id)) = 0 then
    raise exception 'ecb11_model_id_required'
      using errcode = '22023';
  end if;

  select thought.id
  into resolved_thought_id
  from public.thoughts as thought
  where thought.id = p_id;

  if resolved_thought_id is null then
    select operation.result_referent_id
    into resolved_thought_id
    from public.ordinary_operations as operation
    join public.thoughts as thought
      on thought.id = operation.result_referent_id
    where operation.id = p_id
      and operation.operation_kind in ('capture_thought', 'capture_thought_admission');
  end if;

  if resolved_thought_id is null then
    return;
  end if;

  begin
    select
      operation.id,
      operation.committed_at,
      admission.producer_context,
      admission.parent_operation_id
    into strict
      admission_operation_id_value,
      admission_committed_at_value,
      producer_context_value,
      parent_operation_id_value
    from public.thought_admissions as admission
    join public.ordinary_operations as operation
      on operation.id = admission.operation_id
    where operation.result_referent_id = resolved_thought_id;
  exception
    when no_data_found then
      admission_operation_id_value := null;
      admission_committed_at_value := null;
      producer_context_value := null;
      parent_operation_id_value := null;
    when too_many_rows then
      raise exception 'eco138_multiple_admissions_for_thought'
        using errcode = '23514';
  end;

  select revision.*
  into strict current_revision
  from public.thought_disposition_heads as head
  join public.thought_disposition_revisions as revision
    on revision.id = head.current_revision_id
  where head.thought_id = resolved_thought_id;

  return query
  select
    thought.id,
    thought.content,
    thought.source,
    thought.captured_at,
    exists (
      select 1
      from public.thought_representations as representation
      where representation.thought_id = thought.id
        and representation.model_id = p_model_id
    ),
    admission_operation_id_value,
    admission_committed_at_value,
    producer_context_value,
    parent_operation_id_value,
    current_revision.id,
    current_revision.disposition,
    current_revision.reentry_condition,
    current_revision.recorded_at
  from public.thoughts as thought
  where thought.id = resolved_thought_id;
end;
$$;

revoke all on function public.eco138_fetch_thought(uuid, text)
  from public, authenticated, service_role;
grant execute on function public.eco138_fetch_thought(uuid, text)
  to anon;

commit;
