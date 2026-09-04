-- BUILD 0 — Clean OB1 Kernel
-- STRUCTURAL / schema constraint: one complete canonical thought record.

create extension if not exists vector with schema extensions;

create table public.thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text not null,
  captured_at timestamptz not null default now(),
  embedding extensions.vector(384) not null,
  embedding_model text not null default 'gte-small',

  constraint thoughts_content_nonempty
    check (length(btrim(content)) > 0),
  constraint thoughts_source_nonempty
    check (length(btrim(source)) > 0),
  constraint thoughts_embedding_model_gte_small
    check (embedding_model = 'gte-small')
);

comment on table public.thoughts is
  'BUILD 0 atomic evidence records. Capture does not promote a thought into governance standing.';

alter table public.thoughts enable row level security;

revoke all on table public.thoughts from anon, authenticated;
grant select, insert on table public.thoughts to service_role;

create function public.search_thoughts(
  query_embedding extensions.vector(384),
  match_count integer default 10
)
returns table (
  id uuid,
  content text,
  source text,
  captured_at timestamptz,
  embedding_model text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    thought.id,
    thought.content,
    thought.source,
    thought.captured_at,
    thought.embedding_model,
    1 - (
      thought.embedding operator(extensions.<=>) query_embedding
    ) as similarity
  from public.thoughts as thought
  order by
    thought.embedding operator(extensions.<=>) query_embedding,
    thought.id
  limit least(greatest(coalesce(match_count, 10), 1), 100);
$$;

revoke all on function public.search_thoughts(extensions.vector, integer)
  from public, anon, authenticated;
grant execute on function public.search_thoughts(extensions.vector, integer)
  to service_role;
