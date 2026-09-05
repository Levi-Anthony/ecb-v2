import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const CLAIM_C = "0f89e778-b16e-4840-9129-a2aa3eb6f697";
const LINK_L = "4c6c0f50-a936-4da6-bb09-233f93320639";
const CLAIM_C2 = "c7f7d330-e778-4ae5-be96-3a172bea1166";
const RELATION_R = "cb429206-5abd-4adb-8ff9-d6d6a885034c";
const TR1 = "a6925494-a862-441b-a361-5f5ec41dc9dc";
const TR2 = "db18ae39-8bf8-483f-a56c-ba4e29fb37d2";
const STALE_PRIOR = "6efc5da1-cf53-4749-bcc6-b02a74fd76bf";
const FORGERY = "05332754-b2e3-45cb-8f65-aaca27410cb5";
const NO_OP = "b3912428-eaac-4469-bcfe-672abdca08f3";
const CONCURRENCY = "7ddc3b5d-c4df-48df-9aa4-92e08af3bc49";

const DIGEST_V1 =
  "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55";
const DIGEST_V2 =
  "5ce23dfa64a69e028ef9b92a160eab15afd32471f0e21245157e58b3dfc26c53";
const DRIFTED_CONTENT =
  "GT01: The brass heron waits beneath the cobalt staircase.";

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

/** Asserts the statement is rejected. `expectedCode` is pinned only where the
 * contract owns the code; otherwise any rejection satisfies the frozen behavior. */
async function expectRejection(
  sql: Sql,
  statement: () => Promise<unknown>,
  expectedCode?: string,
): Promise<string | undefined> {
  await sql.unsafe("begin");
  try {
    await statement();
    throw new Error("expected the statement to be rejected");
  } catch (error) {
    const code = codeOf(error);
    if (code === undefined) throw error;
    if (expectedCode !== undefined && code !== expectedCode) throw error;
    return code;
  } finally {
    await sql.unsafe("rollback");
  }
}

// Independent reimplementation of ecb_thought_revision_v1_sha256.
function frame(tag: number, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(1 + 8 + payload.length);
  out[0] = tag;
  new DataView(out.buffer).setBigUint64(1, BigInt(payload.length), false);
  out.set(payload, 9);
  return out;
}

function int64BigEndian(value: bigint): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigInt64(0, value, false);
  return out;
}

async function deriveDigest(
  content: string,
  source: string,
  microseconds: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const parts = [
    encoder.encode("ECB-THOUGHT-REVISION-V1"),
    new Uint8Array([0x00]),
    frame(0x01, encoder.encode(content)),
    frame(0x02, encoder.encode(source)),
    frame(0x03, int64BigEndian(BigInt(microseconds))),
  ];
  const total = parts.reduce((size, part) => size + part.length, 0);
  const input = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    input.set(part, offset);
    offset += part.length;
  }
  const digest = await crypto.subtle.digest("SHA-256", input);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function currentEvidenceDigest(sql: Sql): Promise<string | null> {
  const [row] = await sql<
    { content: string; source: string; microseconds: string }[]
  >`
    select content, source,
      ((extract(epoch from captured_at) * 1000000)::bigint)::text as microseconds
    from public.thoughts where id = ${GT01}::uuid
  `;
  if (row === undefined) return null;
  return await deriveDigest(row.content, row.source, row.microseconds);
}

type HistoryEntry = {
  from_standing: string;
  to_standing: string;
  basis_evidence_link_id: string;
  basis_revision_digest: string;
  observed_revision_digest: string;
  basis_match: boolean;
  recorded_at: string;
};

type Observation = {
  claim_id: string;
  applied_standing: string;
  status: string;
  history: HistoryEntry[];
};

