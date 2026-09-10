-- ECO-95 / accepted Shape §§C–I, M; fixture-only installation, no real grant.
-- Reuse public.artifacts, its immutable exact bytes and universal Referent discipline.
-- Do not alter the BUILD 5B checker definition: its historical digest remains meaningful.
create role ecb7_owner nologin noinherit;
create role ecb7_evaluator nologin noinherit;
create role ecb7_executor nologin noinherit;
grant ecb7_owner to postgres;
create schema ecb7 authorization ecb7_owner;
revoke all on schema ecb7 from public, anon, authenticated, service_role;
grant usage on schema ecb7 to service_role, ecb7_evaluator, ecb7_executor;
grant usage on schema public, extensions to ecb7_owner, ecb7_evaluator, ecb7_executor;
grant select on public.artifacts, public.referents, public.claims to ecb7_owner, ecb7_evaluator, ecb7_executor;
grant insert(id) on public.referents to ecb7_owner;
create policy build7_identity on public.referents for all to ecb7_owner using(true) with check(true);
create policy build7_read_artifacts on public.artifacts for select to ecb7_owner,ecb7_evaluator,ecb7_executor using(true);
create policy build7_write_artifacts on public.artifacts for insert to ecb7_owner with check(true);
create policy build7_read_claims on public.claims for select to ecb7_owner,ecb7_evaluator,ecb7_executor using(true);
create policy build7_read_referents on public.referents for select to ecb7_evaluator,ecb7_executor using(true);
grant insert(id,artifact_role,context_id,target_id,payload_text,producer_succeeded) on public.artifacts to ecb7_owner;

alter table public.artifacts drop constraint artifacts_role_vocabulary;
alter table public.artifacts add constraint artifacts_role_vocabulary check(artifact_role in (
 'source_representation','transformation_request','transformed_representation','check_attempt','transformation_receipt',
 'b7_grammar','b7_snapshot','b7_contract','b7_candidate','b7_attempt','b7_evaluation','b7_grant','b7_designation','b7_observation'));
drop trigger prepare_build_5b_artifact on public.artifacts;
create trigger prepare_build_5b_artifact before insert on public.artifacts for each row
 when (new.artifact_role not like 'b7_%') execute function public.prepare_build_5b_artifact();

create table ecb7.scopes(
 id uuid primary key references public.referents(id),
 focal uuid not null references public.referents(id),
 contract uuid not null references public.artifacts(id),
 current_event uuid references public.artifacts(id),
 synthetic boolean not null check(synthetic)
);
create unique index b7_one_evaluation on public.artifacts(context_id) where artifact_role='b7_evaluation';
-- Each request is itself an immutable Artifact; one event per exact request.
create unique index b7_one_designation on public.artifacts(context_id) where artifact_role='b7_designation';
create unique index b7_one_successor on public.artifacts((payload_text::jsonb->>'scope'),(coalesce(payload_text::jsonb->>'predecessor','ROOT')))
 where artifact_role='b7_designation';

create function ecb7.doc(i uuid, role_name text default null) returns jsonb
language plpgsql stable set search_path='' as $$
declare r public.artifacts; begin
 select * into r from public.artifacts where id=i;
 if not found then raise exception 'exact_payload_unavailable:%',i; end if;
 if role_name is not null and r.artifact_role<>role_name then raise exception 'wrong_artifact_role'; end if;
 if r.payload_digest<>extensions.digest(convert_to(r.payload_text,'UTF8'),'sha256') then raise exception 'integrity_mismatch'; end if;
 return r.payload_text::jsonb;
end $$;

