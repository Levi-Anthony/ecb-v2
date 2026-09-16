-- ECO-140 — Active Disposition -> Shaped Next Atomic Action.
--
-- Governing laws:
--   * shape continuously; execute selectively;
--   * one current active disposition exposes exactly one ACTION or HOLD;
--   * current != newest;
--   * shaped action != authorization / execution permission;
--   * semantic action quality remains adaptive; deterministic currentness does not.

begin;

create schema eco140;
revoke all on schema eco140 from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- A projection is not a second lifecycle. It is the immutable role binding for
-- one disposition revision: exact Artifact + ACTION/HOLD kind.
-- ---------------------------------------------------------------------------

create table public.thought_disposition_projections (
  disposition_revision_id uuid primary key,
  projection_artifact_id uuid not null,
  projection_kind text not null,
  bound_at timestamptz not null default transaction_timestamp(),
  constraint thought_disposition_projections_revision_fkey
    foreign key (disposition_revision_id)
    references public.thought_disposition_revisions (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_disposition_projections_artifact_fkey
    foreign key (projection_artifact_id)
    references public.text_artifacts (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_disposition_projections_kind_check
    check (projection_kind in ('ACTION', 'HOLD'))
);

comment on table public.thought_disposition_projections is
  'ECO-140 one-to-one operational projection role for a disposition revision. The Artifact is immutable expression; ACTION/HOLD currentness comes only from the exact current disposition revision. Neither role grants execution authority.';

alter table public.thought_disposition_projections enable row level security;
revoke all on table public.thought_disposition_projections
  from public, anon, authenticated, service_role;

create function eco140.reject_projection_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'eco140_projection_binding_immutable'
    using errcode = '55000';
end;
$$;

revoke all on function eco140.reject_projection_mutation()
  from public, anon, authenticated, service_role;

create trigger thought_disposition_projections_immutable
before update or delete on public.thought_disposition_projections
for each row
execute function eco140.reject_projection_mutation();

-- ---------------------------------------------------------------------------
-- Truthful installation transition for dispositions that existed before
-- system-wide shaping. Advance current state once rather than retroactively
-- pretending an old immutable revision carried a projection at its original time.
-- ---------------------------------------------------------------------------

create temporary table eco140_initial_projection on commit drop as
select
  head.thought_id,
  head.current_revision_id as predecessor_revision_id,
  revision.disposition,
  revision.reentry_condition,
  gen_random_uuid() as projection_artifact_id,
  gen_random_uuid() as new_revision_id
from public.thought_disposition_heads as head
join public.thought_disposition_revisions as revision
  on revision.id = head.current_revision_id;

insert into public.text_artifacts (id, content)
select
  seed.projection_artifact_id,
  'HOLD' || chr(10)
  || 'reason: This active disposition predates system-wide next-action shaping; no current next atomic action has yet been shaped.' || chr(10)
  || 'reentry: Shape the next atomic action or a calibrated HOLD from the current disposition before consequential reliance.' || chr(10)
  || 'boundary: This projection confers no execution authority.'
from eco140_initial_projection as seed;

insert into public.thought_disposition_revisions (
  id,
  thought_id,
  predecessor_revision_id,
  disposition,
  reentry_condition
)
select
  seed.new_revision_id,
  seed.thought_id,
  seed.predecessor_revision_id,
  seed.disposition,
  coalesce(
    seed.reentry_condition,
    'Shape the next atomic action or a calibrated HOLD before consequential reliance.'
  )
from eco140_initial_projection as seed;

insert into public.thought_disposition_projections (
  disposition_revision_id,
  projection_artifact_id,
  projection_kind
)
select
  seed.new_revision_id,
  seed.projection_artifact_id,
  'HOLD'
from eco140_initial_projection as seed;

update public.thought_disposition_heads as head
set current_revision_id = seed.new_revision_id
from eco140_initial_projection as seed
where head.thought_id = seed.thought_id
  and head.current_revision_id = seed.predecessor_revision_id;

-- ---------------------------------------------------------------------------
-- System-wide teeth on currentness.
-- INSERT (new admission): if the freshly-created initial revision has no
-- projection yet, install a neutral HOLD without invoking a planner.
-- UPDATE (reshaping): a projection must already exist for the destination
-- revision; otherwise the head cannot advance.
-- ---------------------------------------------------------------------------

create function eco140.guard_current_disposition_projection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_artifact_id uuid;
begin
  if exists (
    select 1
    from public.thought_disposition_projections as projection
    where projection.disposition_revision_id = new.current_revision_id
  ) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    generated_artifact_id := gen_random_uuid();

    insert into public.text_artifacts (id, content)
    values (
      generated_artifact_id,
      'HOLD' || chr(10)
      || 'reason: Custody was established, but no next atomic action has yet been shaped.' || chr(10)
      || 'reentry: Shape the next atomic action or a calibrated HOLD before consequential reliance.' || chr(10)
      || 'boundary: This projection confers no execution authority.'
    );

    insert into public.thought_disposition_projections (
      disposition_revision_id,
      projection_artifact_id,
      projection_kind
    )
    values (
      new.current_revision_id,
      generated_artifact_id,
      'HOLD'
    );

    return new;
  end if;

  raise exception 'eco140_current_projection_required'
    using errcode = '23514';
end;
$$;

revoke all on function eco140.guard_current_disposition_projection()
  from public, anon, authenticated, service_role;

create trigger thought_disposition_heads_require_projection
before insert or update of current_revision_id
on public.thought_disposition_heads
for each row
execute function eco140.guard_current_disposition_projection();

-- Old ECO-138 disposition transition can create a revision without a shaped
-- projection. It is no longer a lawful ordinary-runtime transition after
-- ECO-140. Keep the function for historical inspectability but remove runtime use.
revoke execute on function public.eco138_set_thought_disposition(
  uuid, uuid, uuid, text, text
) from anon;

-- ---------------------------------------------------------------------------
-- Replay identity for a projection-bearing disposition transition.
-- The predecessor revision is the minimum mechanical basis token: a material
-- disposition/basis change must advance current revision before reliance.
-- ---------------------------------------------------------------------------

create function eco140.disposition_projection_request_digest(
  p_thought_id uuid,
  p_expected_revision_id uuid,
  p_disposition text,
  p_reentry_condition text,
  p_projection_artifact_id uuid,
  p_projection_kind text
)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  base_digest bytea;
  digest_input bytea;
begin
  base_digest := eco138.disposition_request_digest(
    p_thought_id,
    p_expected_revision_id,
    p_disposition,
    p_reentry_condition
  );

  if p_projection_artifact_id is null then
    raise exception 'eco140_projection_artifact_required'
      using errcode = '22023';
  end if;

  if p_projection_kind not in ('ACTION', 'HOLD') then
    raise exception 'eco140_projection_kind_invalid'
      using errcode = '22023';
  end if;

  if p_projection_kind = 'HOLD'
    and (p_reentry_condition is null or length(btrim(p_reentry_condition)) = 0) then
    raise exception 'eco140_hold_reentry_required'
      using errcode = '22023';
  end if;

  digest_input :=
    pg_catalog.convert_to('ECO140-DISPOSITION-PROJECTION-V1', 'UTF8')
    || pg_catalog.decode('00', 'hex')
    || base_digest
    || pg_catalog.uuid_send(p_projection_artifact_id)
    || pg_catalog.convert_to(p_projection_kind, 'UTF8');

  return extensions.digest(digest_input, 'sha256');
end;
$$;

revoke all on function eco140.disposition_projection_request_digest(
  uuid, uuid, text, text, uuid, text
) from public, anon, authenticated, service_role;

create function public.eco140_set_thought_disposition(
  p_operation_id uuid,
  p_thought_id uuid,
  p_expected_revision_id uuid,
  p_disposition text,
  p_reentry_condition text,
  p_projection_artifact_id uuid,
  p_projection_kind text
)
returns table (
  operation_id uuid,
  thought_id uuid,
  disposition_revision_id uuid,
  predecessor_revision_id uuid,
  disposition text,
  reentry_condition text,
  recorded_at timestamptz,
  projection_artifact_id uuid,
  projection_kind text,
  projection_bound_at timestamptz,
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
  created_projection public.thought_disposition_projections;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb11_operation_id_required'
      using errcode = '22023';
  end if;

  perform 1
  from public.text_artifacts as artifact
  where artifact.id = p_projection_artifact_id;
  if not found then
    raise exception 'eco140_projection_artifact_unavailable'
      using errcode = 'P0002';
  end if;

  request_digest := eco140.disposition_projection_request_digest(
    p_thought_id,
    p_expected_revision_id,
    p_disposition,
    p_reentry_condition,
    p_projection_artifact_id,
    p_projection_kind
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text, 0)
  );

  select operation.*
  into existing_operation
  from public.ordinary_operations as operation
  where operation.id = p_operation_id;

  if found then
    if existing_operation.operation_kind <> 'set_thought_disposition_projection'
      or existing_operation.request_digest <> request_digest then
      raise exception 'ecb11_operation_conflict'
        using errcode = '23505';
    end if;

    select revision.*
    into strict created_revision
    from public.thought_disposition_revisions as revision
    where revision.id = existing_operation.result_referent_id;

    select projection.*
    into strict created_projection
    from public.thought_disposition_projections as projection
    where projection.disposition_revision_id = created_revision.id;

    return query
    select
      p_operation_id,
      created_revision.thought_id,
      created_revision.id,
      created_revision.predecessor_revision_id,
      created_revision.disposition,
      created_revision.reentry_condition,
      created_revision.recorded_at,
      created_projection.projection_artifact_id,
      created_projection.projection_kind,
      created_projection.bound_at,
      true;
    return;
  end if;

  perform 1
  from public.thoughts as thought
  where thought.id = p_thought_id;
  if not found then
    raise exception 'eco138_thought_unavailable'
      using errcode = 'P0002';
  end if;

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

  insert into public.thought_disposition_projections (
    disposition_revision_id,
    projection_artifact_id,
    projection_kind
  )
  values (
    created_revision.id,
    p_projection_artifact_id,
    p_projection_kind
  )
  returning * into created_projection;

  update public.thought_disposition_heads as head
  set current_revision_id = created_revision.id
  where head.thought_id = p_thought_id;

  insert into public.ordinary_operations (
    id, operation_kind, request_digest, result_referent_id
  )
  values (
    p_operation_id,
    'set_thought_disposition_projection',
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
    created_projection.projection_artifact_id,
    created_projection.projection_kind,
    created_projection.bound_at,
    false;
end;
$$;

revoke all on function public.eco140_set_thought_disposition(
  uuid, uuid, uuid, text, text, uuid, text
) from public, authenticated, service_role;
grant execute on function public.eco140_set_thought_disposition(
  uuid, uuid, uuid, text, text, uuid, text
) to anon;

-- ---------------------------------------------------------------------------
-- Cold recovery: compose ECO-138 evidence/custody/disposition with the exact
-- projection bound to the exact current disposition revision. No newest lookup.
-- ---------------------------------------------------------------------------

create function public.eco140_fetch_thought(
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
  disposition_recorded_at timestamptz,
  projection_artifact_id uuid,
  projection_kind text,
  projection_content text,
  projection_bound_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    base.id,
    base.content,
    base.source,
    base.captured_at,
    base.representation_ready,
    base.admission_operation_id,
    base.admission_committed_at,
    base.producer_context,
    base.parent_operation_id,
    base.disposition_revision_id,
    base.disposition,
    base.reentry_condition,
    base.disposition_recorded_at,
    projection.projection_artifact_id,
    projection.projection_kind,
    artifact.content as projection_content,
    projection.bound_at as projection_bound_at
  from public.eco138_fetch_thought(p_id, p_model_id) as base
  join public.thought_disposition_projections as projection
    on projection.disposition_revision_id = base.disposition_revision_id
  join public.text_artifacts as artifact
    on artifact.id = projection.projection_artifact_id;
$$;

revoke all on function public.eco140_fetch_thought(uuid, text)
  from public, authenticated, service_role;
grant execute on function public.eco140_fetch_thought(uuid, text)
  to anon;

-- Prove migration postcondition before commit: every current head has exactly
-- one projection binding to an existing immutable Artifact.
do $$
declare
  missing_current integer;
begin
  select count(*)
  into missing_current
  from public.thought_disposition_heads as head
  left join public.thought_disposition_projections as projection
    on projection.disposition_revision_id = head.current_revision_id
  left join public.text_artifacts as artifact
    on artifact.id = projection.projection_artifact_id
  where projection.disposition_revision_id is null
     or artifact.id is null;

  if missing_current <> 0 then
    raise exception 'eco140_current_projection_postcondition_failed:%', missing_current;
  end if;
end $$;

commit;
