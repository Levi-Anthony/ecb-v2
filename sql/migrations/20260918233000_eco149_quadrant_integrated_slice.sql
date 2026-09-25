-- ECO-149 — Register B quadrant integrated evidence-bearing slice
-- Disposable qualification candidate. No production installation is authorized by this file.

begin;

create schema ecb_quadrant authorization postgres;
revoke all on schema ecb_quadrant from public, anon, authenticated, service_role;

create table ecb_quadrant.reviewer_capabilities (
  id uuid primary key,
  key_digest bytea not null check (octet_length(key_digest) = 32),
  method_artifact_id uuid not null references public.text_artifacts(id) on update restrict on delete restrict,
  remit_artifact_id uuid not null references public.text_artifacts(id) on update restrict on delete restrict,
  qualification_basis_artifact_id uuid not null references public.text_artifacts(id) on update restrict on delete restrict,
  expires_at timestamptz not null,
  revoked_by_receipt_id uuid references public.ordinary_operations(id) on update restrict on delete restrict,
  constraint reviewer_capabilities_referent_fkey
    foreign key (id) references public.referents(id) on update restrict on delete restrict
);

create table ecb_quadrant.channels (
  id uuid primary key,
  epoch bigint not null default 0 check (epoch >= 0),
  head_receipt_id uuid,
  constraint channels_referent_fkey
    foreign key (id) references public.referents(id) on update restrict on delete restrict
);

create table ecb_quadrant.records (
  receipt_id uuid primary key references public.ordinary_operations(id) on update restrict on delete restrict,
  artifact_id uuid not null references public.text_artifacts(id) on update restrict on delete restrict,
  channel_id uuid references ecb_quadrant.channels(id) on update restrict on delete restrict,
  record_role text not null check (record_role in (
    'source_snapshot','basis','inquiry','assessment','change','selection','reliance','reviewer_revocation'
  )),
  profile_version text not null check (profile_version = 'ecb.quadrant/1'),
  observed_epoch bigint check (observed_epoch is null or observed_epoch >= 0),
  result_epoch bigint check (result_epoch is null or result_epoch >= 0),
  reviewer_capability_id uuid references ecb_quadrant.reviewer_capabilities(id) on update restrict on delete restrict,
  validator_revision text not null,
  constraint records_artifact_unique unique (artifact_id),
  recorded_at timestamptz not null default transaction_timestamp(),
  constraint records_channel_required_for_operational_roles check (
    (record_role in ('source_snapshot','reviewer_revocation') and channel_id is null)
    or (record_role not in ('source_snapshot','reviewer_revocation') and channel_id is not null)
  )
);

alter table ecb_quadrant.channels
  add constraint channels_head_receipt_fkey
  foreign key (head_receipt_id) references ecb_quadrant.records(receipt_id)
  on update restrict on delete restrict deferrable initially deferred;

alter table ecb_quadrant.reviewer_capabilities enable row level security;
alter table ecb_quadrant.channels enable row level security;
alter table ecb_quadrant.records enable row level security;
revoke all on table ecb_quadrant.reviewer_capabilities from public, anon, authenticated, service_role;
revoke all on table ecb_quadrant.channels from public, anon, authenticated, service_role;
revoke all on table ecb_quadrant.records from public, anon, authenticated, service_role;

create function ecb_quadrant.register_referent()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.referents(id) values (new.id);
  return new;
end;
$$;

create trigger quadrant_channels_register_referent
before insert on ecb_quadrant.channels
for each row execute function ecb_quadrant.register_referent();

create trigger quadrant_reviewer_capabilities_register_referent
before insert on ecb_quadrant.reviewer_capabilities
for each row execute function ecb_quadrant.register_referent();

create function ecb_quadrant.reject_record_mutation()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  raise exception 'quadrant_record_immutable' using errcode = '55000';
end;
$$;

create trigger quadrant_records_immutable
before update or delete on ecb_quadrant.records
for each row execute function ecb_quadrant.reject_record_mutation();

create trigger quadrant_records_no_truncate
before truncate on ecb_quadrant.records
for each statement execute function ecb_quadrant.reject_record_mutation();

create function ecb_quadrant.guard_capability_update()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.revoked_by_receipt_id is null
     and new.revoked_by_receipt_id is not null
     and new.id is not distinct from old.id
     and new.key_digest is not distinct from old.key_digest
     and new.method_artifact_id is not distinct from old.method_artifact_id
     and new.remit_artifact_id is not distinct from old.remit_artifact_id
     and new.qualification_basis_artifact_id is not distinct from old.qualification_basis_artifact_id
     and new.expires_at is not distinct from old.expires_at then
    return new;
  end if;
  raise exception 'quadrant_reviewer_capability_immutable_except_revocation' using errcode = '55000';