async function observe(sql: Sql, claimId: string): Promise<Observation> {
  const [claim] = await sql<{ applied: string }[]>`
    select epistemic_standing as applied from public.claims
    where id = ${claimId}::uuid
  `;
  assert(claim !== undefined, `Claim ${claimId} is absent`);

  const rows = await sql<
    {
      from_standing: string;
      to_standing: string;
      basis_evidence_link_id: string;
      basis_revision_digest: string;
      observed_revision_digest: string;
      recorded_at: string;
    }[]
  >`
    select
      transition.from_standing,
      transition.to_standing,
      transition.basis_evidence_link_id::text,
      encode(link.evidence_revision_digest, 'hex') as basis_revision_digest,
      encode(transition.observed_revision_digest, 'hex') as observed_revision_digest,
      transition.recorded_at::text
    from public.claim_standing_transitions as transition
    join public.evidence_links as link on link.id = transition.basis_evidence_link_id
    where transition.claim_id = ${claimId}::uuid
    order by transition.recorded_at, transition.from_standing
  `;

  const history: HistoryEntry[] = rows.map((row) => ({
    from_standing: row.from_standing,
    to_standing: row.to_standing,
    basis_evidence_link_id: row.basis_evidence_link_id,
    basis_revision_digest: row.basis_revision_digest,
    observed_revision_digest: row.observed_revision_digest,
    basis_match: row.observed_revision_digest === row.basis_revision_digest,
    recorded_at: row.recorded_at,
  }));

  if (history.length === 0) {
    return {
      claim_id: claimId,
      applied_standing: claim.applied,
      status: "no_recorded_standing_transition",
      history,
    };
  }

  let chained = history[0].from_standing === "unassessed";
  for (let index = 1; index < history.length; index += 1) {
    if (history[index].from_standing !== history[index - 1].to_standing) {
      chained = false;
    }
  }
  const applied = history[history.length - 1].to_standing === claim.applied;

  return {
    claim_id: claimId,
    applied_standing: claim.applied,
    status: chained && applied
      ? "standing_history_reconstructed"
      : "applied_standing_diverged_from_history",
    history,
  };
}

