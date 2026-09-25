\set ON_ERROR_STOP on

-- ECO-159 pre-repair discriminator.
-- Run after ECO-149 qualify.sql and BEFORE the ECO-159 repair.
-- Everything is rolled back: this is an observed counterexample, not new standing state.

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

-- Alternate basis on the same channel, not selected current.
select * from public.quadrant_v1_record(
  '15900000-0000-4159-8159-000000000001'::uuid,
  'basis',
  '{"profile":"ecb.quadrant/1","role":"basis","r":"rock-R2","boundary":"different-seat","governing_orientation":"reversible seating trial","requested_use":"reversible_trial","scope":"alternate same-channel basis","source_standing":"synthetic counterexample","stop_reentry":"counterexample only"}',
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  false
);

select * from public.quadrant_v1_record(
  '15900000-0000-4159-8159-000000000002'::uuid,
  'inquiry',
  '{"profile":"ecb.quadrant/1","role":"inquiry","basis_receipt":"15900000-0000-4159-8159-000000000001","question":"Can alternate R2 serve?","seat":"alternate","burden":"counterexample","coverage":{"constitutive_governing":"unresolved","constitutive_determinate":"unresolved","participatory_governing":"unresolved","participatory_determinate":"unresolved"},"qf":[]}',
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  false
);

-- Assessment explicitly assesses the ORIGINAL basis + inquiry, not the alternate pair.
select * from public.quadrant_v1_assess(
  '15900000-0000-4159-8159-000000000003'::uuid,
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  '14900000-0000-4149-8149-000000000103'::uuid,
  '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"original pair supports reversible_trial","input_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"alternate pair is not assessed","observed":"should not transfer"},"scope":"original pair only","limits":"synthetic counterexample"}'
);

-- Historical ECO-149 qualifier incorrectly accepts the alternate pair because
-- all three receipts merely exist in the same channel and the assessment is current.
select * from public.quadrant_v1_qualify(
  '15900000-0000-4159-8159-000000000004'::uuid,
  pg_catalog.current_setting('eco159.test.channel')::uuid,
  pg_catalog.current_setting('eco159.test.epoch')::bigint,
  '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"15900000-0000-4159-8159-000000000001","inquiry_receipt":"15900000-0000-4159-8159-000000000002","assessment_receipt":"15900000-0000-4159-8159-000000000003","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
);

reset role;
rollback;

select 'ECO159_PRE_REPAIR_COUNTEREXAMPLE=OBSERVED' as result;