end;
$$;

create trigger quadrant_reviewer_capability_guard
before update on ecb_quadrant.reviewer_capabilities
for each row execute function ecb_quadrant.guard_capability_update();

create function ecb_quadrant.guard_channel_head()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  bound record;
begin
  if new.head_receipt_id is null then
    if new.epoch <> 0 then
      raise exception 'quadrant_channel_head_required' using errcode = '23514';
    end if;
    return new;
  end if;

  select r.channel_id, r.record_role, r.result_epoch
  into strict bound
  from ecb_quadrant.records r
  where r.receipt_id = new.head_receipt_id;

  if bound.channel_id <> new.id
     or bound.record_role not in ('basis','inquiry','change','selection')
     or bound.result_epoch is distinct from new.epoch then
    raise exception 'quadrant_channel_head_mismatch' using errcode = '23514';
  end if;
  return new;
exception when no_data_found then
  raise exception 'quadrant_channel_head_unavailable' using errcode = 'P0002';
end;
$$;

create trigger quadrant_channel_head_guard
before update of epoch, head_receipt_id on ecb_quadrant.channels
for each row execute function ecb_quadrant.guard_channel_head();

revoke all on function ecb_quadrant.register_referent() from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.reject_record_mutation() from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.guard_capability_update() from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.guard_channel_head() from public, anon, authenticated, service_role;

alter table public.claims drop constraint claims_predicate_vocabulary;
alter table public.claims add constraint claims_predicate_vocabulary
  check (predicate is null or predicate in (
    'depends_on','quad_revises','quad_refocuses_from','quad_refines_question'
  ));

alter table public.evidence_links drop constraint evidence_links_revision_scheme_v1;
alter table public.evidence_links add constraint evidence_links_revision_scheme_vocabulary
  check (evidence_revision_scheme in (
    'ecb_thought_revision_v1_sha256','ecb_text_artifact_v1_sha256'
  ));

create function ecb_quadrant.artifact_revision_digest(p_artifact_id uuid)
returns bytea language plpgsql stable security definer set search_path = '' as $$
declare
  content_octets bytea;
  digest_input bytea;
begin
  select pg_catalog.convert_to(a.content, 'UTF8')
  into strict content_octets
  from public.text_artifacts a
  where a.id = p_artifact_id;

  digest_input :=
    pg_catalog.convert_to('ECB-TEXT-ARTIFACT-REVISION-V1', 'UTF8')
    || pg_catalog.decode('00','hex')
    || pg_catalog.int8send(pg_catalog.octet_length(content_octets)::bigint)
    || content_octets;
  return extensions.digest(digest_input, 'sha256');
exception when no_data_found then
  raise exception 'quadrant_artifact_evidence_unavailable' using errcode = 'P0002';
end;
$$;

create function ecb_quadrant.evidence_revision(p_referent_id uuid)
returns table(scheme text, digest bytea)
language plpgsql volatile security definer set search_path = '' as $$
declare
  is_thought boolean;
  is_artifact boolean;
begin
  select exists(select 1 from public.thoughts t where t.id = p_referent_id),
         exists(select 1 from public.text_artifacts a where a.id = p_referent_id)
  into is_thought, is_artifact;

  if is_thought and not is_artifact then
    return query select 'ecb_thought_revision_v1_sha256'::text,
      public.thought_revision_digest(p_referent_id);
    return;
  elsif is_artifact and not is_thought then
    return query select 'ecb_text_artifact_v1_sha256'::text,
      ecb_quadrant.artifact_revision_digest(p_referent_id);
    return;
  end if;
  raise exception 'quadrant_wrong_native_type_or_ambiguous_evidence' using errcode = '42804';
end;
$$;

create or replace function public.prepare_evidence_link()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  resolved record;
begin
  select * into strict resolved
  from ecb_quadrant.evidence_revision(new.evidence_referent_id);

  insert into public.referents(id) values (new.id);
  new.role := 'used_as_basis';
  new.evidence_revision_scheme := resolved.scheme;
  new.evidence_revision_digest := resolved.digest;
  new.linked_at := pg_catalog.transaction_timestamp();
  return new;
