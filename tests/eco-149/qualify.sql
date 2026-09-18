\set ON_ERROR_STOP on

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);

-- Fixture-only reviewer capability. Provisioning is intentionally outside the
-- ordinary runtime path and exists only in this disposable qualification DB.
insert into public.text_artifacts(id,content) values
  ('14900000-0000-4149-8149-000000000100'::uuid,'ECO-149 deterministic fixture assessment method v1'),
  ('14900000-0000-4149-8149-000000000101'::uuid,'Remit: eco149 disposable quadrant fixture; reversible_trial only'),
  ('14900000-0000-4149-8149-000000000102'::uuid,'Qualification basis: this fixture method checks explicit structural contrasts.');

insert into ecb_quadrant.reviewer_capabilities(
  id,key_digest,method_artifact_id,remit_artifact_id,qualification_basis_artifact_id,expires_at
) values (
  '14900000-0000-4149-8149-000000000103'::uuid,
  extensions.digest(pg_catalog.convert_to('eco149-reviewer-key','UTF8'),'sha256'),
  '14900000-0000-4149-8149-000000000100'::uuid,
  '14900000-0000-4149-8149-000000000101'::uuid,
  '14900000-0000-4149-8149-000000000102'::uuid,
  '2030-01-01T00:00:00Z'::timestamptz
);

-- C1: establish exact situated basis on a new channel.
set role anon;
select channel_id as eco149_channel, artifact_id as eco149_basis_artifact
from public.quadrant_v1_record(
  '14900000-0000-4149-8149-000000000001'::uuid,
  'basis',
  '{"profile":"ecb.quadrant/1","role":"basis","r":"rock-R1","boundary":"garden-border-seat","governing_orientation":"reversible seating trial","requested_use":"reversible_trial","scope":"one rock / one border seat / current fixture","source_standing":"synthetic fixture","stop_reentry":"reenter on material boundary/G/use change"}',
  null,null,true
) \gset
reset role;

-- Replay is recovery, not a second result.
set role anon;
do $$
declare r record;
begin
  select * into strict r from public.quadrant_v1_record(
    '14900000-0000-4149-8149-000000000001'::uuid,
    'basis',
    '{"profile":"ecb.quadrant/1","role":"basis","r":"rock-R1","boundary":"garden-border-seat","governing_orientation":"reversible seating trial","requested_use":"reversible_trial","scope":"one rock / one border seat / current fixture","source_standing":"synthetic fixture","stop_reentry":"reenter on material boundary/G/use change"}',
    null,null,true
  );
  if not r.replayed or r.channel_id <> :'eco149_channel'::uuid then
    raise exception 'exact replay failed to recover same basis result';
  end if;
end $$;
reset role;

-- Same operation identity with changed bytes must conflict.
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_record(
      '14900000-0000-4149-8149-000000000001'::uuid,
      'basis',
      '{"profile":"ecb.quadrant/1","role":"basis","r":"CHANGED","boundary":"garden-border-seat","governing_orientation":"reversible seating trial","requested_use":"reversible_trial","scope":"one rock / one border seat / current fixture","source_standing":"synthetic fixture","stop_reentry":"reenter"}',
      null,null,true
    );
    raise exception 'negative control failed: changed request replay succeeded';
  exception when unique_violation then
    if sqlerrm not like '%quadrant_operation_conflict%' then raise; end if;
  end;
end $$;
reset role;

-- Direct-RPC duplicate keys are rejected before jsonb conversion.
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_record(
      '14900000-0000-4149-8149-000000000002'::uuid,
      'basis',
      '{"profile":"ecb.quadrant/1","role":"basis","r":"R1","r":"R2","boundary":"b","governing_orientation":"g","requested_use":"reversible_trial","scope":"s","source_standing":"fixture","stop_reentry":"x"}',
      null,null,true
    );
    raise exception 'negative control failed: duplicate JSON key accepted';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_duplicate_json_key:%' then raise; end if;
  end;
end $$;
reset role;

