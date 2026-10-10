-- Bounded positive/negative controls against the installed native controller.
-- The enclosing transaction rolls back fixtures; real system cycles remain untouched.
begin;
create function pg_temp.check_true(ok boolean,label text) returns void language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'TEST FAILED: %',label; end if;
end $$;
create function pg_temp.reject(action text,payload jsonb,actor text,expected text) returns void language plpgsql as $$ begin
  begin perform ecb_workflow.command(action,payload,actor);
    raise exception 'TEST FAILED: accepted %',expected;
  exception when others then if position(expected in sqlerrm)=0 then raise; end if; end;
end $$;
create function pg_temp.plan(cid uuid,commission uuid,focal uuid,whole uuid) returns jsonb language sql as $$
  select jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'commission_id',commission,'focal_ref',focal,
    'containing_ref',whole,'owner_issue','test-outcome','outcome','Bounded controller qualification','orientation','Complete and discriminate the controller contract',
    'boundary','Constructed test only','acceptance','Seven staged obligations plus all discovered debt and child returns','edition','test-v1',
    'obligations',(select jsonb_agg(jsonb_build_object('id',gen_random_uuid(),'stage',s,'requirement','Fulfill '||s,
      'outcome_consequence','Failure prevents bounded test closure','criterion','Recover exact test evidence at the entered stage',
      'method_ref','test-method-v1','validator_actor',case when s='verify' then 'checker' else 'worker' end,
      'owner_route','test-outcome','independent',s='verify')) from unnest(array['plan','implement','verify','deploy','validate','metabolize','close']) s))
$$;
create function pg_temp.pay(cid uuid,oid uuid,evidence uuid,actor text default 'worker') returns jsonb language plpgsql as $$
declare c ecb_workflow.cycles; begin
  select * into c from ecb_workflow.cycles where id=cid;
  return ecb_workflow.command('result',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',c.version,
    'obligation_id',oid,'edition',c.edition,'status','PASS','method_ref','test-method-v1','executor_actor','worker','observation','Constructed native controller witness only',
    'evidence',jsonb_build_array(jsonb_build_object('ref',evidence,'digest',ecb_workflow.evidence_digest(evidence)))),actor);
