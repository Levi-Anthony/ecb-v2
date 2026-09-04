import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const CLAIM = "0f89e778-b16e-4840-9129-a2aa3eb6f697";
const LINK = "4c6c0f50-a936-4da6-bb09-233f93320639";
const NO_LINK_CLAIM = "cf0ca1fc-a4f7-487b-aea5-cfb23a467919";
const FORGED_LINK = "c85a5356-0930-4c94-a30d-cfd0e53a0a42";
const RACE_LINK = "6c7cc7be-c23f-434f-a8eb-927cbe80b99b";
const REGISTERED_ONLY = "2eede0e4-b27a-4383-850e-a448f0113c9f";

const GT01_CONTENT =
  "GT01: The brass heron waits beneath the violet staircase.";
const GT01_SOURCE = "golden_trace_01";
const GT01_CAPTURED_AT = "2026-09-04 00:12:35.225093+00";
const CLAIM_PROPOSITION =
  "The described scene contains both a brass heron and a violet staircase.";
const CLAIM_SCOPE = "worked_trace_03:gt01_interpretation";
const NO_LINK_PROPOSITION =
  "The worked trace contains an unlinked probe assertion.";
const NO_LINK_SCOPE = "worked_trace_03:no_link_probe";
const EXPECTED_DIGEST =
  "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55";
const REVISION_SCHEME = "ecb_thought_revision_v1_sha256";

const configuredConnectionString = Deno.env.get("POSTGRES_URL")?.trim();
if (!configuredConnectionString) throw new Error("POSTGRES_URL is required");
const connectionString: string = configuredConnectionString;

type Sql = ReturnType<typeof postgres>;

function connect(): Sql {
  return postgres(connectionString, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 60,
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

async function initialize(sql: Sql): Promise<void> {
  await sql.unsafe("set time zone 'UTC'");
}

async function expectSqlState(
  action: (sql: Sql) => Promise<unknown>,
  expectedCodes: string | string[],
  role?: "service_role",
): Promise<void> {
  const sql = connect();
  const codes = Array.isArray(expectedCodes) ? expectedCodes : [expectedCodes];
  try {
    await initialize(sql);
    await sql.unsafe("begin");
    try {
      if (role) await sql.unsafe(`set local role ${role}`);
      await action(sql);
      throw new Error(`expected SQLSTATE ${codes.join(" or ")}`);
    } catch (error) {
      if (!codes.includes(codeOf(error) ?? "")) throw error;
    } finally {
      await sql.unsafe("rollback").catch(() => undefined);
    }
  } finally {
    await sql.end();
  }
}

function concatenate(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const joined = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}

function uint64(value: bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, value, false);
  return bytes;
}

function int64(value: bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigInt64(0, value, false);
  return bytes;
}

function frame(tag: number, payload: Uint8Array): Uint8Array {
  return concatenate([
    Uint8Array.of(tag),
    uint64(BigInt(payload.length)),
    payload,
  ]);
}

function floorDiv(dividend: bigint, divisor: bigint): bigint {
  let quotient = dividend / divisor;
  if (dividend % divisor < 0n) quotient -= 1n;
  return quotient;
}

function daysFromCivil(year: bigint, month: bigint, day: bigint): bigint {
  const adjustedYear = month <= 2n ? year - 1n : year;
  const era = floorDiv(adjustedYear, 400n);
  const yearOfEra = adjustedYear - era * 400n;
  const shiftedMonth = month + (month > 2n ? -3n : 9n);
  const dayOfYear = (153n * shiftedMonth + 2n) / 5n + day - 1n;
  const dayOfEra = yearOfEra * 365n + yearOfEra / 4n -
    yearOfEra / 100n + dayOfYear;
  return era * 146097n + dayOfEra - 719468n;
}

function timestampMicroseconds(value: string): bigint {
  const match = value.match(
    /^(\d{4,})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}(?::?\d{2})?)$/,
  );
  assert(match, `unsupported finite PostgreSQL timestamp: ${value}`);

  const year = BigInt(match[1]);
  const month = BigInt(match[2]);
  const day = BigInt(match[3]);
  const hour = BigInt(match[4]);
  const minute = BigInt(match[5]);
  const second = BigInt(match[6]);
  const fractional = BigInt((match[7] ?? "").padEnd(6, "0") || "0");
  const zone = match[8];
  let offsetMinutes = 0n;
  if (zone !== "Z") {
    const zoneMatch = zone.match(/^([+-])(\d{2})(?::?(\d{2}))?$/);
    assert(zoneMatch, `unsupported timestamp offset: ${zone}`);
    const magnitude = BigInt(zoneMatch[2]) * 60n +
      BigInt(zoneMatch[3] ?? "0");
    offsetMinutes = zoneMatch[1] === "+" ? magnitude : -magnitude;
  }

  const localSeconds = daysFromCivil(year, month, day) * 86400n +
    hour * 3600n + minute * 60n + second;
  return (localSeconds - offsetMinutes * 60n) * 1000000n + fractional;
}

