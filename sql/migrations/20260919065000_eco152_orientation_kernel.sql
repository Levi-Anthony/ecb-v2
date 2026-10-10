-- ECO-152 / BUILD 7-prime: isolated orientation lifecycle specimen.
-- Forward realization on BUILD 6/11/corrected 12/ECO-138/140, NOT an install queue.
-- No production installation, real authority provisioning, or effect execution.
-- Names are implementation-local and provisional. ECO-151 semantics govern.
begin;
create schema ecb_orientation;
revoke all on schema ecb_orientation from public, anon, authenticated, service_role;

create table ecb_orientation.scopes (
  id uuid primary key references public.referents(id),
  focal_referent_id uuid not null references public.referents(id),
  manifest_id uuid not null references public.text_artifacts(id),
  declared_use text not null check (length(btrim(declared_use)) > 0),
  epoch bigint not null default 0 check (epoch >= 0),
  current_binding_id uuid,
  last_fence_id uuid
);
create table ecb_orientation.capabilities (
  id uuid primary key references public.referents(id),
  capability_kind text not null check (capability_kind in ('reviewer','binder')),
  scope_id uuid not null references ecb_orientation.scopes(id),
  subject_id uuid not null references public.referents(id),
  issuer_id uuid not null references public.referents(id),
  method_id uuid not null references public.text_artifacts(id),
  remit_id uuid not null references public.text_artifacts(id),
  basis_id uuid not null references public.text_artifacts(id),
  allowed_actions text[] not null,
  key_digest bytea not null check (octet_length(key_digest)=32),
  expires_at timestamptz not null,
  revoked_by uuid references public.text_artifacts(id)
);
create table ecb_orientation.records (
  receipt_id uuid primary key references public.ordinary_operations(id),
  artifact_id uuid not null unique references public.text_artifacts(id),
  scope_id uuid not null references ecb_orientation.scopes(id),
  record_kind text not null check (record_kind in
    ('open_scope','resolution','qualification','observation','applicability','fence_change','authority_decision','bind')),
  observed_epoch bigint not null,
  result_epoch bigint not null,
  predecessor_id uuid references ecb_orientation.records(receipt_id),
  resolution_id uuid references public.text_artifacts(id),
  qualification_id uuid references public.text_artifacts(id),
  observation_id uuid references public.text_artifacts(id),
  applicability_id uuid references public.text_artifacts(id),
  authority_id uuid references public.text_artifacts(id),
  change_id uuid references ecb_orientation.records(receipt_id),
  capability_id uuid references ecb_orientation.capabilities(id),
  declared_use text not null,
  result text,
  binding_action text check (binding_action in ('select','reaffirm','withdraw')),
  validator_revision text not null default 'eco152-v1'
);
alter table ecb_orientation.scopes add foreign key(current_binding_id) references ecb_orientation.records(receipt_id);
alter table ecb_orientation.scopes add foreign key(last_fence_id) references ecb_orientation.records(receipt_id);
create index orientation_records_scope on ecb_orientation.records(scope_id, record_kind);

create function ecb_orientation.register_subject() returns trigger
language plpgsql set search_path='' as $$
begin insert into public.referents(id) values(new.id); return new; end $$;
create trigger orientation_scope_referent before insert on ecb_orientation.scopes
for each row execute function ecb_orientation.register_subject();
create trigger orientation_capability_referent before insert on ecb_orientation.capabilities
for each row execute function ecb_orientation.register_subject();
create function ecb_orientation.immutable() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'orientation_immutable' using errcode='55000'; end $$;
create trigger orientation_records_immutable before update or delete on ecb_orientation.records
for each row execute function ecb_orientation.immutable();
create function ecb_orientation.guard_scope() returns trigger
language plpgsql set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception 'orientation_scope_immutable'; end if;
  if (to_jsonb(new)-array['epoch','current_binding_id','last_fence_id']) is distinct from
     (to_jsonb(old)-array['epoch','current_binding_id','last_fence_id']) or new.epoch<>old.epoch+1 then
    raise exception 'orientation_scope_integrity';
  end if;
  return new;
