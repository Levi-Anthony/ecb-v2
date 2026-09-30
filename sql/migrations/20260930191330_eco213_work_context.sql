-- CLI-created identity: Supabase 2.118.0, Actions run 36764134123.
-- Bind structural work constituents to recovered/current/use and queued execution bases.
-- Prior activities without a captured situated_work basis block; no history is rewritten.
begin;

create or replace function ecb_circulation.work_epoch(p_work uuid) returns text language sql stable set search_path=''
as $$ select ecb_circulation.sha((to_jsonb(w)||jsonb_build_object('parts',
  coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from ecb_circulation.work_parts p where p.work_id=w.id),'[]'::jsonb)))::text)
  from ecb_circulation.work_accounts w where w.id=p_work $$;

CREATE OR REPLACE FUNCTION ecb_circulation.recover(p_work uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ declare v jsonb;begin
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
    'work',coalesce((select jsonb_agg(to_jsonb(w)||jsonb_build_object('epoch',ecb_circulation.work_epoch(w.id),
      'parts',coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from ecb_circulation.work_parts p where p.work_id=w.id),'[]')))
      from ecb_circulation.work_accounts w where p_work is null or w.id=p_work),'[]'),
    'mechanisms',coalesce((select jsonb_agg(to_jsonb(m)) from ecb_circulation.mechanism_editions m),'[]'),
    'processing',coalesce((select jsonb_agg(to_jsonb(h)||jsonb_build_object('activity',to_jsonb(a),'lease_expired',h.lease_until<=clock_timestamp(),
      'attempts',(select jsonb_agg(to_jsonb(t)||jsonb_build_object('outcome',(select to_jsonb(o) from ecb_circulation.attempt_outcomes o where o.attempt_id=t.id),
        'evidence_observations',(select jsonb_agg(to_jsonb(e)) from ecb_circulation.attempt_observations e where e.attempt_id=t.id))) from ecb_circulation.attempts t where t.activity_id=a.id)))
      from ecb_circulation.activities a join ecb_circulation.processing_heads h on h.activity_id=a.id where p_work is null or a.work_id=p_work),'[]'),
    'use_bindings',coalesce((select jsonb_agg(to_jsonb(h)||jsonb_build_object('assessment',to_jsonb(a),'basis_current',
      a.work_epoch=ecb_circulation.work_epoch(w.id) and a.verdict='SATISFIED'
      and exists(select 1 from ecb_circulation.remit_heads rh join ecb_circulation.remit_revisions r on r.id=rh.revision_id where r.id=a.remit_revision_id and rh.enabled and r.expires_at>clock_timestamp())
      and not exists(select 1 from ecb_circulation.dependency_bases b where b.assessment_id=a.id and
        (b.digest<>ecb_circulation.referent_digest(b.subject_id) or b.work_epoch<>a.work_epoch))))
      from ecb_circulation.use_heads h join ecb_circulation.use_assessments a on a.id=h.assessment_id join ecb_circulation.work_accounts w on w.id=h.work_id where p_work is null or w.id=p_work),'[]'),
    'corpus_coverage',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('preserved_items',(select count(*) from ecb_circulation.corpus_members cm where cm.corpus_id=c.id),
      'items',(select jsonb_agg(to_jsonb(cm)||jsonb_build_object('processing',(select jsonb_agg(to_jsonb(h)) from ecb_circulation.activities a join ecb_circulation.processing_heads h on h.activity_id=a.id where a.source_id=cm.source_id))) from ecb_circulation.corpus_members cm where cm.corpus_id=c.id))) from ecb_circulation.corpus_editions c),'[]'),
    'liveness',coalesce(v,jsonb_build_object('observation_basis','UNKNOWN')));
end $function$;