function revisionInput(
  content: string,
  source: string,
  capturedAt: string,
): Uint8Array {
  const encoder = new TextEncoder();
  return concatenate([
    encoder.encode("ECB-THOUGHT-REVISION-V1"),
    Uint8Array.of(0),
    frame(1, encoder.encode(content)),
    frame(2, encoder.encode(source)),
    frame(3, int64(timestampMicroseconds(capturedAt))),
  ]);
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function revisionDigest(
  content: string,
  source: string,
  capturedAt: string,
): Promise<{ inputLength: number; digest: string }> {
  const input = revisionInput(content, source, capturedAt);
  const inputBuffer = new ArrayBuffer(input.length);
  new Uint8Array(inputBuffer).set(input);
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", inputBuffer),
  );
  return { inputLength: input.length, digest: hex(digest) };
}

type ObservationStatus =
  | "linked_revision_match"
  | "linked_revision_mismatch"
  | "linked_evidence_unavailable"
  | "no_recorded_build_3_evidence_link";

interface SourceEvidence {
  referent_id: string;
  content: string;
  source: string;
  captured_at: string;
}

interface Observation {
  claim_id: string;
  proposition: string;
  scope: string;
  claim_kind: string;
  origin: string;
  epistemic_standing: string;
  asserted_at: string;
  evidence_link_id: string | null;
  evidence_referent_id: string | null;
  role: string | null;
  evidence_revision_scheme: string | null;
  linked_revision_digest: string | null;
  linked_at: string | null;
  status: ObservationStatus;
  current_revision_digest: string | null;
  source_evidence: SourceEvidence | null;
}

interface ObservationRow {
  claim_id: string;
  proposition: string;
  scope: string;
  claim_kind: string;
  origin: string;
  epistemic_standing: string;
  asserted_at: string;
  evidence_link_id: string | null;
  evidence_referent_id: string | null;
  role: string | null;
  evidence_revision_scheme: string | null;
  linked_revision_digest: string | null;
  linked_at: string | null;
  thought_id: string | null;
  content: string | null;
  source: string | null;
  captured_at: string | null;
}

async function observeClaim(sql: Sql, claimId: string): Promise<Observation[]> {
  const rows = await sql<ObservationRow[]>`
    select
      claim.id::text as claim_id,
      claim.proposition,
      claim.scope,
      claim.claim_kind,
      claim.origin,
      claim.epistemic_standing,
      claim.asserted_at::text,
      link.id::text as evidence_link_id,
      link.evidence_referent_id::text,
      link.role,
      link.evidence_revision_scheme,
      encode(link.evidence_revision_digest, 'hex') as linked_revision_digest,
      link.linked_at::text,
      thought.id::text as thought_id,
      thought.content,
      thought.source,
      thought.captured_at::text
    from public.claims as claim
    left join public.evidence_links as link on link.claim_id = claim.id
    left join public.thoughts as thought on thought.id = link.evidence_referent_id
    where claim.id = ${claimId}::uuid
    order by link.id
  `;
  assert(rows.length > 0, `Claim ${claimId} is absent`);

  return await Promise.all(rows.map(async (row): Promise<Observation> => {
    const base = {
      claim_id: row.claim_id,
      proposition: row.proposition,
      scope: row.scope,
      claim_kind: row.claim_kind,
      origin: row.origin,
      epistemic_standing: row.epistemic_standing,
      asserted_at: row.asserted_at,
      evidence_link_id: row.evidence_link_id,
      evidence_referent_id: row.evidence_referent_id,
      role: row.role,
      evidence_revision_scheme: row.evidence_revision_scheme,
      linked_revision_digest: row.linked_revision_digest,
      linked_at: row.linked_at,
    };

    if (row.evidence_link_id === null) {
      return {
        ...base,
        status: "no_recorded_build_3_evidence_link",
        current_revision_digest: null,
        source_evidence: null,
      };
    }

    if (row.thought_id === null) {
      return {
        ...base,
        status: "linked_evidence_unavailable",
        current_revision_digest: null,
        source_evidence: null,
      };
    }

    assert(
      row.content !== null && row.source !== null && row.captured_at !== null,
      "present Thought projection is incomplete",
    );
    const current = await revisionDigest(
      row.content,
      row.source,
      row.captured_at,
    );
    if (current.digest !== row.linked_revision_digest) {
      return {
        ...base,
        status: "linked_revision_mismatch",
        current_revision_digest: current.digest,
        source_evidence: null,
      };
    }

    return {
      ...base,
      status: "linked_revision_match",
      current_revision_digest: current.digest,
      source_evidence: {
        referent_id: row.thought_id,
        content: row.content,
        source: row.source,
        captured_at: row.captured_at,
      },
    };
  }));
}