end $$;
create trigger orientation_scope_guard before update or delete on ecb_orientation.scopes
for each row execute function ecb_orientation.guard_scope();
create function ecb_orientation.guard_capability() returns trigger
language plpgsql set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception 'orientation_capability_immutable'; end if;
  if (to_jsonb(new)-'revoked_by') is distinct from (to_jsonb(old)-'revoked_by')
    or old.revoked_by is not null or new.revoked_by is null then
    raise exception 'orientation_capability_immutable';
  end if;
  return new;
end $$;
create trigger orientation_capability_guard before update or delete on ecb_orientation.capabilities
for each row execute function ecb_orientation.guard_capability();

create function ecb_orientation.unique_keys(j json) returns void
language plpgsql immutable set search_path='' as $$
declare v json;
begin
  if json_typeof(j)='object' then
    if exists(select 1 from json_each(j) group by key having count(*)>1) then
      raise exception 'orientation_duplicate_json_key' using errcode='22023';
    end if;
    for v in select value from json_each(j) loop perform ecb_orientation.unique_keys(v); end loop;
  elsif json_typeof(j)='array' then
    for v in select value from json_array_elements(j) loop perform ecb_orientation.unique_keys(v); end loop;
  end if;
end $$;
create function ecb_orientation.require(j jsonb, keys text[]) returns void
language plpgsql immutable set search_path='' as $$
declare k text;
begin
  if jsonb_typeof(j) is distinct from 'object' then raise exception 'orientation_object_required'; end if;
  foreach k in array keys loop
    if not (j ? k) or j->k='null'::jsonb or j->>k='' then
      raise exception 'orientation_required_field:%',k using errcode='22023';
    end if;
  end loop;
end $$;
create function ecb_orientation.payload(p_id uuid) returns jsonb
language sql stable set search_path='' as $$
  select (a.content::jsonb)->'payload' from public.text_artifacts a where a.id=p_id
$$;
create function ecb_orientation.record_for(p_id uuid,p_kind text,p_scope uuid)
returns ecb_orientation.records language plpgsql stable set search_path='' as $$
declare r ecb_orientation.records;
begin
  select * into r from ecb_orientation.records where artifact_id=p_id;
  if not found or r.record_kind is distinct from p_kind or r.scope_id is distinct from p_scope then
    raise exception 'orientation_exact_record_mismatch:%',p_kind using errcode='22023';
  end if;
  return r;
end $$;
create function ecb_orientation.cap_status(p_id uuid) returns text
language sql stable set search_path='' as $$
  select coalesce((select case when revoked_by is not null then 'revoked'
    when expires_at<=statement_timestamp() then 'expired' else 'applicable' end
    from ecb_orientation.capabilities where id=p_id),'unresolved')
$$;
create function ecb_orientation.authenticate(p_id uuid,p_kind text,p_scope uuid)
returns ecb_orientation.capabilities language plpgsql set search_path='' as $$
declare c ecb_orientation.capabilities; h jsonb; secret text;
begin
  select * into c from ecb_orientation.capabilities where id=p_id for share;
  begin h:=current_setting('request.headers',true)::jsonb; exception when others then h:='{}'; end;
  secret:=h->>('x-ecb-orientation-'||p_kind||'-key');
  if c.id is null or c.capability_kind is distinct from p_kind or c.scope_id is distinct from p_scope
    or c.revoked_by is not null or c.expires_at<=clock_timestamp() or secret is null
    or extensions.digest(convert_to(secret,'UTF8'),'sha256') is distinct from c.key_digest then
    raise exception 'orientation_capability_denied:%',p_kind using errcode='42501';
  end if;
  return c;
