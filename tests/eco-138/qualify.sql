\set ON_ERROR_STOP on

-- ECO-138 qualification against canonical BUILD 11 + corrected BUILD 12 substrate.

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);

-- The migration must give every existing Thought one exact current disposition
-- without fabricating Claims, Evidence Links, or Artifact semantics.
do $$
declare
  thought_count integer;
  head_count integer;
  broken_heads integer;
  nonreferent_revisions integer;
begin
  select count(*) into thought_count from public.thoughts;
  select count(*) into head_count from public.thought_disposition_heads;
  if head_count <> thought_count then
    raise exception 'ECO-138 backfill left % thoughts but % disposition heads', thought_count, head_count;
  end if;

  select count(*) into broken_heads
  from public.thought_disposition_heads as head
  left join public.thought_disposition_revisions as revision
    on revision.id = head.current_revision_id
  where revision.id is null or revision.thought_id <> head.thought_id;
  if broken_heads <> 0 then
    raise exception 'ECO-138 produced % broken disposition heads', broken_heads;
  end if;

  select count(*) into nonreferent_revisions
  from public.thought_disposition_revisions as revision
  left join public.referents as referent on referent.id = revision.id
  where referent.id is null;
  if nonreferent_revisions <> 0 then
    raise exception 'ECO-138 produced % disposition revisions without Referent identity', nonreferent_revisions;
  end if;
end $$;

create temporary table eco138_baseline as
select
  (select count(*) from public.claims) as claim_count,
  (select count(*) from public.evidence_links) as evidence_link_count,
  (select count(*) from public.text_artifacts) as artifact_count;

-- Legacy BUILD 11 operation identity must retain V1 replay semantics after the
-- capture aperture gains optional ECO-138 provenance parameters.
do $$
declare
  was_replayed boolean;
  returned_context text;
  returned_parent uuid;
begin
  select replayed, producer_context, parent_operation_id
  into strict was_replayed, returned_context, returned_parent
  from public.ecb11_capture_thought(
    '11111111-aaaa-4111-8111-111111111111'::uuid,
    'BUILD 11 replay specimen: red cedar under moonlight.',
    'build11_qualification',
    null
  );

  if not was_replayed then
    raise exception 'ECO-138 broke legacy BUILD 11 replay';
  end if;
  if returned_context is not null or returned_parent is not null then
    raise exception 'ECO-138 fabricated provenance on legacy replay';
  end if;
end $$;

-- Legacy pre-operation evidence receives current operational disposition but no
-- invented admission receipt.
do $$
declare
  fetched record;
begin
  select * into strict fetched
  from public.eco138_fetch_thought(
    '19a949ea-a8fc-4250-a386-fa64e5530180'::uuid,
    'gte-small'
  );
  if fetched.admission_operation_id is not null then
    raise exception 'ECO-138 invented a receipt for pre-operation Thought evidence';
  end if;
  if fetched.disposition <> 'unresolved' then
    raise exception 'ECO-138 legacy Thought missing neutral current disposition';
  end if;
end $$;

-- A. Low-context admission remains valid. Leading/trailing evidence bytes are
-- retained by the database aperture; runtime qualification separately protects
-- against client-side trimming.
set role anon;
select * from public.ecb11_capture_thought(
  '13800000-0000-4138-8138-000000000001'::uuid,
  '  ECO-138 exact evidence with boundary spaces.  ',
  '  eco138_low_context_source  ',
  null
);
reset role;

do $$
declare
  result_id uuid;
  fetched record;
begin
  select result_referent_id into strict result_id
  from public.ordinary_operations
  where id = '13800000-0000-4138-8138-000000000001'::uuid;

  select * into strict fetched
  from public.eco138_fetch_thought(result_id, 'gte-small');

  if fetched.content <> '  ECO-138 exact evidence with boundary spaces.  ' then
    raise exception 'ECO-138 changed canonical evidence content';
  end if;
  if fetched.source <> '  eco138_low_context_source  ' then
    raise exception 'ECO-138 changed declared source bytes';
  end if;
  if fetched.producer_context is not null or fetched.parent_operation_id is not null then
    raise exception 'low-context admission fabricated optional provenance';
  end if;
  if fetched.disposition <> 'unresolved' or fetched.disposition_revision_id is null then
    raise exception 'low-context admission lacks neutral active disposition';
  end if;
end $$;

-- B. Known direct encounter lineage + opaque producer context.
set role anon;
select * from public.ecb11_capture_thought(
  '13800000-0000-4138-8138-000000000002'::uuid,
  'ECO-138 child encounter evidence.',
  'eco138_known_lineage',
  null,
  '  opaque producer context; preserve exactly  ',
  '13800000-0000-4138-8138-000000000001'::uuid
);
reset role;

