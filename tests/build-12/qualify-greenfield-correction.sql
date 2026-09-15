\set ON_ERROR_STOP on

-- BUILD 12 greenfield correction qualification.
-- Assumes BUILD 11 qualification commissioned the disposable runtime key.

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);

-- First-pass invented surfaces must be gone.
do $$
begin
  if pg_catalog.to_regclass('public.artifact_objects') is not null
    or pg_catalog.to_regclass('public.artifact_versions') is not null then
    raise exception 'invented BUILD 12 object/version tables survived';
  end if;

  if pg_catalog.to_regprocedure(
      'public.ecb12_create_artifact_version(uuid,uuid,uuid,text,text,jsonb,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.ecb12_fetch_artifact_by_key(text,integer)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.ecb12_fetch_artifact(uuid,integer)'
    ) is not null then
    raise exception 'invented BUILD 12 version/key RPC surface survived';
  end if;
end;
$$;

-- Native Artifact representation is intentionally only identity + exact text.
do $$
declare
  columns text[];
begin
  select pg_catalog.array_agg(column_name order by ordinal_position)
  into columns
  from information_schema.columns
  where table_schema='public' and table_name='text_artifacts';

  if columns is distinct from array['id','content'] then
    raise exception 'greenfield text_artifacts columns drifted: %', columns;
  end if;
end;
$$;

-- Create one Artifact through the ordinary bounded RPC.
set role anon;
select * from public.ecb12_create_artifact(
  '12a11111-aaaa-4121-8121-111111111111'::uuid,
  E'alpha\nbeta\n'
);
reset role;

-- Universal Referent coupling, exact bytes, and Build 11 operation identity.
do $$
declare
  artifact_id uuid;
  artifact_content text;
  referent_time timestamptz;
begin
  select operation.result_referent_id
  into strict artifact_id
  from public.ordinary_operations as operation
  where operation.id='12a11111-aaaa-4121-8121-111111111111'::uuid;

  if not exists(select 1 from public.referents where id=artifact_id) then
    raise exception 'Artifact escaped universal Referent coupling';
  end if;

  select artifact.content
  into strict artifact_content
  from public.text_artifacts as artifact
  where artifact.id=artifact_id;

  if artifact_content <> E'alpha\nbeta\n' then
    raise exception 'Artifact content did not round-trip exactly';
  end if;

  select registered_at into strict referent_time
  from public.referents where id=artifact_id;
  if referent_time is null then
    raise exception 'Artifact Referent lacks registry time';
  end if;
end;
$$;

-- Exact replay returns the same Artifact and creates no second effect.
set role anon;
select * from public.ecb12_create_artifact(
  '12a11111-aaaa-4121-8121-111111111111'::uuid,
  E'alpha\nbeta\n'
);
reset role;

do $$
declare
  artifact_count integer;
begin
  select count(*) into artifact_count from public.text_artifacts;
  if artifact_count <> 1 then
    raise exception 'exact replay produced % Artifacts', artifact_count;
  end if;
end;
$$;

-- Same operation identity with changed input must conflict before another effect.
do $$
begin
  begin
    perform public.ecb12_create_artifact(
      '12a11111-aaaa-4121-8121-111111111111'::uuid,
      'changed input'
    );
    raise exception 'negative control failed: changed-input replay succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb11_operation_conflict%' then
        raise;
      end if;
  end;
end;
$$;

-- Distinct operation + identical content must preserve distinct Artifact identity.
set role anon;
select * from public.ecb12_create_artifact(
  '12a22222-aaaa-4222-8222-222222222222'::uuid,
  E'alpha\nbeta\n'
);
reset role;

do $$
declare
  first_id uuid;
  second_id uuid;
  artifact_count integer;
begin
  select result_referent_id into strict first_id
  from public.ordinary_operations
  where id='12a11111-aaaa-4121-8121-111111111111'::uuid;

  select result_referent_id into strict second_id
  from public.ordinary_operations
  where id='12a22222-aaaa-4222-8222-222222222222'::uuid;

  if first_id = second_id then
    raise exception 'distinct operations collapsed Artifact identity';
  end if;

  select count(*) into artifact_count from public.text_artifacts;
  if artifact_count <> 2 then
    raise exception 'expected two Artifacts, observed %', artifact_count;
  end if;
end;
$$;

-- Resolve the test Artifact under owner custody, then prove ordinary fetch needs
-- only that Artifact identity and does not require access to the private operation ledger.
select result_referent_id as fetch_artifact_id
from public.ordinary_operations
where id='12a11111-aaaa-4121-8121-111111111111'::uuid
\gset

set role anon;
select fetched.*
from public.ecb12_fetch_artifact(:'fetch_artifact_id'::uuid) as fetched;
reset role;

-- Native Artifact records are immutable even to owner-level direct mutation.
do $$
declare
  target_id uuid;
begin
  select result_referent_id into strict target_id
  from public.ordinary_operations
  where id='12a11111-aaaa-4121-8121-111111111111'::uuid;

  begin
    update public.text_artifacts set content='mutation must fail' where id=target_id;
    raise exception 'negative control failed: Artifact UPDATE succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb12_artifact_immutable%' then raise; end if;
  end;

  begin
    delete from public.text_artifacts where id=target_id;
    raise exception 'negative control failed: Artifact DELETE succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb12_artifact_immutable%' then raise; end if;
  end;
end;
$$;

-- Ordinary role receives only bounded create/fetch RPC capability, never table mutation.
do $$
begin
  if pg_catalog.has_table_privilege('anon','public.text_artifacts','insert')
    or pg_catalog.has_table_privilege('anon','public.text_artifacts','update')
    or pg_catalog.has_table_privilege('anon','public.text_artifacts','delete') then
    raise exception 'anon has direct Artifact mutation capability';
  end if;

  if not pg_catalog.has_function_privilege(
      'anon','public.ecb12_create_artifact(uuid,text)','execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon','public.ecb12_fetch_artifact(uuid)','execute'
    ) then
    raise exception 'corrected Artifact RPC surface incomplete';
  end if;
end;
$$;

select 'BUILD12_GREENFIELD_CORRECTION=PASS' as result;