exception when no_data_found then
  raise exception 'quadrant_evidence_unavailable' using errcode = 'P0002';
end;
$$;

create or replace function public.prepare_claim_standing_transition()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  basis_claim_id uuid;
  basis_evidence_referent_id uuid;
  basis_scheme text;
  basis_digest bytea;
  current_scheme text;
  current_digest bytea;
  applied_standing text;
begin
  insert into public.referents(id) values (new.id);

  select l.claim_id, l.evidence_referent_id, l.evidence_revision_scheme, l.evidence_revision_digest
  into strict basis_claim_id, basis_evidence_referent_id, basis_scheme, basis_digest
  from public.evidence_links l where l.id = new.basis_evidence_link_id;

  if basis_claim_id <> new.claim_id then
    raise exception 'quadrant_standing_basis_claim_mismatch' using errcode = '23514';
  end if;

  select scheme, digest into strict current_scheme, current_digest
  from ecb_quadrant.evidence_revision(basis_evidence_referent_id);
  if current_scheme <> basis_scheme or current_digest <> basis_digest then
    raise exception 'quadrant_standing_basis_revision_mismatch' using errcode = '40001';
  end if;

  select c.epistemic_standing into strict applied_standing
  from public.claims c where c.id = new.claim_id for update;
  if applied_standing <> new.from_standing then
    raise exception 'quadrant_standing_predecessor_conflict' using errcode = '40001';
  end if;

  new.observed_revision_digest := current_digest;
  new.recorded_at := pg_catalog.transaction_timestamp();
  update public.claims set epistemic_standing = new.to_standing where id = new.claim_id;
  return new;
exception when no_data_found then
  raise exception 'quadrant_standing_subject_or_basis_unavailable' using errcode = 'P0002';
end;
$$;

revoke all on function ecb_quadrant.artifact_revision_digest(uuid) from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.evidence_revision(uuid) from public, anon, authenticated, service_role;
revoke all on function public.prepare_evidence_link() from public, anon, authenticated, service_role;
revoke all on function public.prepare_claim_standing_transition() from public, anon, authenticated, service_role;

create function ecb_quadrant.assert_unique_json_keys(p_value json)
returns void language plpgsql immutable set search_path = '' as $$
declare
  kind text;
  duplicate_key text;
  child json;
begin
  kind := pg_catalog.json_typeof(p_value);
  if kind = 'object' then
    select e.key into duplicate_key
    from pg_catalog.json_each(p_value) e
    group by e.key having count(*) > 1 limit 1;
    if duplicate_key is not null then
      raise exception 'quadrant_duplicate_json_key:%', duplicate_key using errcode = '22023';
    end if;
    for child in select e.value from pg_catalog.json_each(p_value) e loop
      perform ecb_quadrant.assert_unique_json_keys(child);
    end loop;
  elsif kind = 'array' then
    for child in select a.value from pg_catalog.json_array_elements(p_value) a loop
      perform ecb_quadrant.assert_unique_json_keys(child);
    end loop;
  end if;
end;
$$;

create function ecb_quadrant.require_keys(p_payload jsonb, p_keys text[])
returns void language plpgsql immutable set search_path = '' as $$
declare k text;
begin
  foreach k in array p_keys loop
    if not (p_payload ? k) then
      raise exception 'quadrant_required_key_missing:%', k using errcode = '22023';
    end if;
  end loop;
end;
$$;

