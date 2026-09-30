-- ECO-213 execution/ordinary boundaries. No scheduler or credentials are activated.
begin;
alter table public.claims drop constraint claims_predicate_vocabulary;
alter table public.claims add constraint claims_predicate_vocabulary check(predicate is null or predicate in
  ('depends_on','located_in','member_of','part_of','reported_inventory','recurring_use','reported_by','supports','contradicts'));

create function ecb_circulation.native_records(p_id uuid) returns jsonb language plpgsql set search_path=''
as $$ declare t record; v jsonb; out jsonb:='[]';begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    join pg_attribute a on a.attrelid=c.oid and a.attname='id' and not a.attisdropped
    where n.nspname='ecb_circulation' and c.relkind='r' and c.relname<>'execution_credentials' order by c.relname loop
    execute format('select to_jsonb(x) from ecb_circulation.%I x where id=$1',t.relname) into v using p_id;
    if v is not null then out:=out||jsonb_build_array(jsonb_build_object('native_type',t.relname,'record',v));end if;
  end loop;return out;
end $$;
create function ecb_circulation.referent_digest(p_id uuid) returns text language plpgsql set search_path=''
as $$ declare v jsonb; s text;begin
  if exists(select 1 from public.thoughts where id=p_id) then return encode(public.thought_revision_digest(p_id),'hex');end if;
  select content into s from public.text_artifacts where id=p_id;
  if found then return ecb_circulation.sha(s);end if;
  select to_jsonb(c)||jsonb_build_object('evidence',coalesce((select jsonb_agg(to_jsonb(e) order by e.id) from public.evidence_links e where e.claim_id=c.id),'[]'),
    'standing_history',coalesce((select jsonb_agg(to_jsonb(t) order by t.id) from public.claim_standing_transitions t where t.claim_id=c.id),'[]'),
    'context',coalesce((select jsonb_agg(to_jsonb(x) order by x.id) from ecb_circulation.claim_contexts x where x.claim_id=c.id),'[]'))
    into v from public.claims c where c.id=p_id;
  if found then return ecb_circulation.sha(v::text);end if;
  select to_jsonb(u)||jsonb_build_object('carrier',ecb_circulation.carrier_text(u.carrier_id),
    'anchors',coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from ecb_circulation.source_anchors a where a.unit_id=u.id),'[]'),
    'participants',coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from ecb_circulation.unit_participants a where a.unit_id=u.id),'[]'))
    into v from ecb_circulation.semantic_units u where u.id=p_id;
  if found then return ecb_circulation.sha(v::text);end if;
  v:=ecb_circulation.native_records(p_id);
  if v='[]' then raise exception 'eco213_digest_basis_unavailable';end if;
  if exists(select 1 from ecb_circulation.composition_accounts where id=p_id) then
    v:=v||jsonb_build_array(jsonb_build_object('members',(select jsonb_agg(to_jsonb(m) order by m.id) from ecb_circulation.composition_members m where m.account_id=p_id)));
  end if;
  return ecb_circulation.sha(v::text);
end $$;
create function ecb_circulation.evidence_digest(p_id uuid) returns bytea language sql set search_path=''
as $$ select decode(ecb_circulation.referent_digest(p_id),'hex') $$;
alter table public.evidence_links drop constraint evidence_links_revision_scheme_v1;
alter table public.evidence_links add constraint evidence_links_revision_scheme_v1 check(evidence_revision_scheme in
  ('ecb_thought_revision_v1_sha256','eco213_text_utf8_sha256','eco213_unit_anchor_v1_sha256'));
create or replace function public.prepare_evidence_link() returns trigger language plpgsql security definer set search_path=''
as $$ begin
  if exists(select 1 from public.thoughts where id=new.evidence_referent_id) then
    new.evidence_revision_scheme:='ecb_thought_revision_v1_sha256';
  elsif exists(select 1 from public.text_artifacts where id=new.evidence_referent_id) then
    new.evidence_revision_scheme:='eco213_text_utf8_sha256';
  elsif exists(select 1 from ecb_circulation.semantic_units where id=new.evidence_referent_id) then
    new.evidence_revision_scheme:='eco213_unit_anchor_v1_sha256';
  else raise exception 'eco213_unsupported_evidence_carrier';end if;
  new.evidence_revision_digest:=ecb_circulation.evidence_digest(new.evidence_referent_id);
  insert into public.referents(id) values(new.id);new.role:='used_as_basis';new.linked_at:=transaction_timestamp();return new;
end $$;
-- Preserve all prior standing checks; replace only its Thought-specific resolver.
do $$ declare d text;begin
  select pg_get_functiondef('public.prepare_claim_standing_transition()'::regprocedure) into d;
  if position('public.thought_revision_digest(basis_evidence_referent_id)' in d)=0 then raise exception 'eco213_standing_checker_drift';end if;
  execute replace(d,'public.thought_revision_digest(basis_evidence_referent_id)','ecb_circulation.evidence_digest(basis_evidence_referent_id)');
end $$;

create function ecb_circulation.check_anchor() returns trigger language plpgsql set search_path=''
as $$ declare raw bytea; source ecb_circulation.source_occurrences; unit_source uuid;begin
  select * into strict source from ecb_circulation.source_occurrences where id=new.source_id;
  select d.source_id into strict unit_source from ecb_circulation.semantic_units u join ecb_circulation.decompositions d on d.id=u.decomposition_id where u.id=new.unit_id;
  if unit_source<>source.id or (new.carrier_id<>source.carrier_id and new.carrier_id is distinct from source.original_carrier_id) then raise exception 'eco213_anchor_source_mismatch';end if;
  raw:=convert_to(ecb_circulation.carrier_text(new.carrier_id),'UTF8');
  if new.byte_end>octet_length(raw) or substring(raw from new.byte_start+1 for new.byte_end-new.byte_start)<>convert_to(new.excerpt,'UTF8')
    or new.digest<>ecb_circulation.sha(new.excerpt) then raise exception 'eco213_anchor_mismatch';end if;return new;
end $$;
create trigger anchor_check before insert on ecb_circulation.source_anchors for each row execute function ecb_circulation.check_anchor();

