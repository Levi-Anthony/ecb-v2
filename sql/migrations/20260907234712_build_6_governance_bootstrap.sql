-- BUILD 6 staged release. Apply exact bytes and ledger entry in one outer transaction.
-- Installs an inactive mechanism only; no canonical H, scope, credential or genesis.
create role ecb_governance_owner nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
create role ecb_human_verifier nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
create role ecb_governance_executor nologin noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
-- Installation custodian may assign ownership; neither runtime receives membership.
grant ecb_governance_owner to postgres with inherit true, set true;
create schema ecb_governance authorization ecb_governance_owner;
revoke all on schema ecb_governance from public, anon, authenticated, service_role;
grant usage on schema ecb_governance to ecb_human_verifier, ecb_governance_executor;
-- The owner can register identity, but cannot edit existing kernel data.
grant usage on schema public to ecb_governance_owner;
grant insert(id) on public.referents to ecb_governance_owner;
create policy build6_register_identity on public.referents for insert to ecb_governance_owner with check (true);

create function ecb_governance.hash(t text) returns text language sql immutable strict
set search_path = '' as $$ select pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(t,'UTF8')),'hex') $$;
create function ecb_governance.identity() returns uuid language plpgsql set search_path = '' as $$
declare r uuid := pg_catalog.gen_random_uuid(); begin insert into public.referents(id) values(r); return r; end $$;
create function ecb_governance.register_identity() returns trigger language plpgsql set search_path = '' as $$
begin insert into public.referents(id) values(new.id); return new; end $$;
create function ecb_governance.immutable() returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'immutable_history'; end $$;

