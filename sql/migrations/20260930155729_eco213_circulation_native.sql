-- ECO-213: additive native circulation substrate. STRUCTURAL + AUTHORITY.
-- Default dormant. Source admission confers no semantic standing or authority.
begin;
do $$ begin
  if to_regprocedure('public.ecb11_capture_thought(uuid,text,text,timestamp with time zone,text,uuid)') is null
    or to_regclass('public.text_artifacts') is null then
    raise exception 'eco213_installed_baseline_mismatch';
  end if;
end $$;
create extension if not exists pgmq;
do $$ begin
  if (select extversion from pg_extension where extname='pgmq') <> '1.5.1' then
    raise exception 'eco213_queue_version_requires_requalification';
  end if;
end $$;
select pgmq.create('eco213');
create schema ecb_circulation;
revoke all on schema ecb_circulation from public,anon,authenticated,service_role;

create table ecb_circulation.service_remits (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  label text not null, authority_basis text not null check(length(btrim(authority_basis))>0)
);
create table ecb_circulation.remit_revisions (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  remit_id uuid not null references ecb_circulation.service_remits(id),
  predecessor_id uuid references ecb_circulation.remit_revisions(id),
  authority_basis text not null, allowed_actors text[] not null,
  allowed_sources text[] not null, allowed_legacy_ids uuid[] not null default '{}',
  allowed_effects text[] not null,
  issued_at timestamptz not null default clock_timestamp(), expires_at timestamptz not null,
  max_requests integer not null check(max_requests between 1 and 100),
  max_input integer not null check(max_input between 1 and 16000),
  max_output integer not null check(max_output between 1 and 4000),
  max_usd numeric not null check(max_usd>0 and max_usd<=2),
  check(expires_at>issued_at and expires_at<=issued_at+interval '48 hours'),
  check(cardinality(allowed_actors)>0 and cardinality(allowed_sources)>0),
  unique(id,remit_id)
);
create table ecb_circulation.remit_heads (
  remit_id uuid primary key references ecb_circulation.service_remits(id),
  revision_id uuid not null, enabled boolean not null default false,
  foreign key(revision_id,remit_id) references ecb_circulation.remit_revisions(id,remit_id)
);
create table ecb_circulation.mechanism_editions (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  kind text not null check(kind in ('differentiate','assess','compose','reinspect','embed')),
  code_digest text not null check(code_digest ~ '^[0-9a-f]{64}$'),
  prompt_digest text not null check(prompt_digest ~ '^[0-9a-f]{64}$'),
  schema_digest text not null check(schema_digest ~ '^[0-9a-f]{64}$'),
  model text not null, config jsonb not null, qualification jsonb not null
);
create table ecb_circulation.work_accounts (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  focal_id uuid not null references public.referents(id),
  whole_id uuid references public.referents(id),
  remit_revision_id uuid not null references ecb_circulation.remit_revisions(id),
  predecessor_id uuid references ecb_circulation.work_accounts(id),
  point_of_view text not null, noticed_contrast text not null, boundary text not null,
  orientation text not null, frame text not null, question text not null, intended_use text not null,
  process_coordinate jsonb not null, return_route text not null,
  created_by text not null, created_at timestamptz not null default clock_timestamp()
);
create table ecb_circulation.work_parts (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  work_id uuid not null references ecb_circulation.work_accounts(id),
  constituent_id uuid not null references public.referents(id), role text not null,
  unique(work_id,constituent_id,role)
);
create table ecb_circulation.source_occurrences (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  carrier_id uuid not null references public.referents(id),
  original_carrier_id uuid references public.text_artifacts(id),
  origin text not null, locator text not null, edition text not null,
  digest text not null check(digest ~ '^[0-9a-f]{64}$'),
  envelope_carrier_id uuid references public.text_artifacts(id),
  time_basis jsonb not null, media text not null check(media in ('text/utf8','application/json')),
  unique(origin,locator,edition,digest)
);
create table ecb_circulation.corpus_editions (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  manifest_carrier_id uuid not null references public.text_artifacts(id),
  digest text not null check(digest ~ '^[0-9a-f]{64}$'),
  origin text not null, expected_count integer not null check(expected_count>0),
  frozen_at timestamptz not null, export_basis jsonb not null
);
create table ecb_circulation.corpus_members (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  corpus_id uuid not null references ecb_circulation.corpus_editions(id),
  source_id uuid not null references ecb_circulation.source_occurrences(id),
  legacy_id uuid not null, unique(corpus_id,legacy_id)
);
create table ecb_circulation.activities (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  operation_id uuid not null unique, request_digest text not null,
  work_id uuid not null references ecb_circulation.work_accounts(id),
  source_id uuid not null references ecb_circulation.source_occurrences(id),
  mechanism_id uuid not null references ecb_circulation.mechanism_editions(id),
  predecessor_id uuid references ecb_circulation.activities(id),
  kind text not null check(kind in ('differentiate','assess','compose','reinspect','embed')),
  actor text not null, created_at timestamptz not null default clock_timestamp()
);
create table ecb_circulation.activity_inputs (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  activity_id uuid not null references ecb_circulation.activities(id),
  subject_id uuid not null references public.referents(id), digest text not null, role text not null
);
create table ecb_circulation.processing_heads (
  activity_id uuid primary key references ecb_circulation.activities(id),
  message_id bigint not null unique,
  status text not null check(status in ('pending','leased','complete','failed','blocked')),
  fence bigint not null default 0, attempt_id uuid,
  lease_until timestamptz, due_at timestamptz not null default clock_timestamp(),
  failure_code text
);
create table ecb_circulation.attempts (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  activity_id uuid not null references ecb_circulation.activities(id),
  fence bigint not null, executor text not null, role text not null,
  started_at timestamptz not null, lease_until timestamptz not null,
  unique(activity_id,fence)
);
alter table ecb_circulation.processing_heads add foreign key(attempt_id) references ecb_circulation.attempts(id);
create table ecb_circulation.spend_reservations (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  attempt_id uuid not null unique references ecb_circulation.attempts(id),
  remit_revision_id uuid not null references ecb_circulation.remit_revisions(id),
  worst_usd numeric not null check(worst_usd>=0), tariff jsonb not null,
  input_bound integer not null, output_bound integer not null,
  reserved_at timestamptz not null default clock_timestamp()
);
create table ecb_circulation.attempt_outcomes (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  attempt_id uuid not null unique references ecb_circulation.attempts(id),
  outcome text not null check(outcome in ('complete','failed','retry','blocked')),
  failure_code text, raw_carrier_id uuid references public.text_artifacts(id),
  provider_basis jsonb not null, observed_at timestamptz not null default clock_timestamp()
);
create table ecb_circulation.activity_outputs (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  activity_id uuid not null references ecb_circulation.activities(id),
  attempt_id uuid not null unique references ecb_circulation.attempts(id),
  carrier_id uuid not null references public.text_artifacts(id), digest text not null,
  kind text not null, producer_role text not null, created_at timestamptz not null default clock_timestamp()
);
create table ecb_circulation.decompositions (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  output_id uuid not null references ecb_circulation.activity_outputs(id),
  source_id uuid not null references ecb_circulation.source_occurrences(id),
  resolution text not null, context jsonb not null, omissions jsonb not null,
  losses jsonb not null, questions jsonb not null
);
create table ecb_circulation.semantic_units (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  decomposition_id uuid not null references ecb_circulation.decompositions(id),
  carrier_id uuid not null references public.text_artifacts(id),
  handle text not null, subject_id uuid references public.referents(id),
  subject_status text not null check(subject_status in ('identified','UNKNOWN')),
  modality text not null check(modality in ('desired','performed','reported','hypothetical','question','UNKNOWN')),
  polarity text not null check(polarity in ('positive','negative','UNKNOWN')),
  attribution text not null, conditions jsonb not null,
  check((subject_id is null)=(subject_status='UNKNOWN')), unique(decomposition_id,handle)
);
create table ecb_circulation.unit_participants (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  unit_id uuid not null references ecb_circulation.semantic_units(id),
  role text not null, mention text not null, subject_id uuid references public.referents(id),
  identity_status text not null check(identity_status in ('identified','UNKNOWN')),
  check((subject_id is null)=(identity_status='UNKNOWN'))
);
create table ecb_circulation.source_anchors (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  unit_id uuid not null references ecb_circulation.semantic_units(id),
  source_id uuid not null references ecb_circulation.source_occurrences(id),
  carrier_id uuid not null references public.referents(id),
  byte_start integer not null check(byte_start>=0), byte_end integer not null,
  excerpt text not null, digest text not null, check(byte_end>byte_start)
);
create table ecb_circulation.claim_contexts (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  claim_id uuid not null references public.claims(id),
  unit_id uuid references ecb_circulation.semantic_units(id),
  output_id uuid not null references ecb_circulation.activity_outputs(id),
  work_id uuid not null references ecb_circulation.work_accounts(id),
  modality text not null, attribution text not null, conditions jsonb not null
);
create table ecb_circulation.composition_accounts (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  output_id uuid not null references ecb_circulation.activity_outputs(id),
  work_id uuid not null references ecb_circulation.work_accounts(id),
  focal_id uuid not null references public.referents(id),
  organizing_criterion text not null, carrier_id uuid not null references public.text_artifacts(id),
  old_dependency_review jsonb not null, destination_disclosure jsonb not null,
  unresolved jsonb not null, reinspection_questions jsonb not null
);
create table ecb_circulation.composition_members (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  account_id uuid not null references ecb_circulation.composition_accounts(id),
  constituent_id uuid not null references public.referents(id), reason text not null,
  basis_digest text not null, unique(account_id,constituent_id)
);
create table ecb_circulation.account_lineage (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  predecessor_id uuid not null references public.referents(id),
  successor_id uuid not null references public.referents(id),
  activity_id uuid references ecb_circulation.activities(id),
  relation text not null check(relation in ('alternative','repair','reinspection','reseating')),
  reason text not null, check(predecessor_id<>successor_id)
);
create table ecb_circulation.use_assessments (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  operation_id uuid not null unique, request_digest text not null,
  work_id uuid not null references ecb_circulation.work_accounts(id), use_key text not null,
  account_id uuid not null references ecb_circulation.composition_accounts(id),
  predecessor_id uuid references ecb_circulation.use_assessments(id),
  remit_revision_id uuid not null references ecb_circulation.remit_revisions(id),
  work_epoch text not null, coverage jsonb not null,
  authority_basis text not null, checker_basis jsonb not null, actor text not null,
  verdict text not null check(verdict in ('SATISFIED','UNSATISFIED','UNKNOWN')),
  assessed_at timestamptz not null default clock_timestamp()
);
create table ecb_circulation.dependency_bases (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  assessment_id uuid not null references ecb_circulation.use_assessments(id),
  subject_id uuid not null references public.referents(id),
  digest text not null, work_epoch text not null, role text not null
);
create table ecb_circulation.requirement_dispositions (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  assessment_id uuid not null references ecb_circulation.use_assessments(id),
  requirement text not null, direction text not null check(direction in ('old_dependency','destination_discovery')),
  blocking boolean not null, disposition text not null check(disposition in ('SATISFIED','UNSATISFIED','UNKNOWN')),
  basis jsonb not null
);
create table ecb_circulation.use_heads (
  work_id uuid not null references ecb_circulation.work_accounts(id), use_key text not null,
  assessment_id uuid not null references ecb_circulation.use_assessments(id),
  primary key(work_id,use_key)
);
create table ecb_circulation.semantic_representations (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  subject_id uuid not null references public.referents(id),
  work_id uuid not null references ecb_circulation.work_accounts(id),
  basis_digest text not null, edition text not null, content text not null,
  vector extensions.vector(384), model text,
  lexical tsvector generated always as (to_tsvector('simple'::regconfig,content)) stored,
  created_at timestamptz not null default clock_timestamp(),
  check((vector is null and model is null) or (vector is not null and model='gte-small'))
);
create index eco213_lexical on ecb_circulation.semantic_representations using gin(lexical);
create index eco213_rep_subject on ecb_circulation.semantic_representations(subject_id,created_at);
create table ecb_circulation.observations (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  operation_id uuid not null unique, request_digest text not null,
  subject_id uuid not null references public.referents(id),
  work_id uuid not null references ecb_circulation.work_accounts(id),
  mapper text not null, method_edition text not null,
  result_carrier_id uuid not null references public.text_artifacts(id),
  time_basis jsonb not null, frame text not null, resolution text not null, purpose text not null,
  conditions jsonb not null, unknowns jsonb not null,
  kind text not null check(kind in ('observation','measurement','independent_reuse','reported_outcome','repeated_capture')),
  quantity numeric, unit text, instrument_id uuid references public.referents(id),
  tare jsonb, calibration jsonb, uncertainty jsonb,
  check(kind<>'measurement' or (quantity is not null and unit is not null and instrument_id is not null
    and tare is not null and calibration is not null and uncertainty is not null))
);
create table ecb_circulation.observation_participants (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  observation_id uuid not null references ecb_circulation.observations(id),
  subject_id uuid not null references public.referents(id), role text not null
);
create table ecb_circulation.liveness_observations (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  observer text not null, event text not null, basis jsonb not null,
  observed_at timestamptz not null default clock_timestamp(), expires_at timestamptz not null
);
create table ecb_circulation.execution_credentials (
  id uuid primary key default gen_random_uuid() references public.referents(id),
  worker text not null unique, key_digest bytea not null check(octet_length(key_digest)=32),
  remit_revision_id uuid not null references ecb_circulation.remit_revisions(id), enabled boolean not null default false
);

