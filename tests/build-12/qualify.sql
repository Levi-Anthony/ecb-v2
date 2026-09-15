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
  v_expected_payload text := E'MAP / TERRITORY\n\nDefinition: map != territory.\n';
  v_version_1_id uuid;
  v_artifact_id uuid;
  v_observed public.artifact_versions;
  v_expected_digest bytea;
begin
  select operation.result_referent_id
  into strict v_version_1_id
  from public.ordinary_operations as operation
  where operation.id = '12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict v_artifact_id
  from public.artifact_versions as version
  where version.id = v_version_1_id;

  select version.*
  into strict v_observed
  from public.artifact_versions as version
  where version.id = v_version_1_id;

  v_expected_digest := extensions.digest(
    pg_catalog.convert_to(v_expected_payload, 'UTF8'),
    'sha256'
  );

  if v_observed.payload_text <> v_expected_payload then
    raise exception 'BUILD 12 changed exact artifact payload bytes';
  end if;
  if v_observed.payload_digest <> v_expected_digest then
    raise exception 'BUILD 12 payload digest does not bind exact payload bytes';
  end if;
  if v_observed.version_number <> 1 or v_observed.supersedes_version_id is not null then
    raise exception 'BUILD 12 initial version lineage is malformed';
  end if;
  if v_observed.provenance <> '{"source":"build12_qualification","standing":"fixture_only"}'::jsonb then
    raise exception 'BUILD 12 provenance did not round-trip';
  end if;
  if not exists(select 1 from public.referents where id=v_artifact_id)
    or not exists(select 1 from public.referents where id=v_version_1_id) then
    raise exception 'BUILD 12 artifact or version escaped universal Referent coupling';
  end if;
end $$;

-- Exact replay reports reconciliation and creates no second effect.
do $$
declare
  v_replay jsonb;
  v_version_1_id uuid;
  v_artifact_id uuid;
  v_version_count integer;
begin
  select operation.result_referent_id
  into strict v_version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict v_artifact_id
  from public.artifact_versions as version
  where version.id=v_version_1_id;

  v_replay := public.ecb12_create_artifact(
    '12111111-aaaa-4121-8121-111111111111'::uuid,
    'build12.qualification.semantic-contract',
    'semantic_definition_contract',
    'text/plain; charset=utf-8',
    E'MAP / TERRITORY\n\nDefinition: map != territory.\n',
    '{"source":"build12_qualification","standing":"fixture_only"}'::jsonb,
    'build12_qualification'
  );

  if (v_replay->>'replayed')::boolean is not true then
    raise exception 'BUILD 12 exact replay was not reported';
  end if;
  if (v_replay#>>'{version,id}')::uuid <> v_version_1_id then
    raise exception 'BUILD 12 replay changed Artifact Version identity';
  end if;
  if (v_replay#>>'{artifact,id}')::uuid <> v_artifact_id then
    raise exception 'BUILD 12 replay changed Artifact identity';
  end if;

  select count(*) into v_version_count
  from public.artifact_versions as version
  where version.artifact_id=v_artifact_id;
  if v_version_count <> 1 then
    raise exception 'BUILD 12 replay created % versions', v_version_count;
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

-- A distinct operation may not silently collapse onto an existing stable Artifact key.
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
  v_version_1_id uuid;
  v_version_2_id uuid;
  v_artifact_id uuid;
  v_response jsonb;
  v1 public.artifact_versions;
  v2 public.artifact_versions;
begin
  select operation.result_referent_id
  into strict v_version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict v_artifact_id
  from public.artifact_versions as version
  where version.id=v_version_1_id;

  v_response := public.ecb12_create_artifact_version(
    '12333333-aaaa-4333-8333-333333333333'::uuid,
    v_artifact_id,
    v_version_1_id,
    'text/plain; charset=utf-8',
    E'MAP / TERRITORY\n\nDefinition: map != territory.\n\nRevision: explicit v2.\n',
    '{"source":"build12_qualification","reason":"explicit_revision"}'::jsonb,
    'build12_qualification'
  );

  v_version_2_id := (v_response#>>'{version,id}')::uuid;
  select * into strict v1 from public.artifact_versions where id=v_version_1_id;
  select * into strict v2 from public.artifact_versions where id=v_version_2_id;

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
  v_version_1_id uuid;
  v_artifact_id uuid;
begin
  select operation.result_referent_id
  into strict v_version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict v_artifact_id
  from public.artifact_versions as version
  where version.id=v_version_1_id;

  begin
    perform public.ecb12_create_artifact_version(
      '12444444-aaaa-4444-8444-444444444444'::uuid,
      v_artifact_id,
      v_version_1_id,
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
  v_version_1_id uuid;
  v_version_2_id uuid;
  v_artifact_id uuid;
  v_fetched_v1 jsonb;
  v_fetched_latest jsonb;
begin
  select operation.result_referent_id
  into strict v_version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select operation.result_referent_id
  into strict v_version_2_id
  from public.ordinary_operations as operation
  where operation.id='12333333-aaaa-4333-8333-333333333333'::uuid;

  select version.artifact_id
  into strict v_artifact_id
  from public.artifact_versions as version
  where version.id=v_version_1_id;

  v_fetched_v1 := public.ecb12_fetch_artifact(v_artifact_id, 1);
  v_fetched_latest := public.ecb12_fetch_artifact(v_artifact_id, null);

  if (v_fetched_v1#>>'{version,id}')::uuid <> v_version_1_id then
    raise exception 'BUILD 12 explicit-version fetch did not return v1';
  end if;
  if (v_fetched_latest#>>'{version,id}')::uuid <> v_version_2_id then
    raise exception 'BUILD 12 default fetch did not return latest version';
  end if;
end $$;

-- Artifact identity and versions are immutable even to direct mutation attempts.
do $$
declare
  v_version_1_id uuid;
  v_artifact_id uuid;
begin
  select operation.result_referent_id
  into strict v_version_1_id
  from public.ordinary_operations as operation
  where operation.id='12111111-aaaa-4121-8121-111111111111'::uuid;

  select version.artifact_id
  into strict v_artifact_id
  from public.artifact_versions as version
  where version.id=v_version_1_id;

  begin
    update public.artifact_versions
    set payload_text='MUTATION MUST FAIL'
    where id=v_version_1_id;
    raise exception 'negative control failed: Artifact Version UPDATE succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb12_artifacts_are_immutable%' then
        raise;
      end if;
  end;

  begin
    delete from public.artifact_objects where id=v_artifact_id;
    raise exception 'negative control failed: Artifact DELETE succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb12_artifacts_are_immutable%' then
        raise;
      end if;
  end;
end $$;

-- Ordinary database role gets bounded RPCs, never direct table mutation capability.
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
