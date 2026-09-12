-- ECO-109: disposable serial inquiry only. STRUCTURAL transaction/controller,
-- SEMANTIC finite supplied criteria, OBSERVATIONAL closed declared writer set.
create role ecb9_owner nologin noinherit;
create role ecb9_parent nologin noinherit;
create role ecb9_child nologin noinherit;
create role ecb9_observer nologin noinherit;
create role ecb9_writer nologin noinherit;
grant ecb9_owner to postgres;
create schema ecb9 authorization ecb9_owner;
revoke all on schema ecb9 from public,anon,authenticated,service_role;
grant usage on schema ecb9 to ecb9_parent,ecb9_child,ecb9_observer,ecb9_writer;
grant usage on schema public,extensions,ecb7 to ecb9_owner;
grant select on public.artifacts,public.referents,public.claims,ecb7.scopes to ecb9_owner;
grant insert(id) on public.referents to ecb9_owner;
grant insert(id,artifact_role,context_id,payload_text) on public.artifacts to ecb9_owner;
grant update(synthetic) on ecb7.scopes to ecb9_owner;
create policy build9_scope_read on ecb7.scopes for select to ecb9_owner using(synthetic);
create policy build9_scope_lock on ecb7.scopes for update to ecb9_owner using(synthetic) with check(synthetic);
create policy build9_artifact_read on public.artifacts for select to ecb9_owner using(true);
create policy build9_artifact_write on public.artifacts for insert to ecb9_owner
 with check(artifact_role in ('b9_basis','b9_inquiry','b9_event','b9_judgment'));
create policy build9_identity on public.referents for all to ecb9_owner using(true) with check(true);
create policy build9_claim_read on public.claims for select to ecb9_owner using(true);
alter table public.artifacts drop constraint artifacts_role_vocabulary;
alter table public.artifacts add constraint artifacts_role_vocabulary check(artifact_role in (
 'source_representation','transformation_request','transformed_representation','check_attempt','transformation_receipt',
 'b7_grammar','b7_snapshot','b7_contract','b7_candidate','b7_attempt','b7_evaluation','b7_grant','b7_designation','b7_observation',
 'b8_basis','b8_envelope','b8_evaluation','b8_event','b9_basis','b9_inquiry','b9_event','b9_judgment'));
-- BUILD 8 already restricts the BUILD 5B trigger to its exact five roles.
create unique index b9_one_successor on public.artifacts(context_id,(coalesce(payload_text::jsonb->>'predecessor','ROOT')))
 where artifact_role='b9_event';
create unique index b9_request on public.artifacts(context_id,(payload_text::jsonb->>'request')) where artifact_role='b9_event';
create unique index b9_terminal_judgment on public.artifacts(context_id) where artifact_role='b9_judgment';
create index b9_history on public.artifacts(context_id) where artifact_role='b9_event';

create function ecb9.doc(i uuid, role_name text default null) returns jsonb
language plpgsql set search_path='' as $$ declare r public.artifacts; begin
 select * into r from public.artifacts where id=i;
 if not found then raise exception 'b9_missing_artifact:%',i; end if;
 if role_name is not null and r.artifact_role<>role_name then raise exception 'b9_wrong_role:%',i; end if;
 if not(r.payload_text is json object with unique keys) or r.payload_digest<>extensions.digest(convert_to(r.payload_text,'UTF8'),'sha256') then raise exception 'b9_integrity:%',i; end if;
 return r.payload_text::jsonb;
end $$;
create function ecb9.prepare() returns trigger language plpgsql set search_path='' as $$ begin
 if current_user<>'ecb9_owner' then raise exception 'b9_protected_publication'; end if;
 if new.payload_digest is not null or new.recorded_at is not null or new.created_xid is not null then raise exception 'b9_derived_columns'; end if;
 if not(new.payload_text is json object with unique keys) then raise exception 'b9_json_required'; end if;
 insert into public.referents(id) values(new.id);
 new.payload_digest:=extensions.digest(convert_to(new.payload_text,'UTF8'),'sha256');
 new.recorded_at:=transaction_timestamp(); new.created_xid:=pg_current_xact_id(); return new;