end $$;
create function pg_temp.advance(cid uuid) returns jsonb language sql as $$
 select ecb_workflow.command('advance',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',version),'worker') from ecb_workflow.cycles where id=cid
$$;
create function pg_temp.finish(cid uuid,evidence uuid) returns void language plpgsql as $$
declare phase integer; o ecb_workflow.obligations; begin
  for phase in 0..6 loop
    for o in select * from ecb_workflow.obligations where cycle_id=cid and stage=phase loop
      perform pg_temp.pay(cid,o.id,evidence,o.validator_actor);
    end loop;
    perform pg_temp.advance(cid);
  end loop;
end $$;
do $$ <<fixture>> declare
  commission uuid:=gen_random_uuid(); focal uuid:=gen_random_uuid(); whole uuid:=gen_random_uuid(); cid uuid:=gen_random_uuid(); child uuid:=gen_random_uuid();
  evidence uuid; p jsonb; r jsonb; input jsonb; op uuid:=gen_random_uuid(); oid uuid; verify_id uuid; parent_return uuid;
  proposal uuid:=gen_random_uuid(); added uuid:=gen_random_uuid(); v integer; initial_debt integer;
begin
  insert into public.referents(id) values(focal),(whole);
  insert into public.thoughts(content,source) values('Bounded workflow controller test evidence','workflow_native_test') returning id into evidence;
  insert into ecb_workflow.commissions(id,authority_ref,scope,allowed_actors) values(commission,evidence,'Native test only',array['worker','checker']);
  p:=pg_temp.plan(cid,commission,focal,whole);
  perform pg_temp.reject('create',p,'uncommissioned','workflow_actor_not_commissioned');
  perform pg_temp.reject('create',jsonb_set(p,'{obligations}',(p->'obligations')-6),'worker','workflow_complete_plan_required');
  r:=ecb_workflow.command('create',p,'worker');
  perform pg_temp.check_true(r->>'phase'='plan' and jsonb_array_length(r->'debt')=7,'full plan and unpaid debt visible');
  perform pg_temp.check_true((ecb_workflow.command('create',p,'worker')->>'replayed')::boolean,'lost acknowledgement recovers identical operation');
  perform pg_temp.reject('create',p||jsonb_build_object('outcome','changed'),'worker','workflow_operation_conflict');
  perform pg_temp.reject('create',pg_temp.plan(gen_random_uuid(),commission,focal,whole),'worker','workflow_root_in_progress');
  perform pg_temp.reject('advance',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',1),'worker','workflow_unpaid_obligation');
  select id into oid from ecb_workflow.obligations where cycle_id=cid and stage=0;
  select id into verify_id from ecb_workflow.obligations where cycle_id=cid and stage=2;
  input:=jsonb_build_object('operation_id',op,'cycle_id',cid,'expected_version',1,'obligation_id',oid,'edition','test-v1',
    'status','PASS','method_ref','test-method-v1','executor_actor','worker','observation','Exact bounded evidence','evidence',jsonb_build_array(jsonb_build_object('ref',evidence,'digest',ecb_workflow.evidence_digest(evidence))));
  perform pg_temp.reject('result',input||jsonb_build_object('edition','old-edition'),'worker','workflow_result_binding_invalid');
  perform pg_temp.reject('result',input||jsonb_build_object('evidence','[]'::jsonb),'worker','workflow_pass_evidence_required');
  perform pg_temp.reject('result',input||jsonb_build_object('evidence',jsonb_build_array(jsonb_build_object('ref',evidence,'digest',repeat('0',64)))),'worker','workflow_evidence_unrecovered_or_changed');
  perform pg_temp.reject('result',input||jsonb_build_object('obligation_id',verify_id),'checker','workflow_stage_not_entered');
  r:=ecb_workflow.command('result',input,'worker');
  perform pg_temp.check_true(r->'next_action'->>'action'='advance','selector enters next phase before claiming its work');
  perform pg_temp.check_true((ecb_workflow.command('result',input,'worker')->>'replayed')::boolean,'result retry has no second effect');
  perform pg_temp.reject('advance',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',1),'worker','workflow_version_conflict');
  select version into v from ecb_workflow.cycles where id=cid;
  p:=jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',v,'proposal_id',proposal,'affected_obligation_id',oid,
    'title','Locally true expansion','salience','Attracts current attention','significance','Potential dependency','importance','Valuable under the declared outcome',
    'decision_consequence','Could change planning acceptance','omission_failure','A named outcome condition could fail','source_ref',evidence);
  perform ecb_workflow.command('propose',p,'worker');
  select version into v from ecb_workflow.cycles where id=cid;
  perform pg_temp.reject('advance',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',v),'worker','workflow_scope_decision_unresolved');
  p:=jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',v,'proposal_id',proposal,'disposition','FUTURE','reason','Future possible value',
    'affected_old_support','Existing planning support retains its basis','destination_obligations','Keep the outcome fixed');
  perform pg_temp.reject('decide',p,'worker','workflow_future_route_required');
  p:=p||jsonb_build_object('disposition','REQUIRED','obligation',jsonb_build_object('id',added,'stage','plan','requirement','New necessary condition',
    'outcome_consequence','Omission defeats the same outcome','criterion','Named bounded completion','method_ref','test-method-v1','validator_actor','worker','owner_route','test-outcome'));
  r:=ecb_workflow.command('decide',p,'worker');
  perform pg_temp.check_true(jsonb_array_length(r->'debt')=7,'required discovery increases debt rather than clearing existing work');
  perform pg_temp.pay(cid,added,evidence);
  perform pg_temp.advance(cid);
  select id into parent_return from ecb_workflow.obligations where cycle_id=cid and stage=1;
  p:=pg_temp.plan(child,commission,whole,focal)||jsonb_build_object('parent_id',cid,'parent_obligation_id',parent_return);
  perform ecb_workflow.command('create',p,'worker');
  perform pg_temp.check_true((ecb_workflow.inspect(cid)->'cycle'->>'epoch')::integer=2,'new child requalifies the containing basis');
  perform pg_temp.pay(cid,oid,evidence); perform pg_temp.pay(cid,added,evidence); perform pg_temp.advance(cid);
  perform pg_temp.pay(cid,parent_return,evidence);
  select version into v from ecb_workflow.cycles where id=cid;
  perform pg_temp.reject('advance',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',cid,'expected_version',v),'worker','workflow_unpaid_obligation');
  perform pg_temp.check_true(ecb_workflow.inspect(cid)->'next_action'->>'action'='reenter_child','unfinished child returns remain explicit');
  perform pg_temp.finish(child,evidence);
  perform pg_temp.check_true((ecb_workflow.inspect(child)->>'zero_balance')::boolean,'positive child finishes all stages');
  perform pg_temp.advance(cid);
  select version into v from ecb_workflow.cycles where id=cid;
  input:=input||jsonb_build_object('operation_id',gen_random_uuid(),'expected_version',v,'obligation_id',verify_id,'executor_actor','checker');
  perform pg_temp.reject('result',input,'checker','workflow_independent_validator_required');
  perform pg_temp.pay(cid,verify_id,evidence,'checker'); perform pg_temp.advance(cid);
  for v in 3..6 loop
    for oid in select id from ecb_workflow.obligations where cycle_id=cid and stage=v loop perform pg_temp.pay(cid,oid,evidence); end loop;
    perform pg_temp.advance(cid);
  end loop;
  perform pg_temp.check_true((ecb_workflow.inspect(cid)->>'zero_balance')::boolean,'positive containing cycle reaches real structural closure');
  select id into oid from ecb_workflow.obligations where cycle_id=cid and stage=6;
  update ecb_workflow.results set valid_until=now()-interval '1 day' where obligation_id=oid;
  perform pg_temp.check_true(not (ecb_workflow.inspect(cid)->>'zero_balance')::boolean,'expired proof cannot maintain zero balance');
  perform pg_temp.check_true(ecb_workflow.inspect(cid)->'next_action'->>'action'='reopen','expired closure returns an actionable reentry');
  perform pg_temp.check_true(ecb_workflow.observe()->'closed_with_current_debt' @> jsonb_build_array(cid),'observer detects closed work whose proof has expired');
  update ecb_workflow.results set valid_until=null where obligation_id=oid;
  update ecb_workflow.results set evidence=jsonb_build_array(jsonb_build_object('ref',fixture.evidence,'digest',repeat('0',64))) where obligation_id=oid;
  perform pg_temp.check_true(not (ecb_workflow.inspect(cid)->>'zero_balance')::boolean,'proof digest is rechecked at reliance');
  update ecb_workflow.results set evidence=jsonb_build_array(jsonb_build_object('ref',fixture.evidence,'digest',ecb_workflow.evidence_digest(fixture.evidence))) where obligation_id=oid;
  select version into v from ecb_workflow.cycles where id=child;
  perform ecb_workflow.command('reopen',jsonb_build_object('operation_id',gen_random_uuid(),'cycle_id',child,'expected_version',v,'edition','test-v2','reason','Relied-on child basis changed'),'worker');
  perform pg_temp.check_true(not (ecb_workflow.inspect(cid)->>'zero_balance')::boolean and ecb_workflow.inspect(cid)->>'phase'='plan','child change propagates to previously closed parent');
  perform pg_temp.check_true(jsonb_array_length(ecb_workflow.inspect(cid)->'debt')=15,'reentry preserves all original and descendant liabilities');
  -- Public facade is unusable without the separately commissioned runtime credential.
  begin perform public.ecb_workflow_inspect(cid); raise exception 'TEST FAILED: public auth bypass';
  exception when others then if position('ecb11_runtime_unauthorized' in sqlerrm)=0 and position('ecb11_runtime_uncommissioned' in sqlerrm)=0 then raise; end if; end;
  perform pg_temp.check_true(not has_table_privilege('anon','ecb_workflow.cycles','SELECT'),'direct table path denied');
end $$;
select 'PASS: controller positive completion, scope/debt conservation, authority, recovery, stale edition/version, independent validation and child-to-parent requalification' as result;
rollback;
