-- BUILD 11 — Ordinary Operation Structural Kernel
-- Structural enforcement for ordinary capture/retrieval without semantic promotion.
-- Requires canonical BUILD 0–6 substrate. Does not install BUILD 7–10.

begin;

create schema if not exists ecb11;
revoke all on schema ecb11 from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Governing substrate: operation identity and derived Thought representations.
-- ---------------------------------------------------------------------------

create table public.ordinary_operations (
  id uuid primary key,
  operation_kind text not null,
  request_digest bytea not null,
  result_referent_id uuid not null,
  committed_at timestamptz not null default transaction_timestamp(),
  constraint ordinary_operations_kind_nonempty
    check (length(btrim(operation_kind)) > 0),
  constraint ordinary_operations_request_digest_sha256
    check (octet_length(request_digest) = 32),
  constraint ordinary_operations_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint ordinary_operations_result_referent_fkey
    foreign key (result_referent_id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable
);

comment on table public.ordinary_operations is
  'BUILD 11 stable identities and committed outcomes for consequential ordinary operations. Operation identity is not content identity or authorization.';

create table public.thought_representations (
  id uuid primary key default gen_random_uuid(),
  thought_id uuid not null,
  model_id text not null,
  embedding extensions.vector(384) not null,
  represented_at timestamptz not null default transaction_timestamp(),
  constraint thought_representations_model_nonempty
    check (length(btrim(model_id)) > 0),
  constraint thought_representations_referent_fkey
    foreign key (id)
    references public.referents (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_representations_thought_fkey
    foreign key (thought_id)
    references public.thoughts (id)
    on update restrict
    on delete restrict
    not deferrable,
  constraint thought_representations_one_model_per_thought
    unique (thought_id, model_id)
);

comment on table public.thought_representations is
  'BUILD 11 rebuildable semantic representations of canonical Thought evidence. Representation identity does not confer standing, truth, currentness, or authority.';

alter table public.ordinary_operations enable row level security;
alter table public.thought_representations enable row level security;

revoke all on table public.ordinary_operations
  from public, anon, authenticated, service_role;
revoke all on table public.thought_representations
  from public, anon, authenticated, service_role;

-- Migrate existing BUILD 0 embeddings into first-class representation records
-- before removing representation columns from canonical Thought evidence.
create temporary table ecb11_existing_representations on commit drop as
select
  gen_random_uuid() as representation_id,
  thought.id as thought_id,
  thought.embedding_model as model_id,
  thought.embedding as embedding
from public.thoughts as thought;

insert into public.referents (id)
select representation_id
from ecb11_existing_representations;

insert into public.thought_representations (
  id,
  thought_id,
  model_id,
  embedding
)
select
  representation_id,
  thought_id,
  model_id,
  embedding
from ecb11_existing_representations;

-- The old BUILD 0 semantic search function depends on Thought.embedding.
drop function public.search_thoughts(extensions.vector, integer);

alter table public.thoughts
  drop column embedding,
  drop column embedding_model;

comment on table public.thoughts is
  'Canonical atomic evidence records. BUILD 11 separates durable Thought evidence from derived retrieval representations; capture does not promote a Thought into governance standing.';

create index thoughts_lexical_search_idx
  on public.thoughts
  using gin (
    pg_catalog.to_tsvector(
      'simple'::pg_catalog.regconfig,
      content || ' ' || source
    )
  );

-- ---------------------------------------------------------------------------
-- Universal Referent coupling for new persistent first-class subjects.
-- ---------------------------------------------------------------------------

create function ecb11.register_ordinary_operation()
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

create function ecb11.register_thought_representation()
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

revoke all on function ecb11.register_ordinary_operation()
  from public, anon, authenticated, service_role;
revoke all on function ecb11.register_thought_representation()
  from public, anon, authenticated, service_role;

create trigger ordinary_operations_register_referent
before insert on public.ordinary_operations
for each row
execute function ecb11.register_ordinary_operation();

create trigger thought_representations_register_referent
before insert on public.thought_representations
for each row
execute function ecb11.register_thought_representation();

-- ---------------------------------------------------------------------------
-- Narrow runtime capability token. The deployed ordinary MCP uses anon/publishable
-- database access plus this secret-gated RPC surface; it no longer needs the
-- service-role credential at runtime.
-- ---------------------------------------------------------------------------

create table ecb11.runtime_capability (
  singleton boolean primary key default true,
  key_digest bytea not null,
  commissioned_at timestamptz not null default transaction_timestamp(),
  constraint runtime_capability_singleton check (singleton),
  constraint runtime_capability_digest_sha256 check (octet_length(key_digest) = 32)
);

revoke all on table ecb11.runtime_capability
  from public, anon, authenticated, service_role;

create function ecb11.assert_runtime_key()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  supplied_key text;
  expected_digest bytea;
begin
  select capability.key_digest
  into expected_digest
  from ecb11.runtime_capability as capability
  where capability.singleton;

  if expected_digest is null then
    raise exception 'ecb11_runtime_uncommissioned'
      using errcode = '28000';
  end if;

  begin
    supplied_key :=
      (pg_catalog.current_setting('request.headers', true)::jsonb
        ->> 'x-ecb-runtime-key');
  exception
    when others then
      supplied_key := null;
  end;

  if supplied_key is null
    or extensions.digest(pg_catalog.convert_to(supplied_key, 'UTF8'), 'sha256')
      <> expected_digest then
    raise exception 'ecb11_runtime_unauthorized'
      using errcode = '28000';
  end if;
end;
$$;

revoke all on function ecb11.assert_runtime_key()
  from public, anon, authenticated, service_role;

create function public.ecb11_commission_runtime_key(p_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_key is null or length(p_key) < 32 then
    raise exception 'ecb11_runtime_key_too_short'
      using errcode = '22023';
  end if;

  if exists (select 1 from ecb11.runtime_capability) then
    raise exception 'ecb11_runtime_already_commissioned'
      using errcode = '55000';
  end if;

  insert into ecb11.runtime_capability (key_digest)
  values (extensions.digest(pg_catalog.convert_to(p_key, 'UTF8'), 'sha256'));
end;
$$;

revoke all on function public.ecb11_commission_runtime_key(text)
  from public, anon, authenticated;
grant execute on function public.ecb11_commission_runtime_key(text)
  to service_role;

-- ---------------------------------------------------------------------------
-- Exact request identity for capture.
-- ---------------------------------------------------------------------------

create function ecb11.capture_request_digest(
  p_content text,
  p_source text,
  p_captured_at timestamptz
)
returns bytea
language plpgsql
immutable
set search_path = ''
as $$
declare
  content_octets bytea;
  source_octets bytea;
  digest_input bytea;
  captured_at_microseconds bigint;
begin
  if p_content is null or length(btrim(p_content)) = 0 then
    raise exception 'ecb11_capture_content_required'
      using errcode = '22023';
  end if;

  if p_source is null or length(btrim(p_source)) = 0 then
    raise exception 'ecb11_capture_source_required'
      using errcode = '22023';
  end if;

  if p_captured_at is not null and not pg_catalog.isfinite(p_captured_at) then
    raise exception 'ecb11_capture_time_must_be_finite'
      using errcode = '22008';
  end if;

  content_octets := pg_catalog.convert_to(p_content, 'UTF8');
  source_octets := pg_catalog.convert_to(p_source, 'UTF8');

  digest_input :=
    pg_catalog.convert_to('ECB11-CAPTURE-REQUEST-V1', 'UTF8')
    || pg_catalog.decode('00', 'hex')
    || pg_catalog.decode('01', 'hex')
    || pg_catalog.int8send(pg_catalog.octet_length(content_octets)::bigint)
    || content_octets
    || pg_catalog.decode('02', 'hex')
    || pg_catalog.int8send(pg_catalog.octet_length(source_octets)::bigint)
    || source_octets
    || pg_catalog.decode('03', 'hex');

  if p_captured_at is null then
    digest_input := digest_input || pg_catalog.decode('00', 'hex');
  else
    captured_at_microseconds :=
      (extract(epoch from p_captured_at) * 1000000)::bigint;
    digest_input :=
      digest_input
      || pg_catalog.decode('01', 'hex')
      || pg_catalog.int8send(captured_at_microseconds);
  end if;

  return extensions.digest(digest_input, 'sha256');
end;
$$;

revoke all on function ecb11.capture_request_digest(text, text, timestamptz)
  from public, anon, authenticated, service_role;

create function public.ecb11_capture_thought(
  p_operation_id uuid,
  p_content text,
  p_source text,
  p_captured_at timestamptz default null
)
returns table (
  operation_id uuid,
  thought_id uuid,
  content text,
  source text,
  captured_at timestamptz,
  replayed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_digest bytea;
  existing_operation public.ordinary_operations;
  existing_thought public.thoughts;
  new_thought_id uuid;
  effective_captured_at timestamptz;
begin
  perform ecb11.assert_runtime_key();

  if p_operation_id is null then
    raise exception 'ecb11_operation_id_required'
      using errcode = '22023';
  end if;

  request_digest := ecb11.capture_request_digest(
    p_content,
    p_source,
    p_captured_at
  );

  -- Same operation identity serializes here before any effect is selected.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::text, 0)
  );

  select operation.*
  into existing_operation
  from public.ordinary_operations as operation
  where operation.id = p_operation_id;

  if found then
    if existing_operation.operation_kind <> 'capture_thought'
      or existing_operation.request_digest <> request_digest then
      raise exception 'ecb11_operation_conflict'
        using errcode = '23505';
    end if;

    select thought.*
    into strict existing_thought
    from public.thoughts as thought
    where thought.id = existing_operation.result_referent_id;

    return query
    select
      p_operation_id,
      existing_thought.id,
      existing_thought.content,
      existing_thought.source,
      existing_thought.captured_at,
      true;
    return;
  end if;

  new_thought_id := gen_random_uuid();
  effective_captured_at := coalesce(p_captured_at, pg_catalog.transaction_timestamp());

  insert into public.thoughts (id, content, source, captured_at)
  values (
    new_thought_id,
    p_content,
    p_source,
    effective_captured_at
  );

  insert into public.ordinary_operations (
    id,
    operation_kind,
    request_digest,
    result_referent_id
  )
  values (
    p_operation_id,
    'capture_thought',
    request_digest,
    new_thought_id
  );

  return query
  select
    p_operation_id,
    new_thought_id,
    p_content,
    p_source,
    effective_captured_at,
    false;
end;
$$;

revoke all on function public.ecb11_capture_thought(uuid, text, text, timestamptz)
  from public, authenticated, service_role;
grant execute on function public.ecb11_capture_thought(uuid, text, text, timestamptz)
  to anon;

-- ---------------------------------------------------------------------------
-- Representation readiness / deterministic repair surface.
-- ---------------------------------------------------------------------------

create function public.ecb11_fetch_thought(
  p_id uuid,
  p_model_id text
)
returns table (
  id uuid,
  content text,
  source text,
  captured_at timestamptz,
  representation_ready boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform ecb11.assert_runtime_key();

  if p_model_id is null or length(btrim(p_model_id)) = 0 then
    raise exception 'ecb11_model_id_required'
      using errcode = '22023';
  end if;

  return query
  select
    thought.id,
    thought.content,
    thought.source,
    thought.captured_at,
    exists (
      select 1
      from public.thought_representations as representation
      where representation.thought_id = thought.id
        and representation.model_id = p_model_id
    )
  from public.thoughts as thought
  where thought.id = p_id;
end;
$$;

revoke all on function public.ecb11_fetch_thought(uuid, text)
  from public, authenticated, service_role;
grant execute on function public.ecb11_fetch_thought(uuid, text)
  to anon;

create function public.ecb11_list_missing_embeddings(
  p_model_id text,
  p_limit integer default 100
)
returns table (
  thought_id uuid,
  content text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  effective_limit integer;
begin
  perform ecb11.assert_runtime_key();

  if p_model_id is null or length(btrim(p_model_id)) = 0 then
    raise exception 'ecb11_model_id_required'
      using errcode = '22023';
  end if;

  effective_limit := least(greatest(coalesce(p_limit, 100), 1), 1000);

  return query
  select thought.id, thought.content
  from public.thoughts as thought
  where not exists (
    select 1
    from public.thought_representations as representation
    where representation.thought_id = thought.id
      and representation.model_id = p_model_id
  )
  order by thought.captured_at, thought.id
  limit effective_limit;
end;
$$;

revoke all on function public.ecb11_list_missing_embeddings(text, integer)
  from public, authenticated, service_role;
grant execute on function public.ecb11_list_missing_embeddings(text, integer)
  to anon;

create function public.ecb11_store_embedding(
  p_thought_id uuid,
  p_model_id text,
  p_embedding extensions.vector(384)
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_id uuid;
  created_id uuid;
begin
  perform ecb11.assert_runtime_key();

  if p_model_id is null or length(btrim(p_model_id)) = 0 then
    raise exception 'ecb11_model_id_required'
      using errcode = '22023';
  end if;

  if p_embedding is null then
    raise exception 'ecb11_embedding_required'
      using errcode = '22023';
  end if;

  perform 1
  from public.thoughts as thought
  where thought.id = p_thought_id;
  if not found then
    raise exception 'ecb11_thought_not_found'
      using errcode = 'P0002';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_thought_id::text || ':' || p_model_id, 0)
  );

  select representation.id
  into existing_id
  from public.thought_representations as representation
  where representation.thought_id = p_thought_id
    and representation.model_id = p_model_id;

  if existing_id is not null then
    return existing_id;
  end if;

  created_id := gen_random_uuid();
  insert into public.thought_representations (
    id,
    thought_id,
    model_id,
    embedding
  )
  values (
    created_id,
    p_thought_id,
    p_model_id,
    p_embedding
  );

  return created_id;
end;
$$;

revoke all on function public.ecb11_store_embedding(uuid, text, extensions.vector)
  from public, authenticated, service_role;
grant execute on function public.ecb11_store_embedding(uuid, text, extensions.vector)
  to anon;

-- ---------------------------------------------------------------------------
-- One small outward search affordance: deterministic lexical floor + semantic
-- rank when available, with explicit coverage truthfulness.
-- ---------------------------------------------------------------------------

create function public.ecb11_search_thoughts(
  p_query text,
  p_model_id text,
  p_query_embedding extensions.vector(384) default null,
  p_limit integer default 10
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  effective_limit integer;
  total_count bigint;
  represented_count bigint;
  missing_count bigint;
  result_rows jsonb;
begin
  perform ecb11.assert_runtime_key();

  if p_query is null or length(btrim(p_query)) = 0 then
    raise exception 'ecb11_search_query_required'
      using errcode = '22023';
  end if;

  if p_model_id is null or length(btrim(p_model_id)) = 0 then
    raise exception 'ecb11_model_id_required'
      using errcode = '22023';
  end if;

  effective_limit := least(greatest(coalesce(p_limit, 10), 1), 100);

  select count(*) into total_count from public.thoughts;

  select count(*)
  into represented_count
  from public.thoughts as thought
  where exists (
    select 1
    from public.thought_representations as representation
    where representation.thought_id = thought.id
      and representation.model_id = p_model_id
  );

  missing_count := total_count - represented_count;

  with lexical_source as (
    select
      thought.id,
      pg_catalog.ts_rank_cd(
        pg_catalog.to_tsvector(
          'simple'::pg_catalog.regconfig,
          thought.content || ' ' || thought.source
        ),
        pg_catalog.plainto_tsquery('simple'::pg_catalog.regconfig, p_query)
      ) as lexical_score
    from public.thoughts as thought
    where pg_catalog.to_tsvector(
      'simple'::pg_catalog.regconfig,
      thought.content || ' ' || thought.source
    ) @@ pg_catalog.plainto_tsquery('simple'::pg_catalog.regconfig, p_query)
  ),
  lexical as (
    select
      lexical_source.id,
      lexical_source.lexical_score,
      row_number() over (
        order by lexical_source.lexical_score desc, lexical_source.id
      ) as lexical_rank
    from lexical_source
  ),
  semantic_source as (
    select
      representation.thought_id as id,
      1 - (
        representation.embedding
        operator(extensions.<=>)
        p_query_embedding
      ) as semantic_similarity
    from public.thought_representations as representation
    where p_query_embedding is not null
      and representation.model_id = p_model_id
  ),
  semantic as (
    select
      semantic_source.id,
      semantic_source.semantic_similarity,
      row_number() over (
        order by semantic_source.semantic_similarity desc, semantic_source.id
      ) as semantic_rank
    from semantic_source
  ),
  candidate_ids as (
    select lexical.id from lexical
    union
    select semantic.id from semantic
  ),
  ranked as (
    select
      thought.id,
      thought.content,
      thought.source,
      thought.captured_at,
      lexical.lexical_rank,
      lexical.lexical_score,
      semantic.semantic_rank,
      semantic.semantic_similarity,
      coalesce(1.0 / (60.0 + lexical.lexical_rank), 0.0)
        + coalesce(1.0 / (60.0 + semantic.semantic_rank), 0.0)
        as combined_score
    from candidate_ids
    join public.thoughts as thought on thought.id = candidate_ids.id
    left join lexical on lexical.id = candidate_ids.id
    left join semantic on semantic.id = candidate_ids.id
    order by combined_score desc, thought.id
    limit effective_limit
  )
  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'id', ranked.id,
        'content', ranked.content,
        'source', ranked.source,
        'captured_at', ranked.captured_at,
        'lexical_rank', ranked.lexical_rank,
        'lexical_score', ranked.lexical_score,
        'semantic_rank', ranked.semantic_rank,
        'semantic_similarity', ranked.semantic_similarity,
        'score', ranked.combined_score
      )
      order by ranked.combined_score desc, ranked.id
    ),
    '[]'::jsonb
  )
  into result_rows
  from ranked;

  return pg_catalog.jsonb_build_object(
    'results', result_rows,
    'coverage', pg_catalog.jsonb_build_object(
      'total_thoughts', total_count,
      'represented_thoughts', represented_count,
      'missing_representations', missing_count,
      'semantic_query_available', p_query_embedding is not null,
      'semantic_index_complete', missing_count = 0,
      'lexical_available', true,
      'degraded', missing_count > 0 or p_query_embedding is null
    )
  );
end;
$$;

revoke all on function public.ecb11_search_thoughts(
  text,
  text,
  extensions.vector,
  integer
) from public, authenticated, service_role;
grant execute on function public.ecb11_search_thoughts(
  text,
  text,
  extensions.vector,
  integer
) to anon;

-- ---------------------------------------------------------------------------
-- Structural self-check: no direct ordinary-runtime table mutation capability,
-- exact RPC surface, and no silent missing Referent identities.
-- ---------------------------------------------------------------------------

do $$
declare
  uncoupled_operations integer;
  uncoupled_representations integer;
begin
  select count(*)
  into uncoupled_operations
  from public.ordinary_operations as operation
  left join public.referents as referent on referent.id = operation.id
  where referent.id is null;

  select count(*)
  into uncoupled_representations
  from public.thought_representations as representation
  left join public.referents as referent on referent.id = representation.id
  where referent.id is null;

  if uncoupled_operations <> 0 or uncoupled_representations <> 0 then
    raise exception 'BUILD 11 left uncoupled first-class referents';
  end if;

  if pg_catalog.has_table_privilege('anon', 'public.thoughts', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.thoughts', 'update')
    or pg_catalog.has_table_privilege('anon', 'public.thoughts', 'delete')
    or pg_catalog.has_table_privilege('anon', 'public.ordinary_operations', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.thought_representations', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.claims', 'insert')
    or pg_catalog.has_table_privilege('anon', 'public.evidence_links', 'insert') then
    raise exception 'BUILD 11 anon role has forbidden direct mutation capability';
  end if;

  if not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb11_capture_thought(uuid,text,text,timestamptz)',
      'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb11_fetch_thought(uuid,text)',
      'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb11_list_missing_embeddings(text,integer)',
      'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb11_store_embedding(uuid,text,extensions.vector)',
      'execute'
    )
    or not pg_catalog.has_function_privilege(
      'anon',
      'public.ecb11_search_thoughts(text,text,extensions.vector,integer)',
      'execute'
    ) then
    raise exception 'BUILD 11 runtime RPC grant surface incomplete';
  end if;

  if pg_catalog.has_function_privilege(
      'anon',
      'public.ecb11_commission_runtime_key(text)',
      'execute'
    ) then
    raise exception 'BUILD 11 anon role may commission runtime capability';
  end if;
end;
$$;

commit;
