\set ON_ERROR_STOP on

-- BUILD 11 qualification against disposable BUILD 0–6 predecessor.

-- Existing BUILD 0 evidence must survive the representation split.
do $$
declare
  gt01_representations integer;
  old_embedding_columns integer;
begin
  select count(*) into gt01_representations
  from public.thought_representations
  where thought_id = '19a949ea-a8fc-4250-a386-fa64e5530180'::uuid
    and model_id = 'gte-small';
  if gt01_representations <> 1 then
    raise exception 'BUILD 11 failed to migrate GT01 representation: %', gt01_representations;
  end if;

  select count(*) into old_embedding_columns
  from information_schema.columns
  where table_schema='public'
    and table_name='thoughts'
    and column_name in ('embedding','embedding_model');
  if old_embedding_columns <> 0 then
    raise exception 'BUILD 11 left representation columns on Thought';
  end if;
end $$;

-- Commission the narrow ordinary runtime capability once through the admin-only seam.
set role service_role;
select public.ecb11_commission_runtime_key(
  'build11-test-runtime-key-00000000000000000000'
);
reset role;

-- Negative control: commissioning is one-time.
do $$
begin
  begin
    perform public.ecb11_commission_runtime_key(
      'build11-test-runtime-key-11111111111111111111'
    );
    raise exception 'negative control failed: second commissioning succeeded';
  exception
    when object_not_in_prerequisite_state then
      if sqlerrm not like '%ecb11_runtime_already_commissioned%' then
        raise;
      end if;
  end;
end $$;

-- Negative control: wrong runtime capability cannot invoke the ordinary RPC.
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"wrong-build11-runtime-key-000000000000000000"}',
  false
);
do $$
begin
  begin
    perform * from public.ecb11_fetch_thought(
      '19a949ea-a8fc-4250-a386-fa64e5530180'::uuid,
      'gte-small'
    );
    raise exception 'negative control failed: wrong runtime key succeeded';
  exception
    when invalid_authorization_specification then
      if sqlerrm not like '%ecb11_runtime_unauthorized%' then
        raise;
      end if;
  end;
end $$;

-- Correct runtime capability for remaining qualification calls.
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);

-- Anon is the actual database role used by the BUILD 11 Edge runtime.
set role anon;
select * from public.ecb11_capture_thought(
  '11111111-aaaa-4111-8111-111111111111'::uuid,
  'BUILD 11 replay specimen: red cedar under moonlight.',
  'build11_qualification',
  null
);
reset role;

-- First call produces exactly one operation and one durable Thought with no required embedding.
do $$
declare
  result_id uuid;
  representation_count integer;
begin
  select result_referent_id into strict result_id
  from public.ordinary_operations
  where id='11111111-aaaa-4111-8111-111111111111'::uuid;

  if not exists(select 1 from public.thoughts where id=result_id) then
    raise exception 'capture operation lacks durable Thought result';
  end if;

  select count(*) into representation_count
  from public.thought_representations
  where thought_id=result_id and model_id='gte-small';
  if representation_count <> 0 then
    raise exception 'capture unexpectedly required semantic representation';
  end if;
end $$;

-- A replay of the exact operation returns the same effect, not a second Thought.
set role anon;
select * from public.ecb11_capture_thought(
  '11111111-aaaa-4111-8111-111111111111'::uuid,
  'BUILD 11 replay specimen: red cedar under moonlight.',
  'build11_qualification',
  null
);
reset role;

do $$
declare
  op_count integer;
  result_id uuid;
  same_content_thoughts integer;
begin
  select count(*)
  into op_count
  from public.ordinary_operations
  where id='11111111-aaaa-4111-8111-111111111111'::uuid;
  select result_referent_id
  into strict result_id
  from public.ordinary_operations
  where id='11111111-aaaa-4111-8111-111111111111'::uuid;
  if op_count <> 1 then
    raise exception 'replay created % operation rows', op_count;
  end if;

  select count(*) into same_content_thoughts
  from public.thoughts
  where content='BUILD 11 replay specimen: red cedar under moonlight.'
    and source='build11_qualification';
  if same_content_thoughts <> 1 then
    raise exception 'replay created % identical Thoughts', same_content_thoughts;
  end if;
end $$;

-- Negative control: same operation identity with changed input is a conflict.
do $$
begin
  begin
    perform * from public.ecb11_capture_thought(
      '11111111-aaaa-4111-8111-111111111111'::uuid,
      'CHANGED CONTENT MUST CONFLICT',
      'build11_qualification',
      null
    );
    raise exception 'negative control failed: changed-input replay succeeded';
  exception
    when unique_violation then
      if sqlerrm not like '%ecb11_operation_conflict%' then
        raise;
      end if;
  end;
end $$;

-- Same content under a distinct operation identity remains a legitimate distinct encounter.
set role anon;
select * from public.ecb11_capture_thought(
  '22222222-aaaa-4222-8222-222222222222'::uuid,
  'BUILD 11 replay specimen: red cedar under moonlight.',
  'build11_qualification',
  null
);
reset role;

do $$
declare
  same_content_thoughts integer;
  first_result uuid;
  second_result uuid;
