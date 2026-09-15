\set ON_ERROR_STOP on

-- BUILD 12 qualification. Assumes BUILD 11 qualification commissioned
-- build11-test-runtime-key-00000000000000000000 on the disposable predecessor.

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);

-- Create one exact-text Artifact through the same bounded RPC and database role
-- used by the deployed ordinary runtime.
set role anon;
select public.ecb12_create_artifact(
  '12111111-aaaa-4121-8121-111111111111'::uuid,
  'build12.qualification.semantic-contract',
  'semantic_definition_contract',
  'text/plain; charset=utf-8',
  E'MAP / TERRITORY\n\nDefinition: map != territory.\n',
  '{"source":"build12_qualification","standing":"fixture_only"}'::jsonb,
  'build12_qualification'
);
reset role;

-- Exact bytes, digest, metadata and universal Referent coupling survive creation.
do $$
declare
  expected_payload text := E'MAP / TERRITORY\n\nDefinition: map != territory.\n';
  version_1_id uuid;
  artifact_id uuid;
  observed public.artifact_versions;
  expected_digest bytea;
begin
  select operation.result_referent_id
  into strict version_1_id
  from public.ordinary_operations as operation
  where operation.id = '12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict artifact_id
  from public.artifact_versions as version
  where version.id = version_1_id;

  select version.*
  into strict observed
  from public.artifact_versions as version
  where version.id = version_1_id;

  expected_digest := extensions.digest(
    pg_catalog.convert_to(expected_payload, 'UTF8'),
    'sha256'
  );

  if observed.payload_text <> expected_payload then
    raise exception 'BUILD 12 changed exact artifact payload bytes';
  end if;
  if observed.payload_digest <> expected_digest then
    raise exception 'BUILD 12 payload digest does not bind exact payload bytes';
  end if;
  if observed.version_number <> 1 or observed.supersedes_version_id is not null then
    raise exception 'BUILD 12 initial version lineage is malformed';
  end if;
  if observed.provenance <> '{"source":"build12_qualification","standing":"fixture_only"}'::jsonb then
    raise exception 'BUILD 12 provenance did not round-trip';
  end if;
  if not exists(select 1 from public.referents where id=artifact_id)
    or not exists(select 1 from public.referents where id=version_1_id) then
    raise exception 'BUILD 12 artifact or version escaped universal Referent coupling';
  end if;
end $$;

-- Exact replay must report replay and must not create a second effect.
do $$
declare
  replay jsonb;
  expected_version_id uuid;
  artifact_id uuid;
  version_count integer;
