-- ECO-152 forward repair for the observed run-5 historical-before counterexample.
-- Apply only after the isolated orientation specimen, never as a production install queue.
-- Custody of observations remains permissive; a stronger historical PASS must bind
-- actual prior meaning. This guard belongs to the immutable qualification seam.
begin;
create function ecb_orientation.guard_historical_qualification() returns trigger
language plpgsql set search_path='' as $$
declare
  resolution ecb_orientation.records;
  changed ecb_orientation.records;
  prior_resolution ecb_orientation.records;
  qualification_payload jsonb;
  observation_payload jsonb;
  prior_payload jsonb;
  before_id uuid;
  explicit_history boolean;
begin
  if new.record_kind <> 'qualification' or new.result is distinct from 'PASS' then return new; end if;
  qualification_payload := ecb_orientation.payload(new.artifact_id);
  explicit_history := coalesce((qualification_payload->>'historical_requalification')::boolean,false);
  if new.change_id is null then
    if explicit_history then raise exception 'orientation_historical_basis_required' using errcode='22023'; end if;
    return new;
  end if;
  resolution := ecb_orientation.record_for(new.resolution_id,'resolution',new.scope_id);
  select * into changed from ecb_orientation.records where receipt_id=new.change_id;
  if not found or changed.record_kind <> 'fence_change' or changed.scope_id is distinct from new.scope_id then
    raise exception 'orientation_historical_change_mismatch' using errcode='22023';
  end if;
  -- A newly formed exact basis can qualify without pretending to establish history.
  if resolution.observed_epoch >= changed.result_epoch and not explicit_history then return new; end if;
  observation_payload := ecb_orientation.payload(changed.observation_id);
  if not explicit_history or (observation_payload->>'history_available')::boolean is distinct from true then
    raise exception 'orientation_historical_payload_unavailable' using errcode='22023';
  end if;
  prior_resolution := ecb_orientation.record_for(changed.resolution_id,'resolution',new.scope_id);
  prior_payload := ecb_orientation.payload(prior_resolution.artifact_id);
  before_id := (observation_payload->>'before_artifact_id')::uuid;
  if before_id is null or not exists(select 1 from public.text_artifacts where id=before_id) then
    raise exception 'orientation_historical_payload_unavailable' using errcode='22023';
  end if;
  if before_id is distinct from prior_resolution.artifact_id and not exists(
    select 1 from jsonb_array_elements(
      (prior_payload->'governing_sources') || jsonb_build_array(prior_payload->'grammar') ||
      (prior_payload->'evidence') || (prior_payload->'dependencies')
    ) constituent where (constituent->>'artifact_id')::uuid=before_id
  ) then
    raise exception 'orientation_historical_lineage_mismatch' using errcode='22023';
  end if;
  return new;
end $$;
revoke all on function ecb_orientation.guard_historical_qualification() from public,anon,authenticated,service_role;
create trigger orientation_historical_qualification_guard
before insert on ecb_orientation.records
for each row execute function ecb_orientation.guard_historical_qualification();
comment on function ecb_orientation.guard_historical_qualification() is
  'ECO-152 run-5 repair: exact before-meaning lineage for historical PASS, not mere payload existence. Semantic adequacy remains a separate judgment.';
commit;