begin
  select result_referent_id into strict first_result
  from public.ordinary_operations
  where id='11111111-aaaa-4111-8111-111111111111'::uuid;
  select result_referent_id into strict second_result
  from public.ordinary_operations
  where id='22222222-aaaa-4222-8222-222222222222'::uuid;

  if first_result = second_result then
    raise exception 'distinct capture operations collapsed onto one Thought';
  end if;

  select count(*) into same_content_thoughts
  from public.thoughts
  where content='BUILD 11 replay specimen: red cedar under moonlight.'
    and source='build11_qualification';
  if same_content_thoughts <> 2 then
    raise exception 'distinct same-content encounters produced % Thoughts', same_content_thoughts;
  end if;
end $$;

-- Obtain the result identity through the admin qualification surface, then verify
-- anon can only act through the bounded store RPC. An anon subquery against the
-- operations table would correctly be denied and would test the wrong thing here.
select result_referent_id::text as first_result_id
from public.ordinary_operations
where id='11111111-aaaa-4111-8111-111111111111'::uuid
\gset

-- Store one semantic representation through the secret-gated anon RPC.
set role anon;
select public.ecb11_store_embedding(
  :'first_result_id'::uuid,
  'gte-small',
  ('[' || repeat('0,',383) || '0]')::extensions.vector(384)
);
reset role;

-- Fetch truthfully reports representation readiness.
do $$
declare
  result_id uuid;
  ready boolean;
begin
  select result_referent_id into strict result_id
  from public.ordinary_operations
  where id='11111111-aaaa-4111-8111-111111111111'::uuid;

  select representation_ready into strict ready
  from public.ecb11_fetch_thought(result_id,'gte-small');
  if not ready then
    raise exception 'fetch failed to report ready representation';
  end if;
end $$;

-- Lexical floor must work with no semantic query embedding and must report degraded coverage
-- because the second same-content capture intentionally still lacks an embedding.
do $$
declare
  search_result jsonb;
begin
  search_result := public.ecb11_search_thoughts(
    'red cedar moonlight',
    'gte-small',
    null,
    10
  );

  if jsonb_array_length(search_result->'results') < 1 then
    raise exception 'lexical fallback returned no result';
  end if;
  if (search_result#>>'{coverage,lexical_available}')::boolean is not true then
    raise exception 'lexical coverage not declared available';
  end if;
  if (search_result#>>'{coverage,semantic_query_available}')::boolean is not false then
    raise exception 'semantic-query outage not reported';
  end if;
  if (search_result#>>'{coverage,degraded}')::boolean is not true then
    raise exception 'degraded coverage not reported';
  end if;
  if (search_result#>>'{coverage,missing_representations}')::integer < 1 then
    raise exception 'missing representation deficit not visible';
  end if;
end $$;

-- Missing representation repair route must be discoverable without semantic search itself.
do $$
declare
  missing_id uuid;
begin
  select thought_id into strict missing_id
  from public.ecb11_list_missing_embeddings('gte-small',100)
  where thought_id=(
    select result_referent_id
    from public.ordinary_operations
    where id='22222222-aaaa-4222-8222-222222222222'::uuid
  );

  if missing_id is null then
    raise exception 'representation deficit is not independently discoverable';
  end if;
end $$;

-- Universal Referent coupling is structural for the new first-class subjects.
do $$
declare
  missing_operation_referents integer;
  missing_representation_referents integer;
begin
  select count(*) into missing_operation_referents
  from public.ordinary_operations o
  left join public.referents r on r.id=o.id
  where r.id is null;

  select count(*) into missing_representation_referents
  from public.thought_representations tr
  left join public.referents r on r.id=tr.id
  where r.id is null;

  if missing_operation_referents <> 0 or missing_representation_referents <> 0 then
    raise exception 'new first-class subjects escaped Referent coupling';
  end if;
end $$;

-- Capability topology: anon can execute only bounded RPCs, not mutate kernel/governance tables.
do $$
begin
  if has_table_privilege('anon','public.thoughts','insert')
    or has_table_privilege('anon','public.ordinary_operations','insert')
    or has_table_privilege('anon','public.thought_representations','insert')
    or has_table_privilege('anon','public.claims','insert')
    or has_table_privilege('anon','public.evidence_links','insert') then
    raise exception 'anon retains forbidden direct mutation privilege';
  end if;

  if not has_function_privilege(
    'anon','public.ecb11_capture_thought(uuid,text,text,timestamptz)','execute'
  ) then
    raise exception 'anon lacks bounded capture RPC';
  end if;

  if has_function_privilege(
    'anon','public.ecb11_commission_runtime_key(text)','execute'
  ) then
    raise exception 'anon may commission its own runtime capability';
  end if;
end $$;

-- Persistent first-class operation/representation identities must remain distinct from result identity.
do $$
declare
  op_id uuid := '11111111-aaaa-4111-8111-111111111111'::uuid;
  result_id uuid;
  representation_id uuid;
begin
  select result_referent_id into strict result_id
  from public.ordinary_operations where id=op_id;
  select id into strict representation_id
  from public.thought_representations
  where thought_id=result_id and model_id='gte-small';

  if op_id=result_id or op_id=representation_id or result_id=representation_id then
    raise exception 'operation / Thought / representation identities collapsed';
  end if;
end $$;

select 'BUILD11_QUALIFICATION=PASS' as result;