create function ecb_circulation.check_lease(p_attempt uuid,p_fence bigint,p_worker text,p_revision uuid)
returns ecb_circulation.activities language plpgsql set search_path=''
as $$ declare a ecb_circulation.activities; h ecb_circulation.processing_heads; w ecb_circulation.work_accounts;s ecb_circulation.source_occurrences;begin
  select x.* into strict a from ecb_circulation.activities x join ecb_circulation.attempts t on t.activity_id=x.id
    where t.id=p_attempt and t.executor=p_worker and t.fence=p_fence;
  select * into strict h from ecb_circulation.processing_heads where activity_id=a.id for update;
  if h.status<>'leased' or h.attempt_id<>p_attempt or h.fence<>p_fence or h.lease_until<=clock_timestamp() then raise exception 'eco213_stale_fence';end if;
  select * into strict w from ecb_circulation.work_accounts where id=a.work_id;
  if w.remit_revision_id<>p_revision then raise exception 'eco213_worker_scope_denied';end if;
  select * into strict s from ecb_circulation.source_occurrences where id=a.source_id;
  perform ecb_circulation.assert_remit(p_revision,p_worker,s.origin,s.locator,'execute');return a;
end $$;
create function ecb_circulation.index_subject(p_subject uuid,p_work uuid,p_text text,p_edition text) returns void language sql set search_path=''
as $$ insert into ecb_circulation.semantic_representations(subject_id,work_id,basis_digest,edition,content)
 values(p_subject,p_work,ecb_circulation.referent_digest(p_subject),p_edition,p_text) $$;

create function public.eco213_lease() returns jsonb language plpgsql security definer set search_path=''
as $$ declare c ecb_circulation.execution_credentials; msg record; a ecb_circulation.activities; h ecb_circulation.processing_heads;
  w ecb_circulation.work_accounts;s ecb_circulation.source_occurrences;m ecb_circulation.mechanism_editions; t uuid:=gen_random_uuid(); ctx jsonb; subjects jsonb; missing jsonb; total integer;begin
  c:=ecb_circulation.assert_worker();
  insert into ecb_circulation.liveness_observations(observer,event,basis,expires_at)
    values(c.worker,'wake','{}',clock_timestamp()+interval '10 minutes');
  for msg in select * from pgmq.read('eco213',120,1) loop
    select * into strict a from ecb_circulation.activities where id=(msg.message->>'activity_id')::uuid;
    select * into strict h from ecb_circulation.processing_heads where activity_id=a.id for update;
    if h.status in ('complete','failed','blocked') then perform pgmq.archive('eco213',msg.msg_id);continue;end if;
    select * into strict w from ecb_circulation.work_accounts where id=a.work_id;
    select * into strict s from ecb_circulation.source_occurrences where id=a.source_id;
    if w.remit_revision_id<>c.remit_revision_id then perform pgmq.set_vt('eco213',msg.msg_id,60);return jsonb_build_object('status','scope_mismatch');end if;
    perform ecb_circulation.assert_remit(c.remit_revision_id,c.worker,s.origin,s.locator,'execute');
    -- A crashed reserved attempt has an unknown external outcome, not automatic retry authority.
    if h.status='leased' and h.lease_until<=clock_timestamp()
      and exists(select 1 from ecb_circulation.spend_reservations where attempt_id=h.attempt_id)
      and not exists(select 1 from ecb_circulation.attempt_outcomes where attempt_id=h.attempt_id) then
      insert into ecb_circulation.attempt_outcomes(attempt_id,outcome,failure_code,raw_carrier_id,provider_basis)
        values(h.attempt_id,'failed','provider_outcome_ambiguous',ecb_circulation.artifact(''),
          jsonb_build_object('dispatch','UNKNOWN','outcome','UNKNOWN','reservation_retained',true,'automatic_regeneration',false));
      update ecb_circulation.processing_heads set status='blocked',failure_code='provider_outcome_ambiguous',lease_until=null where activity_id=a.id;
      perform pgmq.archive('eco213',msg.msg_id);
      return jsonb_build_object('status','blocked','activity_id',a.id,'failure_code','provider_outcome_ambiguous');
    end if;
    select * into strict m from ecb_circulation.mechanism_editions where id=a.mechanism_id;
    h.fence:=h.fence+1;h.lease_until:=clock_timestamp()+interval '120 seconds';
    insert into ecb_circulation.attempts(id,activity_id,fence,executor,role,started_at,lease_until)
      values(t,a.id,h.fence,c.worker,'scheduled_executor',clock_timestamp(),h.lease_until);
    update ecb_circulation.processing_heads set status='leased',fence=h.fence,attempt_id=t,lease_until=h.lease_until where activity_id=a.id;
    select count(*) into total from ecb_circulation.activity_outputs where activity_id in(select id from ecb_circulation.activities
      where (work_id=w.id or work_id=w.predecessor_id) and (source_id=s.id or id=a.predecessor_id));
    select coalesce(jsonb_agg(to_jsonb(x)),'[]') into ctx from
      (select o.*,ecb_circulation.carrier_text(o.carrier_id) as bundle from ecb_circulation.activity_outputs o
       join ecb_circulation.activities aa on aa.id=o.activity_id
       where (aa.work_id=w.id or aa.work_id=w.predecessor_id) and (aa.source_id=s.id or aa.id=a.predecessor_id)
       order by o.created_at desc,o.id limit 60) x;
    select coalesce(jsonb_agg(to_jsonb(x)),'[]') into subjects from
      (select distinct on(subject_id) subject_id,basis_digest,content from ecb_circulation.semantic_representations where work_id=w.id order by subject_id,created_at desc limit 60)x;
    select coalesce(jsonb_agg(to_jsonb(x)),'[]') into missing from
      (select distinct on(r.subject_id) r.id,r.subject_id,r.content from ecb_circulation.semantic_representations r where r.work_id=w.id and r.vector is null
       and r.basis_digest=ecb_circulation.referent_digest(r.subject_id)
       and not exists(select 1 from ecb_circulation.semantic_representations v where v.subject_id=r.subject_id and v.basis_digest=r.basis_digest and v.vector is not null)
       order by r.subject_id,r.created_at desc limit 10)x;
    return jsonb_build_object('status','leased','attempt_id',t,'fence',h.fence,'lease_until',h.lease_until,
      'activity',to_jsonb(a),'work',to_jsonb(w),'source',to_jsonb(s)||jsonb_build_object('text',ecb_circulation.carrier_text(s.carrier_id),
        'original_text',case when s.original_carrier_id is null then null else ecb_circulation.carrier_text(s.original_carrier_id) end,
        'envelope',case when s.envelope_carrier_id is null then null else ecb_circulation.carrier_text(s.envelope_carrier_id)::jsonb end),
      'mechanism',to_jsonb(m),'remit',(select to_jsonb(r) from ecb_circulation.remit_revisions r where id=c.remit_revision_id),
      'context_outputs',ctx,'context_subjects',subjects,'missing_representations',missing,
      'context_coverage',jsonb_build_object('total_outputs',total,'returned_outputs',jsonb_array_length(ctx),'complete_outputs',total<=60,
        'subject_limit',60,'complete_subjects',(select count(distinct subject_id)<=60 from ecb_circulation.semantic_representations where work_id=w.id)));
  end loop;return jsonb_build_object('status','idle');