async function verifyStaticShape(sql: Sql): Promise<void> {
  const tables = await sql<{ table_name: string }[]>`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  assert(
    JSON.stringify(tables.map((row) => row.table_name)) ===
      JSON.stringify(["claims", "evidence_links", "referents", "thoughts"]),
    "public table surface is not the authorized BUILD 3 expansion",
  );

  const views = await sql<{ table_name: string }[]>`
    select table_name from information_schema.views
    where table_schema = 'public'
  `;
  assert(views.length === 0, "BUILD 3 added a public view or resolver");

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
    "public function surface is not the authorized BUILD 3 expansion",
  );

  const columns = await sql<
    {
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    select table_name, column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('claims', 'evidence_links')
    order by table_name, ordinal_position
  `;
  const claimColumns = columns.filter((row) => row.table_name === "claims");
  const linkColumns = columns.filter((row) =>
    row.table_name === "evidence_links"
  );
  assert(
    JSON.stringify(claimColumns.map((row) => row.column_name)) ===
      JSON.stringify([
        "id",
        "proposition",
        "scope",
        "claim_kind",
        "origin",
        "epistemic_standing",
        "asserted_at",
      ]),
    "Claim columns drifted",
  );
  assert(
    JSON.stringify(linkColumns.map((row) => row.column_name)) ===
      JSON.stringify([
        "id",
        "claim_id",
        "evidence_referent_id",
        "role",
        "evidence_revision_scheme",
        "evidence_revision_digest",
        "linked_at",
      ]),
    "Evidence Link columns drifted",
  );
  assert(
    columns.every((row) =>
      row.is_nullable === "NO" &&
      ["uuid", "text", "bytea", "timestamp with time zone"].includes(
        row.data_type,
      ) &&
      (row.column_name === "id"
        ? row.column_default === "gen_random_uuid()"
        : row.column_default === null)
    ),
    "BUILD 3 type, nullability, or default drifted",
  );

  const constraints = await sql<
    {
      table_name: string;
      name: string;
      type: string;
      deferrable: boolean;
      initially_deferred: boolean;
      update_action: string;
      delete_action: string;
      referenced_table: string | null;
      definition: string;
    }[]
  >`
    select
      class.relname as table_name,
      con.conname as name,
      con.contype::text as type,
      con.condeferrable as deferrable,
      con.condeferred as initially_deferred,
      con.confupdtype::text as update_action,
      con.confdeltype::text as delete_action,
      referenced.relname as referenced_table,
      pg_get_constraintdef(con.oid) as definition
    from pg_constraint as con
    join pg_class as class on class.oid = con.conrelid
    left join pg_class as referenced on referenced.oid = con.confrelid
    where con.conrelid in (
      'public.claims'::regclass,
      'public.evidence_links'::regclass
    )
    order by class.relname, con.conname
  `;
  const names = constraints.map((row) => row.name).sort();
  assert(
    JSON.stringify(names) === JSON.stringify([
      "claims_kind_assertion",
      "claims_origin_ecb_inference",
      "claims_pkey",
      "claims_proposition_nonempty",
      "claims_referent_fkey",
      "claims_scope_nonempty",
      "claims_standing_unassessed",
      "evidence_links_claim_fkey",
      "evidence_links_evidence_referent_fkey",
      "evidence_links_pkey",
      "evidence_links_referent_fkey",
      "evidence_links_revision_digest_sha256",
      "evidence_links_revision_scheme_v1",
      "evidence_links_role_used_as_basis",
    ].sort()),
    "BUILD 3 constraint inventory drifted",
  );
  const foreignKeys = constraints.filter((row) => row.type === "f");
  assert(
    foreignKeys.length === 4 &&
      foreignKeys.every((row) =>
        !row.deferrable && !row.initially_deferred &&
        row.update_action === "r" && row.delete_action === "r"
      ),
    "BUILD 3 foreign keys are not immediate and restrictive",
  );
  assert(
    foreignKeys.filter((row) => row.referenced_table === "referents").length ===
        3 &&
      foreignKeys.filter((row) => row.referenced_table === "claims").length ===
        1 &&
      foreignKeys.every((row) => row.referenced_table !== "thoughts"),
    "BUILD 3 foreign-key targets drifted",
  );
  assert(
    constraints.filter((row) => row.type === "u").length === 0,
    "BUILD 3 added an unauthorized uniqueness constraint",
  );

  const triggers = await sql<
    {
      table_name: string;
      trigger_name: string;
      definition: string;
      function_name: string;
      security_definer: boolean;
      settings: string[] | null;
      owner_name: string;
      function_definition: string;
      public_execute: boolean;
      anon_execute: boolean;
      authenticated_execute: boolean;
      service_execute: boolean;
    }[]
  >`
    select
      class.relname as table_name,
      trigger.tgname as trigger_name,
      pg_get_triggerdef(trigger.oid) as definition,
      procedure.proname as function_name,
      procedure.prosecdef as security_definer,
      procedure.proconfig as settings,
      pg_get_userbyid(procedure.proowner) as owner_name,
      pg_get_functiondef(procedure.oid) as function_definition,
      exists (
        select 1
        from aclexplode(coalesce(procedure.proacl, acldefault('f', procedure.proowner))) as privilege
        where privilege.grantee = 0 and privilege.privilege_type = 'EXECUTE'
      ) as public_execute,
      has_function_privilege('anon', procedure.oid, 'execute') as anon_execute,
      has_function_privilege('authenticated', procedure.oid, 'execute') as authenticated_execute,
      has_function_privilege('service_role', procedure.oid, 'execute') as service_execute
    from pg_trigger as trigger
    join pg_class as class on class.oid = trigger.tgrelid
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid in (
      'public.claims'::regclass,
      'public.evidence_links'::regclass
    ) and not trigger.tgisinternal
    order by class.relname
  `;
  assert(triggers.length === 2, "expected one BUILD 3 trigger per table");
  const claimTrigger = triggers.find((row) => row.table_name === "claims");
  const linkTrigger = triggers.find((row) =>
    row.table_name === "evidence_links"
  );
  assert(claimTrigger && linkTrigger, "BUILD 3 trigger table coverage drifted");
  assert(
    claimTrigger.trigger_name === "claims_prepare" &&
      claimTrigger.function_name === "prepare_claim" &&
      claimTrigger.definition.includes(
        "BEFORE INSERT ON public.claims FOR EACH ROW",
      ) &&
      !claimTrigger.security_definer,
    "Claim trigger shape drifted",
  );
  assert(
    linkTrigger.trigger_name === "evidence_links_prepare" &&
      linkTrigger.function_name === "prepare_evidence_link" &&
      linkTrigger.definition.includes(
        "BEFORE INSERT ON public.evidence_links FOR EACH ROW",
      ) &&
      linkTrigger.security_definer && linkTrigger.owner_name === "postgres",
    "Evidence Link trigger shape or owner drifted",
  );
  for (const trigger of triggers) {
    assert(
      trigger.settings?.includes('search_path=""'),
      `${trigger.function_name} search_path is not empty`,
    );
    assert(
      !trigger.public_execute && !trigger.anon_execute &&
        !trigger.authenticated_execute && !trigger.service_execute,
      `${trigger.function_name} is directly callable`,
    );
  }
  const claimBody = claimTrigger.function_definition.toLowerCase();
  const linkBody = linkTrigger.function_definition.toLowerCase();
  assert(
    claimBody.includes("insert into public.referents (id)") &&
      claimBody.includes("new.claim_kind := 'assertion'") &&
      claimBody.includes("new.origin := 'ecb_inference'") &&
      claimBody.includes("new.epistemic_standing := 'unassessed'") &&
      !claimBody.includes("on conflict"),
    "Claim preparation body drifted",
  );
  assert(
    linkBody.includes("for share") &&
      linkBody.includes("extensions.digest") &&
      linkBody.includes("insert into public.referents (id)") &&
      linkBody.includes("new.role := 'used_as_basis'") &&
      !linkBody.includes("on conflict") && !linkBody.includes("execute "),
    "Evidence Link preparation body drifted",
  );

  const [security] = await sql<
    {
      claim_rls: boolean;
      link_rls: boolean;
      policy_count: string;
      service_claim_select: boolean;
      service_claim_table_insert: boolean;
      service_claim_id_insert: boolean;
      service_claim_proposition_insert: boolean;
      service_claim_scope_insert: boolean;
      service_claim_derived_insert: boolean;
      service_claim_update: boolean;
      service_claim_delete: boolean;
      service_link_select: boolean;
      service_link_table_insert: boolean;
      service_link_id_insert: boolean;
      service_link_claim_insert: boolean;
      service_link_evidence_insert: boolean;
      service_link_derived_insert: boolean;
      service_link_update: boolean;
      service_link_delete: boolean;
      client_access: boolean;
    }[]
  >`
    select
      (select relrowsecurity from pg_class where oid = 'public.claims'::regclass) as claim_rls,
      (select relrowsecurity from pg_class where oid = 'public.evidence_links'::regclass) as link_rls,
      (select count(*) from pg_policies where schemaname = 'public' and tablename in ('claims', 'evidence_links'))::text as policy_count,
      has_table_privilege('service_role', 'public.claims', 'select') as service_claim_select,
      has_table_privilege('service_role', 'public.claims', 'insert') as service_claim_table_insert,
      has_column_privilege('service_role', 'public.claims', 'id', 'insert') as service_claim_id_insert,
      has_column_privilege('service_role', 'public.claims', 'proposition', 'insert') as service_claim_proposition_insert,
      has_column_privilege('service_role', 'public.claims', 'scope', 'insert') as service_claim_scope_insert,
      has_column_privilege('service_role', 'public.claims', 'claim_kind', 'insert')
        or has_column_privilege('service_role', 'public.claims', 'origin', 'insert')
        or has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'insert')
        or has_column_privilege('service_role', 'public.claims', 'asserted_at', 'insert') as service_claim_derived_insert,
      has_table_privilege('service_role', 'public.claims', 'update') as service_claim_update,
      has_table_privilege('service_role', 'public.claims', 'delete') as service_claim_delete,
      has_table_privilege('service_role', 'public.evidence_links', 'select') as service_link_select,
      has_table_privilege('service_role', 'public.evidence_links', 'insert') as service_link_table_insert,
      has_column_privilege('service_role', 'public.evidence_links', 'id', 'insert') as service_link_id_insert,
      has_column_privilege('service_role', 'public.evidence_links', 'claim_id', 'insert') as service_link_claim_insert,
      has_column_privilege('service_role', 'public.evidence_links', 'evidence_referent_id', 'insert') as service_link_evidence_insert,
      has_column_privilege('service_role', 'public.evidence_links', 'role', 'insert')
        or has_column_privilege('service_role', 'public.evidence_links', 'evidence_revision_scheme', 'insert')
        or has_column_privilege('service_role', 'public.evidence_links', 'evidence_revision_digest', 'insert')
        or has_column_privilege('service_role', 'public.evidence_links', 'linked_at', 'insert') as service_link_derived_insert,
      has_table_privilege('service_role', 'public.evidence_links', 'update') as service_link_update,
      has_table_privilege('service_role', 'public.evidence_links', 'delete') as service_link_delete,
      exists (
        select 1 from pg_roles as role
        where role.rolname in ('anon', 'authenticated') and (
          has_any_column_privilege(role.rolname, 'public.claims', 'select, insert, update')
          or has_table_privilege(role.rolname, 'public.claims', 'delete')
          or has_any_column_privilege(role.rolname, 'public.evidence_links', 'select, insert, update')
          or has_table_privilege(role.rolname, 'public.evidence_links', 'delete')
        )
      ) as client_access
  `;
  assert(
    security.claim_rls && security.link_rls && security.policy_count === "0",
    "BUILD 3 RLS or policy boundary drifted",
  );
  assert(
    security.service_claim_select && !security.service_claim_table_insert &&
      security.service_claim_id_insert &&
      security.service_claim_proposition_insert &&
      security.service_claim_scope_insert &&
      !security.service_claim_derived_insert &&
      !security.service_claim_update && !security.service_claim_delete,
    "Claim service-role privileges drifted",
  );
  assert(
    security.service_link_select && !security.service_link_table_insert &&
      security.service_link_id_insert && security.service_link_claim_insert &&
      security.service_link_evidence_insert &&
      !security.service_link_derived_insert &&
      !security.service_link_update && !security.service_link_delete,
    "Evidence Link service-role privileges drifted",
  );
  assert(!security.client_access, "a client role has BUILD 3 table access");

  const [fixtures] = await sql<
    {
      claim_count: string;
      link_count: string;
      referent_count: string;
      claim_referent: boolean;
      link_referent: boolean;
      same_transaction_time: boolean;
      digest: string;
      probe_residue: boolean;
    }[]
  >`
    select
      (select count(*) from public.claims)::text as claim_count,
      (select count(*) from public.evidence_links)::text as link_count,
      (select count(*) from public.referents)::text as referent_count,
      exists(select 1 from public.referents where id = ${CLAIM}::uuid) as claim_referent,
      exists(select 1 from public.referents where id = ${LINK}::uuid) as link_referent,
      (select claim.asserted_at = link.linked_at from public.claims as claim join public.evidence_links as link on link.claim_id = claim.id where claim.id = ${CLAIM}::uuid and link.id = ${LINK}::uuid) as same_transaction_time,
      (select encode(evidence_revision_digest, 'hex') from public.evidence_links where id = ${LINK}::uuid) as digest,
      exists(select 1 from public.referents where id in (${NO_LINK_CLAIM}::uuid, ${FORGED_LINK}::uuid, ${RACE_LINK}::uuid)) as probe_residue
  `;
  assert(
    fixtures.claim_count === "1" && fixtures.link_count === "1" &&
      fixtures.referent_count === "4" && fixtures.claim_referent &&
      fixtures.link_referent && fixtures.same_transaction_time &&
      fixtures.digest === EXPECTED_DIGEST && !fixtures.probe_residue,
    "BUILD 3 canonical fixture expansion drifted",
  );
}

