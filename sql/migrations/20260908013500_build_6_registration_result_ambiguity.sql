-- BUILD 6 construction correction — registration result ambiguity.
--
-- Disposable run 6 reached the protected registration path and exposed one PL/pgSQL naming
-- collision: the local generated credential Referent used the same identifier as the ceremonies
-- table column. Rename only the local variable; authority, verification, custody and persistence
-- semantics are unchanged.

set role ecb_governance_native;

create or replace function ecb_governance.complete_registration(
  p_ceremony_id uuid,
  p_preauth_token text,
  p_response_json text,
  p_credential_id text,
  p_public_key bytea,
  p_algorithm integer,
  p_counter bigint,
  p_transports text[],
  p_device_type text,
  p_backed_up boolean,
  p_user_verified boolean,
  p_origin text,
  p_cross_origin boolean,
  p_verified boolean,
  p_credential_ref uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  ceremony_row ecb_governance.ceremonies%rowtype;
  setup_row ecb_governance.setup_grants%rowtype;
  new_credential_ref uuid := coalesce(p_credential_ref, pg_catalog.gen_random_uuid());
begin
  select * into strict ceremony_row from ecb_governance.ceremonies
  where id = p_ceremony_id for update;
  if ceremony_row.purpose <> 'registration'
     or ceremony_row.consumed_at is not null
     or ceremony_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 registration ceremony is unavailable' using errcode = '55000';
  end if;
  if ceremony_row.preauth_digest <> extensions.digest(pg_catalog.convert_to(p_preauth_token, 'UTF8'), 'sha256') then
    raise exception 'BUILD 6 preauthentication binding mismatch' using errcode = '42501';
  end if;
  select * into strict setup_row from ecb_governance.setup_grants
  where id = ceremony_row.setup_grant_id for update;
  if setup_row.consumed_at is not null or setup_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 setup capability is unavailable' using errcode = '42501';
  end if;
  if p_verified is not true or p_user_verified is not true or p_cross_origin is not false
     or p_origin <> setup_row.expected_origin then
    raise exception 'BUILD 6 registration verification did not satisfy the protected boundary'
      using errcode = '42501';
  end if;
  if p_credential_id is null or p_credential_id = '' or p_public_key is null
     or pg_catalog.octet_length(p_public_key) = 0 or p_counter < 0
     or p_device_type not in ('singleDevice', 'multiDevice') then
    raise exception 'BUILD 6 verified registration data is incomplete' using errcode = '22023';
  end if;
  if (select pg_catalog.count(*) from ecb_governance.credentials
      where setup_grant_id = setup_row.id) >= setup_row.expected_credential_count then
    raise exception 'BUILD 6 expected credential count is already satisfied' using errcode = '55000';
  end if;

  perform ecb_governance.register_native(new_credential_ref);
  insert into ecb_governance.credentials (
    id, scope_id, setup_grant_id, registration_ceremony_id, rp_id,
    credential_id, webauthn_user_handle, public_key, algorithm, sign_count,
    transports, device_type, backed_up
  ) values (
    new_credential_ref, ceremony_row.scope_id, setup_row.id, ceremony_row.id, setup_row.rp_id,
    p_credential_id, setup_row.webauthn_user_handle, p_public_key, p_algorithm, p_counter,
    coalesce(p_transports, '{}'::text[]), p_device_type, p_backed_up
  );

  update ecb_governance.ceremonies as c
  set consumed_at = pg_catalog.transaction_timestamp(), outcome_code = 'verified',
      response_json = p_response_json, credential_ref = new_credential_ref,
      observed_origin = p_origin, user_verified = true, cross_origin = false,
      verified_at = pg_catalog.transaction_timestamp()
  where c.id = ceremony_row.id;

  return pg_catalog.jsonb_build_object(
    'status', 'registered_inert',
    'credential_ref', new_credential_ref,
    'credential_id', p_credential_id,
    'device_type', p_device_type,
    'backed_up', p_backed_up
  );
end;
$fn$;

reset role;
