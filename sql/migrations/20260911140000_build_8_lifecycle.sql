-- ECO-103 continuation of the durable composition checkpoint.
-- Only the accepted atomic-ledger synthetic advance_one target. No new tables,
-- indexes, episode root, currentness registry, external executor or policy engine.

create function ecb8.keys(j jsonb, names text[]) returns void
language plpgsql immutable set search_path='' as $$
declare actual text[]; expected text[]; begin
 select array_agg(k order by k) into actual from jsonb_object_keys(j) k;
 select array_agg(k order by k) into expected from unnest(names) k;
 if actual is distinct from expected then raise exception 'b8_exact_fields:%',names; end if;
end $$;

create function ecb8.initial(s uuid,a uuid) returns jsonb
language plpgsql set search_path='' as $$
declare ids uuid[]; j jsonb; begin
 select array_agg(id) into ids from public.artifacts where artifact_role='b8_basis'
 and context_id=s and payload_text::jsonb->>'action'=a::text and payload_text::jsonb->>'kind'='target_initial';
 if coalesce(cardinality(ids),0)<>1 then raise exception 'b8_exact_initial_required'; end if;
 j:=ecb8.doc(ids[1],'b8_basis');
 if j->>'scope' is distinct from s::text then raise exception 'b8_scope_mismatch'; end if;
 return j||jsonb_build_object('id',ids[1]);
end $$;