async function verifyBaseline(sql: Sql): Promise<Observation> {
  const encoded = await revisionDigest(
    GT01_CONTENT,
    GT01_SOURCE,
    GT01_CAPTURED_AT,
  );
  assert(encoded.inputLength === 131, "GT01 revision input is not 131 octets");
  assert(encoded.digest === EXPECTED_DIGEST, "independent GT01 digest drifted");

  const observations = await observeClaim(sql, CLAIM);
  assert(
    observations.length === 1,
    "canonical Claim must have one frozen Link",
  );
  const observation = observations[0];
  assert(
    observation.claim_id === CLAIM &&
      observation.proposition === CLAIM_PROPOSITION &&
      observation.scope === CLAIM_SCOPE &&
      observation.claim_kind === "assertion" &&
      observation.origin === "ecb_inference" &&
      observation.epistemic_standing === "unassessed" &&
      observation.evidence_link_id === LINK &&
      observation.evidence_referent_id === GT01 &&
      observation.role === "used_as_basis" &&
      observation.evidence_revision_scheme === REVISION_SCHEME &&
      observation.linked_revision_digest === EXPECTED_DIGEST &&
      observation.status === "linked_revision_match" &&
      observation.current_revision_digest === EXPECTED_DIGEST &&
      observation.source_evidence?.referent_id === GT01 &&
      observation.source_evidence.content === GT01_CONTENT &&
      observation.source_evidence.source === GT01_SOURCE &&
      observation.source_evidence.captured_at === GT01_CAPTURED_AT,
    "baseline Claim/Evidence observation drifted",
  );
  return observation;
}