create function ecb_quadrant.parse_payload(p_role text, p_text text)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare raw json; payload jsonb; coverage jsonb;
begin
  if p_text is null or pg_catalog.octet_length(pg_catalog.convert_to(p_text,'UTF8')) > 262144 then
    raise exception 'quadrant_input_limit' using errcode = '22023';
  end if;
  begin
    raw := p_text::json;
  exception when others then
    raise exception 'quadrant_invalid_json' using errcode = '22023';
  end;
  perform ecb_quadrant.assert_unique_json_keys(raw);
  payload := raw::jsonb;
  if pg_catalog.jsonb_typeof(payload) <> 'object' then
    raise exception 'quadrant_profile_object_required' using errcode = '22023';
  end if;
  if payload->>'profile' <> 'ecb.quadrant/1' or payload->>'role' <> p_role then
    raise exception 'quadrant_unsupported_profile' using errcode = '22023';
  end if;

  case p_role
    when 'source_snapshot' then
      perform ecb_quadrant.require_keys(payload, array['source_identity','content_or_extract','standing_at_capture','omissions']);
    when 'basis' then
      perform ecb_quadrant.require_keys(payload, array['r','boundary','governing_orientation','requested_use','scope','source_standing','stop_reentry']);
    when 'inquiry' then
      perform ecb_quadrant.require_keys(payload, array['basis_receipt','question','seat','burden','coverage','qf']);
      coverage := payload->'coverage';
      if pg_catalog.jsonb_typeof(coverage) <> 'object' then
        raise exception 'quadrant_coverage_object_required' using errcode = '22023';
      end if;
      perform ecb_quadrant.require_keys(coverage, array['constitutive_governing','constitutive_determinate','participatory_governing','participatory_determinate']);
    when 'change' then
      perform ecb_quadrant.require_keys(payload, array['before_receipt','after_summary','classification','affected_scope','unknown_impact','before_payload_available','claims_historical_requalification']);
      if coalesce((payload->>'claims_historical_requalification')::boolean,false)
         and not coalesce((payload->>'before_payload_available')::boolean,false) then
        raise exception 'quadrant_historical_payload_missing' using errcode = '22023';
      end if;
    when 'selection' then
      perform ecb_quadrant.require_keys(payload, array['selected_receipts','reason']);
    when 'assessment' then
      perform ecb_quadrant.require_keys(payload, array['proposition','input_receipts','method','use','result','negative_control','scope','limits']);
      if payload->>'result' not in ('PASS','FAIL','INDETERMINATE') then
        raise exception 'quadrant_unsupported_assessment' using errcode = '22023';
      end if;
      if payload->>'result' = 'PASS' and (payload->'negative_control' is null or payload->'negative_control' = 'null'::jsonb) then
        raise exception 'quadrant_positive_assessment_requires_control' using errcode = '22023';
      end if;
    when 'reliance' then
      perform ecb_quadrant.require_keys(payload, array['requested_use','permitted_use','basis_receipt','inquiry_receipt','assessment_receipt','disposition','authority_status','decisive_gap','qf']);
      if payload->>'disposition' not in ('supported','narrowed','suspended','indeterminate') then
        raise exception 'quadrant_reliance_disposition_invalid' using errcode = '22023';
      end if;
    else
      raise exception 'quadrant_record_role_invalid' using errcode = '22023';
  end case;
  return payload;
end;
$$;

revoke all on function ecb_quadrant.assert_unique_json_keys(json) from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.require_keys(jsonb,text[]) from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.parse_payload(text,text) from public, anon, authenticated, service_role;

create function ecb_quadrant.request_digest(
  p_kind text, p_role text, p_submitted_text text, p_channel_id uuid,
  p_expected_epoch bigint, p_select boolean, p_capability_id uuid
)
returns bytea language sql immutable set search_path = '' as $$
  select extensions.digest(
    pg_catalog.convert_to(
      'ECB-QUADRANT-REQUEST-V1|#|' ||
      pg_catalog.jsonb_build_object(
        'kind',p_kind,'role',p_role,'submitted_text',p_submitted_text,
        'channel_id',p_channel_id,'expected_epoch',p_expected_epoch,
        'select',coalesce(p_select,false),'capability_id',p_capability_id
      )::text,
      'UTF8'
    ), 'sha256'
  );
$$;

create function ecb_quadrant.make_envelope(
  p_operation_id uuid, p_artifact_id uuid, p_role text, p_submitted_text text,
  p_payload jsonb, p_channel_id uuid, p_observed_epoch bigint, p_result_epoch bigint,
  p_capability_id uuid, p_validator_revision text
)
returns text language sql immutable set search_path = '' as $$
  select pg_catalog.jsonb_build_object(
    'profile','ecb.quadrant/1',
    'operation_id',p_operation_id,
    'artifact_id',p_artifact_id,
    'record_role',p_role,
    'submitted_text',p_submitted_text,
    'parsed',p_payload,
    'channel_id',p_channel_id,
    'observed_epoch',p_observed_epoch,
    'result_epoch',p_result_epoch,
    'authenticated_reviewer_capability_id',p_capability_id,
    'validator_revision',p_validator_revision
  )::text;
$$;