end $$;
create function ecb_orientation.assert_manifest(j jsonb,p_nonempty boolean) returns void
language plpgsql stable set search_path='' as $$
declare e jsonb; txt text;
begin
  if jsonb_typeof(j) is distinct from 'array' then raise exception 'orientation_manifest_array_required'; end if;
  if p_nonempty and jsonb_array_length(j)=0 then raise exception 'orientation_manifest_empty'; end if;
  for e in select value from jsonb_array_elements(j) loop
    perform ecb_orientation.require(e,array['artifact_id','sha256','version','role','standing']);
    select content into txt from public.text_artifacts where id=(e->>'artifact_id')::uuid;
    if not found or encode(extensions.digest(convert_to(txt,'UTF8'),'sha256'),'hex') is distinct from e->>'sha256' then
      raise exception 'orientation_exact_source_revision_mismatch' using errcode='22023';
    end if;
  end loop;
end $$;
create function ecb_orientation.qf_blocked(p_resolution uuid,p_use text) returns boolean
language sql stable set search_path='' as $$
  select exists(select 1 from jsonb_array_elements(ecb_orientation.payload(p_resolution)->'question_forward') q
    where q->>'affected_use'=p_use and (q->>'decisive')::boolean and q->>'status'<>'resolved')
$$;
create function ecb_orientation.render(p_receipt uuid,p_replayed boolean) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object('operation_id',r.receipt_id,'artifact_id',r.artifact_id,'scope_id',r.scope_id,
    'observed_epoch',r.observed_epoch,'result_epoch',r.result_epoch,'replayed',p_replayed,
    'record_kind',r.record_kind,'envelope',a.content)
  from ecb_orientation.records r join public.text_artifacts a on a.id=r.artifact_id where r.receipt_id=p_receipt
$$;

