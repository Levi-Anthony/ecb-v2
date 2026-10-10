-- Outcome-governed production cycle. Additive; no circulation/provider activation.
begin;
create schema ecb_workflow;
revoke all on schema ecb_workflow from public, anon, authenticated, service_role;

create table ecb_workflow.commissions (
  id uuid primary key references public.referents(id),
  authority_ref uuid not null references public.thoughts(id),
  scope text not null check(length(btrim(scope))>0),
  allowed_actors text[] not null check(cardinality(allowed_actors)>0),
  enabled boolean not null default true
);
create table ecb_workflow.cycles (
  id uuid primary key references public.referents(id),
  commission_id uuid not null references ecb_workflow.commissions(id),
  focal_ref uuid not null references public.referents(id),
  containing_ref uuid not null references public.referents(id),
  parent_id uuid references ecb_workflow.cycles(id),
  parent_obligation_id uuid,
  owner_issue text not null check(length(btrim(owner_issue))>0),
  outcome text not null check(length(btrim(outcome))>0),
  orientation text not null check(length(btrim(orientation))>0),
  boundary text not null check(length(btrim(boundary))>0),
  acceptance text not null check(length(btrim(acceptance))>0),
  edition text not null check(length(btrim(edition))>0),
  phase integer not null default 0 check(phase between 0 and 7),
  epoch integer not null default 1,
  version integer not null default 1,
  created_by text not null,
  created_at timestamptz not null default clock_timestamp(),
  changed_at timestamptz not null default clock_timestamp(),
  check((parent_id is null)=(parent_obligation_id is null)),
  check(parent_id is distinct from id)
);
create index workflow_roots_in_progress on ecb_workflow.cycles(commission_id)
  where parent_id is null and phase<7;
create index workflow_cycle_parent on ecb_workflow.cycles(parent_id);
create table ecb_workflow.obligations (
  id uuid primary key references public.referents(id),
  cycle_id uuid not null references ecb_workflow.cycles(id),
  stage integer not null check(stage between 0 and 6),
  requirement text not null check(length(btrim(requirement))>0),
  outcome_consequence text not null check(length(btrim(outcome_consequence))>0),
  criterion text not null check(length(btrim(criterion))>0),
  method_ref text not null check(length(btrim(method_ref))>0),
  validator_actor text not null check(length(btrim(validator_actor))>0),
  owner_route text not null check(length(btrim(owner_route))>0),
  independent boolean not null default false
);
alter table ecb_workflow.cycles add foreign key(parent_obligation_id) references ecb_workflow.obligations(id);
create index workflow_obligation_cycle on ecb_workflow.obligations(cycle_id,stage);
create table ecb_workflow.results (
  id uuid primary key references public.referents(id),
  obligation_id uuid not null references ecb_workflow.obligations(id),
  epoch integer not null,
  recorded_version integer not null,
  edition text not null,
  status text not null check(status in ('PASS','FAIL','UNKNOWN')),
  validator_actor text not null,
  executor_actor text not null check(length(btrim(executor_actor))>0),
  observation text not null check(length(btrim(observation))>0),
  evidence jsonb not null check(jsonb_typeof(evidence)='array'),
  valid_until timestamptz,
  observed_at timestamptz not null default clock_timestamp()
);
create index workflow_result_latest on ecb_workflow.results(obligation_id,recorded_version desc);
create table ecb_workflow.proposals (
  id uuid primary key references public.referents(id),
  cycle_id uuid not null references ecb_workflow.cycles(id),
  affected_obligation_id uuid not null references ecb_workflow.obligations(id),
  title text not null check(length(btrim(title))>0),
  salience text not null check(length(btrim(salience))>0),
  significance text not null check(length(btrim(significance))>0),
  importance text not null check(length(btrim(importance))>0),
  decision_consequence text not null check(length(btrim(decision_consequence))>0),
  omission_failure text not null check(length(btrim(omission_failure))>0),
  source_ref uuid not null references public.referents(id),
  disposition text check(disposition in ('REQUIRED','FUTURE','REJECTED','DUPLICATE')),
  decision jsonb,
  created_by text not null,
  decided_by text
);
create index workflow_proposal_cycle on ecb_workflow.proposals(cycle_id);
create table ecb_workflow.events (
  id uuid primary key references public.referents(id),
  cycle_id uuid not null references ecb_workflow.cycles(id),
  actor text not null,
  request_digest text not null,
  action text not null,
  payload jsonb not null,
  response jsonb not null,
  recorded_at timestamptz not null default clock_timestamp()
);
create index workflow_event_cycle on ecb_workflow.events(cycle_id,recorded_at);
create table ecb_workflow.observer_ticks (
  id uuid primary key references public.referents(id),
  observed_at timestamptz not null default clock_timestamp(),
  findings jsonb not null
);
create index workflow_tick_time on ecb_workflow.observer_ticks(observed_at desc);