-- C2: inquiry records all four coverage meanings but no rule treats population
-- itself as adequacy. Selection advances the operational epoch.
set role anon;
select result_epoch as eco149_epoch1
from public.quadrant_v1_record(
  '14900000-0000-4149-8149-000000000010'::uuid,
  'inquiry',
  '{"profile":"ecb.quadrant/1","role":"inquiry","basis_receipt":"14900000-0000-4149-8149-000000000001","question":"Can R1 serve this reversible seating trial?","seat":"focal referent under present G/use","burden":"sufficient warrant for reversible_trial","coverage":{"constitutive_governing":"unresolved","constitutive_determinate":"unresolved","participatory_governing":"unresolved","participatory_determinate":"unresolved"},"qf":[{"question":"Does the load create a consequential seam change?","route":"on_use","restriction":"must be assessed before support"}]}',
  :'eco149_channel'::uuid,0,true
) \gset
reset role;

-- PASS without a discriminating negative control cannot be issued.
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_assess(
      '14900000-0000-4149-8149-000000000019'::uuid,
      :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,
      '14900000-0000-4149-8149-000000000103'::uuid,
      '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"fixture supports reversible_trial","input_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":null,"scope":"fixture","limits":"synthetic only"}'
    );
    raise exception 'negative control failed: unsupported PASS accepted';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_positive_assessment_requires_control%' then raise; end if;
  end;
end $$;
reset role;

-- C3: authenticated assessment with explicit control.
set role anon;
select artifact_id as eco149_assessment_artifact
from public.quadrant_v1_assess(
  '14900000-0000-4149-8149-000000000020'::uuid,
  :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,
  '14900000-0000-4149-8149-000000000103'::uuid,
  '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"basis + inquiry are adequate for reversible_trial","input_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"all four coverage cells exist but warrant absent","observed":"would not qualify","would_reverse":"control unexpectedly passes"},"scope":"fixture reversible_trial","limits":"synthetic structure only; no real-world truth"}'
) \gset
reset role;

-- Wrong reviewer secret cannot produce a new assessment.
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"WRONG"}',
  false
);
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_assess(
      '14900000-0000-4149-8149-000000000021'::uuid,
      :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,
      '14900000-0000-4149-8149-000000000103'::uuid,
      '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"must fail authentication","input_receipts":["14900000-0000-4149-8149-000000000001"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"wrong key","observed":"reject"},"scope":"fixture","limits":"none"}'
    );
    raise exception 'negative control failed: wrong reviewer key accepted';
  exception when insufficient_privilege then
    if sqlerrm not like '%quadrant_reviewer_unavailable_or_revoked%' then raise; end if;
  end;
end $$;
reset role;

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);

-- C5: supported nonexecuting use requires current qualified assessment and no
-- unresolved authority. This creates no external effect.
set role anon;
select artifact_id as eco149_reliance_artifact
from public.quadrant_v1_qualify(
  '14900000-0000-4149-8149-000000000030'::uuid,
  :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,
  '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"14900000-0000-4149-8149-000000000020","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[{"question":"observe actual seating result later","route":"explicit_evidence_return"}]}'
) \gset
reset role;

-- C6: old reversible-use assessment may not silently support a broader use.
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_qualify(
      '14900000-0000-4149-8149-000000000031'::uuid,
      :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,
      '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"permanent_installation","permitted_use":"permanent_installation","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"14900000-0000-4149-8149-000000000020","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
    );
    raise exception 'negative control failed: changed use inherited old assessment';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_scope_incompatible:assessment_use%' then raise; end if;
  end;
end $$;
reset role;

-- C4: a selected change advances the fence. A claim of historical
-- requalification without old meaning is rejected.
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_record(
      '14900000-0000-4149-8149-000000000039'::uuid,
      'change',
      '{"profile":"ecb.quadrant/1","role":"change","before_receipt":"14900000-0000-4149-8149-000000000010","after_summary":"digest changed","classification":"changed_source","affected_scope":"trial","unknown_impact":true,"before_payload_available":false,"claims_historical_requalification":true}',
      :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,true
    );
    raise exception 'negative control failed: digest-only historical requalification accepted';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_historical_payload_missing%' then raise; end if;
  end;
end $$;

