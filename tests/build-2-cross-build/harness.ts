import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const REGISTERED_ONLY = "2eede0e4-b27a-4383-850e-a448f0113c9f";
const ABSENT = "ce654422-bb4f-4c6b-bf3d-e32b3dd10e8f";
const FAILED_CAPTURE = "09eb6cc9-b204-4a6d-a1a4-b62fafcf8141";
const NEW_CAPTURE = "93d06071-b8aa-4b2d-b20d-99d2d6fc1ed7";

const configuredConnectionString = Deno.env.get("POSTGRES_URL")?.trim();
if (!configuredConnectionString) throw new Error("POSTGRES_URL is required");
const connectionString: string = configuredConnectionString;

type Sql = ReturnType<typeof postgres>;

function connect(): Sql {
  return postgres(connectionString, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 10,
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function codeOf(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  return String(error.code);
}

async function verifyRegistryShape(sql: Sql): Promise<void> {
  const columns = await sql<
    {
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    select column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public' and table_name = 'referents'
    order by ordinal_position
  `;
  assert(columns.length === 2, "Referent registry is no longer identity-only");
  assert(
    columns[0].column_name === "id" && columns[0].data_type === "uuid" &&
      columns[0].is_nullable === "NO" && columns[0].column_default === null,
    "referents.id shape drifted",
  );
  assert(
    columns[1].column_name === "registered_at" &&
      columns[1].data_type === "timestamp with time zone" &&
      columns[1].is_nullable === "NO" &&
      columns[1].column_default?.includes("transaction_timestamp()"),
    "referents.registered_at shape drifted",
  );

  const [registry] = await sql<
    { rls: boolean; policies: string; primary_key: boolean }[]
  >`
    select
      class.relrowsecurity as rls,
      (select count(*) from pg_policies where schemaname = 'public' and tablename = 'referents')::text as policies,
      exists(
        select 1 from pg_constraint
        where conrelid = 'public.referents'::regclass
          and contype = 'p'
          and pg_get_constraintdef(oid) = 'PRIMARY KEY (id)'
      ) as primary_key
    from pg_class as class
    where class.oid = 'public.referents'::regclass
  `;
  assert(
    registry.rls && registry.policies === "0" && registry.primary_key,
    "Referent RLS, policy, or primary-key boundary drifted",
  );

  const [grants] = await sql<
    {
      service_select: boolean;
      service_table_insert: boolean;
      service_id_insert: boolean;
      service_time_insert: boolean;
      service_update: boolean;
      service_delete: boolean;
      client_access: boolean;
    }[]
  >`
    select
      has_table_privilege('service_role', 'public.referents', 'select') as service_select,
      has_table_privilege('service_role', 'public.referents', 'insert') as service_table_insert,
      has_column_privilege('service_role', 'public.referents', 'id', 'insert') as service_id_insert,
      has_column_privilege('service_role', 'public.referents', 'registered_at', 'insert') as service_time_insert,
      has_table_privilege('service_role', 'public.referents', 'update') as service_update,
      has_table_privilege('service_role', 'public.referents', 'delete') as service_delete,
      exists(
        select 1 from pg_roles as role
        where role.rolname in ('anon', 'authenticated') and (
          has_any_column_privilege(role.rolname, 'public.referents', 'select, insert, update')
          or has_table_privilege(role.rolname, 'public.referents', 'delete')
        )
      ) as client_access
  `;
  assert(
    grants.service_select && !grants.service_table_insert &&
      grants.service_id_insert && !grants.service_time_insert &&
      !grants.service_update && !grants.service_delete &&
      !grants.client_access,
    "Referent privileges are weaker than accepted BUILD 2",
  );
}

async function verifyThoughtCoupling(sql: Sql): Promise<void> {
  const foreignKeys = await sql<
    {
      deferrable: boolean;
      initially_deferred: boolean;
      update_action: string;
      delete_action: string;
      definition: string;
    }[]
  >`
    select
      condeferrable as deferrable,
      condeferred as initially_deferred,
      confupdtype::text as update_action,
      confdeltype::text as delete_action,
      pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid = 'public.thoughts'::regclass
      and confrelid = 'public.referents'::regclass
      and contype = 'f'
  `;
  assert(
    foreignKeys.length === 1,
    "Thought-to-Referent coupling count drifted",
  );
  const foreignKey = foreignKeys[0];
  assert(
    !foreignKey.deferrable && !foreignKey.initially_deferred &&
      foreignKey.update_action === "r" && foreignKey.delete_action === "r" &&
      foreignKey.definition.includes(
        "FOREIGN KEY (id) REFERENCES referents(id)",
      ) &&
      foreignKey.definition.includes("ON UPDATE RESTRICT") &&
      foreignKey.definition.includes("ON DELETE RESTRICT"),
    "Thought-to-Referent coupling semantics drifted",
  );

  const triggers = await sql<
    {
      definition: string;
      function_name: string;
      security_definer: boolean;
      settings: string[] | null;
      function_definition: string;
      public_execute: boolean;
      anon_execute: boolean;
      authenticated_execute: boolean;
    }[]
  >`
    select
      pg_get_triggerdef(trigger.oid) as definition,
      procedure.proname as function_name,
      procedure.prosecdef as security_definer,
      procedure.proconfig as settings,
      pg_get_functiondef(procedure.oid) as function_definition,
      exists(
        select 1 from aclexplode(coalesce(procedure.proacl, acldefault('f', procedure.proowner))) as privilege
        where privilege.grantee = 0 and privilege.privilege_type = 'EXECUTE'
      ) as public_execute,
      has_function_privilege('anon', procedure.oid, 'execute') as anon_execute,
      has_function_privilege('authenticated', procedure.oid, 'execute') as authenticated_execute
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.thoughts'::regclass
      and not trigger.tgisinternal
  `;
  assert(triggers.length === 1, "Thought registration trigger count drifted");
  const trigger = triggers[0];
  assert(
    trigger.definition.includes(
      "BEFORE INSERT ON public.thoughts FOR EACH ROW",
    ) &&
      trigger.function_name === "register_thought_referent" &&
      !trigger.security_definer &&
      trigger.settings?.includes('search_path=""') &&
      trigger.function_definition.toLowerCase().includes(
        "insert into public.referents (id)",
      ) &&
      !trigger.function_definition.toLowerCase().includes("on conflict") &&
      !trigger.public_execute && !trigger.anon_execute &&
      !trigger.authenticated_execute,
    "Thought registration trigger behavior or authorization drifted",
  );
}

async function verifyFixturesAndExactUuidSemantics(sql: Sql): Promise<void> {
  const [gt01] = await sql<
    {
      content: string;
      source: string;
      captured_at_preserved: boolean;
      embedding_model: string;
      dimensions: number;
      referent_present: boolean;
    }[]
  >`
    select
      thought.content,
      thought.source,
      thought.captured_at = '2026-09-04T00:12:35.225093+00:00'::timestamptz as captured_at_preserved,
      thought.embedding_model,
      extensions.vector_dims(thought.embedding) as dimensions,
      referent.id is not null as referent_present
    from public.thoughts as thought
    left join public.referents as referent on referent.id = thought.id
    where thought.id = ${GT01}::uuid
  `;
  assert(
    gt01?.content ===
        "GT01: The brass heron waits beneath the violet staircase." &&
      gt01.source === "golden_trace_01" && gt01.captured_at_preserved &&
      gt01.embedding_model === "gte-small" && gt01.dimensions === 384 &&
      gt01.referent_present,
    "GT01 BUILD 0/2 state drifted",
  );

  const rows = await sql<
    { id: string; registered: boolean; thought_present: boolean }[]
  >`
    select
      probe.id::text,
      referent.id is not null as registered,
      thought.id is not null as thought_present
    from unnest(array[
      ${GT01}::uuid,
      ${REGISTERED_ONLY}::uuid,
      ${ABSENT}::uuid
    ]) as probe(id)
    left join public.referents as referent on referent.id = probe.id
    left join public.thoughts as thought on thought.id = probe.id
    order by probe.id
  `;
  const byId = new Map(rows.map((row) => [row.id, row]));
  assert(
    byId.get(GT01)?.registered && byId.get(GT01)?.thought_present,
    "GT01 is not exact-UUID R=1,T=1",
  );
  assert(
    byId.get(REGISTERED_ONLY)?.registered &&
      !byId.get(REGISTERED_ONLY)?.thought_present,
    "registered-only fixture is not exact-UUID R=1,T=0",
  );
  assert(
    !byId.get(ABSENT)?.registered && !byId.get(ABSENT)?.thought_present,
    "absent probe is not exact-UUID R=0,T=0",
  );

  const [semanticAbsence] = await sql<
    {
      claim_absent: boolean;
      link_absent: boolean;
      semantic_registry_columns_absent: boolean;
    }[]
  >`
    select
      not exists(select 1 from public.claims where id = ${REGISTERED_ONLY}::uuid) as claim_absent,
      not exists(
        select 1 from public.evidence_links
        where id = ${REGISTERED_ONLY}::uuid
          or evidence_referent_id = ${REGISTERED_ONLY}::uuid
      ) as link_absent,
      not exists(
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'referents'
          and column_name not in ('id', 'registered_at')
      ) as semantic_registry_columns_absent
  `;
  assert(
    semanticAbsence.claim_absent && semanticAbsence.link_absent &&
      semanticAbsence.semantic_registry_columns_absent,
    "registered-only fixture acquired semantic standing or native refinement",
  );
}

async function verifyNoResolverOrRefinementSurface(sql: Sql): Promise<void> {
  const views = await sql<{ name: string }[]>`
    select table_name as name from information_schema.views
    where table_schema = 'public'
  `;
  assert(views.length === 0, "a BUILD 2 SQL resolver/view appeared");

  const suspiciousFunctions = await sql<{ name: string }[]>`
    select procedure.proname as name
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname <> 'register_thought_referent'
      and procedure.proname ~* '(resolve|coreference|co_reference|native_binding|refine_referent)'
  `;
  assert(
    suspiciousFunctions.length === 0,
    "a Referent resolver, co-reference, native-binding, or refinement function appeared",
  );
}

async function verifyAtomicThoughtCapture(sql: Sql): Promise<void> {
  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.thoughts (id, content, source, embedding, embedding_model)
      values (
        ${NEW_CAPTURE}::uuid,
        'BUILD 2 cross-build atomic capture probe',
        'build_2_cross_build_probe',
        array_fill(0::real, array[384])::extensions.vector,
        'gte-small'
      )
    `;
    const [inside] = await sql<
      { thought_present: boolean; referent_present: boolean }[]
    >`
      select
        exists(select 1 from public.thoughts where id = ${NEW_CAPTURE}::uuid) as thought_present,
        exists(select 1 from public.referents where id = ${NEW_CAPTURE}::uuid) as referent_present
    `;
    assert(
      inside.thought_present && inside.referent_present,
      "new direct Thought capture did not atomically register its Referent",
    );
  } finally {
    await sql.unsafe("rollback").catch(() => undefined);
  }
}

async function verifyFailedCaptureRollback(sql: Sql): Promise<void> {
  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    try {
      await sql`
        insert into public.thoughts (id, content, source, embedding, embedding_model)
        values (
          ${FAILED_CAPTURE}::uuid,
          '',
          'build_2_cross_build_failed_probe',
          array_fill(0::real, array[384])::extensions.vector,
          'gte-small'
        )
      `;
      throw new Error("expected failed Thought capture SQLSTATE 23514");
    } catch (error) {
      if (codeOf(error) !== "23514") throw error;
    }
  } finally {
    await sql.unsafe("rollback").catch(() => undefined);
  }

  const [residue] = await sql<
    {
      failed_thought: boolean;
      failed_referent: boolean;
      new_thought: boolean;
      new_referent: boolean;
    }[]
  >`
    select
      exists(select 1 from public.thoughts where id = ${FAILED_CAPTURE}::uuid) as failed_thought,
      exists(select 1 from public.referents where id = ${FAILED_CAPTURE}::uuid) as failed_referent,
      exists(select 1 from public.thoughts where id = ${NEW_CAPTURE}::uuid) as new_thought,
      exists(select 1 from public.referents where id = ${NEW_CAPTURE}::uuid) as new_referent
  `;
  assert(
    !residue.failed_thought && !residue.failed_referent &&
      !residue.new_thought && !residue.new_referent,
    "cross-build Thought probes left canonical residue",
  );
}

const sql = connect();
try {
  await sql.unsafe("set time zone 'UTC'");
  await verifyRegistryShape(sql);
  await verifyThoughtCoupling(sql);
  await verifyFixturesAndExactUuidSemantics(sql);
  await verifyNoResolverOrRefinementSurface(sql);
  await verifyAtomicThoughtCapture(sql);
  await verifyFailedCaptureRollback(sql);

  console.log(JSON.stringify({
    suite: "build-2-cross-build-regression",
    result: "PASS",
    checks: [
      "identity-only-registry-shape",
      "same-uuid-thought-coupling",
      "thought-registration-trigger-preserved",
      "atomic-new-thought-registration",
      "failed-thought-capture-rollback",
      "registered-only-fixture-unrefined",
      "gt01-preserved",
      "referent-least-privilege-not-weakened",
      "exact-uuid-observation-semantics",
      "no-resolver-coreference-or-native-refinement",
      "probe-residue-absent",
    ],
  }));
} finally {
  await sql.end();
}
