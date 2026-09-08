-- BUILD 6 construction correction — setup recovery visibility.
--
-- The released Move requires interrupted protected setup to inspect the exact inert candidate
-- credential set before binding. The initial construction exposed WebAuthn credential IDs for
-- exclusion but omitted their native credential Referent IDs, which made exact post-restart
-- binding unrecoverable through the restricted verifier route. This replacement changes no
-- authority or activation semantics; it only completes the already-released recovery surface.

set role ecb_governance_native;

create or replace function ecb_governance.registration_context(
  p_setup_id uuid,
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  setup_row ecb_governance.setup_grants%rowtype;
  p0_digest text;
  candidates jsonb;
  candidate_count integer;
begin
  select * into strict setup_row
  from ecb_governance.setup_grants
  where id = p_setup_id;

  if setup_row.token_digest <>
       extensions.digest(pg_catalog.convert_to(p_token, 'UTF8'), 'sha256')
     or setup_row.consumed_at is not null
     or setup_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 setup capability is unavailable'
      using errcode = '42501';
  end if;

  select pg_catalog.encode(s.payload_digest, 'hex')
  into strict p0_digest
  from ecb_governance.subjects s
  where s.id = setup_row.p0_subject_id and s.subject_kind = 'policy';

  select
    pg_catalog.count(*),
    coalesce(
      pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'credential_ref', c.id,
          'id', c.credential_id,
          'transports', c.transports,
          'device_type', c.device_type,
          'backed_up', c.backed_up,
          'bound', c.bound_at is not null
        ) order by c.recorded_at, c.id
      ),
      '[]'::jsonb
    )
  into candidate_count, candidates
  from ecb_governance.credentials c
  where c.setup_grant_id = p_setup_id;

  return pg_catalog.jsonb_build_object(
    'setup_id', setup_row.id,
    'scope_id', setup_row.scope_id,
    'external_basis_subject_id', setup_row.external_basis_subject_id,
    'remit_subject_id', setup_row.remit_subject_id,
    'p0_subject_id', setup_row.p0_subject_id,
    'p0_digest', p0_digest,
    'rp_id', setup_row.rp_id,
    'origin', setup_row.expected_origin,
    'user_handle_hex', pg_catalog.encode(setup_row.webauthn_user_handle, 'hex'),
    'expected_credential_count', setup_row.expected_credential_count,
    'expires_at', setup_row.expires_at,
    'candidates', candidates,
    'exclude_credentials', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('id', item ->> 'id', 'transports', item -> 'transports')
          order by item ->> 'id'
        ),
        '[]'::jsonb
      )
      from pg_catalog.jsonb_array_elements(candidates) item
    ),
    'remaining', setup_row.expected_credential_count - candidate_count
  );
end;
$fn$;

reset role;
