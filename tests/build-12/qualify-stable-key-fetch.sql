\set ON_ERROR_STOP on

-- BUILD 12 supplemental qualification: semantic dependencies may resolve a stable
-- Artifact key at an explicit immutable version without depending on environment UUIDs.
-- Run after tests/build-12/qualify.sql on the disposable predecessor.

select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);

set role anon;
select public.ecb12_fetch_artifact_by_key(
  'build12.qualification.semantic-contract',
  1
) as fetched_v1
\gset
reset role;

do $$
declare
  fetched jsonb := :'fetched_v1'::jsonb;
begin
  if fetched is null then
    raise exception 'BUILD 12 stable-key fetch returned null for installed Artifact';
  end if;
  if fetched#>>'{artifact,key}' <> 'build12.qualification.semantic-contract' then
    raise exception 'BUILD 12 stable-key fetch changed Artifact key';
  end if;
  if (fetched#>>'{version,number}')::integer <> 1 then
    raise exception 'BUILD 12 explicit stable-key fetch returned wrong version';
  end if;
  if fetched#>>'{version,payload_text}' <> E'MAP / TERRITORY\n\nDefinition: map != territory.\n' then
    raise exception 'BUILD 12 stable-key fetch changed exact payload';
  end if;
end $$;

-- Unknown stable keys return null rather than silently selecting another Artifact.
set role anon;
do $$
declare
  missing jsonb;
begin
  missing := public.ecb12_fetch_artifact_by_key(
    'build12.qualification.does-not-exist',
    1
  );
  if missing is not null then
    raise exception 'BUILD 12 unknown stable key did not return null';
  end if;
end $$;
reset role;

-- The stable-key surface is bounded like the UUID fetch surface.
do $$
begin
  if not has_function_privilege(
    'anon',
    'public.ecb12_fetch_artifact_by_key(text,integer)',
    'execute'
  ) then
    raise exception 'BUILD 12 anon lacks stable-key fetch RPC';
  end if;
  if has_function_privilege(
    'authenticated',
    'public.ecb12_fetch_artifact_by_key(text,integer)',
    'execute'
  ) then
    raise exception 'BUILD 12 authenticated unexpectedly has stable-key fetch RPC';
  end if;
end $$;

select 'BUILD12_STABLE_KEY_QUALIFICATION=PASS' as result;
