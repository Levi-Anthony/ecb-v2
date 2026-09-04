import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const REGISTERED_ONLY = "2eede0e4-b27a-4383-850e-a448f0113c9f";
const CLAIM_C = "0f89e778-b16e-4840-9129-a2aa3eb6f697";
const LINK_L = "4c6c0f50-a936-4da6-bb09-233f93320639";
const CLAIM_C2 = "c7f7d330-e778-4ae5-be96-3a172bea1166";
const RELATION_R = "cb429206-5abd-4adb-8ff9-d6d6a885034c";
const REVERSAL_PROBE = "1d43f2e8-d5ac-47f9-bf11-0aee12e840ea";
const DUPLICATE_PROBE = "99452a5e-9ee4-4e09-9426-e706fc24cffd";
const UNBOUND_PROBE = "6a628b2e-2a01-4d90-aa58-7ee2e14d4a9c";
const SELF_PROBE = "d19eb743-7768-4624-aaa5-ea7dd2e6e31b";
const LINK_PROBE = "4bbf51ab-c29d-4fa5-90e1-6d7d329d9370";
// Never registered in public.referents; used only as an absent endpoint.
const ABSENT_REFERENT = "ce654422-bb4f-4c6b-bf3d-e32b3dd10e8f";

const GT01_DIGEST =
  "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55";

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

function constraintOf(error: unknown): string | undefined {
  if (
    typeof error !== "object" || error === null || !("constraint_name" in error)
  ) {
    return undefined;
  }
  return String(error.constraint_name);
}

async function expectFailure(
  sql: Sql,
  statement: () => Promise<unknown>,
  expectedCode: string,
  expectedConstraint?: string,
): Promise<void> {
  await sql.unsafe("begin");
  try {
    await statement();
    throw new Error(
      `expected SQLSTATE ${expectedCode}${
        expectedConstraint ? ` on ${expectedConstraint}` : ""
      }`,
    );
  } catch (error) {
    if (codeOf(error) !== expectedCode) throw error;
    if (expectedConstraint && constraintOf(error) !== expectedConstraint) {
      throw new Error(
        `expected constraint ${expectedConstraint}, got ${constraintOf(error)}`,
      );
    }
  } finally {
    await sql.unsafe("rollback");
  }
}

type ClaimRow = {
  id: string;
  proposition: string | null;
  scope: string;
  claim_kind: string;
  origin: string;
  epistemic_standing: string;
  asserted_at: string;
  subject_referent_id: string | null;
  predicate: string | null;
  object_referent_id: string | null;
  subject_bound: boolean | null;
  object_bound: boolean | null;
};

type Observation = {
  claim_id: string;
  claim_kind: string;
  status: string;
  scope: string;
  origin: string;
  epistemic_standing: string;
  asserted_at: string;
  subject_referent_id: string | null;
  predicate: string | null;
  object_referent_id: string | null;
  subject_native_binding: boolean | null;
  object_native_binding: boolean | null;
};

async function observe(sql: Sql, claimId: string): Promise<Observation> {
  const [row] = await sql<ClaimRow[]>`
    select
      claim.id::text,
      claim.proposition,
      claim.scope,
      claim.claim_kind,
      claim.origin,
      claim.epistemic_standing,
      claim.asserted_at::text,
      claim.subject_referent_id::text,
      claim.predicate,
      claim.object_referent_id::text,
      case when claim.subject_referent_id is null then null else exists(
        select 1 from public.claims as native where native.id = claim.subject_referent_id
        union all
        select 1 from public.thoughts as native where native.id = claim.subject_referent_id
        union all
        select 1 from public.evidence_links as native where native.id = claim.subject_referent_id
      ) end as subject_bound,
      case when claim.object_referent_id is null then null else exists(
        select 1 from public.claims as native where native.id = claim.object_referent_id
        union all
        select 1 from public.thoughts as native where native.id = claim.object_referent_id
        union all
        select 1 from public.evidence_links as native where native.id = claim.object_referent_id
      ) end as object_bound
    from public.claims as claim
    where claim.id = ${claimId}::uuid
  `;
  assert(row !== undefined, `Claim ${claimId} is absent`);

  const status = row.claim_kind === "assertion"
    ? "not_a_relation_claim"
    : (row.subject_bound === false || row.object_bound === false)
    ? "relation_claim_endpoint_unbound"
    : "relation_claim_recorded";

  return {
    claim_id: row.id,
    claim_kind: row.claim_kind,
    status,
    scope: row.scope,
    origin: row.origin,
    epistemic_standing: row.epistemic_standing,
    asserted_at: row.asserted_at,
    subject_referent_id: row.subject_referent_id,
    predicate: row.predicate,
    object_referent_id: row.object_referent_id,
    subject_native_binding: row.subject_bound,
    object_native_binding: row.object_bound,
  };
}

