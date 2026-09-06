-- BUILD 5B — Versioned Artifacts + First Transformation Receipt
-- STRUCTURAL: one immutable Artifact store with five native record roles, database-derived
-- specifications, attempts and receipts, and a previously-committed-attempt entry boundary.
--
-- This file carries no BEGIN/COMMIT. The Output Contract requires the runner to wrap the exact
-- file bytes and the parameterized migration-ledger write in one single outer transaction.

create table public.artifacts (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  artifact_role text not null,
  context_id uuid not null,
  target_id uuid,
  payload_text text not null,
  payload_digest bytea not null,
  recorded_at timestamptz not null,
  producer_succeeded boolean,
  created_xid xid8 not null,

  constraint artifacts_role_vocabulary
    check (artifact_role in (
      'source_representation',
      'transformation_request',
      'transformed_representation',
      'check_attempt',
      'transformation_receipt'
    )),
  constraint artifacts_target_only_for_check_attempt
    check (
      (artifact_role = 'check_attempt' and target_id is not null)
      or (artifact_role <> 'check_attempt' and target_id is null)
    ),
  constraint artifacts_producer_flag_only_for_output
    check (
      (artifact_role = 'transformed_representation' and producer_succeeded is not null)
      or (artifact_role <> 'transformed_representation' and producer_succeeded is null)
    ),
  constraint artifacts_context_is_not_self
    check (context_id <> id),
  constraint artifacts_target_is_not_self
    check (target_id is null or target_id <> id),
  constraint artifacts_payload_digest_sha256
    check (pg_catalog.octet_length(payload_digest) = 32),

  constraint artifacts_id_registered
    foreign key (id) references public.referents (id) not deferrable,
  constraint artifacts_context_registered
    foreign key (context_id) references public.referents (id) not deferrable,
  constraint artifacts_target_registered
    foreign key (target_id) references public.referents (id) not deferrable
);

comment on table public.artifacts is
  'BUILD 5B immutable retained representations, predeclared operations, durable check attempts and '
  'database-derived Transformation Receipts. A receipt is evidence of a bounded check, never '
  'acceptance, authority, authorization, standing, warrant or currentness.';

comment on column public.artifacts.created_xid is
  'Database-derived top-level creation transaction. Local execution metadata only: not Referent '
  'identity, version order, or bitemporal validity. Logical import into another cluster requires '
  'explicit requalification.';

-- One terminal observation per committed attempt. Earned by retry and concurrent-publication
-- ambiguity. Imposes no uniqueness on output lineage or payload content.
create unique index artifacts_one_receipt_per_attempt
  on public.artifacts (context_id)
  where artifact_role = 'transformation_receipt';

create function public.prepare_build_5b_artifact()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $prepare$
declare
  installed_definition text;
  installed_definition_digest text;
  contract_obligations text[] := array[
    'input_format', 'output_format', 'participation', 'grounding', 'preservation', 'checker_binding'
  ];
  checker_identity text := 'prepare_build_5b_artifact/v1';
  context_row public.artifacts%rowtype;
  operation_row public.artifacts%rowtype;
  input_row public.artifacts%rowtype;
  output_row public.artifacts%rowtype;
  output_found boolean := false;
  operation_spec jsonb;
  derived_payload jsonb;

  -- receipt working state
  check_input_format boolean;
  check_output_format boolean;
  check_participation boolean;
  check_grounding boolean;
  check_preservation boolean;
  check_binding boolean;
  reason_map jsonb := '{}'::jsonb;
  witness jsonb;
  result_text text;

  input_doc json;
  output_doc json;
  input_ok boolean := false;
  output_ok boolean := false;

  -- witness columns
  w_event uuid;
  w_claim uuid;
  w_from text;
  w_to text;
  w_recorded timestamptz;
  w_link uuid;
  w_evidence uuid;
  w_scheme text;
  w_linked_digest bytea;
  w_observed_digest bytea;
  w_link_claim uuid;
  witness_found boolean := false;

  uuid_pattern text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  hex64_pattern text := '^[0-9a-f]{64}$';
  ts_pattern text := '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$';

  queue json[];
  cursor_node json;
  key_total bigint;
  key_distinct bigint;
