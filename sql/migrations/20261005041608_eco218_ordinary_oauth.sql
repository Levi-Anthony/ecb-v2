-- ECO-218: ordinary-client OAuth grants; no change to the runtime-key authorizer.
-- Supabase remains the authorization server. This is application consent and
-- its documented access-token hook, not a token issuer/proxy.
begin;
create schema ecb_oauth;
revoke all on schema ecb_oauth from public, anon, authenticated, service_role;
grant usage on schema ecb_oauth to authenticated, anon, supabase_auth_admin;

create table ecb_oauth.principals (
  subject uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  enrolled_at timestamptz not null default now(),
  enrollment_basis text not null check (length(btrim(enrollment_basis)) > 0)
);
create table ecb_oauth.consumer_policies (
  id uuid primary key default gen_random_uuid(),
  consumer text not null,
  redirect_uri_pattern text not null unique,
  capability_ceiling text[] not null check (cardinality(capability_ceiling) between 1 and 3
    and capability_ceiling <@ array['recover','preserve','transition']::text[]),
  enabled boolean not null default true,
  source text not null
);
insert into ecb_oauth.consumer_policies(consumer,redirect_uri_pattern,capability_ceiling,source) values
 ('Claude','^https://claude\.ai/api/mcp/auth_callback$',array['recover','preserve','transition'],'https://claude.com/docs/connectors/building/authentication'),
 ('ChatGPT','^https://chatgpt\.com/(connector_platform_oauth_redirect|connector/oauth/[A-Za-z0-9_-]+)$',array['recover','preserve','transition'],'https://developers.openai.com/plugins/build/auth');
create table ecb_oauth.grants (
  id uuid primary key default gen_random_uuid(),
  subject uuid not null references ecb_oauth.principals(subject) on delete cascade,
  client_id uuid not null references auth.oauth_clients(id) on delete cascade,
  consumer_policy_id uuid not null references ecb_oauth.consumer_policies(id),
  resource text not null check (resource = 'https://ecb-v2-eight.vercel.app/api/mcp'),
  authorization_id text not null,
  capabilities text[] not null check (cardinality(capabilities) between 1 and 3
    and capabilities <@ array['recover','preserve','transition']::text[]),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index ecb_oauth_current_grant on ecb_oauth.grants(subject,client_id,resource) where revoked_at is null;
create index ecb_oauth_grant_client on ecb_oauth.grants(client_id);
alter table ecb_oauth.principals enable row level security;
alter table ecb_oauth.consumer_policies enable row level security;
alter table ecb_oauth.grants enable row level security;
revoke all on all tables in schema ecb_oauth from public,anon,authenticated,service_role;
grant select on all tables in schema ecb_oauth to supabase_auth_admin;
create policy hook_read_principals on ecb_oauth.principals for select to supabase_auth_admin using (true);
create policy hook_read_consumers on ecb_oauth.consumer_policies for select to supabase_auth_admin using (true);
create policy hook_read_grants on ecb_oauth.grants for select to supabase_auth_admin using (true);

create function ecb_oauth.require_user() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare v_subject uuid := auth.uid();
begin
  if v_subject is null or auth.jwt()->>'role' is distinct from 'authenticated'
    or auth.jwt()->>'client_id' is not null
    or auth.jwt()->>'is_anonymous' = 'true'
    or not exists (select 1 from auth.users u where u.id=v_subject and u.email_confirmed_at is not null
      and u.deleted_at is null and (u.banned_until is null or u.banned_until<=now())) then
    raise exception 'ecb218_login_required' using errcode='28000';
  end if;
  return v_subject;
end $$;

create function ecb_oauth.user_context() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_subject uuid := ecb_oauth.require_user(); connections jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('client_id',g.client_id,'client_name',coalesce(c.client_name,cp.consumer||' connection'),
    'capabilities',g.capabilities) order by g.granted_at),'[]'::jsonb) into connections
  from ecb_oauth.grants g join auth.oauth_clients c on c.id=g.client_id
    join ecb_oauth.consumer_policies cp on cp.id=g.consumer_policy_id
  where g.subject=v_subject and g.revoked_at is null and c.deleted_at is null;
  return jsonb_build_object('enrolled',exists(select 1 from ecb_oauth.principals p where p.subject=v_subject and p.enabled),
    'grants',connections);
end $$;