end $$;
create trigger prepare_build9_artifact before insert on public.artifacts for each row
 when(new.artifact_role in ('b9_basis','b9_inquiry','b9_event','b9_judgment')) execute function ecb9.prepare();
create function ecb9.retain(k text,c uuid,j jsonb,i uuid default gen_random_uuid()) returns uuid
language plpgsql set search_path='' as $$ begin
 insert into public.artifacts(id,artifact_role,context_id,payload_text) values(i,k,c,j::text); return i;
end $$;
create function ecb9.lock_scope(s uuid) returns void language plpgsql set search_path='' as $$ begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'b9_read_committed_required'; end if;
 perform id from ecb7.scopes where id=s and synthetic for update;
 if not found then raise exception 'b9_synthetic_scope_required'; end if;
end $$;
create function ecb9.fixture(s uuid,j jsonb) returns uuid language plpgsql security definer set search_path='' as $$ begin
 perform ecb9.lock_scope(s);
 if j->>'synthetic' is distinct from 'true' or coalesce(j->>'kind','') not in ('governance','criteria','method','witnesses','applicability','source') then raise exception 'b9_fixture_only'; end if;
 return ecb9.retain('b9_basis',s,j);
end $$;

-- Finite executable governance rule interpreter, used both for child probes and
-- real parent judgment acceptance. No fixture identity or expected outcome branch.
create function ecb9.compare(g jsonb, candidate jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare rule jsonb; path text[]; v jsonb; findings jsonb:='[]'; ok boolean:=true; hit boolean; begin
 if g->>'language' is distinct from 'required_paths/v1' or jsonb_typeof(g->'required_paths') is distinct from 'array' or jsonb_array_length(g->'required_paths')=0 then
  return jsonb_build_object('outcome','INDETERMINATE','findings',findings,'reason','unsupported or absent finite rule program'); end if;
 for rule in select value from jsonb_array_elements(g->'required_paths') loop
  select array_agg(value) into path from jsonb_array_elements_text(rule);
  v:=candidate#>path;
  hit:=v is not null and v not in ('null'::jsonb,'[]'::jsonb,'{}'::jsonb,'""'::jsonb);
  ok:=ok and hit; findings:=findings||jsonb_build_array(jsonb_build_object('path',rule,'present',hit));
 end loop;
 return jsonb_build_object('outcome',case when ok then 'PASS' else 'FAIL' end,'findings',findings);
end $$;

create function ecb9.contract(p uuid) returns jsonb language plpgsql set search_path='' as $$
declare c jsonb; d record; r public.claims; v jsonb; begin
 c:=ecb9.doc(p,'b9_inquiry');
 select * into r from public.claims where id=(c->>'decision_claim')::uuid;
 if not found or r.claim_kind<>'assertion' or r.proposition<>c->>'question' or r.scope<>c->>'scope' then raise exception 'b9_parent_claim'; end if;
 for d in select key,value from jsonb_each(c->'dependencies') loop
  select * into r from public.claims where id=(d.value->>'claim')::uuid;
  if not found or r.predicate is distinct from 'depends_on' or r.subject_referent_id is distinct from (c->>'decision_claim')::uuid or r.object_referent_id is distinct from (d.value->>'component')::uuid or r.scope is distinct from c->>'scope' then raise exception 'b9_dependency_claim:%',d.key; end if;
  if d.value->>'version' is not null then
   v:=ecb9.doc((d.value->>'version')::uuid,'b9_basis');
   if v->>'subject' is distinct from d.value->>'component' then raise exception 'b9_component_version:%',d.key; end if;
  end if;
 end loop;
 return c;
end $$;
create function ecb9.bind(s uuid,j jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare p uuid; k text; old jsonb; begin
 perform ecb9.lock_scope(s);
 if j->>'synthetic' is distinct from 'true' or j->>'scope' is distinct from s::text or j->>'depth' is distinct from '0' then raise exception 'b9_parent_boundary'; end if;
 foreach k in array array['focal','question','discriminator','step','decision_claim','dependencies','unresolved','child_question','remit','stopping_rule','question_forward','source_standing','observation_rule'] loop
  if j->k is null or j->k in ('null','""','{}','[]') then raise exception 'b9_contract_field:%',k; end if;
 end loop;
 if j->>'remit' <> 'synthetic inspection only; no action, designation or amendment' then raise exception 'b9_remit'; end if;
 if j->>'prior_version' is not null then
  old:=ecb9.contract((j->>'prior_version')::uuid);
  if j->>'prior_result_disposition' is distinct from 'retain as history; fresh inquiry and judgment required' then raise exception 'b9_successor_correspondence_required'; end if;
 end if;
 p:=ecb9.retain('b9_inquiry',s,j); perform ecb9.contract(p); return p;
end $$;

-- Complete chain fold: there is no mutable currentness pointer/card. Missing
-- middle links and disconnected successors fail closed. Wall time is not order.
create function ecb9.state(p uuid) returns jsonb language plpgsql set search_path='' as $$
declare c jsonb; h uuid; e record; j jsonb; n integer:=0; total integer; obs jsonb:='{}'; changes jsonb:='[]'; hist jsonb:='[]'; active jsonb; judgment uuid; returned uuid; last_d jsonb; attempt uuid; d record; begin
 c:=ecb9.contract(p);
 for d in select key,value from jsonb_each(c->'dependencies') loop
  obs:=obs||jsonb_build_object(d.key,jsonb_build_object('version',d.value->'version','complete',true,'history',null));
 end loop;
 select count(*) into total from public.artifacts where context_id=p and artifact_role='b9_event';
 loop
  select id into e from public.artifacts where context_id=p and artifact_role='b9_event' and (payload_text::jsonb->>'predecessor')::uuid is not distinct from h;
  exit when not found;
  j:=ecb9.doc(e.id,'b9_event');
  if j->>'parent' is distinct from p::text then raise exception 'b9_history_binding'; end if;
  h:=e.id; n:=n+1; if n>total then raise exception 'b9_history_cycle'; end if;
  hist:=hist||jsonb_build_array(jsonb_build_object('id',h,'kind',j->'kind','predecessor',j->'predecessor'));
  case j->>'kind'
  when 'observe' then
   obs:=jsonb_set(obs,array[j->>'slot'],jsonb_build_object('version',j->'version','complete',j->'complete','history',h));
   if active is not null then changes:=changes||jsonb_build_array(jsonb_build_object('event',h,'slot',j->'slot','version',j->'version','complete',j->'complete')); end if;
  when 'open' then active:=j||jsonb_build_object('id',h); attempt:=h;
  when 'retry' then attempt:=h;
  when 'judgment' then judgment:=(j->>'judgment')::uuid;
  when 'return' then returned:=(j->>'judgment')::uuid;
  when 'reentry' then last_d:=j||jsonb_build_object('id',h);
  else raise exception 'b9_unknown_transition';
  end case;
 end loop;
 if n<>total then raise exception 'b9_incomplete_history'; end if;
 if judgment is not null then perform ecb9.doc(judgment,'b9_judgment'); end if;
 return jsonb_build_object('head',h,'history',hist,'observations',obs,'changes',changes,'open',active,'attempt',attempt,'judgment',judgment,'returned',returned,'last_disposition',last_d,'suspended',active is not null and (last_d is null or last_d->>'disposition'<>'CONTINUE'));
end $$;
create function ecb9.append(p uuid,pred uuid,request uuid,kind text,args jsonb) returns uuid language plpgsql set search_path='' as $$ begin
 return ecb9.retain('b9_event',p,args||jsonb_build_object('parent',p,'predecessor',pred,'request',request,'kind',kind,'attribution',session_user));
end $$;
-- Exact replay returns only historical identity; inspect separately computes current applicability.
create function ecb9.replay(p uuid,r uuid,signature jsonb) returns uuid language plpgsql set search_path='' as $$ declare e record; j jsonb; begin
 select id into e from public.artifacts where context_id=p and artifact_role='b9_event' and payload_text::jsonb->>'request'=r::text;
 if not found then return null; end if;
 j:=ecb9.doc(e.id,'b9_event');
 if j->'signature' is distinct from signature then raise exception 'b9_changed_retry_tuple'; end if;
 return e.id;
end $$;
create function ecb9.cas(st jsonb,pred uuid) returns void language plpgsql set search_path='' as $$ begin
 if (st->>'head')::uuid is distinct from pred then raise exception 'b9_stale_predecessor'; end if;
end $$;
create function ecb9.binding(p uuid) returns jsonb language plpgsql set search_path='' as $$ declare c jsonb; d jsonb; begin
 c:=ecb9.contract(p); d:=c->'dependencies'->(c->>'unresolved');
 return jsonb_build_object('parent',p,'parent_question',c->'question','slot',c->'unresolved','dependency_claim',d->'claim','component',d->'component','version',d->'version','child_question',c->'child_question','scope',c->'scope','remit',c->'remit','method',c->'dependencies'->'method'->'version','criteria',c->'dependencies'->'criteria'->'version','witnesses',c->'dependencies'->'witnesses'->'version');
end $$;

create function ecb9.observe(p uuid,slot text,version uuid,complete boolean,pred uuid,r uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; sig jsonb; id uuid; v jsonb; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid);
 sig:=jsonb_build_object('op','observe','slot',slot,'version',version,'complete',complete,'predecessor',pred);
 id:=ecb9.replay(p,r,sig); if id is not null then return jsonb_build_object('event',id,'replay',true); end if;
 st:=ecb9.state(p); perform ecb9.cas(st,pred);
 if not(c->'dependencies'?slot) or complete is null then raise exception 'b9_undeclared_observation'; end if;
 if version is not null then v:=ecb9.doc(version,'b9_basis'); if v->>'subject' is distinct from c->'dependencies'->slot->>'component' then raise exception 'b9_observation_subject'; end if; end if;
 id:=ecb9.append(p,pred,r,'observe',jsonb_build_object('slot',slot,'version',version,'complete',complete,'signature',sig));
 return jsonb_build_object('event',id,'replay',false);
end $$;

create function ecb9.open_child(p uuid,binding jsonb,pred uuid,r uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; sig jsonb; id uuid; criteria jsonb; d2 jsonb; d record; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid);
 sig:=jsonb_build_object('op','open','binding',binding,'predecessor',pred);
 id:=ecb9.replay(p,r,sig); if id is not null then return jsonb_build_object('event',id,'replay',true); end if;
 st:=ecb9.state(p); perform ecb9.cas(st,pred);
 if binding is distinct from ecb9.binding(p) then raise exception 'b9_exact_binding'; end if;
 if st->'open'<>'null'::jsonb then raise exception 'b9_one_child_or_no_new_discrimination'; end if;
 if c->>'unresolved'<>'governance' or c->>'resolution' not in ('child witness examination','local witness available','display only') then raise exception 'b9_threshold_dependency'; end if;
 if c->>'resolution'<>'child witness examination' then return jsonb_build_object('opened',false,'route','local check / Question Forward','reason',c->'resolution'); end if;
 for d in select key,value from jsonb_each(st->'observations') loop
  if d.value->>'complete' is distinct from 'true' or d.value->>'version' is null then return jsonb_build_object('opened',false,'route','HOLD','reason','declared observation incomplete','slot',d.key); end if;
  if d.value->>'version' is distinct from c->'dependencies'->d.key->>'version' or d.value->>'history' is not null then return jsonb_build_object('opened',false,'route','REQUALIFY','reason','basis changed before opening','slot',d.key); end if;
 end loop;
 if st->'observations'->'governance'->>'version' is null then return jsonb_build_object('opened',false,'route','HOLD','reason','bound G1 unavailable'); end if;
 if st->'observations'->'applicability'->>'version' is null then return jsonb_build_object('opened',false,'route','HOLD','reason','independent remit unavailable'); end if;
 d2:=ecb9.doc((st->'observations'->'applicability'->>'version')::uuid,'b9_basis');
 if d2->>'applicable' is distinct from 'true' then return jsonb_build_object('opened',false,'route','HOLD','reason','independent dependency blocks both answers'); end if;
 criteria:=ecb9.doc((binding->>'criteria')::uuid,'b9_basis');
 if criteria->'branches'->>'PASS' is distinct from 'permit bounded reliance if all parent conditions hold' or criteria->'branches'->>'FAIL' not in ('framing defeated; corrective inquiry','new qualification required','unresolved; seek discriminator') then raise exception 'b9_consequence_witness'; end if;
 if c->>'path_available' is distinct from 'true' then return jsonb_build_object('opened',false,'route','HOLD','reason','no admissible bounded discrimination path'); end if;
 id:=ecb9.append(p,pred,r,'open',jsonb_build_object('binding',binding,'observations',st->'observations','consequences',criteria->'branches','why',c->'resolution','signature',sig));
 return jsonb_build_object('event',id,'opened',true,'replay',false);
end $$;

-- Protected evaluator derives findings from retained inputs. It does not accept a
-- producer's outcome/findings. The optional submission must equal the derived record.
create function ecb9.examine(p uuid,attempt uuid) returns jsonb language plpgsql set search_path='' as $$
declare c jsonb; st jsonb; b jsonb; g jsonb; ct jsonb; m jsonb; w jsonb; x jsonb; actual jsonb; findings jsonb:='[]'; outcome text:='PASS'; def text; begin
 c:=ecb9.contract(p); st:=ecb9.state(p); b:=st->'open'->'binding';
 if st->>'attempt' is distinct from attempt::text then raise exception 'b9_exact_attempt'; end if;
 if b is distinct from ecb9.binding(p) then raise exception 'b9_exact_binding'; end if;
 g:=ecb9.doc((b->>'version')::uuid,'b9_basis'); ct:=ecb9.doc((b->>'criteria')::uuid,'b9_basis');
 m:=ecb9.doc((b->>'method')::uuid,'b9_basis'); w:=ecb9.doc((b->>'witnesses')::uuid,'b9_basis');
 select pg_get_functiondef('ecb9.compare(jsonb,jsonb)'::regprocedure) into def;
 if m->>'definition' is distinct from def or m->>'digest' is distinct from encode(extensions.digest(convert_to(def,'UTF8'),'sha256'),'hex') then outcome:='INDETERMINATE'; end if;
 if ct->>'proposition' is distinct from b->>'child_question' or w->>'proposition' is distinct from b->>'child_question' or ct->>'scope' is distinct from b->>'scope' or w->>'scope' is distinct from b->>'scope' then raise exception 'b9_proposition_scope'; end if;
 perform ecb9.doc((ct->>'source')::uuid,'b9_basis');
 if jsonb_typeof(ct->'cases') is distinct from 'array' or jsonb_array_length(ct->'cases')<2 then raise exception 'b9_sensitivity_controls_required'; end if;
 for x in select value from jsonb_array_elements(ct->'cases') loop
  if not(w->'inputs'? (x->>'id')) then actual:=jsonb_build_object('outcome','UNKNOWN');
  else actual:=ecb9.compare(g,w->'inputs'->(x->>'id')); end if;
  findings:=findings||jsonb_build_array(jsonb_build_object('obligation',x->'id','expected',x->'expected','observed',actual,'witness',jsonb_build_object('artifact',b->'witnesses','path',jsonb_build_array('inputs',x->'id'))));
  if actual->>'outcome'='UNKNOWN' then outcome:='UNKNOWN';
  elsif actual->>'outcome'='INDETERMINATE' and outcome<>'UNKNOWN' then outcome:='INDETERMINATE';
  elsif actual->>'outcome' is distinct from x->>'expected' and outcome='PASS' then outcome:='FAIL'; end if;
 end loop;
 return jsonb_build_object('binding',b,'attempt',attempt,'evidence',jsonb_build_array(b->'version',b->'criteria',b->'method',b->'witnesses',ct->'source'),'criteria',b->'criteria','method',b->'method','findings',findings,'outcome',outcome,'summary',case outcome when 'PASS' then 'All declared finite witness outcomes correspond.' when 'FAIL' then 'A retained witness establishes a declared rule violation.' when 'UNKNOWN' then 'A required witness is unavailable.' else 'The retained method cannot establish the declared proposition.' end,'limits','Finite supplied rules and witnesses; trusted fixture/custody; no universal correctness, authority, currentness or amendment.','source_standing',c->'source_standing');
end $$;
create function ecb9.publish(p uuid,attempt uuid,binding jsonb,submission jsonb,pred uuid,r uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; sig jsonb; id uuid; q uuid; j jsonb; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid);
 sig:=jsonb_build_object('op','publish','attempt',attempt,'binding',binding,'submission',submission,'predecessor',pred);
 id:=ecb9.replay(p,r,sig); if id is not null then return jsonb_build_object('event',id,'replay',true); end if;
 st:=ecb9.state(p); perform ecb9.cas(st,pred);
 if st->>'attempt' is distinct from attempt::text or binding is distinct from st->'open'->'binding' then raise exception 'b9_exact_attempt_binding'; end if;
 if exists(select 1 from public.artifacts where context_id=attempt and artifact_role='b9_judgment') then raise exception 'b9_terminal_attempt'; end if;
 if exists(select 1 from public.artifacts a where a.id=attempt and a.created_xid=pg_current_xact_id()) then raise exception 'b9_committed_attempt_required'; end if;
 j:=ecb9.examine(p,attempt);
 if submission is not null and submission is distinct from j then raise exception 'b9_producer_forged_or_contradictory_judgment'; end if;
 q:=ecb9.retain('b9_judgment',attempt,j||jsonb_build_object('evaluator',session_user,'remit',c->'remit'));
 id:=ecb9.append(p,pred,r,'judgment',jsonb_build_object('judgment',q,'attempt',attempt,'signature',sig));
 return jsonb_build_object('event',id,'judgment',q,'outcome',j->'outcome','replay',false);
end $$;
create function ecb9.retry_attempt(p uuid,pred uuid,r uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; sig jsonb; id uuid; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid);
 sig:=jsonb_build_object('op','retry','predecessor',pred); id:=ecb9.replay(p,r,sig);
 if id is not null then return jsonb_build_object('event',id,'replay',true); end if;
 st:=ecb9.state(p); perform ecb9.cas(st,pred);
 if st->'open'='null'::jsonb or st->'judgment'<>'null'::jsonb then raise exception 'b9_retry_only_interrupted_unresolved_attempt'; end if;
 id:=ecb9.append(p,pred,r,'retry',jsonb_build_object('prior_attempt',st->'attempt','binding',st->'open'->'binding','signature',sig));
 return jsonb_build_object('event',id,'replay',false);
end $$;
create function ecb9.return_result(p uuid,q uuid,binding jsonb,pred uuid,r uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; sig jsonb; id uuid; j jsonb; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid);
 sig:=jsonb_build_object('op','return','judgment',q,'binding',binding,'predecessor',pred); id:=ecb9.replay(p,r,sig);
 if id is not null then return jsonb_build_object('event',id,'replay',true); end if;
 st:=ecb9.state(p); perform ecb9.cas(st,pred); j:=ecb9.doc(q,'b9_judgment');
 if st->>'judgment' is distinct from q::text or binding is distinct from st->'open'->'binding' or j->'binding' is distinct from binding or j->>'attempt' is distinct from st->>'attempt' then raise exception 'b9_exact_return_binding'; end if;
 if st->'returned'<>'null'::jsonb then raise exception 'b9_duplicate_return'; end if;
 id:=ecb9.append(p,pred,r,'return',jsonb_build_object('judgment',q,'binding',binding,'signature',sig));
 return jsonb_build_object('event',id,'replay',false);
end $$;

create function ecb9.route(p uuid,st jsonb) returns jsonb language plpgsql set search_path='' as $$
declare c jsonb; d record; v jsonb; j jsonb; g jsonb; checked jsonb; ct jsonb; drift boolean:=false; reasons jsonb:='[]'; verdict text; begin
 c:=ecb9.contract(p);
 for d in select key,value from jsonb_each(st->'observations') loop
  if d.value->>'complete' is distinct from 'true' or d.value->>'version' is null then
   return jsonb_build_object('disposition','HOLD','reason','missing observation or bound evidence','slot',d.key,'question_forward',c->'question_forward'); end if;
  v:=ecb9.doc((d.value->>'version')::uuid,'b9_basis');
  if v->>'subject' is distinct from c->'dependencies'->d.key->>'component' then raise exception 'b9_observation_binding'; end if;
  if st->'open' is not null and st->'open'<>'null'::jsonb and d.value is distinct from st->'open'->'observations'->d.key then drift:=true; reasons:=reasons||to_jsonb(d.key); end if;
 end loop;
 if st->>'returned' is null then return jsonb_build_object('disposition','HOLD','reason','child result unresolved or not returned','question_forward',c->'question_forward'); end if;
 j:=ecb9.doc((st->>'returned')::uuid,'b9_judgment');
 if j->'binding' is distinct from st->'open'->'binding' then raise exception 'b9_parent_result_binding'; end if;
 checked:=ecb9.examine(p,(st->>'attempt')::uuid);
 if (j-'evaluator'-'remit') is distinct from checked then return jsonb_build_object('disposition','HOLD','reason','judgment evidence or method cannot be revalidated','question_forward',c->'question_forward'); end if;
 -- Load-bearing G1 execution against the ACTUAL returned judgment, through the
 -- identical finite comparator used by the child witness tests.
 g:=ecb9.doc((j->'binding'->>'version')::uuid,'b9_basis');
 checked:=ecb9.compare(g,j);
 if checked->>'outcome' is distinct from 'PASS' or j->>'outcome' in ('UNKNOWN','INDETERMINATE','INCOMPLETE') then
  return jsonb_build_object('disposition','HOLD','reason','G1 evidence gate or child discrimination unresolved','g1_acceptance',checked,'question_forward',c->'question_forward'); end if;
 ct:=ecb9.doc((j->'binding'->>'criteria')::uuid,'b9_basis');
 if j->>'outcome'='FAIL' then
  verdict:=case ct->'branches'->>'FAIL' when 'framing defeated; corrective inquiry' then 'REORIENT' when 'new qualification required' then 'REQUALIFY' else 'HOLD' end;
  return jsonb_build_object('disposition',verdict,'reason','supported witness finding; consequence from exact parent criterion','findings',j->'findings','g1_acceptance',checked,'question_forward',c->'question_forward');
 end if;
 v:=ecb9.doc((st->'observations'->'applicability'->>'version')::uuid,'b9_basis');
 if v->>'applicable' is distinct from 'true' then drift:=true; reasons:=reasons||'"independent remit unavailable/revoked"'::jsonb; end if;
 if drift then return jsonb_build_object('disposition','REQUALIFY','reason','decision-bearing basis or continuity changed','changed_slots',reasons,'g1_acceptance',checked,'question_forward',c->'question_forward'); end if;
 return jsonb_build_object('disposition','CONTINUE','reason','exact child support and independently observed parent conditions apply','step',c->'step','g1_acceptance',checked,'non_promotion','inquiry disposition only; no action or authority');
end $$;
create function ecb9.reenter(p uuid,observations jsonb,pred uuid,r uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; sig jsonb; id uuid; result jsonb; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid);
 sig:=jsonb_build_object('op','reentry','observations',observations,'predecessor',pred); id:=ecb9.replay(p,r,sig);
 if id is not null then return jsonb_build_object('event',id,'replay',true,'historical_only',true,'present',ecb9.route(p,ecb9.state(p))); end if;
 st:=ecb9.state(p); perform ecb9.cas(st,pred);
 if observations is distinct from st->'observations' then raise exception 'b9_stale_observation'; end if;
 if st->'last_disposition'->>'predecessor' is not null and st->'last_disposition'->'observations'=observations and st->'last_disposition'->>'result' is not distinct from st->>'returned' then raise exception 'b9_duplicate_reentry_no_new_basis'; end if;
 result:=ecb9.route(p,st);
 id:=ecb9.append(p,pred,r,'reentry',result||jsonb_build_object('observations',observations,'result',st->'returned','attempt',st->'attempt','signature',sig));
 return jsonb_build_object('event',id,'replay',false,'result',result);
end $$;

create function ecb9.inspect(p uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb; st jsonb; result jsonb; j jsonb; links jsonb; begin
 c:=ecb9.contract(p); perform ecb9.lock_scope((c->>'scope')::uuid); st:=ecb9.state(p); result:=ecb9.route(p,st);
 if st->>'returned' is not null then j:=ecb9.doc((st->>'returned')::uuid,'b9_judgment'); end if;
 select jsonb_agg(jsonb_build_object('slot',key,'claim',value->'claim','component',value->'component','version',value->'version')) into links from jsonb_each(c->'dependencies');
 return jsonb_build_object('locator',p,'source_contract',p,'boundary',st->'head','parent',jsonb_build_object('focal',c->'focal','question',c->'question','step',c->'step','governing_basis',c->'dependencies'->'governance','remit',c->'remit'),
 'dependency',jsonb_build_object('slot',c->'unresolved','binding',ecb9.binding(p),'why',c->'resolution'),
 'child',jsonb_build_object('open',st->'open'->'id','attempt',st->'attempt','question',c->'child_question','state',case when st->>'returned' is not null then 'returned' when st->>'judgment' is not null then 'judged, not returned' when st->>'attempt' is not null then 'open; unresolved' else 'not opened' end),
 'judgment',case when j is null then null else jsonb_build_object('source',st->'returned','outcome',j->'outcome','summary',j->'summary','evidence',j->'evidence','findings',j->'findings','limits',j->'limits') end,
 'observations',st->'observations','changes',st->'changes','last_disposition',st->'last_disposition','present',result,'links',links,
 'history',st->'history','non_promotion','Regenerated read projection. Historical disposition is not present permission; new reentry needs this boundary and observations.');
exception when others then return jsonb_build_object('locator',p,'present',jsonb_build_object('disposition','HOLD','reason',SQLERRM,'question_forward','Restore the exact unavailable/corrupt source or observation; then regenerate and independently reenter.'),'integrity','unavailable; no positive reliance');
end $$;
create function ecb9.read_source(i uuid) returns jsonb language plpgsql security definer set search_path='' as $$ begin return ecb9.doc(i); end $$;

do $$ declare r record; begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb9' loop execute format('alter function %s owner to ecb9_owner',r.signature); end loop;
end $$;
revoke all on all functions in schema ecb9 from public,anon,authenticated,service_role;
grant execute on function ecb9.fixture(uuid,jsonb),ecb9.bind(uuid,jsonb) to postgres;
grant execute on function ecb9.observe(uuid,text,uuid,boolean,uuid,uuid) to ecb9_writer;
grant execute on function ecb9.open_child(uuid,jsonb,uuid,uuid),ecb9.retry_attempt(uuid,uuid,uuid),ecb9.return_result(uuid,uuid,jsonb,uuid,uuid),ecb9.reenter(uuid,jsonb,uuid,uuid) to ecb9_parent;
grant execute on function ecb9.publish(uuid,uuid,jsonb,jsonb,uuid,uuid) to ecb9_child;
grant execute on function ecb9.inspect(uuid),ecb9.read_source(uuid) to ecb9_parent,ecb9_child,ecb9_observer,ecb9_writer;
