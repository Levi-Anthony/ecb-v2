-- BUILD 12 corrective physicalization — greenfield Artifact creation.
--
-- Governing derivation:
--   * Artifact is an immutable or versioned representation.
--   * every persistent first-class Artifact has stable Referent identity.
--   * relation truth belongs in Claims, not native convenience relations.
--   * current != newest.
--   * BUILD 11 already owns ordinary operation replay/conflict semantics.
--
-- This migration removes the unused first BUILD 12 generic version-family model
-- and replaces it with the smallest currently earned slice: immutable text Artifacts.

begin;

-- ---------------------------------------------------------------------------
-- Correction gate: never destructively assume the first BUILD 12 surface is unused.
-- ---------------------------------------------------------------------------

do $$
declare
  object_count integer;
  version_count integer;
  artifact_operation_count integer;
  semantic_dependency_count integer;
  unexpected_object_count integer;
begin
  if pg_catalog.to_regclass('public.artifact_objects') is null
    or pg_catalog.to_regclass('public.artifact_versions') is null then
    raise exception 'BUILD 12 correction expected first-pass artifact tables';
  end if;

  select count(*) into object_count from public.artifact_objects;
  select count(*) into version_count from public.artifact_versions;
  select count(*) into artifact_operation_count
  from public.ordinary_operations
  where operation_kind like 'artifact_%'
     or operation_kind in ('create_artifact', 'create_artifact_version');

  select count(*)
  into unexpected_object_count
  from public.artifact_objects
  where artifact_key <> 'semantic-contract.integral-holonic-grammar-core'
     or artifact_type <> 'semantic_definition_contract';

  with retired_ids as (
    select id from public.artifact_objects
    union
    select id from public.artifact_versions
  )
  select
    (select count(*)
       from public.claims as claim
       join retired_ids as retired
         on retired.id = claim.id
         or retired.id = claim.subject_referent_id)
    +
    (select count(*)
       from public.evidence_links as link
       join retired_ids as retired
         on retired.id = link.id
         or retired.id = link.claim_id
         or retired.id = link.evidence_referent_id)
    +
    (select count(*)
       from public.ordinary_operations as operation
       join retired_ids as retired
         on retired.id = operation.id
         or retired.id = operation.result_referent_id)
  into semantic_dependency_count;

  if object_count <> 1
    or version_count <> 1
    or unexpected_object_count <> 0
    or artifact_operation_count <> 0
    or semantic_dependency_count <> 0 then
    raise exception
      'BUILD 12 correction gate failed: objects %, versions %, unexpected %, artifact operations %, dependencies %',
      object_count,
      version_count,
      unexpected_object_count,
      artifact_operation_count,
      semantic_dependency_count;
  end if;
end;
$$;

create temporary table ecb12_retired_referents on commit drop as
select id from public.artifact_objects
union
select id from public.artifact_versions;

-- ---------------------------------------------------------------------------
-- Retire the unearned first-pass surface. Migration history remains evidence.
-- ---------------------------------------------------------------------------

drop function if exists public.ecb12_fetch_artifact_by_key(text, integer);
drop function if exists public.ecb12_fetch_artifact(uuid, integer);
drop function if exists public.ecb12_create_artifact_version(
  uuid, uuid, uuid, text, text, jsonb, text
);
drop function if exists public.ecb12_create_artifact(
  uuid, text, text, text, text, jsonb, text
);

drop schema if exists ecb12 cascade;

drop table public.artifact_versions;
drop table public.artifact_objects;

delete from public.referents as referent
where referent.id in (select id from ecb12_retired_referents);

-- ---------------------------------------------------------------------------
-- Greenfield native record: Artifact identity + exact text representation only.
-- Referent.registered_at already supplies registration time.
-- ---------------------------------------------------------------------------

create schema ecb12;
revoke all on schema ecb12 from public, anon, authenticated, service_role;

create table public.text_artifacts (
  id uuid primary key,
  content text not null,
  constraint text_artifacts_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable
);

comment on table public.text_artifacts is
  'BUILD 12 native records for immutable text Artifacts. Each row is a persistent first-class Referent. Content is a representation and confers no truth, standing, currentness, relation, or authority.';

alter table public.text_artifacts enable row level security;
revoke all on table public.text_artifacts
  from public, anon, authenticated, service_role;

create function ecb12.register_text_artifact()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.referents (id) values (new.id);
  return new;
end;
$$;

create function ecb12.reject_text_artifact_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'ecb12_artifact_immutable'
    using errcode = '55000';
end;
$$;

revoke all on function ecb12.register_text_artifact()
  from public, anon, authenticated, service_role;
revoke all on function ecb12.reject_text_artifact_mutation()
  from public, anon, authenticated, service_role;

create trigger text_artifacts_register_referent
before insert on public.text_artifacts
for each row
execute function ecb12.register_text_artifact();

create trigger text_artifacts_immutable
before update or delete on public.text_artifacts
for each row
execute function ecb12.reject_text_artifact_mutation();

-- ---------------------------------------------------------------------------
-- Reuse BUILD 11 ordinary-operation identity rather than invent another protocol.
-- ---------------------------------------------------------------------------