async function verifyCallerForgery(): Promise<void> {
  await expectSqlState(
    (sql) =>
      sql`
      insert into public.evidence_links (
        id, claim_id, evidence_referent_id, evidence_revision_digest
      ) values (
        ${FORGED_LINK}::uuid,
        ${CLAIM}::uuid,
        ${GT01}::uuid,
        decode(repeat('00', 32), 'hex')
      )
    `,
    "42501",
    "service_role",
  );

  const owner = connect();
  try {
    await initialize(owner);
    await owner.unsafe("begin");
    await owner`
      insert into public.evidence_links (
        id, claim_id, evidence_referent_id, role,
        evidence_revision_scheme, evidence_revision_digest, linked_at
      ) values (
        ${FORGED_LINK}::uuid,
        ${CLAIM}::uuid,
        ${GT01}::uuid,
        'current_support',
        'caller_forged',
        decode(repeat('00', 32), 'hex'),
        '2000-01-01T00:00:00Z'::timestamptz
      )
    `;
    const observation = (await observeClaim(owner, CLAIM)).find((row) =>
      row.evidence_link_id === FORGED_LINK
    );
    assert(
      observation?.status === "linked_revision_match" &&
        observation.role === "used_as_basis" &&
        observation.evidence_revision_scheme === REVISION_SCHEME &&
        observation.linked_revision_digest === EXPECTED_DIGEST,
      "owner-supplied derived values were not overwritten",
    );
  } finally {
    await owner.unsafe("rollback").catch(() => undefined);
    await owner.end();
  }

  const service = connect();
  try {
    await initialize(service);
    await service.unsafe("begin");
    await service.unsafe("set local role service_role");
    await service`
      insert into public.evidence_links (id, claim_id, evidence_referent_id)
      values (${FORGED_LINK}::uuid, ${CLAIM}::uuid, ${GT01}::uuid)
    `;
    const observation = (await observeClaim(service, CLAIM)).find((row) =>
      row.evidence_link_id === FORGED_LINK
    );
    assert(
      observation?.status === "linked_revision_match" &&
        observation.linked_revision_digest === EXPECTED_DIGEST,
      "allowed service-role Link insert did not derive the frozen revision",
    );
  } finally {
    await service.unsafe("rollback").catch(() => undefined);
    await service.end();
  }
}