-- One confined dispatcher groups the write families; each family retains its own
-- role, exact bindings, capability checks, receipts and transition restrictions.
create function public.orientation_v1_write(
  p_operation_id uuid,p_kind text,p_scope_id uuid,p_expected_epoch bigint,
  p_expected_predecessor uuid,p_submitted_text text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  j jsonb; v jsonb; scope_row ecb_orientation.scopes; cap ecb_orientation.capabilities;
  op public.ordinary_operations; r ecb_orientation.records; q ecb_orientation.records;
  a ecb_orientation.records; o ecb_orientation.records; prev ecb_orientation.records;
  digest bytea; sid uuid; aid uuid; result_epoch bigint; observed_epoch bigint;
  rid uuid; qid uuid; oid uuid; apid uuid; authid uuid; changeid uuid; capid uuid;
  outcome text; act text; use_value text; envelope text; old_payload jsonb;
begin
  perform ecb11.assert_runtime_key();
  if p_operation_id is null or p_submitted_text is null or octet_length(p_submitted_text)>1048576 then
    raise exception 'orientation_request_invalid' using errcode='22023';
  end if;
  if p_kind is null or p_kind not in ('open_scope','resolution','qualification','observation','applicability','fence_change','authority_decision','bind') then
    raise exception 'orientation_kind_invalid';
  end if;
  perform ecb_orientation.unique_keys(p_submitted_text::json);
  j:=p_submitted_text::jsonb;
  perform ecb_orientation.require(j,array['profile']);
  if j->>'profile'<>'ecb.orientation/1' then raise exception 'orientation_profile_unsupported'; end if;
  digest:=extensions.digest(convert_to('ECO152-V1|'||jsonb_build_object('kind',p_kind,'scope',p_scope_id,
    'epoch',p_expected_epoch,'predecessor',p_expected_predecessor,'submitted_text',p_submitted_text)::text,'UTF8'),'sha256');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  select * into op from public.ordinary_operations where id=p_operation_id;
  if found then
    if op.operation_kind is distinct from 'orientation_'||p_kind or op.request_digest is distinct from digest then
      raise exception 'orientation_operation_conflict' using errcode='23505';
    end if;
    -- Replay is historical recovery, not reauthorization for present reliance.
    return ecb_orientation.render(p_operation_id,true);
  end if;
  sid:=p_scope_id;
  if p_kind='open_scope' then
    if sid is not null or p_expected_epoch is not null or p_expected_predecessor is not null then
      raise exception 'orientation_open_scope_tuple';
    end if;
    perform ecb_orientation.require(j,array['focal_referent_id','boundary','declared_use','stop','reentry']);
    sid:=gen_random_uuid(); observed_epoch:=0; result_epoch:=0; use_value:=j->>'declared_use';
  else
    select * into scope_row from ecb_orientation.scopes where id=sid for update;
    if not found then raise exception 'orientation_scope_missing'; end if;
    if p_expected_epoch is null or scope_row.epoch<>p_expected_epoch then
      raise exception 'orientation_epoch_conflict' using errcode='40001';
    end if;
    if p_expected_predecessor is distinct from scope_row.current_binding_id then
      raise exception 'orientation_predecessor_conflict' using errcode='40001';
    end if;
    observed_epoch:=scope_row.epoch; result_epoch:=observed_epoch; use_value:=scope_row.declared_use;
  end if;

  if p_kind='resolution' then
    perform ecb_orientation.require(j,array['scope_id','focal_referent_id','boundary','declared_use','purpose',
      'governing_sources','grammar','obligations','evidence','access_limits','dependencies','authority',
      'question_forward','stop','reentry']);
    if (j->>'scope_id')::uuid is distinct from sid or (j->>'focal_referent_id')::uuid is distinct from scope_row.focal_referent_id
      or j->>'declared_use' is distinct from use_value
      or j->>'boundary' is distinct from ecb_orientation.payload(scope_row.manifest_id)->>'boundary' then
      raise exception 'orientation_scope_use_mismatch';
    end if;
    perform ecb_orientation.assert_manifest(j->'governing_sources',true);
    perform ecb_orientation.assert_manifest(jsonb_build_array(j->'grammar'),true);
    perform ecb_orientation.assert_manifest(j->'dependencies',false);
    perform ecb_orientation.assert_manifest(j->'evidence',false);
    if jsonb_typeof(j->'obligations') is distinct from 'array' or jsonb_array_length(j->'obligations')=0
       or jsonb_typeof(j->'question_forward') is distinct from 'array' then raise exception 'orientation_inquiry_shape'; end if;
    for v in select value from jsonb_array_elements(j->'obligations') loop
      perform ecb_orientation.require(v,array['name','version','status']);
    end loop;
    for v in select value from jsonb_array_elements(j->'question_forward') loop
      perform ecb_orientation.require(v,array['question','affected_use','decisive','status','route','restriction','reentry']);
      if jsonb_typeof(v->'decisive') is distinct from 'boolean' or v->>'status' not in ('open','resolved') then
        raise exception 'orientation_qf_shape';
      end if;
    end loop;
    if j->>'parent_resolution_id' is not null then
      perform ecb_orientation.record_for((j->>'parent_resolution_id')::uuid,'resolution',sid);
    end if;
  elsif p_kind in ('qualification','applicability') then
    perform ecb_orientation.require(j,array['resolution_id','capability_id','declared_use','method_id','remit_id','basis_id',
      'findings','negative_controls','result','limits']);
    rid:=(j->>'resolution_id')::uuid;
    r:=ecb_orientation.record_for(rid,'resolution',sid);
    capid:=(j->>'capability_id')::uuid;
    cap:=ecb_orientation.authenticate(capid,'reviewer',sid);
    if j->>'declared_use' is distinct from use_value or (j->>'method_id')::uuid is distinct from cap.method_id
      or (j->>'remit_id')::uuid is distinct from cap.remit_id or (j->>'basis_id')::uuid is distinct from cap.basis_id then
      raise exception 'orientation_reviewer_remit_mismatch';
    end if;
    if jsonb_typeof(j->'findings') is distinct from 'array' or jsonb_array_length(j->'findings')=0
      or jsonb_typeof(j->'negative_controls') is distinct from 'array' then raise exception 'orientation_findings_required'; end if;
    perform ecb_orientation.assert_manifest(j->'negative_controls',j->>'result'='PASS');
    outcome:=j->>'result';
    if p_kind='qualification' then
      if outcome not in ('PASS','FAIL','INCOMPLETE','INDETERMINATE') then raise exception 'orientation_qualification_result'; end if;
      changeid:=(j->>'change_receipt_id')::uuid;
      if changeid is distinct from scope_row.last_fence_id then raise exception 'orientation_change_basis_mismatch'; end if;
      if changeid is not null and outcome='PASS' then
        select * into a from ecb_orientation.records where receipt_id=changeid;
        if r.observed_epoch<a.result_epoch then
          o:=ecb_orientation.record_for(a.observation_id,'observation',sid);
          if (ecb_orientation.payload(o.artifact_id)->>'history_available')::boolean is not true
            or j->>'historical_requalification' is distinct from 'true' then
            raise exception 'orientation_historical_payload_unavailable';
          end if;
        end if;
      end if;
    else
      perform ecb_orientation.require(j,array['observation_id','affected_use','rationale']);
      oid:=(j->>'observation_id')::uuid;
      o:=ecb_orientation.record_for(oid,'observation',sid);
      if o.resolution_id is distinct from rid or j->>'affected_use' is distinct from use_value then
        raise exception 'orientation_observation_lineage_mismatch';
      end if;
      if outcome not in ('unaffected','material','unknown','incompatible') then raise exception 'orientation_applicability_result'; end if;
    end if;
  elsif p_kind='observation' then
    perform ecb_orientation.require(j,array['resolution_id','after_artifact_id','history_available','description']);
    rid:=(j->>'resolution_id')::uuid;
    perform ecb_orientation.record_for(rid,'resolution',sid);
    if jsonb_typeof(j->'history_available') is distinct from 'boolean' then raise exception 'orientation_history_flag_invalid'; end if;
    if not exists(select 1 from public.text_artifacts where id=(j->>'after_artifact_id')::uuid) then
      raise exception 'orientation_after_payload_unavailable';
    end if;
    if (j->>'history_available')::boolean then
      if not exists(select 1 from public.text_artifacts where id=(j->>'before_artifact_id')::uuid) then
        raise exception 'orientation_before_payload_unavailable';
      end if;
    end if;
  elsif p_kind='fence_change' then
    perform ecb_orientation.require(j,array['applicability_id']);
    apid:=(j->>'applicability_id')::uuid;
    a:=ecb_orientation.record_for(apid,'applicability',sid);
    rid:=a.resolution_id; oid:=a.observation_id;
    if a.observed_epoch<>observed_epoch or ecb_orientation.cap_status(a.capability_id)<>'applicable' then
      raise exception 'orientation_stale_applicability';
    end if;
    if a.result='incompatible' then raise exception 'orientation_refocus_required'; end if;
    if a.result not in ('material','unknown') then raise exception 'orientation_unaffected_must_not_fence'; end if;
    if scope_row.current_binding_id is not null then
      select * into prev from ecb_orientation.records where receipt_id=scope_row.current_binding_id;
      if prev.resolution_id is distinct from rid then raise exception 'orientation_change_wrong_current_resolution'; end if;
    end if;
    result_epoch:=observed_epoch+1; outcome:=a.result;
  elsif p_kind='authority_decision' then
    perform ecb_orientation.require(j,array['capability_id','action','acting_id','issuer_id','evidence_id']);
    capid:=(j->>'capability_id')::uuid;
    cap:=ecb_orientation.authenticate(capid,'binder',sid);
    act:=j->>'action'; rid:=(j->>'resolution_id')::uuid; qid:=(j->>'qualification_id')::uuid;
    if act not in ('select','reaffirm','withdraw') or not (act=any(cap.allowed_actions))
      or (j->>'acting_id')::uuid is distinct from cap.subject_id or (j->>'issuer_id')::uuid is distinct from cap.issuer_id
      or (j->>'evidence_id')::uuid is distinct from cap.basis_id then raise exception 'orientation_authority_remit_mismatch'; end if;
    if act='withdraw' then
      if rid is not null or qid is not null then raise exception 'orientation_withdraw_tuple'; end if;
    else
      r:=ecb_orientation.record_for(rid,'resolution',sid);
      q:=ecb_orientation.record_for(qid,'qualification',sid);
      if q.resolution_id is distinct from rid or q.observed_epoch<>observed_epoch or q.declared_use is distinct from use_value then
        raise exception 'orientation_exact_qualification_mismatch';
      end if;
    end if;
    outcome:='fixture_applicable';
  elsif p_kind='bind' then
    perform ecb_orientation.require(j,array['action','authority_decision_id']);
    act:=j->>'action'; rid:=(j->>'resolution_id')::uuid; qid:=(j->>'qualification_id')::uuid;
    authid:=(j->>'authority_decision_id')::uuid;
    a:=ecb_orientation.record_for(authid,'authority_decision',sid);
    -- Lock capability rows so concurrent revocation cannot pass the commit seam.
    select * into cap from ecb_orientation.capabilities where id=a.capability_id for share;
    if ecb_orientation.cap_status(a.capability_id)<>'applicable' then raise exception 'orientation_authority_unavailable'; end if;
    if a.observed_epoch<>observed_epoch or a.predecessor_id is distinct from p_expected_predecessor
      or a.binding_action is distinct from act or a.resolution_id is distinct from rid or a.qualification_id is distinct from qid then
      raise exception 'orientation_exact_authority_tuple_mismatch';
    end if;
    if act='withdraw' then
      if rid is not null or qid is not null then raise exception 'orientation_withdraw_tuple'; end if;
    else
      if act not in ('select','reaffirm') then raise exception 'orientation_binding_action'; end if;
      r:=ecb_orientation.record_for(rid,'resolution',sid);
      q:=ecb_orientation.record_for(qid,'qualification',sid);
      if q.resolution_id is distinct from rid or q.observed_epoch<>observed_epoch
        or q.declared_use is distinct from use_value or q.result is distinct from 'PASS'
        or q.change_id is distinct from scope_row.last_fence_id then raise exception 'orientation_exact_qualification_mismatch'; end if;
      perform 1 from ecb_orientation.capabilities where id=q.capability_id for share;
      if ecb_orientation.cap_status(q.capability_id)<>'applicable' then raise exception 'orientation_reviewer_unavailable'; end if;
      if ecb_orientation.qf_blocked(rid,use_value) then raise exception 'orientation_decisive_qf'; end if;
      if act='reaffirm' then
        select * into prev from ecb_orientation.records where receipt_id=scope_row.current_binding_id;
        if prev.resolution_id is distinct from rid then raise exception 'orientation_reaffirm_wrong_resolution'; end if;
      end if;
    end if;
    result_epoch:=observed_epoch+1; outcome:=act;
  end if;

  aid:=gen_random_uuid();
  envelope:=jsonb_build_object('profile','ecb.orientation/1','operation_id',p_operation_id,'artifact_id',aid,
    'scope_id',sid,'record_kind',p_kind,'submitted_text',p_submitted_text,'payload',j,
    'observed_epoch',observed_epoch,'result_epoch',result_epoch,'predecessor_id',p_expected_predecessor,
    'authenticated_capability_id',capid,'validator_revision','eco152-v1')::text;
  insert into public.text_artifacts(id,content) values(aid,envelope);
  if p_kind='open_scope' then
    insert into ecb_orientation.scopes(id,focal_referent_id,manifest_id,declared_use)
      values(sid,(j->>'focal_referent_id')::uuid,aid,use_value);
  end if;
  insert into public.ordinary_operations(id,operation_kind,request_digest,result_referent_id)
    values(p_operation_id,'orientation_'||p_kind,digest,aid);
  insert into ecb_orientation.records(receipt_id,artifact_id,scope_id,record_kind,observed_epoch,result_epoch,
    predecessor_id,resolution_id,qualification_id,observation_id,applicability_id,authority_id,change_id,
    capability_id,declared_use,result,binding_action)
    values(p_operation_id,aid,sid,p_kind,observed_epoch,result_epoch,p_expected_predecessor,rid,qid,oid,apid,
      authid,changeid,capid,use_value,outcome,act);
  if p_kind='bind' then
    update ecb_orientation.scopes set epoch=result_epoch,
      current_binding_id=case when act='withdraw' then null else p_operation_id end where id=sid;
  elsif p_kind='fence_change' then
    update ecb_orientation.scopes set epoch=result_epoch,last_fence_id=p_operation_id where id=sid;
  end if;
  return ecb_orientation.render(p_operation_id,false);
end $$;

create function public.orientation_v1_resolve(p_scope_id uuid,p_requested_use text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare s ecb_orientation.scopes; b ecb_orientation.records; q ecb_orientation.records;
  a ecb_orientation.records; rp jsonb; app text:='none'; ast text:='unresolved'; history jsonb; closure jsonb;
begin
  perform ecb11.assert_runtime_key();
  select * into s from ecb_orientation.scopes where id=p_scope_id;
  if not found then raise exception 'orientation_scope_missing'; end if;
  if s.current_binding_id is not null then
    select * into b from ecb_orientation.records where receipt_id=s.current_binding_id;
    select * into q from ecb_orientation.records where artifact_id=b.qualification_id;
    select * into a from ecb_orientation.records where artifact_id=b.authority_id;
    ast:=ecb_orientation.cap_status(a.capability_id);
    rp:=ecb_orientation.payload(b.resolution_id);
    app:=case when p_requested_use is distinct from s.declared_use then 'use_mismatch'
      when b.result_epoch<>s.epoch then 'requalification_required'
      when ecb_orientation.cap_status(q.capability_id)<>'applicable' then 'reviewer_unavailable'
      when ecb_orientation.qf_blocked(b.resolution_id,s.declared_use) then 'question_forward_blocked'
      else 'applicable' end;
    select coalesce(jsonb_agg(jsonb_build_object('artifact_id',t.id,'content',t.content)),'[]') into closure
    from public.text_artifacts t where t.id in (select (x->>'artifact_id')::uuid
      from jsonb_array_elements((rp->'governing_sources')||jsonb_build_array(rp->'grammar')||(rp->'evidence')||(rp->'dependencies')) x);
  end if;
  select coalesce(jsonb_agg(ecb_orientation.render(r.receipt_id,false) order by op.committed_at,r.receipt_id),'[]') into history
    from ecb_orientation.records r join public.ordinary_operations op on op.id=r.receipt_id where r.scope_id=p_scope_id;
  return jsonb_build_object('scope_id',s.id,'focal_referent_id',s.focal_referent_id,'scope_manifest_id',s.manifest_id,
    'declared_use',s.declared_use,'requested_use',p_requested_use,'epoch',s.epoch,'current_binding_id',s.current_binding_id,
    'last_fence_id',s.last_fence_id,'resolution_artifact_id',b.resolution_id,'qualification_artifact_id',b.qualification_id,
    'qualification_result',q.result,'qualification_applicability',app,'authority',jsonb_build_object('status',ast,'decision_artifact_id',b.authority_id),
    'reliance_permitted',app='applicable' and ast='applicable','external_effect_authorized',false,
    'question_forward',coalesce(rp->'question_forward','[]'::jsonb),'reentry',rp->'reentry','limits',ecb_orientation.payload(q.artifact_id)->'limits',
    'source_closure',coalesce(closure,'[]'::jsonb),'history',history,
    'standing','isolated fixture profile; authenticated judgment is not semantic truth or effect authority');
end $$;

alter table ecb_orientation.scopes enable row level security;
alter table ecb_orientation.records enable row level security;
alter table ecb_orientation.capabilities enable row level security;
revoke all on all tables in schema ecb_orientation from public,anon,authenticated,service_role;
revoke all on all functions in schema ecb_orientation from public,anon,authenticated,service_role;
revoke all on function public.orientation_v1_write(uuid,text,uuid,bigint,uuid,text) from public,anon,authenticated,service_role;
revoke all on function public.orientation_v1_resolve(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.orientation_v1_write(uuid,text,uuid,bigint,uuid,text) to anon;
grant execute on function public.orientation_v1_resolve(uuid,text) to anon;
comment on function public.orientation_v1_write(uuid,text,uuid,bigint,uuid,text) is
  'ECO-152 isolated proof. B11 replay plus B12 custody; exact qualification/authority tuples. No production provisioning or effects.';
commit;
