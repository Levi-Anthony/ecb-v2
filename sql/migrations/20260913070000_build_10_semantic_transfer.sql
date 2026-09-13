-- ECO-121: disposable bounded semantic transfer. No canonical installation.
-- STRUCTURAL: immutable Artifact participation/uniqueness; AUTHORITY: scoped functions;
-- SEMANTIC: finite destination checker; OBSERVATIONAL: exact per-attempt history.
create role ecb10_owner nologin noinherit;
create role ecb10_sender nologin noinherit;
create role ecb10_receiver nologin noinherit;
create role ecb10_caller nologin noinherit;
create role ecb10_resolver nologin noinherit;
create role ecb10_observer nologin noinherit;
create role ecb10_fixture nologin noinherit;
grant ecb10_owner to postgres;
create schema ecb10 authorization ecb10_owner;
revoke all on schema ecb10 from public;
grant usage on schema ecb10 to ecb10_sender,ecb10_receiver,ecb10_caller,ecb10_resolver,ecb10_observer,ecb10_fixture;
grant usage on schema public,extensions to ecb10_owner;
grant select on public.artifacts,public.referents to ecb10_owner;
grant insert(id) on public.referents to ecb10_owner;
grant insert(id,artifact_role,context_id,payload_text) on public.artifacts to ecb10_owner;
-- BUILD 5B already enabled RLS. Extend its existing boundary, not another RLS scheme.
create policy b10_read on public.artifacts for select to ecb10_owner using (true);
create policy b10_insert on public.artifacts for insert to ecb10_owner with check (artifact_role in
 ('b10_basis','b10_representation','b10_delivery','b10_copy','b10_observation','b10_check','b10_assessment'));
create policy b10_referent on public.referents for all to ecb10_owner using(true) with check(true);
do $$ declare old text; begin
 select pg_get_expr(conbin,conrelid) into strict old from pg_constraint where conrelid='public.artifacts'::regclass and conname='artifacts_role_vocabulary';
 execute 'alter table public.artifacts drop constraint artifacts_role_vocabulary';
 execute 'alter table public.artifacts add constraint artifacts_role_vocabulary check (('||old||') or artifact_role in (''b10_basis'',''b10_representation'',''b10_delivery'',''b10_copy'',''b10_observation'',''b10_check'',''b10_assessment''))';
end $$;
drop trigger prepare_build_5b_artifact on public.artifacts;
create trigger prepare_build_5b_artifact before insert on public.artifacts for each row
 when(new.artifact_role in ('source_representation','transformation_request','transformed_representation','check_attempt','transformation_receipt'))
 execute function public.prepare_build_5b_artifact();
create unique index b10_delivery_request on public.artifacts(context_id,(payload_text::jsonb->>'request')) where artifact_role='b10_delivery';
create unique index b10_copy_slot on public.artifacts(context_id) where artifact_role='b10_copy';
create unique index b10_check_request on public.artifacts(context_id,(payload_text::jsonb->>'request')) where artifact_role='b10_check';
create unique index b10_terminal_slot on public.artifacts(context_id) where artifact_role='b10_assessment';
create unique index b10_observation_slot on public.artifacts(context_id,(payload_text::jsonb->>'kind')) where artifact_role='b10_observation' and payload_text::jsonb->>'kind' in ('partial','integrity','resolver');
-- P18 removal control established no semantic need for a separate context lookup index.
set role ecb10_owner;
create function ecb10.doc(i uuid,k text default null) returns jsonb language plpgsql set search_path='' as $$
declare r public.artifacts; begin
 select * into r from public.artifacts where id=i;
 if not found then raise exception 'b10_missing:%',i; end if;
 if r.artifact_role not like 'b10_%' or (k is not null and r.artifact_role<>k) then raise exception 'b10_wrong_role:%',i; end if;
 if not(r.payload_text is json object with unique keys) or r.payload_digest<>extensions.digest(convert_to(r.payload_text,'UTF8'),'sha256') then raise exception 'b10_envelope_integrity'; end if;
 return r.payload_text::jsonb;
end $$;
create function ecb10.slot(c uuid,k text,subtype text default null) returns uuid language sql set search_path='' as $$
 select id from public.artifacts where context_id=c and artifact_role=k and (subtype is null or payload_text::jsonb->>'kind'=subtype)
