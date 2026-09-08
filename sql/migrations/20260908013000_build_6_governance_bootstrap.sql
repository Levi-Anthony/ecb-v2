-- BUILD 6 — Governance Bootstrap
-- Released Move construction only. Private governance records, protected human-session entries,
-- bounded executor entries, one-use setup capability, prior-committed decision enforcement,
-- and atomic genesis/succession. No BUILD 7 semantics and no canonical fixture activation here.
--
-- This file intentionally carries no BEGIN/COMMIT. Qualification and canonical installation
-- must wrap the exact migration bytes in the released outer transaction/ledger procedure.

create role ecb_governance_native
  nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role ecb_governance_installer
  nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role ecb_governance_verifier
  login password null nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
create role ecb_governance_executor
  login password null nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;

create schema ecb_governance authorization ecb_governance_native;
revoke all on schema ecb_governance from public, anon, authenticated, service_role;
grant usage on schema ecb_governance
  to ecb_governance_installer, ecb_governance_verifier, ecb_governance_executor;

-- Native records remain universal Referents. The purpose-specific native owner gets only the
-- identity-registry capabilities required to register and validate those identities.
grant select, references on table public.referents to ecb_governance_native;
grant insert (id) on table public.referents to ecb_governance_native;

set role ecb_governance_native;

alter default privileges in schema ecb_governance revoke all on tables from public;
alter default privileges in schema ecb_governance revoke execute on functions from public;

