-- ECO-138 correction: qualify the disposition-head subject column in the
-- transition RPC. The first candidate migration qualified every read but left
-- one UPDATE predicate ambiguous against the RETURNS TABLE output variable
-- `thought_id`. No contract or schema semantics change here.

begin;

create or replace function public.eco138_set_thought_disposition(
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

  update public.thought_disposition_heads as head
  set current_revision_id = created_revision.id
  where head.thought_id = p_thought_id;

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

commit;