end $$;
create function public.eco213_reserve(p_attempt uuid,p_fence bigint,p_usd numeric,p_input integer,p_output integer,p_tariff jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$ declare c ecb_circulation.execution_credentials;r ecb_circulation.remit_revisions; v ecb_circulation.spend_reservations;n integer;cost numeric;begin
  c:=ecb_circulation.assert_worker();perform pg_advisory_xact_lock(hashtextextended(c.remit_revision_id::text,214));
  perform ecb_circulation.check_lease(p_attempt,p_fence,c.worker,c.remit_revision_id);
  select * into strict r from ecb_circulation.remit_revisions where id=c.remit_revision_id;
  select * into v from ecb_circulation.spend_reservations where attempt_id=p_attempt;
  if found then
    if (v.worst_usd,v.input_bound,v.output_bound,v.tariff) is distinct from (p_usd,p_input,p_output,p_tariff) then raise exception 'eco213_reservation_conflict';end if;
    return jsonb_build_object('reservation_id',v.id,'replayed',true,'dispatch_permitted',false);
  end if;
  select count(*),coalesce(sum(worst_usd),0) into n,cost from ecb_circulation.spend_reservations where remit_revision_id=r.id;
  if p_usd is null or p_usd<0 or p_input is null or p_input<1 or p_output is null or p_output<1
    or p_tariff is null or not p_tariff?'model' or n>=r.max_requests or cost+p_usd>r.max_usd or p_input>r.max_input or p_output>r.max_output then raise exception 'eco213_budget_denied';end if;
  insert into ecb_circulation.spend_reservations(attempt_id,remit_revision_id,worst_usd,tariff,input_bound,output_bound)
    values(p_attempt,r.id,p_usd,p_tariff,p_input,p_output) returning id into v.id;
  return jsonb_build_object('reservation_id',v.id,'replayed',false,'dispatch_permitted',true);
end $$;

create function ecb_circulation.commit_output(p_attempt uuid,p_fence bigint,p_executor text,p_revision uuid,p_bundle jsonb,p_provider jsonb,p_role text)
returns jsonb language plpgsql set search_path=''
as $$ declare a ecb_circulation.activities;s ecb_circulation.source_occurrences;w ecb_circulation.work_accounts;
 m ecb_circulation.mechanism_editions;o ecb_circulation.activity_outputs;d uuid;u uuid;cl uuid;ca uuid; item jsonb; an jsonb; p jsonb; rid uuid;
 handle_map jsonb:='{}'; rep ecb_circulation.semantic_representations; continuation uuid; actual_provider jsonb:=coalesce(p_provider,'{}');begin
  if not exists(select 1 from ecb_circulation.attempts t join ecb_circulation.activities aa on aa.id=t.activity_id join ecb_circulation.work_accounts ww on ww.id=aa.work_id
    where t.id=p_attempt and t.executor=p_executor and ww.remit_revision_id=p_revision) then raise exception 'eco213_worker_scope_denied';end if;
  select * into o from ecb_circulation.activity_outputs where attempt_id=p_attempt;
  if found then if o.digest<>ecb_circulation.sha(p_bundle::text) then raise exception 'eco213_output_conflict';end if;return jsonb_build_object('output_id',o.id,'replayed',true);end if;
  a:=ecb_circulation.check_lease(p_attempt,p_fence,p_executor,p_revision);
  select * into strict s from ecb_circulation.source_occurrences where id=a.source_id;
  select * into strict w from ecb_circulation.work_accounts where id=a.work_id;
  select * into strict m from ecb_circulation.mechanism_editions where id=a.mechanism_id;
  if p_role='scheduled_executor' and a.kind<>'embed' and not exists(select 1 from ecb_circulation.spend_reservations where attempt_id=p_attempt) then raise exception 'eco213_dispatch_unreserved';end if;
  insert into ecb_circulation.activity_outputs(activity_id,attempt_id,carrier_id,digest,kind,producer_role)
    values(a.id,p_attempt,ecb_circulation.artifact(p_bundle::text),ecb_circulation.sha(p_bundle::text),a.kind,p_role) returning * into o;
  if a.kind in ('differentiate','reinspect') then
    if jsonb_typeof(p_bundle->'units')<>'array' or coalesce(jsonb_array_length(p_bundle->'units'),0)<1 then raise exception 'eco213_empty_decomposition';end if;
    insert into ecb_circulation.decompositions(output_id,source_id,resolution,context,omissions,losses,questions)
      values(o.id,s.id,p_bundle->>'resolution',p_bundle->'context',p_bundle->'omissions',p_bundle->'losses',p_bundle->'questions') returning id into d;
    for item in select value from jsonb_array_elements(p_bundle->'units') loop
      if jsonb_array_length(item->'anchors')<1 or jsonb_array_length(item->'participants')<1 then raise exception 'eco213_unit_context_missing';end if;
      insert into ecb_circulation.semantic_units(decomposition_id,carrier_id,handle,subject_id,subject_status,modality,polarity,attribution,conditions)
        values(d,ecb_circulation.artifact(item->>'text'),item->>'handle',nullif(item->>'subject_id','')::uuid,
          item->>'subject_status',item->>'modality',item->>'polarity',item->>'attribution',item->'conditions') returning id into u;
      handle_map:=handle_map||jsonb_build_object(item->>'handle',u);
      for p in select value from jsonb_array_elements(item->'participants') loop
        insert into ecb_circulation.unit_participants(unit_id,role,mention,subject_id,identity_status)
          values(u,p->>'role',p->>'mention',nullif(p->>'subject_id','')::uuid,p->>'identity_status');
      end loop;
      for an in select value from jsonb_array_elements(item->'anchors') loop
        insert into ecb_circulation.source_anchors(unit_id,source_id,carrier_id,byte_start,byte_end,excerpt,digest)
          values(u,s.id,(an->>'carrier_id')::uuid,(an->>'byte_start')::int,(an->>'byte_end')::int,an->>'excerpt',ecb_circulation.sha(an->>'excerpt'));
      end loop;
      insert into public.claims(proposition,scope) values(item->>'text','ECO-213 work '||w.id) returning id into cl;
      insert into public.evidence_links(claim_id,evidence_referent_id) values(cl,u);
      insert into ecb_circulation.claim_contexts(claim_id,unit_id,output_id,work_id,modality,attribution,conditions)
        values(cl,u,o.id,w.id,item->>'modality',item->>'attribution',item->'conditions');
      perform ecb_circulation.index_subject(u,w.id,item->>'text',m.id::text);
      perform ecb_circulation.index_subject(cl,w.id,item->>'text',m.id::text);
    end loop;
    for item in select value from jsonb_array_elements(p_bundle->'relations') loop
      if not handle_map?(item->>'subject_handle') or not handle_map?(item->>'object_handle') then raise exception 'eco213_relation_handle_unavailable';end if;
      insert into public.claims(scope,claim_kind,subject_referent_id,predicate,object_referent_id)
        values('ECO-213 work '||w.id,'relation',(handle_map->>(item->>'subject_handle'))::uuid,item->>'predicate',(handle_map->>(item->>'object_handle'))::uuid) returning id into cl;
      insert into public.evidence_links(claim_id,evidence_referent_id) values(cl,(handle_map->>(item->>'subject_handle'))::uuid);
      insert into ecb_circulation.claim_contexts(claim_id,output_id,work_id,modality,attribution,conditions)
        values(cl,o.id,w.id,'reported',item->>'reason','[]');
      perform ecb_circulation.index_subject(cl,w.id,item->>'reason',m.id::text);
    end loop;
    continuation:=nullif(m.config->>'assessment_mechanism_id','')::uuid;
  elsif a.kind='assess' then
    if p_bundle->>'verdict' not in ('SATISFIED','UNSATISFIED','UNKNOWN') then raise exception 'eco213_assessment_invalid';end if;
    if jsonb_typeof(p_bundle->'coverage') is distinct from 'object'
      or not (p_bundle->'coverage') ?& array['participants','modality','polarity','conditions','attribution','dependencies']
      or (select count(*) from jsonb_object_keys(p_bundle->'coverage'))<>6
      or exists(select 1 from jsonb_each_text(p_bundle->'coverage') where value not in ('SATISFIED','UNSATISFIED','UNKNOWN'))
      or jsonb_typeof(p_bundle->'unresolved') is distinct from 'array' then raise exception 'eco213_assessment_coverage_missing';end if;
    if p_bundle->>'verdict'='SATISFIED' then
      if exists(select 1 from jsonb_each_text(p_bundle->'coverage') where value<>'SATISFIED')
        or jsonb_array_length(p_bundle->'unresolved')>0 then raise exception 'eco213_assessment_false_satisfied';end if;
      continuation:=nullif(m.config->>'composition_mechanism_id','')::uuid;
    end if;
  elsif a.kind='compose' then
    if jsonb_array_length(p_bundle->'members')<1 or jsonb_array_length(p_bundle->'old_dependency_review')<1
      or jsonb_array_length(p_bundle->'destination_disclosure')<1 then raise exception 'eco213_composition_context_missing';end if;
    insert into ecb_circulation.composition_accounts(output_id,work_id,focal_id,organizing_criterion,carrier_id,old_dependency_review,destination_disclosure,unresolved,reinspection_questions)
      values(o.id,w.id,w.focal_id,p_bundle->>'criterion',ecb_circulation.artifact(p_bundle->>'account'),p_bundle->'old_dependency_review',p_bundle->'destination_disclosure',p_bundle->'unresolved',p_bundle->'reinspection_questions') returning id into ca;
    for item in select value from jsonb_array_elements(p_bundle->'members') loop
      rid:=(item->>'referent_id')::uuid;
      if not exists(select 1 from ecb_circulation.semantic_representations where subject_id=rid and work_id=w.id)
        and not exists(select 1 from ecb_circulation.activity_outputs oo join ecb_circulation.activities aa on aa.id=oo.activity_id where aa.work_id=w.id and oo.id=rid) then raise exception 'eco213_composition_member_scope';end if;
      insert into ecb_circulation.composition_members(account_id,constituent_id,reason,basis_digest)
        values(ca,rid,item->>'reason',ecb_circulation.referent_digest(rid));
    end loop;
    if p_bundle->>'predecessor_id' is not null then
      if not exists(select 1 from ecb_circulation.composition_accounts prior where prior.id=(p_bundle->>'predecessor_id')::uuid
        and prior.focal_id=w.focal_id and (prior.work_id=w.id or prior.work_id=w.predecessor_id)) then raise exception 'eco213_lineage_scope_denied';end if;
      insert into ecb_circulation.account_lineage(predecessor_id,successor_id,activity_id,relation,reason)
        values((p_bundle->>'predecessor_id')::uuid,ca,a.id,p_bundle->>'lineage_relation',p_bundle->>'lineage_reason');
    end if;
    perform ecb_circulation.index_subject(ca,w.id,p_bundle->>'account',m.id::text);
  elsif a.kind='embed' then
    for item in select value from jsonb_array_elements(p_bundle->'representations') loop
      select * into strict rep from ecb_circulation.semantic_representations where id=(item->>'representation_id')::uuid and work_id=w.id;
      if rep.basis_digest<>ecb_circulation.referent_digest(rep.subject_id) then raise exception 'eco213_representation_basis_stale';end if;
      if jsonb_array_length(item->'vector')<>384 then raise exception 'eco213_embedding_dimensions';end if;
      insert into ecb_circulation.semantic_representations(subject_id,work_id,basis_digest,edition,content,vector,model)
        values(rep.subject_id,w.id,rep.basis_digest,m.id::text,rep.content,(item->'vector')::text::extensions.vector,'gte-small');
    end loop;
  end if;
  if p_bundle->>'repairs_output_id' is not null then
    if not exists(select 1 from ecb_circulation.activity_outputs prior join ecb_circulation.activities aa on aa.id=prior.activity_id
      where prior.id=(p_bundle->>'repairs_output_id')::uuid and (aa.work_id=w.id or aa.work_id=w.predecessor_id)) then raise exception 'eco213_lineage_scope_denied';end if;
    insert into ecb_circulation.account_lineage(predecessor_id,successor_id,activity_id,relation,reason)
      values((p_bundle->>'repairs_output_id')::uuid,o.id,a.id,'repair',p_bundle->>'repair_reason');
  end if;
  insert into ecb_circulation.attempt_outcomes(attempt_id,outcome,raw_carrier_id,provider_basis)
    values(p_attempt,'complete',ecb_circulation.artifact(coalesce(actual_provider->>'raw_output',p_bundle::text)),actual_provider-'raw_output');
  if continuation is not null then perform ecb_circulation.enqueue(gen_random_uuid(),w.id,s.id,continuation,a.actor,a.id);end if;
  if a.kind<>'embed' and m.config->>'embedding_mechanism_id' is not null then
    perform ecb_circulation.enqueue(gen_random_uuid(),w.id,s.id,(m.config->>'embedding_mechanism_id')::uuid,a.actor,a.id);
  end if;
  update ecb_circulation.processing_heads set status='complete',lease_until=null where activity_id=a.id;
  perform pgmq.archive('eco213',(select message_id from ecb_circulation.processing_heads where activity_id=a.id));
  return jsonb_build_object('output_id',o.id,'account_id',ca,'decomposition_id',d,'replayed',false);
end $$;
create function public.eco213_finish(p_attempt uuid,p_fence bigint,p_bundle jsonb,p_provider jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$ declare c ecb_circulation.execution_credentials;begin
  c:=ecb_circulation.assert_worker();return ecb_circulation.commit_output(p_attempt,p_fence,c.worker,c.remit_revision_id,p_bundle,p_provider,'scheduled_executor');end $$;
create function public.eco213_fail(p_attempt uuid,p_fence bigint,p_code text,p_transient boolean,p_provider jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$ declare c ecb_circulation.execution_credentials;a ecb_circulation.activities;n integer;retry boolean;delay integer;begin
  c:=ecb_circulation.assert_worker();a:=ecb_circulation.check_lease(p_attempt,p_fence,c.worker,c.remit_revision_id);
  select count(*) into n from ecb_circulation.attempts where activity_id=a.id;retry:=p_transient and n<=3;
  delay:=case n when 1 then 60 when 2 then 300 else 900 end;
  insert into ecb_circulation.attempt_outcomes(attempt_id,outcome,failure_code,raw_carrier_id,provider_basis)
    values(p_attempt,case when retry then 'retry' else 'failed' end,p_code,ecb_circulation.artifact(coalesce(p_provider->>'raw_output','')),p_provider-'raw_output');
  update ecb_circulation.processing_heads set status=case when retry then 'pending' else 'failed' end,
    failure_code=p_code,lease_until=null,due_at=clock_timestamp()+make_interval(secs=>delay) where activity_id=a.id;
  if retry then perform pgmq.set_vt('eco213',(select message_id from ecb_circulation.processing_heads where activity_id=a.id),delay);
    else perform pgmq.archive('eco213',(select message_id from ecb_circulation.processing_heads where activity_id=a.id));end if;
  return jsonb_build_object('status',case when retry then 'retry' else 'failed' end,'failure_code',p_code);
end $$;
create function ecb_circulation.recover(p_work uuid default null) returns jsonb language plpgsql set search_path=''
as $$ declare v jsonb;begin
  select to_jsonb(x) into v from (select observer,event,basis,observed_at,expires_at,
    case when expires_at<=clock_timestamp() then 'EXPIRED' else 'CURRENT' end as observation_basis
    from ecb_circulation.liveness_observations where event='observer' order by observed_at desc limit 1)x;
  return jsonb_build_object('contract_version','eco213-v1','cue','In ECOS circulation, recover the assimilation capability and continue its permitted work.',
    'access',jsonb_build_object('RECOVER',jsonb_build_array('discover_capability','recover_work','fetch_referent','traverse_structure','search_structure','inspect_processing'),
      'PRESERVE',jsonb_build_array('capture_thought','record_derivation','compose_account','record_observation'),
      'TRANSITION',jsonb_build_array('request_processing','assimilate_corpus','reconcile_use')),
    'authority_note','Capability access does not authorize a source, work, provider, current-use or policy effect; exact remit applies.',
    'remits',coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('enabled',h.enabled,'expired',r.expires_at<=clock_timestamp()))
      from ecb_circulation.remit_revisions r join ecb_circulation.remit_heads h on h.revision_id=r.id),'[]'),
    'work',coalesce((select jsonb_agg(to_jsonb(w)||jsonb_build_object('epoch',ecb_circulation.sha(to_jsonb(w)::text))) from ecb_circulation.work_accounts w where p_work is null or w.id=p_work),'[]'),
    'mechanisms',coalesce((select jsonb_agg(to_jsonb(m)) from ecb_circulation.mechanism_editions m),'[]'),
    'processing',coalesce((select jsonb_agg(to_jsonb(h)||jsonb_build_object('activity',to_jsonb(a),'lease_expired',h.lease_until<=clock_timestamp(),
      'attempts',(select jsonb_agg(to_jsonb(t)||jsonb_build_object('outcome',(select to_jsonb(o) from ecb_circulation.attempt_outcomes o where o.attempt_id=t.id),
        'evidence_observations',(select jsonb_agg(to_jsonb(e)) from ecb_circulation.attempt_observations e where e.attempt_id=t.id))) from ecb_circulation.attempts t where t.activity_id=a.id)))
      from ecb_circulation.activities a join ecb_circulation.processing_heads h on h.activity_id=a.id where p_work is null or a.work_id=p_work),'[]'),
    'use_bindings',coalesce((select jsonb_agg(to_jsonb(h)||jsonb_build_object('assessment',to_jsonb(a),'basis_current',
      a.work_epoch=ecb_circulation.sha(to_jsonb(w)::text) and a.verdict='SATISFIED'
      and exists(select 1 from ecb_circulation.remit_heads rh join ecb_circulation.remit_revisions r on r.id=rh.revision_id where r.id=a.remit_revision_id and rh.enabled and r.expires_at>clock_timestamp())
      and not exists(select 1 from ecb_circulation.dependency_bases b where b.assessment_id=a.id and
        (b.digest<>ecb_circulation.referent_digest(b.subject_id) or b.work_epoch<>a.work_epoch))))
      from ecb_circulation.use_heads h join ecb_circulation.use_assessments a on a.id=h.assessment_id join ecb_circulation.work_accounts w on w.id=h.work_id where p_work is null or w.id=p_work),'[]'),
    'corpus_coverage',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('preserved_items',(select count(*) from ecb_circulation.corpus_members cm where cm.corpus_id=c.id),
      'items',(select jsonb_agg(to_jsonb(cm)||jsonb_build_object('processing',(select jsonb_agg(to_jsonb(h)) from ecb_circulation.activities a join ecb_circulation.processing_heads h on h.activity_id=a.id where a.source_id=cm.source_id))) from ecb_circulation.corpus_members cm where cm.corpus_id=c.id))) from ecb_circulation.corpus_editions c),'[]'),
    'liveness',coalesce(v,jsonb_build_object('observation_basis','UNKNOWN')));
