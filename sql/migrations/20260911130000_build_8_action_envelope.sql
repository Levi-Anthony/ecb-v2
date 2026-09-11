-- ECO-103; accepted Astra D1-D9 as amended by I1-I9 / E1-E6.
-- Disposable atomic-ledger synthetic target only. No canonical installation.
-- STRUCTURAL / schema constraints + transactions; AUTHORITY / bounded function grants.
create role ecb8_owner nologin noinherit;
create role ecb8_evaluator nologin noinherit;
create role ecb8_executor nologin noinherit;
create role ecb8_observer nologin noinherit;
grant ecb8_owner to postgres;
create schema ecb8 authorization ecb8_owner;
revoke all on schema ecb8 from public,anon,authenticated,service_role;
grant usage on schema ecb8 to service_role,ecb8_evaluator,ecb8_executor,ecb8_observer;
grant usage on schema public,extensions,ecb7 to ecb8_owner;
grant select on public.artifacts,public.referents,public.claims,ecb7.scopes to ecb8_owner;
grant insert(id) on public.referents to ecb8_owner;
grant insert(id,artifact_role,context_id,payload_text) on public.artifacts to ecb8_owner;
-- E4: FOR UPDATE needs an UPDATE privilege; the non-pointer column is the ceiling.
grant update(synthetic) on ecb7.scopes to ecb8_owner;
create policy build8_read_scope on ecb7.scopes for select to ecb8_owner using(synthetic);
create policy build8_lock_scope on ecb7.scopes for update to ecb8_owner using(synthetic) with check(synthetic);
create policy build8_read_artifact on public.artifacts for select to ecb8_owner using(true);
create policy build8_write_artifact on public.artifacts for insert to ecb8_owner
 with check(artifact_role in ('b8_basis','b8_envelope','b8_evaluation','b8_event'));
create policy build8_identity on public.referents for all to ecb8_owner using(true) with check(true);
create policy build8_read_claim on public.claims for select to ecb8_owner using(true);

-- E1: only trigger routing changes; the bound BUILD 5B checker text is untouched.
alter table public.artifacts drop constraint artifacts_role_vocabulary;
alter table public.artifacts add constraint artifacts_role_vocabulary check(artifact_role in (
 'source_representation','transformation_request','transformed_representation','check_attempt','transformation_receipt',
 'b7_grammar','b7_snapshot','b7_contract','b7_candidate','b7_attempt','b7_evaluation','b7_grant','b7_designation','b7_observation',
 'b8_basis','b8_envelope','b8_evaluation','b8_event'));
drop trigger prepare_build_5b_artifact on public.artifacts;
create trigger prepare_build_5b_artifact before insert on public.artifacts for each row
 when(new.artifact_role in ('source_representation','transformation_request','transformed_representation','check_attempt','transformation_receipt'))
 execute function public.prepare_build_5b_artifact();

create function ecb8.doc(i uuid, expected_role text default null) returns jsonb
language plpgsql stable set search_path='' as $$
declare r public.artifacts; begin
 select * into strict r from public.artifacts where id=i;
 if expected_role is not null and r.artifact_role<>expected_role then raise exception 'b8_wrong_role:%',i; end if;
 if r.payload_text is null or r.payload_digest<>extensions.digest(convert_to(r.payload_text,'UTF8'),'sha256')
 or not(r.payload_text is json object with unique keys) then raise exception 'b8_payload_integrity:%',i; end if;
 return r.payload_text::jsonb;
end $$;

create function ecb8.lock_scope(s uuid, observation boolean default false) returns void
language plpgsql set search_path='' as $$ begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'b8_read_committed_required'; end if;
 if observation then
  perform id from ecb7.scopes where id=s and synthetic for update nowait;
 else
  perform id from ecb7.scopes where id=s and synthetic for update;
 end if;
 if not found then raise exception 'b8_synthetic_scope_required'; end if;
end $$;

create function ecb8.prepare_artifact() returns trigger language plpgsql set search_path='' as $$
declare j jsonb; begin
 if new.payload_digest is not null or new.recorded_at is not null or new.created_xid is not null then
  raise exception 'b8_derived_columns'; end if;
 if new.payload_text is null or not(new.payload_text is json object with unique keys) then
  raise exception 'b8_exact_unique_json_required'; end if;
 j:=new.payload_text::jsonb;
 if current_user<>'ecb8_owner' then raise exception 'b8_protected_publication'; end if;
 if j->>'scope' is null or j->>'action' is null then raise exception 'b8_exact_locator_required'; end if;
 if exists(select 1 from public.referents where id=new.id) then raise exception 'b8_identity_already_registered'; end if;
 insert into public.referents(id) values(new.id);
 new.payload_digest:=extensions.digest(convert_to(new.payload_text,'UTF8'),'sha256');
 new.recorded_at:=transaction_timestamp(); new.created_xid:=pg_current_xact_id();
 return new;
end $$;
create trigger prepare_build8_artifact before insert on public.artifacts for each row
 when(new.artifact_role in ('b8_basis','b8_envelope','b8_evaluation','b8_event')) execute function ecb8.prepare_artifact();

-- Private storage helper. Never granted to a runtime principal.
create function ecb8.retain(k text,c uuid,bytes text,i uuid default gen_random_uuid()) returns uuid
language plpgsql set search_path='' as $$ begin
 insert into public.artifacts(id,artifact_role,context_id,payload_text) values(i,k,c,bytes); return i;
end $$;

-- The remainder of the accepted lifecycle is intentionally not installed by this
-- first composition checkpoint. A successful substrate check is not P01-P14 PASS.
do $$ declare r record; begin
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb8' loop
  execute format('alter function %s owner to ecb8_owner',r.signature);
 end loop;
end $$;
revoke all on all functions in schema ecb8 from public,anon,authenticated,service_role;