async function verifyBoundedExpansion(sql: Sql): Promise<void> {
  const tables = await sql<{ name: string }[]>`
    select table_name as name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name
  `;
  assert(
    JSON.stringify(tables.map((row) => row.name)) === JSON.stringify([
      "claim_standing_transitions",
      "claims",
      "evidence_links",
      "referents",
      "thoughts",
    ]),
    "BUILD 5A public table surface is not the authorized expansion",
  );

  const views = await sql<{ name: string }[]>`
    select table_name as name from information_schema.views where table_schema = 'public'
  `;
  assert(views.length === 0, "BUILD 5A added a public view");

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
      "prepare_claim_standing_transition",
      "prepare_evidence_link",
      "register_thought_referent",
      "search_thoughts",
      "thought_revision_digest",
    ]),
    "BUILD 5A public function surface is not the authorized expansion",
  );

  const columns = await sql<{ name: string }[]>`
    select column_name as name from information_schema.columns
    where table_schema = 'public' and table_name = 'claim_standing_transitions'
    order by ordinal_position
  `;
  assert(
    JSON.stringify(columns.map((row) => row.name)) === JSON.stringify([
      "id",
      "claim_id",
      "from_standing",
      "to_standing",
      "basis_evidence_link_id",
      "observed_revision_digest",
      "recorded_at",
    ]),
    "transition columns drifted",
  );

  const forbidden = [
    "confidence",
    "valid_from",
    "valid_until",
    "decay_weight",
    "supersedes",
    "is_current",
    "classifier_version",
    "rationale",
    "metadata",
    "updated_at",
    "status",
    "receipt",
    "artifact_id",
    "verified_by",
  ];
  for (const column of columns) {
    assert(
      !forbidden.includes(column.name),
      `transition exposes a forbidden BUILD 5B or evaluation column: ${column.name}`,
    );
  }

  const keys = await sql<
    { name: string; def: string; deferrable: boolean; deferred: boolean }[]
  >`
    select conname as name, pg_get_constraintdef(oid) as def,
      condeferrable as deferrable, condeferred as deferred
    from pg_constraint
    where conrelid = 'public.claim_standing_transitions'::regclass and contype = 'f'
    order by conname
  `;
  assert(keys.length === 3, "expected exactly three transition foreign keys");
  for (const key of keys) {
    assert(
      !key.deferrable && !key.deferred &&
        key.def.includes("REFERENCES referents(id)") &&
        key.def.includes("ON UPDATE RESTRICT") &&
        key.def.includes("ON DELETE RESTRICT"),
      `${key.name} must be an immediate restrictive Referent reference`,
    );
  }

  const [trigger] = await sql<
    {
      definition: string;
      security_definer: boolean;
      settings: string[] | null;
      anon: boolean;
      authenticated: boolean;
      service: boolean;
    }[]
  >`
    select
      pg_get_triggerdef(trigger.oid) as definition,
      procedure.prosecdef as security_definer,
      procedure.proconfig as settings,
      has_function_privilege('anon', procedure.oid, 'execute') as anon,
      has_function_privilege('authenticated', procedure.oid, 'execute') as authenticated,
      has_function_privilege('service_role', procedure.oid, 'execute') as service
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.claim_standing_transitions'::regclass
      and not trigger.tgisinternal
  `;
  assert(
    trigger?.definition.includes(
      "BEFORE INSERT ON public.claim_standing_transitions FOR EACH ROW",
    ),
    "transition trigger timing or level drifted",
  );
  assert(
    trigger.security_definer && trigger.settings?.includes('search_path=""'),
    "transition trigger lost SECURITY DEFINER or empty search_path",
  );
  assert(
    !trigger.anon && !trigger.authenticated && !trigger.service,
    "transition trigger function is directly callable",
  );

  const [boundary] = await sql<
    {
      rls: boolean;
      policies: string;
      select_ok: boolean;
      table_insert: boolean;
      update_ok: boolean;
      delete_ok: boolean;
      claim_insert: boolean;
      digest_insert: boolean;
      time_insert: boolean;
      claims_update: boolean;
      claims_standing_update: boolean;
      anon: boolean;
      authenticated: boolean;
      digest_fn: boolean;
    }[]
  >`
    select
      (select relrowsecurity from pg_class where oid = 'public.claim_standing_transitions'::regclass) as rls,
      (select count(*) from pg_policies where schemaname = 'public' and tablename = 'claim_standing_transitions')::text as policies,
      has_table_privilege('service_role', 'public.claim_standing_transitions', 'select') as select_ok,
      has_table_privilege('service_role', 'public.claim_standing_transitions', 'insert') as table_insert,
      has_table_privilege('service_role', 'public.claim_standing_transitions', 'update') as update_ok,
      has_table_privilege('service_role', 'public.claim_standing_transitions', 'delete') as delete_ok,
      has_column_privilege('service_role', 'public.claim_standing_transitions', 'claim_id', 'insert') as claim_insert,
      has_column_privilege('service_role', 'public.claim_standing_transitions', 'observed_revision_digest', 'insert') as digest_insert,
      has_column_privilege('service_role', 'public.claim_standing_transitions', 'recorded_at', 'insert') as time_insert,
      has_table_privilege('service_role', 'public.claims', 'update') as claims_update,
      has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'update') as claims_standing_update,
      has_any_column_privilege('anon', 'public.claim_standing_transitions', 'select, insert, update') as anon,
      has_any_column_privilege('authenticated', 'public.claim_standing_transitions', 'select, insert, update') as authenticated,
      has_function_privilege('service_role', 'public.thought_revision_digest(uuid)', 'execute') as digest_fn
  `;
  assert(boundary.rls && boundary.policies === "0", "transition RLS drifted");
  assert(
    boundary.select_ok && !boundary.table_insert && !boundary.update_ok &&
      !boundary.delete_ok && boundary.claim_insert,
    "transition table privileges drifted",
  );
  assert(
    !boundary.digest_insert && !boundary.time_insert,
    "a caller can supply the derived revision or the recorded time",
  );
  assert(
    !boundary.claims_update && !boundary.claims_standing_update,
    "BUILD 5A weakened the Claim no-UPDATE posture",
  );
  assert(
    !boundary.anon && !boundary.authenticated && !boundary.digest_fn,
    "a client role reached the transition surface or the digest function",
  );

  const [counts] = await sql<
    {
      transitions: string;
      claims: string;
      links: string;
      referents: string;
      thoughts: string;
    }[]
  >`
    select
      (select count(*) from public.claim_standing_transitions)::text as transitions,
      (select count(*) from public.claims)::text as claims,
      (select count(*) from public.evidence_links)::text as links,
      (select count(*) from public.referents)::text as referents,
      (select count(*) from public.thoughts)::text as thoughts
  `;
  assert(
    counts.transitions === "1" && counts.claims === "3" &&
      counts.links === "1" && counts.referents === "7" &&
      counts.thoughts === "1",
    "canonical expansion is not exactly one transition and one Referent",
  );
}