async function verifyDirectWriteDenials(): Promise<void> {
  const probes: Array<(sql: Sql) => Promise<unknown>> = [
    (sql) =>
      sql`update public.claims set proposition = proposition where id = ${CLAIM}::uuid`,
    (sql) => sql`delete from public.claims where id = ${CLAIM}::uuid`,
    (sql) =>
      sql`update public.evidence_links set role = role where id = ${LINK}::uuid`,
    (sql) => sql`delete from public.evidence_links where id = ${LINK}::uuid`,
    (sql) =>
      sql`update public.referents set registered_at = registered_at where id = ${CLAIM}::uuid`,
    (sql) => sql`delete from public.referents where id = ${LINK}::uuid`,
    (sql) =>
      sql`update public.thoughts set source = source where id = ${GT01}::uuid`,
    (sql) => sql`delete from public.thoughts where id = ${GT01}::uuid`,
  ];
  for (const probe of probes) {
    await expectSqlState(probe, "42501", "service_role");
  }
}

async function mutationObservation(
  mutate: (sql: Sql) => Promise<unknown>,
): Promise<Observation> {
  const sql = connect();
  try {
    await initialize(sql);
    await sql.unsafe("begin");
    await mutate(sql);
    const observations = await observeClaim(sql, CLAIM);
    assert(observations.length === 1, "mutation changed Link cardinality");
    const observation = observations[0];
    assert(
      observation.status === "linked_revision_mismatch" &&
        observation.source_evidence === null &&
        observation.current_revision_digest !== null &&
        observation.current_revision_digest !== EXPECTED_DIGEST,
      "source-bearing mutation was not an explicit redacted mismatch",
    );
    const [lineage] = await sql<
      { claim: boolean; link: boolean; claim_ref: boolean; link_ref: boolean }[]
    >`
      select
        exists(select 1 from public.claims where id = ${CLAIM}::uuid) as claim,
        exists(select 1 from public.evidence_links where id = ${LINK}::uuid) as link,
        exists(select 1 from public.referents where id = ${CLAIM}::uuid) as claim_ref,
        exists(select 1 from public.referents where id = ${LINK}::uuid) as link_ref
    `;
    assert(
      lineage.claim && lineage.link && lineage.claim_ref && lineage.link_ref,
      "source mutation erased historical lineage",
    );
    return observation;
  } finally {
    await sql.unsafe("rollback").catch(() => undefined);
    await sql.end();
  }
}

async function verifySourceMutations(): Promise<
  Array<{ field: string; status: ObservationStatus; current_digest: string }>
> {
  const content = await mutationObservation((sql) =>
    sql`
    update public.thoughts
    set content = 'GT01: The brass heron waits beneath the cobalt staircase.'
    where id = ${GT01}::uuid
  `
  );
  const source = await mutationObservation((sql) =>
    sql`
    update public.thoughts
    set source = 'golden_trace_01_privileged_probe'
    where id = ${GT01}::uuid
  `
  );
  const capturedAt = await mutationObservation((sql) =>
    sql`
    update public.thoughts
    set captured_at = '2026-09-04T00:12:35.225094+00:00'::timestamptz
    where id = ${GT01}::uuid
  `
  );
  return [
    {
      field: "content",
      status: content.status,
      current_digest: content.current_revision_digest!,
    },
    {
      field: "source",
      status: source.status,
      current_digest: source.current_revision_digest!,
    },
    {
      field: "captured_at",
      status: capturedAt.status,
      current_digest: capturedAt.current_revision_digest!,
    },
  ];
}

async function verifyEmbeddingMutation(): Promise<Observation> {
  const sql = connect();
  try {
    await initialize(sql);
    await sql.unsafe("begin");
    const [current] = await sql<{ embedding: string }[]>`
      select embedding::text from public.thoughts where id = ${GT01}::uuid
    `;
    const components = current.embedding.slice(1, -1).split(",").map(Number);
    assert(
      components.length === 384 && components.every(Number.isFinite),
      "GT01 embedding is not a finite 384-vector",
    );
    components[0] += 0.5;
    const replacement = `[${components.join(",")}]`;
    await sql`
      update public.thoughts
      set embedding = ${replacement}::extensions.vector
      where id = ${GT01}::uuid
    `;
    const [observation] = await observeClaim(sql, CLAIM);
    assert(
      observation.status === "linked_revision_match" &&
        observation.current_revision_digest === EXPECTED_DIGEST &&
        observation.source_evidence?.content === GT01_CONTENT,
      "embedding-only mutation revised source evidence",
    );
    return observation;
  } finally {
    await sql.unsafe("rollback").catch(() => undefined);
    await sql.end();
  }
}

