-- BUILD 2 — Universal Referents
-- One atomic activation of the identity-only registry and Thought coupling.

begin;

lock table public.thoughts in share row exclusive mode;

create table public.referents (
  id uuid primary key,
  registered_at timestamptz not null default transaction_timestamp()
);

create function public.register_thought_referent()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.referents (id)
  values (new.id);

  return new;
end;
$$;

revoke all on function public.register_thought_referent()
  from public, anon, authenticated;

create trigger thoughts_register_referent
before insert on public.thoughts
for each row
execute function public.register_thought_referent();

insert into public.referents (id)
select thought.id
from public.thoughts as thought;

insert into public.referents (id)
values ('2eede0e4-b27a-4383-850e-a448f0113c9f');

alter table public.thoughts
  add constraint thoughts_referent_fkey
  foreign key (id)
  references public.referents (id)
  on update restrict
  on delete restrict
  not deferrable;

alter table public.referents enable row level security;

revoke all on table public.referents
  from public, anon, authenticated, service_role;

grant select on table public.referents to service_role;
grant insert (id) on table public.referents to service_role;

do $$
declare
  referent_column_count integer;
  referent_policy_count integer;
  uncoupled_thought_count integer;
begin
  select count(*)
  into referent_column_count
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'referents';

  if referent_column_count <> 2 then
    raise exception 'BUILD 2 activation produced % referent columns', referent_column_count;
  end if;

  select count(*)
  into referent_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'referents';

  if referent_policy_count <> 0 then
    raise exception 'BUILD 2 activation produced % referent policies', referent_policy_count;
  end if;

  select count(*)
  into uncoupled_thought_count
  from public.thoughts as thought
  left join public.referents as referent on referent.id = thought.id
  where referent.id is null;

  if uncoupled_thought_count <> 0 then
    raise exception 'BUILD 2 activation left % uncoupled thoughts', uncoupled_thought_count;
  end if;

  if not has_table_privilege('service_role', 'public.referents', 'select')
    or exists (
      select 1
      from information_schema.role_table_grants
      where grantee = 'service_role'
        and table_schema = 'public'
        and table_name = 'referents'
        and privilege_type = 'INSERT'
    )
    or has_table_privilege('service_role', 'public.referents', 'update')
    or has_table_privilege('service_role', 'public.referents', 'delete')
    or not has_column_privilege('service_role', 'public.referents', 'id', 'insert')
    or has_column_privilege('service_role', 'public.referents', 'registered_at', 'insert') then
    raise exception 'BUILD 2 activation produced an invalid service-role registry grant';
  end if;
end;
$$;

commit;