create function ecb12.artifact_request_digest(p_content text)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  content_octets bytea;
  digest_input bytea;
begin
  if p_content is null then
    raise exception 'ecb12_artifact_content_required'
      using errcode = '22023';
  end if;

  content_octets := pg_catalog.convert_to(p_content, 'UTF8');
  digest_input :=
    pg_catalog.convert_to('ECB12-CREATE-TEXT-ARTIFACT-V1', 'UTF8')
    || pg_catalog.decode('00', 'hex')
    || pg_catalog.int8send(pg_catalog.octet_length(content_octets)::bigint)
    || content_octets;

  return extensions.digest(digest_input, 'sha256');
end;
$$;

revoke all on function ecb12.artifact_request_digest(text)
  from public, anon, authenticated, service_role;

create function public.ecb12_create_artifact(
  p_operation_id uuid,
  p_content text
)
returns table (
  operation_id uuid,
  artifact_id uuid,
  content text,
  registered_at timestamptz,
  replayed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_digest bytea;
  existing_operation public.ordinary_operations;
  existing_artifact public.text_artifacts;
  existing_registered_at timestamptz;
  new_artifact_id uuid;
  new_registered_at timestamptz;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb12_operation_id_required'
      using errcode = '22023';
  end if;

  request_digest := ecb12.artifact_request_digest(p_content);

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
      raise exception 'ecb11_operation_conflict'
        using errcode = '23505';
    end if;

    select artifact.*, referent.registered_at
    into strict existing_artifact, existing_registered_at
    from public.text_artifacts as artifact
    join public.referents as referent on referent.id = artifact.id
    where artifact.id = existing_operation.result_referent_id;

    return query
    select
      p_operation_id,
      existing_artifact.id,
      existing_artifact.content,
      existing_registered_at,
      true;
    return;
  end if;

  new_artifact_id := pg_catalog.gen_random_uuid();

  insert into public.text_artifacts (id, content)
  values (new_artifact_id, p_content);

  select referent.registered_at
  into strict new_registered_at
  from public.referents as referent
  where referent.id = new_artifact_id;

  insert into public.ordinary_operations (
    id,
    operation_kind,
    request_digest,
    result_referent_id
  ) values (
    p_operation_id,
    'create_artifact',
    request_digest,
    new_artifact_id
  );

  return query
  select
    p_operation_id,
    new_artifact_id,
    p_content,
    new_registered_at,
    false;
end;
$$;

create function public.ecb12_fetch_artifact(p_id uuid)
returns table (
  id uuid,
  content text,
  registered_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform ecb11.assert_runtime_key();

  if p_id is null then
    raise exception 'ecb12_artifact_id_required'
      using errcode = '22023';
  end if;

  return query
  select artifact.id, artifact.content, referent.registered_at
  from public.text_artifacts as artifact
  join public.referents as referent on referent.id = artifact.id
  where artifact.id = p_id;
end;
$$;

revoke all on function public.ecb12_create_artifact(uuid, text)
  from public, authenticated, service_role;
grant execute on function public.ecb12_create_artifact(uuid, text)
  to anon;

revoke all on function public.ecb12_fetch_artifact(uuid)
  from public, authenticated, service_role;
grant execute on function public.ecb12_fetch_artifact(uuid)
  to anon;

-- ---------------------------------------------------------------------------
-- Structural correction receipt.
-- ---------------------------------------------------------------------------

do $$
declare
  text_artifact_columns text[];
  retired_referent_count integer;
begin
  if pg_catalog.to_regclass('public.artifact_objects') is not null
    or pg_catalog.to_regclass('public.artifact_versions') is not null then
    raise exception 'BUILD 12 first-pass artifact tables survived correction';
  end if;

  if pg_catalog.to_regprocedure(
      'public.ecb12_create_artifact_version(uuid,uuid,uuid,text,text,jsonb,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.ecb12_fetch_artifact_by_key(text,integer)'
    ) is not null then
    raise exception 'BUILD 12 unearned version/key RPC survived correction';
  end if;

  select pg_catalog.array_agg(column_name order by ordinal_position)
  into text_artifact_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'text_artifacts';

  if text_artifact_columns is distinct from array['id', 'content'] then
    raise exception 'BUILD 12 greenfield Artifact native columns drifted: %', text_artifact_columns;
  end if;

  select count(*)
  into retired_referent_count
  from public.referents as referent
  join ecb12_retired_referents as retired on retired.id = referent.id;

  if retired_referent_count <> 0 then
    raise exception 'BUILD 12 retired assistant seed Referents survived correction';
  end if;

  if not pg_catalog.has_function_privilege(
      'anon', 'public.ecb12_create_artifact(uuid,text)', 'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon', 'public.ecb12_fetch_artifact(uuid)', 'execute'
    ) then
    raise exception 'BUILD 12 corrected ordinary Artifact RPC surface incomplete';
  end if;

  if pg_catalog.has_table_privilege('anon', 'public.text_artifacts', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.text_artifacts', 'update')
    or pg_catalog.has_table_privilege('anon', 'public.text_artifacts', 'delete') then
    raise exception 'BUILD 12 corrected Artifact table leaked direct mutation privilege';
  end if;
end;
$$;

commit;