end $$;

create function ecb_circulation.reconcile(p jsonb,p_actor text) returns jsonb language plpgsql set search_path=''
as $$ declare w ecb_circulation.work_accounts; ca ecb_circulation.composition_accounts; old uuid; new_id uuid:=gen_random_uuid(); epoch text; d text;
 req jsonb; b jsonb; replay ecb_circulation.use_assessments;begin
  select * into strict w from ecb_circulation.work_accounts where id=(p->>'work_id')::uuid;
  perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,null,null,'reconcile');
  select * into strict ca from ecb_circulation.composition_accounts where id=(p->>'account_id')::uuid and work_id=w.id;
  perform pg_advisory_xact_lock(hashtextextended(w.id::text||':'||(p->>'use_key'),215));
  d:=ecb_circulation.sha((p||jsonb_build_object('actor',p_actor))::text);
  select * into replay from ecb_circulation.use_assessments where operation_id=(p->>'operation_id')::uuid;
  if found then if replay.request_digest<>d then raise exception 'eco213_operation_conflict';end if;return jsonb_build_object('assessment_id',replay.id,'replayed',true);end if;
  select assessment_id into old from ecb_circulation.use_heads where work_id=w.id and use_key=p->>'use_key';
  if old is distinct from nullif(p->>'expected_predecessor_id','')::uuid then raise exception 'eco213_use_predecessor_conflict';end if;
  epoch:=ecb_circulation.sha(to_jsonb(w)::text);
  if p->>'work_epoch' is distinct from epoch then raise exception 'eco213_mixed_epoch';end if;
  if not exists(select 1 from jsonb_array_elements(p->'requirements') x where x->>'direction'='old_dependency')
    or not exists(select 1 from jsonb_array_elements(p->'requirements') x where x->>'direction'='destination_discovery') then raise exception 'eco213_two_sided_review_required';end if;
  if p->>'verdict'='SATISFIED' and (p->'coverage'->>'declared_complete' is distinct from 'true'
    or exists(select 1 from jsonb_array_elements(p->'requirements') x where (x->>'blocking')::boolean and x->>'disposition' is distinct from 'SATISFIED')) then raise exception 'eco213_blocking_requirement';end if;
  if coalesce(jsonb_array_length(p->'dependencies'),0)<1
    or not exists(select 1 from jsonb_array_elements(p->'dependencies') x where x->>'subject_id'=ca.id::text)
    or exists(select 1 from ecb_circulation.composition_members cm where cm.account_id=ca.id and not exists(select 1 from jsonb_array_elements(p->'dependencies') x where x->>'subject_id'=cm.constituent_id::text))
    then raise exception 'eco213_dependency_coverage_missing';end if;
  for b in select value from jsonb_array_elements(p->'dependencies') loop
    if b->>'work_epoch' is distinct from epoch or b->>'digest' is distinct from ecb_circulation.referent_digest((b->>'subject_id')::uuid) then raise exception 'eco213_dependency_basis_stale';end if;
  end loop;
  insert into ecb_circulation.use_assessments(id,operation_id,request_digest,work_id,use_key,account_id,predecessor_id,remit_revision_id,work_epoch,coverage,authority_basis,checker_basis,actor,verdict)
    values(new_id,(p->>'operation_id')::uuid,d,w.id,p->>'use_key',ca.id,old,w.remit_revision_id,epoch,p->'coverage',p->>'authority_basis',p->'checker_basis',p_actor,p->>'verdict');
  for req in select value from jsonb_array_elements(p->'requirements') loop
    insert into ecb_circulation.requirement_dispositions(assessment_id,requirement,direction,blocking,disposition,basis)
      values(new_id,req->>'requirement',req->>'direction',(req->>'blocking')::boolean,req->>'disposition',req->'basis');
  end loop;
  for b in select value from jsonb_array_elements(p->'dependencies') loop
    insert into ecb_circulation.dependency_bases(assessment_id,subject_id,digest,work_epoch,role)
      values(new_id,(b->>'subject_id')::uuid,b->>'digest',epoch,b->>'role');
  end loop;
  insert into ecb_circulation.use_heads(work_id,use_key,assessment_id) values(w.id,p->>'use_key',new_id)
    on conflict(work_id,use_key) do update set assessment_id=excluded.assessment_id;
  return jsonb_build_object('assessment_id',new_id,'replayed',false);
