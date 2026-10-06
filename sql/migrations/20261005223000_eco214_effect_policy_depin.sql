-- ECO-214: remove qualification-fixture ceilings from the durable circulation control plane.
-- The original 100/16000/4000/USD2/48h bundle was a bounded qualification fixture,
-- not a universal architectural limit. Bounds remain available per remit when explicitly owned.
begin;

alter table ecb_circulation.remit_revisions
  drop constraint if exists remit_revisions_check,
  drop constraint if exists remit_revisions_max_requests_check,
  drop constraint if exists remit_revisions_max_input_check,
  drop constraint if exists remit_revisions_max_output_check,
  drop constraint if exists remit_revisions_max_usd_check,
  alter column expires_at drop not null,
  alter column max_requests drop not null,
  alter column max_input drop not null,
  alter column max_output drop not null,
  alter column max_usd drop not null;

alter table ecb_circulation.remit_revisions
  add constraint remit_revisions_expiry_positive check(expires_at is null or expires_at>issued_at),
  add constraint remit_revisions_max_requests_positive check(max_requests is null or max_requests>0),
  add constraint remit_revisions_max_input_positive check(max_input is null or max_input>0),
  add constraint remit_revisions_max_output_positive check(max_output is null or max_output>0),
  add constraint remit_revisions_max_usd_positive check(max_usd is null or max_usd>0);

comment on column ecb_circulation.remit_revisions.expires_at is
  'Optional authority expiration. NULL means validity is controlled by enabled/supersession/revocation rather than an arbitrary time fixture.';
comment on column ecb_circulation.remit_revisions.max_requests is
  'Optional aggregate request fuse owned by this remit; no universal request ceiling.';
comment on column ecb_circulation.remit_revisions.max_input is
  'Optional stricter pre-dispatch input safety ceiling. Provider capability remains independently checked.';
comment on column ecb_circulation.remit_revisions.max_output is
  'Optional stricter completion ceiling. When NULL, worker uses qualified provider capability metadata.';
comment on column ecb_circulation.remit_revisions.max_usd is
  'Optional aggregate worst-case reserved-spend fuse owned by this remit; no universal USD ceiling.';

create or replace function ecb_circulation.assert_remit(p_revision uuid,p_actor text,p_origin text default null,p_locator text default null,p_effect text default null)
returns ecb_circulation.remit_revisions language plpgsql set search_path='' as $$
declare r ecb_circulation.remit_revisions;begin
  select v.* into strict r from ecb_circulation.remit_revisions v join ecb_circulation.remit_heads h
    on h.revision_id=v.id and h.remit_id=v.remit_id where v.id=p_revision and h.enabled for share of h;
  if (r.expires_at is not null and r.expires_at<=clock_timestamp()) or not p_actor=any(r.allowed_actors)
    or (p_effect is not null and not p_effect=any(r.allowed_effects))
    or (p_origin is not null and not p_origin=any(r.allowed_sources)) then raise exception 'eco213_remit_denied';end if;
  if p_origin='legacy:lqbrzoicorehwidkdhoi' and (p_locator is null or not p_locator::uuid=any(r.allowed_legacy_ids)) then raise exception 'eco213_cohort_denied';end if;
  return r;
exception when no_data_found then raise exception 'eco213_remit_inactive';end $$;

create or replace function public.eco213_reserve(p_attempt uuid,p_fence bigint,p_usd numeric,p_input integer,p_output integer,p_tariff jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c ecb_circulation.execution_credentials;r ecb_circulation.remit_revisions;v ecb_circulation.spend_reservations;n integer;cost numeric;begin
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
    or p_tariff is null or not p_tariff?'model'
    or (r.max_requests is not null and n>=r.max_requests)
    or (r.max_usd is not null and cost+p_usd>r.max_usd)
    or (r.max_input is not null and p_input>r.max_input)
    or (r.max_output is not null and p_output>r.max_output)
    then raise exception 'eco213_budget_denied';end if;
  insert into ecb_circulation.spend_reservations(attempt_id,remit_revision_id,worst_usd,tariff,input_bound,output_bound)
    values(p_attempt,r.id,p_usd,p_tariff,p_input,p_output) returning id into v.id;
  return jsonb_build_object('reservation_id',v.id,'replayed',false,'dispatch_permitted',true);
end $$;

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
    'remits',coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('enabled',h.enabled,'expired',(r.expires_at is not null and r.expires_at<=clock_timestamp())))
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
      and exists(select 1 from ecb_circulation.remit_heads rh join ecb_circulation.remit_revisions r on r.id=rh.revision_id where r.id=a.remit_revision_id and rh.enabled and (r.expires_at is null or r.expires_at>clock_timestamp()))
      and not exists(select 1 from ecb_circulation.dependency_bases b where b.assessment_id=a.id and
        (b.digest<>ecb_circulation.referent_digest(b.subject_id) or b.work_epoch<>a.work_epoch))))
      from ecb_circulation.use_heads h join ecb_circulation.use_assessments a on a.id=h.assessment_id join ecb_circulation.work_accounts w on w.id=h.work_id where p_work is null or w.id=p_work),'[]'),
    'corpus_coverage',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('preserved_items',(select count(*) from ecb_circulation.corpus_members cm where cm.corpus_id=c.id),
      'items',(select jsonb_agg(to_jsonb(cm)||jsonb_build_object('processing',(select jsonb_agg(to_jsonb(h)) from ecb_circulation.activities a join ecb_circulation.processing_heads h on h.activity_id=a.id where a.source_id=cm.source_id))) from ecb_circulation.corpus_members cm where cm.corpus_id=c.id))) from ecb_circulation.corpus_editions c),'[]'),
    'liveness',coalesce(v,jsonb_build_object('observation_basis','UNKNOWN')));
end $function$;

create or replace function ecb_circulation.wake() returns void language plpgsql security definer set search_path='' as $$
declare b ecb_circulation.scheduler_binding;r ecb_circulation.remit_revisions;secret text;request_id bigint;
begin
 select * into b from ecb_circulation.scheduler_binding where singleton and enabled for share;if not found then return;end if;
 select rr.* into r from ecb_circulation.remit_revisions rr join ecb_circulation.remit_heads h on h.revision_id=rr.id
 where rr.id=b.remit_revision_id and h.enabled and (rr.expires_at is null or rr.expires_at>clock_timestamp()) for share of h;if not found then return;end if;
 if (select extversion from pg_extension where extname='pg_net') is distinct from '0.20.4' then raise exception 'eco213_wake_extension_requires_requalification';end if;
 execute 'select decrypted_secret from vault.decrypted_secrets where id=$1' into secret using b.vault_secret_id;
 if secret is null or length(secret)<32 then raise exception 'eco213_wake_uncommissioned';end if;
 execute 'select net.http_post(url:=$1,body:=$2,headers:=$3,timeout_milliseconds:=95000)' into request_id
 using b.worker_url,'{}'::jsonb,jsonb_build_object('Authorization','Bearer '||secret,'Content-Type','application/json');
 insert into ecb_circulation.liveness_observations(observer,event,basis,expires_at) values('database-scheduler','dispatch',
 jsonb_build_object('request_id',request_id,'remit_revision_id',r.id,'runtime_basis',b.installed_runtime_basis),clock_timestamp()+interval '10 minutes');
exception when others then
 insert into ecb_circulation.liveness_observations(observer,event,basis,expires_at) values('database-scheduler','wake_failure',
 jsonb_build_object('sqlstate',sqlstate,'detail','withheld; inspect configured extension/credential/runtime'),clock_timestamp()+interval '10 minutes');
end $$;

commit;