create function ecb_quadrant.assert_receipts_in_channel(p_channel_id uuid, p_receipts jsonb)
returns void language plpgsql stable security definer set search_path = '' as $$
declare item jsonb; rid uuid;
begin
  if p_receipts is null or pg_catalog.jsonb_typeof(p_receipts) <> 'array' then
    raise exception 'quadrant_receipt_array_required' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_array_length(p_receipts) > 256 then
    raise exception 'quadrant_input_limit' using errcode = '22023';
  end if;
  for item in select value from pg_catalog.jsonb_array_elements(p_receipts) loop
    rid := trim(both '"' from item::text)::uuid;
    if not exists(select 1 from ecb_quadrant.records r where r.receipt_id=rid and r.channel_id=p_channel_id) then
      raise exception 'quadrant_reference_unavailable:%', rid using errcode = 'P0002';
    end if;
  end loop;
end;
$$;

revoke all on function ecb_quadrant.request_digest(text,text,text,uuid,bigint,boolean,uuid) from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.make_envelope(uuid,uuid,text,text,jsonb,uuid,bigint,bigint,uuid,text) from public, anon, authenticated, service_role;
revoke all on function ecb_quadrant.assert_receipts_in_channel(uuid,jsonb) from public, anon, authenticated, service_role;

create function public.quadrant_v1_record(
  p_operation_id uuid,
  p_record_role text,
  p_submitted_text text,
  p_channel_id uuid default null,
  p_expected_epoch bigint default null,
  p_select boolean default false
)
returns table(
  operation_id uuid, receipt_id uuid, artifact_id uuid, channel_id uuid,
  observed_epoch bigint, result_epoch bigint, replayed boolean, envelope text
)
language plpgsql security definer set search_path = '' as $$
declare
  payload jsonb;
  digest bytea;
  existing_op public.ordinary_operations;
  existing_rec ecb_quadrant.records;
  existing_art public.text_artifacts;
  channel_row ecb_quadrant.channels;
  out_channel uuid;
  new_channel boolean := false;
  out_artifact uuid;
  out_observed bigint;
  out_result bigint;
  out_envelope text;
begin
  perform ecb11.assert_runtime_key();
  if p_operation_id is null then raise exception 'quadrant_operation_id_required' using errcode='22023'; end if;
  if p_record_role not in ('source_snapshot','basis','inquiry','change','selection') then
    raise exception 'quadrant_record_role_invalid' using errcode='22023';
  end if;
  payload := ecb_quadrant.parse_payload(p_record_role,p_submitted_text);
  digest := ecb_quadrant.request_digest('quadrant_record',p_record_role,p_submitted_text,p_channel_id,p_expected_epoch,p_select,null);

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_id::text,0));
  select o.* into existing_op from public.ordinary_operations o where o.id=p_operation_id;
  if found then
    if existing_op.operation_kind <> 'quadrant_record' or existing_op.request_digest <> digest then
      raise exception 'quadrant_operation_conflict' using errcode='23505';
    end if;
    select r.* into strict existing_rec from ecb_quadrant.records r where r.receipt_id=p_operation_id;
    select a.* into strict existing_art from public.text_artifacts a where a.id=existing_rec.artifact_id;
    return query select p_operation_id,p_operation_id,existing_rec.artifact_id,existing_rec.channel_id,
      existing_rec.observed_epoch,existing_rec.result_epoch,true,existing_art.content;
    return;
  end if;

  if p_record_role='source_snapshot' then
    if p_channel_id is not null or p_select then raise exception 'quadrant_source_snapshot_must_be_standalone' using errcode='22023'; end if;
    out_channel := null; out_observed := null; out_result := null;
  else
    out_channel := p_channel_id;
    if out_channel is null then
      if p_record_role <> 'basis' or not p_select then
        raise exception 'quadrant_channel_required' using errcode='22023';
      end if;
      out_channel := pg_catalog.gen_random_uuid();
      insert into ecb_quadrant.channels(id,epoch,head_receipt_id) values(out_channel,0,null);
      new_channel := true;
    else
      select c.* into strict channel_row from ecb_quadrant.channels c where c.id=out_channel for update;
    end if;

    if new_channel then
      out_observed := 0; out_result := 0;
    else
      out_observed := channel_row.epoch;
      if p_expected_epoch is null or p_expected_epoch <> out_observed then
        raise exception 'quadrant_revision_conflict' using errcode='40001';
      end if;
      out_result := out_observed + case when p_select then 1 else 0 end;
    end if;

    if p_record_role='inquiry' then
      perform ecb_quadrant.assert_receipts_in_channel(out_channel, pg_catalog.jsonb_build_array(payload->>'basis_receipt'));
    elsif p_record_role='change' then
      perform ecb_quadrant.assert_receipts_in_channel(out_channel, pg_catalog.jsonb_build_array(payload->>'before_receipt'));
    elsif p_record_role='selection' then
      perform ecb_quadrant.assert_receipts_in_channel(out_channel,payload->'selected_receipts');
    end if;
  end if;

  out_artifact := pg_catalog.gen_random_uuid();
  out_envelope := ecb_quadrant.make_envelope(
    p_operation_id,out_artifact,p_record_role,p_submitted_text,payload,out_channel,
    out_observed,out_result,null,'eco149-v1'
  );
  insert into public.text_artifacts(id,content) values(out_artifact,out_envelope);
  insert into public.ordinary_operations(id,operation_kind,request_digest,result_referent_id)
    values(p_operation_id,'quadrant_record',digest,out_artifact);
  insert into ecb_quadrant.records(
    receipt_id,artifact_id,channel_id,record_role,profile_version,observed_epoch,result_epoch,validator_revision
  ) values(p_operation_id,out_artifact,out_channel,p_record_role,'ecb.quadrant/1',out_observed,out_result,'eco149-v1');

  if out_channel is not null and p_select then
    update ecb_quadrant.channels set epoch=out_result,head_receipt_id=p_operation_id where id=out_channel;
  end if;

  return query select p_operation_id,p_operation_id,out_artifact,out_channel,out_observed,out_result,false,out_envelope;
