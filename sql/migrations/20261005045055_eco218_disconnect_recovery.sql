-- Keep a revoked ECB grant visible only while native consent still needs removal.
-- The MCP authorizer continues denying it immediately after application revocation.
begin;
create or replace function ecb_oauth.user_context() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_subject uuid := ecb_oauth.require_user(); connections jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('client_id',connection.client_id,
    'client_name',connection.client_name,'capabilities',connection.capabilities,
    'disconnect_pending',connection.revoked_at is not null) order by connection.granted_at),'[]'::jsonb) into connections
  from (
    select distinct on (g.client_id) g.client_id,g.capabilities,g.revoked_at,g.granted_at,
      coalesce(c.client_name,cp.consumer||' connection') as client_name
    from ecb_oauth.grants g join auth.oauth_clients c on c.id=g.client_id
      join ecb_oauth.consumer_policies cp on cp.id=g.consumer_policy_id
    where g.subject=v_subject and c.deleted_at is null and (g.revoked_at is null
      or exists(select 1 from auth.oauth_consents consent where consent.user_id=g.subject
        and consent.client_id=g.client_id and consent.revoked_at is null))
    order by g.client_id,(g.revoked_at is null) desc,g.granted_at desc,g.id
  ) connection;
  return jsonb_build_object('enrolled',exists(select 1 from ecb_oauth.principals p where p.subject=v_subject and p.enabled),
    'grants',connections);
end $$;
commit;