-- Stable identity registration for every native inspectable subject.
create function ecb_workflow.register_identity() returns trigger language plpgsql
security invoker set search_path='' as $$ begin
  insert into public.referents(id) values(new.id); return new;
end $$;
do $$ declare t text; begin
  foreach t in array array['commissions','cycles','obligations','results','proposals','events','observer_ticks'] loop
    execute format('alter table ecb_workflow.%I enable row level security',t);
    execute format('revoke all on ecb_workflow.%I from public,anon,authenticated,service_role',t);
    execute format('create trigger register_identity before insert on ecb_workflow.%I for each row execute function ecb_workflow.register_identity()',t);
  end loop;
end $$;

create function ecb_workflow.stages() returns text[] language sql immutable
set search_path='' as $$ select array['plan','implement','verify','deploy','validate','metabolize','close','closed'] $$;
create function ecb_workflow.evidence_digest(p_id uuid) returns text language sql stable
set search_path='' as $$
  select encode(extensions.digest(convert_to(content,'UTF8'),'sha256'),'hex') from (
    select content from public.thoughts where id=p_id
    union all select content from public.text_artifacts where id=p_id
  ) s limit 1
$$;
create function ecb_workflow.paid(p_obligation uuid) returns boolean language sql stable
set search_path='' as $$
  select coalesce((select r.status='PASS' and r.epoch=c.epoch and r.edition=c.edition
    and (r.valid_until is null or r.valid_until>now())
    and not exists(select 1 from ecb_workflow.cycles child where child.parent_obligation_id=o.id and child.phase<7)
    from ecb_workflow.obligations o join ecb_workflow.cycles c on c.id=o.cycle_id
    join lateral(select * from ecb_workflow.results where obligation_id=o.id order by recorded_version desc limit 1) r on true
    where o.id=p_obligation),false)
