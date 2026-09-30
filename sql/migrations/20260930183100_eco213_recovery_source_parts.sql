-- Expose the retained work constituents required for cold source recovery.
-- This changes recovery presentation only; no remit or scheduler is activated.
begin;
create or replace function ecb_circulation.recover(p_work uuid default null) returns jsonb language plpgsql set search_path=''
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
    'work',coalesce((select jsonb_agg(to_jsonb(w)||jsonb_build_object('epoch',ecb_circulation.sha(to_jsonb(w)::text),
      'parts',coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from ecb_circulation.work_parts p where p.work_id=w.id),'[]')))
      from ecb_circulation.work_accounts w where p_work is null or w.id=p_work),'[]'),
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
commit;
