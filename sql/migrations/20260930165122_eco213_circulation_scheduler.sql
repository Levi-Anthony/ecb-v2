-- ECO-213: dormant wake, independent observation and late-result custody.
begin;
create table ecb_circulation.scheduler_binding(
 singleton boolean primary key default true check(singleton),remit_revision_id uuid not null references ecb_circulation.remit_revisions(id),
 worker_url text not null check(worker_url ~ '^https://[a-zA-Z0-9.-]+/api/circulation/run$'),vault_secret_id uuid not null,
 enabled boolean not null default false,installed_runtime_basis jsonb not null
);
alter table ecb_circulation.scheduler_binding enable row level security;
revoke all on ecb_circulation.scheduler_binding from public,anon,authenticated,service_role;
create table ecb_circulation.attempt_observations(
 id uuid primary key default gen_random_uuid() references public.referents(id),attempt_id uuid not null references ecb_circulation.attempts(id),
 fence bigint not null,evidence_digest text not null,failure_code text not null,raw_carrier_id uuid not null references public.text_artifacts(id),
 provider_basis jsonb not null,observed_at timestamptz not null default clock_timestamp(),unique(attempt_id,evidence_digest)
);
alter table ecb_circulation.attempt_observations enable row level security;
revoke all on ecb_circulation.attempt_observations from public,anon,authenticated,service_role;
create trigger identity before insert on ecb_circulation.attempt_observations for each row execute function ecb_circulation.register_identity();
create trigger immutable before update or delete on ecb_circulation.attempt_observations for each row execute function ecb_circulation.immutable();
create function public.eco213_preserve_attempt(p_attempt uuid,p_fence bigint,p_code text,p_provider jsonb) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare c ecb_circulation.execution_credentials;t ecb_circulation.attempts;v uuid;d text;k text;
begin
 k:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}')->>'x-eco213-worker-key';
 select * into c from ecb_circulation.execution_credentials where enabled and key_digest=extensions.digest(convert_to(coalesce(k,''),'UTF8'),'sha256');
 if not found or length(coalesce(k,''))<32 then raise exception 'eco213_worker_unauthorized';end if;
 select a.* into t from ecb_circulation.attempts a join ecb_circulation.activities aa on aa.id=a.activity_id
 join ecb_circulation.work_accounts w on w.id=aa.work_id where a.id=p_attempt and a.fence=p_fence and a.executor=c.worker and w.remit_revision_id=c.remit_revision_id;
 if not found or t.started_at<clock_timestamp()-interval '24 hours' then raise exception 'eco213_attempt_evidence_scope_denied';end if;
 if p_code is null or p_code !~ '^[a-z_]{1,100}$' or p_provider is null or octet_length(p_provider::text)>1048576 then raise exception 'eco213_attempt_evidence_boundary';end if;
 d:=ecb_circulation.sha(jsonb_build_array(p_code,p_provider)::text);perform pg_advisory_xact_lock(hashtextextended(p_attempt::text,216));
 select id into v from ecb_circulation.attempt_observations where attempt_id=p_attempt and evidence_digest=d;
 if found then return jsonb_build_object('status','evidence_preserved','observation_id',v,'replayed',true,'effect_committed',false);end if;
 insert into ecb_circulation.attempt_observations(attempt_id,fence,evidence_digest,failure_code,raw_carrier_id,provider_basis)
 values(p_attempt,p_fence,d,p_code,ecb_circulation.artifact(coalesce(p_provider->>'raw_output','')),p_provider-'raw_output') returning id into v;
 return jsonb_build_object('status','evidence_preserved','observation_id',v,'replayed',false,'effect_committed',false);
