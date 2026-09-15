-- BUILD 12 follow-up — stable Artifact-key fetch.
-- Definition/tool dependencies should be able to name a stable Artifact key plus an
-- explicit immutable version instead of depending on environment-specific UUIDs.

begin;

create function public.ecb12_fetch_artifact_by_key(
  p_artifact_key text,
  p_version_number integer default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  artifact_id uuid;
  version_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_artifact_key is null or length(btrim(p_artifact_key)) = 0 then
    raise exception 'ecb12_artifact_key_required'
      using errcode = '22023';
  end if;
  if p_version_number is not null and p_version_number < 1 then
    raise exception 'ecb12_version_number_invalid'
      using errcode = '22023';
  end if;

  select artifact.id
  into artifact_id
  from public.artifact_objects as artifact
  where artifact.artifact_key = p_artifact_key;

  if artifact_id is null then
    return null;
  end if;

  if p_version_number is null then
    select version.id
    into version_id
    from public.artifact_versions as version
    where version.artifact_id = artifact_id
    order by version.version_number desc
    limit 1;
  else
    select version.id
    into version_id
    from public.artifact_versions as version
    where version.artifact_id = artifact_id
      and version.version_number = p_version_number;
  end if;

  if version_id is null then
    return null;
  end if;

  return ecb12.render_artifact_version(version_id, null, false);
end;
$$;

revoke all on function public.ecb12_fetch_artifact_by_key(text, integer)
  from public, authenticated, service_role;
grant execute on function public.ecb12_fetch_artifact_by_key(text, integer)
  to anon;

do $$
begin
  if not pg_catalog.has_function_privilege(
    'anon',
    'public.ecb12_fetch_artifact_by_key(text,integer)',
    'execute'
  ) then
    raise exception 'BUILD 12 stable-key fetch grant missing';
  end if;
end;
$$;

commit;