create table ecb_governance.subjects(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 kind text not null check(kind in ('policy','remit','external_basis','binding')),
 payload text not null check(octet_length(payload) between 1 and 32768),
 digest text generated always as (ecb_governance.hash(payload)) stored,
 source text not null check(length(source)>0),
 created_xid xid8 not null default pg_current_xact_id()
);
create table ecb_governance.scopes(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 h uuid not null references public.referents(id),
 remit uuid not null references ecb_governance.subjects(id),
 root_basis uuid not null references ecb_governance.subjects(id),
 p0 uuid not null references ecb_governance.subjects(id),
 binding uuid references ecb_governance.subjects(id),
 current_transition uuid,
 rp_id text not null check(rp_id='ecos.effortlessconnection.com'),
 origin text not null check(origin='https://ecos.effortlessconnection.com'),
 user_handle text not null unique,
 setup_hash text not null unique check(setup_hash ~ '^[0-9a-f]{64}$'),
 setup_expires timestamptz not null,
 credential_count integer not null check(credential_count between 1 and 2),
 created_xid xid8 not null default pg_current_xact_id()
);
create table ecb_governance.credentials(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 scope uuid not null references ecb_governance.scopes(id),
 credential_id text not null unique, public_key text not null,
 counter bigint not null check(counter>=0),
 transports jsonb not null, device_type text not null, backed_up boolean not null,
 enrollment_ceremony uuid not null,
 unique(scope,id)
);
create table ecb_governance.ceremonies(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 scope uuid not null references ecb_governance.scopes(id),
 purpose text not null check(purpose in ('registration','authentication')),
 challenge text not null unique,
 browser_hash text not null check(browser_hash ~ '^[0-9a-f]{64}$'),
 expires timestamptz not null default clock_timestamp()+interval '5 minutes',
 proof jsonb, consumed_at timestamptz,
 check((proof is null)=(consumed_at is null))
);
alter table ecb_governance.credentials add foreign key(enrollment_ceremony) references ecb_governance.ceremonies(id);
create table ecb_governance.sessions(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 scope uuid not null references ecb_governance.scopes(id),
 credential uuid not null,
 ceremony uuid not null unique references ecb_governance.ceremonies(id),
 secret_hash text not null unique check(secret_hash ~ '^[0-9a-f]{64}$'),
 csrf_hash text not null check(csrf_hash ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default clock_timestamp(),
 last_active timestamptz not null default clock_timestamp(),
 absolute_expires timestamptz not null default clock_timestamp()+interval '7 days',
 invalidated_at timestamptz,
 foreign key(scope,credential) references ecb_governance.credentials(scope,id)
);
create table ecb_governance.decisions(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 scope uuid not null references ecb_governance.scopes(id),
 operation text not null check(operation in ('genesis','succession','decline','withdraw')),
 policy uuid references ecb_governance.subjects(id),
 predecessor uuid,
 basis uuid not null references public.referents(id),
 h uuid not null references public.referents(id),
 session_id uuid references ecb_governance.sessions(id),
 target uuid references ecb_governance.decisions(id),
 explanation text not null,
 request_id uuid not null, fingerprint text not null,
 created_xid xid8 not null default pg_current_xact_id(),
 unique(scope,request_id), unique(scope,id)
);
create unique index one_withdrawal on ecb_governance.decisions(target) where operation='withdraw';
create unique index one_genesis_grant on ecb_governance.decisions(scope) where operation='genesis';
create table ecb_governance.transitions(
 id uuid primary key default gen_random_uuid() references public.referents(id),
 scope uuid not null references ecb_governance.scopes(id),
 predecessor uuid,
 decision uuid not null unique,
 policy uuid not null references ecb_governance.subjects(id),
 h uuid not null references public.referents(id),
 remit uuid not null references ecb_governance.subjects(id),
 binding uuid not null references ecb_governance.subjects(id),
 obligations jsonb not null,
 executor text not null, request_id uuid not null, fingerprint text not null,
 created_xid xid8 not null default pg_current_xact_id(),
 unique(scope,id), unique(scope,request_id),
 foreign key(scope,decision) references ecb_governance.decisions(scope,id),
 foreign key(scope,predecessor) references ecb_governance.transitions(scope,id)
);
create unique index one_genesis on ecb_governance.transitions(scope) where predecessor is null;
create unique index one_successor on ecb_governance.transitions(predecessor) where predecessor is not null;
alter table ecb_governance.scopes add foreign key(id,current_transition) references ecb_governance.transitions(scope,id);
alter table ecb_governance.decisions add foreign key(scope,predecessor) references ecb_governance.transitions(scope,id);

do $$ declare t text; begin
 foreach t in array array['subjects','scopes','credentials','ceremonies','sessions','decisions','transitions'] loop
 execute format('create trigger register_identity before insert on ecb_governance.%I for each row execute function ecb_governance.register_identity()',t);
 execute format('alter table ecb_governance.%I enable row level security',t);
 end loop;
 foreach t in array array['subjects','decisions','transitions'] loop
 execute format('create trigger immutable_history before update or delete or truncate on ecb_governance.%I for each statement execute function ecb_governance.immutable()',t);
 end loop;
end $$;

create function ecb_governance.policy(p text) returns jsonb language plpgsql set search_path = '' as $$
declare j jsonb; template jsonb := '{
  "format": "ecb.build6.policy.v1",
  "operation": "policy_succession",
  "authorizer": "current_designated_h_in_scope",
  "requires_prior_committed_exact_decision": true,
  "requires_expected_current_predecessor": true,
  "requires_unwithdrawn_decision": true,
  "requires_human_explanation": false,
  "preserves": [
    "governance_scope",
    "initial_h_designation_and_remit",
    "prior_authority_history",
    "bootstrap_exhaustion"
  ],
  "pending_decision_withdrawal": "issuing_h_only",
  "allows_delegation": false,
  "allows_other_operations": false
}
'::jsonb; begin
 if p is null or octet_length(p)>32768 or not(p is json object with unique keys) then raise exception 'unsupported_policy'; end if;
 j:=p::jsonb;
 if jsonb_typeof(j->'requires_human_explanation') is distinct from 'boolean'
 or (j-'requires_human_explanation') is distinct from (template-'requires_human_explanation') then raise exception 'unsupported_policy'; end if;
 return j;
end $$;
create function ecb_governance.retain(k text,p text,s text) returns uuid language plpgsql set search_path = '' as $$
declare r uuid; begin
 if k='policy' then perform ecb_governance.policy(p); end if;
 insert into ecb_governance.subjects(kind,payload,source) values(k,p,s) returning id into r; return r;
