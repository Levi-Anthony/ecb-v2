-- BUILD 12 corrective migration — remove PL/pgSQL identifier ambiguity from
-- stable-key Artifact fetch without changing its contract.

begin;

create or replace function public.ecb12_fetch_artifact_by_key(
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
  v_artifact_id uuid;
  v_version_id uuid;
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
  into v_artifact_id
  from public.artifact_objects as artifact
  where artifact.artifact_key = p_artifact_key;

  if v_artifact_id is null then
    return null;
  end if;

  if p_version_number is null then
    select version.id
    into v_version_id
    from public.artifact_versions as version
    where version.artifact_id = v_artifact_id
    order by version.version_number desc
    limit 1;
  else
    select version.id
    into v_version_id
    from public.artifact_versions as version
    where version.artifact_id = v_artifact_id
      and version.version_number = p_version_number;
  end if;

  if v_version_id is null then
    return null;
  end if;

  return ecb12.render_artifact_version(v_version_id, null, false);
end;
$$;

revoke all on function public.ecb12_fetch_artifact_by_key(text, integer)
  from public, authenticated, service_role;
grant execute on function public.ecb12_fetch_artifact_by_key(text, integer)
  to anon;

commit;