do $$
declare
  child_id uuid;
  by_thought record;
  by_receipt record;
begin
  select result_referent_id into strict child_id
  from public.ordinary_operations
  where id = '13800000-0000-4138-8138-000000000002'::uuid;

  select * into strict by_thought
  from public.eco138_fetch_thought(child_id, 'gte-small');
  select * into strict by_receipt
  from public.eco138_fetch_thought(
    '13800000-0000-4138-8138-000000000002'::uuid,
    'gte-small'
  );

  if by_thought.id <> by_receipt.id or by_thought.id <> child_id then
    raise exception 'Thought and receipt recovery did not converge on exact evidence identity';
  end if;
  if by_thought.producer_context <> '  opaque producer context; preserve exactly  ' then
    raise exception 'producer context was not preserved losslessly';
  end if;
  if by_thought.parent_operation_id <> '13800000-0000-4138-8138-000000000001'::uuid then
    raise exception 'direct admission lineage not recovered';
  end if;
  if by_thought.admission_operation_id <> '13800000-0000-4138-8138-000000000002'::uuid then
    raise exception 'admission receipt identity not recovered';
  end if;
end $$;

-- D. Exact full-request replay returns one effect.
do $$
declare
  was_replayed boolean;
begin
  select replayed into strict was_replayed
  from public.ecb11_capture_thought(
    '13800000-0000-4138-8138-000000000002'::uuid,
    'ECO-138 child encounter evidence.',
    'eco138_known_lineage',
    null,
    '  opaque producer context; preserve exactly  ',
    '13800000-0000-4138-8138-000000000001'::uuid
  );
  if not was_replayed then
    raise exception 'exact admission retry did not replay';
  end if;
end $$;

-- Negative: provenance is part of request identity and cannot be silently changed.
do $$
begin
  begin
    perform * from public.ecb11_capture_thought(
      '13800000-0000-4138-8138-000000000002'::uuid,
      'ECO-138 child encounter evidence.',
      'eco138_known_lineage',
      null,
      'CHANGED CONTEXT MUST CONFLICT',
      '13800000-0000-4138-8138-000000000001'::uuid
    );
    raise exception 'negative control failed: changed admission provenance replay succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb11_operation_conflict%' then raise; end if;
  end;
end $$;

-- Negative: parent receipt must identify a real prior Thought admission.
do $$
begin
  begin
    perform * from public.ecb11_capture_thought(
      '13800000-0000-4138-8138-000000000003'::uuid,
      'invalid parent specimen',
      'eco138_negative',
      null,
      'known context',
      '13800000-0000-4138-8138-999999999999'::uuid
    );
    raise exception 'negative control failed: unavailable parent admission accepted';
  exception
    when no_data_found then
      if sqlerrm not like '%eco138_parent_admission_unavailable%' then raise; end if;
  end;
end $$;

-- H/I. Disposition transition preserves predecessor history and a concrete
-- deferred reentry condition without changing evidence.
do $$
declare
  child_id uuid;
  initial_revision uuid;
  new_revision uuid;
  was_replayed boolean;
  fetched record;
  preserved_content text;
begin
  select result_referent_id into strict child_id
  from public.ordinary_operations
  where id = '13800000-0000-4138-8138-000000000002'::uuid;

  select current_revision_id into strict initial_revision
  from public.thought_disposition_heads
  where thought_id = child_id;

  select disposition_revision_id, replayed
  into strict new_revision, was_replayed
  from public.eco138_set_thought_disposition(
    '13800000-0000-4138-8138-000000000010'::uuid,
    child_id,
    initial_revision,
    'deferred',
    'Reopen when a new observation resolves the source-frame mismatch.'
  );

  if was_replayed or new_revision = initial_revision then
    raise exception 'first disposition transition did not create a distinct revision';
  end if;

  if not exists (
    select 1 from public.thought_disposition_revisions
    where id = initial_revision and thought_id = child_id
  ) then
    raise exception 'disposition transition erased predecessor history';
  end if;

  select * into strict fetched
  from public.eco138_fetch_thought(child_id, 'gte-small');
  if fetched.disposition_revision_id <> new_revision
    or fetched.disposition <> 'deferred'
    or fetched.reentry_condition <> 'Reopen when a new observation resolves the source-frame mismatch.' then
    raise exception 'current disposition/reentry recovery is incorrect';
  end if;

  select content into strict preserved_content
  from public.thoughts where id = child_id;
  if preserved_content <> 'ECO-138 child encounter evidence.' then
    raise exception 'disposition transition rewrote canonical evidence';
  end if;
