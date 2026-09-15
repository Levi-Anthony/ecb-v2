-- Disposable experiment on the installed v2 schema. No DDL, no permission changes.
-- All row writes occur inside an exception subtransaction and are rolled back.
-- The session-local report contains no credentials or real personal facts.
do $probe$
declare
  ids uuid[] := array[gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),
                      gen_random_uuid(),gen_random_uuid(),gen_random_uuid(),gen_random_uuid()];
  bad_id uuid := gen_random_uuid();
  report jsonb := '{}'::jsonb;
  rejected boolean := false;
  rejected_constraint text;
  registered integer;
  retained integer;
  link_digest text;
  source_text text;
begin
  if current_database() <> 'postgres' or to_regclass('public.thought_representations') is null then
    raise exception 'Probe precondition differs: expected installed BUILD 11';
  end if;
  begin
    -- The Thought registers itself atomically. Illustrative source is explicit.
    insert into public.thoughts(id,content,source,captured_at)
    values(ids[1], 'Jennifer wanted me to call her back.',
      'EXPERIMENT ONLY: principal-supplied illustrative sentence; rollback-only ingestion probe',
      transaction_timestamp());
    -- Stable referential addresses, not claims that these identities are resolved.
    insert into public.referents(id) select unnest(ids[2:6]);
    -- ids[2]=Jennifer mention; [3]=speaker; [4]=reported desire; [5]=unspecified occasion;
    -- [6]=relationship under inquiry. This correspondence is a probe projection, not registry metadata.
    select count(*) into registered from public.referents where id=any(ids[1:6]);
    if registered <> 6 then raise exception 'Referential registration failed'; end if;
    select content into source_text from public.thoughts where id=ids[1];
    if source_text <> 'Jennifer wanted me to call her back.' then raise exception 'Source changed'; end if;
    insert into public.claims(id,proposition,scope)
      values(ids[7], 'The illustrative source reports Jennifer wanted the speaker to call her back; identities, purpose and currentness are not established.',
        'ingestion-probe:fixture-interpretation-only');
    insert into public.evidence_links(id,claim_id,evidence_referent_id,role)
      values(ids[8],ids[7],ids[1],'used_as_basis');
    select encode(evidence_revision_digest,'hex') into link_digest
      from public.evidence_links where id=ids[8];
    if not exists(select 1 from public.claims where id=ids[7] and origin='ecb_inference'
      and epistemic_standing='unassessed' and claim_kind='assertion') then
      raise exception 'Claim standing contract differs';
    end if;
    -- Contract-relevant negative control: arbitrary semantic relation is NOT installed.
    begin
      insert into public.claims(id,scope,claim_kind,subject_referent_id,predicate,object_referent_id)
      values(bad_id,'ingestion-probe:negative-control','relation',ids[2],'wanted_callback_from',ids[3]);
    exception when check_violation then
      get stacked diagnostics rejected_constraint=constraint_name;
      rejected := rejected_constraint='claims_predicate_vocabulary';
    end;
    if not rejected then raise exception 'Expected predicate constraint did not discriminate'; end if;
    if exists(select 1 from public.referents where id=bad_id) then
      raise exception 'Rejected relation left referent residue';
    end if;
    report := jsonb_build_object(
      'probe','ingestion-preparation-01','standing','mechanical-substrate-evidence-only',
      'transport','Supabase admin SQL, not ordinary MCP','database_version',version(),
      'ephemeral_ids',ids,'negative_control_id',bad_id,
      'registered_focal_and_disclosures',registered,'exact_source_preserved',true,
      'scoped_claim_standing','ecb_inference/unassessed',
      'evidence_digest',link_digest,'arbitrary_relation_rejected',rejected,
      'constraint',rejected_constraint,'rejected_registration_atomic',true,
      'unbound_subjects', (select count(*) from public.referents r where r.id=any(ids[2:6])
                           and not exists(select 1 from public.thoughts t where t.id=r.id)),
      'embedding_tested',false,'semantic_extraction_tested',false,
      'automatic_identity_resolution_tested',false);
    raise exception using errcode='ZX001',message='intentional probe rollback';
  exception when sqlstate 'ZX001' then
    null; -- Local variables survive; all writes above roll back.
  end;
  select count(*) into retained from public.referents where id=any(ids) or id=bad_id;
  if retained <> 0 then raise exception 'Probe rollback left referents'; end if;
  if exists(select 1 from public.thoughts where id=ids[1])
     or exists(select 1 from public.claims where id in (ids[7],bad_id))
     or exists(select 1 from public.evidence_links where id=ids[8]) then
    raise exception 'Probe rollback left native records';
  end if;
  report := report || jsonb_build_object('rollback_verified',true,'remaining_probe_rows',retained);
  perform set_config('ecb_ingestion_probe.result',report::text,true);
end $probe$;
select current_setting('ecb_ingestion_probe.result')::jsonb as probe_result;
