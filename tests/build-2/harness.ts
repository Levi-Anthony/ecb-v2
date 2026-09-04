import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const REGISTERED_ONLY = "2eede0e4-b27a-4383-850e-a448f0113c9f";
const ABSENT = "ce654422-bb4f-4c6b-bf3d-e32b3dd10e8f";
const ROLLBACK_PROBE = "09eb6cc9-b204-4a6d-a1a4-b62fafcf8141";
const CONCURRENCY_PROBE = "93d06071-b8aa-4b2d-b20d-99d2d6fc1ed7";

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

async function expectSqlState(
  sql: Sql,
  statement: () => Promise<unknown>,
  expectedCode: string,
): Promise<void> {
  await sql.unsafe("begin");
  try {
    await statement();
    throw new Error(`expected SQLSTATE ${expectedCode}`);
  } catch (error) {
    if (codeOf(error) !== expectedCode) throw error;
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyStaticShape(sql: Sql): Promise<void> {
  const tables = await sql<{ table_name: string }[]>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `;
  assert(
    JSON.stringify(tables.map((row) => row.table_name)) ===
      JSON.stringify(["referents", "thoughts"]),
    "public table surface drifted",
  );

  const views = await sql<{ table_name: string }[]>`
    select table_name
    from information_schema.views
    where table_schema = 'public'
    order by table_name
  `;
  assert(views.length === 0, "BUILD 2 added a persistent public view");

  const functions = await sql<{ function_name: string }[]>`
    select procedure.proname as function_name
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
    order by procedure.proname, procedure.oid
  `;
  assert(
    JSON.stringify(functions.map((row) => row.function_name)) ===
      JSON.stringify(["register_thought_referent", "search_thoughts"]),
    "public function surface drifted",
  );

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
    where table_schema = 'public'
      and table_name = 'referents'
    order by ordinal_position
  `;
  assert(columns.length === 2, "referents must have exactly two columns");
  assert(
    columns[0].column_name === "id" &&
      columns[0].data_type === "uuid" &&
      columns[0].is_nullable === "NO" &&
      columns[0].column_default === null,
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
    { rls_enabled: boolean; policy_count: string; primary_key: boolean }[]
  >`
    select
      class.relrowsecurity as rls_enabled,
      (
        select count(*)
        from pg_policies
        where schemaname = 'public' and tablename = 'referents'
      )::text as policy_count,
      exists (
        select 1
        from pg_constraint
        where conrelid = 'public.referents'::regclass
          and contype = 'p'
          and pg_get_constraintdef(oid) = 'PRIMARY KEY (id)'
      ) as primary_key
    from pg_class as class
    where class.oid = 'public.referents'::regclass
  `;
  assert(registry.rls_enabled, "referents RLS is not enabled");
  assert(registry.policy_count === "0", "referents must have no RLS policy");
  assert(registry.primary_key, "referents.id primary key is absent");

  const foreignKeys = await sql<
    {
      condeferrable: boolean;
      condeferred: boolean;
      update_action: string;
      delete_action: string;
      definition: string;
    }[]
  >`
    select
      condeferrable,
      condeferred,
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
    "expected one Thought-to-Referent foreign key",
  );
  const foreignKey = foreignKeys[0];
  assert(
    !foreignKey.condeferrable && !foreignKey.condeferred,
    "foreign key must be immediate",
  );
  assert(
    foreignKey.update_action === "r" && foreignKey.delete_action === "r",
    "foreign key must reject parent update and deletion",
  );
  assert(
    foreignKey.definition.includes(
      "FOREIGN KEY (id) REFERENCES referents(id)",
    ) &&
      foreignKey.definition.includes("ON UPDATE RESTRICT") &&
      foreignKey.definition.includes("ON DELETE RESTRICT"),
    "foreign key is not same-UUID restrictive coupling",
  );

  const triggers = await sql<
    {
      definition: string;
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
      procedure.prosecdef as security_definer,
      procedure.proconfig as settings,
      pg_get_functiondef(procedure.oid) as function_definition,
      exists (
        select 1
        from aclexplode(coalesce(procedure.proacl, acldefault('f', procedure.proowner))) as privilege
        where privilege.grantee = 0 and privilege.privilege_type = 'EXECUTE'
      ) as public_execute,
      has_function_privilege('anon', procedure.oid, 'execute') as anon_execute,
      has_function_privilege('authenticated', procedure.oid, 'execute') as authenticated_execute
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.thoughts'::regclass
      and not trigger.tgisinternal
  `;
  assert(triggers.length === 1, "expected one custom Thought trigger");
  const trigger = triggers[0];
  assert(
    trigger.definition.includes(
      "BEFORE INSERT ON public.thoughts FOR EACH ROW",
    ),
    "Thought registration trigger timing or level drifted",
  );
  assert(
    !trigger.security_definer,
    "Thought registration function must be SECURITY INVOKER",
  );
  assert(
    trigger.settings?.includes('search_path=""'),
    "Thought registration function search_path is not empty",
  );
  assert(
    trigger.function_definition.toLowerCase().includes(
      "insert into public.referents (id)",
    ) &&
      !trigger.function_definition.toLowerCase().includes("on conflict"),
    "Thought registration function body drifted",
  );
  assert(
    !trigger.public_execute && !trigger.anon_execute &&
      !trigger.authenticated_execute,
    "Thought registration function is directly executable by a client role",
  );

  const [grants] = await sql<
    {
      service_select: boolean;
      service_table_insert: boolean;
      service_id_insert: boolean;
      service_time_insert: boolean;
      service_update: boolean;
      service_delete: boolean;
      anon_access: boolean;
      authenticated_access: boolean;
    }[]
  >`
    select
      has_table_privilege('service_role', 'public.referents', 'select') as service_select,
      has_table_privilege('service_role', 'public.referents', 'insert') as service_table_insert,
      has_column_privilege('service_role', 'public.referents', 'id', 'insert') as service_id_insert,
      has_column_privilege('service_role', 'public.referents', 'registered_at', 'insert') as service_time_insert,
      has_table_privilege('service_role', 'public.referents', 'update') as service_update,
      has_table_privilege('service_role', 'public.referents', 'delete') as service_delete,
      has_any_column_privilege('anon', 'public.referents', 'select, insert, update')
        or has_table_privilege('anon', 'public.referents', 'delete') as anon_access,
      has_any_column_privilege('authenticated', 'public.referents', 'select, insert, update')
        or has_table_privilege('authenticated', 'public.referents', 'delete') as authenticated_access
  `;
  assert(grants.service_select, "service_role lacks registry SELECT");
  assert(
    !grants.service_table_insert,
    "service_role has table-level registry INSERT",
  );
  assert(grants.service_id_insert, "service_role lacks registry INSERT(id)");
  assert(!grants.service_time_insert, "service_role can supply registered_at");
  assert(
    !grants.service_update && !grants.service_delete,
    "service_role can mutate registry identity",
  );
  assert(
    !grants.anon_access && !grants.authenticated_access,
    "client role can access registry",
  );
}

async function verifyExactUuidObservations(sql: Sql): Promise<void> {
  const [gt01] = await sql<
    {
      content: string;
      source: string;
      captured_at_preserved: boolean;
      embedding_model: string;
      dimensions: number;
    }[]
  >`
    select
      content,
      source,
      captured_at = '2026-09-04T00:12:35.225093+00:00'::timestamptz as captured_at_preserved,
      embedding_model,
      extensions.vector_dims(embedding) as dimensions
    from public.thoughts
    where id = ${GT01}::uuid
  `;
  assert(gt01 !== undefined, "GT01 Thought is absent");
  assert(
    gt01.content ===
        "GT01: The brass heron waits beneath the violet staircase." &&
      gt01.source === "golden_trace_01" &&
      gt01.captured_at_preserved &&
      gt01.embedding_model === "gte-small" &&
      gt01.dimensions === 384,
    "GT01 content or provenance drifted",
  );

  const rows = await sql<
    {
      id: string;
      registered: boolean;
      thought_present: boolean;
      registered_at: string | null;
    }[]
  >`
    select
      probe.id::text,
      referent.id is not null as registered,
      thought.id is not null as thought_present,
      referent.registered_at::text
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
    "GT01 is not R=1,T=1",
  );
  assert(
    byId.get(REGISTERED_ONLY)?.registered &&
      !byId.get(REGISTERED_ONLY)?.thought_present,
    "registered-only fixture is not R=1,T=0",
  );
  assert(
    !byId.get(ABSENT)?.registered && !byId.get(ABSENT)?.thought_present,
    "absent probe is not R=0,T=0",
  );
  assert(
    byId.get(GT01)?.registered_at === byId.get(REGISTERED_ONLY)?.registered_at,
    "activation registrations do not share one transaction time",
  );

  const [counts] = await sql<{ referents: string; thoughts: string }[]>`
    select
      (select count(*) from public.referents)::text as referents,
      (select count(*) from public.thoughts)::text as thoughts
  `;
  assert(
    Number(counts.referents) === Number(counts.thoughts) + 1,
    "registry contains state beyond all Thoughts plus the registered-only fixture",
  );
}

async function verifyFailureAndAuthorization(sql: Sql): Promise<void> {
  const explicitTimeProbe = connect();
  try {
    await expectSqlState(
      explicitTimeProbe,
      async () => {
        await explicitTimeProbe.unsafe("set local role service_role");
        await explicitTimeProbe`
          insert into public.referents (id, registered_at)
          values (${ABSENT}::uuid, transaction_timestamp())
        `;
      },
      "42501",
    );
  } finally {
    await explicitTimeProbe.end();
  }

  const duplicateProbe = connect();
  try {
    await expectSqlState(
      duplicateProbe,
      async () => {
        await duplicateProbe.unsafe("set local role service_role");
        await duplicateProbe`
          insert into public.referents (id)
          values (${REGISTERED_ONLY}::uuid)
        `;
      },
      "23505",
    );
  } finally {
    await duplicateProbe.end();
  }

  const couplingProbe = connect();
  try {
    await expectSqlState(
      couplingProbe,
      () =>
        couplingProbe`delete from public.referents where id = ${GT01}::uuid`,
      "23503",
    );
  } finally {
    await couplingProbe.end();
  }

  const rollbackProbe = connect();
  try {
    await expectSqlState(
      rollbackProbe,
      async () => {
        await rollbackProbe.unsafe("set local role service_role");
        await rollbackProbe`
          insert into public.thoughts (id, content, source, embedding, embedding_model)
          values (
            ${ROLLBACK_PROBE}::uuid,
            '',
            'build_2_rollback_probe',
            array_fill(0::real, array[384])::extensions.vector,
            'gte-small'
          )
        `;
      },
      "23514",
    );
  } finally {
    await rollbackProbe.end();
  }

  const [residue] = await sql<
    { referent_present: boolean; thought_present: boolean }[]
  >`
    select
      exists(select 1 from public.referents where id = ${ROLLBACK_PROBE}::uuid) as referent_present,
      exists(select 1 from public.thoughts where id = ${ROLLBACK_PROBE}::uuid) as thought_present
  `;
  assert(
    !residue.referent_present && !residue.thought_present,
    "rollback probe left canonical residue",
  );
}

async function verifyActivationInterlock(sql: Sql): Promise<void> {
  const locker = connect();
  const writer = connect();
  const observer = connect();
  let writerPid = 0;
  let lockerInTransaction = false;
  let writerResult: Promise<void> | undefined;

  try {
    await locker.unsafe("begin");
    lockerInTransaction = true;
    await locker.unsafe(
      "lock table public.thoughts in share row exclusive mode",
    );

    const [backend] = await writer<
      { pid: number }[]
    >`select pg_backend_pid() as pid`;
    writerPid = backend.pid;

    writerResult = (async () => {
      await writer.unsafe("begin");
      try {
        await writer.unsafe("set local role service_role");
        await writer`
          insert into public.thoughts (id, content, source, embedding, embedding_model)
          values (
            ${CONCURRENCY_PROBE}::uuid,
            'BUILD 2 activation concurrency probe',
            'build_2_concurrency_probe',
            array_fill(0::real, array[384])::extensions.vector,
            'gte-small'
          )
        `;
        const [inside] = await writer<
          { registered: boolean; thought_present: boolean }[]
        >`
          select
            exists(select 1 from public.referents where id = ${CONCURRENCY_PROBE}::uuid) as registered,
            exists(select 1 from public.thoughts where id = ${CONCURRENCY_PROBE}::uuid) as thought_present
        `;
        assert(
          inside.registered && inside.thought_present,
          "queued writer did not become R=1,T=1",
        );
      } finally {
        await writer.unsafe("rollback");
      }
    })();

    let observedWaiting = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const [activity] = await observer<
        { waiting: boolean; blocker_count: number }[]
      >`
        select
          wait_event_type = 'Lock' as waiting,
          cardinality(pg_blocking_pids(${writerPid}))::integer as blocker_count
        from pg_stat_activity
        where pid = ${writerPid}
      `;
      if (activity?.waiting && activity.blocker_count > 0) {
        observedWaiting = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    assert(
      observedWaiting,
      "Thought writer did not queue behind SHARE ROW EXCLUSIVE",
    );
    await locker.unsafe("commit");
    lockerInTransaction = false;
    await writerResult;
  } finally {
    if (lockerInTransaction) {
      await locker.unsafe("rollback").catch(() => undefined);
    }
    await writerResult?.catch(() => undefined);
    await Promise.all([locker.end(), writer.end(), observer.end()]);
  }

  const [residue] = await sql<
    { referent_present: boolean; thought_present: boolean }[]
  >`
    select
      exists(select 1 from public.referents where id = ${CONCURRENCY_PROBE}::uuid) as referent_present,
      exists(select 1 from public.thoughts where id = ${CONCURRENCY_PROBE}::uuid) as thought_present
  `;
  assert(
    !residue.referent_present && !residue.thought_present,
    "concurrency probe left canonical residue",
  );
}

const sql = connect();
try {
  await verifyStaticShape(sql);
  await verifyExactUuidObservations(sql);
  await verifyFailureAndAuthorization(sql);
  await verifyActivationInterlock(sql);
  console.log(JSON.stringify({
    suite: "build-2-universal-referents",
    result: "PASS",
    checks: [
      "identity-spine-shape",
      "same-uuid-coupling",
      "invoker-registration-trigger",
      "least-privilege-boundary",
      "exact-uuid-observations",
      "duplicate-registration-failure",
      "registered-at-default-only",
      "post-trigger-constraint-rollback",
      "activation-write-interlock",
      "probe-residue-absent",
    ],
  }));
} finally {
  await sql.end();
}
