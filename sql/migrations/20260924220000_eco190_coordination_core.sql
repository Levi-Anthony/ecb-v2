-- ECO-190 — Tri-axial coordination core physical realization
-- Register-B bounded canonical-BRAIN vertical slice.
-- Governing Shape: ECO-189. Change/reconciliation contract: ECO-191.
-- Additive only. No production consumer cutover is performed by this migration.

begin;

create schema ecb_coordination authorization postgres;
revoke all on schema ecb_coordination from public, anon, authenticated, service_role;

create table ecb_coordination.episodes (
  id uuid primary key,
  profile_version text not null default 'ecb.coordination/1'
    check (profile_version = 'ecb.coordination/1'),
  epoch bigint not null default 0 check (epoch >= 0),
  head_receipt_id uuid,
  created_at timestamptz not null default transaction_timestamp(),
  constraint coordination_episodes_referent_fkey
    foreign key (id) references public.referents(id)
    on update restrict on delete restrict
);

create table ecb_coordination.external_reliances (
  id uuid primary key,
  episode_id uuid not null references ecb_coordination.episodes(id)
    on update restrict on delete restrict,
  source_system text not null check (length(btrim(source_system)) > 0),
  source_locator text not null check (length(btrim(source_locator)) > 0),
  epoch bigint not null default 0 check (epoch >= 0),
  head_receipt_id uuid,
  created_at timestamptz not null default transaction_timestamp(),
  constraint coordination_reliances_referent_fkey
    foreign key (id) references public.referents(id)
    on update restrict on delete restrict,
  constraint coordination_reliances_identity_unique
    unique (episode_id, source_system, source_locator)
);

create table ecb_coordination.consumer_bindings (
  id uuid primary key,
  episode_id uuid not null references ecb_coordination.episodes(id)
    on update restrict on delete restrict,
  consumer_kind text not null check (length(btrim(consumer_kind)) > 0),
  consumer_locator text not null check (length(btrim(consumer_locator)) > 0),
  epoch bigint not null default 0 check (epoch >= 0),
  head_receipt_id uuid,
  created_at timestamptz not null default transaction_timestamp(),
  constraint coordination_consumers_referent_fkey
    foreign key (id) references public.referents(id)
    on update restrict on delete restrict,
  constraint coordination_consumers_identity_unique
    unique (episode_id, consumer_kind, consumer_locator)
);

create table ecb_coordination.records (
  receipt_id uuid primary key
    references public.ordinary_operations(id)
    on update restrict on delete restrict,
  artifact_id uuid not null unique
    references public.text_artifacts(id)
    on update restrict on delete restrict,
  episode_id uuid not null
    references ecb_coordination.episodes(id)
    on update restrict on delete restrict,
  subject_id uuid
    references public.referents(id)
    on update restrict on delete restrict,
  record_role text not null check (record_role in (
    'initial_snapshot',
    'material_change',
    'external_reliance',
    'consumer_binding',
    'reconstitution_manifest',
    'qualification'
  )),
  observed_epoch bigint not null check (observed_epoch >= 0),
  result_epoch bigint not null check (result_epoch >= 0),
  validator_revision text not null check (length(btrim(validator_revision)) > 0),
  recorded_at timestamptz not null default transaction_timestamp(),
  constraint coordination_record_subject_shape check (
    (record_role in ('initial_snapshot','material_change','reconstitution_manifest','qualification')
      and subject_id = episode_id)
    or
    (record_role in ('external_reliance','consumer_binding') and subject_id is not null)
  )
);

alter table ecb_coordination.episodes
  add constraint coordination_episodes_head_fkey
  foreign key (head_receipt_id)
  references ecb_coordination.records(receipt_id)
  on update restrict on delete restrict
  deferrable initially deferred;

alter table ecb_coordination.external_reliances
  add constraint coordination_reliances_head_fkey
  foreign key (head_receipt_id)
  references ecb_coordination.records(receipt_id)
  on update restrict on delete restrict
  deferrable initially deferred;

alter table ecb_coordination.consumer_bindings
  add constraint coordination_consumers_head_fkey
  foreign key (head_receipt_id)
  references ecb_coordination.records(receipt_id)
  on update restrict on delete restrict
  deferrable initially deferred;

alter table ecb_coordination.episodes enable row level security;
alter table ecb_coordination.external_reliances enable row level security;
alter table ecb_coordination.consumer_bindings enable row level security;
alter table ecb_coordination.records enable row level security;

revoke all on table ecb_coordination.episodes from public, anon, authenticated, service_role;
revoke all on table ecb_coordination.external_reliances from public, anon, authenticated, service_role;
revoke all on table ecb_coordination.consumer_bindings from public, anon, authenticated, service_role;
revoke all on table ecb_coordination.records from public, anon, authenticated, service_role;

create function ecb_coordination.register_referent()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.referents(id) values (new.id);
  return new;
end;
$$;

create trigger coordination_episodes_register_referent
before insert on ecb_coordination.episodes
for each row execute function ecb_coordination.register_referent();

create trigger coordination_reliances_register_referent
before insert on ecb_coordination.external_reliances
for each row execute function ecb_coordination.register_referent();

create trigger coordination_consumers_register_referent
before insert on ecb_coordination.consumer_bindings
for each row execute function ecb_coordination.register_referent();

create function ecb_coordination.reject_record_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'ecb190_record_immutable' using errcode = '55000';
end;
$$;

create trigger coordination_records_immutable
before update or delete on ecb_coordination.records
for each row execute function ecb_coordination.reject_record_mutation();

create trigger coordination_records_no_truncate
before truncate on ecb_coordination.records
for each statement execute function ecb_coordination.reject_record_mutation();

create function ecb_coordination.guard_episode_head()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bound ecb_coordination.records;
begin
  if new.id is distinct from old.id
     or new.profile_version is distinct from old.profile_version
     or new.created_at is distinct from old.created_at then
    raise exception 'ecb190_episode_identity_immutable' using errcode = '55000';
  end if;

  if new.head_receipt_id is null then
    raise exception 'ecb190_episode_head_required' using errcode = '23514';
  end if;

  select r.* into strict bound
  from ecb_coordination.records r
  where r.receipt_id = new.head_receipt_id;

  if bound.episode_id <> new.id
     or bound.subject_id <> new.id
     or bound.result_epoch <> new.epoch then
    raise exception 'ecb190_episode_head_mismatch' using errcode = '23514';
  end if;

  if old.head_receipt_id is null then
    if old.epoch <> 0 or new.epoch <> 0 or bound.record_role <> 'initial_snapshot' then
      raise exception 'ecb190_episode_initial_head_invalid' using errcode = '23514';
    end if;
  else
    if new.epoch <> old.epoch + 1 or bound.record_role <> 'material_change' then
      raise exception 'ecb190_episode_epoch_transition_invalid' using errcode = '23514';
    end if;
  end if;

  return new;