create function ecb_circulation.register_identity() returns trigger language plpgsql
set search_path='' as $$ begin insert into public.referents(id) values(new.id); return new; end $$;
create function ecb_circulation.immutable() returns trigger language plpgsql
set search_path='' as $$ begin raise exception 'eco213_immutable' using errcode='55000'; end $$;
do $$ declare t record; begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='ecb_circulation' and c.relkind='r' loop
    execute format('alter table ecb_circulation.%I enable row level security',t.relname);
    execute format('revoke all on ecb_circulation.%I from public,anon,authenticated,service_role',t.relname);
    if t.relname not in ('remit_heads','processing_heads','use_heads') then
      execute format('create trigger identity before insert on ecb_circulation.%I for each row execute function ecb_circulation.register_identity()',t.relname);
    end if;
    if t.relname not in ('remit_heads','processing_heads','use_heads','execution_credentials') then
      execute format('create trigger immutable before update or delete on ecb_circulation.%I for each row execute function ecb_circulation.immutable()',t.relname);
    end if;
  end loop;
end $$;

create function ecb_circulation.sha(p_text text) returns text language sql immutable set search_path=''
as $$ select encode(extensions.digest(convert_to(p_text,'UTF8'),'sha256'),'hex') $$;
create function ecb_circulation.artifact(p_content text) returns uuid language plpgsql set search_path=''
as $$ declare v uuid:=gen_random_uuid(); begin insert into public.text_artifacts(id,content) values(v,p_content);return v;end $$;
create function ecb_circulation.carrier_text(p_id uuid) returns text language plpgsql set search_path=''
as $$ declare s text;begin
  select content into s from public.text_artifacts where id=p_id;
  if found then return s;end if;
  select content into strict s from public.thoughts where id=p_id; return s;