$$;
create function ecb_workflow.inspect(p_cycle uuid) returns jsonb language plpgsql stable
set search_path='' as $$ declare c ecb_workflow.cycles; debt jsonb; proposals jsonb; children jsonb; tick timestamptz; due jsonb; nxt jsonb; child uuid; begin
  select * into strict c from ecb_workflow.cycles where id=p_cycle;
  with recursive family(id) as (select c.id union all select x.id from ecb_workflow.cycles x join family f on x.parent_id=f.id)
  select coalesce(jsonb_agg(to_jsonb(o)||jsonb_build_object('stage_name',(ecb_workflow.stages())[o.stage+1]) order by o.stage,o.id),'[]')
    into debt from ecb_workflow.obligations o where o.cycle_id in(select id from family) and not ecb_workflow.paid(o.id);
  with recursive family(id) as (select c.id union all select x.id from ecb_workflow.cycles x join family f on x.parent_id=f.id)
  select coalesce(jsonb_agg(to_jsonb(p) order by p.id),'[]') into proposals
    from ecb_workflow.proposals p where p.cycle_id in(select id from family) and p.disposition is null;
  with recursive family(id) as (select x.id from ecb_workflow.cycles x where x.parent_id=c.id union all select x.id from ecb_workflow.cycles x join family f on x.parent_id=f.id)
  select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'owner',x.owner_issue,'outcome',x.outcome,'phase',(ecb_workflow.stages())[x.phase+1])),'[]')
    into children from ecb_workflow.cycles x where x.id in(select id from family) and x.phase<7;
  select max(observed_at) into tick from ecb_workflow.observer_ticks;
  select to_jsonb(o) into due from ecb_workflow.obligations o where o.cycle_id=c.id and o.stage<=c.phase and not ecb_workflow.paid(o.id) order by o.stage,o.id limit 1;
  select id into child from ecb_workflow.cycles where parent_obligation_id=(due->>'id')::uuid and phase<7 order by created_at limit 1;
  if c.phase=7 and (jsonb_array_length(debt)>0 or jsonb_array_length(proposals)>0 or jsonb_array_length(children)>0) then
    nxt:=jsonb_build_object('action','reopen','cycle_id',c.id,'expected_version',c.version,'reason','Current evidence/dependency no longer supports closure.');
  elsif exists(select 1 from ecb_workflow.proposals where cycle_id=c.id and disposition is null) then
    nxt:=jsonb_build_object('action','decide','proposal',(select to_jsonb(p) from ecb_workflow.proposals p where cycle_id=c.id and disposition is null order by id limit 1));
  elsif child is not null then nxt:=jsonb_build_object('action','reenter_child','cycle_id',child,'return_obligation',due->>'id');
  elsif due is not null then nxt:=jsonb_build_object('action','fulfill','obligation',due,'cycle_id',c.id,'edition',c.edition,'expected_version',c.version);
  elsif c.phase<7 then nxt:=jsonb_build_object('action','advance','cycle_id',c.id,'expected_version',c.version);
  else nxt:=jsonb_build_object('action','observe','condition','Reopen on changed basis, failed result or new outcome-bearing debt.'); end if;
  return jsonb_build_object('contract','ecos:workflow-governance:1.0.0','cycle',to_jsonb(c),
    'phase',(ecb_workflow.stages())[c.phase+1],'debt',debt,'scope_decisions',proposals,'open_children',children,
    'zero_balance',c.phase=7 and jsonb_array_length(debt)=0 and jsonb_array_length(proposals)=0 and jsonb_array_length(children)=0,
    'next_action',nxt,
    'obligations',coalesce((select jsonb_agg(to_jsonb(o)||jsonb_build_object('paid',ecb_workflow.paid(o.id),'latest_result',(
      select to_jsonb(r) from ecb_workflow.results r where r.obligation_id=o.id order by recorded_version desc limit 1)) order by o.stage,o.id)
      from ecb_workflow.obligations o where cycle_id=c.id),'[]'),
    'routed_proposals',coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from ecb_workflow.proposals p where cycle_id=c.id and disposition is not null),'[]'),
    'monitor',jsonb_build_object('last_observed_at',tick,'health',case when tick>now()-interval '65 minutes' then 'CURRENT' else 'UNKNOWN' end),
    'events',coalesce((select jsonb_agg(to_jsonb(e) order by e.recorded_at) from (
      select id,actor,action,payload,recorded_at from ecb_workflow.events where cycle_id=c.id order by recorded_at desc limit 100) e),'[]'));
end $$;

create function ecb_workflow.add_obligation(p_cycle uuid,p_item jsonb) returns void language plpgsql
set search_path='' as $$ begin
  insert into ecb_workflow.obligations(id,cycle_id,stage,requirement,outcome_consequence,criterion,method_ref,validator_actor,owner_route,independent)
    values((p_item->>'id')::uuid,p_cycle,array_position(ecb_workflow.stages(),p_item->>'stage')-1,
    p_item->>'requirement',p_item->>'outcome_consequence',p_item->>'criterion',p_item->>'method_ref',
    p_item->>'validator_actor',p_item->>'owner_route',coalesce((p_item->>'independent')::boolean,false));
end $$;
create function ecb_workflow.requalify_parents(p_cycle uuid) returns void language plpgsql
set search_path='' as $$ declare parent uuid; begin
  select parent_id into parent from ecb_workflow.cycles where id=p_cycle;
  while parent is not null loop
    update ecb_workflow.cycles set phase=0,epoch=epoch+1,version=version+1,changed_at=clock_timestamp() where id=parent;
    select parent_id into parent from ecb_workflow.cycles where id=parent;
  end loop;
