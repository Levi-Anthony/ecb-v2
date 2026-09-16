\set ON_ERROR_STOP on

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);

create temporary table eco140_baseline as
select
  (select count(*) from public.claims) as claim_count,
  (select count(*) from public.evidence_links) as evidence_link_count,
  (select count(*) from public.claim_standing_transitions) as standing_transition_count;

-- Installation postcondition: every exact current disposition has one valid
-- ACTION/HOLD projection, and installation advanced history instead of mutating
-- the prior current revision in place.
do $$
declare
  missing integer;
  root_current integer;
begin
  select count(*) into missing
  from public.thought_disposition_heads as head
  left join public.thought_disposition_projections as projection
    on projection.disposition_revision_id = head.current_revision_id
  left join public.text_artifacts as artifact
    on artifact.id = projection.projection_artifact_id
  where projection.disposition_revision_id is null
     or projection.projection_kind not in ('ACTION', 'HOLD')
     or artifact.id is null;
  if missing <> 0 then
    raise exception 'ECO-140 left % current dispositions without one valid projection', missing;
  end if;

  select count(*) into root_current
  from public.thought_disposition_heads as head
  join public.thought_disposition_revisions as revision
    on revision.id = head.current_revision_id
  where revision.predecessor_revision_id is null;
  if root_current <> 0 then
    raise exception 'ECO-140 retroactive/currentness initialization failed; % current revisions remain roots', root_current;
  end if;
end $$;

-- New admission after ECO-140 receives a neutral HOLD structurally, with no
-- planner call and no requirement for producer lifecycle vocabulary.
set role anon;
select * from public.ecb11_capture_thought(
  '14000000-0000-4140-8140-000000000001'::uuid,
  'ECO-140 shaping specimen evidence.',
  'eco140_qualification',
  null,
  null,
  null
);
reset role;

create temporary table eco140_fixture as
select operation.result_referent_id as thought_id
from public.ordinary_operations as operation
where operation.id = '14000000-0000-4140-8140-000000000001'::uuid;

alter table eco140_fixture add column initial_revision_id uuid;
update eco140_fixture as fixture
set initial_revision_id = head.current_revision_id
from public.thought_disposition_heads as head
where head.thought_id = fixture.thought_id;

do $$
declare
  fetched record;
begin
  select * into strict fetched
  from public.eco140_fetch_thought(
    (select thought_id from eco140_fixture),
    'gte-small'
  );

  if fetched.projection_kind <> 'HOLD' then
    raise exception 'new admission did not receive neutral HOLD projection';
  end if;
  if fetched.projection_artifact_id is null
    or fetched.projection_content not like 'HOLD%' then
    raise exception 'neutral HOLD projection is not cold-recoverable';
  end if;
  if fetched.projection_content not like '%no next atomic action has yet been shaped%' then
    raise exception 'neutral HOLD invented work instead of stating shaping gap';
  end if;
end $$;

-- Create one fully shaped ACTION Artifact. Semantic quality lives in the exact
-- Artifact payload; the structural mechanism only binds identity/currentness.
create temporary table eco140_action_artifact as
select artifact_id
from public.ecb12_create_artifact(
  '14000000-0000-4140-8140-000000000010'::uuid,
  'ACTION' || chr(10)
  || 'focal: ECO-140 qualification Thought' || chr(10)
  || 'intended_change: determine whether the exact current projection survives a newer unbound candidate' || chr(10)
  || 'basis: current disposition revision in eco140_fixture' || chr(10)
  || 'dependencies: exact Thought identity + exact disposition revision' || chr(10)
  || 'uncertainty: none blocking this bounded check' || chr(10)
  || 'boundary: no external effect; no authority is conferred' || chr(10)
  || 'expected_observation: fetch still returns this Artifact after a newer candidate Artifact exists' || chr(10)
  || 'failure_branch: if newest substitutes, currentness contract is false' || chr(10)
  || 'decision_consequence: preserve or reject explicit projection currentness'
);

-- ACTION transition must use exact predecessor and bind the exact Artifact.
create temporary table eco140_action_transition as
select *
from public.eco140_set_thought_disposition(
  '14000000-0000-4140-8140-000000000011'::uuid,
  (select thought_id from eco140_fixture),
  (select initial_revision_id from eco140_fixture),
  'active_review',
  null,
  (select artifact_id from eco140_action_artifact),
  'ACTION'
);

do $$
declare
  fetched record;