async function verifyBoundedExpansion(sql: Sql): Promise<void> {
  const tables = await sql<{ name: string }[]>`
    select table_name as name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  assert(
    JSON.stringify(tables.map((row) => row.name)) ===
      JSON.stringify(["claims", "evidence_links", "referents", "thoughts"]),
    "BUILD 4 added or removed a public table",
  );

  const views = await sql<{ name: string }[]>`
    select table_name as name from information_schema.views where table_schema = 'public'
  `;
  assert(views.length === 0, "BUILD 4 added a public view");

  const functions = await sql<{ name: string }[]>`
    select procedure.proname as name
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
    order by procedure.proname, procedure.oid
  `;
  assert(
    JSON.stringify(functions.map((row) => row.name)) === JSON.stringify([
      "prepare_claim",
      "prepare_evidence_link",
      "register_thought_referent",
      "search_thoughts",
    ]),
    "BUILD 4 added or removed a public function",
  );

  const columns = await sql<
    { name: string; nullable: string; def: string | null }[]
  >`
    select column_name as name, is_nullable as nullable, column_default as def
    from information_schema.columns
    where table_schema = 'public' and table_name = 'claims'
    order by ordinal_position
  `;
  assert(
    JSON.stringify(columns.map((row) => row.name)) === JSON.stringify([
      "id",
      "proposition",
      "scope",
      "claim_kind",
      "origin",
      "epistemic_standing",
      "asserted_at",
      "subject_referent_id",
      "predicate",
      "object_referent_id",
    ]),
    "Claim columns are not the authorized BUILD 4 expansion",
  );
  const byName = new Map(columns.map((row) => [row.name, row]));
  assert(
    byName.get("proposition")?.nullable === "YES",
    "proposition is not conditionally nullable",
  );
  assert(
    byName.get("claim_kind")?.def?.includes("'assertion'") === true,
    "claim_kind default is not 'assertion'",
  );
  for (
    const relationColumn of [
      "subject_referent_id",
      "predicate",
      "object_referent_id",
    ]
  ) {
    assert(
      byName.get(relationColumn)?.nullable === "YES",
      `${relationColumn} must be kind-exclusive rather than table-level required`,
    );
  }

  const constraints = await sql<{ name: string; def: string }[]>`
    select conname as name, pg_get_constraintdef(oid) as def
    from pg_constraint
    where conrelid = 'public.claims'::regclass and contype in ('c', 'f')
    order by conname
  `;
  assert(
    JSON.stringify(constraints.map((row) => row.name)) === JSON.stringify([
      "claims_depends_on_not_self",
      "claims_kind_exclusive_shape",
      "claims_kind_vocabulary",
      "claims_object_referent_fkey",
      "claims_origin_ecb_inference",
      "claims_predicate_vocabulary",
      "claims_referent_fkey",
      "claims_scope_nonempty",
      "claims_standing_unassessed",
      "claims_subject_referent_fkey",
    ]),
    "BUILD 4 Claim constraint surface drifted",
  );
  const constraintByName = new Map(
    constraints.map((row) => [row.name, row.def]),
  );
  assert(
    constraintByName.get("claims_kind_vocabulary")?.includes("'assertion'") &&
      constraintByName.get("claims_kind_vocabulary")?.includes("'relation'"),
    "claim_kind vocabulary is not exactly assertion and relation",
  );
  assert(
    constraintByName.get("claims_predicate_vocabulary")?.includes(
      "'depends_on'",
    ),
    "predicate vocabulary is not exactly depends_on",
  );
  assert(
    constraintByName.get("claims_depends_on_not_self")?.includes(
      "'depends_on'",
    ),
    "self-relation prohibition is not predicate-scoped",
  );

  const endpointKeys = await sql<
    { name: string; def: string; deferrable: boolean; deferred: boolean }[]
  >`
    select conname as name, pg_get_constraintdef(oid) as def,
      condeferrable as deferrable, condeferred as deferred
    from pg_constraint
    where conrelid = 'public.claims'::regclass and contype = 'f'
    order by conname
  `;
  assert(
    endpointKeys.length === 3,
    "expected exactly three Claim foreign keys",
  );
  for (const key of endpointKeys) {
    assert(
      !key.deferrable && !key.deferred,
      `${key.name} must be immediate and non-deferrable`,
    );
    assert(
      key.def.includes("REFERENCES referents(id)") &&
        key.def.includes("ON UPDATE RESTRICT") &&
        key.def.includes("ON DELETE RESTRICT"),
      `${key.name} must be a restrictive Referent reference`,
    );
  }

  const uniques = await sql<{ count: string }[]>`
    select count(*)::text as count
    from pg_index
    where indrelid = 'public.claims'::regclass
      and indisunique
      and indexrelid <> (
        select conindid from pg_constraint
        where conrelid = 'public.claims'::regclass and contype = 'p'
      )
  `;
  assert(
    uniques[0].count === "0",
    "BUILD 4 introduced a uniqueness rule over Claims",
  );

  const [trigger] = await sql<
    {
      definition: string;
      security_definer: boolean;
      settings: string[] | null;
      body: string;
      anon_execute: boolean;
      authenticated_execute: boolean;
      service_execute: boolean;
    }[]
  >`
    select
      pg_get_triggerdef(trigger.oid) as definition,
      procedure.prosecdef as security_definer,
      procedure.proconfig as settings,
      pg_get_functiondef(procedure.oid) as body,
      has_function_privilege('anon', procedure.oid, 'execute') as anon_execute,
      has_function_privilege('authenticated', procedure.oid, 'execute') as authenticated_execute,
      has_function_privilege('service_role', procedure.oid, 'execute') as service_execute
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.claims'::regclass and not trigger.tgisinternal
  `;
  assert(
    trigger?.definition.includes("BEFORE INSERT ON public.claims FOR EACH ROW"),
    "Claim preparation trigger timing or level drifted",
  );
  assert(
    !trigger.security_definer,
    "prepare_claim must remain SECURITY INVOKER",
  );
  assert(
    trigger.settings?.includes('search_path=""'),
    "prepare_claim search_path is not empty",
  );
  assert(
    trigger.body.includes("insert into public.referents (id)") &&
      !trigger.body.toLowerCase().includes("on conflict"),
    "prepare_claim Referent registration drifted",
  );
  assert(
    !trigger.body.includes("new.claim_kind :="),
    "prepare_claim must no longer overwrite claim_kind",
  );
  assert(
    trigger.body.includes("new.origin :=") &&
      trigger.body.includes("new.epistemic_standing :=") &&
      trigger.body.includes("new.asserted_at :="),
    "prepare_claim must retain database ownership of origin, standing, and time",
  );
  assert(
    !trigger.body.toLowerCase().includes("for share") &&
      !trigger.body.toLowerCase().includes("for update"),
    "prepare_claim must take no row lock",
  );
  assert(
    !trigger.anon_execute && !trigger.authenticated_execute &&
      !trigger.service_execute,
    "prepare_claim is directly callable",
  );

  const [boundary] = await sql<
    {
      rls: boolean;
      policies: string;
      service_select: boolean;
      service_table_insert: boolean;
      service_update: boolean;
      service_delete: boolean;
      kind_insert: boolean;
      subject_insert: boolean;
      predicate_insert: boolean;
      object_insert: boolean;
      origin_insert: boolean;
      standing_insert: boolean;
      time_insert: boolean;
      anon_access: boolean;
      authenticated_access: boolean;
    }[]
  >`
    select
      (select relrowsecurity from pg_class where oid = 'public.claims'::regclass) as rls,
      (select count(*) from pg_policies where schemaname = 'public' and tablename = 'claims')::text as policies,
      has_table_privilege('service_role', 'public.claims', 'select') as service_select,
      has_table_privilege('service_role', 'public.claims', 'insert') as service_table_insert,
      has_table_privilege('service_role', 'public.claims', 'update') as service_update,
      has_table_privilege('service_role', 'public.claims', 'delete') as service_delete,
      has_column_privilege('service_role', 'public.claims', 'claim_kind', 'insert') as kind_insert,
      has_column_privilege('service_role', 'public.claims', 'subject_referent_id', 'insert') as subject_insert,
      has_column_privilege('service_role', 'public.claims', 'predicate', 'insert') as predicate_insert,
      has_column_privilege('service_role', 'public.claims', 'object_referent_id', 'insert') as object_insert,
      has_column_privilege('service_role', 'public.claims', 'origin', 'insert') as origin_insert,
      has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'insert') as standing_insert,
      has_column_privilege('service_role', 'public.claims', 'asserted_at', 'insert') as time_insert,
      has_any_column_privilege('anon', 'public.claims', 'select, insert, update') as anon_access,
      has_any_column_privilege('authenticated', 'public.claims', 'select, insert, update') as authenticated_access
  `;
  assert(
    boundary.rls && boundary.policies === "0",
    "Claim RLS boundary drifted",
  );
  assert(
    boundary.service_select && !boundary.service_table_insert &&
      !boundary.service_update && !boundary.service_delete,
    "service_role table privileges drifted",
  );
  assert(
    boundary.kind_insert && boundary.subject_insert &&
      boundary.predicate_insert && boundary.object_insert,
    "service_role cannot supply the frozen caller-owned relation columns",
  );
  assert(
    !boundary.origin_insert && !boundary.standing_insert &&
      !boundary.time_insert,
    "service_role can forge origin, standing, or assertion time",
  );
  assert(
    !boundary.anon_access && !boundary.authenticated_access,
    "a client role can reach Claims",
  );

  const [counts] = await sql<
    { claims: string; links: string; referents: string; thoughts: string }[]
  >`
    select
      (select count(*) from public.claims)::text as claims,
      (select count(*) from public.evidence_links)::text as links,
      (select count(*) from public.referents)::text as referents,
      (select count(*) from public.thoughts)::text as thoughts
  `;
  assert(
    counts.claims === "3" && counts.links === "1" &&
      counts.referents === "6" && counts.thoughts === "1",
    "canonical expansion is not exactly two Claims and two Referents",
  );
}

async function verifyBaseline(sql: Sql): Promise<Observation> {
  const relation = await observe(sql, RELATION_R);
  assert(
    relation.status === "relation_claim_recorded",
    "relation Claim baseline status drifted",
  );
  assert(
    relation.claim_kind === "relation" &&
      relation.predicate === "depends_on" &&
      relation.subject_referent_id === CLAIM_C2 &&
      relation.object_referent_id === CLAIM_C &&
      relation.origin === "ecb_inference" &&
      relation.epistemic_standing === "unassessed" &&
      relation.scope === "worked_trace_06:claim_dependency",
    "relation Claim fixture drifted",
  );

  const dependent = await observe(sql, CLAIM_C2);
  assert(
    dependent.status === "not_a_relation_claim" &&
      dependent.predicate === null &&
      dependent.subject_referent_id === null &&
      dependent.object_referent_id === null,
    "dependent assertion Claim is not reported as an assertion",
  );

  const [referents] = await sql<
    { subject: boolean; object: boolean; relation: boolean }[]
  >`
    select
      exists(select 1 from public.referents where id = ${CLAIM_C2}::uuid) as subject,
      exists(select 1 from public.referents where id = ${CLAIM_C}::uuid) as object,
      exists(select 1 from public.referents where id = ${RELATION_R}::uuid) as relation
  `;
  assert(
    referents.subject && referents.object && referents.relation,
    "relation Claim or endpoint Referent coupling is absent",
  );

  const [prose] = await sql<{ proposition: string | null }[]>`
    select proposition from public.claims where id = ${RELATION_R}::uuid
  `;
  assert(
    prose.proposition === null,
    "relation Claim persists human-readable prose",
  );

  return relation;
}

async function verifyDirection(sql: Sql): Promise<Observation> {
  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claims (
        id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
      ) values (
        ${REVERSAL_PROBE}::uuid, 'worked_trace_06:reversal_probe', 'relation',
        ${CLAIM_C}::uuid, 'depends_on', ${CLAIM_C2}::uuid
      )
    `;
    await sql.unsafe("reset role");
    const reversed = await observe(sql, REVERSAL_PROBE);
    assert(
      reversed.subject_referent_id === CLAIM_C &&
        reversed.object_referent_id === CLAIM_C2,
      "reversal probe did not persist the reversed direction",
    );
    assert(
      reversed.claim_id !== RELATION_R,
      "reversal collapsed into the canonical relation Claim",
    );
    const [distinct] = await sql<{ count: string }[]>`
      select count(*)::text as count from public.claims
      where claim_kind = 'relation'
        and subject_referent_id = ${CLAIM_C2}::uuid
        and object_referent_id = ${CLAIM_C}::uuid
    `;
    assert(
      distinct.count === "1",
      "reversal altered the canonical relation direction",
    );
    return reversed;
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyRelationVersusEvidenceLink(sql: Sql): Promise<void> {
  const relationColumns = await sql<{ name: string }[]>`
    select column_name as name from information_schema.columns
    where table_schema = 'public' and table_name = 'claims'
  `;
  const linkColumns = await sql<{ name: string }[]>`
    select column_name as name from information_schema.columns
    where table_schema = 'public' and table_name = 'evidence_links'
  `;
  const relationNames = relationColumns.map((row) => row.name);
  const linkNames = linkColumns.map((row) => row.name);
  assert(
    relationNames.includes("predicate") &&
      !relationNames.includes("evidence_revision_digest") &&
      !relationNames.includes("evidence_revision_scheme") &&
      !relationNames.includes("role"),
    "a relation Claim carries evidence-revision semantics",
  );
  assert(
    linkNames.includes("evidence_revision_digest") &&
      !linkNames.includes("predicate") &&
      !linkNames.includes("subject_referent_id"),
    "an Evidence Link carries relation semantics",
  );

  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.evidence_links (id, claim_id, evidence_referent_id)
      values (${LINK_PROBE}::uuid, ${RELATION_R}::uuid, ${GT01}::uuid)
    `;
    await sql.unsafe("reset role");
    const [link] = await sql<{ digest: string; role: string }[]>`
      select encode(evidence_revision_digest, 'hex') as digest, role
      from public.evidence_links where id = ${LINK_PROBE}::uuid
    `;
    assert(
      link.digest === GT01_DIGEST && link.role === "used_as_basis",
      "Evidence Link on a relation Claim did not derive the frozen revision",
    );
    const still = await observe(sql, RELATION_R);
    assert(
      still.claim_kind === "relation" && still.predicate === "depends_on",
      "attaching evidence converted the relation Claim",
    );
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyNoSupportOrCurrentness(
  sql: Sql,
  baselineRelation: Observation,
): Promise<void> {
  const columns = await sql<{ name: string }[]>`
    select column_name as name from information_schema.columns
    where table_schema = 'public' and table_name = 'claims'
  `;
  const forbidden = [
    "confidence",
    "support_count",
    "decay_weight",
    "valid_from",
    "valid_until",
    "supersedes",
    "superseded_by",
    "current",
    "is_current",
    "classifier_version",
    "model",
    "rationale",
    "metadata",
    "updated_at",
    "status",
  ];
  for (const column of columns) {
    assert(
      !forbidden.includes(column.name),
      `Claims exposes a forbidden BUILD 5 or evaluation column: ${column.name}`,
    );
  }

  const endpointC = await observe(sql, CLAIM_C);
  const endpointC2 = await observe(sql, CLAIM_C2);
  assert(
    endpointC.epistemic_standing === "unassessed" &&
      endpointC2.epistemic_standing === "unassessed",
    "asserting a dependency changed an endpoint standing",
  );
  assert(
    endpointC.asserted_at !== baselineRelation.asserted_at,
    "endpoint Claim C assertion time was rewritten by BUILD 4",
  );
  const [endpointRows] = await sql<{ count: string }[]>`
    select count(*)::text as count from public.claims
    where id in (${CLAIM_C}::uuid, ${CLAIM_C2}::uuid)
      and claim_kind = 'assertion'
      and proposition is not null
      and subject_referent_id is null
      and predicate is null
      and object_referent_id is null
  `;
  assert(
    endpointRows.count === "2",
    "an endpoint Claim was mutated into relation shape by BUILD 4",
  );
}

async function verifyMultiplicity(sql: Sql): Promise<void> {
  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claims (
        id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
      ) values (
        ${DUPLICATE_PROBE}::uuid, 'worked_trace_06:duplicate_probe', 'relation',
        ${CLAIM_C2}::uuid, 'depends_on', ${CLAIM_C}::uuid
      )
    `;
    await sql.unsafe("reset role");
    const [rows] = await sql<{ count: string }[]>`
      select count(*)::text as count from public.claims
      where claim_kind = 'relation'
        and subject_referent_id = ${CLAIM_C2}::uuid
        and predicate = 'depends_on'
        and object_referent_id = ${CLAIM_C}::uuid
    `;
    assert(
      rows.count === "2",
      "repeated assertion of one triple did not remain two Claims",
    );
    const duplicate = await observe(sql, DUPLICATE_PROBE);
    assert(
      duplicate.claim_id !== RELATION_R,
      "duplicate assertion collapsed into the canonical relation Claim",
    );
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyEndpointBinding(sql: Sql): Promise<Observation[]> {
  const observations: Observation[] = [];

  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claims (
        id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
      ) values (
        ${UNBOUND_PROBE}::uuid, 'worked_trace_06:unbound_probe', 'relation',
        ${CLAIM_C2}::uuid, 'depends_on', ${REGISTERED_ONLY}::uuid
      )
    `;
    await sql.unsafe("reset role");
    const unbound = await observe(sql, UNBOUND_PROBE);
    assert(
      unbound.status === "relation_claim_endpoint_unbound" &&
        unbound.object_native_binding === false,
      "a Referent endpoint without a native record was not observable as unbound",
    );
    observations.push(unbound);
  } finally {
    await sql.unsafe("rollback");
  }

  await sql.unsafe("begin");
  try {
    await sql`delete from public.claims where id = ${CLAIM_C2}::uuid`;
    const afterDeletion = await observe(sql, RELATION_R);
    assert(
      afterDeletion.status === "relation_claim_endpoint_unbound" &&
        afterDeletion.subject_native_binding === false,
      "native-binding disappearance did not yield an unbound endpoint observation",
    );
    const [survivors] = await sql<
      {
        relation: boolean;
        subject_referent: boolean;
        object_referent: boolean;
      }[]
    >`
      select
        exists(select 1 from public.claims where id = ${RELATION_R}::uuid) as relation,
        exists(select 1 from public.referents where id = ${CLAIM_C2}::uuid) as subject_referent,
        exists(select 1 from public.referents where id = ${CLAIM_C}::uuid) as object_referent
    `;
    assert(
      survivors.relation && survivors.subject_referent &&
        survivors.object_referent,
      "native-binding disappearance erased the relation Claim or an endpoint Referent",
    );
    observations.push(afterDeletion);
  } finally {
    await sql.unsafe("rollback");
  }

  const referentProbe = connect();
  try {
    await expectFailure(
      referentProbe,
      () =>
        referentProbe`delete from public.referents where id = ${CLAIM_C}::uuid`,
      "23503",
    );
    await expectFailure(
      referentProbe,
      () =>
        referentProbe`delete from public.referents where id = ${CLAIM_C2}::uuid`,
      "23503",
    );
    await expectFailure(
      referentProbe,
      () =>
        referentProbe`delete from public.claims where id = ${CLAIM_C}::uuid`,
      "23503",
    );
  } finally {
    await referentProbe.end();
  }

  return observations;
}

async function verifySelfRelation(sql: Sql): Promise<void> {
  await expectFailure(
    sql,
    async () => {
      await sql.unsafe("set local role service_role");
      await sql`
        insert into public.claims (
          id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
        ) values (
          ${SELF_PROBE}::uuid, 'worked_trace_06:self_probe', 'relation',
          ${CLAIM_C2}::uuid, 'depends_on', ${CLAIM_C2}::uuid
        )
      `;
    },
    "23514",
    "claims_depends_on_not_self",
  );

  const [scoped] = await sql<{ def: string }[]>`
    select pg_get_constraintdef(oid) as def
    from pg_constraint
    where conrelid = 'public.claims'::regclass
      and conname = 'claims_depends_on_not_self'
  `;
  assert(
    scoped.def.includes("'depends_on'"),
    "self-relation prohibition is not scoped to the earned predicate",
  );
}

async function verifyForgeryAndShape(): Promise<void> {
  const probe = connect();
  try {
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope, origin)
          values (${SELF_PROBE}::uuid, 'forged origin', 'worked_trace_06:forgery', 'human')
        `;
      },
      "42501",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope, epistemic_standing)
          values (${SELF_PROBE}::uuid, 'forged standing', 'worked_trace_06:forgery', 'accepted')
        `;
      },
      "42501",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope, asserted_at)
          values (${SELF_PROBE}::uuid, 'forged time', 'worked_trace_06:forgery', now())
        `;
      },
      "42501",
    );

    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, scope, claim_kind, subject_referent_id, predicate)
          values (${SELF_PROBE}::uuid, 'worked_trace_06:partial', 'relation', ${CLAIM_C2}::uuid, 'depends_on')
        `;
      },
      "23514",
      "claims_kind_exclusive_shape",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (
            id, proposition, scope, claim_kind, subject_referent_id, predicate, object_referent_id
          ) values (
            ${SELF_PROBE}::uuid, 'relation with prose', 'worked_trace_06:prose', 'relation',
            ${CLAIM_C2}::uuid, 'depends_on', ${CLAIM_C}::uuid
          )
        `;
      },
      "23514",
      "claims_kind_exclusive_shape",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope, claim_kind, subject_referent_id, predicate, object_referent_id)
          values (${SELF_PROBE}::uuid, null, 'worked_trace_06:assertion_with_endpoints', 'assertion',
            ${CLAIM_C2}::uuid, 'depends_on', ${CLAIM_C}::uuid)
        `;
      },
      "23514",
      "claims_kind_exclusive_shape",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope)
          values (${SELF_PROBE}::uuid, '   ', 'worked_trace_06:blank_assertion')
        `;
      },
      "23514",
      "claims_kind_exclusive_shape",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope)
          values (${SELF_PROBE}::uuid, null, 'worked_trace_06:null_assertion')
        `;
      },
      "23514",
      "claims_kind_exclusive_shape",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (
            id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
          ) values (
            ${SELF_PROBE}::uuid, 'worked_trace_06:foreign_predicate', 'relation',
            ${CLAIM_C2}::uuid, 'supports', ${CLAIM_C}::uuid
          )
        `;
      },
      "23514",
      "claims_predicate_vocabulary",
    );
    // A third claim kind violates both claims_kind_vocabulary and
    // claims_kind_exclusive_shape, so the reported constraint is whichever
    // PostgreSQL evaluates first. Only the rejection is frozen behavior.
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope, claim_kind)
          values (${SELF_PROBE}::uuid, 'third kind', 'worked_trace_06:third_kind', 'evaluation')
        `;
      },
      "23514",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (
            id, scope, claim_kind, subject_referent_id, predicate, object_referent_id
          ) values (
            ${SELF_PROBE}::uuid, 'worked_trace_06:unregistered', 'relation',
            ${CLAIM_C2}::uuid, 'depends_on', ${ABSENT_REFERENT}::uuid
          )
        `;
      },
      "23503",
    );

    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          update public.claims set scope = 'mutated' where id = ${RELATION_R}::uuid
        `;
      },
      "42501",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`delete from public.claims where id = ${RELATION_R}::uuid`;
      },
      "42501",
    );
  } finally {
    await probe.end();
  }
}

async function verifyNoCoReferenceOrModelAuthority(sql: Sql): Promise<void> {
  const referentColumns = await sql<{ name: string }[]>`
    select column_name as name from information_schema.columns
    where table_schema = 'public' and table_name = 'referents'
    order by ordinal_position
  `;
  assert(
    JSON.stringify(referentColumns.map((row) => row.name)) ===
      JSON.stringify(["id", "registered_at"]),
    "BUILD 4 changed the identity-only Referent registry",
  );

  const identityTables = await sql<{ name: string }[]>`
    select table_name as name
    from information_schema.tables
    where table_schema = 'public'
      and (table_name like '%alias%' or table_name like '%same_as%'
        or table_name like '%merge%' or table_name like '%resolution%'
        or table_name like '%entity%')
  `;
  assert(
    identityTables.length === 0,
    "BUILD 4 introduced a co-reference or entity-resolution surface",
  );
}

async function verifyProbeResidue(sql: Sql): Promise<void> {
  const [residue] = await sql<
    { claims: string; links: string; referents: string }[]
  >`
    select
      (select count(*) from public.claims where id in (
        ${REVERSAL_PROBE}::uuid, ${DUPLICATE_PROBE}::uuid,
        ${UNBOUND_PROBE}::uuid, ${SELF_PROBE}::uuid))::text as claims,
      (select count(*) from public.evidence_links where id = ${LINK_PROBE}::uuid)::text as links,
      (select count(*) from public.referents where id in (
        ${REVERSAL_PROBE}::uuid, ${DUPLICATE_PROBE}::uuid,
        ${UNBOUND_PROBE}::uuid, ${SELF_PROBE}::uuid, ${LINK_PROBE}::uuid))::text as referents
  `;
  assert(
    residue.claims === "0" && residue.links === "0" &&
      residue.referents === "0",
    "a rollback-only probe left canonical residue",
  );

  const [preserved] = await sql<
    { claim_c: boolean; link_l: boolean; digest: string; gt01: boolean }[]
  >`
    select
      exists(select 1 from public.claims where id = ${CLAIM_C}::uuid) as claim_c,
      exists(select 1 from public.evidence_links where id = ${LINK_L}::uuid) as link_l,
      (select encode(evidence_revision_digest, 'hex') from public.evidence_links
        where id = ${LINK_L}::uuid) as digest,
      exists(select 1 from public.thoughts where id = ${GT01}::uuid) as gt01
  `;
  assert(
    preserved.claim_c && preserved.link_l && preserved.gt01 &&
      preserved.digest === GT01_DIGEST,
    "BUILD 3 canonical state did not survive the BUILD 4 probe surface",
  );
}

const sql = connect();
try {
  await verifyBoundedExpansion(sql);
  const baseline = await verifyBaseline(sql);
  const reversal = await verifyDirection(sql);
  await verifyRelationVersusEvidenceLink(sql);
  await verifyNoSupportOrCurrentness(sql, baseline);
  await verifyMultiplicity(sql);
  const bindingObservations = await verifyEndpointBinding(sql);
  await verifySelfRelation(sql);
  await verifyForgeryAndShape();
  await verifyNoCoReferenceOrModelAuthority(sql);
  await verifyProbeResidue(sql);

  console.log(JSON.stringify({
    suite: "build-4-typed-relation-claims",
    result: "PASS",
    checks: [
      "bounded-build-4-expansion",
      "relation-claim-baseline",
      "direction-structural-not-conventional",
      "relation-distinguishable-from-evidence-link",
      "no-support-currentness-or-standing-change",
      "repeated-triples-remain-distinct-claims",
      "endpoint-referent-addressing-and-native-binding-loss",
      "predicate-scoped-self-relation-prohibition",
      "caller-forgery-and-kind-exclusive-shape",
      "no-co-reference-or-model-authority",
      "probe-residue-absent",
    ],
    observations: {
      baseline,
      reversal,
      endpoint_unbound: bindingObservations[0],
      native_binding_absent: bindingObservations[1],
    },
  }));
} finally {
  await sql.end();
}