async function verifyEvidenceDisappearance(): Promise<Observation> {
  const sql = connect();
  try {
    await initialize(sql);
    await sql.unsafe("begin");
    await sql`delete from public.thoughts where id = ${GT01}::uuid`;
    const [observation] = await observeClaim(sql, CLAIM);
    assert(
      observation.status === "linked_evidence_unavailable" &&
        observation.current_revision_digest === null &&
        observation.source_evidence === null &&
        observation.evidence_link_id === LINK,
      "Thought disappearance did not preserve historical basis",
    );
    const [retained] = await sql<
      { evidence_ref: boolean; claim: boolean; link: boolean }[]
    >`
      select
        exists(select 1 from public.referents where id = ${GT01}::uuid) as evidence_ref,
        exists(select 1 from public.claims where id = ${CLAIM}::uuid) as claim,
        exists(select 1 from public.evidence_links where id = ${LINK}::uuid) as link
    `;
    assert(
      retained.evidence_ref && retained.claim && retained.link,
      "Thought disappearance cascaded into lineage",
    );
    return observation;
  } finally {
    await sql.unsafe("rollback").catch(() => undefined);
    await sql.end();
  }
}

async function verifyNonCascade(): Promise<void> {
  const probes: Array<(sql: Sql) => Promise<unknown>> = [
    (sql) => sql`delete from public.referents where id = ${CLAIM}::uuid`,
    (sql) => sql`delete from public.referents where id = ${LINK}::uuid`,
    (sql) => sql`delete from public.referents where id = ${GT01}::uuid`,
    (sql) => sql`delete from public.claims where id = ${CLAIM}::uuid`,
  ];
  for (const probe of probes) await expectSqlState(probe, "23503");
}

