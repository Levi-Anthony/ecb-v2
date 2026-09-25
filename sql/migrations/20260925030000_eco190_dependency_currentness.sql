-- ECO-190 derived current-use currentness repair. Preserve installed historical migration.
-- Visible health is independent of exact history-bound qualification.
begin;

create or replace function public.ecb190_fetch_episode(p_episode_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  episode_row ecb_coordination.episodes;
  current_content text;
  current_payload jsonb;
  current_index jsonb;
  current_basis uuid;
  current_constituents jsonb;
  constituent_contents jsonb := '{}'::jsonb;
  k text;
  v jsonb;
  artifact_id uuid;
  artifact_content text;
  reliance_rows jsonb;
  consumer_rows jsonb;
  supporting_rows jsonb;
  stale_rows jsonb := '[]'::jsonb;
  pgo_content text;
  question_content text;
  ssmm_content text;
  bound_use jsonb;
  bound_reliance ecb_coordination.external_reliances;
  bound_consumer ecb_coordination.consumer_bindings;
  bound_reliance_payload jsonb;
  bound_consumer_payload jsonb;
  reconciliation_debt jsonb := '[]'::jsonb;
  current_use_qualified boolean := false;
begin
  perform ecb11.assert_runtime_key();

  select e.* into strict episode_row
  from ecb_coordination.episodes e
  where e.id = p_episode_id;

  select a.content into strict current_content
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.receipt_id = episode_row.head_receipt_id;

  current_payload := (current_content::jsonb)->'parsed';
  current_index := ecb_coordination.record_index(episode_row.head_receipt_id);
  current_basis := ecb_coordination.record_basis(episode_row.head_receipt_id);
  current_constituents := ecb_coordination.record_constituents(episode_row.head_receipt_id);

  for k, v in select key, value from jsonb_each(current_constituents) loop
    artifact_id := ecb_coordination.require_artifact(v);
    select a.content into strict artifact_content
    from public.text_artifacts a where a.id = artifact_id;
    constituent_contents := constituent_contents
      || jsonb_build_object(k,jsonb_build_object(
        'artifact_id',artifact_id,
        'content',artifact_content
      ));
  end loop;

  select a.content into strict pgo_content
  from public.text_artifacts a where a.id = (current_index->>'g')::uuid;
  select a.content into strict question_content
  from public.text_artifacts a where a.id = (current_index->>'q')::uuid;
  select a.content into strict ssmm_content
  from public.text_artifacts a where a.id = (current_index->>'t')::uuid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',r.id,
      'epoch',r.epoch,
      'source_system',r.source_system,
      'source_locator',r.source_locator,
      'head_receipt_id',r.head_receipt_id,
      'payload',(a.content::jsonb)->'parsed'
    ) order by r.source_system,r.source_locator,r.id
  ),'[]'::jsonb)
  into reliance_rows
  from ecb_coordination.external_reliances r
  join ecb_coordination.records rec on rec.receipt_id = r.head_receipt_id
  join public.text_artifacts a on a.id = rec.artifact_id
  where r.episode_id = p_episode_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',c.id,
      'epoch',c.epoch,
      'consumer_kind',c.consumer_kind,
      'consumer_locator',c.consumer_locator,
      'head_receipt_id',c.head_receipt_id,
      'payload',(a.content::jsonb)->'parsed'
    ) order by c.consumer_kind,c.consumer_locator,c.id
  ),'[]'::jsonb)
  into consumer_rows
  from ecb_coordination.consumer_bindings c
  join ecb_coordination.records rec on rec.receipt_id = c.head_receipt_id
  join public.text_artifacts a on a.id = rec.artifact_id
  where c.episode_id = p_episode_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'receipt_id',r.receipt_id,
      'artifact_id',r.artifact_id,
      'record_role',r.record_role,
      'epoch',r.result_epoch,
      'payload',(a.content::jsonb)->'parsed'
    ) order by r.recorded_at,r.receipt_id
  ),'[]'::jsonb)
  into supporting_rows
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.episode_id = p_episode_id
    and r.record_role in ('reconstitution_manifest','qualification');

  select coalesce(jsonb_agg(x),'[]'::jsonb)
  into stale_rows
  from (
    select jsonb_build_object(
      'kind','external_reliance',
      'id',r.id,
      'state',(a.content::jsonb)#>>'{parsed,currentness}'
    ) x
    from ecb_coordination.external_reliances r
    join ecb_coordination.records rec on rec.receipt_id = r.head_receipt_id
    join public.text_artifacts a on a.id = rec.artifact_id
    where r.episode_id = p_episode_id
      and (a.content::jsonb)#>>'{parsed,currentness}' <> 'CURRENT'
    union all
    select jsonb_build_object(
      'kind','consumer',
      'id',c.id,
      'state',
        ((a.content::jsonb)#>>'{parsed,connected_status}')
        || '/' ||
        ((a.content::jsonb)#>>'{parsed,observed_use}')
    ) x
    from ecb_coordination.consumer_bindings c
    join ecb_coordination.records rec on rec.receipt_id = c.head_receipt_id
    join public.text_artifacts a on a.id = rec.artifact_id
    where c.episode_id = p_episode_id
      and (
        (a.content::jsonb)#>>'{parsed,connected_status}' <> 'CONNECTED'
        or (a.content::jsonb)#>>'{parsed,observed_use}' <> 'OBSERVED'
      )
  ) s;

  if (select record_role from ecb_coordination.records
      where receipt_id = episode_row.head_receipt_id) = 'material_change'
     and current_payload#>>'{reconciliation,reliance_eligibility}' <> 'ELIGIBLE' then
    stale_rows := stale_rows || jsonb_build_array(jsonb_build_object(
      'kind','current_reconciliation',
      'id',episode_row.head_receipt_id,
      'state',current_payload#>>'{reconciliation,reliance_eligibility}'
    ));
  end if;

  -- A restored visible label cannot restore an earlier current-use binding.
  -- Keep the historical receipt intact; compare its exact dependency heads now.
  bound_use := current_payload->'current_use';
  if jsonb_typeof(bound_use) <> 'object' or not (bound_use ?& array[
    'external_reliance_id','expected_reliance_epoch',
    'consumer_binding_id','expected_consumer_epoch','consumer_environment',
    'engagement_index','qualification_basis_artifact_id','currentness',
    'ssmm_legality','authority_scope'
  ]) then
    reconciliation_debt := reconciliation_debt || jsonb_build_array(
      jsonb_build_object('kind','current_use','state','MISSING_DECISION_BEARING_BINDING'));
  else
    select r.* into bound_reliance from ecb_coordination.external_reliances r
    where r.id::text = bound_use->>'external_reliance_id'
      and r.episode_id = p_episode_id;
    select c.* into bound_consumer from ecb_coordination.consumer_bindings c
    where c.id::text = bound_use->>'consumer_binding_id'
      and c.episode_id = p_episode_id;

    if bound_reliance.id is null or bound_reliance.head_receipt_id is null then
      reconciliation_debt := reconciliation_debt || jsonb_build_array(
        jsonb_build_object('kind','external_reliance','state','BOUND_DEPENDENCY_MISSING',
          'bound_id',bound_use->>'external_reliance_id'));
    else
      bound_reliance_payload := ecb_coordination.current_payload(bound_reliance.head_receipt_id);
      if bound_reliance.epoch::text is distinct from bound_use->>'expected_reliance_epoch' then
        reconciliation_debt := reconciliation_debt || jsonb_build_array(
          jsonb_build_object('kind','external_reliance','state','EPOCH_MISMATCH',
            'bound_id',bound_use->>'external_reliance_id',
            'expected_epoch',bound_use->>'expected_reliance_epoch',
            'live_epoch',bound_reliance.epoch,'live_head',bound_reliance.head_receipt_id));
      end if;
      if bound_reliance_payload->>'currentness' is distinct from 'CURRENT' then
        reconciliation_debt := reconciliation_debt || jsonb_build_array(
          jsonb_build_object('kind','external_reliance','state','NOT_CURRENT'));
      end if;
    end if;

    if bound_consumer.id is null or bound_consumer.head_receipt_id is null then
      reconciliation_debt := reconciliation_debt || jsonb_build_array(
        jsonb_build_object('kind','consumer','state','BOUND_DEPENDENCY_MISSING',
          'bound_id',bound_use->>'consumer_binding_id'));
    else
      bound_consumer_payload := ecb_coordination.current_payload(bound_consumer.head_receipt_id);
      if bound_consumer.epoch::text is distinct from bound_use->>'expected_consumer_epoch' then
        reconciliation_debt := reconciliation_debt || jsonb_build_array(
          jsonb_build_object('kind','consumer','state','EPOCH_MISMATCH',
            'bound_id',bound_use->>'consumer_binding_id',
            'expected_epoch',bound_use->>'expected_consumer_epoch',
            'live_epoch',bound_consumer.epoch,'live_head',bound_consumer.head_receipt_id));
      end if;
      if bound_consumer_payload->>'connected_status' is distinct from 'CONNECTED'
         or bound_consumer_payload->>'observed_use' is distinct from 'OBSERVED' then
        reconciliation_debt := reconciliation_debt || jsonb_build_array(
          jsonb_build_object('kind','consumer','state','NOT_CONNECTED_OBSERVED'));
      end if;
    end if;

    if bound_use->'engagement_index' is distinct from current_index
       or bound_use->>'qualification_basis_artifact_id' is distinct from current_basis::text
       or bound_use->>'currentness' is distinct from 'CURRENT'
       or bound_use->>'ssmm_legality' is distinct from 'LEGAL'
       or bound_use->>'authority_scope' is distinct from 'AUTHORIZED'
       or current_payload#>>'{reconciliation,reliance_eligibility}' is distinct from 'ELIGIBLE'
       or bound_consumer_payload->>'environment' is distinct from bound_use->>'consumer_environment'
       or bound_consumer_payload->>'external_reliance_id' is distinct from bound_reliance.id::text
       or bound_consumer_payload->>'runtime_id' is distinct from bound_reliance_payload->>'observed_version'
       or not coalesce(bound_consumer_payload->'realization_artifact_ids' @>
         jsonb_build_array(current_constituents->>'realization_manifest'),false) then
      reconciliation_debt := reconciliation_debt || jsonb_build_array(
        jsonb_build_object('kind','current_use','state','BASIS_OR_AUTHORITY_MISMATCH'));
    end if;
  end if;
  current_use_qualified := jsonb_array_length(reconciliation_debt) = 0
    and jsonb_array_length(stale_rows) = 0;
  stale_rows := stale_rows || reconciliation_debt;

  return jsonb_build_object(
    'episode',jsonb_build_object(
      'id',episode_row.id,
      'profile_version',episode_row.profile_version,
      'epoch',episode_row.epoch,
      'head_receipt_id',episode_row.head_receipt_id,
      'qualification_basis_artifact_id',current_basis
    ),
    'current',jsonb_build_object(
      'envelope',current_content::jsonb,
      'engagement_index',current_index,
      'constituents',constituent_contents
    ),
    'external_reliances',reliance_rows,
    'consumer_bindings',consumer_rows,
    'supporting_receipts',supporting_rows,
    'projection',jsonb_build_object(
      'where_am_i',jsonb_build_object(
        'episode_id',episode_row.id,
        'epoch',episode_row.epoch,
        'engagement_index',current_index
      ),
      'what_matters',jsonb_build_object(
        'pgo_artifact_id',(current_index->>'g')::uuid,
        'pgo',pgo_content,
        'question_artifact_id',(current_index->>'q')::uuid,
        'question',question_content
      ),
      'what_next',jsonb_build_object(
        'ssmm_artifact_id',(current_index->>'t')::uuid,
        'ssmm',ssmm_content
      ),
      'stale_or_unauthorized',stale_rows
      ,'current_use_reconciliation',jsonb_build_object(
        'qualified',current_use_qualified,
        'bound_external_reliance_id',bound_use->>'external_reliance_id',
        'expected_reliance_epoch',bound_use->>'expected_reliance_epoch',
        'live_reliance_id',bound_reliance.id,
        'live_reliance_epoch',bound_reliance.epoch,
        'bound_consumer_id',bound_use->>'consumer_binding_id',
        'expected_consumer_epoch',bound_use->>'expected_consumer_epoch',
        'live_consumer_id',bound_consumer.id,
        'live_consumer_epoch',bound_consumer.epoch,
        'debt',reconciliation_debt)
    )
  );
exception when no_data_found then
  raise exception 'ecb190_episode_unavailable' using errcode = 'P0002';
end;
$$;

commit;