end $$;
-- Installation custody only. A setup secret is supplied as a hash, never generated by the agent.
create function ecb_governance.commission(p0_bytes text,remit_bytes text,basis_bytes text,source_ref text,setup_digest text,expected_keys integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare r uuid; p uuid; m uuid; b uuid; h_id uuid; existing ecb_governance.scopes; begin
 -- Serialize setup retries on the opaque capability digest before retaining new subjects.
 perform pg_advisory_xact_lock(hashtextextended(setup_digest,0));
 select * into existing from ecb_governance.scopes where setup_hash=setup_digest;
 if found then
 if existing.credential_count is distinct from expected_keys
 or (select payload from ecb_governance.subjects where id=existing.p0) is distinct from p0_bytes
 or (select payload from ecb_governance.subjects where id=existing.remit) is distinct from remit_bytes
 or (select payload from ecb_governance.subjects where id=existing.root_basis) is distinct from basis_bytes
 or (select source from ecb_governance.subjects where id=existing.root_basis) is distinct from source_ref then raise exception 'request_conflict'; end if;
 return existing.id;
 end if;
 if ecb_governance.hash(p0_bytes)<>'686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664' then raise exception 'wrong_p0'; end if;
 p:=ecb_governance.retain('policy',p0_bytes,source_ref); m:=ecb_governance.retain('remit',remit_bytes,source_ref);
 b:=ecb_governance.retain('external_basis',basis_bytes,source_ref); h_id:=ecb_governance.identity();
 insert into ecb_governance.scopes(h,remit,root_basis,p0,rp_id,origin,user_handle,setup_hash,setup_expires,credential_count)
 values(h_id,m,b,p,'ecos.effortlessconnection.com','https://ecos.effortlessconnection.com',replace(gen_random_uuid()::text,'-',''),setup_digest,clock_timestamp()+interval '30 minutes',expected_keys) returning id into r;
 return r;
end $$;
create function ecb_governance.check_setup(s ecb_governance.scopes,secret text) returns void language plpgsql set search_path = '' as $$
begin
 if secret is null or ecb_governance.hash(secret)<>s.setup_hash or s.setup_expires<=clock_timestamp() or s.binding is not null or s.current_transition is not null then raise exception 'setup_unavailable'; end if;
 if s.created_xid=pg_current_xact_id() then raise exception 'prior_commit_required'; end if;
end $$;
create function ecb_governance.check_session(scope_id uuid,secret text,csrf text,mutation boolean)
returns ecb_governance.sessions language plpgsql set search_path = '' as $$
declare s ecb_governance.sessions; begin
 select * into s from ecb_governance.sessions where scope=scope_id and secret_hash=ecb_governance.hash(secret) for update;
 if not found or s.invalidated_at is not null or s.absolute_expires<=clock_timestamp() or s.last_active+interval '24 hours'<=clock_timestamp() then raise exception 'session_required'; end if;
 if mutation then
 if csrf is null or s.csrf_hash<>ecb_governance.hash(csrf) then raise exception 'csrf_rejected'; end if;
 update ecb_governance.sessions set last_active=clock_timestamp() where id=s.id;
 end if;
 return s;
end $$;
create function ecb_governance.view_scope(scope_id uuid) returns jsonb language sql set search_path = '' as $$
 select jsonb_build_object('scope',to_jsonb(s)-'setup_hash','subjects',
 (select coalesce(jsonb_agg(to_jsonb(x)),'[]') from ecb_governance.subjects x where x.id in(s.p0,s.remit,s.root_basis,s.binding) or x.id in(select policy from ecb_governance.decisions where scope=s.id)),
 'credentials',(select coalesce(jsonb_agg(to_jsonb(c) order by c.id),'[]') from ecb_governance.credentials c where c.scope=s.id),
 'decisions',(select coalesce(jsonb_agg(to_jsonb(d) order by d.id),'[]') from ecb_governance.decisions d where d.scope=s.id),
 'transitions',(select coalesce(jsonb_agg(to_jsonb(t) order by t.id),'[]') from ecb_governance.transitions t where t.scope=s.id))
 from ecb_governance.scopes s where s.id=scope_id
$$;

-- Sole verifier API. Trust in this credential is explicit; do not grant it to an operating agent.
create function ecb_governance.human(action text,a jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare s ecb_governance.scopes; c ecb_governance.ceremonies; k ecb_governance.credentials;
 ss ecb_governance.sessions; d ecb_governance.decisions; prior ecb_governance.transitions;
 r uuid; p uuid; b uuid; fp text; keys jsonb; cp jsonb;
begin
 select * into s from ecb_governance.scopes where id=(a->>'scope')::uuid for update;
 if not found then raise exception 'unknown_scope'; end if;
 if action in ('setup_view','registration_options','registration_finish','bind') then perform ecb_governance.check_setup(s,a->>'setup_secret'); end if;
 if action='setup_view' then
 return ecb_governance.view_scope(s.id);
 elsif action in ('registration_options','authentication_options') then
 if action='authentication_options' and s.binding is null then raise exception 'unbound_identity'; end if;
 if action='registration_options' and (select count(*) from ecb_governance.credentials where scope=s.id)>=s.credential_count then raise exception 'enrollment_complete'; end if;
 if (select count(*) from ecb_governance.ceremonies where scope=s.id and expires>clock_timestamp() and consumed_at is null)>=20 then raise exception 'ceremony_limit'; end if;
 insert into ecb_governance.ceremonies(scope,purpose,challenge,browser_hash)
 values(s.id,case action when 'registration_options' then 'registration' else 'authentication' end,a->>'challenge',a->>'browser_hash') returning id into r;
 return jsonb_build_object('ceremony',r,'user_handle',s.user_handle,'credentials',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from ecb_governance.credentials x where scope=s.id));
 elsif action='ceremony' then
 select * into c from ecb_governance.ceremonies where id=(a->>'ceremony')::uuid and scope=s.id;
 if not found or c.consumed_at is not null or c.expires<=clock_timestamp() or c.browser_hash is distinct from a->>'browser_hash' then raise exception 'ceremony_unavailable'; end if;
 return jsonb_build_object('ceremony',to_jsonb(c),'user_handle',s.user_handle,'credentials',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from ecb_governance.credentials x where scope=s.id));
 elsif action in ('registration_finish','authentication_finish') then
 select * into c from ecb_governance.ceremonies where id=(a->>'ceremony')::uuid and scope=s.id for update;
 if not found or c.consumed_at is not null or c.expires<=clock_timestamp() or c.browser_hash is distinct from a->>'browser_hash'
 or c.purpose is distinct from (case action when 'registration_finish' then 'registration' else 'authentication' end) then raise exception 'ceremony_unavailable'; end if;
 if jsonb_typeof(a->'proof') is distinct from 'object' then raise exception 'proof_required'; end if;
 if action='registration_finish' then
 if (select count(*) from ecb_governance.credentials where scope=s.id)>=s.credential_count then raise exception 'enrollment_complete'; end if;
 insert into ecb_governance.credentials(scope,credential_id,public_key,counter,transports,device_type,backed_up,enrollment_ceremony)
 values(s.id,a->>'credential_id',a->>'public_key',(a->>'counter')::bigint,a->'transports',a->>'device_type',(a->>'backed_up')::boolean,c.id) returning id into r;
 else
 if s.binding is null then raise exception 'unbound_identity'; end if;
 select * into k from ecb_governance.credentials where scope=s.id and credential_id=a->>'credential_id' for update;
 if not found or k.counter<>(a->>'old_counter')::bigint or ((k.counter>0 or (a->>'counter')::bigint>0) and (a->>'counter')::bigint<=k.counter) then raise exception 'credential_changed'; end if;
 update ecb_governance.credentials set counter=(a->>'counter')::bigint,backed_up=(a->>'backed_up')::boolean where id=k.id;
 insert into ecb_governance.sessions(scope,credential,ceremony,secret_hash,csrf_hash)
 values(s.id,k.id,c.id,a->>'secret_hash',a->>'csrf_hash') returning id into r;
 end if;
 update ecb_governance.ceremonies set proof=a->'proof',consumed_at=clock_timestamp() where id=c.id;
 return jsonb_build_object('id',r);
 elsif action='bind' then
 select jsonb_agg(jsonb_build_object('id',id,'credential_id',credential_id,'public_key',public_key) order by id) into keys from ecb_governance.credentials where scope=s.id;
 if jsonb_array_length(keys) is distinct from s.credential_count or ecb_governance.hash(keys::text) is distinct from a->>'credential_set_digest' then raise exception 'binding_changed'; end if;
 b:=ecb_governance.retain('binding',jsonb_build_object('scope',s.id,'h',s.h,'remit',s.remit,'p0',s.p0,'root_basis',s.root_basis,'credentials',keys,'rp_id',s.rp_id,'origin',s.origin)::text,'protected human setup completion');
 update ecb_governance.scopes set binding=b where id=s.id;
 insert into ecb_governance.decisions(scope,operation,policy,basis,h,explanation,request_id,fingerprint)
 values(s.id,'genesis',s.p0,s.root_basis,s.h,'Exact credential and scope binding completed through commissioned setup',(a->>'request_id')::uuid,ecb_governance.hash((a-'setup_secret')::text)) returning id into r;
 return jsonb_build_object('decision',r,'binding',b,'activated',false);
 elsif action='binding_digest' then
 perform ecb_governance.check_setup(s,a->>'setup_secret');
 select jsonb_agg(jsonb_build_object('id',id,'credential_id',credential_id,'public_key',public_key) order by id) into keys from ecb_governance.credentials where scope=s.id;
 return jsonb_build_object('digest',ecb_governance.hash(keys::text),'credentials',keys);
 end if;
 ss:=ecb_governance.check_session(s.id,a->>'session_secret',a->>'csrf',action<>'view');
 if action='view' then return ecb_governance.view_scope(s.id)||jsonb_build_object('session',jsonb_build_object('absolute_expires',ss.absolute_expires,'idle_expires',ss.last_active+interval '24 hours'));
 elsif action='logout' then update ecb_governance.sessions set invalidated_at=clock_timestamp() where id=ss.id; return jsonb_build_object('logged_out',true);
 elsif action not in ('accept','decline','withdraw') then raise exception 'unsupported_operation'; end if;
 if s.current_transition is null then raise exception 'governance_inactive'; end if;
 fp:=ecb_governance.hash((a-'session_secret'-'csrf')::text||action);
 select * into d from ecb_governance.decisions where scope=s.id and request_id=(a->>'request_id')::uuid;
 if found then if d.fingerprint<>fp then raise exception 'request_conflict'; end if; return to_jsonb(d); end if;
 select * into prior from ecb_governance.transitions where id=s.current_transition;
 if action='withdraw' then
 select * into d from ecb_governance.decisions where id=(a->>'decision')::uuid and scope=s.id and operation='succession' and h=s.h;
 if not found then raise exception 'not_own_pending_decision'; end if;
 select id into r from ecb_governance.transitions where decision=d.id;
 if found then return jsonb_build_object('already_completed',r); end if;
 if exists(select 1 from ecb_governance.decisions where target=d.id and operation='withdraw') then raise exception 'already_withdrawn'; end if;
 insert into ecb_governance.decisions(scope,operation,predecessor,basis,h,session_id,target,explanation,request_id,fingerprint)
 values(s.id,'withdraw',s.current_transition,s.current_transition,s.h,ss.id,d.id,coalesce(a->>'explanation',''),(a->>'request_id')::uuid,fp) returning id into r;
 else
 if s.current_transition is distinct from (a->>'predecessor')::uuid then raise exception 'stale_predecessor'; end if;
 select ecb_governance.policy(payload) into cp from ecb_governance.subjects where id=prior.policy;
 if (cp->>'requires_human_explanation')::boolean and length(trim(coalesce(a->>'explanation','')))=0 then raise exception 'explanation_required'; end if;
 if ecb_governance.hash(a->>'policy_bytes') is distinct from a->>'policy_digest' then raise exception 'wrong_digest'; end if;
 p:=ecb_governance.retain('policy',a->>'policy_bytes','exact human session decision');
 insert into ecb_governance.decisions(scope,operation,policy,predecessor,basis,h,session_id,explanation,request_id,fingerprint)
 values(s.id,case action when 'accept' then 'succession' else 'decline' end,p,s.current_transition,s.current_transition,s.h,ss.id,coalesce(a->>'explanation',''),(a->>'request_id')::uuid,fp) returning id into r;
 end if;
 return (select to_jsonb(x) from ecb_governance.decisions x where id=r);
