-- BUILD 12 — Ordinary Versioned Artifacts
-- Add a general durable artifact identity/version surface without changing BUILD 5B's
-- specialized transformation-artifact grammar.
--
-- Core boundary: an Artifact Version is a retained representation. Creating or versioning
-- an artifact does not confer truth, epistemic standing, currentness, acceptance, authority,
-- or authorization on its payload.

begin;

create schema if not exists ecb12;
revoke all on schema ecb12 from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Stable Artifact identity + immutable Artifact Versions.
-- ---------------------------------------------------------------------------

create table public.artifact_objects (
  id uuid primary key,
  artifact_key text not null unique,
  artifact_type text not null,
  created_at timestamptz not null default pg_catalog.transaction_timestamp(),
  created_by text not null,
  constraint artifact_objects_key_nonempty
    check (length(btrim(artifact_key)) > 0),
  constraint artifact_objects_type_nonempty
    check (length(btrim(artifact_type)) > 0),
  constraint artifact_objects_created_by_nonempty
    check (length(btrim(created_by)) > 0),
  constraint artifact_objects_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable
);

comment on table public.artifact_objects is
  'BUILD 12 stable identity for general versioned artifacts. Artifact identity is not payload identity, standing, truth, currentness, acceptance, authority or authorization.';

create table public.artifact_versions (
  id uuid primary key,
  artifact_id uuid not null,
  version_number integer not null,
  media_type text not null,
  payload_text text not null,
  payload_digest bytea not null,
  provenance jsonb not null default '{}'::jsonb,
  supersedes_version_id uuid,
  recorded_at timestamptz not null,
  created_by text not null,
  constraint artifact_versions_number_positive
    check (version_number >= 1),
  constraint artifact_versions_media_type_nonempty
    check (length(btrim(media_type)) > 0),
  constraint artifact_versions_payload_digest_sha256
    check (pg_catalog.octet_length(payload_digest) = 32),
  constraint artifact_versions_created_by_nonempty
    check (length(btrim(created_by)) > 0),
  constraint artifact_versions_not_self_superseding
    check (supersedes_version_id is null or supersedes_version_id <> id),
  constraint artifact_versions_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint artifact_versions_artifact_fkey
    foreign key (artifact_id)
    references public.artifact_objects (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint artifact_versions_supersedes_fkey
    foreign key (supersedes_version_id)
    references public.artifact_versions (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint artifact_versions_one_number_per_artifact
    unique (artifact_id, version_number)
);

comment on table public.artifact_versions is
  'BUILD 12 immutable retained representations of an Artifact. Payload bytes, provenance and supersession lineage are preserved; a version is a map/representation and does not acquire the standing of what it represents.';

comment on column public.artifact_versions.provenance is
  'Caller-supplied provenance metadata retained with this exact version. Provenance claims are retained representations, not self-authenticating authority.';

alter table public.artifact_objects enable row level security;
alter table public.artifact_versions enable row level security;

revoke all on table public.artifact_objects
  from public, anon, authenticated, service_role;
revoke all on table public.artifact_versions
  from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Structural preparation and immutability.
-- ---------------------------------------------------------------------------

create function ecb12.prepare_artifact_object()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is null then
    new.id := pg_catalog.gen_random_uuid();
  end if;

  insert into public.referents (id) values (new.id);
  new.created_at := pg_catalog.transaction_timestamp();
  return new;
end;
$$;

create function ecb12.prepare_artifact_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  superseded_artifact_id uuid;
begin
  if new.id is null then
    new.id := pg_catalog.gen_random_uuid();
  end if;

  if new.payload_text is null then
    raise exception 'ecb12_artifact_payload_required'
      using errcode = '22023';
  end if;

  if new.version_number = 1 and new.supersedes_version_id is not null then
    raise exception 'ecb12_first_version_may_not_supersede'
      using errcode = '23514';
  end if;

  if new.version_number > 1 and new.supersedes_version_id is null then
    raise exception 'ecb12_later_version_requires_supersession'
      using errcode = '23514';
  end if;

  if new.supersedes_version_id is not null then
    select prior.artifact_id
    into strict superseded_artifact_id
    from public.artifact_versions as prior
    where prior.id = new.supersedes_version_id;

    if superseded_artifact_id <> new.artifact_id then
      raise exception 'ecb12_cross_artifact_supersession'
        using errcode = '23514';
    end if;
  end if;

  insert into public.referents (id) values (new.id);
  new.payload_digest := extensions.digest(
    pg_catalog.convert_to(new.payload_text, 'UTF8'),
    'sha256'
  );
  new.recorded_at := pg_catalog.transaction_timestamp();
  return new;
exception
  when no_data_found then
    raise exception 'ecb12_superseded_version_not_found'
      using errcode = 'P0002';
end;
$$;

create function ecb12.reject_artifact_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'ecb12_artifacts_are_immutable'
    using errcode = '55000';
end;
$$;

revoke all on function ecb12.prepare_artifact_object()
  from public, anon, authenticated, service_role;
revoke all on function ecb12.prepare_artifact_version()
  from public, anon, authenticated, service_role;
revoke all on function ecb12.reject_artifact_mutation()
  from public, anon, authenticated, service_role;

create trigger artifact_objects_prepare
before insert on public.artifact_objects
for each row
execute function ecb12.prepare_artifact_object();

create trigger artifact_versions_prepare
before insert on public.artifact_versions
for each row
execute function ecb12.prepare_artifact_version();

create trigger artifact_objects_immutable
before update or delete on public.artifact_objects
for each row
execute function ecb12.reject_artifact_mutation();

create trigger artifact_versions_immutable
before update or delete on public.artifact_versions
for each row
execute function ecb12.reject_artifact_mutation();

-- ---------------------------------------------------------------------------
-- Exact request identity and rendering helpers.
-- ---------------------------------------------------------------------------

create function ecb12.artifact_request_digest(
  p_operation_kind text,
  p_artifact_key text,
  p_artifact_type text,
  p_artifact_id uuid,
  p_supersedes_version_id uuid,
  p_media_type text,
  p_payload_text text,
  p_provenance jsonb,
  p_created_by text
)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  payload_digest_hex text;
  digest_document jsonb;
begin
  if p_operation_kind is null or length(btrim(p_operation_kind)) = 0 then
    raise exception 'ecb12_operation_kind_required'
      using errcode = '22023';
  end if;
  if p_media_type is null or length(btrim(p_media_type)) = 0 then
    raise exception 'ecb12_media_type_required'
      using errcode = '22023';
  end if;
  if p_payload_text is null then
    raise exception 'ecb12_artifact_payload_required'
      using errcode = '22023';
  end if;
  if p_created_by is null or length(btrim(p_created_by)) = 0 then
    raise exception 'ecb12_created_by_required'
      using errcode = '22023';
  end if;

  payload_digest_hex := pg_catalog.encode(
    extensions.digest(pg_catalog.convert_to(p_payload_text, 'UTF8'), 'sha256'),
    'hex'
  );

  digest_document := pg_catalog.jsonb_build_object(
    'contract', 'ECB12-ARTIFACT-REQUEST-V1',
    'operation_kind', p_operation_kind,
    'artifact_key', p_artifact_key,
    'artifact_type', p_artifact_type,
    'artifact_id', p_artifact_id,
    'supersedes_version_id', p_supersedes_version_id,
    'media_type', p_media_type,
    'payload_digest', payload_digest_hex,
    'provenance', coalesce(p_provenance, '{}'::jsonb),
    'created_by', p_created_by
  );

  return extensions.digest(
    pg_catalog.convert_to(digest_document::text, 'UTF8'),
    'sha256'
  );
end;
$$;

create function ecb12.render_artifact_version(
  p_version_id uuid,
  p_operation_id uuid default null,
  p_replayed boolean default false
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'operation_id', p_operation_id,
    'replayed', p_replayed,
    'artifact', pg_catalog.jsonb_build_object(
      'id', artifact.id,
      'key', artifact.artifact_key,
      'type', artifact.artifact_type,
      'created_at', artifact.created_at,
      'created_by', artifact.created_by
    ),
    'version', pg_catalog.jsonb_build_object(
      'id', version.id,
      'number', version.version_number,
      'media_type', version.media_type,
      'payload_text', version.payload_text,
      'payload_digest', pg_catalog.encode(version.payload_digest, 'hex'),
      'provenance', version.provenance,
      'supersedes_version_id', version.supersedes_version_id,
      'recorded_at', version.recorded_at,
      'created_by', version.created_by
    )
  )
  from public.artifact_versions as version
  join public.artifact_objects as artifact
    on artifact.id = version.artifact_id
  where version.id = p_version_id;
$$;

revoke all on function ecb12.artifact_request_digest(
  text, text, text, uuid, uuid, text, text, jsonb, text
) from public, anon, authenticated, service_role;
revoke all on function ecb12.render_artifact_version(uuid, uuid, boolean)
  from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Ordinary creation: stable operation identity + exact immutable version bytes.
-- ---------------------------------------------------------------------------

create function public.ecb12_create_artifact(
  p_operation_id uuid,
  p_artifact_key text,
  p_artifact_type text,
  p_media_type text,
  p_payload_text text,
  p_provenance jsonb default '{}'::jsonb,
  p_created_by text default 'ordinary_mcp'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_digest bytea;
  existing_operation public.ordinary_operations;
  artifact_id uuid;
  version_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb12_operation_id_required'
      using errcode = '22023';
  end if;
  if p_artifact_key is null or length(btrim(p_artifact_key)) = 0 then
    raise exception 'ecb12_artifact_key_required'
      using errcode = '22023';
  end if;
  if p_artifact_type is null or length(btrim(p_artifact_type)) = 0 then
    raise exception 'ecb12_artifact_type_required'
      using errcode = '22023';
  end if;

  request_digest := ecb12.artifact_request_digest(
    'create_artifact',
    p_artifact_key,
    p_artifact_type,
    null,
    null,
    p_media_type,
    p_payload_text,
    p_provenance,
    p_created_by
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text, 0)
  );

  select operation.*
  into existing_operation
  from public.ordinary_operations as operation
  where operation.id = p_operation_id;

  if found then
    if existing_operation.operation_kind <> 'create_artifact'
      or existing_operation.request_digest <> request_digest then
      raise exception 'ecb12_operation_conflict'
        using errcode = '23505';
    end if;

    return ecb12.render_artifact_version(
      existing_operation.result_referent_id,
      p_operation_id,
      true
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('artifact-key:' || p_artifact_key, 0)
  );

  if exists (
    select 1
    from public.artifact_objects as artifact
    where artifact.artifact_key = p_artifact_key
  ) then
    raise exception 'ecb12_artifact_key_exists'
      using errcode = '23505';
  end if;

  artifact_id := pg_catalog.gen_random_uuid();
  version_id := pg_catalog.gen_random_uuid();

  insert into public.artifact_objects (
    id, artifact_key, artifact_type, created_by
  ) values (
    artifact_id, p_artifact_key, p_artifact_type, p_created_by
  );

  insert into public.artifact_versions (
    id,
    artifact_id,
    version_number,
    media_type,
    payload_text,
    provenance,
    supersedes_version_id,
    created_by
  ) values (
    version_id,
    artifact_id,
    1,
    p_media_type,
    p_payload_text,
    coalesce(p_provenance, '{}'::jsonb),
    null,
    p_created_by
  );

  insert into public.ordinary_operations (
    id,
    operation_kind,
    request_digest,
    result_referent_id
  ) values (
    p_operation_id,
    'create_artifact',
    request_digest,
    version_id
  );

  return ecb12.render_artifact_version(version_id, p_operation_id, false);
end;
$$;

create function public.ecb12_create_artifact_version(
  p_operation_id uuid,
  p_artifact_id uuid,
  p_supersedes_version_id uuid,
  p_media_type text,
  p_payload_text text,
  p_provenance jsonb default '{}'::jsonb,
  p_created_by text default 'ordinary_mcp'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_digest bytea;
  existing_operation public.ordinary_operations;
  artifact_row public.artifact_objects;
  prior_version public.artifact_versions;
  latest_version public.artifact_versions;
  version_id uuid;
  next_version_number integer;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb12_operation_id_required'
      using errcode = '22023';
  end if;
  if p_artifact_id is null then
    raise exception 'ecb12_artifact_id_required'
      using errcode = '22023';
  end if;
  if p_supersedes_version_id is null then
    raise exception 'ecb12_supersedes_version_id_required'
      using errcode = '22023';
  end if;

  request_digest := ecb12.artifact_request_digest(
    'create_artifact_version',
    null,
    null,
    p_artifact_id,
    p_supersedes_version_id,
    p_media_type,
    p_payload_text,
    p_provenance,
    p_created_by
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text, 0)
  );

  select operation.*
  into existing_operation
  from public.ordinary_operations as operation
  where operation.id = p_operation_id;

  if found then
    if existing_operation.operation_kind <> 'create_artifact_version'
      or existing_operation.request_digest <> request_digest then
      raise exception 'ecb12_operation_conflict'
        using errcode = '23505';
    end if;

    return ecb12.render_artifact_version(
      existing_operation.result_referent_id,
      p_operation_id,
      true
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('artifact:' || p_artifact_id::text, 0)
  );

  select artifact.*
  into artifact_row
  from public.artifact_objects as artifact
  where artifact.id = p_artifact_id;

  if not found then
    raise exception 'ecb12_artifact_not_found'
      using errcode = 'P0002';
  end if;

  select version.*
  into prior_version
  from public.artifact_versions as version
  where version.id = p_supersedes_version_id;

  if not found or prior_version.artifact_id <> p_artifact_id then
    raise exception 'ecb12_superseded_version_not_found'
      using errcode = 'P0002';
  end if;

  select version.*
  into strict latest_version
  from public.artifact_versions as version
  where version.artifact_id = p_artifact_id
  order by version.version_number desc
  limit 1;

  if latest_version.id <> p_supersedes_version_id then
    raise exception 'ecb12_stale_supersession'
      using errcode = '40001';
  end if;

  next_version_number := latest_version.version_number + 1;
  version_id := pg_catalog.gen_random_uuid();

  insert into public.artifact_versions (
    id,
    artifact_id,
    version_number,
    media_type,
    payload_text,
    provenance,
    supersedes_version_id,
    created_by
  ) values (
    version_id,
    p_artifact_id,
    next_version_number,
    p_media_type,
    p_payload_text,
    coalesce(p_provenance, '{}'::jsonb),
    p_supersedes_version_id,
    p_created_by
  );

  insert into public.ordinary_operations (
    id,
    operation_kind,
    request_digest,
    result_referent_id
  ) values (
    p_operation_id,
    'create_artifact_version',
    request_digest,
    version_id
  );

  return ecb12.render_artifact_version(version_id, p_operation_id, false);
end;
$$;

create function public.ecb12_fetch_artifact(
  p_artifact_id uuid,
  p_version_number integer default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  version_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_artifact_id is null then
    raise exception 'ecb12_artifact_id_required'
      using errcode = '22023';
  end if;
  if p_version_number is not null and p_version_number < 1 then
    raise exception 'ecb12_version_number_invalid'
      using errcode = '22023';
  end if;

  if p_version_number is null then
    select version.id
    into version_id
    from public.artifact_versions as version
    where version.artifact_id = p_artifact_id
    order by version.version_number desc
    limit 1;
  else
    select version.id
    into version_id
    from public.artifact_versions as version
    where version.artifact_id = p_artifact_id
      and version.version_number = p_version_number;
  end if;

  if version_id is null then
    return null;
  end if;

  return ecb12.render_artifact_version(version_id, null, false);
end;
$$;

revoke all on function public.ecb12_create_artifact(
  uuid, text, text, text, text, jsonb, text
) from public, authenticated, service_role;
grant execute on function public.ecb12_create_artifact(
  uuid, text, text, text, text, jsonb, text
) to anon;

revoke all on function public.ecb12_create_artifact_version(
  uuid, uuid, uuid, text, text, jsonb, text
) from public, authenticated, service_role;
grant execute on function public.ecb12_create_artifact_version(
  uuid, uuid, uuid, text, text, jsonb, text
) to anon;

revoke all on function public.ecb12_fetch_artifact(uuid, integer)
  from public, authenticated, service_role;
grant execute on function public.ecb12_fetch_artifact(uuid, integer)
  to anon;

-- ---------------------------------------------------------------------------
-- Structural self-check.
-- ---------------------------------------------------------------------------

do $$
declare
  uncoupled_artifacts integer;
  uncoupled_versions integer;
begin
  select count(*)
  into uncoupled_artifacts
  from public.artifact_objects as artifact
  left join public.referents as referent on referent.id = artifact.id
  where referent.id is null;

  select count(*)
  into uncoupled_versions
  from public.artifact_versions as version
  left join public.referents as referent on referent.id = version.id
  where referent.id is null;

  if uncoupled_artifacts <> 0 or uncoupled_versions <> 0 then
    raise exception 'BUILD 12 left uncoupled artifact Referents';
  end if;

  if pg_catalog.has_table_privilege('anon', 'public.artifact_objects', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.artifact_objects', 'update')
    or pg_catalog.has_table_privilege('anon', 'public.artifact_objects', 'delete')
    or pg_catalog.has_table_privilege('anon', 'public.artifact_versions', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.artifact_versions', 'update')
    or pg_catalog.has_table_privilege('anon', 'public.artifact_versions', 'delete') then
    raise exception 'BUILD 12 anon role has forbidden direct artifact mutation capability';
  end if;

  if not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb12_create_artifact(uuid,text,text,text,text,jsonb,text)',
      'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb12_create_artifact_version(uuid,uuid,uuid,text,text,jsonb,text)',
      'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb12_fetch_artifact(uuid,integer)',
      'execute'
    ) then
    raise exception 'BUILD 12 artifact RPC grant surface incomplete';
  end if;
end;
$$;

commit;