begin
  -- Derived columns are never caller-supplied. The grant boundary already withholds them from
  -- service_role; this rejects a forged value from any role that can reach the table at all.
  if new.payload_digest is not null
     or new.recorded_at is not null
     or new.created_xid is not null then
    raise exception 'BUILD 5B derived columns are not caller-insertable'
      using errcode = '42501';
  end if;

  if new.id is null then
    new.id := pg_catalog.gen_random_uuid();
  end if;

  if new.artifact_role is null then
    raise exception 'BUILD 5B artifact_role is required' using errcode = '23514';
  end if;

  -- The installed checker definition, obtained by database introspection rather than asserted.
  select pg_catalog.pg_get_functiondef(p.oid)
    into installed_definition
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'prepare_build_5b_artifact';

  if installed_definition is null then
    raise exception 'BUILD 5B checker definition is not introspectable' using errcode = 'P0002';
  end if;

  installed_definition_digest := pg_catalog.encode(
    extensions.digest(pg_catalog.convert_to(installed_definition, 'UTF8'), 'sha256'), 'hex');

  -- Native participation resolution. A representation's context is a bare Referent; every other
  -- role's context must be an existing Artifact of the required role.
  if new.artifact_role <> 'source_representation' then
    select * into context_row from public.artifacts where id = new.context_id;
    if not found then
      raise exception 'BUILD 5B context % is not an Artifact', new.context_id
        using errcode = '23503';
    end if;
  end if;

  if new.artifact_role in ('source_representation', 'transformed_representation') then
    if new.payload_text is null then
      raise exception 'BUILD 5B % requires caller payload', new.artifact_role
        using errcode = '23514';
    end if;
  else
    if new.payload_text is not null then
      raise exception 'BUILD 5B % payload is database-derived', new.artifact_role
        using errcode = '42501';
    end if;
  end if;

  if new.artifact_role = 'source_representation' then
    -- Its purported Event/source contents are checked later, so wrong or missing native evidence
    -- stays observable rather than being erased at write time.
    null;

  elsif new.artifact_role = 'transformation_request' then
    if context_row.artifact_role <> 'source_representation' then
      raise exception 'BUILD 5B request context must be a source_representation'
        using errcode = '23514';
    end if;

    operation_spec := pg_catalog.jsonb_build_object(
      'contract_id', 'ecb_transition_relayout_v1',
      'contract_version', 1,
      'source_format', 'transition_v1',
      'output_format', 'basis_v1',
      'scope', 'recorded_transition_only',
      'coverage', 'grounding_and_preservation',
      'obligations', pg_catalog.to_jsonb(contract_obligations),
      'checker_id', checker_identity,
      'checker_definition', installed_definition,
      'checker_definition_digest', installed_definition_digest,
      'trust_boundary',
        'service_role_producer; trusted_database_and_ddl; no_external_trust_root'
    );
    new.payload_text := operation_spec::text;

  elsif new.artifact_role = 'transformed_representation' then
    if context_row.artifact_role <> 'transformation_request' then
      raise exception 'BUILD 5B output context must be a transformation_request'
        using errcode = '23514';
    end if;
    -- Payload may be malformed. Exact bytes are retained and never silently corrected.

  elsif new.artifact_role = 'check_attempt' then
    if context_row.artifact_role <> 'transformation_request' then
      raise exception 'BUILD 5B attempt context must be a transformation_request'
        using errcode = '23514';
    end if;

    select * into input_row from public.artifacts where id = context_row.context_id;
    if not found then
      raise exception 'BUILD 5B attempt input is unavailable' using errcode = 'P0002';
    end if;

    -- The target must be registered; it need not yet have a native output row.
    derived_payload := pg_catalog.jsonb_build_object(
      'event', 'check_requested',
      'operation_id', context_row.id,
      'operation_digest', pg_catalog.encode(context_row.payload_digest, 'hex'),
      'input_id', input_row.id,
      'input_digest', pg_catalog.encode(input_row.payload_digest, 'hex'),
      'output_id', new.target_id,
      'contract_id', 'ecb_transition_relayout_v1',
      'checker_id', checker_identity,
      'checker_definition_digest', installed_definition_digest
    );
    new.payload_text := derived_payload::text;

  elsif new.artifact_role = 'transformation_receipt' then
    if context_row.artifact_role <> 'check_attempt' then
      raise exception 'BUILD 5B receipt context must be a check_attempt'
        using errcode = '23514';
    end if;

    -- Committed-attempt entry boundary. pg_current_xact_id() returns the top-level transaction id
    -- even inside a subtransaction, so a SAVEPOINT cannot bypass this.
    if context_row.created_xid = pg_catalog.pg_current_xact_id() then
      raise exception
        'BUILD 5B receipt requires an attempt committed in a different top-level transaction'
        using errcode = '55000';
    end if;

    select * into operation_row from public.artifacts where id = context_row.context_id;
    if not found then
      raise exception 'BUILD 5B receipt operation is unavailable' using errcode = 'P0002';
    end if;

    select * into input_row from public.artifacts where id = operation_row.context_id;
    if not found then
      raise exception 'BUILD 5B receipt input is unavailable' using errcode = 'P0002';
    end if;

    select * into output_row from public.artifacts where id = context_row.target_id;
    output_found := found;

    ---------------------------------------------------------------------------
    -- checker_binding, evaluated first. An unqualified checker is unavailable
    -- checking capability, never an invented result under another contract.
    ---------------------------------------------------------------------------
    if operation_row.payload_text::jsonb ->> 'checker_id' = checker_identity
       and operation_row.payload_text::jsonb ->> 'checker_definition_digest'
           = installed_definition_digest then
      check_binding := true;
    else
      check_binding := null;
      reason_map := reason_map
        || pg_catalog.jsonb_build_object('checker_binding', 'checker_definition_mismatch');
    end if;

    if check_binding is true then
      -----------------------------------------------------------------------
      -- input_format
      -----------------------------------------------------------------------
      begin
        input_doc := input_row.payload_text::json;
        input_ok := true;
      exception
        when others then
          input_ok := false;
      end;

      if not input_ok then
        check_input_format := false;
      else
        check_input_format := true;
        -- Duplicate keys at every depth, tested on json before jsonb can discard them.
        queue := array[input_doc];
        while pg_catalog.array_length(queue, 1) > 0 loop
          cursor_node := queue[1];
          queue := queue[2:];
          if pg_catalog.json_typeof(cursor_node) = 'object' then
            select pg_catalog.count(*), pg_catalog.count(distinct k)
              into key_total, key_distinct
            from pg_catalog.json_object_keys(cursor_node) as t(k);
            if key_total <> key_distinct then
              check_input_format := false;
              exit;
            end if;
            queue := queue || array(select value from pg_catalog.json_each(cursor_node));
          elsif pg_catalog.json_typeof(cursor_node) = 'array' then
            queue := queue || array(select value from pg_catalog.json_array_elements(cursor_node));
          end if;
        end loop;
      end if;

      if check_input_format then
        check_input_format :=
          (select pg_catalog.count(*) from pg_catalog.json_object_keys(input_doc)) = 8
          and input_doc ->> 'format' = 'transition_v1'
          and input_doc ->> 'scope' = 'recorded_transition_only'
          and pg_catalog.json_typeof(input_doc -> 'basis') = 'object'
          and (select pg_catalog.count(*) from pg_catalog.json_object_keys(input_doc -> 'basis')) = 5
          and (input_doc ->> 'event') ~ uuid_pattern
          and (input_doc ->> 'claim') ~ uuid_pattern
          and pg_catalog.json_typeof(input_doc -> 'from') = 'string'
          and pg_catalog.json_typeof(input_doc -> 'to') = 'string'
          and (input_doc ->> 'recorded_at') ~ ts_pattern
          and (input_doc #>> '{basis,link}') ~ uuid_pattern
          and (input_doc #>> '{basis,evidence}') ~ uuid_pattern
          and pg_catalog.json_typeof(input_doc #> '{basis,scheme}') = 'string'
          and (input_doc #>> '{basis,linked_digest}') ~ hex64_pattern
          and (input_doc #>> '{basis,observed_digest}') ~ hex64_pattern;
      end if;

      if check_input_format is not true then
        check_input_format := false;
        reason_map := reason_map
          || pg_catalog.jsonb_build_object('input_format', 'invalid_format');
      end if;

      -----------------------------------------------------------------------
      -- output_format and participation
      -----------------------------------------------------------------------
      if not output_found then
        check_output_format := null;
        check_participation := null;
        reason_map := reason_map || pg_catalog.jsonb_build_object(
          'output_format', 'unavailable', 'participation', 'unavailable');
      else
        if output_row.artifact_role = 'transformed_representation'
           and output_row.context_id = operation_row.id then
          check_participation := true;
        else
          check_participation := false;
          reason_map := reason_map
            || pg_catalog.jsonb_build_object('participation', 'wrong_participant');
        end if;

        begin
          output_doc := output_row.payload_text::json;
          output_ok := true;
        exception
          when others then
            output_ok := false;
        end;

        if not output_ok then
          check_output_format := false;
        else
          check_output_format := true;
          queue := array[output_doc];
          while pg_catalog.array_length(queue, 1) > 0 loop
            cursor_node := queue[1];
            queue := queue[2:];
            if pg_catalog.json_typeof(cursor_node) = 'object' then
              select pg_catalog.count(*), pg_catalog.count(distinct k)
                into key_total, key_distinct
              from pg_catalog.json_object_keys(cursor_node) as t(k);
              if key_total <> key_distinct then
                check_output_format := false;
                exit;
              end if;
              queue := queue || array(select value from pg_catalog.json_each(cursor_node));
            elsif pg_catalog.json_typeof(cursor_node) = 'array' then
              queue := queue || array(select value from pg_catalog.json_array_elements(cursor_node));
            end if;
          end loop;
        end if;

        if check_output_format then
          check_output_format :=
            (select pg_catalog.count(*) from pg_catalog.json_object_keys(output_doc)) = 4
            and output_doc ->> 'format' = 'basis_v1'
            and output_doc ->> 'scope' = 'recorded_transition_only'
            and pg_catalog.json_typeof(output_doc -> 'basis') = 'object'
            and pg_catalog.json_typeof(output_doc -> 'transition') = 'object'
            and (select pg_catalog.count(*)
                 from pg_catalog.json_object_keys(output_doc -> 'basis')) = 5
            and (select pg_catalog.count(*)
                 from pg_catalog.json_object_keys(output_doc -> 'transition')) = 5
            and (output_doc #>> '{basis,evidence}') ~ uuid_pattern
            and (output_doc #>> '{basis,link}') ~ uuid_pattern
            and pg_catalog.json_typeof(output_doc #> '{basis,scheme}') = 'string'
            and (output_doc #>> '{basis,linked_digest}') ~ hex64_pattern
            and (output_doc #>> '{basis,observed_digest}') ~ hex64_pattern
            and (output_doc #>> '{transition,id}') ~ uuid_pattern
            and (output_doc #>> '{transition,claim}') ~ uuid_pattern
            and pg_catalog.json_typeof(output_doc #> '{transition,from}') = 'string'
            and pg_catalog.json_typeof(output_doc #> '{transition,to}') = 'string'
            and (output_doc #>> '{transition,recorded_at}') ~ ts_pattern;
        end if;

        if check_output_format is not true then
          check_output_format := false;
          reason_map := reason_map
            || pg_catalog.jsonb_build_object('output_format', 'invalid_format');
        end if;
      end if;

      -----------------------------------------------------------------------
      -- grounding, against a separately read source witness
      -----------------------------------------------------------------------
      select t.id, t.claim_id, t.from_standing, t.to_standing, t.recorded_at,
             l.id, l.evidence_referent_id, l.evidence_revision_scheme,
             l.evidence_revision_digest, t.observed_revision_digest, l.claim_id
        into w_event, w_claim, w_from, w_to, w_recorded,
             w_link, w_evidence, w_scheme, w_linked_digest, w_observed_digest, w_link_claim
      from public.claim_standing_transitions t
      left join public.evidence_links l on l.id = t.basis_evidence_link_id
      where t.id = input_row.context_id;
      witness_found := found;

      if witness_found and w_link is not null then
        witness := pg_catalog.jsonb_build_object(
          'event_id', w_event,
          'claim_id', w_claim,
          'from_standing', w_from,
          'to_standing', w_to,
          'recorded_at', pg_catalog.to_char(
            w_recorded at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
          'link_id', w_link,
          'evidence_referent_id', w_evidence,
          'evidence_revision_scheme', w_scheme,
          'evidence_revision_digest', pg_catalog.encode(w_linked_digest, 'hex'),
          'observed_revision_digest', pg_catalog.encode(w_observed_digest, 'hex'),
          'link_claim_id', w_link_claim
        );
      else
        witness := null;
      end if;

      if not check_input_format then
        check_grounding := null;
        reason_map := reason_map
          || pg_catalog.jsonb_build_object('grounding', 'not_evaluated');
      elsif witness is null then
        check_grounding := null;
        reason_map := reason_map
          || pg_catalog.jsonb_build_object('grounding', 'unavailable');
      else
        check_grounding :=
          (input_doc ->> 'event') = w_event::text
          and (input_doc ->> 'claim') = w_claim::text
          and (input_doc ->> 'from') = w_from
          and (input_doc ->> 'to') = w_to
          and (input_doc ->> 'recorded_at') = (witness ->> 'recorded_at')
          and (input_doc #>> '{basis,link}') = w_link::text
          and (input_doc #>> '{basis,evidence}') = w_evidence::text
          and (input_doc #>> '{basis,scheme}') = w_scheme
          and (input_doc #>> '{basis,linked_digest}')
              = pg_catalog.encode(w_linked_digest, 'hex')
          and (input_doc #>> '{basis,observed_digest}')
              = pg_catalog.encode(w_observed_digest, 'hex')
          -- A present but inconsistent Link is a grounding failure, not a filtered-out row.
          and w_link_claim = w_claim;
        if not check_grounding then
          reason_map := reason_map
            || pg_catalog.jsonb_build_object('grounding', 'mismatch');
        end if;
      end if;

      -----------------------------------------------------------------------
      -- preservation
      -----------------------------------------------------------------------
      if check_input_format is not true or check_output_format is not true then
        check_preservation := null;
        reason_map := reason_map
          || pg_catalog.jsonb_build_object('preservation', 'not_evaluated');
      else
        check_preservation :=
          (output_doc #>> '{transition,id}') = (input_doc ->> 'event')
          and (output_doc #>> '{transition,claim}') = (input_doc ->> 'claim')
          and (output_doc #>> '{transition,from}') = (input_doc ->> 'from')
          and (output_doc #>> '{transition,to}') = (input_doc ->> 'to')
          and (output_doc #>> '{transition,recorded_at}') = (input_doc ->> 'recorded_at')
          and (output_doc #>> '{basis,link}') = (input_doc #>> '{basis,link}')
          and (output_doc #>> '{basis,evidence}') = (input_doc #>> '{basis,evidence}')
          and (output_doc #>> '{basis,scheme}') = (input_doc #>> '{basis,scheme}')
          and (output_doc #>> '{basis,linked_digest}') = (input_doc #>> '{basis,linked_digest}')
          and (output_doc #>> '{basis,observed_digest}')
              = (input_doc #>> '{basis,observed_digest}')
          and (output_doc ->> 'scope') = (input_doc ->> 'scope');
        if not check_preservation then
          reason_map := reason_map
            || pg_catalog.jsonb_build_object('preservation', 'mismatch');
        end if;
      end if;
    else
      -- Unqualified checker: do not evaluate further under another contract.
      check_input_format := null;
      check_output_format := null;
      check_participation := null;
      check_grounding := null;
      check_preservation := null;
      witness := null;
      reason_map := reason_map || pg_catalog.jsonb_build_object(
        'input_format', 'not_evaluated',
        'output_format', 'not_evaluated',
        'participation', 'not_evaluated',
        'grounding', 'not_evaluated',
        'preservation', 'not_evaluated'
      );
    end if;

    -- Any observed false yields FAIL even when other components are unavailable; otherwise any
    -- null yields INCOMPLETE; only all six true yields PASS. producer_succeeded has no weight.
    if check_input_format is false or check_output_format is false
       or check_participation is false or check_grounding is false
       or check_preservation is false or check_binding is false then
      result_text := 'FAIL';
    elsif check_input_format is null or check_output_format is null
       or check_participation is null or check_grounding is null
       or check_preservation is null or check_binding is null then
      result_text := 'INCOMPLETE';
    else
      result_text := 'PASS';
    end if;

    derived_payload := pg_catalog.jsonb_build_object(
      'receipt_version', 1,
      'scope', 'recorded_transition_only',
      'coverage', 'grounding_and_preservation',
      'attempt_id', context_row.id,
      'operation_id', operation_row.id,
      'input_id', input_row.id,
      'output_id', context_row.target_id,
      'operation_digest', pg_catalog.encode(operation_row.payload_digest, 'hex'),
      'input_digest', pg_catalog.encode(input_row.payload_digest, 'hex'),
      'output_digest', case when output_found
        then pg_catalog.encode(output_row.payload_digest, 'hex') else null end,
      'checker_id', checker_identity,
      'checker_definition_digest',
        operation_row.payload_text::jsonb ->> 'checker_definition_digest',
      'observed_checker_definition_digest', installed_definition_digest,
      'producer_succeeded', case when output_found
        then pg_catalog.to_jsonb(output_row.producer_succeeded) else 'null'::jsonb end,
      'checks', pg_catalog.jsonb_build_object(
        'input_format', check_input_format,
        'output_format', check_output_format,
        'participation', check_participation,
        'grounding', check_grounding,
        'preservation', check_preservation,
        'checker_binding', check_binding
      ),
      'reasons', reason_map,
      'source_witness', witness,
      'result', result_text
    );
    new.payload_text := derived_payload::text;
  end if;

  -- Fresh same-UUID Referent registration. An already-registered id is rejected, matching the
  -- fresh-native creation posture; this installs no general native-binding lifecycle.
  if exists (select 1 from public.referents where id = new.id) then
    raise exception 'BUILD 5B Artifact id % is already registered', new.id
      using errcode = '23505';
  end if;
  insert into public.referents (id) values (new.id);

  new.payload_digest := extensions.digest(
    pg_catalog.convert_to(new.payload_text, 'UTF8'), 'sha256');
  new.recorded_at := pg_catalog.transaction_timestamp();
  new.created_xid := pg_catalog.pg_current_xact_id();

  return new;
end;
$prepare$;

create function public.reject_build_5b_artifact_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $reject$
begin
  raise exception 'BUILD 5B Artifacts are immutable; % is not permitted', tg_op
    using errcode = '42501';
  return null;
end;
$reject$;

create trigger prepare_build_5b_artifact
  before insert on public.artifacts
  for each row execute function public.prepare_build_5b_artifact();

-- Statement-level, so a no-op or zero-row attempt still raises.
create trigger reject_build_5b_artifact_mutation
  before update or delete or truncate on public.artifacts
  for each statement execute function public.reject_build_5b_artifact_mutation();

revoke all on function public.prepare_build_5b_artifact()
  from public, anon, authenticated, service_role;
revoke all on function public.reject_build_5b_artifact_mutation()
  from public, anon, authenticated, service_role;

alter table public.artifacts enable row level security;

revoke all on table public.artifacts from public, anon, authenticated, service_role;

grant select on table public.artifacts to service_role;
grant insert (
  id, artifact_role, context_id, target_id, payload_text, producer_succeeded
) on table public.artifacts to service_role;
