-- Recheck proof custody/digests at reliance, not only when a result is recorded.
begin;
create or replace function ecb_workflow.paid(p_obligation uuid) returns boolean language sql stable
set search_path='' as $$
  select coalesce((select r.status='PASS' and r.epoch=c.epoch and r.edition=c.edition
    and (r.valid_until is null or r.valid_until>now()) and jsonb_array_length(r.evidence)>0
    and not exists(select 1 from jsonb_array_elements(r.evidence) e
      where ecb_workflow.evidence_digest((e->>'ref')::uuid) is null or ecb_workflow.evidence_digest((e->>'ref')::uuid) is distinct from e->>'digest')
    and not exists(select 1 from ecb_workflow.cycles child where child.parent_obligation_id=o.id and child.phase<7)
    from ecb_workflow.obligations o join ecb_workflow.cycles c on c.id=o.cycle_id
    join lateral(select * from ecb_workflow.results where obligation_id=o.id order by recorded_version desc limit 1) r on true
    where o.id=p_obligation),false)
$$;
create index workflow_commission_authority on ecb_workflow.commissions(authority_ref);
create index workflow_cycle_commission on ecb_workflow.cycles(commission_id);
create index workflow_cycle_focal on ecb_workflow.cycles(focal_ref);
create index workflow_cycle_containing on ecb_workflow.cycles(containing_ref);
create index workflow_cycle_return on ecb_workflow.cycles(parent_obligation_id);
create index workflow_proposal_affected on ecb_workflow.proposals(affected_obligation_id);
create index workflow_proposal_source on ecb_workflow.proposals(source_ref);
commit;