exception when no_data_found then
  raise exception 'ecb190_episode_head_unavailable' using errcode = 'P0002';
end;
$$;

create function ecb_coordination.guard_reliance_head()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bound ecb_coordination.records;
begin
  if new.id is distinct from old.id
     or new.episode_id is distinct from old.episode_id
     or new.source_system is distinct from old.source_system
     or new.source_locator is distinct from old.source_locator
     or new.created_at is distinct from old.created_at then
    raise exception 'ecb190_reliance_identity_immutable' using errcode = '55000';
  end if;

  if new.head_receipt_id is null then
    raise exception 'ecb190_reliance_head_required' using errcode = '23514';
  end if;

  select r.* into strict bound
  from ecb_coordination.records r
  where r.receipt_id = new.head_receipt_id;

  if bound.episode_id <> new.episode_id
     or bound.subject_id <> new.id
     or bound.record_role <> 'external_reliance'
     or bound.result_epoch <> new.epoch then
    raise exception 'ecb190_reliance_head_mismatch' using errcode = '23514';
  end if;

  if old.head_receipt_id is null then
    if old.epoch <> 0 or new.epoch <> 0 then
      raise exception 'ecb190_reliance_initial_head_invalid' using errcode = '23514';
    end if;
  elsif new.epoch <> old.epoch + 1 then
    raise exception 'ecb190_reliance_epoch_transition_invalid' using errcode = '23514';
  end if;

  return new;
exception when no_data_found then
  raise exception 'ecb190_reliance_head_unavailable' using errcode = 'P0002';
end;
$$;

create function ecb_coordination.guard_consumer_head()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bound ecb_coordination.records;
begin
  if new.id is distinct from old.id
     or new.episode_id is distinct from old.episode_id
     or new.consumer_kind is distinct from old.consumer_kind
     or new.consumer_locator is distinct from old.consumer_locator
     or new.created_at is distinct from old.created_at then
    raise exception 'ecb190_consumer_identity_immutable' using errcode = '55000';
  end if;

  if new.head_receipt_id is null then
    raise exception 'ecb190_consumer_head_required' using errcode = '23514';
  end if;

  select r.* into strict bound
  from ecb_coordination.records r
  where r.receipt_id = new.head_receipt_id;

  if bound.episode_id <> new.episode_id
     or bound.subject_id <> new.id
     or bound.record_role <> 'consumer_binding'
     or bound.result_epoch <> new.epoch then
    raise exception 'ecb190_consumer_head_mismatch' using errcode = '23514';
  end if;

  if old.head_receipt_id is null then
    if old.epoch <> 0 or new.epoch <> 0 then
      raise exception 'ecb190_consumer_initial_head_invalid' using errcode = '23514';
    end if;
  elsif new.epoch <> old.epoch + 1 then
    raise exception 'ecb190_consumer_epoch_transition_invalid' using errcode = '23514';
  end if;

  return new;
exception when no_data_found then
  raise exception 'ecb190_consumer_head_unavailable' using errcode = 'P0002';
end;
$$;

create trigger coordination_episode_head_guard
before update on ecb_coordination.episodes
for each row execute function ecb_coordination.guard_episode_head();

create trigger coordination_reliance_head_guard
before update on ecb_coordination.external_reliances
for each row execute function ecb_coordination.guard_reliance_head();

create trigger coordination_consumer_head_guard
before update on ecb_coordination.consumer_bindings
for each row execute function ecb_coordination.guard_consumer_head();

