-- Observation only: no correction, provider calls, worker release or external effects.
begin;
create extension if not exists pg_cron;
do $$ begin
  if exists(select 1 from cron.job where jobname='ecb-workflow-debt-observer-v1') then
    raise exception 'workflow_observer_name_already_used';
  end if;
end $$;
select cron.schedule('ecb-workflow-debt-observer-v1','*/5 * * * *','select ecb_workflow.observe()');
commit;