$$;
create function ecb10.lock_id(i uuid) returns void language plpgsql set search_path='' as $$ begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'b10_read_committed_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(i::text,10));
end $$;
create function ecb10.committed(i uuid) returns void language plpgsql set search_path='' as $$ begin
 if not exists(select 1 from public.artifacts where id=i) then raise exception 'b10_missing_committed_input'; end if;
 if exists(select 1 from public.artifacts where id=i and created_xid=pg_current_xact_id()) then raise exception 'b10_prior_commit_required'; end if;
end $$;
create function ecb10.b64(b bytea) returns text language sql immutable set search_path='' as $$ select replace(encode(b,'base64'),E'\n','') $$;
create function ecb10.raw(j jsonb) returns bytea language plpgsql immutable set search_path='' as $$ declare b bytea; begin
 b:=decode(j->>'body','base64');
 if b is null or ecb10.b64(b) is distinct from j->>'body' then raise exception 'b10_base64'; end if;
 return b;
end $$;
create function ecb10.prepare() returns trigger language plpgsql set search_path='' as $$
declare j jsonb; c jsonb; cr text; begin
 if current_user<>'ecb10_owner' then raise exception 'b10_protected_publication'; end if;
 if new.payload_digest is not null or new.recorded_at is not null or new.created_xid is not null then raise exception 'b10_derived_columns'; end if;
 if not(new.payload_text is json object with unique keys) then raise exception 'b10_unique_json'; end if;
 j:=new.payload_text::jsonb;
 select artifact_role into cr from public.artifacts where id=new.context_id;
 if new.artifact_role='b10_basis' then
  if coalesce(j->>'kind','') not in ('question','method','report','criterion','value','selector','unit_context','export') then raise exception 'b10_basis_kind'; end if;
 elsif new.artifact_role='b10_representation' then
  perform ecb10.raw(j);
 elsif new.artifact_role='b10_delivery' then
  if cr is distinct from 'b10_basis' or ecb10.doc(new.context_id)->>'kind'<>'question' or j->>'request' is null or jsonb_typeof(j->'frame') is distinct from 'object' then raise exception 'b10_delivery_binding'; end if;
  perform (j->>'request')::uuid;
 elsif new.artifact_role in ('b10_copy','b10_check') then
  if cr is distinct from 'b10_delivery' then raise exception 'b10_delivery_context'; end if;
  if new.artifact_role='b10_copy' then perform ecb10.raw(j);
  else
   if j->>'request' is null or j->>'method' is null then raise exception 'b10_check_binding'; end if;
   perform (j->>'request')::uuid; perform (j->>'method')::uuid;
   if j->>'copy' is not null then
    perform ecb10.doc((j->>'copy')::uuid,'b10_copy');
    if not exists(select 1 from public.artifacts where id=(j->>'copy')::uuid and context_id=new.context_id) then raise exception 'b10_copy_binding'; end if;
   end if;
  end if;
 elsif new.artifact_role='b10_observation' then
  if (j->>'kind' in ('integrity','resolver') and cr='b10_check') or (j->>'kind' in ('partial','sender-report') and cr='b10_delivery') or (j->>'kind'='sender-report' and cr='b10_representation') then null;
  else raise exception 'b10_observation_binding'; end if;
 elsif new.artifact_role='b10_assessment' then
  if cr is distinct from 'b10_check' or j->>'outcome' is null or jsonb_typeof(j->'findings') is distinct from 'array' then raise exception 'b10_assessment_binding'; end if;
 end if;
 insert into public.referents(id) values(new.id);
 new.payload_digest:=extensions.digest(convert_to(new.payload_text,'UTF8'),'sha256');
 new.recorded_at:=transaction_timestamp(); new.created_xid:=pg_current_xact_id(); return new;
end $$;
create function ecb10.retain(k text,c uuid,j jsonb,i uuid default gen_random_uuid()) returns uuid language plpgsql set search_path='' as $$ begin
 insert into public.artifacts(id,artifact_role,context_id,payload_text) values(i,k,c,j::text); return i;