create function ecb7.prepare_artifact() returns trigger language plpgsql set search_path='' as $$
declare j jsonb; c jsonb; begin
 if new.payload_digest is not null or new.recorded_at is not null or new.created_xid is not null then raise exception 'derived_columns'; end if;
 if new.payload_text is null or not(new.payload_text is json object with unique keys) then raise exception 'exact_json_object_required'; end if;
 j:=new.payload_text::jsonb;
 if new.artifact_role<>'b7_candidate' and current_user<>'ecb7_owner' then raise exception 'protected_build7_role'; end if;
 if new.artifact_role='b7_candidate' then
  if not exists(select 1 from ecb7.scopes where id=new.context_id) then raise exception 'unknown_scope'; end if;
  -- Preserve defective semantic candidates for C2 inspection; producer flags cannot confer eligibility.
  if j->>'focal' is null or j->>'grammar' is null or j->>'contract' is null then raise exception 'candidate_manifest_required'; end if;
 end if;
 if exists(select 1 from public.referents where id=new.id) then raise exception 'identity_already_registered'; end if;
 insert into public.referents(id) values(new.id);
 new.payload_digest:=extensions.digest(convert_to(new.payload_text,'UTF8'),'sha256');
 new.recorded_at:=transaction_timestamp(); new.created_xid:=pg_current_xact_id();
 return new;
end $$;
create trigger prepare_build7_artifact before insert on public.artifacts for each row
 when(new.artifact_role like 'b7_%') execute function ecb7.prepare_artifact();

create function ecb7.retain(k text,c uuid,j jsonb,i uuid default gen_random_uuid()) returns uuid
language plpgsql set search_path='' as $$ begin
 insert into public.artifacts(id,artifact_role,context_id,payload_text) values(i,k,c,j::text); return i;
end $$;
-- Fixture authority and source supply are installation-custody-only. Runtime cannot call this.
create function ecb7.fixture(k text,c uuid,j jsonb,i uuid default gen_random_uuid()) returns uuid
language plpgsql security definer set search_path='' as $$ begin
 if k not in ('b7_grammar','b7_snapshot','b7_contract','b7_grant') then raise exception 'fixture_role'; end if;
 if j->>'synthetic' is distinct from 'true' then raise exception 'synthetic_only'; end if;
 return ecb7.retain(k,c,j,i);
end $$;