end $$;

create function public.eco213_dispatch(p_operation text,p_payload jsonb,p_actor text) returns jsonb
language plpgsql security definer set search_path=''
as $$ declare p jsonb:=p_payload; w ecb_circulation.work_accounts; s ecb_circulation.source_occurrences;
 m ecb_circulation.mechanism_editions; src uuid; carrier uuid; original uuid; envelope uuid; corpus ecb_circulation.corpus_editions;
 activity uuid; op uuid; record_id uuid; v jsonb; d text; r record; h ecb_circulation.processing_heads; att uuid; item jsonb; reps jsonb; total integer; represented integer;begin
  perform ecb11.assert_runtime_key();
  if p_actor is null or length(p_actor)=0 then raise exception 'eco213_actor_missing';end if;
  if p_operation in ('discover_capability','recover_work','inspect_processing') then
    return ecb_circulation.recover(nullif(p->>'work_id','')::uuid);
  elsif p_operation='fetch_referent' then
    record_id:=(p->>'referent_id')::uuid;
    if not exists(select 1 from public.referents where id=record_id) then return jsonb_build_object('status','not_encountered');end if;
    v:=ecb_circulation.native_records(record_id);
    return jsonb_build_object('referent_id',record_id,'native_records',v,
      'thought',(select to_jsonb(t)-'embedding' from public.thoughts t where id=record_id),
      'artifact',(select to_jsonb(t) from public.text_artifacts t where id=record_id),
      'claim',(select to_jsonb(t) from public.claims t where id=record_id),
      'evidence',(select jsonb_agg(to_jsonb(t)) from public.evidence_links t where claim_id=record_id),
      'standing_history',(select jsonb_agg(to_jsonb(t)) from public.claim_standing_transitions t where claim_id=record_id),
      'basis_digest',case when v<>'[]' or exists(select 1 from public.thoughts where id=record_id) or exists(select 1 from public.text_artifacts where id=record_id) or exists(select 1 from public.claims where id=record_id) then ecb_circulation.referent_digest(record_id) else null end);
  elsif p_operation='traverse_structure' then
    record_id:=(p->>'referent_id')::uuid;
    return jsonb_build_object('referent_id',record_id,
      'claims',(select jsonb_agg(to_jsonb(c)) from public.claims c where subject_referent_id=record_id or object_referent_id=record_id),
      'evidence',(select jsonb_agg(to_jsonb(c)) from public.evidence_links c where evidence_referent_id=record_id or claim_id=record_id),
      'anchors',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.source_anchors c where unit_id=record_id or source_id=record_id or carrier_id=record_id),
      'memberships',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.composition_members c where account_id=record_id or constituent_id=record_id),
      'lineage',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.account_lineage c where predecessor_id=record_id or successor_id=record_id),
      'inputs',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.activity_inputs c where activity_id=record_id or subject_id=record_id),
      'outputs',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.activity_outputs c where activity_id=record_id),
      'situated_observations',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.observations c where subject_id=record_id),
      'participants',(select jsonb_agg(to_jsonb(c)) from ecb_circulation.unit_participants c where unit_id=record_id or subject_id=record_id),
      'discovery_limit','Encountered native edges are not complete destination discovery or world truth.');
  elsif p_operation='search_structure' then
    select count(distinct (subject_id,work_id)),count(distinct (subject_id,work_id)) filter(where vector is not null
      and basis_digest=ecb_circulation.referent_digest(subject_id)) into total,represented from ecb_circulation.semantic_representations
      where p->>'work_id' is null or work_id=(p->>'work_id')::uuid;
    with latest as (select distinct on(subject_id,work_id) * from ecb_circulation.semantic_representations order by subject_id,work_id,created_at desc,id desc),
      matches as (select subject_id,work_id,basis_digest,edition,content,model,vector is not null as vector_ready,
        basis_digest=ecb_circulation.referent_digest(subject_id) as basis_current,
        ts_rank(lexical,plainto_tsquery('simple',coalesce(p->>'query',''))) as lexical_rank,
        case when p->'query_embedding' is not null and p->'query_embedding'<>'null' and vector is not null
          and basis_digest=ecb_circulation.referent_digest(subject_id) then 1-(vector OPERATOR(extensions.<=>) (p->'query_embedding')::text::extensions.vector) else null end as semantic_similarity
      from latest where (p->>'work_id' is null or work_id=(p->>'work_id')::uuid))
    select coalesce(jsonb_agg(to_jsonb(x)),'[]') into v from (select * from matches where lexical_rank>0 or semantic_similarity is not null
      order by coalesce(semantic_similarity,0)+lexical_rank desc,subject_id limit least(greatest(coalesce((p->>'limit')::int,10),1),50)) x;
    return jsonb_build_object('results',v,'coverage',jsonb_build_object('total_subjects',total,'represented_subjects',represented,'missing_vectors',total-represented,
      'lexical_available',true,'semantic_query_available',p->'query_embedding' is not null and p->'query_embedding'<>'null','degraded',represented<total),
      'interpretation','Candidates require exact fetch and situated reliance; score is not authority.');
  end if;
  if p_operation='reconcile_use' then return ecb_circulation.reconcile(p,p_actor);end if;
  if p_operation not in ('trusted_capture','assimilate_corpus','request_processing','record_derivation','compose_account','record_observation') then raise exception 'eco213_operation_not_permitted';end if;
  op:=(p->>'operation_id')::uuid;
  if op is null then raise exception 'eco213_operation_id_required';end if;
  perform pg_advisory_xact_lock(hashtextextended(op::text,213));
  if p_operation='request_processing' and p->'work' is not null then
    item:=p->'work';
    perform ecb_circulation.assert_remit((item->>'remit_revision_id')::uuid,p_actor,null,null,'process');
    select * into w from ecb_circulation.work_accounts where id=(item->>'id')::uuid;
    if not found then
      insert into ecb_circulation.work_accounts(id,focal_id,whole_id,remit_revision_id,predecessor_id,point_of_view,noticed_contrast,boundary,orientation,frame,question,intended_use,process_coordinate,return_route,created_by)
        values((item->>'id')::uuid,(item->>'focal_id')::uuid,nullif(item->>'whole_id','')::uuid,(item->>'remit_revision_id')::uuid,nullif(item->>'predecessor_id','')::uuid,
          item->>'point_of_view',item->>'noticed_contrast',item->>'boundary',item->>'orientation',item->>'frame',item->>'question',item->>'intended_use',item->'process_coordinate',item->>'return_route',p_actor) returning * into w;
      for v in select value from jsonb_array_elements(coalesce(item->'parts','[]')) loop
        insert into ecb_circulation.work_parts(work_id,constituent_id,role) values(w.id,(v->>'referent_id')::uuid,v->>'role');
      end loop;
      if w.predecessor_id is not null then insert into ecb_circulation.account_lineage(predecessor_id,successor_id,relation,reason)
        values(w.predecessor_id,w.id,'reseating',item->>'reseating_reason');end if;
    elsif w.created_by<>p_actor or (to_jsonb(w)-'created_at'-'created_by') is distinct from (item-'parts'-'reseating_reason') then raise exception 'eco213_work_identity_conflict';end if;
  else select * into strict w from ecb_circulation.work_accounts where id=(p->>'work_id')::uuid;end if;
  if p_operation='record_observation' then
    perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,null,null,'observe');
    d:=ecb_circulation.sha((p||jsonb_build_object('actor',p_actor))::text);
    select id,request_digest into r from ecb_circulation.observations where operation_id=op;
    if found then if r.request_digest<>d then raise exception 'eco213_operation_conflict';end if;return jsonb_build_object('observation_id',r.id,'replayed',true);end if;
    insert into ecb_circulation.observations(operation_id,request_digest,subject_id,work_id,mapper,method_edition,result_carrier_id,time_basis,frame,resolution,purpose,conditions,unknowns,kind,quantity,unit,instrument_id,tare,calibration,uncertainty)
      values(op,d,(p->>'subject_id')::uuid,w.id,p_actor,p->>'method_edition',ecb_circulation.artifact((p->'result')::text),p->'time_basis',p->>'frame',p->>'resolution',p->>'purpose',p->'conditions',p->'unknowns',p->>'kind',
        (p->>'quantity')::numeric,p->>'unit',nullif(p->>'instrument_id','')::uuid,p->'tare',p->'calibration',p->'uncertainty') returning id into record_id;
    for item in select value from jsonb_array_elements(coalesce(p->'participants','[]')) loop
      insert into ecb_circulation.observation_participants(observation_id,subject_id,role) values(record_id,(item->>'subject_id')::uuid,item->>'role');
    end loop;return jsonb_build_object('observation_id',record_id,'replayed',false,'standing_effect','none');
  end if;
  select * into strict m from ecb_circulation.mechanism_editions where id=(p->>'mechanism_id')::uuid;
  if p_operation='trusted_capture' then
    if m.kind<>'differentiate' then raise exception 'eco213_capture_mechanism_mismatch';end if;
    perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,'native:capture',null,'capture');
    select * into strict r from public.ecb11_capture_thought(op,p->>'content',p->>'source',(p->>'captured_at')::timestamptz,p->>'producer_context',nullif(p->>'parent_receipt_id','')::uuid);
    select id into src from ecb_circulation.source_occurrences where origin='native:capture' and locator=r.thought_id::text;
    if not found then insert into ecb_circulation.source_occurrences(carrier_id,origin,locator,edition,digest,time_basis,media)
      values(r.thought_id,'native:capture',r.thought_id::text,r.captured_at::text,ecb_circulation.sha(r.content),jsonb_build_object('captured_at',r.captured_at,'basis','declared_capture_time'),'text/utf8') returning id into src;end if;
    activity:=ecb_circulation.enqueue(op,w.id,src,m.id,p_actor);
    return jsonb_build_object('capture',to_jsonb(r),'source_occurrence_id',src,'processing',jsonb_build_object('activity_id',activity,'admission','committed'));
  elsif p_operation='assimilate_corpus' then
    item:=p->'envelope';
    if not item?&array['id','content','original_content','metadata','source_id','status','created_at','updated_at'] then raise exception 'eco213_corpus_envelope_incomplete';end if;
    perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,'legacy:lqbrzoicorehwidkdhoi',item->>'id','assimilate');
    if m.kind<>'differentiate' then raise exception 'eco213_corpus_mechanism_mismatch';end if;
    d:=ecb_circulation.sha(p->>'envelope_bytes');
    if (p->>'envelope_bytes')::jsonb is distinct from item or d is distinct from p->>'envelope_digest' then raise exception 'eco213_export_digest_mismatch';end if;
    select * into strict corpus from ecb_circulation.corpus_editions where id=(p->>'corpus_id')::uuid;
    if not (ecb_circulation.carrier_text(corpus.manifest_carrier_id)::jsonb->'items')@>jsonb_build_array(jsonb_build_object('id',item->>'id','digest',d)) then raise exception 'eco213_manifest_member_mismatch';end if;
    select source_id into src from ecb_circulation.corpus_members where corpus_id=corpus.id and legacy_id=(item->>'id')::uuid;
    if found then
      if (select digest from ecb_circulation.source_occurrences where id=src)<>d then raise exception 'eco213_corpus_member_conflict';end if;
    else
      carrier:=ecb_circulation.artifact(item->>'content');original:=ecb_circulation.artifact(coalesce(item->>'original_content',''));
      envelope:=ecb_circulation.artifact(p->>'envelope_bytes');
      insert into ecb_circulation.source_occurrences(carrier_id,original_carrier_id,envelope_carrier_id,origin,locator,edition,digest,time_basis,media)
        values(carrier,original,envelope,'legacy:lqbrzoicorehwidkdhoi',item->>'id',item->>'updated_at',d,
          jsonb_build_object('created_at',item->'created_at','updated_at',item->'updated_at','export_basis',corpus.export_basis),'application/json') returning id into src;
      insert into ecb_circulation.corpus_members(corpus_id,source_id,legacy_id) values(corpus.id,src,(item->>'id')::uuid);
    end if;
    activity:=ecb_circulation.enqueue(op,w.id,src,m.id,p_actor);return jsonb_build_object('source_occurrence_id',src,'activity_id',activity,'processing','admitted','standing_effect','none');
  end if;
  src:=(p->>'source_id')::uuid;
  if p_operation='request_processing' then
    activity:=ecb_circulation.enqueue(op,w.id,src,m.id,p_actor,nullif(p->>'predecessor_activity_id','')::uuid);
    return jsonb_build_object('activity_id',activity,'work_id',w.id,'processing','admitted');
  end if;
  if (p_operation='compose_account' and m.kind<>'compose') or (p_operation='record_derivation' and m.kind not in ('differentiate','reinspect')) then raise exception 'eco213_mechanism_mismatch';end if;
  perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,null,null,'preserve_output');
  activity:=ecb_circulation.enqueue(op,w.id,src,m.id,p_actor);
  select * into strict h from ecb_circulation.processing_heads where activity_id=activity for update;
  if h.status='complete' then
    select * into strict r from ecb_circulation.activity_outputs where activity_id=activity;
    if r.digest<>ecb_circulation.sha((p->'bundle')::text) then raise exception 'eco213_output_conflict';end if;return jsonb_build_object('output_id',r.id,'replayed',true);
  end if;
  if h.status<>'pending' then raise exception 'eco213_processing_busy';end if;
  att:=gen_random_uuid();
  insert into ecb_circulation.attempts(id,activity_id,fence,executor,role,started_at,lease_until)
    values(att,activity,h.fence+1,p_actor,'interactive_producer',clock_timestamp(),clock_timestamp()+interval '120 seconds');
  update ecb_circulation.processing_heads set status='leased',fence=h.fence+1,attempt_id=att,lease_until=clock_timestamp()+interval '120 seconds' where activity_id=activity;
  return ecb_circulation.commit_output(att,h.fence+1,p_actor,w.remit_revision_id,p->'bundle',jsonb_build_object('producer',p_actor,'provider_dispatch',false),'interactive_producer');
end $$;

revoke all on all functions in schema ecb_circulation from public,anon,authenticated,service_role;
revoke all on function public.eco213_lease(), public.eco213_reserve(uuid,bigint,numeric,integer,integer,jsonb),
 public.eco213_finish(uuid,bigint,jsonb,jsonb), public.eco213_fail(uuid,bigint,text,boolean,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.eco213_lease(), public.eco213_reserve(uuid,bigint,numeric,integer,integer,jsonb),
 public.eco213_finish(uuid,bigint,jsonb,jsonb), public.eco213_fail(uuid,bigint,text,boolean,jsonb) to anon;
revoke all on function public.eco213_dispatch(text,jsonb,text) from public,anon,authenticated,service_role;
grant execute on function public.eco213_dispatch(text,jsonb,text) to anon;
commit;