end $$;

-- All mutations pass the one transactional controller. Commission registration is admin-only.
create function ecb_workflow.command(p_action text,p_payload jsonb,p_actor text) returns jsonb language plpgsql
set search_path='' as $$
declare c ecb_workflow.cycles; parent ecb_workflow.cycles; k ecb_workflow.commissions;
  op uuid:=(p_payload->>'operation_id')::uuid; cid uuid:=(p_payload->>'cycle_id')::uuid;
  request_hash text:=encode(extensions.digest(convert_to(jsonb_build_object('action',p_action,'payload',p_payload,'actor',p_actor)::text,'UTF8'),'sha256'),'hex');
  prior ecb_workflow.events; o ecb_workflow.obligations; proposal ecb_workflow.proposals;
  item jsonb; answer jsonb; target_stage integer; total integer;
begin
  if op is null or cid is null or p_actor is null or length(btrim(p_actor))=0 then raise exception 'workflow_identity_required'; end if;
  -- Serialize the commission tree first, then operation identity; recursive repair cannot deadlock siblings.
  if p_action='create' then
    select * into strict k from ecb_workflow.commissions where id=(p_payload->>'commission_id')::uuid for update;
  else
    select commission_id into strict parent.commission_id from ecb_workflow.cycles where id=cid;
    select * into strict k from ecb_workflow.commissions where id=parent.commission_id for update;
  end if;
  if not k.enabled or not(p_actor=any(k.allowed_actors)) then raise exception 'workflow_actor_not_commissioned'; end if;
  perform pg_advisory_xact_lock(hashtextextended(op::text,0));
  select * into prior from ecb_workflow.events where id=op;
  if found then
    if prior.request_digest<>request_hash then raise exception 'workflow_operation_conflict'; end if;
    return prior.response||jsonb_build_object('replayed',true);
  end if;
  if p_action='create' then
    if p_payload->>'parent_id' is null and exists(select 1 from ecb_workflow.cycles where commission_id=k.id and parent_id is null and phase<7)
      then raise exception 'workflow_root_in_progress'; end if;
    if p_payload->>'parent_id' is not null then
      select * into strict parent from ecb_workflow.cycles where id=(p_payload->>'parent_id')::uuid for update;
      select * into strict o from ecb_workflow.obligations where id=(p_payload->>'parent_obligation_id')::uuid;
      if parent.commission_id<>k.id or parent.phase=7 or o.cycle_id<>parent.id
        or (p_payload->>'containing_ref')::uuid<>parent.focal_ref then raise exception 'workflow_child_binding_invalid'; end if;
    end if;
    insert into ecb_workflow.cycles(id,commission_id,focal_ref,containing_ref,parent_id,parent_obligation_id,owner_issue,outcome,orientation,boundary,acceptance,edition,created_by)
      values(cid,k.id,(p_payload->>'focal_ref')::uuid,(p_payload->>'containing_ref')::uuid,
      (p_payload->>'parent_id')::uuid,(p_payload->>'parent_obligation_id')::uuid,p_payload->>'owner_issue',p_payload->>'outcome',
      p_payload->>'orientation',p_payload->>'boundary',p_payload->>'acceptance',p_payload->>'edition',p_actor);
    for item in select value from jsonb_array_elements(p_payload->'obligations') loop perform ecb_workflow.add_obligation(cid,item); end loop;
    select count(distinct stage) into total from ecb_workflow.obligations where cycle_id=cid;
    if total<>7 then raise exception 'workflow_complete_plan_required'; end if;
    if p_payload->>'parent_id' is not null then perform ecb_workflow.requalify_parents(cid); end if;
  else
    select * into strict c from ecb_workflow.cycles where id=cid for update;
    if (p_payload->>'expected_version')::integer is distinct from c.version then raise exception 'workflow_version_conflict'; end if;
    if c.phase=7 and p_action<>'reopen' then raise exception 'workflow_closed_reopen_required'; end if;
    if p_action='result' then
      select * into strict o from ecb_workflow.obligations where id=(p_payload->>'obligation_id')::uuid;
      if o.cycle_id<>cid or p_actor<>o.validator_actor or p_payload->>'edition' is distinct from c.edition
        or p_payload->>'method_ref' is distinct from o.method_ref then raise exception 'workflow_result_binding_invalid'; end if;
      if o.stage>c.phase then raise exception 'workflow_stage_not_entered'; end if;
      if o.independent and p_actor=p_payload->>'executor_actor' then raise exception 'workflow_independent_validator_required'; end if;
      if p_payload->>'status'='PASS' and (jsonb_typeof(p_payload->'evidence') is distinct from 'array'
        or jsonb_array_length(p_payload->'evidence')=0) then raise exception 'workflow_pass_evidence_required'; end if;
      for item in select value from jsonb_array_elements(p_payload->'evidence') loop
        if ecb_workflow.evidence_digest((item->>'ref')::uuid) is null
          or ecb_workflow.evidence_digest((item->>'ref')::uuid) is distinct from item->>'digest'
          then raise exception 'workflow_evidence_unrecovered_or_changed'; end if;
      end loop;
      if (p_payload->>'valid_until')::timestamptz<=clock_timestamp() then raise exception 'workflow_evidence_already_expired'; end if;
      insert into ecb_workflow.results(id,obligation_id,epoch,recorded_version,edition,status,validator_actor,executor_actor,observation,evidence,valid_until)
        values(gen_random_uuid(),o.id,c.epoch,c.version+1,c.edition,p_payload->>'status',p_actor,p_payload->>'executor_actor',
        p_payload->>'observation',p_payload->'evidence',(p_payload->>'valid_until')::timestamptz);
      if p_payload->>'status'<>'PASS' then
        update ecb_workflow.cycles set phase=least(phase,o.stage) where id=cid;
        perform ecb_workflow.requalify_parents(cid);
      end if;
    elsif p_action='advance' then
      if exists(select 1 from ecb_workflow.obligations where cycle_id=cid and stage<=c.phase and not ecb_workflow.paid(id))
        then raise exception 'workflow_unpaid_obligation'; end if;
      if exists(select 1 from ecb_workflow.proposals where cycle_id=cid and disposition is null) then raise exception 'workflow_scope_decision_unresolved'; end if;
      if c.phase=6 and (
        jsonb_array_length(ecb_workflow.inspect(cid)->'debt')>0 or
        jsonb_array_length(ecb_workflow.inspect(cid)->'scope_decisions')>0 or
        jsonb_array_length(ecb_workflow.inspect(cid)->'open_children')>0)
        then raise exception 'workflow_collective_debt_remains'; end if;
      update ecb_workflow.cycles set phase=phase+1 where id=cid;
    elsif p_action='propose' then
      select * into strict o from ecb_workflow.obligations where id=(p_payload->>'affected_obligation_id')::uuid;
      if o.cycle_id<>cid or ecb_workflow.evidence_digest((p_payload->>'source_ref')::uuid) is null then raise exception 'workflow_proposal_binding_invalid'; end if;
      insert into ecb_workflow.proposals(id,cycle_id,affected_obligation_id,title,salience,significance,importance,decision_consequence,omission_failure,source_ref,created_by)
        values((p_payload->>'proposal_id')::uuid,cid,o.id,p_payload->>'title',p_payload->>'salience',p_payload->>'significance',p_payload->>'importance',
        p_payload->>'decision_consequence',p_payload->>'omission_failure',(p_payload->>'source_ref')::uuid,p_actor);
    elsif p_action='decide' then
      select * into strict proposal from ecb_workflow.proposals where id=(p_payload->>'proposal_id')::uuid for update;
      if proposal.cycle_id<>cid or proposal.disposition is not null then raise exception 'workflow_proposal_decision_conflict'; end if;
      if length(btrim(coalesce(p_payload->>'reason','')))=0 or length(btrim(coalesce(p_payload->>'affected_old_support','')))=0
        or length(btrim(coalesce(p_payload->>'destination_obligations','')))=0 then raise exception 'workflow_two_sided_reconciliation_required'; end if;
      if p_payload->>'disposition'='REQUIRED' then
        perform ecb_workflow.add_obligation(cid,p_payload->'obligation');
        target_stage:=array_position(ecb_workflow.stages(),p_payload->'obligation'->>'stage')-1;
        update ecb_workflow.cycles set phase=least(phase,target_stage) where id=cid;
        perform ecb_workflow.requalify_parents(cid);
      elsif p_payload->>'disposition'='FUTURE' then
        if length(btrim(coalesce(p_payload->>'owner_route','')))=0 or length(btrim(coalesce(p_payload->>'reentry_trigger','')))=0
          or length(btrim(coalesce(p_payload->>'no_current_acceptance_effect','')))=0 then raise exception 'workflow_future_route_required'; end if;
      elsif p_payload->>'disposition'='DUPLICATE' then
        if not exists(select 1 from ecb_workflow.obligations where id=(p_payload->>'duplicate_obligation_id')::uuid and cycle_id=cid)
          then raise exception 'workflow_duplicate_target_required'; end if;
      elsif p_payload->>'disposition' is distinct from 'REJECTED' then raise exception 'workflow_invalid_disposition'; end if;
      update ecb_workflow.proposals set disposition=p_payload->>'disposition',decision=p_payload,decided_by=p_actor where id=proposal.id;
    elsif p_action='reopen' then
      if length(btrim(coalesce(p_payload->>'reason','')))=0 or length(btrim(coalesce(p_payload->>'edition','')))=0 then raise exception 'workflow_reentry_required'; end if;
      update ecb_workflow.cycles set phase=0,epoch=epoch+1,edition=p_payload->>'edition' where id=cid;
      perform ecb_workflow.requalify_parents(cid);
    else raise exception 'workflow_unknown_action'; end if;
    update ecb_workflow.cycles set version=version+1,changed_at=clock_timestamp() where id=cid;
  end if;
  answer:=ecb_workflow.inspect(cid)||jsonb_build_object('operation_id',op,'replayed',false);
  insert into ecb_workflow.events(id,cycle_id,actor,request_digest,action,payload,response) values(op,cid,p_actor,request_hash,p_action,p_payload,answer);
  return answer;