async function verifyBaseline(sql: Sql): Promise<Observation> {
  const observation = await observe(sql, CLAIM_C);
  assert(
    observation.status === "standing_history_reconstructed",
    `baseline status is ${observation.status}`,
  );
  assert(
    observation.applied_standing === "basis_qualified",
    "Claim C applied standing is not basis_qualified",
  );
  assert(observation.history.length === 1, "expected exactly one transition");
  const entry = observation.history[0];
  assert(
    entry.from_standing === "unassessed" &&
      entry.to_standing === "basis_qualified" &&
      entry.basis_evidence_link_id === LINK_L &&
      entry.basis_revision_digest === DIGEST_V1 &&
      entry.observed_revision_digest === DIGEST_V1 &&
      entry.basis_match,
    "TR1 does not record the frozen qualification",
  );
  assert(
    await sql`select 1 from public.referents where id = ${TR1}::uuid`.then((
      r,
    ) => r.length === 1),
    "TR1 has no same-UUID Referent",
  );
  return observation;
}

async function verifyEncodingAgreement(sql: Sql): Promise<void> {
  const independent = await currentEvidenceDigest(sql);
  assert(
    independent === DIGEST_V1,
    "independent revision encoding does not reproduce the frozen anchor",
  );
  const [stored] = await sql<{ digest: string }[]>`
    select encode(observed_revision_digest, 'hex') as digest
    from public.claim_standing_transitions where id = ${TR1}::uuid
  `;
  assert(
    stored.digest === DIGEST_V1,
    "database-derived revision disagrees with the independent implementation",
  );
}