end $$;

-- Exact disposition retry replays; changed request under the same operation conflicts.
do $$
declare
  child_id uuid;
  initial_revision uuid;
  was_replayed boolean;
begin
  select result_referent_id into strict child_id
  from public.ordinary_operations
  where id = '13800000-0000-4138-8138-000000000002'::uuid;
  select predecessor_revision_id into strict initial_revision
  from public.thought_disposition_revisions
  where id = (
    select result_referent_id from public.ordinary_operations
    where id = '13800000-0000-4138-8138-000000000010'::uuid
  );

  select replayed into strict was_replayed
  from public.eco138_set_thought_disposition(
    '13800000-0000-4138-8138-000000000010'::uuid,
    child_id,
    initial_revision,
    'deferred',
    'Reopen when a new observation resolves the source-frame mismatch.'
  );
  if not was_replayed then
    raise exception 'exact disposition retry did not replay';
  end if;

  begin
    perform * from public.eco138_set_thought_disposition(
      '13800000-0000-4138-8138-000000000010'::uuid,
      child_id,
      initial_revision,
      'deferred',
      'CHANGED REENTRY MUST CONFLICT'
    );
    raise exception 'negative control failed: changed disposition retry succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb11_operation_conflict%' then raise; end if;
  end;
end $$;

-- Negative: a fresh operation cannot transition from a stale predecessor.
do $$
declare
  child_id uuid;
  stale_revision uuid;
begin
  select result_referent_id into strict child_id
  from public.ordinary_operations
  where id = '13800000-0000-4138-8138-000000000002'::uuid;
  select predecessor_revision_id into strict stale_revision
  from public.thought_disposition_revisions
  where id = (
    select result_referent_id from public.ordinary_operations
    where id = '13800000-0000-4138-8138-000000000010'::uuid
  );

  begin
    perform * from public.eco138_set_thought_disposition(
      '13800000-0000-4138-8138-000000000011'::uuid,
      child_id,
      stale_revision,
      'active_review',
      null
    );
    raise exception 'negative control failed: stale predecessor transition succeeded';
  exception
    when serialization_failure then
      if sqlerrm not like '%eco138_disposition_predecessor_conflict%' then raise; end if;
  end;

  if exists (
    select 1 from public.ordinary_operations
    where id = '13800000-0000-4138-8138-000000000011'::uuid
  ) then
    raise exception 'stale predecessor failure left a committed operation';
  end if;
end $$;

-- Revision history itself is immutable even for the migration/admin role.
do $$
declare
  revision_id uuid;
begin
  select result_referent_id into strict revision_id
  from public.ordinary_operations
  where id = '13800000-0000-4138-8138-000000000010'::uuid;

  begin
    update public.thought_disposition_revisions
    set disposition = 'MUTATED'
    where id = revision_id;
    raise exception 'negative control failed: disposition revision mutation succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%eco138_disposition_revision_immutable%' then raise; end if;
  end;
end $$;

-- Capability confinement: anon has no direct table mutation path.
set role anon;
do $$
begin
  begin
    insert into public.thought_admissions(operation_id)
    values ('13800000-0000-4138-8138-000000000099'::uuid);
    raise exception 'negative control failed: anon direct admission write succeeded';
  exception
    when insufficient_privilege then null;
  end;
end $$;
reset role;

-- E/J. Admission/disposition are operational custody mechanics only. They must
-- not manufacture Claims, Evidence Links, or semantic Artifacts.
do $$
declare
  baseline record;
  current_claims integer;
  current_links integer;
  current_artifacts integer;
begin
  select * into strict baseline from eco138_baseline;
  select count(*) into current_claims from public.claims;
  select count(*) into current_links from public.evidence_links;
  select count(*) into current_artifacts from public.text_artifacts;

  if current_claims <> baseline.claim_count then
    raise exception 'ECO-138 admission/disposition inflated Claim standing surface';
  end if;
  if current_links <> baseline.evidence_link_count then
    raise exception 'ECO-138 admission/disposition created semantic Evidence Links';
  end if;
  if current_artifacts <> baseline.artifact_count then
    raise exception 'ECO-138 admission/disposition unexpectedly created Artifacts';
  end if;
end $$;

-- Every Thought still has exactly one current operational disposition head.
do $$
declare
  thought_count integer;
  head_count integer;
begin
  select count(*) into thought_count from public.thoughts;
  select count(*) into head_count from public.thought_disposition_heads;
  if thought_count <> head_count then
    raise exception 'ECO-138 ended with % thoughts but % current disposition heads', thought_count, head_count;
  end if;
end $$;