end $$;
create function ecb10.scope() returns uuid language plpgsql security definer set search_path='' as $$ declare i uuid:=gen_random_uuid(); begin insert into public.referents(id) values(i); return i; end $$;
create function ecb10.fixture(c uuid,j jsonb,i uuid default gen_random_uuid()) returns uuid language plpgsql security definer set search_path='' as $$ begin return ecb10.retain('b10_basis',c,j,i); end $$;
create function ecb10.export(c uuid,i uuid,frame jsonb,b bytea,binding jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare e uuid; begin
 if (frame->>'source_artifact')::uuid<>i or (frame->>'length')::int<>octet_length(b) then raise exception 'b10_export_frame'; end if;
 perform ecb10.retain('b10_representation',c,jsonb_build_object('frame',frame,'body',ecb10.b64(b)),i);
 e:=ecb10.retain('b10_basis',c,jsonb_build_object('kind','export','frame',frame,'binding',binding,'digest',encode(extensions.digest(b,'sha256'),'hex')));
 return jsonb_build_object('representation',i,'export',e);
end $$;
create function ecb10.read_export(i uuid) returns jsonb language plpgsql security definer set search_path='' as $$ begin return ecb10.doc(i,'b10_representation'); end $$;
create function ecb10.frame_valid(f jsonb) returns boolean language plpgsql immutable set search_path='' as $$ declare k text; begin
 if jsonb_typeof(f)<>'object' or (select count(*) from jsonb_object_keys(f))<>5 then return false; end if;
 foreach k in array array['namespace','source_artifact','projection'] loop if f->>k is null then return false; end if; perform (f->>k)::uuid; end loop;
 return coalesce(length(f->>'projection_version')>0 and (f->>'length')::int between 1 and 65536,false);
 exception when others then return false;
end $$;
create function ecb10.admit(q uuid,request uuid,frame jsonb,previous_attempt uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; old uuid; v jsonb; begin
 perform ecb10.lock_id(q); j:=ecb10.doc(q,'b10_basis');
 if j->>'kind'<>'question' or request is null or not ecb10.frame_valid(frame) then raise exception 'b10_admission'; end if;
 if previous_attempt is not null then
  v:=ecb10.doc(previous_attempt,'b10_delivery');
  if v->'frame'<>frame or v->>'question'<>q::text then raise exception 'b10_retry_binding'; end if;
 end if;
 v:=jsonb_build_object('question',q,'request',request,'frame',frame,'previous_attempt',previous_attempt);
 select id into old from public.artifacts where context_id=q and artifact_role='b10_delivery' and payload_text::jsonb->>'request'=request::text;
 if old is not null then if ecb10.doc(old)<>v then raise exception 'b10_replay_conflict'; end if; return old; end if;
 return ecb10.retain('b10_delivery',q,v);
end $$;
create function ecb10.observe_partial(d uuid,b bytea) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; v jsonb; old uuid; begin
 perform ecb10.lock_id(d); perform ecb10.committed(d); j:=ecb10.doc(d,'b10_delivery');
 if b is null or octet_length(b)<1 or octet_length(b)>=(j#>>'{frame,length}')::int then raise exception 'b10_strict_prefix'; end if;
 if ecb10.slot(d,'b10_copy') is not null then raise exception 'b10_already_complete'; end if;
 v:=jsonb_build_object('kind','partial','body',ecb10.b64(b),'length',octet_length(b)); old:=ecb10.slot(d,'b10_observation','partial');
 if old is not null then if ecb10.doc(old)<>v then raise exception 'b10_partial_conflict'; end if; return old; end if;
 return ecb10.retain('b10_observation',d,v);
end $$;
create function ecb10.complete(d uuid,frame jsonb,b bytea) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; v jsonb; old uuid; prefix uuid; begin
 perform ecb10.lock_id(d); perform ecb10.committed(d); j:=ecb10.doc(d,'b10_delivery');
 if frame is distinct from j->'frame' then raise exception 'b10_frame_conflict'; end if;
 if b is null then raise exception 'b10_no_bytes'; end if;
 if octet_length(b)<(frame->>'length')::int then return ecb10.observe_partial(d,b); end if;
 if octet_length(b)<>(frame->>'length')::int then raise exception 'b10_length'; end if;
 prefix:=ecb10.slot(d,'b10_observation','partial');
 if prefix is not null and substring(b from 1 for octet_length(ecb10.raw(ecb10.doc(prefix)) ))<>ecb10.raw(ecb10.doc(prefix)) then raise exception 'b10_prefix_conflict'; end if;
 v:=jsonb_build_object('frame',frame,'body',ecb10.b64(b),'length',octet_length(b),'digest',encode(extensions.digest(b,'sha256'),'hex'));
 old:=ecb10.slot(d,'b10_copy');
 if old is not null then if ecb10.doc(old)<>v then raise exception 'b10_copy_conflict'; end if; return old; end if;
 return ecb10.retain('b10_copy',d,v);
end $$;
create function ecb10.method_digest() returns text language sql stable set search_path='' as $$
 select encode(extensions.digest(convert_to(string_agg(pg_get_functiondef(p.oid),E'\n' order by p.oid::regprocedure::text),'UTF8'),'sha256'),'hex')
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb10'
$$;
create function ecb10.seal(c uuid) returns uuid language plpgsql security definer set search_path='' as $$ begin
 return ecb10.retain('b10_basis',c,jsonb_build_object('kind','method','version','b10-sql/v1','definition_digest',ecb10.method_digest(),'limits','finite historical comparison only'));
end $$;
create function ecb10.begin_check(d uuid,request uuid,method uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; cp uuid; q uuid; v jsonb; old uuid; begin
 perform ecb10.lock_id(d); perform ecb10.committed(d); j:=ecb10.doc(d,'b10_delivery'); q:=(j->>'question')::uuid;
 cp:=ecb10.slot(d,'b10_copy'); if cp is not null then perform ecb10.committed(cp); end if;
 if request is null or method is null then raise exception 'b10_check_request'; end if;
 v:=jsonb_build_object('request',request,'question',q,'copy',cp,'method',method,'question_version',ecb10.doc(q)->>'version');
 select id into old from public.artifacts where context_id=d and artifact_role='b10_check' and payload_text::jsonb->>'request'=request::text;
 if old is not null then if ecb10.doc(old)<>v then raise exception 'b10_check_conflict'; end if; return old; end if;
 return ecb10.retain('b10_check',d,v);
end $$;
create function ecb10.parse(b bytea) returns jsonb language plpgsql immutable set search_path='' as $$ declare t text; begin
 t:=convert_from(b,'UTF8');
 if not(t is json object with unique keys) then return jsonb_build_object('valid',false,'reason','invalid JSON or duplicate keys'); end if;
 return jsonb_build_object('valid',true,'value',t::jsonb);
 exception when others then return jsonb_build_object('valid',false,'reason','invalid UTF8 or JSON');
end $$;
create function ecb10.observe_integrity(a uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; cp jsonb; v jsonb; old uuid; b bytea; begin
 perform ecb10.lock_id(a); perform ecb10.committed(a); j:=ecb10.doc(a,'b10_check');
 old:=ecb10.slot(a,'b10_observation','integrity'); if old is not null then return old; end if;
 if j->>'copy' is null then v:=jsonb_build_object('kind','integrity','available',false);
 else cp:=ecb10.doc((j->>'copy')::uuid,'b10_copy'); b:=ecb10.raw(cp);
 v:=jsonb_build_object('kind','integrity','available',true,'copy',j->'copy','digest',encode(extensions.digest(b,'sha256'),'hex'),'length',octet_length(b),'parse',ecb10.parse(b)); end if;
 return ecb10.retain('b10_observation',a,v);
end $$;
-- Resolver may see only a committed destination contract, never an arbitrary caller tuple.
create function ecb10.resolver_request(a uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare j jsonb; d jsonb; begin
 perform ecb10.committed(a); j:=ecb10.doc(a,'b10_check');
 select payload_text::jsonb into d from public.artifacts where id=(select context_id from public.artifacts where id=a);
 return jsonb_build_object('check',a,'question',ecb10.doc((j->>'question')::uuid),'frame',d->'frame','existing',ecb10.slot(a,'b10_observation','resolver'));
end $$;
create function ecb10.record_resolution(a uuid,v jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare old uuid; j jsonb; begin
 perform ecb10.lock_id(a); perform ecb10.committed(a); perform ecb10.doc(a,'b10_check');
 if jsonb_typeof(v->'records') is distinct from 'object' or jsonb_typeof(v->'missing') is distinct from 'array' or v->>'check' is distinct from a::text then raise exception 'b10_resolution_shape'; end if;
 j:=v||jsonb_build_object('kind','resolver'); old:=ecb10.slot(a,'b10_observation','resolver');
 if old is not null then if ecb10.doc(old)<>j then raise exception 'b10_resolution_conflict'; end if; return old; end if;
 return ecb10.retain('b10_observation',a,j);
end $$;
create function ecb10.report_sender(d uuid,i uuid,status text) returns uuid language plpgsql security definer set search_path='' as $$ declare j jsonb; begin
 perform ecb10.doc(d); if status not in ('SELECTED','ATTEMPTED','ACK_OBSERVED','UNKNOWN','D_OBSERVED') then raise exception 'b10_sender_status'; end if;
 j:=jsonb_build_object('kind','sender-report','reported_status',status,'authority','sender testimony only');
 if exists(select 1 from public.artifacts where id=i) then
  if ecb10.doc(i)<>j or not exists(select 1 from public.artifacts where id=i and context_id=d) then raise exception 'b10_sender_conflict'; end if; return i;
 end if; return ecb10.retain('b10_observation',d,j,i);
end $$;
-- Source custody keeps request identity even when D admission/ack is unobservable.
create function ecb10.report_source(p uuid,i uuid,request uuid,question uuid,destination text,delivery uuid,status text) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; begin
 perform ecb10.doc(p,'b10_representation');
 if request is null or question is null or destination is null or length(destination)=0 or status not in ('SELECTED','ATTEMPTED','ACK_OBSERVED','UNKNOWN','D_OBSERVED') then raise exception 'b10_source_observation_binding'; end if;
 j:=jsonb_build_object('kind','sender-report','request',request,'question',question,'destination',destination,'delivery',delivery,'reported_status',status,'authority','sender testimony only');
 if exists(select 1 from public.artifacts where id=i) then
  if ecb10.doc(i)<>j or not exists(select 1 from public.artifacts where id=i and context_id=p) then raise exception 'b10_sender_conflict'; end if; return i;
 end if;
 return ecb10.retain('b10_observation',p,j,i);
end $$;
-- Pure finite interpretation. No expected verdict, fixture IDs or source representation body.
create function ecb10.finding(component text,state text,observed jsonb,required jsonb) returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_array(jsonb_build_object('component',component,'state',state,'observed',observed,'required',required))
$$;
create function ecb10.set_equal(a jsonb,b jsonb) returns boolean language sql immutable set search_path='' as $$
 select case when jsonb_typeof(a)<>'array' or jsonb_typeof(b)<>'array' then false else
 (select count(*)=count(distinct value) from jsonb_array_elements(a)) and
 (select count(*)=count(distinct value) from jsonb_array_elements(b)) and a @> b and b @> a end
$$;
create function ecb10.semantic(p jsonb,q jsonb,records jsonb) returns jsonb language plpgsql immutable set search_path='' as $$
declare f jsonb:='[]'; k text; prop jsonb; crit jsonb; report jsonb; sel jsonb; uc jsonb; v jsonb; x jsonb; expr jsonb; vals jsonb:='[]'; consequence boolean:=true; missing boolean:=false; expected jsonb; st text;
 required_keys text[]:=array['language','focal','revision','report','report_version','projection','projection_version','contract','contract_version','manifest','proposition','expressions','limits','encoding','integrity'];
 propkeys text[]:=array['quantifier','population','operator','threshold','unit','context','asserted_result'];
 begin
 foreach k in array required_keys loop
  if not p ? k then f:=f||ecb10.finding('syntax','FAIL',to_jsonb(k),'"mandatory field"'); end if;
 end loop;
 for k in select jsonb_object_keys(p) loop if not(k=any(required_keys)) then f:=f||ecb10.finding('language','UNKNOWN',to_jsonb(k),'"admitted fields only"'); end if; end loop;
 if p->>'language' is distinct from 'b10-comparison-json/v1' then return f||ecb10.finding('language','UNKNOWN',p->'language','"b10-comparison-json/v1"'); end if;
 foreach k in array array['encoding','integrity'] loop
  expected:=case k when 'encoding' then '"UTF-8"'::jsonb else '"SHA-256"'::jsonb end;
  f:=f||ecb10.finding(k,case when p->k=expected then 'PASS' else 'FAIL' end,p->k,expected);
 end loop;
 foreach k in array array['focal','revision','report','report_version','projection','projection_version','contract','contract_version'] loop
  f:=f||ecb10.finding('identity:'||k,case when p->k=q->'binding'->k then 'PASS' else 'FAIL' end,p->k,q->'binding'->k);
 end loop;
 f:=f||ecb10.finding('manifest',case when ecb10.set_equal(p->'manifest',q->'manifest') then 'PASS' else 'FAIL' end,p->'manifest',q->'manifest');
 for x in select value from jsonb_array_elements(q->'manifest') loop
  v:=records->(x->>'id');
  if v is null then missing:=true; f:=f||ecb10.finding('dependency:'||(x->>'role'),'MISSING',x,'"exact source record"');
  elsif v->>'version' is distinct from x->>'version' or v->>'kind' is distinct from x->>'kind' then
   missing:=true; f:=f||ecb10.finding('dependency:'||(x->>'role'),'FAIL',v,x);
  else
   case x->>'role' when 'criterion' then crit:=v; when 'selector' then sel:=v; when 'unit_context' then uc:=v; else null; end case;
   f:=f||ecb10.finding('dependency:'||(x->>'role'),'PASS',v,x);
  end if;
 end loop;
 report:=records->(q#>>'{binding,report}');
 if report is null then missing:=true; f:=f||ecb10.finding('report','MISSING','null','"exact report"');
 elsif report->'binding' is distinct from q->'binding' or report->>'version' is distinct from q#>>'{binding,report_version}' or not ecb10.set_equal(report->'limits',q->'limits') or not ecb10.set_equal(report->'manifest',q->'manifest') then
  f:=f||ecb10.finding('report','FAIL',report,q->'binding');
 else f:=f||ecb10.finding('report','PASS',report,q->'binding'); end if;
 prop:=p->'proposition';
 if jsonb_typeof(prop) is distinct from 'object' or jsonb_typeof(p->'expressions') is distinct from 'array' or coalesce(jsonb_array_length(p->'expressions'),0)=0 then
  return f||ecb10.finding('syntax','FAIL',prop,'"proposition and nonempty expressions"'); end if;
 foreach k in array propkeys loop if not prop ? k then f:=f||ecb10.finding('syntax','FAIL',to_jsonb(k),'"mandatory proposition field"'); end if; end loop;
 for k in select jsonb_object_keys(prop) loop if not(k=any(propkeys)) then f:=f||ecb10.finding('language','UNKNOWN',to_jsonb(k),'"admitted proposition fields"'); end if; end loop;
 if prop->>'operator' is distinct from 'le' or coalesce(prop->>'quantifier','') not in ('all','average') then f:=f||ecb10.finding('language','UNKNOWN',prop,'"all/average le"'); end if;
 if jsonb_typeof(prop->'asserted_result') is distinct from 'boolean' or jsonb_typeof(prop->'threshold') is distinct from 'number' or coalesce(prop->>'threshold','') !~ '^[0-9]{1,7}$' or (prop->>'threshold')::numeric>1000000 or jsonb_typeof(prop->'population') is distinct from 'array' then
  return f||ecb10.finding('syntax','FAIL',prop,'"finite integer threshold, boolean result, array population"'); end if;
 -- Q owns preservation criteria even when source evidence is temporarily unavailable.
 expected:=q->'criterion';
 foreach k in array array['quantifier','operator','threshold','unit','context'] loop
  if k='operator' and prop->>'operator'<>'le' then continue; end if;
  if k='quantifier' and prop->>'quantifier' not in ('all','average') then continue; end if;
  f:=f||ecb10.finding('preservation:'||k,case when prop->k=expected->k then 'PASS' else 'FAIL' end,prop->k,expected->k);
 end loop;
 f:=f||ecb10.finding('population',case when ecb10.set_equal(prop->'population',q->'population') then 'PASS' else 'FAIL' end,prop->'population',q->'population');
 f:=f||ecb10.finding('limits',case when ecb10.set_equal(p->'limits',q->'limits') then 'PASS' else 'FAIL' end,p->'limits',q->'limits');
 if not missing then
  f:=f||ecb10.finding('source_criterion',case when crit->'rule'=q->'criterion' then 'PASS' else 'FAIL' end,crit,q->'criterion');
  f:=f||ecb10.finding('source_selector',case when ecb10.set_equal(sel->'population',q->'population') then 'PASS' else 'FAIL' end,sel,q->'population');
  f:=f||ecb10.finding('source_context',case when uc->>'unit'='ms' and uc->>'context'=q#>>'{criterion,context}' then 'PASS' else 'FAIL' end,uc,q->'criterion');
  for x in select value from jsonb_array_elements(q->'population') loop
   v:=records->(x#>>'{}');
   if v is null then missing:=true; f:=f||ecb10.finding('evidence','MISSING',x,'"exact value"'); continue; end if;
   if jsonb_typeof(v->'value') is distinct from 'number' or coalesce(v->>'value','') !~ '^[0-9]{1,7}$' or (v->>'value')::numeric>1000000 or v->>'context' is distinct from q#>>'{criterion,context}' or v->>'unit' is distinct from 'ms' then
    missing:=true; f:=f||ecb10.finding('evidence','FAIL',v,'"finite ms/context observation"'); continue;
   end if;
   vals:=vals||jsonb_build_array(jsonb_build_object('id',x,'value',v->'value'));
   consequence:=consequence and (v->>'value')::numeric<=(q#>>'{criterion,threshold}')::numeric;
  end loop;
 end if;
 if missing then f:=f||ecb10.finding('consequence','MISSING',vals,'"all independent values required"');
 else f:=f||ecb10.finding('consequence',case when consequence and prop->'asserted_result'='true'::jsonb then 'PASS' else 'FAIL' end,jsonb_build_object('values',vals,'all_le_threshold',consequence,'asserted',prop->'asserted_result'),q->'criterion'); end if;
 for expr in select value from jsonb_array_elements(p->'expressions') loop
  if jsonb_typeof(expr)='string' then
   if expr#>>'{}'='execution permitted' then st:='FAIL';
   elsif expr#>>'{}'='each declared observation met the threshold' then st:=case when prop->'asserted_result'='true'::jsonb and prop->>'quantifier'='all' then 'PASS' else 'FAIL' end;
   elsif expr#>>'{}'='not every declared observation met the threshold' then st:=case when prop->'asserted_result'='false'::jsonb and prop->>'quantifier'='all' then 'PASS' else 'FAIL' end;
   else st:='UNKNOWN'; end if;
  elsif jsonb_typeof(expr)='object' then
   if (select count(*) from jsonb_object_keys(expr))<>7 or not expr ?& propkeys then st:='UNKNOWN';
   elsif expr->>'operator'<>'le' or expr->>'quantifier' not in ('all','average') then st:='UNKNOWN';
   else st:=case when (expr-'population')=(prop-'population') and ecb10.set_equal(expr->'population',prop->'population') then 'PASS' else 'FAIL' end; end if;
  else st:='UNKNOWN'; end if;
  f:=f||ecb10.finding('expression',st,expr,prop);
 end loop;
 return f;
 exception when others then return f||ecb10.finding('syntax','FAIL',to_jsonb(sqlerrm),'"admitted finite syntax"');
end $$;
create function ecb10.finish_check(a uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare j jsonb; q jsonb; d jsonb; cp jsonb; io jsonb; ro jsonb; m jsonb; f jsonb:='[]'; outcome text; old uuid; rid uuid; iid uuid; ex jsonb; parsed jsonb; meth_ok boolean; begin
 perform ecb10.lock_id(a); perform ecb10.committed(a); j:=ecb10.doc(a,'b10_check');
 old:=ecb10.slot(a,'b10_assessment'); if old is not null then return old; end if;
 q:=ecb10.doc((j->>'question')::uuid,'b10_basis');
 select payload_text::jsonb into d from public.artifacts where id=(select context_id from public.artifacts where id=a);
 if j->>'method' is distinct from q->>'method' then f:=f||ecb10.finding('method','FAIL',j->'method',q->'method'); end if;
 begin m:=ecb10.doc((q->>'method')::uuid,'b10_basis'); exception when others then m:=null; end;
 meth_ok:=coalesce(m->>'kind'='method' and m->>'definition_digest'=ecb10.method_digest(),false);
 if not meth_ok then f:=f||ecb10.finding('method_capability','MISSING',m,'"exact installed definition inventory"'); end if;
 iid:=ecb10.slot(a,'b10_observation','integrity'); rid:=ecb10.slot(a,'b10_observation','resolver');
 if meth_ok and (iid is null or rid is null) then return null; end if;
 if iid is not null then io:=ecb10.doc(iid); end if;
 if rid is not null then ro:=ecb10.doc(rid); end if;
 if j->>'copy' is null then f:=f||ecb10.finding('received_copy','MISSING','null','"complete receipt bound at check admission"');
 elsif meth_ok then
  cp:=ecb10.doc((j->>'copy')::uuid,'b10_copy'); parsed:=ecb10.parse(ecb10.raw(cp));
  f:=f||ecb10.finding('encoding',case when parsed->>'valid'='true' then 'PASS' else 'FAIL' end,parsed-'value','"unique-key UTF-8 JSON"');
  f:=f||ecb10.finding('integrity_observation',case when io->>'copy'=j->>'copy' and io->>'digest'=encode(extensions.digest(ecb10.raw(cp),'sha256'),'hex') then 'PASS' else 'FAIL' end,io-'parse',cp-'body');
  f:=f||ecb10.finding('origin',case when d#>>'{frame,namespace}'=q->>'namespace' then 'PASS' else 'FAIL' end,d->'frame',q->'namespace');
  f:=f||ecb10.finding('frame_projection',case when d#>>'{frame,projection}'=q#>>'{binding,projection}' and d#>>'{frame,projection_version}'=q#>>'{binding,projection_version}' then 'PASS' else 'FAIL' end,d->'frame',q->'binding');
  ex:=ro->'records'->(q->>'export');
  if ex is null then f:=f||ecb10.finding('provenance','MISSING',ro->'missing',q->'export');
  else f:=f||ecb10.finding('provenance',case when ex->>'kind'='export' and ex->'frame'=d->'frame' and ex->>'digest'=io->>'digest' and ex->'binding'=q->'binding' then 'PASS' else 'FAIL' end,ex,jsonb_build_object('frame',d->'frame','digest',io->'digest','binding',q->'binding')); end if;
  if parsed->>'valid'='true' then f:=f||ecb10.semantic(parsed->'value',q,coalesce(ro->'records','{}')); end if;
 end if;
 if exists(select 1 from jsonb_array_elements(f) x where x->>'state'='FAIL') then outcome:='REJECTED_FOR_Q1';
 elsif exists(select 1 from jsonb_array_elements(f) x where x->>'state'='UNKNOWN') then outcome:='INDETERMINATE';
 elsif exists(select 1 from jsonb_array_elements(f) x where x->>'state'='MISSING') then outcome:='INCOMPLETE';
 else outcome:='SUPPORTED_FOR_Q1'; end if;
 return ecb10.retain('b10_assessment',a,jsonb_build_object('outcome',outcome,'findings',f,'check',a,'question',j->'question','question_version',j->'question_version','copy',j->'copy','method',q->'method','method_binding',m,'integrity_observation',iid,'resolver_observation',rid,'limitations',q->'limits','use','historical note only; no standing/adoption/currentness/authority/permission/effect'));
end $$;
create function ecb10.inspect_delivery(d uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare j jsonb; q jsonb; records jsonb; begin
 j:=ecb10.doc(d,'b10_delivery'); q:=ecb10.doc((j->>'question')::uuid,'b10_basis');
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'role',artifact_role,'context',context_id,'content',payload_text::jsonb,'envelope_digest',encode(payload_digest,'hex')) order by id),'[]') into records
 from public.artifacts where artifact_role like 'b10_%' and (id=d or id=(j->>'question')::uuid or id=(q->>'method')::uuid or context_id=d or context_id in (select id from public.artifacts where context_id=d and artifact_role='b10_check'));
 return jsonb_build_object('locator',d,'records',records,'limits',q->'limits','nonclaims','No standing, adoption, currentness, authority, permission or effect. Resolver observations are historical snapshots; new checks require fresh resolution.');
end $$;
create function ecb10.read_artifact(d uuid,i uuid) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb; begin
 select value into r from jsonb_array_elements(ecb10.inspect_delivery(d)->'records') where value->>'id'=i::text;
 if r is null then raise exception 'b10_not_reachable'; end if; return r;
end $$;
reset role;
create trigger prepare_build10_artifact before insert on public.artifacts for each row when(new.artifact_role in
 ('b10_basis','b10_representation','b10_delivery','b10_copy','b10_observation','b10_check','b10_assessment')) execute function ecb10.prepare();
revoke all on all functions in schema ecb10 from public,anon,authenticated,service_role;
grant execute on function ecb10.scope(),ecb10.fixture(uuid,jsonb,uuid),ecb10.export(uuid,uuid,jsonb,bytea,jsonb),ecb10.seal(uuid) to ecb10_fixture;
grant execute on function ecb10.read_export(uuid),ecb10.report_sender(uuid,uuid,text),ecb10.report_source(uuid,uuid,uuid,uuid,text,uuid,text) to ecb10_sender;
grant execute on function ecb10.admit(uuid,uuid,jsonb,uuid),ecb10.observe_partial(uuid,bytea),ecb10.complete(uuid,jsonb,bytea),ecb10.report_sender(uuid,uuid,text) to ecb10_receiver,ecb10_sender;
grant execute on function ecb10.begin_check(uuid,uuid,uuid),ecb10.observe_integrity(uuid),ecb10.finish_check(uuid) to ecb10_caller;
grant execute on function ecb10.resolver_request(uuid),ecb10.record_resolution(uuid,jsonb) to ecb10_resolver;
grant execute on function ecb10.inspect_delivery(uuid),ecb10.read_artifact(uuid,uuid) to ecb10_observer;
-- Source resolver uses a read-only transaction and limited SELECT; RLS can withhold
-- exact records for custodian-controlled source-loss exercises without deleting history.
grant usage on schema public to ecb10_resolver;
grant select(id,artifact_role,payload_text,payload_digest) on public.artifacts to ecb10_resolver;
create policy b10_source_basis_read on public.artifacts for select to ecb10_resolver using(artifact_role='b10_basis' and payload_text::jsonb->>'kind' not in ('question','method'));