create function ecb_coordination.parse_payload(
  p_expected_profile text,
  p_submitted_text text
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  payload jsonb;
begin
  if p_submitted_text is null or length(btrim(p_submitted_text)) = 0 then
    raise exception 'ecb190_payload_required' using errcode = '22023';
  end if;

  begin
    payload := p_submitted_text::jsonb;
  exception when others then
    raise exception 'ecb190_payload_invalid_json' using errcode = '22023';
  end;

  if jsonb_typeof(payload) <> 'object'
     or payload->>'profile' is distinct from p_expected_profile then
    raise exception 'ecb190_payload_profile_mismatch' using errcode = '22023';
  end if;

  return payload;
end;
$$;

create function ecb_coordination.require_artifact(p_value jsonb)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  artifact_id uuid;
begin
  if jsonb_typeof(p_value) <> 'string' then
    raise exception 'ecb190_artifact_id_required' using errcode = '22023';
  end if;

  begin
    artifact_id := (p_value #>> '{}')::uuid;
  exception when others then
    raise exception 'ecb190_artifact_id_invalid' using errcode = '22023';
  end;

  perform 1 from public.text_artifacts a where a.id = artifact_id;
  if not found then
    raise exception 'ecb190_artifact_unavailable:%', artifact_id using errcode = 'P0002';
  end if;

  return artifact_id;
end;
$$;

create function ecb_coordination.request_digest(
  p_kind text,
  p_episode_id uuid,
  p_subject_id uuid,
  p_expected_epoch bigint,
  p_submitted_text text
)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  digest_input bytea := pg_catalog.convert_to('ECB190-REQUEST-V1', 'UTF8');
  part text;
  bytes bytea;
begin
  foreach part in array array[
    coalesce(p_kind,''),
    coalesce(p_episode_id::text,''),
    coalesce(p_subject_id::text,''),
    coalesce(p_expected_epoch::text,''),
    coalesce(p_submitted_text,'')
  ] loop
    bytes := pg_catalog.convert_to(part, 'UTF8');
    digest_input := digest_input
      || pg_catalog.int8send(pg_catalog.octet_length(bytes)::bigint)
      || bytes;
  end loop;
  return extensions.digest(digest_input, 'sha256');
end;
$$;

create function ecb_coordination.make_envelope(
  p_operation_id uuid,
  p_role text,
  p_raw text,
  p_parsed jsonb
)
returns text
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'envelope_profile','ecb.coordination.envelope/1',
    'operation_id',p_operation_id,
    'role',p_role,
    'raw',p_raw,
    'parsed',p_parsed
  )::text
$$;

create function ecb_coordination.current_payload(p_receipt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  payload jsonb;
begin
  select (a.content::jsonb)->'parsed'
  into strict payload
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.receipt_id = p_receipt_id;
  return payload;
end;
$$;

create function ecb_coordination.record_index(p_receipt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  role text;
  payload jsonb;
begin
  select r.record_role, (a.content::jsonb)->'parsed'
  into strict role, payload
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.receipt_id = p_receipt_id;

  if role = 'initial_snapshot' then
    return payload->'engagement_index';
  elsif role = 'material_change' then
    return payload#>'{destination_disclosure,destination_index}';
  end if;

  raise exception 'ecb190_record_has_no_engagement_index' using errcode = '22023';
end;
$$;

create function ecb_coordination.record_basis(p_receipt_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  role text;
  payload jsonb;
  basis_id uuid;
begin
  select r.record_role, (a.content::jsonb)->'parsed'
  into strict role, payload
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.receipt_id = p_receipt_id;

  if role = 'initial_snapshot' then
    basis_id := (payload->>'qualification_basis_artifact_id')::uuid;
  elsif role = 'material_change' then
    basis_id := (payload#>>'{destination_disclosure,qualification_basis_artifact_id}')::uuid;
  else
    raise exception 'ecb190_record_has_no_qualification_basis' using errcode = '22023';
  end if;
  return basis_id;
end;
$$;

create function ecb_coordination.record_constituents(p_receipt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  role text;
  payload jsonb;
begin
  select r.record_role, (a.content::jsonb)->'parsed'
  into strict role, payload
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.receipt_id = p_receipt_id;

  if role = 'initial_snapshot' then
    return payload->'constituents';
  elsif role = 'material_change' then
    return payload#>'{destination_disclosure,constituents}';
  end if;

  raise exception 'ecb190_record_has_no_constituents' using errcode = '22023';
end;
$$;

create function ecb_coordination.validate_index(
  p_index jsonb,
  p_expected_referent uuid
)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  k text;
  rid uuid;
begin
  if jsonb_typeof(p_index) <> 'object'
     or not (p_index ?& array['r','b','f','g','q','t','u']) then
    raise exception 'ecb190_engagement_index_incomplete' using errcode = '22023';
  end if;

  if (select count(*) from jsonb_object_keys(p_index)) <> 7 then
    raise exception 'ecb190_engagement_index_extra_fields' using errcode = '22023';
  end if;

  begin
    rid := (p_index->>'r')::uuid;
  exception when others then
    raise exception 'ecb190_engagement_referent_invalid' using errcode = '22023';
  end;

  if rid <> p_expected_referent then
    raise exception 'ecb190_engagement_referent_mismatch' using errcode = '22023';
  end if;

  perform 1 from public.referents r where r.id = rid;
  if not found then
    raise exception 'ecb190_engagement_referent_unavailable' using errcode = 'P0002';
  end if;

  foreach k in array array['b','f','g','q','t','u'] loop
    perform ecb_coordination.require_artifact(p_index->k);
  end loop;
end;
$$;

create function ecb_coordination.validate_constituents(p_constituents jsonb)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  k text;
  v jsonb;
begin
  if jsonb_typeof(p_constituents) <> 'object'
     or not (p_constituents ?& array['fidelity','realization_manifest']) then
    raise exception 'ecb190_constituents_incomplete' using errcode = '22023';
  end if;

  for k, v in select key, value from jsonb_each(p_constituents) loop
    perform ecb_coordination.require_artifact(v);
  end loop;
end;
$$;

create function ecb_coordination.write_record(
  p_operation_id uuid,
  p_operation_kind text,
  p_request_digest bytea,
  p_episode_id uuid,
  p_subject_id uuid,
  p_record_role text,
  p_observed_epoch bigint,
  p_result_epoch bigint,
  p_submitted_text text,
  p_parsed jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  artifact_id uuid;
begin
  artifact_id := pg_catalog.gen_random_uuid();

  insert into public.text_artifacts(id, content)
  values (
    artifact_id,
    ecb_coordination.make_envelope(
      p_operation_id,
      p_record_role,
      p_submitted_text,
      p_parsed
    )
  );

  insert into public.ordinary_operations(
    id, operation_kind, request_digest, result_referent_id
  ) values (
    p_operation_id, p_operation_kind, p_request_digest, artifact_id
  );

  insert into ecb_coordination.records(
    receipt_id, artifact_id, episode_id, subject_id, record_role,
    observed_epoch, result_epoch, validator_revision
  ) values (
    p_operation_id, artifact_id, p_episode_id, p_subject_id, p_record_role,
    p_observed_epoch, p_result_epoch, 'eco190-coordination-v1'
  );

  return artifact_id;
end;
$$;

create function ecb_coordination.replay_record(
  p_operation_id uuid,
  p_operation_kind text,
  p_request_digest bytea
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  existing public.ordinary_operations;
  rec ecb_coordination.records;
  content text;
begin
  select o.* into existing
  from public.ordinary_operations o
  where o.id = p_operation_id;

  if not found then return null; end if;

  if existing.operation_kind <> p_operation_kind
     or existing.request_digest <> p_request_digest then
    raise exception 'ecb11_operation_conflict' using errcode = '23505';
  end if;

  select r.*
  into strict rec
  from ecb_coordination.records r
  where r.receipt_id = p_operation_id;

  select a.content
  into strict content
  from public.text_artifacts a
  where a.id = rec.artifact_id;

  return jsonb_build_object(
    'operation_id',p_operation_id,
    'receipt_id',rec.receipt_id,
    'artifact_id',rec.artifact_id,
    'episode_id',rec.episode_id,
    'subject_id',rec.subject_id,
    'record_role',rec.record_role,
    'observed_epoch',rec.observed_epoch,
    'result_epoch',rec.result_epoch,
    'replayed',true,
    'envelope',content
  );
end;
$$;

create function public.ecb190_open_episode(
  p_operation_id uuid,
  p_episode_id uuid,
  p_submitted_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
  digest bytea;
  replayed jsonb;
  artifact_id uuid;
  basis_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null or p_episode_id is null then
    raise exception 'ecb190_operation_or_episode_required' using errcode = '22023';
  end if;

  digest := ecb_coordination.request_digest(
    'eco190_open_episode', p_episode_id, p_episode_id, 0, p_submitted_text
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text,0)
  );
  replayed := ecb_coordination.replay_record(
    p_operation_id,'eco190_open_episode',digest
  );
  if replayed is not null then return replayed; end if;

  if exists(select 1 from ecb_coordination.episodes e where e.id = p_episode_id) then
    raise exception 'ecb190_episode_already_exists' using errcode = '23505';
  end if;

  insert into ecb_coordination.episodes(id) values (p_episode_id);

  payload := ecb_coordination.parse_payload(
    'ecb.coordination.snapshot/1', p_submitted_text
  );

  perform ecb_coordination.validate_index(payload->'engagement_index', p_episode_id);
  perform ecb_coordination.validate_constituents(payload->'constituents');

  basis_id := ecb_coordination.require_artifact(
    payload->'qualification_basis_artifact_id'
  );

  artifact_id := ecb_coordination.write_record(
    p_operation_id,'eco190_open_episode',digest,
    p_episode_id,p_episode_id,'initial_snapshot',0,0,
    p_submitted_text,payload
  );

  update ecb_coordination.episodes
  set head_receipt_id = p_operation_id
  where id = p_episode_id;

  return jsonb_build_object(
    'operation_id',p_operation_id,
    'receipt_id',p_operation_id,
    'artifact_id',artifact_id,
    'episode_id',p_episode_id,
    'qualification_basis_artifact_id',basis_id,
    'observed_epoch',0,
    'result_epoch',0,
    'replayed',false
  );
end;
$$;

create function public.ecb190_record_reliance(
  p_operation_id uuid,
  p_episode_id uuid,
  p_reliance_id uuid,
  p_expected_epoch bigint,
  p_submitted_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
  digest bytea;
  replayed jsonb;
  current_row ecb_coordination.external_reliances;
  observed_epoch bigint;
  result_epoch bigint;
  artifact_id uuid;
  evidence_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null or p_episode_id is null or p_reliance_id is null
     or p_expected_epoch is null or p_expected_epoch < 0 then
    raise exception 'ecb190_reliance_binding_required' using errcode = '22023';
  end if;

  digest := ecb_coordination.request_digest(
    'eco190_record_reliance',p_episode_id,p_reliance_id,p_expected_epoch,p_submitted_text
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text,0)
  );
  replayed := ecb_coordination.replay_record(
    p_operation_id,'eco190_record_reliance',digest
  );
  if replayed is not null then return replayed; end if;

  payload := ecb_coordination.parse_payload(
    'ecb.coordination.reliance/1',p_submitted_text
  );

  if not (payload ?& array[
    'source_system','source_locator','observed_version','observed_fingerprint',
    'observed_status','observed_at','currentness','decision_consequence',
    'revalidation_trigger','failure_semantics','evidence_basis_artifact_id'
  ]) then
    raise exception 'ecb190_reliance_payload_incomplete' using errcode = '22023';
  end if;

  if payload->>'currentness' not in ('CURRENT','STALE','UNAVAILABLE','UNKNOWN') then
    raise exception 'ecb190_reliance_currentness_invalid' using errcode = '22023';
  end if;

  evidence_id := ecb_coordination.require_artifact(payload->'evidence_basis_artifact_id');

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_reliance_id::text,0)
  );

  select r.* into current_row
  from ecb_coordination.external_reliances r
  where r.id = p_reliance_id
  for update;

  if found then
    if current_row.episode_id <> p_episode_id
       or current_row.source_system <> payload->>'source_system'
       or current_row.source_locator <> payload->>'source_locator' then
      raise exception 'ecb190_reliance_identity_conflict' using errcode = '23505';
    end if;
    if current_row.epoch <> p_expected_epoch then
      raise exception 'ecb190_reliance_revision_conflict' using errcode = '40001';
    end if;
    observed_epoch := current_row.epoch;
    result_epoch := current_row.epoch + 1;
  else
    if p_expected_epoch <> 0 then
      raise exception 'ecb190_reliance_initial_epoch_invalid' using errcode = '40001';
    end if;
    insert into ecb_coordination.external_reliances(
      id,episode_id,source_system,source_locator
    ) values (
      p_reliance_id,p_episode_id,payload->>'source_system',payload->>'source_locator'
    );
    observed_epoch := 0;
    result_epoch := 0;
  end if;

  artifact_id := ecb_coordination.write_record(
    p_operation_id,'eco190_record_reliance',digest,
    p_episode_id,p_reliance_id,'external_reliance',
    observed_epoch,result_epoch,p_submitted_text,payload
  );

  update ecb_coordination.external_reliances
  set epoch = result_epoch, head_receipt_id = p_operation_id
  where id = p_reliance_id;

  return jsonb_build_object(
    'operation_id',p_operation_id,
    'receipt_id',p_operation_id,
    'artifact_id',artifact_id,
    'episode_id',p_episode_id,
    'reliance_id',p_reliance_id,
    'evidence_basis_artifact_id',evidence_id,
    'observed_epoch',observed_epoch,
    'result_epoch',result_epoch,
    'replayed',false
  );
end;
$$;

create function public.ecb190_record_consumer_binding(
  p_operation_id uuid,
  p_episode_id uuid,
  p_consumer_id uuid,
  p_expected_epoch bigint,
  p_submitted_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
  digest bytea;
  replayed jsonb;
  current_row ecb_coordination.consumer_bindings;
  observed_epoch bigint;
  result_epoch bigint;
  artifact_id uuid;
  v jsonb;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null or p_episode_id is null or p_consumer_id is null
     or p_expected_epoch is null or p_expected_epoch < 0 then
    raise exception 'ecb190_consumer_binding_required' using errcode = '22023';
  end if;

  digest := ecb_coordination.request_digest(
    'eco190_record_consumer',p_episode_id,p_consumer_id,p_expected_epoch,p_submitted_text
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text,0)
  );
  replayed := ecb_coordination.replay_record(
    p_operation_id,'eco190_record_consumer',digest
  );
  if replayed is not null then return replayed; end if;

  payload := ecb_coordination.parse_payload(
    'ecb.coordination.consumer/1',p_submitted_text
  );

  if not (payload ?& array[
    'consumer_kind','consumer_locator','environment','deployment_id','runtime_id',
    'realization_artifact_ids','connected_status','observed_use','observed_at',
    'evidence_basis_artifact_id','external_reliance_id'
  ]) then
    raise exception 'ecb190_consumer_payload_incomplete' using errcode = '22023';
  end if;

  if payload->>'connected_status' not in ('CONNECTED','DISCONNECTED','UNKNOWN')
     or payload->>'observed_use' not in ('OBSERVED','UNOBSERVED','UNKNOWN') then
    raise exception 'ecb190_consumer_status_invalid' using errcode = '22023';
  end if;

  perform ecb_coordination.require_artifact(payload->'evidence_basis_artifact_id');

  if jsonb_typeof(payload->'realization_artifact_ids') <> 'array' then
    raise exception 'ecb190_consumer_realization_artifacts_required' using errcode = '22023';
  end if;
  for v in select value from jsonb_array_elements(payload->'realization_artifact_ids') loop
    perform ecb_coordination.require_artifact(v);
  end loop;

  perform 1
  from ecb_coordination.external_reliances r
  where r.id = (payload->>'external_reliance_id')::uuid
    and r.episode_id = p_episode_id;
  if not found then
    raise exception 'ecb190_consumer_reliance_unavailable' using errcode = 'P0002';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_consumer_id::text,0)
  );

  select c.* into current_row
  from ecb_coordination.consumer_bindings c
  where c.id = p_consumer_id
  for update;

  if found then
    if current_row.episode_id <> p_episode_id
       or current_row.consumer_kind <> payload->>'consumer_kind'
       or current_row.consumer_locator <> payload->>'consumer_locator' then
      raise exception 'ecb190_consumer_identity_conflict' using errcode = '23505';
    end if;
    if current_row.epoch <> p_expected_epoch then
      raise exception 'ecb190_consumer_revision_conflict' using errcode = '40001';
    end if;
    observed_epoch := current_row.epoch;
    result_epoch := current_row.epoch + 1;
  else
    if p_expected_epoch <> 0 then
      raise exception 'ecb190_consumer_initial_epoch_invalid' using errcode = '40001';
    end if;
    insert into ecb_coordination.consumer_bindings(
      id,episode_id,consumer_kind,consumer_locator
    ) values (
      p_consumer_id,p_episode_id,payload->>'consumer_kind',payload->>'consumer_locator'
    );
    observed_epoch := 0;
    result_epoch := 0;
  end if;

  artifact_id := ecb_coordination.write_record(
    p_operation_id,'eco190_record_consumer',digest,
    p_episode_id,p_consumer_id,'consumer_binding',
    observed_epoch,result_epoch,p_submitted_text,payload
  );

  update ecb_coordination.consumer_bindings
  set epoch = result_epoch, head_receipt_id = p_operation_id
  where id = p_consumer_id;

  return jsonb_build_object(
    'operation_id',p_operation_id,
    'receipt_id',p_operation_id,
    'artifact_id',artifact_id,
    'episode_id',p_episode_id,
    'consumer_id',p_consumer_id,
    'observed_epoch',observed_epoch,
    'result_epoch',result_epoch,
    'replayed',false
  );
end;
$$;

create function public.ecb190_record_change(
  p_operation_id uuid,
  p_episode_id uuid,
  p_expected_epoch bigint,
  p_submitted_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
  digest bytea;
  replayed jsonb;
  episode_row ecb_coordination.episodes;
  source_index jsonb;
  source_basis uuid;
  destination_index jsonb;
  destination_basis uuid;
  destination_constituents jsonb;
  coverage_row jsonb;
  transport_row jsonb;
  affected_row jsonb;
  blocking_gap boolean := false;
  bridge_required boolean := false;
  current_use jsonb;
  reliance_row ecb_coordination.external_reliances;
  consumer_row ecb_coordination.consumer_bindings;
  reliance_payload jsonb;
  consumer_payload jsonb;
  eligible boolean := true;
  claimed_eligibility text;
  result_epoch bigint;
  artifact_id uuid;
  bridge_id uuid;
  basis_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null or p_episode_id is null
     or p_expected_epoch is null or p_expected_epoch < 0 then
    raise exception 'ecb190_change_binding_required' using errcode = '22023';
  end if;

  digest := ecb_coordination.request_digest(
    'eco190_record_change',p_episode_id,p_episode_id,p_expected_epoch,p_submitted_text
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text,0)
  );
  replayed := ecb_coordination.replay_record(
    p_operation_id,'eco190_record_change',digest
  );
  if replayed is not null then return replayed; end if;

  select e.* into strict episode_row
  from ecb_coordination.episodes e
  where e.id = p_episode_id
  for update;

  if episode_row.epoch <> p_expected_epoch then
    raise exception 'ecb190_episode_revision_conflict' using errcode = '40001';
  end if;

  payload := ecb_coordination.parse_payload(
    'ecb.coordination.change/1',p_submitted_text
  );

  if not (payload ?& array[
    'transition','continuity','source_retention','transport','affected_old',
    'destination_disclosure','coverage','current_use','reconciliation'
  ]) then
    raise exception 'ecb190_change_sections_incomplete' using errcode = '22023';
  end if;

  if (payload#>>'{transition,source_head_receipt_id}')::uuid
       <> episode_row.head_receipt_id
     or (payload#>>'{transition,source_epoch}')::bigint
       <> episode_row.epoch
     or (payload#>>'{source_retention,source_head_receipt_id}')::uuid
       <> episode_row.head_receipt_id then
    raise exception 'ecb190_change_source_binding_mismatch' using errcode = '40001';
  end if;

  if payload#>>'{continuity,mode}' not in (
    'SAME_REFERENT_REVISED_ACCOUNT',
    'DIFFERENT_EXISTING_REFERENT',
    'NEWLY_INDIVIDUATED_COMPOSITE'
  ) then
    raise exception 'ecb190_continuity_mode_invalid' using errcode = '22023';
  end if;
  if length(btrim(coalesce(payload#>>'{continuity,basis}',''))) = 0 then
    raise exception 'ecb190_continuity_basis_required' using errcode = '22023';
  end if;
  if coalesce((payload#>>'{source_retention,preserve_history}')::boolean,false) is not true then
    raise exception 'ecb190_source_retention_required' using errcode = '22023';
  end if;

  source_index := ecb_coordination.record_index(episode_row.head_receipt_id);
  source_basis := ecb_coordination.record_basis(episode_row.head_receipt_id);

  destination_index := payload#>'{destination_disclosure,destination_index}';
  perform ecb_coordination.validate_index(destination_index,p_episode_id);

  destination_constituents := payload#>'{destination_disclosure,constituents}';
  perform ecb_coordination.validate_constituents(destination_constituents);

  destination_basis := ecb_coordination.require_artifact(
    payload#>'{destination_disclosure,qualification_basis_artifact_id}'
  );

  if jsonb_typeof(payload->'transport') <> 'array'
     or jsonb_typeof(payload->'affected_old') <> 'array'
     or jsonb_typeof(payload->'coverage') <> 'array' then
    raise exception 'ecb190_change_ledgers_invalid' using errcode = '22023';
  end if;

  bridge_required :=
    source_index is distinct from destination_index
    or source_basis is distinct from destination_basis;

  for transport_row in select value from jsonb_array_elements(payload->'transport') loop
    if transport_row->>'status' not in (
      'HISTORICAL_RETRIEVAL','PROPOSED_REUSE','QUALIFIED_DESTINATION_REUSE'
    ) then
      raise exception 'ecb190_transport_status_invalid' using errcode = '22023';
    end if;

    if transport_row->>'loss_class' not in (
      'PRESERVED','DERIVED_REFORMULATED','ADDED','STRIPPED_REJECTED','DEFERRED'
    ) then
      raise exception 'ecb190_transport_loss_class_invalid' using errcode = '22023';
    end if;

    if bridge_required
       and transport_row->>'status' = 'QUALIFIED_DESTINATION_REUSE' then
      if coalesce(transport_row->>'bridge_artifact_id','') = '' then
        raise exception 'ecb190_transport_bridge_required' using errcode = '22023';
      end if;
      bridge_id := ecb_coordination.require_artifact(
        transport_row->'bridge_artifact_id'
      );
    end if;
  end loop;

  for affected_row in select value from jsonb_array_elements(payload->'affected_old') loop
    if not (affected_row ?& array['item','disposition'])
       or length(btrim(coalesce(affected_row->>'item',''))) = 0
       or affected_row->>'disposition' not in ('UNCHANGED','AFFECTED','UNKNOWN') then
      raise exception 'ecb190_affected_old_row_invalid' using errcode = '22023';
    end if;
  end loop;

  for coverage_row in select value from jsonb_array_elements(payload->'coverage') loop
    if jsonb_typeof(coverage_row->'blocking') <> 'boolean'
       or coverage_row->>'status' not in (
         'SATISFIED','UNSATISFIED','UNKNOWN','NOT_APPLICABLE'
       ) then
      raise exception 'ecb190_coverage_row_invalid' using errcode = '22023';
    end if;

    if coverage_row->>'status' in ('SATISFIED','NOT_APPLICABLE') then
      if coalesce(coverage_row->>'basis_artifact_id','') = '' then
        raise exception 'ecb190_coverage_basis_required' using errcode = '22023';
      end if;
      basis_id := ecb_coordination.require_artifact(coverage_row->'basis_artifact_id');
    end if;

    if (coverage_row->>'blocking')::boolean
       and coverage_row->>'status' in ('UNSATISFIED','UNKNOWN') then
      blocking_gap := true;
    end if;
  end loop;

  current_use := payload->'current_use';
  if jsonb_typeof(current_use) <> 'object'
     or not (current_use ?& array[
       'engagement_index','qualification_basis_artifact_id','currentness',
       'ssmm_legality','authority_scope','external_reliance_id',
       'expected_reliance_epoch','consumer_binding_id','expected_consumer_epoch',
       'consumer_environment'
     ]) then
    raise exception 'ecb190_current_use_incomplete' using errcode = '22023';
  end if;

  if current_use->'engagement_index' is distinct from destination_index
     or (current_use->>'qualification_basis_artifact_id')::uuid
       is distinct from destination_basis then
    eligible := false;
  end if;

  if current_use->>'currentness' <> 'CURRENT'
     or current_use->>'ssmm_legality' <> 'LEGAL'
     or current_use->>'authority_scope' <> 'AUTHORIZED' then
    eligible := false;
  end if;

  select r.* into strict reliance_row
  from ecb_coordination.external_reliances r
  where r.id = (current_use->>'external_reliance_id')::uuid
    and r.episode_id = p_episode_id;

  if reliance_row.epoch <> (current_use->>'expected_reliance_epoch')::bigint then
    raise exception 'ecb190_current_use_reliance_epoch_conflict' using errcode = '40001';
  end if;
  reliance_payload := ecb_coordination.current_payload(reliance_row.head_receipt_id);
  if reliance_payload->>'currentness' <> 'CURRENT' then
    eligible := false;
  end if;

  select c.* into strict consumer_row
  from ecb_coordination.consumer_bindings c
  where c.id = (current_use->>'consumer_binding_id')::uuid
    and c.episode_id = p_episode_id;

  if consumer_row.epoch <> (current_use->>'expected_consumer_epoch')::bigint then
    raise exception 'ecb190_current_use_consumer_epoch_conflict' using errcode = '40001';
  end if;
  consumer_payload := ecb_coordination.current_payload(consumer_row.head_receipt_id);
  if consumer_payload->>'connected_status' <> 'CONNECTED'
     or consumer_payload->>'observed_use' <> 'OBSERVED'
     or consumer_payload->>'environment' <> current_use->>'consumer_environment'
     or (consumer_payload->>'external_reliance_id')::uuid <> reliance_row.id
     or consumer_payload->>'runtime_id' <> reliance_payload->>'observed_version'
     or not (
       consumer_payload->'realization_artifact_ids'
       @> jsonb_build_array(
         (destination_constituents->>'realization_manifest')::uuid
       )
     ) then
    eligible := false;
  end if;

  if blocking_gap then eligible := false; end if;

  claimed_eligibility := payload#>>'{reconciliation,reliance_eligibility}';
  if claimed_eligibility not in ('ELIGIBLE','INELIGIBLE') then
    raise exception 'ecb190_reconciliation_eligibility_invalid' using errcode = '22023';
  end if;
  if eligible <> (claimed_eligibility = 'ELIGIBLE') then
    raise exception 'ecb190_reconciliation_result_mismatch' using errcode = '22023';
  end if;

  result_epoch := episode_row.epoch + 1;
  artifact_id := ecb_coordination.write_record(
    p_operation_id,'eco190_record_change',digest,
    p_episode_id,p_episode_id,'material_change',
    episode_row.epoch,result_epoch,p_submitted_text,payload
  );

  update ecb_coordination.episodes
  set epoch = result_epoch, head_receipt_id = p_operation_id
  where id = p_episode_id;

  return jsonb_build_object(
    'operation_id',p_operation_id,
    'receipt_id',p_operation_id,
    'artifact_id',artifact_id,
    'episode_id',p_episode_id,
    'observed_epoch',episode_row.epoch,
    'result_epoch',result_epoch,
    'reliance_eligibility',claimed_eligibility,
    'replayed',false
  );
exception when no_data_found then
  raise exception 'ecb190_current_use_dependency_unavailable' using errcode = 'P0002';
end;
$$;

create function public.ecb190_record_receipt(
  p_operation_id uuid,
  p_episode_id uuid,
  p_role text,
  p_submitted_text text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payload jsonb;
  digest bytea;
  replayed jsonb;
  episode_row ecb_coordination.episodes;
  internal_role text;
  artifact_id uuid;
  v jsonb;
begin
  perform ecb11.assert_runtime_key();

  if p_role not in ('RECONSTITUTION_MANIFEST','QUALIFICATION') then
    raise exception 'ecb190_supporting_role_invalid' using errcode = '22023';
  end if;

  select e.* into strict episode_row
  from ecb_coordination.episodes e
  where e.id = p_episode_id;

  internal_role := case p_role
    when 'RECONSTITUTION_MANIFEST' then 'reconstitution_manifest'
    else 'qualification'
  end;

  digest := ecb_coordination.request_digest(
    'eco190_record_receipt:' || internal_role,
    p_episode_id,p_episode_id,null,p_submitted_text
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text,0)
  );
  replayed := ecb_coordination.replay_record(
    p_operation_id,'eco190_record_receipt:' || internal_role,digest
  );
  if replayed is not null then return replayed; end if;

  payload := ecb_coordination.parse_payload(
    'ecb.coordination.receipt/1',p_submitted_text
  );

  if jsonb_typeof(payload->'artifact_refs') <> 'array' then
    raise exception 'ecb190_receipt_artifact_refs_required' using errcode = '22023';
  end if;
  for v in select value from jsonb_array_elements(payload->'artifact_refs') loop
    perform ecb_coordination.require_artifact(v);
  end loop;

  artifact_id := ecb_coordination.write_record(
    p_operation_id,'eco190_record_receipt:' || internal_role,digest,
    p_episode_id,p_episode_id,internal_role,
    episode_row.epoch,episode_row.epoch,p_submitted_text,payload
  );

  return jsonb_build_object(
    'operation_id',p_operation_id,
    'receipt_id',p_operation_id,
    'artifact_id',artifact_id,
    'episode_id',p_episode_id,
    'record_role',internal_role,
    'epoch',episode_row.epoch,
    'replayed',false
  );
end;
$$;

create function public.ecb190_fetch_episode(p_episode_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  episode_row ecb_coordination.episodes;
  current_content text;
  current_payload jsonb;
  current_index jsonb;
  current_basis uuid;
  current_constituents jsonb;
  constituent_contents jsonb := '{}'::jsonb;
  k text;
  v jsonb;
  artifact_id uuid;
  artifact_content text;
  reliance_rows jsonb;
  consumer_rows jsonb;
  supporting_rows jsonb;
  stale_rows jsonb := '[]'::jsonb;
  pgo_content text;
  question_content text;
  ssmm_content text;
begin
  perform ecb11.assert_runtime_key();

  select e.* into strict episode_row
  from ecb_coordination.episodes e
  where e.id = p_episode_id;

  select a.content into strict current_content
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.receipt_id = episode_row.head_receipt_id;

  current_payload := (current_content::jsonb)->'parsed';
  current_index := ecb_coordination.record_index(episode_row.head_receipt_id);
  current_basis := ecb_coordination.record_basis(episode_row.head_receipt_id);
  current_constituents := ecb_coordination.record_constituents(episode_row.head_receipt_id);

  for k, v in select key, value from jsonb_each(current_constituents) loop
    artifact_id := ecb_coordination.require_artifact(v);
    select a.content into strict artifact_content
    from public.text_artifacts a where a.id = artifact_id;
    constituent_contents := constituent_contents
      || jsonb_build_object(k,jsonb_build_object(
        'artifact_id',artifact_id,
        'content',artifact_content
      ));
  end loop;

  select a.content into strict pgo_content
  from public.text_artifacts a where a.id = (current_index->>'g')::uuid;
  select a.content into strict question_content
  from public.text_artifacts a where a.id = (current_index->>'q')::uuid;
  select a.content into strict ssmm_content
  from public.text_artifacts a where a.id = (current_index->>'t')::uuid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',r.id,
      'epoch',r.epoch,
      'source_system',r.source_system,
      'source_locator',r.source_locator,
      'head_receipt_id',r.head_receipt_id,
      'payload',(a.content::jsonb)->'parsed'
    ) order by r.source_system,r.source_locator,r.id
  ),'[]'::jsonb)
  into reliance_rows
  from ecb_coordination.external_reliances r
  join ecb_coordination.records rec on rec.receipt_id = r.head_receipt_id
  join public.text_artifacts a on a.id = rec.artifact_id
  where r.episode_id = p_episode_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',c.id,
      'epoch',c.epoch,
      'consumer_kind',c.consumer_kind,
      'consumer_locator',c.consumer_locator,
      'head_receipt_id',c.head_receipt_id,
      'payload',(a.content::jsonb)->'parsed'
    ) order by c.consumer_kind,c.consumer_locator,c.id
  ),'[]'::jsonb)
  into consumer_rows
  from ecb_coordination.consumer_bindings c
  join ecb_coordination.records rec on rec.receipt_id = c.head_receipt_id
  join public.text_artifacts a on a.id = rec.artifact_id
  where c.episode_id = p_episode_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'receipt_id',r.receipt_id,
      'artifact_id',r.artifact_id,
      'record_role',r.record_role,
      'epoch',r.result_epoch,
      'payload',(a.content::jsonb)->'parsed'
    ) order by r.recorded_at,r.receipt_id
  ),'[]'::jsonb)
  into supporting_rows
  from ecb_coordination.records r
  join public.text_artifacts a on a.id = r.artifact_id
  where r.episode_id = p_episode_id
    and r.record_role in ('reconstitution_manifest','qualification');

  select coalesce(jsonb_agg(x),'[]'::jsonb)
  into stale_rows
  from (
    select jsonb_build_object(
      'kind','external_reliance',
      'id',r.id,
      'state',(a.content::jsonb)#>>'{parsed,currentness}'
    ) x
    from ecb_coordination.external_reliances r
    join ecb_coordination.records rec on rec.receipt_id = r.head_receipt_id
    join public.text_artifacts a on a.id = rec.artifact_id
    where r.episode_id = p_episode_id
      and (a.content::jsonb)#>>'{parsed,currentness}' <> 'CURRENT'
    union all
    select jsonb_build_object(
      'kind','consumer',
      'id',c.id,
      'state',
        ((a.content::jsonb)#>>'{parsed,connected_status}')
        || '/' ||
        ((a.content::jsonb)#>>'{parsed,observed_use}')
    ) x
    from ecb_coordination.consumer_bindings c
    join ecb_coordination.records rec on rec.receipt_id = c.head_receipt_id
    join public.text_artifacts a on a.id = rec.artifact_id
    where c.episode_id = p_episode_id
      and (
        (a.content::jsonb)#>>'{parsed,connected_status}' <> 'CONNECTED'
        or (a.content::jsonb)#>>'{parsed,observed_use}' <> 'OBSERVED'
      )
  ) s;

  if (select record_role from ecb_coordination.records
      where receipt_id = episode_row.head_receipt_id) = 'material_change'
     and current_payload#>>'{reconciliation,reliance_eligibility}' <> 'ELIGIBLE' then
    stale_rows := stale_rows || jsonb_build_array(jsonb_build_object(
      'kind','current_reconciliation',
      'id',episode_row.head_receipt_id,
      'state',current_payload#>>'{reconciliation,reliance_eligibility}'
    ));
  end if;

  return jsonb_build_object(
    'episode',jsonb_build_object(
      'id',episode_row.id,
      'profile_version',episode_row.profile_version,
      'epoch',episode_row.epoch,
      'head_receipt_id',episode_row.head_receipt_id,
      'qualification_basis_artifact_id',current_basis
    ),
    'current',jsonb_build_object(
      'envelope',current_content::jsonb,
      'engagement_index',current_index,
      'constituents',constituent_contents
    ),
    'external_reliances',reliance_rows,
    'consumer_bindings',consumer_rows,
    'supporting_receipts',supporting_rows,
    'projection',jsonb_build_object(
      'where_am_i',jsonb_build_object(
        'episode_id',episode_row.id,
        'epoch',episode_row.epoch,
        'engagement_index',current_index
      ),
      'what_matters',jsonb_build_object(
        'pgo_artifact_id',(current_index->>'g')::uuid,
        'pgo',pgo_content,
        'question_artifact_id',(current_index->>'q')::uuid,
        'question',question_content
      ),
      'what_next',jsonb_build_object(
        'ssmm_artifact_id',(current_index->>'t')::uuid,
        'ssmm',ssmm_content
      ),
      'stale_or_unauthorized',stale_rows
    )
  );
exception when no_data_found then
  raise exception 'ecb190_episode_unavailable' using errcode = 'P0002';
end;
$$;

revoke all on function ecb_coordination.register_referent()
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.reject_record_mutation()
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.guard_episode_head()
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.guard_reliance_head()
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.guard_consumer_head()
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.parse_payload(text,text)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.require_artifact(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.request_digest(text,uuid,uuid,bigint,text)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.make_envelope(uuid,text,text,jsonb)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.current_payload(uuid)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.record_index(uuid)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.record_basis(uuid)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.record_constituents(uuid)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.validate_index(jsonb,uuid)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.validate_constituents(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.write_record(uuid,text,bytea,uuid,uuid,text,bigint,bigint,text,jsonb)
  from public, anon, authenticated, service_role;
revoke all on function ecb_coordination.replay_record(uuid,text,bytea)
  from public, anon, authenticated, service_role;

revoke all on function public.ecb190_open_episode(uuid,uuid,text)
  from public, authenticated, service_role;
grant execute on function public.ecb190_open_episode(uuid,uuid,text) to anon;

revoke all on function public.ecb190_record_reliance(uuid,uuid,uuid,bigint,text)
  from public, authenticated, service_role;
grant execute on function public.ecb190_record_reliance(uuid,uuid,uuid,bigint,text) to anon;

revoke all on function public.ecb190_record_consumer_binding(uuid,uuid,uuid,bigint,text)
  from public, authenticated, service_role;
grant execute on function public.ecb190_record_consumer_binding(uuid,uuid,uuid,bigint,text) to anon;

revoke all on function public.ecb190_record_change(uuid,uuid,bigint,text)
  from public, authenticated, service_role;
grant execute on function public.ecb190_record_change(uuid,uuid,bigint,text) to anon;

revoke all on function public.ecb190_record_receipt(uuid,uuid,text,text)
  from public, authenticated, service_role;
grant execute on function public.ecb190_record_receipt(uuid,uuid,text,text) to anon;

revoke all on function public.ecb190_fetch_episode(uuid)
  from public, authenticated, service_role;
grant execute on function public.ecb190_fetch_episode(uuid) to anon;

do $$
declare
  table_count integer;
  exposed_count integer;
begin
  select count(*) into table_count
  from information_schema.tables
  where table_schema = 'ecb_coordination'
    and table_name in ('episodes','external_reliances','consumer_bindings','records');

  if table_count <> 4 then
    raise exception 'ECO-190 coordination table set incomplete';
  end if;

  if not pg_catalog.has_function_privilege(
      'anon','public.ecb190_open_episode(uuid,uuid,text)','execute')
     or not pg_catalog.has_function_privilege(
      'anon','public.ecb190_fetch_episode(uuid)','execute') then
    raise exception 'ECO-190 RPC surface incomplete';
  end if;

  select count(*) into exposed_count
  from (
    values
      ('ecb_coordination.episodes'::regclass),
      ('ecb_coordination.external_reliances'::regclass),
      ('ecb_coordination.consumer_bindings'::regclass),
      ('ecb_coordination.records'::regclass)
  ) v(rel)
  where pg_catalog.has_table_privilege('anon', rel, 'select')
     or pg_catalog.has_table_privilege('anon', rel, 'insert')
     or pg_catalog.has_table_privilege('authenticated', rel, 'select')
     or pg_catalog.has_table_privilege('authenticated', rel, 'insert');

  if exposed_count <> 0 then
    raise exception 'ECO-190 private coordination tables exposed directly';
  end if;
end;
$$;

commit;