end $$;
create function ecb_circulation.assert_remit(p_revision uuid,p_actor text,p_origin text default null,p_locator text default null,p_effect text default null)
returns ecb_circulation.remit_revisions language plpgsql set search_path=''
as $$ declare r ecb_circulation.remit_revisions;begin
  select v.* into strict r from ecb_circulation.remit_revisions v join ecb_circulation.remit_heads h
    on h.revision_id=v.id and h.remit_id=v.remit_id where v.id=p_revision and h.enabled for share of h;
  if r.expires_at<=clock_timestamp() or not p_actor=any(r.allowed_actors)
    or (p_effect is not null and not p_effect=any(r.allowed_effects))
    or (p_origin is not null and not p_origin=any(r.allowed_sources)) then raise exception 'eco213_remit_denied';end if;
  if p_origin='legacy:lqbrzoicorehwidkdhoi' and (p_locator is null or not p_locator::uuid=any(r.allowed_legacy_ids)) then raise exception 'eco213_cohort_denied';end if;
  return r;
exception when no_data_found then raise exception 'eco213_remit_inactive';end $$;
create function ecb_circulation.assert_worker() returns ecb_circulation.execution_credentials language plpgsql set search_path=''
as $$ declare c ecb_circulation.execution_credentials; h jsonb; k text;begin
  h:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}');k:=h->>'x-eco213-worker-key';
  select * into c from ecb_circulation.execution_credentials where enabled and key_digest=extensions.digest(convert_to(coalesce(k,''),'UTF8'),'sha256');
  if not found or length(coalesce(k,''))<32 then raise exception 'eco213_worker_unauthorized';end if;
  perform ecb_circulation.assert_remit(c.remit_revision_id,c.worker,null,null,'execute'); return c;