create function ecb7.attempt(i uuid,candidate uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare c jsonb; s ecb7.scopes; prior jsonb; j jsonb; begin
 c:=ecb7.doc(candidate,'b7_candidate');
 select * into strict s from ecb7.scopes where id=(select context_id from public.artifacts where id=candidate);
 j:=jsonb_build_object('candidate',candidate,'scope',s.id,'contract',s.contract,'basis',c,'status','pending');
 if exists(select 1 from public.artifacts where id=i) then
  prior:=ecb7.doc(i,'b7_attempt'); if prior<>j then raise exception 'request_conflict'; end if; return i;
 end if;
 return ecb7.retain('b7_attempt',candidate,j,i);
end $$;

-- Evaluator role is held by the bounded exact-input method, never the producer.
create function ecb7.publish(a uuid, findings jsonb, method text) returns uuid
language plpgsql security definer set search_path='' as $$
declare req jsonb; ct jsonb; r uuid; outcome text; f jsonb; wanted text[]; got text[]; begin
 req:=ecb7.doc(a,'b7_attempt'); ct:=ecb7.doc((req->>'contract')::uuid,'b7_contract');
 if (select created_xid from public.artifacts where id=a)=pg_current_xact_id() then raise exception 'committed_attempt_required'; end if;
 if ct->>'method' is distinct from method then raise exception 'method_binding'; end if;
 select array_agg(x order by x) into wanted from jsonb_array_elements_text(ct->'obligations') x;
 select array_agg(x->>'obligation' order by x->>'obligation') into got from jsonb_array_elements(findings) x;
 if wanted is distinct from got or array_length(got,1) is null then raise exception 'obligation_coverage'; end if;
 for f in select * from jsonb_array_elements(findings) loop
  if f->>'status' is null or f->>'status' not in ('PASS','FAIL','INCOMPLETE','INDETERMINATE') or length(coalesce(f->>'reason',''))=0
   or f->'witness' is null then raise exception 'finding_basis_required'; end if;
 end loop;
 if exists(select 1 from jsonb_array_elements(findings) entry where entry->>'status'='FAIL') then outcome:='FAIL';
 elsif exists(select 1 from jsonb_array_elements(findings) entry where entry->>'status'='INCOMPLETE') then outcome:='INCOMPLETE';
 elsif exists(select 1 from jsonb_array_elements(findings) entry where entry->>'status'='INDETERMINATE') then outcome:='INDETERMINATE'; else outcome:='PASS'; end if;
 -- Serialize exact terminal publication. Changed findings are not accepted as retry.
 perform pg_advisory_xact_lock(hashtextextended(a::text,7));
 select id into r from public.artifacts where artifact_role='b7_evaluation' and context_id=a;
 if found then
  if ecb7.doc(r)->'findings'<>findings or ecb7.doc(r)->>'method'<>method then raise exception 'terminal_conflict'; end if; return r;
 end if;
 return ecb7.retain('b7_evaluation',a,jsonb_build_object('attempt',a,'candidate',req->'candidate','scope',req->'scope',
 'contract',req->'contract','basis',req->'basis','method',method,'evaluator',session_user,'findings',findings,'outcome',outcome,
 'meaning','bounded_comparison_only','applicability',ct->'applicability','execution_authorized',false));
end $$;

-- Observations are retained separately; absence is different from observed mismatch.
create function ecb7.observe(s uuid,j jsonb) returns uuid language plpgsql security definer set search_path='' as $$ begin
 if not exists(select 1 from ecb7.scopes where id=s) then raise exception 'unknown_scope'; end if;
 if j->>'route' is null or jsonb_typeof(j->'dependencies') is distinct from 'object' then raise exception 'observation_route_required'; end if;
 return ecb7.retain('b7_observation',s,j||jsonb_build_object('observer',session_user));
end $$;

create function ecb7.applicability(c jsonb, observation uuid) returns jsonb
language plpgsql stable set search_path='' as $$
declare obs jsonb; k text; v jsonb; gaps jsonb:='[]'; begin
 obs:=ecb7.doc(observation,'b7_observation');
 for k,v in select * from jsonb_each(c->'dependencies') loop
  if not(obs->'dependencies' ? k) then gaps:=gaps||jsonb_build_array(jsonb_build_object('dependency',k,'reason','observation_unavailable'));
  elsif obs->'dependencies'->k is distinct from v then gaps:=gaps||jsonb_build_array(jsonb_build_object('dependency',k,'reason','dependency_changed','expected',v,'observed',obs->'dependencies'->k)); end if;
 end loop;
 return jsonb_build_object('applicable',jsonb_array_length(gaps)=0,'gaps',gaps,'observation',observation,'limits',obs->'limits');
end $$;

-- Only the single scoped transaction writes pointer/history. Grant is separately retained.
create function ecb7.designate(request uuid,sid uuid,candidate uuid,evaluation uuid,predecessor uuid,grant_id uuid,observation uuid,operation text default 'select') returns jsonb
language plpgsql security definer set search_path='' as $$
declare s ecb7.scopes; g jsonb; q jsonb; c jsonb; req jsonb; prior jsonb; event uuid; app jsonb; moment timestamptz; begin
 select * into strict s from ecb7.scopes where id=sid for update;
 req:=jsonb_build_object('scope',sid,'candidate',candidate,'evaluation',evaluation,'predecessor',predecessor,'grant',grant_id,'observation',observation,'operation',operation,'actor',session_user);
 if exists(select 1 from public.artifacts where id=request) then
  prior:=ecb7.doc(request,'b7_attempt');
  if prior is distinct from req then raise exception 'request_conflict'; end if;
  select id into event from public.artifacts where context_id=request and artifact_role='b7_designation';
  if event is null then raise exception 'unknown_commit_outcome'; end if;
  return jsonb_build_object('event',event,'recovered',true,'present_current',s.current_event=event);
 end if;
 if operation not in ('select','withdraw') then raise exception 'operation_mismatch'; end if;
 g:=ecb7.doc(grant_id,'b7_grant');
 if g->>'synthetic' is distinct from 'true' or g->>'issuer' is distinct from 'G_TEST' then raise exception 'fixture_authority_only'; end if;
 if g->>'actor' is distinct from session_user or g->>'scope' is distinct from sid::text or g->>'operation' is distinct from operation
 or g->>'candidate' is distinct from candidate::text or g->>'evaluation' is distinct from evaluation::text
 or g->>'predecessor' is distinct from predecessor::text then raise exception 'grant_tuple_mismatch'; end if;
 if g->>'temporal' is null or g->'temporal'->>'act' is null or g->'temporal'->>'continuing_effect' is null then raise exception 'temporal_applicability_required'; end if;
 moment:=clock_timestamp();
 if g->'temporal'->>'act'='interval' then
  if g->'temporal'->>'from' is null or g->'temporal'->>'until' is null or moment<(g->'temporal'->>'from')::timestamptz or moment>=(g->'temporal'->>'until')::timestamptz then raise exception 'grant_expired_or_not_yet_applicable'; end if;
 elsif g->'temporal'->>'act'<>'until_revoked' then raise exception 'unknown_temporal_rule'; end if;
 if (ecb7.doc(observation,'b7_observation')->'revoked_grants') is null then raise exception 'revocation_observation_required'; end if;
 if ecb7.doc(observation)->'revoked_grants' ? grant_id::text then raise exception 'grant_revoked'; end if;
 if (select context_id from public.artifacts where id=observation)<>sid then raise exception 'observation_scope'; end if;
 if s.current_event is distinct from predecessor then raise exception 'stale_predecessor'; end if;
 c:=ecb7.doc(candidate,'b7_candidate'); q:=ecb7.doc(evaluation,'b7_evaluation');
 if q->>'outcome' is distinct from 'PASS' then raise exception 'qualification_not_pass'; end if;
 if q->>'candidate' is distinct from candidate::text or q->>'scope' is distinct from sid::text or q->'basis' is distinct from c
 or c->>'contract' is distinct from s.contract::text or q->>'contract' is distinct from s.contract::text then raise exception 'qualification_tuple'; end if;
 app:=ecb7.applicability(c,observation);
 if app->>'applicable' is distinct from 'true' then raise exception 'requalification_required'; end if;
 if (q->'applicability'->>'mode') is distinct from 'declared_dependencies' then raise exception 'qualification_applicability_required'; end if;
 if g->'temporal'->>'continuing_effect' not in ('historical_act_only','unrevoked') then raise exception 'unknown_continuing_effect'; end if;
 perform ecb7.retain('b7_attempt',sid,req,request);
 event:=ecb7.retain('b7_designation',request,req||jsonb_build_object('temporal',g->'temporal','occurred_at',moment,
 'qualification_applicability',app,'execution_authorized',false));
 update ecb7.scopes set current_event=event where id=sid;
 return jsonb_build_object('event',event,'recovered',false,'present_current',true);
end $$;

alter table ecb7.scopes enable row level security;
grant select on ecb7.scopes to service_role, ecb7_evaluator, ecb7_executor;
create policy build7_read_scopes on ecb7.scopes for select to service_role,ecb7_evaluator,ecb7_executor using(true);
do $$ declare r record; begin
 for r in select tablename from pg_tables where schemaname='ecb7' loop execute format('alter table ecb7.%I owner to ecb7_owner',r.tablename); end loop;
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb7' loop
  execute format('alter function %s owner to ecb7_owner',r.signature);
 end loop;
end $$;
revoke all on all functions in schema ecb7 from public,anon,authenticated,service_role;
grant execute on function ecb7.doc(uuid,text) to service_role,ecb7_evaluator,ecb7_executor;
grant execute on function ecb7.prepare_artifact() to service_role;
grant execute on function ecb7.attempt(uuid,uuid) to service_role,ecb7_evaluator;
grant execute on function ecb7.publish(uuid,jsonb,text) to ecb7_evaluator;
grant execute on function ecb7.observe(uuid,jsonb) to ecb7_evaluator;
grant execute on function ecb7.applicability(jsonb,uuid) to ecb7_evaluator,ecb7_executor;
grant execute on function ecb7.designate(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text) to ecb7_executor;
grant execute on function ecb7.fixture(text,uuid,jsonb,uuid) to postgres;