-- Fold ALL bounded history, using predecessor topology, never timestamps. The
-- snapshot object is an ephemeral calculation, not a persisted currentness store.
create function ecb8.history(s uuid,a uuid) returns jsonb
language plpgsql set search_path='' as $$
declare init jsonb; rows jsonb; ev jsonb; data jsonb; h jsonb; nexts jsonb; eid text;
 head text; seen text[]:='{}'; n int; k text; st jsonb; ad jsonb; au jsonb; c jsonb; g jsonb;
 legal boolean; r record; begin
 init:=ecb8.initial(s,a);
 h:=jsonb_build_object('head',null,'initial',init,'value',0,'revision',0,'ready',true,'tick',10,
 'selected',null,'selection_head',null,'revoked_grants','[]'::jsonb,'revoked_authorizations','[]'::jsonb,
 'dependencies',init->'dependencies','admissions','{}'::jsonb,'starts','{}'::jsonb,'terminals','{}'::jsonb,
 'effects','[]'::jsonb,'acks','[]'::jsonb,'events','[]'::jsonb,'legitimate',true);
 rows:='[]';
 -- Include context/declared-scope discrepancies so they cannot disappear from observation.
 for r in select * from public.artifacts where artifact_role='b8_event'
 and (context_id=s or payload_text::jsonb->>'scope'=s::text)
 and payload_text::jsonb->>'action'=a::text loop
  ev:=ecb8.doc(r.id,'b8_event');
  if r.context_id<>s or ev->>'scope' is distinct from s::text then raise exception 'b8_scope_mismatch'; end if;
  perform ecb8.keys(ev,array['scope','action','kind','predecessor','login','participant','request','data']);
  rows:=rows||jsonb_build_array(ev||jsonb_build_object('id',r.id,'xid',r.created_xid::text));
 end loop;
 n:=jsonb_array_length(rows);
 while cardinality(seen)<n loop
  select coalesce(jsonb_agg(x),'[]') into nexts from jsonb_array_elements(rows) x where x->>'predecessor' is not distinct from head;
  if jsonb_array_length(nexts)<>1 then raise exception 'b8_broken_fork_cycle_history'; end if;
  ev:=nexts->0; eid:=ev->>'id';
  if eid=any(seen) then raise exception 'b8_cycle'; end if;
  seen:=array_append(seen,eid); k:=ev->>'kind'; data:=ev->'data';
  if ev->>'participant' is distinct from init->'principals'->> (ev->>'login') then raise exception 'b8_participant_binding'; end if;
  if exists(select 1 from jsonb_array_elements(h->'events') x where x->>'request'=ev->>'request') then raise exception 'b8_request_fork'; end if;
  case k
   when 'tick' then
    perform ecb8.keys(data,array['tick']);
    if jsonb_typeof(data->'tick') is distinct from 'number' then raise exception 'b8_integer_tick_required'; end if;
    if (data->>'tick')::int <= (h->>'tick')::int then raise exception 'b8_tick_not_increasing'; end if;
    h:=h||jsonb_build_object('tick',data->'tick');
   when 'ready' then
    perform ecb8.keys(data,array['ready']);
    if jsonb_typeof(data->'ready')<>'boolean' or data->'ready'=h->'ready' then raise exception 'b8_native_change_required'; end if;
    h:=h||jsonb_build_object('ready',data->'ready','revision',(h->>'revision')::int+1);
   when 'dependency' then
    perform ecb8.keys(data,array['source','revision']);
    if data->>'revision' is null or data->'revision'=h->'dependencies'->(data->>'source') then raise exception 'b8_revision_change_required'; end if;
    h:=jsonb_set(h,array['dependencies',data->>'source'],data->'revision');
   when 'revoke_grant' then
    perform ecb8.keys(data,array['grant']); perform ecb8.doc((data->>'grant')::uuid,'b8_basis');
    h:=h||jsonb_build_object('revoked_grants',h->'revoked_grants'||jsonb_build_array(data->'grant'));
   when 'withdraw' then
    perform ecb8.keys(data,array['authorization']);
    if data->>'authorization' is distinct from h->'selected'->>'id' then raise exception 'b8_withdraw_binding'; end if;
    h:=h||jsonb_build_object('revoked_authorizations',h->'revoked_authorizations'||jsonb_build_array(data->'authorization'),
       'selected',null,'selection_head',eid);
   when 'authorize' then
    perform ecb8.keys(data,array['authorization','designation','tick']);
    au:=data->'authorization'; perform ecb8.keys(au,array['envelope','evaluation','grant']);
    perform ecb8.keys(data->'designation',array['envelope','predecessor']);
    if data->'designation'->>'predecessor' is distinct from h->>'selection_head'
    or data->'designation'->'envelope' is distinct from au->'envelope' then raise exception 'b8_designation_binding'; end if;
    h:=h||jsonb_build_object('selected',au||jsonb_build_object('id',eid),'selection_head',eid);
   when 'admit' then
    perform ecb8.keys(data,array['authorization','envelope','evaluation','grant','observation']);
    h:=jsonb_set(h,array['admissions',eid],data||jsonb_build_object('id',eid,'xid',ev->'xid'));
   when 'start' then
    perform ecb8.keys(data,array['admission']);
    if not(h->'admissions' ? (data->>'admission')) then raise exception 'b8_missing_admission'; end if;
    if exists(select 1 from jsonb_each(h->'starts') x where x.value->>'admission'=data->>'admission'
      or not(h->'terminals' ? x.key)) then raise exception 'b8_conflicting_start'; end if;
    h:=jsonb_set(h,array['starts',eid],data||jsonb_build_object('id',eid,'xid',ev->'xid'));
   when 'fence' then
    perform ecb8.keys(data,array['start','reason']);
    if not(h->'starts' ? (data->>'start')) or h->'terminals' ? (data->>'start') or jsonb_array_length(h->'effects')>0 then raise exception 'b8_conflicting_terminal'; end if;
    h:=jsonb_set(h,array['terminals',data->>'start'],ev);
   when 'effect' then
    perform ecb8.keys(data,array['start','target','operation','delta','observation']);
    if data->>'target' is distinct from init->>'target' or data->>'operation'<>'advance_one' or data->'delta'<>'1'::jsonb then raise exception 'b8_native_history_gap'; end if;
    if h->'terminals' ? (data->>'start') then raise exception 'b8_conflicting_terminal'; end if;
    st:=h->'starts'->(data->>'start'); ad:=h->'admissions'->(st->>'admission'); au:=h->'selected';
    legal:=false;
    if st is not null and ad is not null and au is not null then
     c:=ecb8.doc((ad->>'envelope')::uuid,'b8_envelope'); g:=ecb8.doc((ad->>'grant')::uuid,'b8_basis');
     legal:=ad->>'authorization'=au->>'id' and c->>'actor'=ev->>'participant'
      and g->>'login'=ev->>'login' and not(h->'revoked_grants' ? (ad->>'grant'))
      and not(h->'revoked_authorizations' ? (ad->>'authorization'))
      and c->'from_value'=h->'value' and c->'target_revision'=h->'revision' and h->'ready'='true'::jsonb
      and (h->>'tick')::int<30 and jsonb_array_length(h->'effects')=0
      and data->'observation'->'value'=h->'value' and data->'observation'->'revision'=h->'revision'
      and data->'observation'->'tick'=h->'tick'
      and data->'observation'->'orientation'=c->'orientation'->'designation';
     for r in select key,value from jsonb_each(c->'dependencies') loop
      legal:=legal and r.value->'revision'=h->'dependencies'->r.key;
     end loop;
    end if;
    h:=h||jsonb_build_object('value',(h->>'value')::int+1,'revision',(h->>'revision')::int+1,
     'effects',h->'effects'||jsonb_build_array(ev||jsonb_build_object('legitimate',coalesce(legal,false))),
     'legitimate',(h->>'legitimate')::boolean and coalesce(legal,false));
    if st is not null then h:=jsonb_set(h,array['terminals',data->>'start'],ev); end if;
   when 'ack' then
    perform ecb8.keys(data,array['start','reported_terminal','received']);
    h:=h||jsonb_build_object('acks',h->'acks'||jsonb_build_array(ev));
   else raise exception 'b8_unknown_event_subtype';
  end case;
  h:=h||jsonb_build_object('events',h->'events'||jsonb_build_array(ev),'head',eid); head:=eid;
 end loop;
 return h;