create function ecb_oauth.authorization_context(p_authorization_id text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_subject uuid := ecb_oauth.require_user(); request auth.oauth_authorizations%rowtype;
  policy ecb_oauth.consumer_policies%rowtype; matching integer;
begin
  select a.* into request from auth.oauth_authorizations a where a.authorization_id=p_authorization_id
    and a.user_id=v_subject and a.status in ('pending','approved') and a.expires_at>now()
    and a.resource='https://ecb-v2-eight.vercel.app/api/mcp' and a.code_challenge_method='s256'
    and exists(select 1 from auth.oauth_clients c where c.id=a.client_id and c.deleted_at is null);
  if not found then return null; end if;
  select count(*) into matching from ecb_oauth.consumer_policies cp where cp.enabled and request.redirect_uri ~ cp.redirect_uri_pattern;
  if matching<>1 then return null; end if;
  select cp.* into policy from ecb_oauth.consumer_policies cp where cp.enabled and request.redirect_uri ~ cp.redirect_uri_pattern;
  return jsonb_build_object('consumer',policy.consumer,'policy_id',policy.id,'redirect_uri',request.redirect_uri,'capability_ceiling',policy.capability_ceiling);
end $$;

create function ecb_oauth.approve(p_authorization_id text,p_capabilities text[]) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_subject uuid := ecb_oauth.require_user(); request auth.oauth_authorizations%rowtype; grant_id uuid; caps text[]; context jsonb;
begin
  if not exists(select 1 from ecb_oauth.principals p where p.subject=v_subject and p.enabled) then
    raise exception 'ecb218_principal_not_enrolled' using errcode='42501';
  end if;
  if p_capabilities is null or cardinality(p_capabilities) not between 1 and 3
    or not(p_capabilities <@ array['recover','preserve','transition']::text[]) or array_position(p_capabilities,null) is not null then
    raise exception 'ecb218_invalid_capabilities' using errcode='22023';
  end if;
  select array_agg(distinct cap order by cap) into caps from unnest(p_capabilities) cap;
  if cardinality(caps) <> cardinality(p_capabilities) then raise exception 'ecb218_duplicate_capabilities' using errcode='22023'; end if;
  select a.* into request from auth.oauth_authorizations a
  where a.authorization_id=p_authorization_id and a.user_id=v_subject and a.status='pending' and a.expires_at>now()
    and a.resource='https://ecb-v2-eight.vercel.app/api/mcp'
    and a.code_challenge_method='s256'
    and exists(select 1 from auth.oauth_clients c where c.id=a.client_id and c.deleted_at is null)
  for update;
  if not found then raise exception 'ecb218_invalid_authorization' using errcode='42501'; end if;
  context := ecb_oauth.authorization_context(p_authorization_id);
  if context is null or exists(select 1 from unnest(caps) cap where not(context->'capability_ceiling' ? cap)) then
    raise exception 'ecb218_consumer_policy_denied' using errcode='42501';
  end if;
  update ecb_oauth.grants g set revoked_at=now() where g.subject=v_subject and g.client_id=request.client_id and g.revoked_at is null;
  insert into ecb_oauth.grants(subject,client_id,consumer_policy_id,resource,authorization_id,capabilities)
    values(v_subject,request.client_id,(context->>'policy_id')::uuid,request.resource,p_authorization_id,caps) returning id into grant_id;
  return grant_id;
end $$;

create function ecb_oauth.authorization_valid(p_authorization_id text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_subject uuid := ecb_oauth.require_user();
begin
  return exists(select 1 from auth.oauth_authorizations a join ecb_oauth.grants g on g.subject=a.user_id and g.client_id=a.client_id and g.resource=a.resource
    join ecb_oauth.principals p on p.subject=g.subject
    where a.authorization_id=p_authorization_id and a.user_id=v_subject and a.status='approved' and a.expires_at>now()
      and ecb_oauth.authorization_context(p_authorization_id)->>'policy_id'=g.consumer_policy_id::text and p.enabled and g.revoked_at is null);
end $$;

create function ecb_oauth.revoke(p_client_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_subject uuid := ecb_oauth.require_user();
begin
  update ecb_oauth.grants g set revoked_at=now() where g.subject=v_subject and g.client_id=p_client_id and g.revoked_at is null;
end $$;

create function ecb_oauth.check_access(p_subject uuid,p_client_id uuid,p_session_id uuid,p_grant_id uuid,p_resource text) returns text[]
language plpgsql stable security definer set search_path = '' as $$
declare caps text[];
begin
  perform ecb11.assert_runtime_key();
  select g.capabilities into caps from ecb_oauth.grants g
    join ecb_oauth.principals p on p.subject=g.subject and p.enabled
    join ecb_oauth.consumer_policies cp on cp.id=g.consumer_policy_id and cp.enabled and g.capabilities <@ cp.capability_ceiling
    join auth.users u on u.id=g.subject and u.email_confirmed_at is not null
      and u.deleted_at is null and (u.banned_until is null or u.banned_until<=now())
    join auth.oauth_clients c on c.id=g.client_id and c.deleted_at is null
    join auth.sessions s on s.id=p_session_id and s.user_id=g.subject and s.oauth_client_id=g.client_id
      and (s.not_after is null or s.not_after>now())
  where g.id=p_grant_id and g.subject=p_subject and g.client_id=p_client_id and g.resource=p_resource and g.revoked_at is null
    and exists(select 1 from auth.oauth_consents consent where consent.user_id=g.subject and consent.client_id=g.client_id and consent.revoked_at is null);
  return caps;
end $$;

create function ecb_oauth.access_token_hook(event jsonb) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare claims jsonb := event->'claims'; allowed ecb_oauth.grants%rowtype;
begin
  -- Use issuer-owned claims only. User-editable user_metadata is never authority.
  claims := claims - 'ecb_capabilities' - 'ecb_grant_id';
  if claims->>'client_id' is not null then
    select g.* into allowed from ecb_oauth.grants g
      join ecb_oauth.principals p on p.subject=g.subject and p.enabled
      join ecb_oauth.consumer_policies cp on cp.id=g.consumer_policy_id and cp.enabled and g.capabilities <@ cp.capability_ceiling
      join auth.users u on u.id=g.subject and u.email_confirmed_at is not null
        and u.deleted_at is null and (u.banned_until is null or u.banned_until<=now())
      join auth.oauth_clients client on client.id=g.client_id and client.deleted_at is null
    where g.subject=(claims->>'sub')::uuid and g.client_id=(claims->>'client_id')::uuid and g.revoked_at is null
      and exists(select 1 from auth.oauth_consents c where c.user_id=g.subject and c.client_id=g.client_id and c.revoked_at is null);
    if found then
      claims := jsonb_set(claims,'{aud}',to_jsonb(allowed.resource));
      claims := jsonb_set(claims,'{ecb_capabilities}',to_jsonb(allowed.capabilities));
      claims := jsonb_set(claims,'{ecb_grant_id}',to_jsonb(allowed.id::text));
    end if;
  end if;
  return jsonb_set(event,'{claims}',claims);
end $$;

-- Private definer functions contain the checks; public RPCs are invoker wrappers.
revoke all on all functions in schema ecb_oauth from public,anon,authenticated,service_role;
grant execute on function ecb_oauth.user_context(),ecb_oauth.authorization_context(text),ecb_oauth.approve(text,text[]),ecb_oauth.authorization_valid(text),ecb_oauth.revoke(uuid) to authenticated;
grant execute on function ecb_oauth.check_access(uuid,uuid,uuid,uuid,text) to anon;
grant execute on function ecb_oauth.access_token_hook(jsonb) to supabase_auth_admin;

create function public.ecb218_oauth_context() returns jsonb language sql security invoker set search_path='' as $$ select ecb_oauth.user_context() $$;
create function public.ecb218_oauth_authorization_context(p_authorization_id text) returns jsonb language sql security invoker set search_path='' as $$ select ecb_oauth.authorization_context(p_authorization_id) $$;
create function public.ecb218_oauth_approve(p_authorization_id text,p_capabilities text[]) returns uuid language sql security invoker set search_path='' as $$ select ecb_oauth.approve(p_authorization_id,p_capabilities) $$;
create function public.ecb218_oauth_authorization_valid(p_authorization_id text) returns boolean language sql security invoker set search_path='' as $$ select ecb_oauth.authorization_valid(p_authorization_id) $$;
create function public.ecb218_oauth_revoke(p_client_id uuid) returns void language sql security invoker set search_path='' as $$ select ecb_oauth.revoke(p_client_id) $$;
create function public.ecb218_oauth_check(p_subject uuid,p_client_id uuid,p_session_id uuid,p_grant_id uuid,p_resource text) returns text[] language sql security invoker set search_path='' as $$ select ecb_oauth.check_access(p_subject,p_client_id,p_session_id,p_grant_id,p_resource) $$;
revoke all on function public.ecb218_oauth_context(),public.ecb218_oauth_authorization_context(text),public.ecb218_oauth_approve(text,text[]),public.ecb218_oauth_authorization_valid(text),public.ecb218_oauth_revoke(uuid),public.ecb218_oauth_check(uuid,uuid,uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.ecb218_oauth_context(),public.ecb218_oauth_authorization_context(text),public.ecb218_oauth_approve(text,text[]),public.ecb218_oauth_authorization_valid(text),public.ecb218_oauth_revoke(uuid) to authenticated;
grant execute on function public.ecb218_oauth_check(uuid,uuid,uuid,uuid,text) to anon;
commit;