begin
  select * into strict fetched
  from public.eco140_fetch_thought(
    (select thought_id from eco140_fixture),
    'gte-small'
  );

  if fetched.disposition_revision_id <> (
      select disposition_revision_id from eco140_action_transition
    ) then
    raise exception 'ACTION transition did not become exact current disposition';
  end if;
  if fetched.projection_artifact_id <> (
      select artifact_id from eco140_action_artifact
    ) or fetched.projection_kind <> 'ACTION' then
    raise exception 'ACTION projection binding is not exact';
  end if;
  if fetched.projection_content not like '%expected_observation:%' then
    raise exception 'cold fetch did not recover shaped ACTION expression';
  end if;
end $$;

-- E: newest candidate Artifact must never substitute for explicitly current.
create temporary table eco140_newer_candidate as
select artifact_id
from public.ecb12_create_artifact(
  '14000000-0000-4140-8140-000000000012'::uuid,
  'ACTION' || chr(10)
  || 'candidate_only: newer bytes must not become current without disposition transition'
);

do $$
declare
  fetched record;
begin
  select * into strict fetched
  from public.eco140_fetch_thought(
    (select thought_id from eco140_fixture),
    'gte-small'
  );
  if fetched.projection_artifact_id <> (select artifact_id from eco140_action_artifact) then
    raise exception 'newest Artifact silently substituted for current projection';
  end if;
  if fetched.projection_artifact_id = (select artifact_id from eco140_newer_candidate) then
    raise exception 'newest candidate became current without designation';
  end if;
end $$;

-- I: exact transition replay returns the same revision; changed projection under
-- the same operation identity conflicts before a second effect.
do $$
declare
  replayed_value boolean;
  replay_revision uuid;
begin
  select replayed, disposition_revision_id
  into strict replayed_value, replay_revision
  from public.eco140_set_thought_disposition(
    '14000000-0000-4140-8140-000000000011'::uuid,
    (select thought_id from eco140_fixture),
    (select initial_revision_id from eco140_fixture),
    'active_review',
    null,
    (select artifact_id from eco140_action_artifact),
    'ACTION'
  );
  if not replayed_value
    or replay_revision <> (select disposition_revision_id from eco140_action_transition) then
    raise exception 'exact ECO-140 transition did not replay same committed revision';
  end if;

  begin
    perform * from public.eco140_set_thought_disposition(
      '14000000-0000-4140-8140-000000000011'::uuid,
      (select thought_id from eco140_fixture),
      (select initial_revision_id from eco140_fixture),
      'active_review',
      null,
      (select artifact_id from eco140_newer_candidate),
      'ACTION'
    );
    raise exception 'negative control failed: changed projection replay succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb11_operation_conflict%' then raise; end if;
  end;
end $$;

-- D: stale predecessor fails closed even with a fresh operation and valid Artifact.
do $$
begin
  begin
    perform * from public.eco140_set_thought_disposition(
      '14000000-0000-4140-8140-000000000013'::uuid,
      (select thought_id from eco140_fixture),
      (select initial_revision_id from eco140_fixture),
      'active_review',
      null,
      (select artifact_id from eco140_newer_candidate),
      'ACTION'
    );
    raise exception 'negative control failed: stale predecessor projection succeeded';
  exception
    when serialization_failure then
      if sqlerrm not like '%eco138_disposition_predecessor_conflict%' then raise; end if;
  end;
end $$;

-- HOLD requires a concrete reentry condition. No fabricated action may be used
-- merely to satisfy a one-current-projection constraint.
create temporary table eco140_hold_artifact as
select artifact_id
from public.ecb12_create_artifact(
  '14000000-0000-4140-8140-000000000020'::uuid,
  'HOLD' || chr(10)
  || 'blocker: the bounded observation has been accepted; a new next action has not yet been justified' || chr(10)
  || 'reentry: resume when a new observation changes the active decision surface' || chr(10)
  || 'consequence: reshape rather than replay the completed ACTION' || chr(10)
  || 'boundary: no execution authority is conferred'
);

do $$
begin
  begin
    perform * from public.eco140_set_thought_disposition(
      '14000000-0000-4140-8140-000000000021'::uuid,
      (select thought_id from eco140_fixture),
      (select disposition_revision_id from eco140_action_transition),
      'deferred',
      null,
      (select artifact_id from eco140_hold_artifact),
      'HOLD'
    );
    raise exception 'negative control failed: HOLD without reentry condition succeeded';
  exception
    when invalid_parameter_value then
      if sqlerrm not like '%eco140_hold_reentry_required%' then raise; end if;
  end;
end $$;