end $$;
create function ecb_circulation.enqueue(p_operation uuid,p_work uuid,p_source uuid,p_mechanism uuid,p_actor text,p_predecessor uuid default null)
returns uuid language plpgsql set search_path=''
as $$ declare a ecb_circulation.activities; w ecb_circulation.work_accounts; s ecb_circulation.source_occurrences;
  m ecb_circulation.mechanism_editions; d text; v uuid:=gen_random_uuid(); msg bigint; begin
  select * into strict w from ecb_circulation.work_accounts where id=p_work;
  select * into strict s from ecb_circulation.source_occurrences where id=p_source;
  select * into strict m from ecb_circulation.mechanism_editions where id=p_mechanism;
  perform ecb_circulation.assert_remit(w.remit_revision_id,p_actor,s.origin,s.locator,'process');
  if p_predecessor is not null and not exists(select 1 from ecb_circulation.activities prior where prior.id=p_predecessor
    and (prior.work_id=w.id or prior.work_id=w.predecessor_id)) then raise exception 'eco213_predecessor_scope_denied';end if;
  d:=ecb_circulation.sha(jsonb_build_array(p_work,p_source,p_mechanism,p_actor,p_predecessor)::text);
  perform pg_advisory_xact_lock(hashtextextended(p_operation::text,213));
  select * into a from ecb_circulation.activities where operation_id=p_operation;
  if found then if a.request_digest<>d then raise exception 'eco213_operation_conflict';end if;return a.id;end if;
  insert into ecb_circulation.activities(id,operation_id,request_digest,work_id,source_id,mechanism_id,predecessor_id,kind,actor)
    values(v,p_operation,d,p_work,p_source,p_mechanism,p_predecessor,m.kind,p_actor);
  insert into ecb_circulation.activity_inputs(activity_id,subject_id,digest,role) values(v,s.id,s.digest,'source');
  if p_predecessor is not null then insert into ecb_circulation.activity_inputs(activity_id,subject_id,digest,role)
    values(v,p_predecessor,ecb_circulation.referent_digest(p_predecessor),'predecessor activity');end if;
  select pgmq.send('eco213',jsonb_build_object('activity_id',v)) into msg;
  insert into ecb_circulation.processing_heads(activity_id,message_id,status) values(v,msg,'pending'); return v;
end $$;
revoke all on all functions in schema ecb_circulation from public,anon,authenticated,service_role;
commit;
