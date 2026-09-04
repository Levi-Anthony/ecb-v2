import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const CLAIM_C = "0f89e778-b16e-4840-9129-a2aa3eb6f697";
const LINK_L = "4c6c0f50-a936-4da6-bb09-233f93320639";
const NO_LINK_PROBE = "8f2b6c04-3d51-4a77-9a20-5c8f0b1d7e63";
const FORGED_LINK_PROBE = "b6a1f0d2-77c4-4e19-8b53-2f9c6a4d1e80";

const EXPECTED_DIGEST =
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

async function expectFailure(
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

type TraceRow = {
  link_id: string | null;
  linked_digest: string | null;
  content: string | null;
  source: string | null;
  microseconds: string | null;
};

async function observeTrace(sql: Sql, claimId: string): Promise<string> {
  const [row] = await sql<TraceRow[]>`
    select
      link.id::text as link_id,
      encode(link.evidence_revision_digest, 'hex') as linked_digest,
      thought.content,
      thought.source,
      ((extract(epoch from thought.captured_at) * 1000000)::bigint)::text as microseconds
    from public.claims as claim
    left join public.evidence_links as link on link.claim_id = claim.id
    left join public.thoughts as thought on thought.id = link.evidence_referent_id
    where claim.id = ${claimId}::uuid
    order by link.id
  `;
  assert(row !== undefined, `Claim ${claimId} is absent`);
  if (row.link_id === null) return "no_recorded_build_3_evidence_link";
  if (row.content === null) return "linked_evidence_unavailable";
  const current = await deriveDigest(
    row.content,
    row.source as string,
    row.microseconds as string,
  );
  return current === row.linked_digest
    ? "linked_revision_match"
    : "linked_revision_mismatch";
}

async function verifyPersistedShape(sql: Sql): Promise<void> {
  const [coupling] = await sql<
    { claims_coupled: string; links_coupled: string }[]
  >`
    select
      (select count(*) from public.claims as claim
        left join public.referents as referent on referent.id = claim.id
        where referent.id is null)::text as claims_coupled,
      (select count(*) from public.evidence_links as link
        left join public.referents as referent on referent.id = link.id
        where referent.id is null)::text as links_coupled
  `;
  assert(
    coupling.claims_coupled === "0" && coupling.links_coupled === "0",
    "a Claim or Evidence Link lost same-UUID Referent coupling",
  );

  const linkForeignKeys = await sql<{ def: string; target: string }[]>`
    select pg_get_constraintdef(oid) as def, confrelid::regclass::text as target
    from pg_constraint
    where conrelid = 'public.evidence_links'::regclass and contype = 'f'
  `;
  assert(
    linkForeignKeys.length === 3 &&
      linkForeignKeys.every((key) =>
        key.def.includes("ON UPDATE RESTRICT") &&
        key.def.includes("ON DELETE RESTRICT")
      ),
    "Evidence Link foreign keys are no longer immediate restrictive",
  );
  assert(
    !linkForeignKeys.some((key) => key.target === "thoughts"),
    "Evidence Link acquired a dependency on Thought retention",
  );

  const [trigger] = await sql<
    {
      security_definer: boolean;
      settings: string[] | null;
      body: string;
    }[]
  >`
    select procedure.prosecdef as security_definer, procedure.proconfig as settings,
      pg_get_functiondef(procedure.oid) as body
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.evidence_links'::regclass
      and not trigger.tgisinternal
  `;
  assert(
    trigger?.security_definer && trigger.settings?.includes('search_path=""'),
    "Evidence Link preparation function lost SECURITY DEFINER or empty search_path",
  );
  assert(
    trigger.body.toLowerCase().includes("for share"),
    "Evidence Link preparation function lost its FOR SHARE evidence lock",
  );

  const [boundary] = await sql<
    {
      claims_rls: boolean;
      links_rls: boolean;
      policies: string;
      claims_update: boolean;
      claims_delete: boolean;
      links_update: boolean;
      links_delete: boolean;
      claims_select: boolean;
      links_select: boolean;
      digest_insert: boolean;
      anon: boolean;
      authenticated: boolean;
    }[]
  >`
    select
      (select relrowsecurity from pg_class where oid = 'public.claims'::regclass) as claims_rls,
      (select relrowsecurity from pg_class where oid = 'public.evidence_links'::regclass) as links_rls,
      (select count(*) from pg_policies where schemaname = 'public'
        and tablename in ('claims', 'evidence_links'))::text as policies,
      has_table_privilege('service_role', 'public.claims', 'update') as claims_update,
      has_table_privilege('service_role', 'public.claims', 'delete') as claims_delete,
      has_table_privilege('service_role', 'public.evidence_links', 'update') as links_update,
      has_table_privilege('service_role', 'public.evidence_links', 'delete') as links_delete,
      has_table_privilege('service_role', 'public.claims', 'select') as claims_select,
      has_table_privilege('service_role', 'public.evidence_links', 'select') as links_select,
      has_column_privilege('service_role', 'public.evidence_links', 'evidence_revision_digest', 'insert') as digest_insert,
      has_any_column_privilege('anon', 'public.evidence_links', 'select, insert, update') as anon,
      has_any_column_privilege('authenticated', 'public.evidence_links', 'select, insert, update') as authenticated
  `;
  assert(
    boundary.claims_rls && boundary.links_rls && boundary.policies === "0",
    "BUILD 3 RLS boundary weakened",
  );
  assert(
    !boundary.claims_update && !boundary.claims_delete &&
      !boundary.links_update && !boundary.links_delete,
    "service_role gained mutation privilege on a BUILD 3 table",
  );
  assert(
    boundary.claims_select && boundary.links_select,
    "service_role lost BUILD 3 read access",
  );
  assert(
    !boundary.digest_insert,
    "service_role can now supply the canonical evidence revision digest",
  );
  assert(
    !boundary.anon && !boundary.authenticated,
    "a client role gained access to a BUILD 3 table",
  );

  const uniques = await sql<{ count: string }[]>`
    select count(*)::text as count
    from pg_index
    where indrelid = 'public.evidence_links'::regclass
      and indisunique
      and indexrelid <> (
        select conindid from pg_constraint
        where conrelid = 'public.evidence_links'::regclass and contype = 'p'
      )
  `;
  assert(
    uniques[0].count === "0",
    "a uniqueness rule now collapses repeated historical evidence use",
  );
}

async function verifyPreservedFixtures(sql: Sql): Promise<void> {
  const [claim] = await sql<
    {
      proposition: string;
      scope: string;
      claim_kind: string;
      origin: string;
      epistemic_standing: string;
      asserted_at: string;
      subject_referent_id: string | null;
      predicate: string | null;
      object_referent_id: string | null;
    }[]
  >`
    select proposition, scope, claim_kind, origin, epistemic_standing,
      asserted_at::text, subject_referent_id::text, predicate, object_referent_id::text
    from public.claims where id = ${CLAIM_C}::uuid
  `;
  assert(
    claim?.proposition ===
        "The described scene contains both a brass heron and a violet staircase." &&
      claim.scope === "worked_trace_03:gt01_interpretation" &&
      claim.claim_kind === "assertion" &&
      claim.origin === "ecb_inference" &&
      claim.epistemic_standing === "unassessed" &&
      claim.asserted_at === "2026-09-04 16:39:38.624321+00" &&
      claim.subject_referent_id === null && claim.predicate === null &&
      claim.object_referent_id === null,
    "accepted BUILD 3 Claim C drifted",
  );

  const [link] = await sql<
    {
      claim_id: string;
      evidence_referent_id: string;
      role: string;
      scheme: string;
      digest: string;
      linked_at: string;
    }[]
  >`
    select claim_id::text, evidence_referent_id::text, role,
      evidence_revision_scheme as scheme,
      encode(evidence_revision_digest, 'hex') as digest, linked_at::text
    from public.evidence_links where id = ${LINK_L}::uuid
  `;
  assert(
    link?.claim_id === CLAIM_C && link.evidence_referent_id === GT01 &&
      link.role === "used_as_basis" &&
      link.scheme === "ecb_thought_revision_v1_sha256" &&
      link.digest === EXPECTED_DIGEST &&
      link.linked_at === "2026-09-04 16:39:38.624321+00",
    "accepted BUILD 3 Evidence Link L drifted",
  );

  const [thought] = await sql<
    { content: string; source: string; microseconds: string }[]
  >`
    select content, source,
      ((extract(epoch from captured_at) * 1000000)::bigint)::text as microseconds
    from public.thoughts where id = ${GT01}::uuid
  `;
  const derived = await deriveDigest(
    thought.content,
    thought.source,
    thought.microseconds,
  );
  assert(
    derived === EXPECTED_DIGEST,
    "the GT01 revision digest is no longer independently reproducible",
  );
}

async function verifyAssertionBehavior(sql: Sql): Promise<void> {
  const probe = connect();
  try {
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope)
          values (${NO_LINK_PROBE}::uuid, '   ', 'cross_build:blank_proposition')
        `;
      },
      "23514",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.claims (id, proposition, scope)
          values (${NO_LINK_PROBE}::uuid, null, 'cross_build:null_proposition')
        `;
      },
      "23514",
    );
    await expectFailure(
      probe,
      async () => {
        await probe.unsafe("set local role service_role");
        await probe`
          insert into public.evidence_links (id, claim_id, evidence_referent_id, evidence_revision_digest)
          values (${FORGED_LINK_PROBE}::uuid, ${CLAIM_C}::uuid, ${GT01}::uuid,
            decode(repeat('00', 32), 'hex'))
        `;
      },
      "42501",
    );
  } finally {
    await probe.end();
  }

  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claims (id, proposition, scope)
      values (${NO_LINK_PROBE}::uuid, 'A BUILD 3 shaped assertion still works.',
        'cross_build:assertion_default')
    `;
    await sql.unsafe("reset role");
    const [inserted] = await sql<
      {
        claim_kind: string;
        origin: string;
        epistemic_standing: string;
        assigned: boolean;
      }[]
    >`
      select claim_kind, origin, epistemic_standing,
        asserted_at = transaction_timestamp() as assigned
      from public.claims where id = ${NO_LINK_PROBE}::uuid
    `;
    assert(
      inserted.claim_kind === "assertion" &&
        inserted.origin === "ecb_inference" &&
        inserted.epistemic_standing === "unassessed" && inserted.assigned,
      "a BUILD 3 shaped assertion insert no longer produces the accepted assertion Claim",
    );
    const status = await observeTrace(sql, NO_LINK_PROBE);
    assert(
      status === "no_recorded_build_3_evidence_link",
      "the no-recorded-basis outcome is no longer producible",
    );
  } finally {
    await sql.unsafe("rollback");
  }
}

async function verifyFourOutcomes(sql: Sql): Promise<string[]> {
  const observed: string[] = [];

  observed.push(await observeTrace(sql, CLAIM_C));
  assert(
    observed[0] === "linked_revision_match",
    "the baseline match outcome regressed",
  );

  await sql.unsafe("begin");
  try {
    await sql`
      update public.thoughts
      set content = 'GT01: The brass heron waits beneath the cobalt staircase.'
      where id = ${GT01}::uuid
    `;
    const status = await observeTrace(sql, CLAIM_C);
    assert(
      status === "linked_revision_mismatch",
      "evidence drift no longer produces an explicit mismatch",
    );
    observed.push(status);
  } finally {
    await sql.unsafe("rollback");
  }

  await sql.unsafe("begin");
  try {
    await sql`delete from public.thoughts where id = ${GT01}::uuid`;
    const status = await observeTrace(sql, CLAIM_C);
    assert(
      status === "linked_evidence_unavailable",
      "evidence disappearance no longer produces an unavailable outcome",
    );
    const [survivors] = await sql<{ claim: boolean; link: boolean }[]>`
      select
        exists(select 1 from public.claims where id = ${CLAIM_C}::uuid) as claim,
        exists(select 1 from public.evidence_links where id = ${LINK_L}::uuid) as link
    `;
    assert(
      survivors.claim && survivors.link,
      "evidence deletion cascaded into the Claim or Evidence Link",
    );
    observed.push(status);
  } finally {
    await sql.unsafe("rollback");
  }

  observed.push("no_recorded_build_3_evidence_link");
  return observed;
}

async function verifyResidue(sql: Sql): Promise<void> {
  const [residue] = await sql<{ claims: string; links: string }[]>`
    select
      (select count(*) from public.claims where id in (
        ${NO_LINK_PROBE}::uuid, ${FORGED_LINK_PROBE}::uuid))::text as claims,
      (select count(*) from public.evidence_links where id = ${FORGED_LINK_PROBE}::uuid)::text as links
  `;
  assert(
    residue.claims === "0" && residue.links === "0",
    "a cross-build probe left canonical residue",
  );
}

const sql = connect();
try {
  await verifyPersistedShape(sql);
  await verifyPreservedFixtures(sql);
  await verifyAssertionBehavior(sql);
  const outcomes = await verifyFourOutcomes(sql);
  await verifyResidue(sql);

  console.log(JSON.stringify({
    suite: "build-3-cross-build-regression",
    result: "PASS",
    checks: [
      "same-uuid-claim-and-link-coupling",
      "restrictive-non-cascading-link-foreign-keys",
      "evidence-link-independent-of-thought-retention",
      "definer-trigger-and-for-share-lock-preserved",
      "least-privilege-not-weakened",
      "no-uniqueness-collapsing-repeated-evidence-use",
      "claim-c-preserved",
      "evidence-link-l-preserved",
      "independent-digest-still-reproducible",
      "accepted-assertion-behavior-preserved",
      "all-four-worked-trace-03-outcomes-producible",
      "probe-residue-absent",
    ],
    outcomes,
  }));
} finally {
  await sql.end();
}