async function verifyNoRecordedBasis(): Promise<Observation> {
  const sql = connect();
  try {
    await initialize(sql);
    await sql.unsafe("begin");
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claims (id, proposition, scope)
      values (${NO_LINK_CLAIM}::uuid, ${NO_LINK_PROPOSITION}, ${NO_LINK_SCOPE})
    `;
    const [observation] = await observeClaim(sql, NO_LINK_CLAIM);
    assert(
      observation.status === "no_recorded_build_3_evidence_link" &&
        observation.origin === "ecb_inference" &&
        observation.epistemic_standing === "unassessed" &&
        observation.evidence_link_id === null &&
        observation.evidence_referent_id === null &&
        observation.evidence_revision_scheme === null &&
        observation.linked_revision_digest === null &&
        observation.current_revision_digest === null &&
        observation.source_evidence === null,
      "no-link Claim observation overclaimed support history",
    );
    return observation;
  } finally {
    await sql.unsafe("rollback").catch(() => undefined);
    await sql.end();
  }
}

async function verifyUnavailableCreationAndTimestampDomain(): Promise<void> {
  await expectSqlState(
    (sql) =>
      sql`
      insert into public.evidence_links (id, claim_id, evidence_referent_id)
      values (${FORGED_LINK}::uuid, ${CLAIM}::uuid, ${REGISTERED_ONLY}::uuid)
    `,
    "P0002",
    "service_role",
  );

  await expectSqlState(async (sql) => {
    await sql`
      update public.thoughts set captured_at = 'infinity'::timestamptz
      where id = ${GT01}::uuid
    `;
    await sql`
      insert into public.evidence_links (id, claim_id, evidence_referent_id)
      values (${FORGED_LINK}::uuid, ${CLAIM}::uuid, ${GT01}::uuid)
    `;
  }, "22008");

  await expectSqlState(async (sql) => {
    await sql`
      update public.thoughts set captured_at = '294276-01-01T00:00:00+00'::timestamptz
      where id = ${GT01}::uuid
    `;
    await sql`
      insert into public.evidence_links (id, claim_id, evidence_referent_id)
      values (${FORGED_LINK}::uuid, ${CLAIM}::uuid, ${GT01}::uuid)
    `;
  }, ["22003", "22008"]);
}

async function verifyRace(): Promise<
  { queued: boolean; derived_digest: string }
> {
  const sessionA = connect();
  const sessionB = connect();
  const observer = connect();
  let sessionAOpen = false;
  let sessionBOpen = false;
  let updateResult: Promise<unknown> | undefined;
  try {
    await Promise.all([
      initialize(sessionA),
      initialize(sessionB),
      initialize(observer),
    ]);
    await sessionA.unsafe("begin");
    sessionAOpen = true;
    await sessionA.unsafe("set local role service_role");
    await sessionA`
      insert into public.evidence_links (id, claim_id, evidence_referent_id)
      values (${RACE_LINK}::uuid, ${CLAIM}::uuid, ${GT01}::uuid)
    `;
    const raceObservation = (await observeClaim(sessionA, CLAIM)).find((row) =>
      row.evidence_link_id === RACE_LINK
    );
    assert(
      raceObservation?.status === "linked_revision_match" &&
        raceObservation.linked_revision_digest === EXPECTED_DIGEST,
      "race Link did not derive the locked GT01 revision",
    );

    const [backend] = await sessionB<{ pid: number }[]>`
      select pg_backend_pid() as pid
    `;
    await sessionB.unsafe("begin");
    sessionBOpen = true;
    updateResult = (async () => {
      await sessionB`
        update public.thoughts
        set source = 'golden_trace_01_privileged_probe'
        where id = ${GT01}::uuid
      `;
    })();

    let queued = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const [activity] = await observer<
        { waiting: boolean; blocker_count: number }[]
      >`
        select
          wait_event_type = 'Lock' as waiting,
          cardinality(pg_blocking_pids(${backend.pid}))::integer as blocker_count
        from pg_stat_activity
        where pid = ${backend.pid}
      `;
      if (activity?.waiting && activity.blocker_count > 0) {
        queued = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert(
      queued,
      "privileged Thought mutation did not queue behind Link creation",
    );

    await sessionA.unsafe("rollback");
    sessionAOpen = false;
    await updateResult;
    const [mismatch] = await observeClaim(sessionB, CLAIM);
    assert(
      mismatch.status === "linked_revision_mismatch" &&
        mismatch.source_evidence === null,
      "post-lock source mutation was silently accepted",
    );
    await sessionB.unsafe("rollback");
    sessionBOpen = false;
    return { queued, derived_digest: raceObservation.linked_revision_digest };
  } finally {
    if (sessionAOpen) {
      await sessionA.unsafe("rollback").catch(() => undefined);
    }
    if (sessionBOpen) {
      await sessionB.unsafe("rollback").catch(() => undefined);
    }
    await updateResult?.catch(() => undefined);
    await Promise.all([sessionA.end(), sessionB.end(), observer.end()]);
  }
}

async function verifyNoResidue(sql: Sql): Promise<void> {
  const [state] = await sql<
    {
      probe_referents: string;
      probe_claims: string;
      probe_links: string;
      gt01_preserved: boolean;
      canonical_claims: string;
      canonical_links: string;
      canonical_referents: string;
    }[]
  >`
    select
      (select count(*) from public.referents where id in (${NO_LINK_CLAIM}::uuid, ${FORGED_LINK}::uuid, ${RACE_LINK}::uuid))::text as probe_referents,
      (select count(*) from public.claims where id = ${NO_LINK_CLAIM}::uuid)::text as probe_claims,
      (select count(*) from public.evidence_links where id in (${FORGED_LINK}::uuid, ${RACE_LINK}::uuid))::text as probe_links,
      exists(
        select 1 from public.thoughts
        where id = ${GT01}::uuid
          and content = ${GT01_CONTENT}
          and source = ${GT01_SOURCE}
          and captured_at = '2026-09-04T00:12:35.225093+00:00'::timestamptz
          and embedding_model = 'gte-small'
          and extensions.vector_dims(embedding) = 384
      ) as gt01_preserved,
      (select count(*) from public.claims)::text as canonical_claims,
      (select count(*) from public.evidence_links)::text as canonical_links,
      (select count(*) from public.referents)::text as canonical_referents
  `;
  assert(
    state.probe_referents === "0" && state.probe_claims === "0" &&
      state.probe_links === "0" && state.gt01_preserved &&
      state.canonical_claims === "1" && state.canonical_links === "1" &&
      state.canonical_referents === "4",
    "Worked Trace 03 left canonical residue",
  );
}

const sql = connect();
try {
  await initialize(sql);
  await verifyStaticShape(sql);
  const baseline = await verifyBaseline(sql);
  await verifyCallerForgery();
  await verifyDirectWriteDenials();
  const sourceMutations = await verifySourceMutations();
  const embedding = await verifyEmbeddingMutation();
  const unavailable = await verifyEvidenceDisappearance();
  await verifyNonCascade();
  const noLink = await verifyNoRecordedBasis();
  await verifyUnavailableCreationAndTimestampDomain();
  const race = await verifyRace();
  await verifyNoResidue(sql);

  console.log(JSON.stringify({
    suite: "build-3-evidence-versus-inference",
    result: "PASS",
    checks: [
      "exact-build-3-expansion",
      "independent-canonical-revision-encoding",
      "fresh-context-evidence-assertion-separation",
      "caller-forgery-rejected-or-overwritten",
      "direct-write-least-privilege",
      "source-bearing-drift-explicit",
      "embedding-excluded-from-evidence-revision",
      "evidence-unavailability-distinct-from-no-link",
      "historical-lineage-non-cascade",
      "unavailable-and-invalid-timestamp-link-rejection",
      "for-share-transaction-race-boundary",
      "origin-standing-lineage-separation",
      "probe-residue-absent",
    ],
    observations: {
      baseline,
      source_mutations: sourceMutations,
      embedding_only: {
        status: embedding.status,
        current_revision_digest: embedding.current_revision_digest,
      },
      evidence_disappearance: {
        status: unavailable.status,
        current_revision_digest: unavailable.current_revision_digest,
        source_evidence: unavailable.source_evidence,
      },
      no_recorded_basis: noLink,
      concurrent_mutation: race,
    },
  }));
} finally {
  await sql.end();
}