begin
  select operation.result_referent_id
  into strict expected_version_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict artifact_id
  from public.artifact_versions as version
  where version.id=expected_version_id;

  replay := public.ecb12_create_artifact(
    '12111111-aaaa-4121-8121-111111111111'::uuid,
    'build12.qualification.semantic-contract',
    'semantic_definition_contract',
    'text/plain; charset=utf-8',
    E'MAP / TERRITORY\n\nDefinition: map != territory.\n',
    '{"source":"build12_qualification","standing":"fixture_only"}'::jsonb,
    'build12_qualification'
  );

  if (replay->>'replayed')::boolean is not true then
    raise exception 'BUILD 12 exact replay was not reported';
  end if;
  if (replay#>>'{version,id}')::uuid <> expected_version_id then
    raise exception 'BUILD 12 replay changed Artifact Version identity';
  end if;
  if (replay#>>'{artifact,id}')::uuid <> artifact_id then
    raise exception 'BUILD 12 replay changed Artifact identity';
  end if;

  select count(*) into version_count
  from public.artifact_versions
  where artifact_id=artifact_id;
  if version_count <> 1 then
    raise exception 'BUILD 12 replay created % versions', version_count;
  end if;
end $$;

-- Same operation identity with changed bytes must conflict before a second effect.
do $$
begin
  begin
    perform public.ecb12_create_artifact(
      '12111111-aaaa-4121-8121-111111111111'::uuid,
      'build12.qualification.semantic-contract',
      'semantic_definition_contract',
      'text/plain; charset=utf-8',
      'CHANGED PAYLOAD MUST CONFLICT',
      '{"source":"build12_qualification","standing":"fixture_only"}'::jsonb,
      'build12_qualification'
    );
    raise exception 'negative control failed: changed-input artifact replay succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb12_operation_conflict%' then
        raise;
      end if;
  end;
end $$;

-- A distinct operation may not silently collapse onto an existing stable artifact key.
do $$
begin
  begin
    perform public.ecb12_create_artifact(
      '12222222-aaaa-4222-8222-222222222222'::uuid,
      'build12.qualification.semantic-contract',
      'semantic_definition_contract',
      'text/plain; charset=utf-8',
      E'MAP / TERRITORY\n\nDefinition: map != territory.\n',
      '{}'::jsonb,
      'build12_qualification'
    );
    raise exception 'negative control failed: duplicate Artifact key succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb12_artifact_key_exists%' then
        raise;
      end if;
  end;
end $$;

-- Create v2 only by explicitly superseding the current v1 and prove v1 remains exact.
do $$
declare
  version_1_id uuid;
  version_2_id uuid;
  artifact_id uuid;
  response jsonb;
  v1 public.artifact_versions;
  v2 public.artifact_versions;
begin
  select operation.result_referent_id
  into strict version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict artifact_id
  from public.artifact_versions as version
  where version.id=version_1_id;

  response := public.ecb12_create_artifact_version(
    '12333333-aaaa-4333-8333-333333333333'::uuid,
    artifact_id,
    version_1_id,
    'text/plain; charset=utf-8',
    E'MAP / TERRITORY\n\nDefinition: map != territory.\n\nRevision: explicit v2.\n',
    '{"source":"build12_qualification","reason":"explicit_revision"}'::jsonb,
    'build12_qualification'
  );

  version_2_id := (response#>>'{version,id}')::uuid;
  select * into strict v1 from public.artifact_versions where id=version_1_id;
  select * into strict v2 from public.artifact_versions where id=version_2_id;

  if v1.version_number <> 1
    or v2.version_number <> 2
    or v2.supersedes_version_id <> v1.id then
    raise exception 'BUILD 12 explicit supersession lineage is malformed';
  end if;

  if v1.payload_text <> E'MAP / TERRITORY\n\nDefinition: map != territory.\n' then
    raise exception 'BUILD 12 revision mutated superseded payload';
  end if;
end $$;

-- A stale v1 cannot be used to publish another current revision after v2 exists.
do $$
declare
  version_1_id uuid;
  artifact_id uuid;
begin
  select operation.result_referent_id
  into strict version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict artifact_id
  from public.artifact_versions as version
  where version.id=version_1_id;

  begin
    perform public.ecb12_create_artifact_version(
      '12444444-aaaa-4444-8444-444444444444'::uuid,
      artifact_id,
      version_1_id,
      'text/plain; charset=utf-8',
      'STALE SUPERSESSION MUST FAIL',
      '{}'::jsonb,
      'build12_qualification'
    );
    raise exception 'negative control failed: stale supersession succeeded';
  exception
    when serialization_failure then
      if sqlerrm not like '%ecb12_stale_supersession%' then
        raise;
      end if;
  end;
end $$;

-- Explicit-version fetch returns v1; default fetch returns latest v2.
do $$
declare
  version_1_id uuid;
  version_2_id uuid;
  artifact_id uuid;
  fetched_v1 jsonb;
  fetched_latest jsonb;
begin
  select operation.result_referent_id
  into strict version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select operation.result_referent_id
  into strict version_2_id
  from public.ordinary_operations as operation
  where operation.id='12333333-aaaa-4333-8333-333333333333'::uuid;

  select version.artifact_id
  into strict artifact_id
  from public.artifact_versions as version
  where version.id=version_1_id;

  fetched_v1 := public.ecb12_fetch_artifact(artifact_id, 1);
  fetched_latest := public.ecb12_fetch_artifact(artifact_id, null);

  if (fetched_v1#>>'{version,id}')::uuid <> version_1_id then
    raise exception 'BUILD 12 explicit-version fetch did not return v1';
  end if;
  if (fetched_latest#>>'{version,id}')::uuid <> version_2_id then
    raise exception 'BUILD 12 default fetch did not return latest version';
  end if;
end $$;

-- Artifact identity and versions are immutable even to direct mutation attempts.
do $$
declare
  version_1_id uuid;
  artifact_id uuid;
begin
  select operation.result_referent_id
  into strict version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict artifact_id
  from public.artifact_versions as version
  where version.id=version_1_id;

  begin
    update public.artifact_versions
    set payload_text='MUTATION MUST FAIL'
    where id=version_1_id;
    raise exception 'negative control failed: Artifact Version UPDATE succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb12_artifacts_are_immutable%' then
        raise;
      end if;
  end;

  begin
    delete from public.artifact_objects where id=artifact_id;
    raise exception 'negative control failed: Artifact DELETE succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb12_artifacts_are_immutable%' then
        raise;
      end if;
  end;
end $$;

-- Ordinary database role gets bounded RPCs, never table mutation capability.
do $$
begin
  if has_table_privilege('anon','public.artifact_objects','insert')
    or has_table_privilege('anon','public.artifact_objects','update')
    or has_table_privilege('anon','public.artifact_objects','delete')
    or has_table_privilege('anon','public.artifact_versions','insert')
    or has_table_privilege('anon','public.artifact_versions','update')
    or has_table_privilege('anon','public.artifact_versions','delete') then
    raise exception 'BUILD 12 anon retains forbidden direct Artifact mutation privilege';
  end if;

  if not has_function_privilege(
    'anon','public.ecb12_create_artifact(uuid,text,text,text,text,jsonb,text)','execute'
  ) or not has_function_privilege(
    'anon','public.ecb12_create_artifact_version(uuid,uuid,uuid,text,text,jsonb,text)','execute'
  ) or not has_function_privilege(
    'anon','public.ecb12_fetch_artifact(uuid,integer)','execute'
  ) then
    raise exception 'BUILD 12 bounded Artifact RPC surface is incomplete';
  end if;
end $$;

select 'BUILD12_QUALIFICATION=PASS' as result;