end $$;

create function ecb_governance.executor(action text,a jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare s ecb_governance.scopes; d ecb_governance.decisions; t ecb_governance.transitions; r uuid; fp text; obligations jsonb;
begin
 select * into s from ecb_governance.scopes where id=(a->>'scope')::uuid for update;
 if not found then raise exception 'unknown_scope'; end if;
 if action='inspect' then return ecb_governance.view_scope(s.id); end if;
 if action not in ('execute','recover') then raise exception 'unsupported_operation'; end if;
 fp:=ecb_governance.hash(a::text);
 select * into t from ecb_governance.transitions where scope=s.id and request_id=(a->>'request_id')::uuid;
 if found then if t.fingerprint<>fp then raise exception 'request_conflict'; end if; return jsonb_build_object('outcome','committed','transition',to_jsonb(t)); end if;
 if (select count(*) from ecb_governance.transitions where scope=s.id and not exists(select 1 from ecb_governance.transitions child where child.predecessor=ecb_governance.transitions.id))<>(case when s.current_transition is null then 0 else 1 end)
 or (s.current_transition is not null and exists(select 1 from ecb_governance.transitions where predecessor=s.current_transition)) then raise exception 'inconsistent_history'; end if;
 if s.current_transition is not null and not exists(select 1 from ecb_governance.transitions where id=s.current_transition and h=s.h and remit=s.remit and binding=s.binding) then raise exception 'inconsistent_binding'; end if;
 if action='recover' then return jsonb_build_object('outcome','not_committed','current_transition',s.current_transition,'scope_locked',true); end if;
 select * into d from ecb_governance.decisions where id=(a->>'decision')::uuid and scope=s.id;
 if not found or d.operation not in ('genesis','succession') then raise exception 'authorization_required'; end if;
 if d.created_xid=pg_current_xact_id() then raise exception 'prior_commit_required'; end if;
 if exists(select 1 from ecb_governance.transitions where decision=d.id) then raise exception 'decision_consumed'; end if;
 if d.predecessor is distinct from s.current_transition or d.predecessor is distinct from (a->>'predecessor')::uuid then raise exception 'stale_predecessor'; end if;
 if s.binding is null or d.h<>s.h then raise exception 'binding_required'; end if;
 if (select digest from ecb_governance.subjects where id=d.policy) is distinct from a->>'policy_digest' then raise exception 'wrong_digest'; end if;
 perform ecb_governance.policy((select payload from ecb_governance.subjects where id=d.policy));
 if exists(select 1 from ecb_governance.decisions where target=d.id and operation='withdraw') then raise exception 'decision_withdrawn'; end if;
 if d.operation='genesis' then
 if s.current_transition is not null or d.policy<>s.p0 or d.basis<>s.root_basis then raise exception 'bootstrap_exhausted'; end if;
 obligations:='["activate_exact_p0","designate_initial_h_and_remit","exhaust_bootstrap"]';
 else
 if s.current_transition is null or d.basis<>s.current_transition then raise exception 'wrong_authority_basis'; end if;
 obligations:='["install_exact_successor","preserve_h_remit_history_and_exhaustion"]';
 end if;
 insert into ecb_governance.transitions(scope,predecessor,decision,policy,h,remit,binding,obligations,executor,request_id,fingerprint)
 values(s.id,d.predecessor,d.id,d.policy,s.h,s.remit,s.binding,obligations,session_user,(a->>'request_id')::uuid,fp) returning id into r;
 update ecb_governance.scopes set current_transition=r where id=s.id;
 return jsonb_build_object('outcome','committed','transition',(select to_jsonb(x) from ecb_governance.transitions x where id=r));
end $$;

-- Reassign only this private surface; all functions have explicit fixed search paths.
do $$ declare r record; begin
 for r in select tablename from pg_tables where schemaname='ecb_governance' loop
 execute format('alter table ecb_governance.%I owner to ecb_governance_owner',r.tablename);
 end loop;
 for r in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb_governance' loop
 execute format('alter function %s owner to ecb_governance_owner',r.signature);
 end loop;
end $$;
revoke all on all tables in schema ecb_governance from public,anon,authenticated,service_role,ecb_human_verifier,ecb_governance_executor;
revoke all on all functions in schema ecb_governance from public,anon,authenticated,service_role,ecb_human_verifier,ecb_governance_executor;
alter default privileges for role ecb_governance_owner in schema ecb_governance revoke all on tables from public,anon,authenticated,service_role;
alter default privileges for role ecb_governance_owner in schema ecb_governance revoke execute on functions from public,anon,authenticated,service_role;
grant execute on function ecb_governance.human(text,jsonb) to ecb_human_verifier;
grant execute on function ecb_governance.executor(text,jsonb) to ecb_governance_executor;
grant usage on schema ecb_governance to postgres;
grant execute on function ecb_governance.commission(text,text,text,text,text,integer) to postgres;