end $$;

create function ecb8.expected(h jsonb,p uuid) returns void language plpgsql immutable set search_path='' as $$ begin
 if h->>'head' is distinct from p::text then raise exception 'b8_stale_predecessor'; end if;
end $$;

create function ecb8.event(s uuid,a uuid,h jsonb,k text,d jsonb,request uuid) returns uuid
language plpgsql set search_path='' as $$ begin
 if h->'initial'->'principals'->>session_user is null then raise exception 'b8_authenticated_participant_required'; end if;
 return ecb8.retain('b8_event',s,jsonb_build_object('scope',s,'action',a,'kind',k,'predecessor',h->'head',
 'login',session_user,'participant',h->'initial'->'principals'->session_user,'request',request,'data',d)::text);
end $$;

-- Installation custody supplies exact synthetic target, contract and A_TEST
-- grants. No runtime EXECUTE grant; fixture source is never caller authority.
create function ecb8.fixture(s uuid,a uuid,j jsonb,p uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare h jsonb; k text; ref_id uuid; c jsonb; begin
 perform ecb8.lock_scope(s); k:=j->>'kind';
 if j->>'scope' is distinct from s::text or j->>'action' is distinct from a::text or j->'synthetic' is distinct from 'true'::jsonb then raise exception 'b8_synthetic_fixture_only'; end if;
 if k='target_initial' then
  perform ecb8.keys(j,array['kind','scope','action','synthetic','target','actor','actor_login','principals','dependencies']);
  if exists(select 1 from public.artifacts where artifact_role='b8_basis' and context_id=s and payload_text::jsonb->>'kind'='target_initial') then raise exception 'b8_one_action_target'; end if;
  for ref_id in select value::uuid from jsonb_each_text(j->'principals') union select a union select (j->>'target')::uuid loop
   if not exists(select 1 from public.referents where public.referents.id=ref_id) then raise exception 'b8_referent_required'; end if;
  end loop;
  if j->'principals'->>(j->>'actor_login') is distinct from j->>'actor' then raise exception 'b8_authentication_basis'; end if;
 else
  h:=ecb8.history(s,a); perform ecb8.expected(h,p);
  if k='contract' then
   perform ecb8.keys(j,array['kind','scope','action','synthetic','target','actor','initial','orientation','required','interpretations','method','method_definition','limits']);
   if j->>'method'<>encode(extensions.digest(convert_to(pg_get_functiondef('ecb8.examine(uuid,uuid)'::regprocedure),'UTF8'),'sha256'),'hex')
   or j->>'method_definition'<>pg_get_functiondef('ecb8.examine(uuid,uuid)'::regprocedure) then raise exception 'b8_method_binding'; end if;
  elsif k='grant' then
   perform ecb8.keys(j,array['kind','scope','action','synthetic','issuer','actor','login','target','operation','envelope','evaluation','predecessor','temporal','rights']);
   if j->>'issuer'<>'A_TEST' then raise exception 'b8_fixture_issuer'; end if;
  else raise exception 'b8_basis_subtype'; end if;
 end if;
 return ecb8.retain('b8_basis',s,j::text);
end $$;

create function ecb8.propose(s uuid,a uuid,bytes text) returns uuid
language plpgsql security definer set search_path='' as $$
declare h jsonb; c jsonb; begin
 perform ecb8.lock_scope(s); h:=ecb8.history(s,a);
 if not(bytes is json object with unique keys) then raise exception 'b8_exact_unique_json_required'; end if;
 c:=bytes::jsonb;
 perform ecb8.keys(c,array['scope','action','target','actor','operation','from_value','target_revision','ready','delta','max_effects',
 'orientation','dependencies','method','contract','expression','observation_access','temporal','retry']);
 if c->>'scope' is distinct from s::text or c->>'action' is distinct from a::text then raise exception 'b8_locator_binding'; end if;
 -- Wrong meanings/values remain retainable; qualification must discriminate them.
 return ecb8.retain('b8_envelope',s,bytes);
end $$;

-- R2 finite comparison. Each finding has a witness. No arbitrary wording
-- inference, supplied PASS flag, second aggregate digest or qualification start.
create function ecb8.examine(envelope uuid,contract uuid) returns jsonb
language plpgsql set search_path='' as $$
declare c jsonb; ct jsonb; init jsonb; deps jsonb; d jsonb; f jsonb:='[]'; failures jsonb:='[]'; gaps jsonb:='[]';
 r record; q jsonb; keydoc jsonb; designation jsonb; src jsonb; meaning jsonb; expected_meaning jsonb;
 outcome text; status text; required text[]; actual text[]; observed jsonb; begin
 c:=ecb8.doc(envelope,'b8_envelope'); ct:=ecb8.doc(contract,'b8_basis');
 init:=ecb8.initial((ct->>'scope')::uuid,(ct->>'action')::uuid);
 if ct->>'kind'<>'contract' then raise exception 'b8_comparison_contract_required'; end if;
 status:='PASS';
 if c->>'contract' is distinct from contract::text or c->>'method' is distinct from ct->>'method'
 or ct->>'method'<>encode(extensions.digest(convert_to(pg_get_functiondef('ecb8.examine(uuid,uuid)'::regprocedure),'UTF8'),'sha256'),'hex')
 or c->>'scope' is distinct from ct->>'scope' or c->>'action' is distinct from ct->>'action'
 or c->>'target' is distinct from init->>'target' or c->>'actor' is distinct from init->>'actor'
 or c->'orientation' is distinct from ct->'orientation' then status:='FAIL'; end if;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','exact_binding','status',status,'witness',c-'expression'));
 deps:=c->'dependencies';
 select array_agg(x order by x) into required from (select jsonb_object_keys(ct->'required') x union select contract::text) t;
 select array_agg(x order by x) into actual from jsonb_object_keys(deps) x;
 if required is distinct from actual then gaps:=gaps||jsonb_build_array('required_manifest_members'); end if;
 for r in select * from jsonb_each(ct->'required'||jsonb_build_object(contract::text,jsonb_build_object('role','b8_basis'))) loop
  if not(deps ? r.key) then continue; end if;
  begin
   d:=ecb8.doc(r.key::uuid,r.value->>'role');
   if deps->r.key->>'role' is distinct from r.value->>'role'
    or deps->r.key->>'digest' is distinct from (select encode(payload_digest,'hex') from public.artifacts where public.artifacts.id=r.key::uuid)
    or deps->r.key->>'revision' is distinct from '1' then failures:=failures||jsonb_build_array(r.key); end if;
  exception when others then gaps:=gaps||jsonb_build_array(jsonb_build_object('id',r.key,'gap',sqlerrm)); end;
 end loop;
 status:=case when jsonb_array_length(failures)>0 then 'FAIL' when jsonb_array_length(gaps)>0 then 'INCOMPLETE' else 'PASS' end;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','closure','status',status,'witness',jsonb_build_object('mismatches',failures,'gaps',gaps)));
 status:='PASS';
 if c->>'operation' is distinct from 'advance_one' or c->'delta' is distinct from '1'::jsonb
 or c->'max_effects' is distinct from '1'::jsonb or c->'from_value' is distinct from '0'::jsonb
 or c->'target_revision' is distinct from '0'::jsonb or c->'ready' is distinct from 'true'::jsonb
 or c->>'observation_access' is distinct from 'external' then status:='FAIL'; end if;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','action_meaning','status',status,'witness',jsonb_build_object('delta',c->'delta','maximum',c->'max_effects','access',c->'observation_access')));
 status:='PASS';
 if c->'temporal' is distinct from '{"issue":[10,12],"admit":[10,20],"effect_before":30,"unrevoked_through_effect":true}'::jsonb
 or c->>'retry' is distinct from 'observe_then_explicit_fence_before_fresh_admission' then status:='FAIL'; end if;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','temporal_retry','status',status,'witness',jsonb_build_object('temporal',c->'temporal','retry',c->'retry')));
 expected_meaning:=jsonb_build_object('target',init->'target','action',ct->'action','from_value',0,'revision',0,'delta',1,'maximum',1,'access','external');
 meaning:=ct->'interpretations'->(c->>'expression');
 status:=case when meaning is null then 'INCOMPLETE' when meaning='null'::jsonb then 'INDETERMINATE'
 when meaning is distinct from expected_meaning then 'FAIL' else 'PASS' end;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','expression_meaning','status',status,'witness',jsonb_build_object('expression',c->'expression','interpreted',meaning,'required',expected_meaning)));
 status:='PASS';
 begin
  keydoc:=ecb8.doc((ct->'orientation'->>'key')::uuid,'b7_candidate');
  q:=ecb8.doc((ct->'orientation'->>'evaluation')::uuid,'b7_evaluation');
  designation:=ecb8.doc((ct->'orientation'->>'designation')::uuid,'b7_designation');
  if q->>'outcome'<>'PASS' or q->'basis' is distinct from keydoc or q->>'candidate' is distinct from ct->'orientation'->>'key'
  or designation->>'candidate' is distinct from ct->'orientation'->>'key' or designation->>'evaluation' is distinct from ct->'orientation'->>'evaluation'
  or designation->>'operation'<>'select' or designation->>'scope' is distinct from ct->>'scope'
  or not(keydoc->'conclusions' @> '[{"comparison":"native","answer":false},{"comparison":"external","answer":true}]') then status:='FAIL'; end if;
  -- Explicit source observations and latency/access remain independently retained.
  for r in select * from jsonb_each(ct->'required') where value ? 'access' loop
   src:=ecb8.doc(r.key::uuid,'b7_snapshot');
   if r.value->>'access'='native' and src->'observations' is distinct from '[20,20]'::jsonb then status:='FAIL'; end if;
   if r.value->>'access'='external' and (src->'observations' is distinct from '[20.1,20.2]'::jsonb or (src->>'latency')::numeric>60) then status:='FAIL'; end if;
  end loop;
 exception when others then status:='INCOMPLETE'; end;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','orientation_grounding','status',status,'witness',ct->'orientation'));
 observed:=ecb8.history((ct->>'scope')::uuid,(ct->>'action')::uuid); status:='PASS';
 if (select current_event::text from ecb7.scopes where id=(ct->>'scope')::uuid) is distinct from ct->'orientation'->>'designation' then status:='FAIL'; end if;
 for r in select * from jsonb_each(deps) loop
  if observed->'dependencies'->r.key is distinct from r.value->'revision' then status:='FAIL'; end if;
 end loop;
 f:=f||jsonb_build_array(jsonb_build_object('obligation','declared_current_basis','status',status,'witness',observed->'dependencies'));
 if exists(select 1 from jsonb_array_elements(f) x where x->>'status'='FAIL') then outcome:='FAIL';
 elsif exists(select 1 from jsonb_array_elements(f) x where x->>'status'='INCOMPLETE') then outcome:='INCOMPLETE';
 elsif exists(select 1 from jsonb_array_elements(f) x where x->>'status'='INDETERMINATE') then outcome:='INDETERMINATE'; else outcome:='PASS'; end if;
 return jsonb_build_object('outcome',outcome,'findings',f,'method',ct->'method','envelope',envelope,'contract',contract,
 'scope',ct->'scope','action',ct->'action','meaning','eligibility_only','limits',ct->'limits');
end $$;

create function ecb8.qualify(s uuid,a uuid,envelope uuid,contract uuid,p uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare h jsonb; q jsonb; begin
 perform ecb8.lock_scope(s); h:=ecb8.history(s,a); perform ecb8.expected(h,p);
 q:=ecb8.examine(envelope,contract);
 if q->>'scope' is distinct from s::text or q->>'action' is distinct from a::text then raise exception 'b8_qualification_locator'; end if;
 return ecb8.retain('b8_evaluation',s,(q||jsonb_build_object('evaluator',session_user))::text);
end $$;

create function ecb8.conditions(h jsonb,envelope uuid,stage text) returns jsonb
language plpgsql set search_path='' as $$
declare gaps jsonb:='[]'; r record; cur uuid; c jsonb; begin
 c:=ecb8.doc(envelope,'b8_envelope');
 -- Exact immutable closure and finite semantics are revalidated at every use.
 if ecb8.examine(envelope,(c->>'contract')::uuid)->>'outcome' is distinct from 'PASS' then gaps:=gaps||'"qualification_or_integrity"'::jsonb; end if;
 select current_event into cur from ecb7.scopes where id=(c->>'scope')::uuid;
 if cur::text is distinct from c->'orientation'->>'designation' then gaps:=gaps||'"orientation_selection"'::jsonb; end if;
 for r in select * from jsonb_each(c->'dependencies') loop
  if h->'dependencies'->r.key is distinct from r.value->'revision' then gaps:=gaps||jsonb_build_array('dependency:'||r.key); end if;
 end loop;
 if stage in ('admit','effect','start') and (h->'value' is distinct from c->'from_value' or h->'revision' is distinct from c->'target_revision'
 or h->'ready' is distinct from 'true'::jsonb) then gaps:=gaps||'"target_state"'::jsonb; end if;
 if (stage='authorize' and ((h->>'tick')::int<10 or (h->>'tick')::int>=12))
 or (stage='admit' and ((h->>'tick')::int<10 or (h->>'tick')::int>=20))
 or (stage in ('start','effect') and (h->>'tick')::int>=30) then gaps:=gaps||jsonb_build_array('temporal:'||stage); end if;
 return gaps;
end $$;

create function ecb8.observation(h jsonb) returns jsonb language sql set search_path='' as $$
 select jsonb_build_object('value',h->'value','revision',h->'revision','ready',h->'ready','tick',h->'tick',
 'dependencies',h->'dependencies','orientation',(select current_event from ecb7.scopes where id=(h->'initial'->>'scope')::uuid));
$$;

create function ecb8.authorize(s uuid,a uuid,envelope uuid,evaluation uuid,grant_id uuid,selection_prior uuid,p uuid,request uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h jsonb; c jsonb; q jsonb; g jsonb; req jsonb; prior jsonb; eid uuid; begin
 perform ecb8.lock_scope(s); h:=ecb8.history(s,a);
 req:=jsonb_build_object('authorization',jsonb_build_object('envelope',envelope,'evaluation',evaluation,'grant',grant_id),
 'designation',jsonb_build_object('envelope',envelope,'predecessor',selection_prior));
 select x into prior from jsonb_array_elements(h->'events') x where x->>'request'=request::text;
 if prior is not null then
  if prior->>'kind'<>'authorize' or prior->>'login'<>session_user or (prior->'data')-'tick' is distinct from req
   or prior->>'predecessor' is distinct from p::text then raise exception 'b8_request_conflict'; end if;
  return jsonb_build_object('event',prior->'id','replayed',true,'historical_authorization',prior->'data',
    'present_selected',h->'selected'->>'id'=prior->>'id');
 end if;
 perform ecb8.expected(h,p);
 c:=ecb8.doc(envelope,'b8_envelope'); q:=ecb8.doc(evaluation,'b8_evaluation'); g:=ecb8.doc(grant_id,'b8_basis');
 if c->>'scope' is distinct from s::text or c->>'action' is distinct from a::text
 or c->>'actor' is distinct from h->'initial'->'principals'->>session_user
 or h->'initial'->>'actor_login' is distinct from session_user then raise exception 'b8_actor_action_binding'; end if;
 if q->>'outcome' is distinct from 'PASS' or q->>'envelope' is distinct from envelope::text
 or q->>'method' is distinct from c->>'method' or q->>'contract' is distinct from c->>'contract' then raise exception 'b8_qualification_binding'; end if;
 if g->>'kind' is distinct from 'grant' or g->>'issuer' is distinct from 'A_TEST'
 or g->>'login' is distinct from session_user or g->>'actor' is distinct from c->>'actor'
 or g->>'scope' is distinct from s::text or g->>'action' is distinct from a::text or g->>'target' is distinct from c->>'target'
 or g->>'operation' is distinct from 'advance_one' or g->>'envelope' is distinct from envelope::text
 or g->>'evaluation' is distinct from evaluation::text or g->>'predecessor' is distinct from selection_prior::text
 or g->'temporal' is distinct from c->'temporal' or g->'rights' is distinct from '["withdraw","revoke"]'::jsonb then raise exception 'b8_grant_tuple'; end if;
 if h->>'selection_head' is distinct from selection_prior::text then raise exception 'b8_stale_selection'; end if;
 if h->'revoked_grants' ? grant_id::text then raise exception 'b8_grant_revoked'; end if;
 if ecb8.conditions(h,envelope,'authorize')<>'[]'::jsonb then raise exception 'b8_authorization_conditions:%',ecb8.conditions(h,envelope,'authorize'); end if;
 eid:=ecb8.event(s,a,h,'authorize',req||jsonb_build_object('tick',h->'tick'),request);
 return jsonb_build_object('event',eid,'replayed',false);
end $$;

create function ecb8.control(s uuid,a uuid,operation text,subject uuid,p uuid,request uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h jsonb; au jsonb; ad jsonb; st jsonb; c jsonb; prior jsonb; eid uuid; d jsonb; begin
 if operation not in ('admit','start','effect','reconcile') then raise exception 'b8_bounded_operation'; end if;
 perform ecb8.lock_scope(s); h:=ecb8.history(s,a);
 if h->'initial'->>'actor_login' is distinct from session_user then raise exception 'b8_authenticated_actor'; end if;
 -- Exact transport replays are observational, including expired/stale historical calls.
 select x into prior from jsonb_array_elements(h->'events') x where x->>'request'=request::text;
 if prior is not null then
  if prior->>'login'<>session_user or prior->>'predecessor' is distinct from p::text
  or prior->>'kind' is distinct from (case when operation='reconcile' then 'fence' else operation end)
  or (case operation when 'admit' then prior->'data'->>'authorization' when 'start' then prior->'data'->>'admission'
       else prior->'data'->>'start' end) is distinct from subject::text then raise exception 'b8_request_conflict'; end if;
  return jsonb_build_object('event',prior->'id','replayed',true,'effect_count',jsonb_array_length(h->'effects'),'retry','HOLD');
 end if;
 -- Inspect committed competitor state before predecessor check: E5 waiter proof.
 if jsonb_array_length(h->'effects')>0 then raise exception 'b8_effect_allowance_consumed'; end if;
 perform ecb8.expected(h,p);
 if operation='reconcile' then
  if not(h->'starts' ? subject::text) or h->'terminals' ? subject::text then raise exception 'b8_start_terminal_or_missing'; end if;
  eid:=ecb8.event(s,a,h,'fence',jsonb_build_object('start',subject,'reason','complete_serialized_no_native_effect'),request);
  return jsonb_build_object('event',eid,'effect_count',0,'disposition','FENCED_FRESH_ADMISSION_REQUIRED');
 end if;
 au:=h->'selected';
 if au is null or au='null'::jsonb then raise exception 'b8_selected_authorization_required'; end if;
 if h->'revoked_grants' ? (au->>'grant') or h->'revoked_authorizations' ? (au->>'id') then raise exception 'b8_revoked'; end if;
 c:=ecb8.doc((au->>'envelope')::uuid,'b8_envelope');
 if c->>'actor' is distinct from h->'initial'->'principals'->>session_user then raise exception 'b8_actor_binding'; end if;
 if ecb8.conditions(h,(au->>'envelope')::uuid,operation)<>'[]'::jsonb then raise exception 'b8_conditions:%',ecb8.conditions(h,(au->>'envelope')::uuid,operation); end if;
 if operation='admit' then
  if au->>'id' is distinct from subject::text then raise exception 'b8_authorization_subject'; end if;
  if exists(select 1 from jsonb_each(h->'starts') x where not(h->'terminals' ? x.key)) then raise exception 'b8_reconcile_required'; end if;
  d:=au-'id'||jsonb_build_object('authorization',subject,'observation',ecb8.observation(h));
 elsif operation='start' then
  ad:=h->'admissions'->subject::text;
  if ad is null or ad->>'authorization' is distinct from au->>'id' then raise exception 'b8_admission_binding'; end if;
  if ad->>'xid'=pg_current_xact_id()::text then raise exception 'b8_committed_admission_required'; end if;
  if exists(select 1 from jsonb_each(h->'starts') x where not(h->'terminals' ? x.key) or x.value->>'admission'=subject::text) then raise exception 'b8_admission_used_or_unresolved'; end if;
  d:=jsonb_build_object('admission',subject);
 else
  st:=h->'starts'->subject::text; ad:=h->'admissions'->(st->>'admission');
  if st is null or h->'terminals' ? subject::text then raise exception 'b8_start_terminal_or_missing'; end if;
  if st->>'xid'=pg_current_xact_id()::text then raise exception 'b8_committed_start_required'; end if;
  if ad->>'authorization' is distinct from au->>'id' then raise exception 'b8_selected_envelope_changed'; end if;
  d:=jsonb_build_object('start',subject,'target',c->'target','operation','advance_one','delta',1,'observation',ecb8.observation(h));
 end if;
 eid:=ecb8.event(s,a,h,operation,d,request);
 return jsonb_build_object('event',eid,'replayed',false,'effect_count',case when operation='effect' then 1 else 0 end);
end $$;

create function ecb8.fixture_event(s uuid,a uuid,k text,d jsonb,p uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare h jsonb; eid uuid; begin
 if k not in ('tick','ready','dependency','revoke_grant','withdraw') then raise exception 'b8_fixture_event_kind'; end if;
 perform ecb8.lock_scope(s); h:=ecb8.history(s,a); perform ecb8.expected(h,p);
 eid:=ecb8.event(s,a,h,k,d,gen_random_uuid()); perform ecb8.history(s,a); return eid;
end $$;

create function ecb8.ack(s uuid,a uuid,start_id uuid,reported_terminal uuid,received boolean,p uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare h jsonb; begin
 perform ecb8.lock_scope(s); h:=ecb8.history(s,a); perform ecb8.expected(h,p);
 if not(h->'starts' ? start_id::text) then raise exception 'b8_ack_start_required'; end if;
 return ecb8.event(s,a,h,'ack',jsonb_build_object('start',start_id,'reported_terminal',reported_terminal,'received',received),gen_random_uuid());
end $$;

-- E2/E3: a single NOWAIT acquisition is the declared bounded observation
-- attempt (zero waiting). It changes no lifecycle state and cannot starve an
-- executor by queueing repeated readers. Only explicit reconcile may fence.
create function ecb8.inspect(s uuid,a uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare h jsonb; disposition text; retained jsonb; r record; begin
 begin perform ecb8.lock_scope(s,true);
 exception when lock_not_available then return jsonb_build_object('status','UNKNOWN / IN_FLIGHT','retry','HOLD','fence',null,'observation_bound','one NOWAIT scope-lock attempt'); end;
 begin
  h:=ecb8.history(s,a);
  if jsonb_array_length(h->'effects')>0 then disposition:='EFFECT_ESTABLISHED';
  elsif exists(select 1 from jsonb_each(h->'starts') x where not(h->'terminals' ? x.key)) then disposition:='RECONCILE_REQUIRED';
  else disposition:='NO_EFFECT_ESTABLISHED'; end if;
  -- Return exact retained bytes over the declared bounded read surface. The
  -- fresh-process reader independently hashes and follows the exact closure.
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'role',artifact_role,'context',context_id,'bytes',payload_text,
    'digest',encode(payload_digest,'hex'),'xid',created_xid::text)),'[]') into retained
    from public.artifacts where (artifact_role like 'b8_%' and context_id=s) or id in (
     select dep.key::uuid from public.artifacts ct cross join lateral jsonb_each(ct.payload_text::jsonb->'required') dep
     where ct.artifact_role='b8_basis' and ct.context_id=s and ct.payload_text::jsonb->>'kind'='contract');
  return jsonb_build_object('status',disposition,'retry',case when disposition='NO_EFFECT_ESTABLISHED' then 'FRESH_ADMISSION_REQUIRED' else 'HOLD' end,
   'history',h,'retained',retained,'current_orientation',(select current_event from ecb7.scopes where id=s),'boundary','complete bounded history under exact shared scope lock',
   'proof_class','atomic-ledger synthetic target only');
 exception when others then return jsonb_build_object('status','UNKNOWN','retry','HOLD','reason',sqlerrm); end;
end $$;

do $$ declare r record; begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb8' loop
  execute format('alter function %s owner to ecb8_owner',r.signature);
 end loop;
end $$;
revoke all on all functions in schema ecb8 from public,anon,authenticated,service_role;
grant execute on function ecb8.fixture(uuid,uuid,jsonb,uuid),ecb8.fixture_event(uuid,uuid,text,jsonb,uuid) to postgres;
grant execute on function ecb8.propose(uuid,uuid,text) to service_role;
grant execute on function ecb8.qualify(uuid,uuid,uuid,uuid,uuid) to ecb8_evaluator;
grant execute on function ecb8.authorize(uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid),ecb8.control(uuid,uuid,text,uuid,uuid,uuid) to ecb8_executor;
grant execute on function ecb8.inspect(uuid,uuid) to ecb8_executor,ecb8_observer,ecb8_evaluator;
grant execute on function ecb8.ack(uuid,uuid,uuid,uuid,boolean,uuid) to ecb8_observer;