end $$;

create function ecb_workflow.observe() returns jsonb language plpgsql set search_path='' as $$
declare findings jsonb; begin
  select jsonb_build_object('open_cycles',count(*) filter(where phase<7),
    'closed_with_current_debt',coalesce(jsonb_agg(id) filter(where phase=7 and not (ecb_workflow.inspect(id)->>'zero_balance')::boolean),'[]'),
    'unresolved_proposals',(select count(*) from ecb_workflow.proposals where disposition is null)) into findings from ecb_workflow.cycles;
  insert into ecb_workflow.observer_ticks(id,findings) values(gen_random_uuid(),findings);
  return findings;
end $$;

-- Narrow authenticated facade follows the existing ordinary runtime trust route.
create function public.ecb_workflow_command(p_action text,p_payload jsonb,p_actor text) returns jsonb
language plpgsql security definer set search_path='' as $$ begin
  perform ecb11.assert_runtime_key(); return ecb_workflow.command(p_action,p_payload,p_actor);
end $$;
create function public.ecb_workflow_inspect(p_cycle_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$ begin
  perform ecb11.assert_runtime_key();
  if p_cycle_id is not null then return ecb_workflow.inspect(p_cycle_id); end if;
  return jsonb_build_object('contract','ecos:workflow-governance:1.0.0','roots',coalesce((
    select jsonb_agg(ecb_workflow.inspect(id) order by created_at desc) from ecb_workflow.cycles where parent_id is null),'[]'));
end $$;
revoke all on all functions in schema ecb_workflow from public,anon,authenticated,service_role;
revoke all on function public.ecb_workflow_command(text,jsonb,text),public.ecb_workflow_inspect(uuid) from public,anon,authenticated,service_role;
grant execute on function public.ecb_workflow_command(text,jsonb,text),public.ecb_workflow_inspect(uuid) to anon,authenticated;
comment on schema ecb_workflow is 'Outcome-governed workflow debt and transitions. Named native/controller path only; attributable judgment is not semantic truth or universal enforcement.';
commit;