-- F/H: accepting the bounded result into disposition state reshapes the frontier
-- to HOLD; the completed ACTION remains historical, not current.
create temporary table eco140_hold_transition as
select *
from public.eco140_set_thought_disposition(
  '14000000-0000-4140-8140-000000000022'::uuid,
  (select thought_id from eco140_fixture),
  (select disposition_revision_id from eco140_action_transition),
  'deferred',
  'Re-shape when a new observation changes the active decision surface.',
  (select artifact_id from eco140_hold_artifact),
  'HOLD'
);

do $$
declare
  fetched record;
  historical_action integer;
begin
  select * into strict fetched
  from public.eco140_fetch_thought(
    (select thought_id from eco140_fixture),
    'gte-small'
  );
  if fetched.projection_kind <> 'HOLD'
    or fetched.projection_artifact_id <> (select artifact_id from eco140_hold_artifact) then
    raise exception 'result reshaping did not replace current ACTION with exact HOLD';
  end if;
  if fetched.reentry_condition <> 'Re-shape when a new observation changes the active decision surface.' then
    raise exception 'HOLD reentry condition is not cold-recoverable';
  end if;

  select count(*) into historical_action
  from public.thought_disposition_projections as projection
  where projection.disposition_revision_id = (
    select disposition_revision_id from eco140_action_transition
  )
    and projection.projection_artifact_id = (select artifact_id from eco140_action_artifact)
    and projection.projection_kind = 'ACTION';
  if historical_action <> 1 then
    raise exception 'prior ACTION projection history was lost';
  end if;
end $$;

-- Old unprojected disposition update path is no longer executable by ordinary
-- runtime, preventing a bypass around one-current ACTION/HOLD coverage.
set role anon;
do $$
begin
  begin
    perform * from public.eco138_set_thought_disposition(
      '14000000-0000-4140-8140-000000000030'::uuid,
      (select thought_id from eco140_fixture),
      (select disposition_revision_id from eco140_hold_transition),
      'bypass_attempt',
      null
    );
    raise exception 'negative control failed: old unprojected disposition RPC remained executable';
  exception
    when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Head currentness itself rejects an unprojected destination revision.
do $$
declare
  rogue_revision uuid := gen_random_uuid();
  current_revision uuid;
begin
  select current_revision_id into strict current_revision
  from public.thought_disposition_heads
  where thought_id = (select thought_id from eco140_fixture);

  insert into public.thought_disposition_revisions (
    id, thought_id, predecessor_revision_id, disposition, reentry_condition
  )
  values (
    rogue_revision,
    (select thought_id from eco140_fixture),
    current_revision,
    'rogue_unprojected',
    null
  );

  begin
    update public.thought_disposition_heads as head
    set current_revision_id = rogue_revision
    where head.thought_id = (select thought_id from eco140_fixture);
    raise exception 'negative control failed: unprojected revision became current';
  exception
    when check_violation then
      if sqlerrm not like '%eco140_current_projection_required%' then raise; end if;
  end;
end $$;

-- Binding is immutable; changing the role after designation would undermine
-- exact currentness and historical recovery.
do $$
begin
  begin
    update public.thought_disposition_projections
    set projection_kind = 'ACTION'
    where disposition_revision_id = (
      select disposition_revision_id from eco140_hold_transition
    );
    raise exception 'negative control failed: projection role mutation succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%eco140_projection_binding_immutable%' then raise; end if;
  end;
end $$;

-- J: shaping/currentness must not confer epistemic standing or create evidence
-- relations. Artifact/Referent growth is expected; Claim authority surfaces are not.
do $$
declare
  baseline record;
  current_claims integer;
  current_links integer;
  current_transitions integer;
begin
  select * into strict baseline from eco140_baseline;
  select count(*) into current_claims from public.claims;
  select count(*) into current_links from public.evidence_links;
  select count(*) into current_transitions from public.claim_standing_transitions;

  if current_claims <> baseline.claim_count then
    raise exception 'ECO-140 shaping inflated Claim store';
  end if;
  if current_links <> baseline.evidence_link_count then
    raise exception 'ECO-140 shaping created semantic Evidence Links';
  end if;
  if current_transitions <> baseline.standing_transition_count then
    raise exception 'ECO-140 shaping changed epistemic standing';
  end if;
end $$;

-- Final invariant: every current disposition still resolves to exactly one
-- projection through explicit currentness, never creation recency.
do $$
declare
  invalid integer;
begin
  select count(*) into invalid
  from public.thought_disposition_heads as head
  left join public.thought_disposition_projections as projection
    on projection.disposition_revision_id = head.current_revision_id
  where projection.disposition_revision_id is null;
  if invalid <> 0 then
    raise exception 'ECO-140 ended with % current dispositions lacking projection', invalid;
  end if;
end $$;
