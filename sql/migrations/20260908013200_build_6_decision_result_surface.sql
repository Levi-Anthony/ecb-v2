-- BUILD 6 construction correction — explicit decision result classification.
--
-- The human decision entry already persists the exact decision kind. Return that same durable
-- classification to the protected caller so the immediate result and later recovery use the same
-- vocabulary. This does not add a decision kind, authorization path, or authority semantic.

set role ecb_governance_native;

create or replace function ecb_governance.record_human_decision(
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
  decision_id uuid := pg_catalog.coalesce(p_decision_id, pg_catalog.gen_random_uuid());
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
        'status', 'confirmed_prior_decision',
        'decision_id', existing.id,
        'decision_kind', existing.decision_kind,
        'target_subject_id', existing.target_subject_id,
        'expected_current_transition_id', existing.expected_current_transition_id
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
      inactivity_expires_at = pg_catalog.least(absolute_expires_at, now_ts + interval '24 hours')
  where id = s.id;

  return pg_catalog.jsonb_build_object(
    'status', case when p_action = 'accept' then 'authorized' else 'declined' end,
    'decision_id', decision_id,
    'decision_kind', decision_kind,
    'target_subject_id', target_policy.id,
    'expected_current_transition_id', sc.current_transition_id
  );
end;
$fn$;

reset role;
