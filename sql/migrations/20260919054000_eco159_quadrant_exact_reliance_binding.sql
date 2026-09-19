-- ECO-159 — exact reliance-input binding repair for ECO-149 quadrant proof
-- Forward-only qualification repair. The historical ECO-149 migration remains unchanged.
-- Disposable/repository qualification only; no production installation is authorized.

begin;

create or replace function public.quadrant_v1_qualify(
  p_operation_id uuid,
  p_channel_id uuid,
  p_expected_epoch bigint,
  p_submitted_text text
)
returns table(operation_id uuid,receipt_id uuid,artifact_id uuid,channel_id uuid,observed_epoch bigint,result_epoch bigint,replayed boolean,envelope text)
language plpgsql security definer set search_path = '' as $$
declare
  payload jsonb; digest bytea; existing_op public.ordinary_operations; existing_rec ecb_quadrant.records;
  existing_art public.text_artifacts; channel_row ecb_quadrant.channels;
  basis_id uuid; inquiry_id uuid; assessment_id uuid;
  basis_rec ecb_quadrant.records; inquiry_rec ecb_quadrant.records; assess_rec ecb_quadrant.records;
  inquiry_payload jsonb; assess_payload jsonb; cap ecb_quadrant.reviewer_capabilities;
  out_artifact uuid; out_envelope text;
begin
  perform ecb11.assert_runtime_key();
  if p_operation_id is null or p_channel_id is null then
    raise exception 'quadrant_operation_or_channel_required' using errcode='22023';
  end if;

  payload := ecb_quadrant.parse_payload('reliance',p_submitted_text);
  digest := ecb_quadrant.request_digest(
    'quadrant_qualify','reliance',p_submitted_text,p_channel_id,p_expected_epoch,false,null
  );

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_id::text,0));
  select o.* into existing_op from public.ordinary_operations o where o.id=p_operation_id;
  if found then
    if existing_op.operation_kind <> 'quadrant_qualify' or existing_op.request_digest <> digest then
      raise exception 'quadrant_operation_conflict' using errcode='23505';
    end if;
    select r.* into strict existing_rec
    from ecb_quadrant.records r where r.receipt_id=p_operation_id;
    select a.* into strict existing_art
    from public.text_artifacts a where a.id=existing_rec.artifact_id;
    return query select
      p_operation_id,p_operation_id,existing_rec.artifact_id,existing_rec.channel_id,
      existing_rec.observed_epoch,existing_rec.result_epoch,true,existing_art.content;
    return;
  end if;

  select c.* into strict channel_row
  from ecb_quadrant.channels c
  where c.id=p_channel_id
  for update;

  if p_expected_epoch is null or channel_row.epoch <> p_expected_epoch then
    raise exception 'quadrant_revision_conflict' using errcode='40001';
  end if;

  basis_id := (payload->>'basis_receipt')::uuid;
  inquiry_id := (payload->>'inquiry_receipt')::uuid;
  assessment_id := (payload->>'assessment_receipt')::uuid;

  select r.* into strict basis_rec
  from ecb_quadrant.records r
  where r.receipt_id=basis_id and r.channel_id=p_channel_id and r.record_role='basis';

  select r.* into strict inquiry_rec
  from ecb_quadrant.records r
  where r.receipt_id=inquiry_id and r.channel_id=p_channel_id and r.record_role='inquiry';

  select r.* into strict assess_rec
  from ecb_quadrant.records r
  where r.receipt_id=assessment_id and r.channel_id=p_channel_id and r.record_role='assessment';

  if assess_rec.observed_epoch <> channel_row.epoch then
    raise exception 'quadrant_scope_incompatible:stale_assessment' using errcode='22023';
  end if;

  select (a.content::jsonb)->'parsed' into strict inquiry_payload
  from public.text_artifacts a
  where a.id=inquiry_rec.artifact_id;

  select (a.content::jsonb)->'parsed' into strict assess_payload
  from public.text_artifacts a
  where a.id=assess_rec.artifact_id;

  -- A reliance bundle must preserve the exact chain it claims:
  -- inquiry -> basis and assessment -> {basis,inquiry}.
  -- Mere same-channel membership is insufficient.
  if (inquiry_payload->>'basis_receipt')::uuid <> basis_id then
    raise exception 'quadrant_scope_incompatible:inquiry_basis' using errcode='22023';
  end if;

  if not ((assess_payload->'input_receipts') ? basis_id::text)
     or not ((assess_payload->'input_receipts') ? inquiry_id::text) then
    raise exception 'quadrant_scope_incompatible:assessment_inputs' using errcode='22023';
  end if;

  if payload->>'disposition' in ('supported','narrowed') then
    if assess_payload->>'result' <> 'PASS' then
      raise exception 'quadrant_unsupported_assessment' using errcode='22023';
    end if;
    if assess_payload->>'use' <> payload->>'permitted_use' then
      raise exception 'quadrant_scope_incompatible:assessment_use' using errcode='22023';
    end if;

    select c.* into strict cap
    from ecb_quadrant.reviewer_capabilities c
    where c.id=assess_rec.reviewer_capability_id
    for share;

    if cap.expires_at <= pg_catalog.transaction_timestamp()
       or cap.revoked_by_receipt_id is not null then
      raise exception 'quadrant_reviewer_unavailable_or_revoked' using errcode='42501';
    end if;
    if coalesce((payload->>'decisive_gap')::boolean,true) then
      raise exception 'quadrant_scope_incompatible:decisive_gap' using errcode='22023';
    end if;
    if payload->>'authority_status' = 'required_unresolved' then
      raise exception 'quadrant_authority_unresolved' using errcode='42501';
    end if;
    if payload->>'disposition'='supported'
       and payload->>'requested_use' <> payload->>'permitted_use' then
      raise exception 'quadrant_scope_incompatible:requested_permitted_use' using errcode='22023';
    end if;
    if payload->>'disposition'='narrowed'
       and payload->>'requested_use' = payload->>'permitted_use' then
      raise exception 'quadrant_scope_incompatible:narrowing_not_expressed' using errcode='22023';
    end if;
  end if;

  out_artifact := pg_catalog.gen_random_uuid();
  out_envelope := ecb_quadrant.make_envelope(
    p_operation_id,out_artifact,'reliance',p_submitted_text,payload,p_channel_id,
    channel_row.epoch,channel_row.epoch,null,'eco159-binding-v1'
  );
  insert into public.text_artifacts(id,content) values(out_artifact,out_envelope);
  insert into public.ordinary_operations(id,operation_kind,request_digest,result_referent_id)
    values(p_operation_id,'quadrant_qualify',digest,out_artifact);
  insert into ecb_quadrant.records(
    receipt_id,artifact_id,channel_id,record_role,profile_version,
    observed_epoch,result_epoch,validator_revision
  ) values(
    p_operation_id,out_artifact,p_channel_id,'reliance','ecb.quadrant/1',
    channel_row.epoch,channel_row.epoch,'eco159-binding-v1'
  );

  return query select
    p_operation_id,p_operation_id,out_artifact,p_channel_id,
    channel_row.epoch,channel_row.epoch,false,out_envelope;

exception when no_data_found then
  raise exception 'quadrant_reference_unavailable' using errcode='P0002';
end;
$$;

revoke all on function public.quadrant_v1_qualify(uuid,uuid,bigint,text)
  from public, authenticated, service_role;
grant execute on function public.quadrant_v1_qualify(uuid,uuid,bigint,text) to anon;

commit;