select result_epoch as eco149_epoch2
from public.quadrant_v1_record(
  '14900000-0000-4149-8149-000000000040'::uuid,
  'change',
  '{"profile":"ecb.quadrant/1","role":"change","before_receipt":"14900000-0000-4149-8149-000000000010","after_summary":"new seating observation returned","classification":"enrichment","affected_scope":"reversible_trial","unknown_impact":true,"before_payload_available":true,"claims_historical_requalification":false}',
  :'eco149_channel'::uuid,:'eco149_epoch1'::bigint,true
) \gset
reset role;

-- Old assessment is now historically readable but cannot support fresh use.
set role anon;
do $$
begin
  begin
    perform * from public.quadrant_v1_qualify(
      '14900000-0000-4149-8149-000000000041'::uuid,
      :'eco149_channel'::uuid,:'eco149_epoch2'::bigint,
      '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"14900000-0000-4149-8149-000000000020","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
    );
    raise exception 'negative control failed: stale assessment supported fresh use';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_scope_incompatible:stale_assessment%' then raise; end if;
  end;
end $$;
reset role;

-- Raw text saying PASS is not a protected assessment receipt.
set role anon;
select artifact_id as eco149_fake_pass_artifact
from public.ecb12_create_artifact(
  '14900000-0000-4149-8149-000000000050'::uuid,
  'PASS -- ordinary Artifact text, not quadrant assessment standing'
) \gset

do $$
begin
  begin
    perform * from public.quadrant_v1_qualify(
      '14900000-0000-4149-8149-000000000051'::uuid,
      :'eco149_channel'::uuid,:'eco149_epoch2'::bigint,
      format('{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"%s","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}', :'eco149_fake_pass_artifact')
    );
    raise exception 'negative control failed: raw PASS Artifact became assessment';
  exception when no_data_found then
    if sqlerrm not like '%quadrant_reference_unavailable%' then raise; end if;
  end;
end $$;
reset role;

-- Private tables are not a bypass surface for ordinary runtime.
set role anon;
do $$
begin
  begin
    insert into ecb_quadrant.channels(id) values(pg_catalog.gen_random_uuid());
    raise exception 'negative control failed: anon direct channel DML succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Scheme-aware Artifact evidence and standing transition use the same resolver.
insert into public.claims(id,proposition,scope)
values(
  '14900000-0000-4149-8149-000000000060'::uuid,
  'The ECO-149 supported reliance Artifact records the bounded fixture disposition.',
  'eco149:artifact_evidence'
);
insert into public.evidence_links(id,claim_id,evidence_referent_id)
values(
  '14900000-0000-4149-8149-000000000061'::uuid,
  '14900000-0000-4149-8149-000000000060'::uuid,
  :'eco149_reliance_artifact'::uuid
);

do $$
declare scheme text; d1 bytea; d2 bytea;
begin
  select evidence_revision_scheme,evidence_revision_digest into strict scheme,d1
  from public.evidence_links where id='14900000-0000-4149-8149-000000000061'::uuid;
  select digest into strict d2 from ecb_quadrant.evidence_revision(:'eco149_reliance_artifact'::uuid);
  if scheme <> 'ecb_text_artifact_v1_sha256' or d1 <> d2 then
    raise exception 'Artifact Evidence Link did not bind exact Artifact revision';
  end if;
end $$;

insert into public.claim_standing_transitions(
  id,claim_id,from_standing,to_standing,basis_evidence_link_id
) values (
  '14900000-0000-4149-8149-000000000062'::uuid,
  '14900000-0000-4149-8149-000000000060'::uuid,
  'unassessed','basis_qualified',
  '14900000-0000-4149-8149-000000000061'::uuid
);

-- Cold resolver recovers exact lineage without conversation state.
set role anon;
select public.quadrant_v1_resolve(:'eco149_channel'::uuid) as eco149_closure \gset
reset role;

do $$
declare c jsonb := :'eco149_closure'::jsonb;
begin
  if (c->>'epoch')::bigint <> :'eco149_epoch2'::bigint then
    raise exception 'cold resolver lost current channel epoch';
  end if;
  if pg_catalog.jsonb_array_length(c->'records') < 5 then
    raise exception 'cold resolver returned incomplete fixture closure';
  end if;
end $$;

-- No ordinary RPC or table state activates an external effect.
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'quadrant%execute%'
  ) then
    raise exception 'unexpected quadrant effect execution surface exists';
  end if;
end $$;