end $$;
revoke all on function public.eco213_preserve_attempt(uuid,bigint,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.eco213_preserve_attempt(uuid,bigint,text,jsonb) to anon;
create function ecb_circulation.wake() returns void language plpgsql security definer set search_path='' as $$
declare b ecb_circulation.scheduler_binding;r ecb_circulation.remit_revisions;secret text;request_id bigint;
begin
 select * into b from ecb_circulation.scheduler_binding where singleton and enabled for share;if not found then return;end if;
 select rr.* into r from ecb_circulation.remit_revisions rr join ecb_circulation.remit_heads h on h.revision_id=rr.id
 where rr.id=b.remit_revision_id and h.enabled and rr.expires_at>clock_timestamp() for share of h;if not found then return;end if;
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
create function ecb_circulation.observe() returns jsonb language plpgsql security definer set search_path='' as $$
declare due integer;overdue integer;expired integer;last_wake timestamptz;last_dispatch timestamptz;basis jsonb;response record;dispatch record;
begin
 select count(*) filter(where h.status in ('pending','leased') and h.due_at<=clock_timestamp()),
 count(*) filter(where h.status in ('pending','leased') and h.due_at<=clock_timestamp()-interval '10 minutes'),
 count(*) filter(where h.status='leased' and h.lease_until<=clock_timestamp()) into due,overdue,expired from ecb_circulation.processing_heads h;
 select max(observed_at) into last_wake from ecb_circulation.liveness_observations where event='wake';
 select max(observed_at) into last_dispatch from ecb_circulation.liveness_observations where event='dispatch';
 if to_regclass('net._http_response') is not null then
 for dispatch in select x.id,x.basis->>'request_id' as request_id from ecb_circulation.liveness_observations x
 where x.event='dispatch' and x.observed_at>clock_timestamp()-interval '6 hours' and not exists(select 1 from ecb_circulation.liveness_observations o
 where o.event='wake_response' and o.basis->>'dispatch_id'=x.id::text) order by x.observed_at desc limit 20 loop
 execute 'select status_code,timed_out,error_msg is not null as errored from net._http_response where id=$1' into response using dispatch.request_id::bigint;
 if response.status_code is not null or response.timed_out or response.errored then insert into ecb_circulation.liveness_observations(observer,event,basis,expires_at)
 values('database-observer','wake_response',jsonb_build_object('dispatch_id',dispatch.id,'request_id',dispatch.request_id,'status_code',response.status_code,
 'timed_out',response.timed_out,'errored',response.errored),clock_timestamp()+interval '10 minutes');end if;
 end loop;end if;
 basis:=jsonb_build_object('due',due,'overdue',overdue,'expired_leases',expired,'last_worker_wake',last_wake,'last_dispatch',last_dispatch,
 'state',case when overdue>0 and (last_wake is null or last_wake<clock_timestamp()-interval '10 minutes') then 'STALE_WORKER'
 when overdue>0 then 'OVERDUE_WORK' when due>0 then 'DUE_WORK' else 'NO_DUE_WORK' end,
 'scope','database observations; no provider semantic adequacy or end-to-end success inferred');
 insert into ecb_circulation.liveness_observations(observer,event,basis,expires_at) values('database-observer','observer',basis,clock_timestamp()+interval '10 minutes');
 return basis;
end $$;
create function ecb_circulation.set_scheduler(p_enabled boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare wake_id bigint;observe_id bigint;
begin
 if (select extversion from pg_extension where extname='pg_cron') is distinct from '1.6.4'
 or (select extversion from pg_extension where extname='pg_net') is distinct from '0.20.4' then raise exception 'eco213_scheduler_extension_requires_requalification';end if;
 if p_enabled then
 if not exists(select 1 from ecb_circulation.scheduler_binding where singleton) then raise exception 'eco213_wake_uncommissioned';end if;
 execute $cron$select cron.schedule('eco213-wake','* * * * *','select ecb_circulation.wake()')$cron$ into wake_id;
 execute $cron$select cron.schedule('eco213-observe','* * * * *','select ecb_circulation.observe()')$cron$ into observe_id;
 else
 execute $cron$select jobid from cron.job where jobname='eco213-wake'$cron$ into wake_id;
 execute $cron$select jobid from cron.job where jobname='eco213-observe'$cron$ into observe_id;
 if wake_id is not null then execute 'select cron.unschedule($1)' using wake_id;end if;
 -- Retain the independent observer for recovery; stopped observation expires visibly.
 end if;
 update ecb_circulation.scheduler_binding set enabled=p_enabled where singleton;
 return jsonb_build_object('enabled',p_enabled,'wake_job',wake_id,'observer_job',observe_id);
end $$;
revoke all on all functions in schema ecb_circulation from public,anon,authenticated,service_role;
commit;