end;
$$;

create function ecb_quadrant.authenticate_reviewer(p_capability_id uuid)
returns ecb_quadrant.reviewer_capabilities
language plpgsql volatile security definer set search_path = '' as $$
declare
  cap ecb_quadrant.reviewer_capabilities;
  headers jsonb;
  secret text;
begin
  if p_capability_id is null then raise exception 'quadrant_reviewer_capability_required' using errcode='22023'; end if;
  begin headers := pg_catalog.current_setting('request.headers',true)::jsonb; exception when others then headers := '{}'::jsonb; end;
  secret := headers->>'x-ecb-quadrant-reviewer-key';
  select c.* into strict cap from ecb_quadrant.reviewer_capabilities c where c.id=p_capability_id for share;
  if secret is null or extensions.digest(pg_catalog.convert_to(secret,'UTF8'),'sha256') <> cap.key_digest
     or cap.expires_at <= pg_catalog.transaction_timestamp() or cap.revoked_by_receipt_id is not null then
    raise exception 'quadrant_reviewer_unavailable_or_revoked' using errcode='42501';
  end if;
  return cap;
exception when no_data_found then
  raise exception 'quadrant_reviewer_unavailable_or_revoked' using errcode='42501';
end;
$$;

create function public.quadrant_v1_assess(
  p_operation_id uuid,
  p_channel_id uuid,
  p_expected_epoch bigint,
  p_capability_id uuid,
  p_submitted_text text
)
returns table(operation_id uuid,receipt_id uuid,artifact_id uuid,channel_id uuid,observed_epoch bigint,result_epoch bigint,replayed boolean,envelope text)
language plpgsql security definer set search_path = '' as $$
declare
  payload jsonb; digest bytea; existing_op public.ordinary_operations; existing_rec ecb_quadrant.records;
  existing_art public.text_artifacts; channel_row ecb_quadrant.channels; cap ecb_quadrant.reviewer_capabilities;
  out_artifact uuid; out_envelope text;