CREATE OR REPLACE FUNCTION ecb_circulation.reconcile(p jsonb, p_actor text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ declare w ecb_circulation.work_accounts; ca ecb_circulation.composition_accounts; old uuid; new_id uuid:=gen_random_uuid(); epoch text; d text;
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
  epoch:=ecb_circulation.work_epoch(w.id);
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
end $function$;


CREATE OR REPLACE FUNCTION ecb_circulation.referent_digest(p_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ declare v jsonb; s text;begin
  if exists(select 1 from ecb_circulation.work_accounts where id=p_id) then return ecb_circulation.work_epoch(p_id);end if;
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
end $function$;


CREATE OR REPLACE FUNCTION ecb_circulation.enqueue(p_operation uuid, p_work uuid, p_source uuid, p_mechanism uuid, p_actor text, p_predecessor uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ declare a ecb_circulation.activities; w ecb_circulation.work_accounts; s ecb_circulation.source_occurrences;
  m ecb_circulation.mechanism_editions; d text; v uuid:=gen_random_uuid(); msg bigint; begin
  select * into strict w from ecb_circulation.work_accounts where id=p_work;
  select * into strict s from ecb_circulation.source_occurrences where id=p_source;
  select * into strict m from ecb_circulation.mechanism_editions where id=p_mechanism;
  perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,s.origin,s.locator,'process');
  if p_predecessor is not null and not exists(select 1 from ecb_circulation.activities prior where prior.id=p_predecessor
    and (prior.work_id=w.id or prior.work_id=w.predecessor_id)) then raise exception 'eco213_predecessor_scope_denied';end if;
  d:=ecb_circulation.sha(jsonb_build_array(p_work,p_source,p_mechanism,p_actor,p_predecessor)::text);
  perform pg_advisory_xact_lock(hashtextextended(p_operation::text,213));
  select * into a from ecb_circulation.activities where operation_id=p_operation;
  if found then if a.request_digest<>d then raise exception 'eco213_operation_conflict';end if;return a.id;end if;
  insert into ecb_circulation.activities(id,operation_id,request_digest,work_id,source_id,mechanism_id,predecessor_id,kind,actor)
    values(v,p_operation,d,p_work,p_source,p_mechanism,p_predecessor,m.kind,p_actor);
  insert into ecb_circulation.activity_inputs(activity_id,subject_id,digest,role) values(v,s.id,s.digest,'source');
  insert into ecb_circulation.activity_inputs(activity_id,subject_id,digest,role) values(v,w.id,ecb_circulation.work_epoch(w.id),'situated_work');
  if p_predecessor is not null then insert into ecb_circulation.activity_inputs(activity_id,subject_id,digest,role)
    values(v,p_predecessor,ecb_circulation.referent_digest(p_predecessor),'predecessor activity');end if;
  select pgmq.send('eco213',jsonb_build_object('activity_id',v)) into msg;
  insert into ecb_circulation.processing_heads(activity_id,message_id,status) values(v,msg,'pending'); return v;
end $function$;


CREATE OR REPLACE FUNCTION ecb_circulation.check_lease(p_attempt uuid, p_fence bigint, p_worker text, p_revision uuid)
 RETURNS ecb_circulation.activities
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ declare a ecb_circulation.activities; h ecb_circulation.processing_heads; w ecb_circulation.work_accounts;s ecb_circulation.source_occurrences;begin
  select x.* into strict a from ecb_circulation.activities x join ecb_circulation.attempts t on t.activity_id=x.id
    where t.id=p_attempt and t.executor=p_worker and t.fence=p_fence;
  select * into strict h from ecb_circulation.processing_heads where activity_id=a.id for update;
  if h.status<>'leased' or h.attempt_id<>p_attempt or h.fence<>p_fence or h.lease_until<=clock_timestamp() then raise exception 'eco213_stale_fence';end if;
  select * into strict w from ecb_circulation.work_accounts where id=a.work_id;
  if w.remit_revision_id<>p_revision then raise exception 'eco213_worker_scope_denied';end if;
  if not exists(select 1 from ecb_circulation.activity_inputs i where i.activity_id=a.id and i.subject_id=w.id
    and i.role='situated_work' and i.digest=ecb_circulation.work_epoch(w.id)) then raise exception 'eco213_work_basis_stale';end if;
  select * into strict s from ecb_circulation.source_occurrences where id=a.source_id;
  perform ecb_circulation.assert_remit(p_revision,p_worker,s.origin,s.locator,'execute');return a;
end $function$;


CREATE OR REPLACE FUNCTION public.eco213_lease()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare c ecb_circulation.execution_credentials; msg record; a ecb_circulation.activities; h ecb_circulation.processing_heads;
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
    if not exists(select 1 from ecb_circulation.activity_inputs i where i.activity_id=a.id and i.subject_id=w.id
      and i.role='situated_work' and i.digest=ecb_circulation.work_epoch(w.id)) then
      update ecb_circulation.processing_heads set status='blocked',failure_code='work_basis_stale',lease_until=null where activity_id=a.id;
      perform pgmq.archive('eco213',msg.msg_id);
      return jsonb_build_object('status','blocked','activity_id',a.id,'failure_code','work_basis_stale');
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
      'activity',to_jsonb(a),'work',to_jsonb(w)||jsonb_build_object('epoch',ecb_circulation.work_epoch(w.id),
        'parts',coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from ecb_circulation.work_parts p where p.work_id=w.id),'[]')),'source',to_jsonb(s)||jsonb_build_object('text',ecb_circulation.carrier_text(s.carrier_id),
        'original_text',case when s.original_carrier_id is null then null else ecb_circulation.carrier_text(s.original_carrier_id) end,
        'envelope',case when s.envelope_carrier_id is null then null else ecb_circulation.carrier_text(s.envelope_carrier_id)::jsonb end),
      'mechanism',to_jsonb(m),'remit',(select to_jsonb(r) from ecb_circulation.remit_revisions r where id=c.remit_revision_id),
      'context_outputs',ctx,'context_subjects',subjects,'missing_representations',missing,
      'context_coverage',jsonb_build_object('total_outputs',total,'returned_outputs',jsonb_array_length(ctx),'complete_outputs',total<=60,
        'subject_limit',60,'complete_subjects',(select count(distinct subject_id)<=60 from ecb_circulation.semantic_representations where work_id=w.id)));
  end loop;return jsonb_build_object('status','idle');