create table ecb_governance.subjects (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  subject_kind text not null,
  payload_text text not null,
  format_id text not null,
  payload_digest bytea not null,
  source_ref text not null,
  recorded_at timestamptz not null default pg_catalog.transaction_timestamp(),
  created_xid xid8 not null default pg_catalog.pg_current_xact_id(),
  constraint governance_subject_kind
    check (subject_kind in ('policy', 'remit', 'external_basis', 'binding')),
  constraint governance_subject_digest_sha256
    check (pg_catalog.octet_length(payload_digest) = 32),
  constraint governance_subject_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create table ecb_governance.scopes (
  id uuid primary key,
  binding_subject_id uuid,
  current_transition_id uuid,
  bootstrap_exhausted boolean not null default false,
  created_at timestamptz not null default pg_catalog.transaction_timestamp(),
  constraint governance_scope_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_scope_binding_referent
    foreign key (binding_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_scope_transition_referent
    foreign key (current_transition_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_scope_bootstrap_shape
    check (not bootstrap_exhausted or current_transition_id is not null)
);

create table ecb_governance.setup_grants (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  scope_id uuid not null,
  external_basis_subject_id uuid not null,
  remit_subject_id uuid not null,
  p0_subject_id uuid not null,
  rp_id text not null,
  expected_origin text not null,
  webauthn_user_handle bytea not null,
  token_digest bytea not null,
  expected_credential_count smallint not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  binding_subject_id uuid,
  genesis_decision_id uuid,
  bound_credentials_digest bytea,
  recorded_at timestamptz not null default pg_catalog.transaction_timestamp(),
  created_xid xid8 not null default pg_catalog.pg_current_xact_id(),
  constraint governance_setup_token_sha256
    check (pg_catalog.octet_length(token_digest) = 32),
  constraint governance_setup_handle_size
    check (pg_catalog.octet_length(webauthn_user_handle) between 16 and 64),
  constraint governance_setup_credential_count
    check (expected_credential_count between 1 and 3),
  constraint governance_setup_bound_digest
    check (bound_credentials_digest is null or pg_catalog.octet_length(bound_credentials_digest) = 32),
  constraint governance_setup_consumption_shape
    check (
      (consumed_at is null and binding_subject_id is null and genesis_decision_id is null
       and bound_credentials_digest is null)
      or
      (consumed_at is not null and binding_subject_id is not null and genesis_decision_id is not null
       and bound_credentials_digest is not null)
    ),
  constraint governance_setup_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_setup_scope_referent
    foreign key (scope_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_setup_basis_referent
    foreign key (external_basis_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_setup_remit_referent
    foreign key (remit_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_setup_p0_referent
    foreign key (p0_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_setup_binding_referent
    foreign key (binding_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_setup_decision_referent
    foreign key (genesis_decision_id) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create unique index governance_one_open_setup_per_scope
  on ecb_governance.setup_grants (scope_id)
  where consumed_at is null;
create unique index governance_setup_token_unique
  on ecb_governance.setup_grants (token_digest);

create table ecb_governance.ceremonies (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  scope_id uuid not null,
  setup_grant_id uuid,
  purpose text not null,
  challenge text not null,
  preauth_digest bytea not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  outcome_code text,
  response_json text,
  credential_ref uuid,
  session_ref uuid,
  observed_origin text,
  user_verified boolean,
  cross_origin boolean,
  verified_at timestamptz,
  recorded_at timestamptz not null default pg_catalog.transaction_timestamp(),
  constraint governance_ceremony_purpose
    check (purpose in ('registration', 'authentication')),
  constraint governance_ceremony_preauth_sha256
    check (pg_catalog.octet_length(preauth_digest) = 32),
  constraint governance_ceremony_outcome_shape
    check (
      (consumed_at is null and outcome_code is null and verified_at is null)
      or
      (consumed_at is not null and outcome_code is not null)
    ),
  constraint governance_ceremony_reason_code
    check (outcome_code is null or outcome_code ~ '^[a-z0-9_]{1,64}$'),
  constraint governance_ceremony_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_ceremony_scope_referent
    foreign key (scope_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_ceremony_setup_referent
    foreign key (setup_grant_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_ceremony_credential_referent
    foreign key (credential_ref) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_ceremony_session_referent
    foreign key (session_ref) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create unique index governance_open_challenge_unique
  on ecb_governance.ceremonies (challenge)
  where consumed_at is null;

create table ecb_governance.credentials (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  scope_id uuid not null,
  setup_grant_id uuid not null,
  registration_ceremony_id uuid not null,
  binding_subject_id uuid,
  rp_id text not null,
  credential_id text not null,
  webauthn_user_handle bytea not null,
  public_key bytea not null,
  algorithm integer not null,
  sign_count bigint not null,
  transports text[] not null default '{}'::text[],
  device_type text not null,
  backed_up boolean not null,
  bound_at timestamptz,
  revoked_at timestamptz,
  recorded_at timestamptz not null default pg_catalog.transaction_timestamp(),
  constraint governance_credential_counter
    check (sign_count >= 0),
  constraint governance_credential_device_type
    check (device_type in ('singleDevice', 'multiDevice')),
  constraint governance_credential_binding_shape
    check (
      (bound_at is null and binding_subject_id is null)
      or (bound_at is not null and binding_subject_id is not null)
    ),
  constraint governance_credential_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_credential_scope_referent
    foreign key (scope_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_credential_setup_referent
    foreign key (setup_grant_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_credential_ceremony_referent
    foreign key (registration_ceremony_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_credential_binding_referent
    foreign key (binding_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create unique index governance_credential_id_unique
  on ecb_governance.credentials (rp_id, credential_id);

create table ecb_governance.sessions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  scope_id uuid not null,
  binding_subject_id uuid not null,
  credential_ref uuid not null,
  authentication_ceremony_id uuid not null,
  secret_digest bytea not null,
  csrf_digest bytea not null,
  created_at timestamptz not null,
  last_active_at timestamptz not null,
  inactivity_expires_at timestamptz not null,
  absolute_expires_at timestamptz not null,
  invalidated_at timestamptz,
  constraint governance_session_secret_sha256
    check (pg_catalog.octet_length(secret_digest) = 32),
  constraint governance_session_csrf_sha256
    check (pg_catalog.octet_length(csrf_digest) = 32),
  constraint governance_session_times
    check (
      created_at <= last_active_at
      and created_at < inactivity_expires_at
      and inactivity_expires_at <= absolute_expires_at
    ),
  constraint governance_session_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_session_scope_referent
    foreign key (scope_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_session_binding_referent
    foreign key (binding_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_session_credential_referent
    foreign key (credential_ref) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_session_ceremony_referent
    foreign key (authentication_ceremony_id) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create unique index governance_session_secret_unique
  on ecb_governance.sessions (secret_digest);

create table ecb_governance.decisions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  scope_id uuid not null,
  decision_kind text not null,
  target_subject_id uuid,
  target_digest bytea,
  target_decision_id uuid,
  expected_current_transition_id uuid,
  issuer_binding_subject_id uuid,
  prior_authority_ref uuid not null,
  remit_subject_id uuid,
  session_id uuid,
  permitted_executor_class text not null,
  explanation_text text,
  source_acceptance_ref text not null,
  request_id uuid not null,
  request_fingerprint bytea not null,
  recorded_at timestamptz not null default pg_catalog.transaction_timestamp(),
  created_xid xid8 not null default pg_catalog.pg_current_xact_id(),
  constraint governance_decision_kind
    check (decision_kind in (
      'genesis_authorization', 'succession_authorization', 'succession_decline', 'withdrawal'
    )),
  constraint governance_decision_executor_class
    check (permitted_executor_class in ('governance_executor', 'none')),
  constraint governance_decision_target_digest
    check (target_digest is null or pg_catalog.octet_length(target_digest) = 32),
  constraint governance_decision_request_digest
    check (pg_catalog.octet_length(request_fingerprint) = 32),
  constraint governance_decision_shape
    check (
      (decision_kind = 'genesis_authorization'
        and target_subject_id is not null and target_digest is not null
        and target_decision_id is null and expected_current_transition_id is null
        and issuer_binding_subject_id is not null and remit_subject_id is not null
        and session_id is null and permitted_executor_class = 'governance_executor')
      or
      (decision_kind in ('succession_authorization', 'succession_decline')
        and target_subject_id is not null and target_digest is not null
        and target_decision_id is null and expected_current_transition_id is not null
        and issuer_binding_subject_id is not null and remit_subject_id is null
        and session_id is not null)
      or
      (decision_kind = 'withdrawal'
        and target_subject_id is null and target_digest is null
        and target_decision_id is not null and expected_current_transition_id is not null
        and issuer_binding_subject_id is not null and remit_subject_id is null
        and session_id is not null and permitted_executor_class = 'none')
    ),
  constraint governance_decision_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_scope_referent
    foreign key (scope_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_target_referent
    foreign key (target_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_target_decision_referent
    foreign key (target_decision_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_expected_referent
    foreign key (expected_current_transition_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_issuer_referent
    foreign key (issuer_binding_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_authority_referent
    foreign key (prior_authority_ref) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_remit_referent
    foreign key (remit_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_decision_session_referent
    foreign key (session_id) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create unique index governance_decision_request_unique
  on ecb_governance.decisions (request_id);
create unique index governance_one_withdrawal_per_decision
  on ecb_governance.decisions (target_decision_id)
  where decision_kind = 'withdrawal';

create table ecb_governance.transitions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  scope_id uuid not null,
  transition_kind text not null,
  predecessor_id uuid,
  decision_id uuid not null,
  policy_subject_id uuid not null,
  binding_subject_id uuid not null,
  remit_subject_id uuid not null,
  external_basis_subject_id uuid not null,
  executor_class text not null,
  request_id uuid not null,
  request_fingerprint bytea not null,
  sequence_no bigint not null,
  bootstrap_exhausted boolean not null,
  recorded_at timestamptz not null default pg_catalog.transaction_timestamp(),
  created_xid xid8 not null default pg_catalog.pg_current_xact_id(),
  constraint governance_transition_kind
    check (transition_kind in ('genesis', 'succession')),
  constraint governance_transition_executor
    check (executor_class = 'governance_executor'),
  constraint governance_transition_request_digest
    check (pg_catalog.octet_length(request_fingerprint) = 32),
  constraint governance_transition_sequence
    check (sequence_no >= 1),
  constraint governance_transition_shape
    check (
      (transition_kind = 'genesis' and predecessor_id is null and sequence_no = 1
       and bootstrap_exhausted)
      or
      (transition_kind = 'succession' and predecessor_id is not null and sequence_no > 1
       and bootstrap_exhausted)
    ),
  constraint governance_transition_id_referent
    foreign key (id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_scope_referent
    foreign key (scope_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_predecessor_referent
    foreign key (predecessor_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_decision_referent
    foreign key (decision_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_policy_referent
    foreign key (policy_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_binding_referent
    foreign key (binding_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_remit_referent
    foreign key (remit_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable,
  constraint governance_transition_basis_referent
    foreign key (external_basis_subject_id) references public.referents (id)
    on update restrict on delete restrict not deferrable
);

create unique index governance_transition_decision_unique
  on ecb_governance.transitions (decision_id);
create unique index governance_transition_request_unique
  on ecb_governance.transitions (request_id);
create unique index governance_transition_sequence_unique
  on ecb_governance.transitions (scope_id, sequence_no);
create unique index governance_one_genesis_per_scope
  on ecb_governance.transitions (scope_id)
  where predecessor_id is null;
create unique index governance_one_successor_per_predecessor
  on ecb_governance.transitions (scope_id, predecessor_id)
  where predecessor_id is not null;

-- No table is directly writable by runtime callers. RLS is defense in depth; all effects flow
-- through explicitly granted SECURITY DEFINER functions owned by ecb_governance_native.
alter table ecb_governance.subjects enable row level security;
alter table ecb_governance.scopes enable row level security;
alter table ecb_governance.setup_grants enable row level security;
alter table ecb_governance.ceremonies enable row level security;
alter table ecb_governance.credentials enable row level security;
alter table ecb_governance.sessions enable row level security;
alter table ecb_governance.decisions enable row level security;
alter table ecb_governance.transitions enable row level security;

revoke all on all tables in schema ecb_governance
  from public, anon, authenticated, service_role,
       ecb_governance_installer, ecb_governance_verifier, ecb_governance_executor;

create function ecb_governance.register_native(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if p_id is null then
    raise exception 'BUILD 6 native Referent id is required' using errcode = '23502';
  end if;
  if exists (select 1 from public.referents where id = p_id) then
    raise exception 'BUILD 6 Referent % is already registered', p_id using errcode = '23505';
  end if;
  insert into public.referents (id) values (p_id);
end;
$fn$;

create function ecb_governance.validate_policy_payload(p_payload text)
returns bytea
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  doc json;
  queue json[];
  node json;
  key_total bigint;
  key_distinct bigint;
  preserves_values text[];
begin
  if p_payload is null then
    raise exception 'BUILD 6 policy bytes are required' using errcode = '23502';
  end if;

  begin
    doc := p_payload::json;
  exception when others then
    raise exception 'BUILD 6 unsupported policy: invalid JSON' using errcode = '22023';
  end;

  if pg_catalog.json_typeof(doc) <> 'object' then
    raise exception 'BUILD 6 unsupported policy: top level must be object' using errcode = '22023';
  end if;

  -- Detect duplicate object keys before jsonb normalization, at every object depth.
  queue := array[doc];
  while coalesce(pg_catalog.array_length(queue, 1), 0) > 0 loop
    node := queue[1];
    queue := queue[2:];
    if pg_catalog.json_typeof(node) = 'object' then
      select pg_catalog.count(*), pg_catalog.count(distinct k)
        into key_total, key_distinct
      from pg_catalog.json_object_keys(node) as keys(k);
      if key_total <> key_distinct then
        raise exception 'BUILD 6 unsupported policy: duplicate JSON key' using errcode = '22023';
      end if;
      queue := queue || array(select value from pg_catalog.json_each(node));
    elsif pg_catalog.json_typeof(node) = 'array' then
      queue := queue || array(select value from pg_catalog.json_array_elements(node));
    end if;
  end loop;

  if (select pg_catalog.count(*) from pg_catalog.json_object_keys(doc)) <> 11
     or pg_catalog.json_typeof(doc -> 'format') <> 'string'
     or doc ->> 'format' <> 'ecb.build6.policy.v1'
     or pg_catalog.json_typeof(doc -> 'operation') <> 'string'
     or doc ->> 'operation' <> 'policy_succession'
     or pg_catalog.json_typeof(doc -> 'authorizer') <> 'string'
     or doc ->> 'authorizer' <> 'current_designated_h_in_scope'
     or pg_catalog.json_typeof(doc -> 'requires_prior_committed_exact_decision') <> 'boolean'
     or doc ->> 'requires_prior_committed_exact_decision' <> 'true'
     or pg_catalog.json_typeof(doc -> 'requires_expected_current_predecessor') <> 'boolean'
     or doc ->> 'requires_expected_current_predecessor' <> 'true'
     or pg_catalog.json_typeof(doc -> 'requires_unwithdrawn_decision') <> 'boolean'
     or doc ->> 'requires_unwithdrawn_decision' <> 'true'
     or pg_catalog.json_typeof(doc -> 'requires_human_explanation') <> 'boolean'
     or pg_catalog.json_typeof(doc -> 'pending_decision_withdrawal') <> 'string'
     or doc ->> 'pending_decision_withdrawal' <> 'issuing_h_only'
     or pg_catalog.json_typeof(doc -> 'allows_delegation') <> 'boolean'
     or doc ->> 'allows_delegation' <> 'false'
     or pg_catalog.json_typeof(doc -> 'allows_other_operations') <> 'boolean'
     or doc ->> 'allows_other_operations' <> 'false'
     or pg_catalog.json_typeof(doc -> 'preserves') <> 'array' then
    raise exception 'BUILD 6 unsupported policy: fixed profile mismatch' using errcode = '22023';
  end if;

  select pg_catalog.array_agg(value order by ordinality)
    into preserves_values
  from pg_catalog.json_array_elements_text(doc -> 'preserves') with ordinality as p(value, ordinality);

  if preserves_values is distinct from array[
    'governance_scope',
    'initial_h_designation_and_remit',
    'prior_authority_history',
    'bootstrap_exhaustion'
  ]::text[] then
    raise exception 'BUILD 6 unsupported policy: preserves profile mismatch' using errcode = '22023';
  end if;

  return extensions.digest(pg_catalog.convert_to(p_payload, 'UTF8'), 'sha256');
end;
$fn$;

create function ecb_governance.retain_subject_internal(
  p_id uuid,
  p_kind text,
  p_payload text,
  p_format text,
  p_source_ref text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  actual_id uuid := coalesce(p_id, pg_catalog.gen_random_uuid());
  actual_digest bytea;
begin
  if p_kind not in ('policy', 'remit', 'external_basis', 'binding') then
    raise exception 'BUILD 6 unsupported subject kind %', p_kind using errcode = '22023';
  end if;
  if p_payload is null or p_format is null or p_source_ref is null
     or p_format = '' or p_source_ref = '' then
    raise exception 'BUILD 6 subject payload, format and source are required' using errcode = '23502';
  end if;

  if p_kind = 'policy' then
    if p_format <> 'ecb.build6.policy.v1' then
      raise exception 'BUILD 6 policy format identifier mismatch' using errcode = '22023';
    end if;
    actual_digest := ecb_governance.validate_policy_payload(p_payload);
  else
    actual_digest := extensions.digest(pg_catalog.convert_to(p_payload, 'UTF8'), 'sha256');
  end if;

  perform ecb_governance.register_native(actual_id);
  insert into ecb_governance.subjects (
    id, subject_kind, payload_text, format_id, payload_digest, source_ref
  ) values (
    actual_id, p_kind, p_payload, p_format, actual_digest, p_source_ref
  );
  return actual_id;
end;
$fn$;

create function ecb_governance.installer_retain_subject(
  p_kind text,
  p_payload text,
  p_format text,
  p_source_ref text,
  p_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  subject_id uuid;
  subject_digest bytea;
begin
  subject_id := ecb_governance.retain_subject_internal(
    p_id, p_kind, p_payload, p_format, p_source_ref
  );
  select payload_digest into strict subject_digest
  from ecb_governance.subjects where id = subject_id;
  return pg_catalog.jsonb_build_object(
    'subject_id', subject_id,
    'digest', pg_catalog.encode(subject_digest, 'hex'),
    'kind', p_kind
  );
end;
$fn$;

create function ecb_governance.retain_candidate_policy(
  p_payload text,
  p_source_ref text,
  p_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  subject_id uuid;
  subject_digest bytea;
begin
  subject_id := ecb_governance.retain_subject_internal(
    p_id, 'policy', p_payload, 'ecb.build6.policy.v1', p_source_ref
  );
  select payload_digest into strict subject_digest
  from ecb_governance.subjects where id = subject_id;
  return pg_catalog.jsonb_build_object(
    'subject_id', subject_id,
    'digest', pg_catalog.encode(subject_digest, 'hex')
  );
end;
$fn$;

create function ecb_governance.installer_create_scope(p_scope_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if p_scope_id is null then
    raise exception 'BUILD 6 scope id is required' using errcode = '23502';
  end if;
  perform ecb_governance.register_native(p_scope_id);
  insert into ecb_governance.scopes (id) values (p_scope_id);
  return p_scope_id;
end;
$fn$;

create function ecb_governance.installer_open_setup(
  p_scope_id uuid,
  p_external_basis_subject_id uuid,
  p_remit_subject_id uuid,
  p_p0_subject_id uuid,
  p_token text,
  p_rp_id text,
  p_expected_origin text,
  p_expected_credential_count smallint,
  p_expires_at timestamptz,
  p_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  setup_id uuid := coalesce(p_id, pg_catalog.gen_random_uuid());
  scope_row ecb_governance.scopes%rowtype;
  p0_row ecb_governance.subjects%rowtype;
  remit_kind text;
  basis_kind text;
  accepted_p0 bytea := pg_catalog.decode(
    '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664', 'hex');
begin
  select * into strict scope_row from ecb_governance.scopes
  where id = p_scope_id for update;
  if scope_row.binding_subject_id is not null or scope_row.current_transition_id is not null
     or scope_row.bootstrap_exhausted then
    raise exception 'BUILD 6 setup requires an unbound, uninitialized scope' using errcode = '55000';
  end if;

  select * into strict p0_row from ecb_governance.subjects where id = p_p0_subject_id;
  select subject_kind into strict remit_kind from ecb_governance.subjects where id = p_remit_subject_id;
  select subject_kind into strict basis_kind from ecb_governance.subjects
  where id = p_external_basis_subject_id;

  if p0_row.subject_kind <> 'policy' or p0_row.payload_digest <> accepted_p0
     or ecb_governance.validate_policy_payload(p0_row.payload_text) <> accepted_p0 then
    raise exception 'BUILD 6 setup P0 does not match the accepted exact policy' using errcode = '22023';
  end if;
  if remit_kind <> 'remit' or basis_kind <> 'external_basis' then
    raise exception 'BUILD 6 setup subject kinds are invalid' using errcode = '22023';
  end if;
  if p_rp_id <> 'ecos.effortlessconnection.com'
     or p_expected_origin <> 'https://ecos.effortlessconnection.com' then
    raise exception 'BUILD 6 setup RP/origin mismatch' using errcode = '22023';
  end if;
  if p_token is null or pg_catalog.length(p_token) < 32 then
    raise exception 'BUILD 6 setup capability is too short' using errcode = '22023';
  end if;
  if p_expected_credential_count not between 1 and 3 then
    raise exception 'BUILD 6 setup credential count is outside the released bound' using errcode = '22023';
  end if;
  if p_expires_at <= pg_catalog.clock_timestamp()
     or p_expires_at > pg_catalog.clock_timestamp() + interval '2 hours' then
    raise exception 'BUILD 6 setup expiry is outside the protected window' using errcode = '22023';
  end if;

  perform ecb_governance.register_native(setup_id);
  insert into ecb_governance.setup_grants (
    id, scope_id, external_basis_subject_id, remit_subject_id, p0_subject_id,
    rp_id, expected_origin, webauthn_user_handle, token_digest,
    expected_credential_count, expires_at
  ) values (
    setup_id, p_scope_id, p_external_basis_subject_id, p_remit_subject_id, p_p0_subject_id,
    p_rp_id, p_expected_origin, extensions.gen_random_bytes(32),
    extensions.digest(pg_catalog.convert_to(p_token, 'UTF8'), 'sha256'),
    p_expected_credential_count, p_expires_at
  );

  return pg_catalog.jsonb_build_object(
    'setup_id', setup_id,
    'scope_id', p_scope_id,
    'expires_at', p_expires_at,
    'expected_credential_count', p_expected_credential_count
  );
end;
$fn$;

create function ecb_governance.registration_context(p_setup_id uuid, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  setup_row ecb_governance.setup_grants%rowtype;
  excluded jsonb;
begin
  select * into strict setup_row from ecb_governance.setup_grants where id = p_setup_id;
  if setup_row.token_digest <> extensions.digest(pg_catalog.convert_to(p_token, 'UTF8'), 'sha256')
     or setup_row.consumed_at is not null
     or setup_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 setup capability is unavailable' using errcode = '42501';
  end if;

  select coalesce(
    pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id', credential_id, 'transports', transports)
      order by credential_id), '[]'::jsonb)
  into excluded
  from ecb_governance.credentials
  where setup_grant_id = p_setup_id;

  return pg_catalog.jsonb_build_object(
    'scope_id', setup_row.scope_id,
    'rp_id', setup_row.rp_id,
    'origin', setup_row.expected_origin,
    'user_handle_hex', pg_catalog.encode(setup_row.webauthn_user_handle, 'hex'),
    'exclude_credentials', excluded,
    'remaining', setup_row.expected_credential_count - (
      select pg_catalog.count(*) from ecb_governance.credentials where setup_grant_id = p_setup_id
    )
  );
end;
$fn$;

create function ecb_governance.begin_registration(
  p_setup_id uuid,
  p_token text,
  p_challenge text,
  p_preauth_token text,
  p_expires_at timestamptz,
  p_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  setup_row ecb_governance.setup_grants%rowtype;
  ceremony_id uuid := coalesce(p_id, pg_catalog.gen_random_uuid());
  current_count integer;
begin
  select * into strict setup_row from ecb_governance.setup_grants
  where id = p_setup_id for update;
  if setup_row.token_digest <> extensions.digest(pg_catalog.convert_to(p_token, 'UTF8'), 'sha256')
     or setup_row.consumed_at is not null
     or setup_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 setup capability is unavailable' using errcode = '42501';
  end if;
  select pg_catalog.count(*) into current_count from ecb_governance.credentials
  where setup_grant_id = p_setup_id;
  if current_count >= setup_row.expected_credential_count then
    raise exception 'BUILD 6 expected credential count is already satisfied' using errcode = '55000';
  end if;
  if p_challenge is null or pg_catalog.length(p_challenge) < 16
     or p_preauth_token is null or pg_catalog.length(p_preauth_token) < 32 then
    raise exception 'BUILD 6 registration ceremony input is invalid' using errcode = '22023';
  end if;
  if p_expires_at <= pg_catalog.clock_timestamp()
     or p_expires_at > least(setup_row.expires_at, pg_catalog.clock_timestamp() + interval '10 minutes') then
    raise exception 'BUILD 6 registration ceremony expiry is invalid' using errcode = '22023';
  end if;

  perform ecb_governance.register_native(ceremony_id);
  insert into ecb_governance.ceremonies (
    id, scope_id, setup_grant_id, purpose, challenge, preauth_digest, expires_at
  ) values (
    ceremony_id, setup_row.scope_id, p_setup_id, 'registration', p_challenge,
    extensions.digest(pg_catalog.convert_to(p_preauth_token, 'UTF8'), 'sha256'), p_expires_at
  );
  return ceremony_id;
end;
$fn$;

create function ecb_governance.consume_ceremony_failure(
  p_ceremony_id uuid,
  p_preauth_token text,
  p_reason_code text,
  p_response_json text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  ceremony_row ecb_governance.ceremonies%rowtype;
begin
  select * into strict ceremony_row from ecb_governance.ceremonies
  where id = p_ceremony_id for update;
  if ceremony_row.consumed_at is not null then
    return pg_catalog.jsonb_build_object('status', 'already_consumed', 'outcome', ceremony_row.outcome_code);
  end if;
  if ceremony_row.preauth_digest <> extensions.digest(pg_catalog.convert_to(p_preauth_token, 'UTF8'), 'sha256') then
    raise exception 'BUILD 6 preauthentication binding mismatch' using errcode = '42501';
  end if;
  if p_reason_code is null or p_reason_code !~ '^[a-z0-9_]{1,64}$' then
    raise exception 'BUILD 6 public failure code is invalid' using errcode = '22023';
  end if;
  update ecb_governance.ceremonies
  set consumed_at = pg_catalog.transaction_timestamp(),
      outcome_code = p_reason_code,
      response_json = p_response_json
  where id = p_ceremony_id;
  return pg_catalog.jsonb_build_object('status', 'failed', 'outcome', p_reason_code);
end;
$fn$;

create function ecb_governance.complete_registration(
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
  credential_ref uuid := coalesce(p_credential_ref, pg_catalog.gen_random_uuid());
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

  perform ecb_governance.register_native(credential_ref);
  insert into ecb_governance.credentials (
    id, scope_id, setup_grant_id, registration_ceremony_id, rp_id,
    credential_id, webauthn_user_handle, public_key, algorithm, sign_count,
    transports, device_type, backed_up
  ) values (
    credential_ref, ceremony_row.scope_id, setup_row.id, ceremony_row.id, setup_row.rp_id,
    p_credential_id, setup_row.webauthn_user_handle, p_public_key, p_algorithm, p_counter,
    coalesce(p_transports, '{}'::text[]), p_device_type, p_backed_up
  );

  update ecb_governance.ceremonies
  set consumed_at = pg_catalog.transaction_timestamp(), outcome_code = 'verified',
      response_json = p_response_json, credential_ref = credential_ref,
      observed_origin = p_origin, user_verified = true, cross_origin = false,
      verified_at = pg_catalog.transaction_timestamp()
  where id = ceremony_row.id;

  return pg_catalog.jsonb_build_object(
    'status', 'registered_inert',
    'credential_ref', credential_ref,
    'credential_id', p_credential_id,
    'device_type', p_device_type,
    'backed_up', p_backed_up
  );
end;
$fn$;

create function ecb_governance.bind_initial_instance(
  p_setup_id uuid,
  p_token text,
  p_credential_refs uuid[],
  p_source_ref text,
  p_request_id uuid,
  p_binding_id uuid default null,
  p_decision_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  setup_row ecb_governance.setup_grants%rowtype;
  scope_row ecb_governance.scopes%rowtype;
  binding_id uuid := coalesce(p_binding_id, pg_catalog.gen_random_uuid());
  decision_id uuid := coalesce(p_decision_id, pg_catalog.gen_random_uuid());
  credential_count integer;
  credentials_json jsonb;
  credential_material text;
  credential_digest bytea;
  binding_payload text;
  binding_digest bytea;
  decision_fingerprint bytea;
  existing_decision ecb_governance.decisions%rowtype;
begin
  if p_setup_id is null or p_request_id is null or p_source_ref is null or p_source_ref = '' then
    raise exception 'BUILD 6 setup completion identifiers are required' using errcode = '23502';
  end if;

  select * into existing_decision from ecb_governance.decisions where request_id = p_request_id;
  if found then
    -- Reconstruct the expected fingerprint from the retained setup result when available.
    select * into strict setup_row from ecb_governance.setup_grants where id = p_setup_id;
    if setup_row.genesis_decision_id = existing_decision.id
       and setup_row.binding_subject_id is not null
       and setup_row.bound_credentials_digest is not null then
      return pg_catalog.jsonb_build_object(
        'status', 'confirmed_prior_success',
        'binding_subject_id', setup_row.binding_subject_id,
        'genesis_decision_id', existing_decision.id,
        'credential_set_digest', pg_catalog.encode(setup_row.bound_credentials_digest, 'hex')
      );
    end if;
    raise exception 'BUILD 6 request id conflicts with different setup input' using errcode = '23505';
  end if;

  select * into strict setup_row from ecb_governance.setup_grants where id = p_setup_id for update;
  select * into strict scope_row from ecb_governance.scopes where id = setup_row.scope_id for update;
  if setup_row.token_digest <> extensions.digest(pg_catalog.convert_to(p_token, 'UTF8'), 'sha256')
     or setup_row.consumed_at is not null or setup_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 setup capability is unavailable' using errcode = '42501';
  end if;
  if scope_row.binding_subject_id is not null or scope_row.current_transition_id is not null
     or scope_row.bootstrap_exhausted then
    raise exception 'BUILD 6 scope cannot be rebound or reinitialized' using errcode = '55000';
  end if;

  select pg_catalog.count(*),
         pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'credential_ref', c.id,
             'credential_id', c.credential_id,
             'device_type', c.device_type,
             'backed_up', c.backed_up
           ) order by c.credential_id, c.id
         ),
         pg_catalog.string_agg(c.credential_id || ':' || c.id::text, E'\n' order by c.credential_id, c.id)
  into credential_count, credentials_json, credential_material
  from ecb_governance.credentials c
  where c.id = any(p_credential_refs)
    and c.setup_grant_id = setup_row.id
    and c.scope_id = setup_row.scope_id
    and c.bound_at is null
    and c.revoked_at is null;

  if credential_count <> setup_row.expected_credential_count
     or credential_count <> coalesce(pg_catalog.array_length(p_credential_refs, 1), 0) then
    raise exception 'BUILD 6 exact credential set does not match the commissioned setup count'
      using errcode = '22023';
  end if;

  credential_digest := extensions.digest(
    pg_catalog.convert_to(credential_material, 'UTF8'), 'sha256');
  binding_payload := pg_catalog.jsonb_build_object(
    'format', 'ecb.build6.binding.v1',
    'scope_id', setup_row.scope_id,
    'human', 'Levi',
    'remit_subject_id', setup_row.remit_subject_id,
    'p0_subject_id', setup_row.p0_subject_id,
    'external_basis_subject_id', setup_row.external_basis_subject_id,
    'rp_id', setup_row.rp_id,
    'origin', setup_row.expected_origin,
    'credential_set_digest', pg_catalog.encode(credential_digest, 'hex'),
    'credentials', credentials_json
  )::text;
  binding_digest := extensions.digest(pg_catalog.convert_to(binding_payload, 'UTF8'), 'sha256');

  perform ecb_governance.register_native(binding_id);
  insert into ecb_governance.subjects (
    id, subject_kind, payload_text, format_id, payload_digest, source_ref
  ) values (
    binding_id, 'binding', binding_payload, 'ecb.build6.binding.v1', binding_digest, p_source_ref
  );

  update ecb_governance.credentials
  set binding_subject_id = binding_id, bound_at = pg_catalog.transaction_timestamp()
  where id = any(p_credential_refs);

  update ecb_governance.scopes set binding_subject_id = binding_id
  where id = setup_row.scope_id;

  decision_fingerprint := extensions.digest(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'kind', 'genesis_authorization', 'scope', setup_row.scope_id,
      'binding', binding_id, 'p0', setup_row.p0_subject_id,
      'p0_digest', '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664',
      'basis', setup_row.external_basis_subject_id, 'remit', setup_row.remit_subject_id,
      'credential_set_digest', pg_catalog.encode(credential_digest, 'hex')
    )::text, 'UTF8'), 'sha256');

  perform ecb_governance.register_native(decision_id);
  insert into ecb_governance.decisions (
    id, scope_id, decision_kind, target_subject_id, target_digest,
    issuer_binding_subject_id, prior_authority_ref, remit_subject_id,
    permitted_executor_class, source_acceptance_ref, request_id, request_fingerprint
  ) select
    decision_id, setup_row.scope_id, 'genesis_authorization', setup_row.p0_subject_id,
    s.payload_digest, binding_id, setup_row.external_basis_subject_id, setup_row.remit_subject_id,
    'governance_executor', p_source_ref, p_request_id, decision_fingerprint
  from ecb_governance.subjects s where s.id = setup_row.p0_subject_id;

  update ecb_governance.setup_grants
  set consumed_at = pg_catalog.transaction_timestamp(), binding_subject_id = binding_id,
      genesis_decision_id = decision_id, bound_credentials_digest = credential_digest
  where id = setup_row.id;

  return pg_catalog.jsonb_build_object(
    'status', 'bound_genesis_authorization_committed_on_transaction_end',
    'scope_id', setup_row.scope_id,
    'binding_subject_id', binding_id,
    'genesis_decision_id', decision_id,
    'credential_set_digest', pg_catalog.encode(credential_digest, 'hex')
  );
end;
$fn$;

create function ecb_governance.authentication_context(p_scope_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  scope_row ecb_governance.scopes%rowtype;
  binding_row ecb_governance.subjects%rowtype;
  allowed jsonb;
begin
  select * into strict scope_row from ecb_governance.scopes where id = p_scope_id;
  if scope_row.binding_subject_id is null then
    raise exception 'BUILD 6 human binding is not established for scope' using errcode = '55000';
  end if;
  select * into strict binding_row from ecb_governance.subjects where id = scope_row.binding_subject_id;
  select coalesce(
    pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'id', credential_id, 'transports', transports
    ) order by credential_id), '[]'::jsonb)
  into allowed
  from ecb_governance.credentials
  where scope_id = p_scope_id and binding_subject_id = scope_row.binding_subject_id
    and bound_at is not null and revoked_at is null;
  if pg_catalog.jsonb_array_length(allowed) = 0 then
    raise exception 'BUILD 6 scope has no eligible human credential' using errcode = '55000';
  end if;
  return pg_catalog.jsonb_build_object(
    'scope_id', p_scope_id,
    'binding_subject_id', scope_row.binding_subject_id,
    'rp_id', binding_row.payload_text::jsonb ->> 'rp_id',
    'origin', binding_row.payload_text::jsonb ->> 'origin',
    'allow_credentials', allowed
  );
end;
$fn$;

create function ecb_governance.begin_authentication(
  p_scope_id uuid,
  p_challenge text,
  p_preauth_token text,
  p_expires_at timestamptz,
  p_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  scope_row ecb_governance.scopes%rowtype;
  ceremony_id uuid := coalesce(p_id, pg_catalog.gen_random_uuid());
begin
  select * into strict scope_row from ecb_governance.scopes where id = p_scope_id;
  if scope_row.binding_subject_id is null then
    raise exception 'BUILD 6 human binding is not established' using errcode = '55000';
  end if;
  if p_challenge is null or pg_catalog.length(p_challenge) < 16
     or p_preauth_token is null or pg_catalog.length(p_preauth_token) < 32 then
    raise exception 'BUILD 6 authentication ceremony input is invalid' using errcode = '22023';
  end if;
  if p_expires_at <= pg_catalog.clock_timestamp()
     or p_expires_at > pg_catalog.clock_timestamp() + interval '10 minutes' then
    raise exception 'BUILD 6 authentication ceremony expiry is invalid' using errcode = '22023';
  end if;
  perform ecb_governance.register_native(ceremony_id);
  insert into ecb_governance.ceremonies (
    id, scope_id, purpose, challenge, preauth_digest, expires_at
  ) values (
    ceremony_id, p_scope_id, 'authentication', p_challenge,
    extensions.digest(pg_catalog.convert_to(p_preauth_token, 'UTF8'), 'sha256'), p_expires_at
  );
  return ceremony_id;
end;
$fn$;

create function ecb_governance.authentication_credential(
  p_scope_id uuid,
  p_credential_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  c ecb_governance.credentials%rowtype;
begin
  select * into strict c from ecb_governance.credentials
  where scope_id = p_scope_id and credential_id = p_credential_id
    and bound_at is not null and revoked_at is null;
  return pg_catalog.jsonb_build_object(
    'credential_ref', c.id,
    'id', c.credential_id,
    'public_key_hex', pg_catalog.encode(c.public_key, 'hex'),
    'counter', c.sign_count,
    'transports', pg_catalog.to_jsonb(c.transports),
    'user_handle_hex', pg_catalog.encode(c.webauthn_user_handle, 'hex'),
    'device_type', c.device_type,
    'backed_up', c.backed_up,
    'rp_id', c.rp_id
  );
end;
$fn$;

create function ecb_governance.complete_authentication(
  p_ceremony_id uuid,
  p_preauth_token text,
  p_response_json text,
  p_credential_id text,
  p_user_handle bytea,
  p_new_counter bigint,
  p_device_type text,
  p_backed_up boolean,
  p_user_verified boolean,
  p_origin text,
  p_cross_origin boolean,
  p_verified boolean,
  p_session_secret text,
  p_csrf_token text,
  p_inactivity_seconds integer default 86400,
  p_absolute_seconds integer default 604800,
  p_session_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  ceremony_row ecb_governance.ceremonies%rowtype;
  scope_row ecb_governance.scopes%rowtype;
  binding_row ecb_governance.subjects%rowtype;
  credential_row ecb_governance.credentials%rowtype;
  session_id uuid := coalesce(p_session_id, pg_catalog.gen_random_uuid());
  now_ts timestamptz := pg_catalog.transaction_timestamp();
begin
  select * into strict ceremony_row from ecb_governance.ceremonies
  where id = p_ceremony_id for update;
  if ceremony_row.purpose <> 'authentication' or ceremony_row.consumed_at is not null
     or ceremony_row.expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 authentication ceremony is unavailable' using errcode = '55000';
  end if;
  if ceremony_row.preauth_digest <> extensions.digest(pg_catalog.convert_to(p_preauth_token, 'UTF8'), 'sha256') then
    raise exception 'BUILD 6 preauthentication binding mismatch' using errcode = '42501';
  end if;
  select * into strict scope_row from ecb_governance.scopes
  where id = ceremony_row.scope_id for update;
  select * into strict binding_row from ecb_governance.subjects where id = scope_row.binding_subject_id;
  select * into strict credential_row from ecb_governance.credentials
  where scope_id = ceremony_row.scope_id and credential_id = p_credential_id
    and binding_subject_id = scope_row.binding_subject_id
    and bound_at is not null and revoked_at is null for update;

  if p_verified is not true or p_user_verified is not true or p_cross_origin is not false
     or p_origin <> binding_row.payload_text::jsonb ->> 'origin'
     or credential_row.rp_id <> binding_row.payload_text::jsonb ->> 'rp_id' then
    raise exception 'BUILD 6 authentication verification did not satisfy the protected boundary'
      using errcode = '42501';
  end if;
  if p_user_handle is not null and p_user_handle <> credential_row.webauthn_user_handle then
    raise exception 'BUILD 6 WebAuthn user handle does not match the bound credential'
      using errcode = '42501';
  end if;
  if p_new_counter < 0
     or (credential_row.sign_count > 0 and p_new_counter <= credential_row.sign_count)
     or (credential_row.sign_count = 0 and p_new_counter < credential_row.sign_count) then
    raise exception 'BUILD 6 authenticator counter rollback/replay detected' using errcode = '40001';
  end if;
  if p_device_type not in ('singleDevice', 'multiDevice')
     or p_device_type <> credential_row.device_type then
    raise exception 'BUILD 6 credential device type drifted' using errcode = '42501';
  end if;
  if p_session_secret is null or pg_catalog.length(p_session_secret) < 32
     or p_csrf_token is null or pg_catalog.length(p_csrf_token) < 32 then
    raise exception 'BUILD 6 session material is too short' using errcode = '22023';
  end if;
  if p_inactivity_seconds < 300 or p_absolute_seconds < p_inactivity_seconds
     or p_absolute_seconds > 2592000 then
    raise exception 'BUILD 6 session lifetime is outside the qualified bound' using errcode = '22023';
  end if;

  perform ecb_governance.register_native(session_id);
  insert into ecb_governance.sessions (
    id, scope_id, binding_subject_id, credential_ref, authentication_ceremony_id,
    secret_digest, csrf_digest, created_at, last_active_at,
    inactivity_expires_at, absolute_expires_at
  ) values (
    session_id, ceremony_row.scope_id, scope_row.binding_subject_id, credential_row.id, ceremony_row.id,
    extensions.digest(pg_catalog.convert_to(p_session_secret, 'UTF8'), 'sha256'),
    extensions.digest(pg_catalog.convert_to(p_csrf_token, 'UTF8'), 'sha256'),
    now_ts, now_ts, now_ts + pg_catalog.make_interval(secs => p_inactivity_seconds),
    now_ts + pg_catalog.make_interval(secs => p_absolute_seconds)
  );

  update ecb_governance.credentials
  set sign_count = p_new_counter, backed_up = p_backed_up
  where id = credential_row.id;
  update ecb_governance.ceremonies
  set consumed_at = now_ts, outcome_code = 'verified', response_json = p_response_json,
      credential_ref = credential_row.id, session_ref = session_id,
      observed_origin = p_origin, user_verified = true, cross_origin = false, verified_at = now_ts
  where id = ceremony_row.id;

  return pg_catalog.jsonb_build_object(
    'status', 'session_created',
    'session_id', session_id,
    'scope_id', ceremony_row.scope_id,
    'binding_subject_id', scope_row.binding_subject_id,
    'inactivity_expires_at', now_ts + pg_catalog.make_interval(secs => p_inactivity_seconds),
    'absolute_expires_at', now_ts + pg_catalog.make_interval(secs => p_absolute_seconds)
  );
end;
$fn$;

create function ecb_governance.human_scope(p_session_secret text, p_scope_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  s ecb_governance.sessions%rowtype;
  sc ecb_governance.scopes%rowtype;
  current_t ecb_governance.transitions%rowtype;
  policy_row ecb_governance.subjects%rowtype;
  pending jsonb;
begin
  select * into strict s from ecb_governance.sessions
  where secret_digest = extensions.digest(pg_catalog.convert_to(p_session_secret, 'UTF8'), 'sha256');
  if s.scope_id <> p_scope_id or s.invalidated_at is not null
     or s.inactivity_expires_at <= pg_catalog.clock_timestamp()
     or s.absolute_expires_at <= pg_catalog.clock_timestamp() then
    raise exception 'BUILD 6 human session is invalid or expired' using errcode = '42501';
  end if;
  select * into strict sc from ecb_governance.scopes where id = p_scope_id;
  if sc.binding_subject_id <> s.binding_subject_id then
    raise exception 'BUILD 6 session binding no longer matches the scope' using errcode = '42501';
  end if;

  if sc.current_transition_id is not null then
    select * into strict current_t from ecb_governance.transitions where id = sc.current_transition_id;
    select * into strict policy_row from ecb_governance.subjects where id = current_t.policy_subject_id;
  end if;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'decision_id', d.id, 'target_subject_id', d.target_subject_id,
    'target_digest', pg_catalog.encode(d.target_digest, 'hex'),
    'expected_current_transition_id', d.expected_current_transition_id,
    'recorded_at', d.recorded_at, 'explanation', d.explanation_text
  ) order by d.recorded_at, d.id), '[]'::jsonb)
  into pending
  from ecb_governance.decisions d
  where d.scope_id = p_scope_id and d.decision_kind = 'succession_authorization'
    and not exists (select 1 from ecb_governance.decisions w
      where w.decision_kind = 'withdrawal' and w.target_decision_id = d.id)
    and not exists (select 1 from ecb_governance.transitions t where t.decision_id = d.id);

  return pg_catalog.jsonb_build_object(
    'scope_id', sc.id,
    'binding_subject_id', sc.binding_subject_id,
    'bootstrap_exhausted', sc.bootstrap_exhausted,
    'current_transition_id', sc.current_transition_id,
    'current_policy_subject_id', case when sc.current_transition_id is null then null else current_t.policy_subject_id end,
    'current_policy_digest', case when sc.current_transition_id is null then null else pg_catalog.encode(policy_row.payload_digest, 'hex') end,
    'current_policy', case when sc.current_transition_id is null then null else policy_row.payload_text end,
    'pending_decisions', pending,
    'session_absolute_expires_at', s.absolute_expires_at,
    'session_inactivity_expires_at', s.inactivity_expires_at
  );
end;
$fn$;

create function ecb_governance.record_human_decision(
  p_session_secret text,
  p_csrf_token text,
  p_origin text,
  p_scope_id uuid,
  p_action text,
  p_target_policy_subject_id uuid,
  p_expected_current_transition_id uuid,
  p_request_id uuid,
  p_explanation text default null,
  p_decision_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  sc ecb_governance.scopes%rowtype;
  s ecb_governance.sessions%rowtype;
  current_t ecb_governance.transitions%rowtype;
  current_policy ecb_governance.subjects%rowtype;
  target_policy ecb_governance.subjects%rowtype;
  existing ecb_governance.decisions%rowtype;
  decision_id uuid := coalesce(p_decision_id, pg_catalog.gen_random_uuid());
  decision_kind text;
  executor_class text;
  fingerprint bytea;
  now_ts timestamptz := pg_catalog.transaction_timestamp();
begin
  if p_action not in ('accept', 'decline') then
    raise exception 'BUILD 6 human decision action is unsupported' using errcode = '22023';
  end if;
  select * into strict target_policy from ecb_governance.subjects
  where id = p_target_policy_subject_id and subject_kind = 'policy';
  perform ecb_governance.validate_policy_payload(target_policy.payload_text);

  fingerprint := extensions.digest(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'scope', p_scope_id, 'action', p_action, 'target', p_target_policy_subject_id,
      'target_digest', pg_catalog.encode(target_policy.payload_digest, 'hex'),
      'expected_current', p_expected_current_transition_id,
      'explanation', p_explanation
    )::text, 'UTF8'), 'sha256');

  select * into existing from ecb_governance.decisions where request_id = p_request_id;
  if found then
    if existing.request_fingerprint = fingerprint then
      return pg_catalog.jsonb_build_object(
        'status', 'confirmed_prior_decision', 'decision_id', existing.id,
        'decision_kind', existing.decision_kind
      );
    end if;
    raise exception 'BUILD 6 request id conflicts with changed decision input' using errcode = '23505';
  end if;

  select * into strict sc from ecb_governance.scopes where id = p_scope_id for update;
  if sc.current_transition_id is null or not sc.bootstrap_exhausted
     or sc.current_transition_id <> p_expected_current_transition_id then
    raise exception 'BUILD 6 stale or uninitialized governance predecessor' using errcode = '40001';
  end if;

  select * into strict s from ecb_governance.sessions
  where secret_digest = extensions.digest(pg_catalog.convert_to(p_session_secret, 'UTF8'), 'sha256')
  for update;
  if s.scope_id <> p_scope_id or s.binding_subject_id <> sc.binding_subject_id
     or s.invalidated_at is not null or s.inactivity_expires_at <= pg_catalog.clock_timestamp()
     or s.absolute_expires_at <= pg_catalog.clock_timestamp()
     or s.csrf_digest <> extensions.digest(pg_catalog.convert_to(p_csrf_token, 'UTF8'), 'sha256') then
    raise exception 'BUILD 6 human session or CSRF binding is invalid' using errcode = '42501';
  end if;

  select * into strict current_t from ecb_governance.transitions where id = sc.current_transition_id;
  select * into strict current_policy from ecb_governance.subjects where id = current_t.policy_subject_id;
  if p_origin <> (select payload_text::jsonb ->> 'origin' from ecb_governance.subjects
                   where id = sc.binding_subject_id) then
    raise exception 'BUILD 6 mutation origin mismatch' using errcode = '42501';
  end if;
  if (current_policy.payload_text::json ->> 'requires_human_explanation')::boolean
     and (p_explanation is null or pg_catalog.btrim(p_explanation) = '') then
    raise exception 'BUILD 6 operative policy requires a human explanation' using errcode = '22023';
  end if;

  decision_kind := case when p_action = 'accept'
    then 'succession_authorization' else 'succession_decline' end;
  executor_class := case when p_action = 'accept'
    then 'governance_executor' else 'none' end;

  perform ecb_governance.register_native(decision_id);
  insert into ecb_governance.decisions (
    id, scope_id, decision_kind, target_subject_id, target_digest,
    expected_current_transition_id, issuer_binding_subject_id, prior_authority_ref,
    session_id, permitted_executor_class, explanation_text, source_acceptance_ref,
    request_id, request_fingerprint
  ) values (
    decision_id, p_scope_id, decision_kind, target_policy.id, target_policy.payload_digest,
    sc.current_transition_id, sc.binding_subject_id, sc.current_transition_id,
    s.id, executor_class, p_explanation, 'protected_human_session:' || s.id::text,
    p_request_id, fingerprint
  );

  update ecb_governance.sessions
  set last_active_at = now_ts,
      inactivity_expires_at = least(absolute_expires_at, now_ts + interval '24 hours')
  where id = s.id;

  return pg_catalog.jsonb_build_object(
    'status', case when p_action = 'accept' then 'authorized' else 'declined' end,
    'decision_id', decision_id,
    'target_subject_id', target_policy.id,
    'expected_current_transition_id', sc.current_transition_id
  );
end;
$fn$;

create function ecb_governance.withdraw_human_decision(
  p_session_secret text,
  p_csrf_token text,
  p_origin text,
  p_scope_id uuid,
  p_target_decision_id uuid,
  p_request_id uuid,
  p_withdrawal_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  sc ecb_governance.scopes%rowtype;
  s ecb_governance.sessions%rowtype;
  target ecb_governance.decisions%rowtype;
  existing ecb_governance.decisions%rowtype;
  executed ecb_governance.transitions%rowtype;
  withdrawal_id uuid := coalesce(p_withdrawal_id, pg_catalog.gen_random_uuid());
  fingerprint bytea;
begin
  fingerprint := extensions.digest(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object(
      'scope', p_scope_id, 'withdraw', p_target_decision_id
    )::text, 'UTF8'), 'sha256');
  select * into existing from ecb_governance.decisions where request_id = p_request_id;
  if found then
    if existing.request_fingerprint = fingerprint and existing.decision_kind = 'withdrawal' then
      return pg_catalog.jsonb_build_object(
        'status', 'confirmed_prior_withdrawal', 'withdrawal_id', existing.id,
        'target_decision_id', existing.target_decision_id
      );
    end if;
    raise exception 'BUILD 6 request id conflicts with changed withdrawal input' using errcode = '23505';
  end if;

  select * into strict sc from ecb_governance.scopes where id = p_scope_id for update;
  select * into strict s from ecb_governance.sessions
  where secret_digest = extensions.digest(pg_catalog.convert_to(p_session_secret, 'UTF8'), 'sha256')
  for update;
  if s.scope_id <> p_scope_id or s.binding_subject_id <> sc.binding_subject_id
     or s.invalidated_at is not null or s.inactivity_expires_at <= pg_catalog.clock_timestamp()
     or s.absolute_expires_at <= pg_catalog.clock_timestamp()
     or s.csrf_digest <> extensions.digest(pg_catalog.convert_to(p_csrf_token, 'UTF8'), 'sha256') then
    raise exception 'BUILD 6 human session or CSRF binding is invalid' using errcode = '42501';
  end if;
  if p_origin <> (select payload_text::jsonb ->> 'origin' from ecb_governance.subjects
                   where id = sc.binding_subject_id) then
    raise exception 'BUILD 6 mutation origin mismatch' using errcode = '42501';
  end if;

  select * into strict target from ecb_governance.decisions
  where id = p_target_decision_id and scope_id = p_scope_id
    and decision_kind = 'succession_authorization';
  if target.issuer_binding_subject_id <> sc.binding_subject_id then
    raise exception 'BUILD 6 only the issuing H may withdraw this decision' using errcode = '42501';
  end if;

  select * into executed from ecb_governance.transitions where decision_id = target.id;
  if found then
    return pg_catalog.jsonb_build_object(
      'status', 'already_executed', 'decision_id', target.id, 'transition_id', executed.id
    );
  end if;
  select * into existing from ecb_governance.decisions
  where decision_kind = 'withdrawal' and target_decision_id = target.id;
  if found then
    return pg_catalog.jsonb_build_object(
      'status', 'already_withdrawn', 'withdrawal_id', existing.id, 'decision_id', target.id
    );
  end if;

  perform ecb_governance.register_native(withdrawal_id);
  insert into ecb_governance.decisions (
    id, scope_id, decision_kind, target_decision_id, expected_current_transition_id,
    issuer_binding_subject_id, prior_authority_ref, session_id,
    permitted_executor_class, source_acceptance_ref, request_id, request_fingerprint
  ) values (
    withdrawal_id, p_scope_id, 'withdrawal', target.id, sc.current_transition_id,
    sc.binding_subject_id, sc.current_transition_id, s.id,
    'none', 'protected_human_session:' || s.id::text, p_request_id, fingerprint
  );
  return pg_catalog.jsonb_build_object(
    'status', 'withdrawn', 'withdrawal_id', withdrawal_id, 'decision_id', target.id
  );
end;
$fn$;

create function ecb_governance.logout_session(
  p_session_secret text,
  p_csrf_token text,
  p_origin text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  s ecb_governance.sessions%rowtype;
  expected_origin text;
begin
  select * into strict s from ecb_governance.sessions
  where secret_digest = extensions.digest(pg_catalog.convert_to(p_session_secret, 'UTF8'), 'sha256')
  for update;
  if s.csrf_digest <> extensions.digest(pg_catalog.convert_to(p_csrf_token, 'UTF8'), 'sha256') then
    raise exception 'BUILD 6 logout CSRF binding is invalid' using errcode = '42501';
  end if;
  select payload_text::jsonb ->> 'origin' into strict expected_origin
  from ecb_governance.subjects where id = s.binding_subject_id;
  if p_origin <> expected_origin then
    raise exception 'BUILD 6 logout origin mismatch' using errcode = '42501';
  end if;
  if s.invalidated_at is null then
    update ecb_governance.sessions set invalidated_at = pg_catalog.transaction_timestamp()
    where id = s.id;
  end if;
  return pg_catalog.jsonb_build_object('status', 'logged_out', 'session_id', s.id);
end;
$fn$;

create function ecb_governance.execute_governance(
  p_scope_id uuid,
  p_decision_id uuid,
  p_request_id uuid,
  p_transition_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  existing ecb_governance.transitions%rowtype;
  sc ecb_governance.scopes%rowtype;
  d ecb_governance.decisions%rowtype;
  predecessor ecb_governance.transitions%rowtype;
  p0 ecb_governance.subjects%rowtype;
  target ecb_governance.subjects%rowtype;
  withdrawal_count integer;
  transition_id uuid := coalesce(p_transition_id, pg_catalog.gen_random_uuid());
  fingerprint bytea;
  next_sequence bigint;
  remit_id uuid;
  basis_id uuid;
  transition_kind text;
  accepted_p0 bytea := pg_catalog.decode(
    '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664', 'hex');
begin
  fingerprint := extensions.digest(pg_catalog.convert_to(
    pg_catalog.jsonb_build_object('scope', p_scope_id, 'decision', p_decision_id)::text,
    'UTF8'), 'sha256');
  select * into existing from ecb_governance.transitions where request_id = p_request_id;
  if found then
    if existing.request_fingerprint = fingerprint then
      return pg_catalog.jsonb_build_object(
        'status', 'confirmed_prior_success', 'transition_id', existing.id,
        'scope_id', existing.scope_id, 'sequence_no', existing.sequence_no,
        'policy_subject_id', existing.policy_subject_id
      );
    end if;
    raise exception 'BUILD 6 execution request id conflicts with changed input' using errcode = '23505';
  end if;

  select * into strict sc from ecb_governance.scopes where id = p_scope_id for update;
  select * into strict d from ecb_governance.decisions
  where id = p_decision_id and scope_id = p_scope_id;

  -- pg_current_xact_id() remains the top-level xid inside savepoints. A decision created in this
  -- outer transaction cannot authorize its own effect.
  if d.created_xid = pg_catalog.pg_current_xact_id() then
    raise exception 'BUILD 6 execution requires a decision committed in a prior top-level transaction'
      using errcode = '55000';
  end if;

  select pg_catalog.count(*) into withdrawal_count from ecb_governance.decisions
  where decision_kind = 'withdrawal' and target_decision_id = d.id;
  if withdrawal_count <> 0 then
    raise exception 'BUILD 6 decision is withdrawn' using errcode = '55000';
  end if;
  if d.permitted_executor_class <> 'governance_executor' then
    raise exception 'BUILD 6 decision does not authorize execution' using errcode = '42501';
  end if;
  select * into strict target from ecb_governance.subjects
  where id = d.target_subject_id and subject_kind = 'policy';
  if target.payload_digest <> d.target_digest
     or ecb_governance.validate_policy_payload(target.payload_text) <> target.payload_digest then
    raise exception 'BUILD 6 exact target policy does not match the committed decision'
      using errcode = '22023';
  end if;

  if d.decision_kind = 'genesis_authorization' then
    if sc.current_transition_id is not null or sc.bootstrap_exhausted
       or sc.binding_subject_id is null then
      raise exception 'BUILD 6 genesis is already exhausted or scope state is inconsistent'
        using errcode = '55000';
    end if;
    if d.expected_current_transition_id is not null
       or d.issuer_binding_subject_id <> sc.binding_subject_id
       or target.payload_digest <> accepted_p0 then
      raise exception 'BUILD 6 genesis decision does not match the accepted M2 basis'
        using errcode = '42501';
    end if;
    transition_kind := 'genesis';
    next_sequence := 1;
    remit_id := d.remit_subject_id;
    basis_id := d.prior_authority_ref;
  elsif d.decision_kind = 'succession_authorization' then
    if not sc.bootstrap_exhausted or sc.current_transition_id is null
       or sc.current_transition_id <> d.expected_current_transition_id
       or d.issuer_binding_subject_id <> sc.binding_subject_id
       or d.prior_authority_ref <> sc.current_transition_id then
      raise exception 'BUILD 6 succession decision is stale or authority basis changed'
        using errcode = '40001';
    end if;
    select * into strict predecessor from ecb_governance.transitions
    where id = sc.current_transition_id and scope_id = p_scope_id;
    transition_kind := 'succession';
    next_sequence := predecessor.sequence_no + 1;
    remit_id := predecessor.remit_subject_id;
    basis_id := predecessor.external_basis_subject_id;
  else
    raise exception 'BUILD 6 decision kind cannot be executed' using errcode = '42501';
  end if;

  perform ecb_governance.register_native(transition_id);
  insert into ecb_governance.transitions (
    id, scope_id, transition_kind, predecessor_id, decision_id,
    policy_subject_id, binding_subject_id, remit_subject_id, external_basis_subject_id,
    executor_class, request_id, request_fingerprint, sequence_no, bootstrap_exhausted
  ) values (
    transition_id, p_scope_id, transition_kind,
    case when transition_kind = 'genesis' then null else sc.current_transition_id end,
    d.id, target.id, sc.binding_subject_id, remit_id, basis_id,
    'governance_executor', p_request_id, fingerprint, next_sequence, true
  );

  update ecb_governance.scopes
  set current_transition_id = transition_id, bootstrap_exhausted = true
  where id = p_scope_id;

  return pg_catalog.jsonb_build_object(
    'status', 'committed_on_transaction_end',
    'transition_id', transition_id,
    'transition_kind', transition_kind,
    'scope_id', p_scope_id,
    'sequence_no', next_sequence,
    'policy_subject_id', target.id,
    'policy_digest', pg_catalog.encode(target.payload_digest, 'hex'),
    'bootstrap_exhausted', true
  );
end;
$fn$;

create function ecb_governance.executor_scope(p_scope_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  sc ecb_governance.scopes%rowtype;
  current_t ecb_governance.transitions%rowtype;
  policy_row ecb_governance.subjects%rowtype;
  pending jsonb;
begin
  select * into strict sc from ecb_governance.scopes where id = p_scope_id;
  if sc.current_transition_id is not null then
    select * into strict current_t from ecb_governance.transitions where id = sc.current_transition_id;
    select * into strict policy_row from ecb_governance.subjects where id = current_t.policy_subject_id;
  end if;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'decision_id', d.id, 'target_subject_id', d.target_subject_id,
    'target_digest', pg_catalog.encode(d.target_digest, 'hex'),
    'expected_current_transition_id', d.expected_current_transition_id,
    'request_id', d.request_id, 'recorded_at', d.recorded_at
  ) order by d.recorded_at, d.id), '[]'::jsonb)
  into pending
  from ecb_governance.decisions d
  where d.scope_id = p_scope_id and d.decision_kind in ('genesis_authorization', 'succession_authorization')
    and d.permitted_executor_class = 'governance_executor'
    and not exists (select 1 from ecb_governance.decisions w
      where w.decision_kind = 'withdrawal' and w.target_decision_id = d.id)
    and not exists (select 1 from ecb_governance.transitions t where t.decision_id = d.id);

  return pg_catalog.jsonb_build_object(
    'scope_id', sc.id,
    'binding_subject_id', sc.binding_subject_id,
    'bootstrap_exhausted', sc.bootstrap_exhausted,
    'current_transition_id', sc.current_transition_id,
    'current_policy_subject_id', case when sc.current_transition_id is null then null else current_t.policy_subject_id end,
    'current_policy_digest', case when sc.current_transition_id is null then null else pg_catalog.encode(policy_row.payload_digest, 'hex') end,
    'pending_executable_decisions', pending
  );
end;
$fn$;

create function ecb_governance.recover_request(p_scope_id uuid, p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  sc ecb_governance.scopes%rowtype;
  t ecb_governance.transitions%rowtype;
  d ecb_governance.decisions%rowtype;
begin
  -- Scope lock establishes the read boundary for absence/currentness; a network failure before this
  -- function returns remains an unknown outcome to the caller and must not be guessed from prose.
  select * into strict sc from ecb_governance.scopes where id = p_scope_id for update;
  select * into t from ecb_governance.transitions where scope_id = p_scope_id and request_id = p_request_id;
  if found then
    return pg_catalog.jsonb_build_object(
      'status', 'confirmed_effect', 'request_id', p_request_id,
      'transition_id', t.id, 'current_transition_id', sc.current_transition_id,
      'sequence_no', t.sequence_no, 'policy_subject_id', t.policy_subject_id
    );
  end if;
  select * into d from ecb_governance.decisions where scope_id = p_scope_id and request_id = p_request_id;
  if found then
    return pg_catalog.jsonb_build_object(
      'status', 'confirmed_decision_only', 'request_id', p_request_id,
      'decision_id', d.id, 'decision_kind', d.decision_kind,
      'current_transition_id', sc.current_transition_id
    );
  end if;
  return pg_catalog.jsonb_build_object(
    'status', 'not_committed_under_scope_locked_read',
    'request_id', p_request_id, 'scope_id', p_scope_id,
    'current_transition_id', sc.current_transition_id
  );
end;
$fn$;

reset role;

-- Fix function ownership explicitly and make the privilege surface inspectable. Runtime roles get
-- no raw-table grant and no ownership membership.
revoke all on all functions in schema ecb_governance
  from public, anon, authenticated, service_role,
       ecb_governance_installer, ecb_governance_verifier, ecb_governance_executor;

-- Installer/custody-only entries.
grant execute on function ecb_governance.installer_retain_subject(text,text,text,text,uuid)
  to ecb_governance_installer;
grant execute on function ecb_governance.installer_create_scope(uuid)
  to ecb_governance_installer;
grant execute on function ecb_governance.installer_open_setup(uuid,uuid,uuid,uuid,text,text,text,smallint,timestamptz,uuid)
  to ecb_governance_installer;

-- Protected human-service entries. The verifier role has no table access and no executor effect.
grant execute on function ecb_governance.registration_context(uuid,text)
  to ecb_governance_verifier;
grant execute on function ecb_governance.begin_registration(uuid,text,text,text,timestamptz,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.consume_ceremony_failure(uuid,text,text,text)
  to ecb_governance_verifier;
grant execute on function ecb_governance.complete_registration(uuid,text,text,text,bytea,integer,bigint,text[],text,boolean,boolean,text,boolean,boolean,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.bind_initial_instance(uuid,text,uuid[],text,uuid,uuid,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.authentication_context(uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.begin_authentication(uuid,text,text,timestamptz,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.authentication_credential(uuid,text)
  to ecb_governance_verifier;
grant execute on function ecb_governance.complete_authentication(uuid,text,text,text,bytea,bigint,text,boolean,boolean,text,boolean,boolean,text,text,integer,integer,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.human_scope(text,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.record_human_decision(text,text,text,uuid,text,uuid,uuid,uuid,text,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.withdraw_human_decision(text,text,text,uuid,uuid,uuid,uuid)
  to ecb_governance_verifier;
grant execute on function ecb_governance.logout_session(text,text,text)
  to ecb_governance_verifier;
grant execute on function ecb_governance.recover_request(uuid,uuid)
  to ecb_governance_verifier;

-- Ordinary operating/executor entries. No human-session or registration function is granted.
grant execute on function ecb_governance.retain_candidate_policy(text,text,uuid)
  to ecb_governance_executor;
grant execute on function ecb_governance.executor_scope(uuid)
  to ecb_governance_executor;
grant execute on function ecb_governance.execute_governance(uuid,uuid,uuid,uuid)
  to ecb_governance_executor;
grant execute on function ecb_governance.recover_request(uuid,uuid)
  to ecb_governance_executor;

-- Human service may also retain an exact policy candidate for presentation when the candidate
-- arrives through a trusted non-agent route; this grants retention only, never execution.
grant execute on function ecb_governance.retain_candidate_policy(text,text,uuid)
  to ecb_governance_verifier;

-- Installation self-checks. These prove only the installed structural boundary, not live custody,
-- WebAuthn behavior, normative authority or currentness.
do $check$
declare
  table_names text[];
  ordinary_direct_grants integer;
  role_owner_memberships integer;
  unsafe_definers integer;
  public_policy_count integer;
begin
  select pg_catalog.array_agg(table_name order by table_name)
  into table_names
  from information_schema.tables
  where table_schema = 'ecb_governance' and table_type = 'BASE TABLE';
  if table_names is distinct from array[
    'ceremonies','credentials','decisions','scopes','sessions','setup_grants','subjects','transitions'
  ]::text[] then
    raise exception 'BUILD 6 private table surface drifted: %', table_names;
  end if;

  select pg_catalog.count(*) into ordinary_direct_grants
  from information_schema.role_table_grants
  where table_schema = 'ecb_governance'
    and grantee in ('anon','authenticated','service_role','ecb_governance_verifier','ecb_governance_executor')
    and privilege_type in ('SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER');
  if ordinary_direct_grants <> 0 then
    raise exception 'BUILD 6 left % direct private-table grants to ordinary/runtime roles', ordinary_direct_grants;
  end if;

  select pg_catalog.count(*) into role_owner_memberships
  from pg_catalog.pg_auth_members m
  join pg_catalog.pg_roles role_member on role_member.oid = m.member
  join pg_catalog.pg_roles role_granted on role_granted.oid = m.roleid
  where role_member.rolname in ('ecb_governance_verifier','ecb_governance_executor')
    and role_granted.rolname in ('ecb_governance_native','ecb_governance_installer');
  if role_owner_memberships <> 0 then
    raise exception 'BUILD 6 runtime role inherited privileged governance ownership';
  end if;

  select pg_catalog.count(*) into unsafe_definers
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'ecb_governance'
    and p.prosecdef
    and coalesce(p.proconfig, '{}'::text[]) @> array['search_path=""']::text[] is false;
  if unsafe_definers <> 0 then
    raise exception 'BUILD 6 has % SECURITY DEFINER functions without fixed empty search_path', unsafe_definers;
  end if;

  select pg_catalog.count(*) into public_policy_count
  from pg_catalog.pg_policies where schemaname = 'ecb_governance';
  if public_policy_count <> 0 then
    raise exception 'BUILD 6 unexpectedly installed RLS policies: %', public_policy_count;
  end if;

  if has_schema_privilege('service_role', 'ecb_governance', 'usage')
     or has_schema_privilege('anon', 'ecb_governance', 'usage')
     or has_schema_privilege('authenticated', 'ecb_governance', 'usage') then
    raise exception 'BUILD 6 exposed the private governance schema to API roles';
  end if;
end;
$check$;