begin
  perform ecb11.assert_runtime_key();
  if p_operation_id is null or p_channel_id is null then raise exception 'quadrant_operation_or_channel_required' using errcode='22023'; end if;
  payload := ecb_quadrant.parse_payload('assessment',p_submitted_text);
  digest := ecb_quadrant.request_digest('quadrant_assess','assessment',p_submitted_text,p_channel_id,p_expected_epoch,false,p_capability_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_id::text,0));
  select o.* into existing_op from public.ordinary_operations o where o.id=p_operation_id;
  if found then
    if existing_op.operation_kind <> 'quadrant_assess' or existing_op.request_digest <> digest then raise exception 'quadrant_operation_conflict' using errcode='23505'; end if;
    select r.* into strict existing_rec from ecb_quadrant.records r where r.receipt_id=p_operation_id;
    select a.* into strict existing_art from public.text_artifacts a where a.id=existing_rec.artifact_id;
    return query select p_operation_id,p_operation_id,existing_rec.artifact_id,existing_rec.channel_id,existing_rec.observed_epoch,existing_rec.result_epoch,true,existing_art.content;
    return;
  end if;

  cap := ecb_quadrant.authenticate_reviewer(p_capability_id);
  select c.* into strict channel_row from ecb_quadrant.channels c where c.id=p_channel_id for update;
  if p_expected_epoch is null or channel_row.epoch <> p_expected_epoch then raise exception 'quadrant_revision_conflict' using errcode='40001'; end if;
  perform ecb_quadrant.assert_receipts_in_channel(p_channel_id,payload->'input_receipts');

  out_artifact := pg_catalog.gen_random_uuid();
  out_envelope := ecb_quadrant.make_envelope(p_operation_id,out_artifact,'assessment',p_submitted_text,payload,p_channel_id,channel_row.epoch,channel_row.epoch,p_capability_id,'eco149-v1');
  insert into public.text_artifacts(id,content) values(out_artifact,out_envelope);
  insert into public.ordinary_operations(id,operation_kind,request_digest,result_referent_id) values(p_operation_id,'quadrant_assess',digest,out_artifact);
  insert into ecb_quadrant.records(receipt_id,artifact_id,channel_id,record_role,profile_version,observed_epoch,result_epoch,reviewer_capability_id,validator_revision)
    values(p_operation_id,out_artifact,p_channel_id,'assessment','ecb.quadrant/1',channel_row.epoch,channel_row.epoch,p_capability_id,'eco149-v1');
  return query select p_operation_id,p_operation_id,out_artifact,p_channel_id,channel_row.epoch,channel_row.epoch,false,out_envelope;
end;
$$;

create function public.quadrant_v1_qualify(
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
  basis_id uuid; inquiry_id uuid; assessment_id uuid; basis_rec ecb_quadrant.records; inquiry_rec ecb_quadrant.records; assess_rec ecb_quadrant.records;
  assess_payload jsonb; cap ecb_quadrant.reviewer_capabilities; out_artifact uuid; out_envelope text;
begin
  perform ecb11.assert_runtime_key();
  if p_operation_id is null or p_channel_id is null then raise exception 'quadrant_operation_or_channel_required' using errcode='22023'; end if;
  payload := ecb_quadrant.parse_payload('reliance',p_submitted_text);
  digest := ecb_quadrant.request_digest('quadrant_qualify','reliance',p_submitted_text,p_channel_id,p_expected_epoch,false,null);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_operation_id::text,0));
  select o.* into existing_op from public.ordinary_operations o where o.id=p_operation_id;
  if found then
    if existing_op.operation_kind <> 'quadrant_qualify' or existing_op.request_digest <> digest then raise exception 'quadrant_operation_conflict' using errcode='23505'; end if;
    select r.* into strict existing_rec from ecb_quadrant.records r where r.receipt_id=p_operation_id;
    select a.* into strict existing_art from public.text_artifacts a where a.id=existing_rec.artifact_id;
    return query select p_operation_id,p_operation_id,existing_rec.artifact_id,existing_rec.channel_id,existing_rec.observed_epoch,existing_rec.result_epoch,true,existing_art.content;
    return;
  end if;

  select c.* into strict channel_row from ecb_quadrant.channels c where c.id=p_channel_id for update;
  if p_expected_epoch is null or channel_row.epoch <> p_expected_epoch then raise exception 'quadrant_revision_conflict' using errcode='40001'; end if;

  basis_id := (payload->>'basis_receipt')::uuid;
  inquiry_id := (payload->>'inquiry_receipt')::uuid;
  assessment_id := (payload->>'assessment_receipt')::uuid;
  select r.* into strict basis_rec from ecb_quadrant.records r where r.receipt_id=basis_id and r.channel_id=p_channel_id and r.record_role='basis';
  select r.* into strict inquiry_rec from ecb_quadrant.records r where r.receipt_id=inquiry_id and r.channel_id=p_channel_id and r.record_role='inquiry';
  select r.* into strict assess_rec from ecb_quadrant.records r where r.receipt_id=assessment_id and r.channel_id=p_channel_id and r.record_role='assessment';
  if assess_rec.observed_epoch <> channel_row.epoch then raise exception 'quadrant_scope_incompatible:stale_assessment' using errcode='22023'; end if;

  select (a.content::jsonb)->'parsed' into strict assess_payload from public.text_artifacts a where a.id=assess_rec.artifact_id;
  if payload->>'disposition' in ('supported','narrowed') then
    if assess_payload->>'result' <> 'PASS' then raise exception 'quadrant_unsupported_assessment' using errcode='22023'; end if;
    if assess_payload->>'use' <> payload->>'permitted_use' then raise exception 'quadrant_scope_incompatible:assessment_use' using errcode='22023'; end if;
    select c.* into strict cap from ecb_quadrant.reviewer_capabilities c where c.id=assess_rec.reviewer_capability_id for share;
    if cap.expires_at <= pg_catalog.transaction_timestamp() or cap.revoked_by_receipt_id is not null then raise exception 'quadrant_reviewer_unavailable_or_revoked' using errcode='42501'; end if;
    if coalesce((payload->>'decisive_gap')::boolean,true) then raise exception 'quadrant_scope_incompatible:decisive_gap' using errcode='22023'; end if;
    if payload->>'authority_status' = 'required_unresolved' then raise exception 'quadrant_authority_unresolved' using errcode='42501'; end if;
    if payload->>'disposition'='supported' and payload->>'requested_use' <> payload->>'permitted_use' then raise exception 'quadrant_scope_incompatible:requested_permitted_use' using errcode='22023'; end if;
    if payload->>'disposition'='narrowed' and payload->>'requested_use' = payload->>'permitted_use' then raise exception 'quadrant_scope_incompatible:narrowing_not_expressed' using errcode='22023'; end if;
  end if;

  out_artifact := pg_catalog.gen_random_uuid();
  out_envelope := ecb_quadrant.make_envelope(p_operation_id,out_artifact,'reliance',p_submitted_text,payload,p_channel_id,channel_row.epoch,channel_row.epoch,null,'eco149-v1');
  insert into public.text_artifacts(id,content) values(out_artifact,out_envelope);
  insert into public.ordinary_operations(id,operation_kind,request_digest,result_referent_id) values(p_operation_id,'quadrant_qualify',digest,out_artifact);
  insert into ecb_quadrant.records(receipt_id,artifact_id,channel_id,record_role,profile_version,observed_epoch,result_epoch,validator_revision)
    values(p_operation_id,out_artifact,p_channel_id,'reliance','ecb.quadrant/1',channel_row.epoch,channel_row.epoch,'eco149-v1');
  return query select p_operation_id,p_operation_id,out_artifact,p_channel_id,channel_row.epoch,channel_row.epoch,false,out_envelope;