end $function$;


CREATE OR REPLACE FUNCTION public.eco213_dispatch(p_operation text, p_payload jsonb, p_actor text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare p jsonb:=p_payload; w ecb_circulation.work_accounts; s ecb_circulation.source_occurrences;
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
      'work_parts',coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from ecb_circulation.work_parts c where c.work_id=record_id or c.constituent_id=record_id),'[]'),
      'thought',(select to_jsonb(t)-'embedding' from public.thoughts t where id=record_id),
      'artifact',(select to_jsonb(t) from public.text_artifacts t where id=record_id),
      'claim',(select to_jsonb(t) from public.claims t where id=record_id),
      'evidence',(select jsonb_agg(to_jsonb(t)) from public.evidence_links t where claim_id=record_id),
      'standing_history',(select jsonb_agg(to_jsonb(t)) from public.claim_standing_transitions t where claim_id=record_id),
      'basis_digest',case when v<>'[]' or exists(select 1 from public.thoughts where id=record_id) or exists(select 1 from public.text_artifacts where id=record_id) or exists(select 1 from public.claims where id=record_id) then ecb_circulation.referent_digest(record_id) else null end);
  elsif p_operation='traverse_structure' then
    record_id:=(p->>'referent_id')::uuid;
    return jsonb_build_object('referent_id',record_id,
      'work_parts',coalesce((select jsonb_agg(to_jsonb(c) order by c.id) from ecb_circulation.work_parts c where c.work_id=record_id or c.constituent_id=record_id),'[]'),
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
    elsif w.created_by<>p_actor or (to_jsonb(w)-'created_at'-'created_by') is distinct from (item-'parts'-'reseating_reason')
      or coalesce((select jsonb_agg(jsonb_build_object('referent_id',p.constituent_id,'role',p.role) order by p.constituent_id,p.role)
        from ecb_circulation.work_parts p where p.work_id=w.id),'[]'::jsonb)
        is distinct from coalesce((select jsonb_agg(v order by v->>'referent_id',v->>'role') from jsonb_array_elements(coalesce(item->'parts','[]'::jsonb)) v),'[]'::jsonb) then raise exception 'eco213_work_identity_conflict';end if;
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
end $function$;


revoke all on function ecb_circulation.work_epoch(uuid) from public, anon, authenticated, service_role;

commit;