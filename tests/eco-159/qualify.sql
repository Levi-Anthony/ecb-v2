\set ON_ERROR_STOP on

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);
select pg_catalog.set_config(
  'eco159.test.channel',
  (select channel_id::text from ecb_quadrant.records
   where receipt_id='14900000-0000-4149-8149-000000000001'::uuid),
  false
);
select pg_catalog.set_config(
  'eco159.test.epoch',
  (select epoch::text from ecb_quadrant.channels
   where id=pg_catalog.current_setting('eco159.test.channel')::uuid),
  false
);

begin;
set role anon;

select * from public.quadrant_v1_record(
  '15900000-0000-4159-8159-000000000011'::uuid,
  'basis',
  '{"profile":"ecb.quadrant/1","role":"basis","r":"rock-R2","boundary":"different-seat","governing_orientation":"reversible seating trial","requested_use":"reversible_trial","scope":"alternate same-channel basis","source_standing":"synthetic regression","stop_reentry":"regression only"}',
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  false
);

select * from public.quadrant_v1_record(
  '15900000-0000-4159-8159-000000000012'::uuid,
  'inquiry',
  '{"profile":"ecb.quadrant/1","role":"inquiry","basis_receipt":"15900000-0000-4159-8159-000000000011","question":"Can alternate R2 serve?","seat":"alternate","burden":"regression","coverage":{"constitutive_governing":"unresolved","constitutive_determinate":"unresolved","participatory_governing":"unresolved","participatory_determinate":"unresolved"},"qf":[]}',
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  false
);

-- Assessment of original basis + original inquiry.
select * from public.quadrant_v1_assess(
  '15900000-0000-4159-8159-000000000013'::uuid,
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  '14900000-0000-4149-8149-000000000103'::uuid,
  '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"original pair supports reversible_trial","input_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"alternate pair is not assessed","observed":"must not transfer"},"scope":"original pair only","limits":"synthetic regression"}'
);

do $$
begin
  begin
    perform * from public.quadrant_v1_qualify(
      '15900000-0000-4159-8159-000000000014'::uuid,
      pg_catalog.current_setting('eco159.test.channel')::uuid,
      pg_catalog.current_setting('eco159.test.epoch')::bigint,
      '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"15900000-0000-4159-8159-000000000011","inquiry_receipt":"15900000-0000-4159-8159-000000000012","assessment_receipt":"15900000-0000-4159-8159-000000000013","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
    );
    raise exception 'negative control failed: assessment transferred to unassessed basis/inquiry';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_scope_incompatible:assessment_inputs%' then raise; end if;
  end;
end $$;

-- Build an assessment that includes original basis + alternate inquiry.
-- This isolates the second binding: the inquiry itself must point to the relied-on basis.
select * from public.quadrant_v1_assess(
  '15900000-0000-4159-8159-000000000015'::uuid,
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  '14900000-0000-4149-8149-000000000103'::uuid,
  '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"mixed pair structural counterexample","input_receipts":["14900000-0000-4149-8149-000000000001","15900000-0000-4159-8159-000000000012"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"inquiry points to different basis","observed":"must reject at reliance"},"scope":"mixed pair only","limits":"synthetic regression"}'
);

do $$
begin
  begin
    perform * from public.quadrant_v1_qualify(
      '15900000-0000-4159-8159-000000000016'::uuid,
      pg_catalog.current_setting('eco159.test.channel')::uuid,
      pg_catalog.current_setting('eco159.test.epoch')::bigint,
      '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"15900000-0000-4159-8159-000000000012","assessment_receipt":"15900000-0000-4159-8159-000000000015","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
    );
    raise exception 'negative control failed: inquiry/basis mismatch accepted';
  exception when invalid_parameter_value then
    if sqlerrm not like '%quadrant_scope_incompatible:inquiry_basis%' then raise; end if;
  end;
end $$;

-- Positive control: exact original basis/inquiry are both assessed and remain current.
select * from public.quadrant_v1_assess(
  '15900000-0000-4159-8159-000000000017'::uuid,
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  '14900000-0000-4149-8149-000000000103'::uuid,
  '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"exact original pair remains boundedly qualified","input_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"mismatched pair","observed":"rejected by exact binding"},"scope":"original pair only","limits":"synthetic regression"}'
);

select * from public.quadrant_v1_qualify(
  '15900000-0000-4159-8159-000000000018'::uuid,
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"15900000-0000-4159-8159-000000000017","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
);

reset role;
rollback;

select 'ECO159_BINDING_REPAIR=PASS' as result;