exception when no_data_found then
  raise exception 'quadrant_reference_unavailable' using errcode='P0002';
end;
$$;

create function public.quadrant_v1_resolve(p_channel_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare out jsonb;
begin
  perform ecb11.assert_runtime_key();
  if not exists(select 1 from ecb_quadrant.channels c where c.id=p_channel_id) then raise exception 'quadrant_reference_unavailable' using errcode='P0002'; end if;
  select pg_catalog.jsonb_build_object(
    'channel_id',c.id,'epoch',c.epoch,'head_receipt_id',c.head_receipt_id,
    'records',coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'receipt_id',r.receipt_id,'artifact_id',r.artifact_id,'role',r.record_role,
        'observed_epoch',r.observed_epoch,'result_epoch',r.result_epoch,
        'reviewer_capability_id',r.reviewer_capability_id,'envelope',a.content::jsonb
      ) order by o.committed_at,r.receipt_id)
      from ecb_quadrant.records r
      join public.text_artifacts a on a.id=r.artifact_id
      join public.ordinary_operations o on o.id=r.receipt_id
      where r.channel_id=c.id
    ),'[]'::jsonb)
  ) into out from ecb_quadrant.channels c where c.id=p_channel_id;
  return out;
end;
$$;

revoke all on function ecb_quadrant.authenticate_reviewer(uuid) from public, anon, authenticated, service_role;
revoke all on function public.quadrant_v1_record(uuid,text,text,uuid,bigint,boolean) from public, authenticated, service_role;
revoke all on function public.quadrant_v1_assess(uuid,uuid,bigint,uuid,text) from public, authenticated, service_role;
revoke all on function public.quadrant_v1_qualify(uuid,uuid,bigint,text) from public, authenticated, service_role;
revoke all on function public.quadrant_v1_resolve(uuid) from public, authenticated, service_role;
grant execute on function public.quadrant_v1_record(uuid,text,text,uuid,bigint,boolean) to anon;
grant execute on function public.quadrant_v1_assess(uuid,uuid,bigint,uuid,text) to anon;
grant execute on function public.quadrant_v1_qualify(uuid,uuid,bigint,text) to anon;
grant execute on function public.quadrant_v1_resolve(uuid) to anon;

commit;