async function verifyAtomicity(sql: Sql): Promise<void> {
  // B — a failing standing application must leave no transition and no Referent.
  // A transition to a value the Claim constraint rejects fails inside the trigger's
  // UPDATE, after the Referent insert, so the whole statement must roll back.
  const probe = connect();
  try {
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claim_standing_transitions
          (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
        values (${FORGERY}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'accepted',
          ${LINK_L}::uuid)
      `;
    });
  } finally {
    await probe.end();
  }

  const [residue] = await sql<{ referent: boolean; transition: boolean }[]>`
    select
      exists(select 1 from public.referents where id = ${FORGERY}::uuid) as referent,
      exists(select 1 from public.claim_standing_transitions where id = ${FORGERY}::uuid) as transition
  `;
  assert(
    !residue.referent && !residue.transition,
    "a rejected transition left a Referent or history row",
  );

  // A — the standing change cannot outlive a rolled-back transition.
  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claim_standing_transitions
        (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
      values (${TR2}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'revalidation_required',
        ${LINK_L}::uuid)
    `;
    await sql.unsafe("reset role");
    const [inside] = await sql<{ applied: string }[]>`
      select epistemic_standing as applied from public.claims where id = ${CLAIM_C}::uuid
    `;
    assert(
      inside.applied === "revalidation_required",
      "the transition did not apply its standing inside the transaction",
    );
  } finally {
    await sql.unsafe("rollback");
  }

  const [after] = await sql<{ applied: string; transitions: string }[]>`
    select
      (select epistemic_standing from public.claims where id = ${CLAIM_C}::uuid) as applied,
      (select count(*) from public.claim_standing_transitions)::text as transitions
  `;
  assert(
    after.applied === "basis_qualified" && after.transitions === "1",
    "a rolled-back transition left an applied standing change or history row",
  );
}

async function verifyRejections(): Promise<void> {
  const probe = connect();
  try {
    // stale declared prior standing
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claim_standing_transitions
          (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
        values (${STALE_PRIOR}::uuid, ${CLAIM_C}::uuid, 'unassessed', 'revalidation_required',
          ${LINK_L}::uuid)
      `;
    });

    // no-op transition
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claim_standing_transitions
          (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
        values (${NO_OP}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'basis_qualified',
          ${LINK_L}::uuid)
      `;
    }, "23514");

    // basis Evidence Link belonging to another Claim
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claim_standing_transitions
          (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
        values (${FORGERY}::uuid, ${CLAIM_C2}::uuid, 'unassessed', 'basis_qualified',
          ${LINK_L}::uuid)
      `;
    }, "23514");

    // caller supplying the derived revision
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claim_standing_transitions
          (id, claim_id, from_standing, to_standing, basis_evidence_link_id,
           observed_revision_digest)
        values (${FORGERY}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'revalidation_required',
          ${LINK_L}::uuid, decode(repeat('00', 32), 'hex'))
      `;
    }, "42501");

    // caller supplying the recorded time
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claim_standing_transitions
          (id, claim_id, from_standing, to_standing, basis_evidence_link_id, recorded_at)
        values (${FORGERY}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'revalidation_required',
          ${LINK_L}::uuid, now())
      `;
    }, "42501");

    // history is immutable through the normal boundary
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        update public.claim_standing_transitions set to_standing = 'unassessed'
        where id = ${TR1}::uuid
      `;
    }, "42501");
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`delete from public.claim_standing_transitions where id = ${TR1}::uuid`;
    }, "42501");

    // the Claim itself remains unmutable through the normal boundary
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        update public.claims set epistemic_standing = 'unassessed' where id = ${CLAIM_C}::uuid
      `;
    }, "42501");
  } finally {
    await probe.end();
  }
}

/** Falsifier C is established in two parts, because it cannot be established in
 * one without permanently committing a second canonical transition.
 *
 * Part 1, here: session B's transition against the same Claim QUEUES on the row
 * lock taken by session A's open transition, so competing transitions are
 * serialized rather than interleaved. After A rolls back, B's declared prior
 * standing is again truthful and B legitimately succeeds; B is then rolled back.
 *
 * Part 2, in verifyRejections: a transition whose declared prior standing does
 * not match applied standing is rejected by the identical mechanism.
 *
 * Together: two transitions declaring the same prior standing cannot both commit
 * as independently valid, because the second one to reach the lock finds either
 * the same standing (serialized, still truthful) or a changed one (rejected). */
async function verifyConcurrency(sql: Sql): Promise<boolean> {
  const sessionA = connect();
  const sessionB = connect();
  const observer = connect();
  let queued = false;
  let secondSucceededAfterRelease = false;
  let openA = false;
  let sessionBResult: Promise<void> | undefined;

  try {
    await sessionA.unsafe("begin");
    openA = true;
    await sessionA.unsafe("set local role service_role");
    await sessionA`
      insert into public.claim_standing_transitions
        (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
      values (${CONCURRENCY}::uuid, ${CLAIM_C}::uuid, 'basis_qualified',
        'revalidation_required', ${LINK_L}::uuid)
    `;

    const [backend] = await sessionB<{ pid: number }[]>`
      select pg_backend_pid() as pid
    `;

    sessionBResult = (async () => {
      await sessionB.unsafe("begin");
      try {
        await sessionB.unsafe("set local role service_role");
        await sessionB`
          insert into public.claim_standing_transitions
            (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
          values (${STALE_PRIOR}::uuid, ${CLAIM_C}::uuid, 'basis_qualified',
            'revalidation_required', ${LINK_L}::uuid)
        `;
        secondSucceededAfterRelease = true;
      } finally {
        await sessionB.unsafe("rollback").catch(() => undefined);
      }
    })();

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const [activity] = await observer<
        { waiting: boolean; blockers: number }[]
      >`
        select wait_event_type = 'Lock' as waiting,
          cardinality(pg_blocking_pids(${backend.pid}))::integer as blockers
        from pg_stat_activity where pid = ${backend.pid}
      `;
      if (activity?.waiting && activity.blockers > 0) {
        queued = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert(
      queued,
      "the competing transition did not queue on the Claim row lock",
    );

    await sessionA.unsafe("rollback");
    openA = false;
    await sessionBResult;
    assert(
      secondSucceededAfterRelease,
      "the queued transition neither committed nor was rejected after release",
    );
  } finally {
    if (openA) await sessionA.unsafe("rollback").catch(() => undefined);
    await sessionBResult?.catch(() => undefined);
    await Promise.all([sessionA.end(), sessionB.end(), observer.end()]);
  }

  const [residue] = await sql<{ transitions: string; applied: string }[]>`
    select
      (select count(*) from public.claim_standing_transitions)::text as transitions,
      (select epistemic_standing from public.claims where id = ${CLAIM_C}::uuid) as applied
  `;
  assert(
    residue.transitions === "1" && residue.applied === "basis_qualified",
    "a concurrency probe left canonical residue",
  );
  return queued;
}

async function verifyDriftAndReconstruction(sql: Sql): Promise<Observation> {
  await sql.unsafe("begin");
  try {
    await sql`
      update public.thoughts set content = ${DRIFTED_CONTENT} where id = ${GT01}::uuid
    `;
    const drifted = await currentEvidenceDigest(sql);
    assert(drifted === DIGEST_V2, "the frozen drift digest was not reproduced");

    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claim_standing_transitions
        (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
      values (${TR2}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'revalidation_required',
        ${LINK_L}::uuid)
    `;
    await sql.unsafe("reset role");

    const observation = await observe(sql, CLAIM_C);
    assert(
      observation.status === "standing_history_reconstructed",
      `drift observation status is ${observation.status}`,
    );
    assert(
      observation.applied_standing === "revalidation_required" &&
        observation.history.length === 2,
      "the revalidation transition did not extend the chain",
    );
    const [first, second] = observation.history;
    assert(
      first.from_standing === "unassessed" &&
        first.to_standing === "basis_qualified" && first.basis_match,
      "the qualification entry drifted",
    );
    assert(
      second.from_standing === "basis_qualified" &&
        second.to_standing === "revalidation_required" &&
        second.basis_revision_digest === DIGEST_V1 &&
        second.observed_revision_digest === DIGEST_V2 &&
        !second.basis_match,
      "the revalidation entry does not distinguish anchor from observed revision",
    );

    const [link] = await sql<{ digest: string; role: string }[]>`
      select encode(evidence_revision_digest, 'hex') as digest, role
      from public.evidence_links where id = ${LINK_L}::uuid
    `;
    assert(
      link.digest === DIGEST_V1 && link.role === "used_as_basis",
      "Evidence Link L was mutated or treated as stale",
    );

    return observation;
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyNoPropagation(sql: Sql): Promise<void> {
  const before = await sql<Record<string, unknown>[]>`
    select id::text, proposition, scope, claim_kind, origin, epistemic_standing,
      asserted_at::text, subject_referent_id::text, predicate, object_referent_id::text
    from public.claims where id in (${CLAIM_C2}::uuid, ${RELATION_R}::uuid)
    order by id
  `;

  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claim_standing_transitions
        (id, claim_id, from_standing, to_standing, basis_evidence_link_id)
      values (${TR2}::uuid, ${CLAIM_C}::uuid, 'basis_qualified', 'revalidation_required',
        ${LINK_L}::uuid)
    `;
    await sql.unsafe("reset role");
    const during = await sql<Record<string, unknown>[]>`
      select id::text, proposition, scope, claim_kind, origin, epistemic_standing,
        asserted_at::text, subject_referent_id::text, predicate, object_referent_id::text
      from public.claims where id in (${CLAIM_C2}::uuid, ${RELATION_R}::uuid)
      order by id
    `;
    assert(
      JSON.stringify(during) === JSON.stringify(before),
      "a standing transition on C propagated to C2 or relation Claim R",
    );
    const transitions = await sql<{ count: string }[]>`
      select count(*)::text as count from public.claim_standing_transitions
      where claim_id in (${CLAIM_C2}::uuid, ${RELATION_R}::uuid)
    `;
    assert(
      transitions[0].count === "0",
      "a transition was recorded against C2 or R",
    );
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyResidue(sql: Sql): Promise<void> {
  const [residue] = await sql<
    { transitions: string; referents: string; gt01: string; applied: string }[]
  >`
    select
      (select count(*) from public.claim_standing_transitions where id in (
        ${TR2}::uuid, ${STALE_PRIOR}::uuid, ${FORGERY}::uuid,
        ${NO_OP}::uuid, ${CONCURRENCY}::uuid))::text as transitions,
      (select count(*) from public.referents where id in (
        ${TR2}::uuid, ${STALE_PRIOR}::uuid, ${FORGERY}::uuid,
        ${NO_OP}::uuid, ${CONCURRENCY}::uuid))::text as referents,
      (select content from public.thoughts where id = ${GT01}::uuid) as gt01,
      (select epistemic_standing from public.claims where id = ${CLAIM_C}::uuid) as applied
  `;
  assert(
    residue.transitions === "0" && residue.referents === "0",
    "a rollback-only probe left canonical residue",
  );
  assert(
    residue.gt01 ===
      "GT01: The brass heron waits beneath the violet staircase.",
    "GT01 was permanently mutated",
  );
  assert(
    residue.applied === "basis_qualified",
    "Claim C applied standing did not return to the canonical value",
  );
}

const sql = connect();
try {
  await verifyBoundedExpansion(sql);
  const baseline = await verifyBaseline(sql);
  await verifyEncodingAgreement(sql);
  await verifyAtomicity(sql);
  await verifyRejections();
  const queued = await verifyConcurrency(sql);
  const drift = await verifyDriftAndReconstruction(sql);
  await verifyNoPropagation(sql);
  await verifyResidue(sql);

  console.log(JSON.stringify({
    suite: "build-5a-standing-transition-history",
    result: "PASS",
    checks: [
      "bounded-build-5a-expansion",
      "canonical-qualification-baseline",
      "independent-revision-encoding-agreement",
      "transition-and-history-cannot-diverge",
      "stale-prior-no-op-forgery-and-immutability-rejected",
      "competing-transitions-serialized-and-rejected",
      "drift-yields-revalidation-with-anchor-preserved",
      "evidence-link-not-mutated-and-not-stale",
      "no-propagation-to-c2-or-relation-r",
      "probe-residue-absent",
    ],
    observations: {
      baseline,
      concurrency_queued: queued,
      drift,
    },
  }));
} finally {
  await sql.end();
}
