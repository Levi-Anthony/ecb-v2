import postgres from "postgres";

const GT01 = "19a949ea-a8fc-4250-a386-fa64e5530180";
const CLAIM_C = "0f89e778-b16e-4840-9129-a2aa3eb6f697";
const LINK_L = "4c6c0f50-a936-4da6-bb09-233f93320639";
const CLAIM_C2 = "c7f7d330-e778-4ae5-be96-3a172bea1166";
const RELATION_R = "cb429206-5abd-4adb-8ff9-d6d6a885034c";
const PROBE = "3f0a1c77-95d2-4a6e-b0c1-8d7e2f4a6b90";

const DIGEST_V1 =
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

async function expectRejection(
  sql: Sql,
  statement: () => Promise<unknown>,
  expectedCode?: string,
): Promise<void> {
  await sql.unsafe("begin");
  try {
    await statement();
    throw new Error("expected the statement to be rejected");
  } catch (error) {
    const code = codeOf(error);
    if (code === undefined) throw error;
    if (expectedCode !== undefined && code !== expectedCode) throw error;
  } finally {
    await sql.unsafe("rollback");
  }
}

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

async function observeTrace03(sql: Sql, claimId: string): Promise<string> {
  const [row] = await sql<
    {
      link_id: string | null;
      linked_digest: string | null;
      content: string | null;
      source: string | null;
      microseconds: string | null;
    }[]
  >`
    select
      link.id::text as link_id,
      encode(link.evidence_revision_digest, 'hex') as linked_digest,
      thought.content, thought.source,
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

async function verifyClaimShape(sql: Sql): Promise<void> {
  const constraints = await sql<{ name: string; def: string }[]>`
    select conname as name, pg_get_constraintdef(oid) as def
    from pg_constraint
    where conrelid = 'public.claims'::regclass and contype in ('c', 'f')
    order by conname
  `;
  const byName = new Map(constraints.map((row) => [row.name, row.def]));
  assert(
    byName.has("claims_kind_exclusive_shape"),
    "the BUILD 4 kind-exclusive Claim shape is absent",
  );
  assert(
    byName.get("claims_kind_vocabulary")?.includes("'assertion'") &&
      byName.get("claims_kind_vocabulary")?.includes("'relation'"),
    "claim_kind vocabulary drifted",
  );
  assert(
    byName.get("claims_predicate_vocabulary")?.includes("'depends_on'"),
    "predicate vocabulary drifted",
  );
  assert(
    byName.get("claims_depends_on_not_self")?.includes("'depends_on'"),
    "the self-relation prohibition is no longer predicate-scoped",
  );

  const endpointKeys = constraints.filter((row) =>
    row.def.startsWith("FOREIGN")
  );
  assert(
    endpointKeys.length === 3 &&
      endpointKeys.every((row) =>
        row.def.includes("REFERENCES referents(id)") &&
        row.def.includes("ON UPDATE RESTRICT") &&
        row.def.includes("ON DELETE RESTRICT")
      ),
    "Claim foreign keys are no longer three restrictive Referent references",
  );

  const [uniques] = await sql<{ count: string }[]>`
    select count(*)::text as count from pg_index
    where indrelid = 'public.claims'::regclass and indisunique
      and indexrelid <> (
        select conindid from pg_constraint
        where conrelid = 'public.claims'::regclass and contype = 'p'
      )
  `;
  assert(
    uniques.count === "0",
    "a uniqueness rule now collapses relation Claims",
  );

  const [claimTrigger] = await sql<
    { definer: boolean; settings: string[] | null; body: string }[]
  >`
    select procedure.prosecdef as definer, procedure.proconfig as settings,
      pg_get_functiondef(procedure.oid) as body
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.claims'::regclass and not trigger.tgisinternal
  `;
  assert(
    !claimTrigger.definer && claimTrigger.settings?.includes('search_path=""'),
    "prepare_claim lost SECURITY INVOKER or its empty search_path",
  );
  assert(
    !claimTrigger.body.includes("new.claim_kind :=") &&
      !claimTrigger.body.toLowerCase().includes("for share") &&
      !claimTrigger.body.toLowerCase().includes("for update"),
    "prepare_claim now overwrites claim_kind or takes a row lock",
  );

  const [linkTrigger] = await sql<
    { definer: boolean; settings: string[] | null; body: string }[]
  >`
    select procedure.prosecdef as definer, procedure.proconfig as settings,
      pg_get_functiondef(procedure.oid) as body
    from pg_trigger as trigger
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    where trigger.tgrelid = 'public.evidence_links'::regclass and not trigger.tgisinternal
  `;
  assert(
    linkTrigger.definer && linkTrigger.settings?.includes('search_path=""') &&
      linkTrigger.body.toLowerCase().includes("for share"),
    "prepare_evidence_link lost SECURITY DEFINER or its FOR SHARE lock",
  );

  const linkKeys = await sql<{ target: string }[]>`
    select confrelid::regclass::text as target from pg_constraint
    where conrelid = 'public.evidence_links'::regclass and contype = 'f'
  `;
  assert(
    linkKeys.length === 3 && !linkKeys.some((row) => row.target === "thoughts"),
    "Evidence Link acquired a dependency on Thought retention",
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
      kind_insert: boolean;
      standing_insert: boolean;
      origin_insert: boolean;
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
      has_column_privilege('service_role', 'public.claims', 'claim_kind', 'insert') as kind_insert,
      has_column_privilege('service_role', 'public.claims', 'epistemic_standing', 'insert') as standing_insert,
      has_column_privilege('service_role', 'public.claims', 'origin', 'insert') as origin_insert,
      has_column_privilege('service_role', 'public.evidence_links', 'evidence_revision_digest', 'insert') as digest_insert,
      has_any_column_privilege('anon', 'public.claims', 'select, insert, update') as anon,
      has_any_column_privilege('authenticated', 'public.evidence_links', 'select, insert, update') as authenticated
  `;
  assert(
    boundary.claims_rls && boundary.links_rls && boundary.policies === "0",
    "BUILD 3/4 RLS boundary weakened",
  );
  assert(
    !boundary.claims_update && !boundary.claims_delete &&
      !boundary.links_update && !boundary.links_delete,
    "service_role gained mutation privilege on a BUILD 3/4 table",
  );
  assert(
    boundary.kind_insert && !boundary.standing_insert &&
      !boundary.origin_insert &&
      !boundary.digest_insert,
    "the BUILD 4 Claim insert column boundary drifted",
  );
  assert(
    !boundary.anon && !boundary.authenticated,
    "a client role gained access to a BUILD 3/4 table",
  );
}

async function verifyPreservedFixtures(sql: Sql): Promise<void> {
  // Claim C: BUILD 5A lawfully changes its applied standing, so standing is
  // re-projected as chain-applied rather than asserted as unassessed.
  const [claim] = await sql<
    {
      proposition: string;
      scope: string;
      claim_kind: string;
      origin: string;
      asserted_at: string;
      standing: string;
      chain_tail: string | null;
    }[]
  >`
    select claim.proposition, claim.scope, claim.claim_kind, claim.origin,
      claim.asserted_at::text, claim.epistemic_standing as standing,
      (select transition.to_standing from public.claim_standing_transitions as transition
        where transition.claim_id = claim.id
        order by transition.recorded_at desc limit 1) as chain_tail
    from public.claims as claim where claim.id = ${CLAIM_C}::uuid
  `;
  assert(
    claim.proposition ===
        "The described scene contains both a brass heron and a violet staircase." &&
      claim.scope === "worked_trace_03:gt01_interpretation" &&
      claim.claim_kind === "assertion" && claim.origin === "ecb_inference" &&
      claim.asserted_at === "2026-09-04 16:39:38.624321+00",
    "accepted BUILD 3 Claim C identity drifted",
  );
  assert(
    claim.chain_tail === null
      ? claim.standing === "unassessed"
      : claim.standing === claim.chain_tail,
    "Claim C applied standing is not the value its transition chain applies",
  );

  const [link] = await sql<
    {
      claim_id: string;
      evidence: string;
      role: string;
      scheme: string;
      digest: string;
      linked_at: string;
    }[]
  >`
    select claim_id::text, evidence_referent_id::text as evidence, role,
      evidence_revision_scheme as scheme,
      encode(evidence_revision_digest, 'hex') as digest, linked_at::text
    from public.evidence_links where id = ${LINK_L}::uuid
  `;
  assert(
    link.claim_id === CLAIM_C && link.evidence === GT01 &&
      link.role === "used_as_basis" &&
      link.scheme === "ecb_thought_revision_v1_sha256" &&
      link.digest === DIGEST_V1 &&
      link.linked_at === "2026-09-04 16:39:38.624321+00",
    "accepted BUILD 3 Evidence Link L drifted",
  );

  const [dependent] = await sql<
    { standing: string; kind: string; proposition: string }[]
  >`
    select epistemic_standing as standing, claim_kind as kind, proposition
    from public.claims where id = ${CLAIM_C2}::uuid
  `;
  assert(
    dependent.standing === "unassessed" && dependent.kind === "assertion" &&
      dependent.proposition ===
        "The described scene contains at least two distinct objects.",
    "accepted BUILD 4 Claim C2 drifted",
  );

  const [relation] = await sql<
    {
      standing: string;
      kind: string;
      predicate: string;
      subject: string;
      object: string;
      proposition: string | null;
      scope: string;
    }[]
  >`
    select epistemic_standing as standing, claim_kind as kind, predicate,
      subject_referent_id::text as subject, object_referent_id::text as object,
      proposition, scope
    from public.claims where id = ${RELATION_R}::uuid
  `;
  assert(
    relation.standing === "unassessed" && relation.kind === "relation" &&
      relation.predicate === "depends_on" && relation.subject === CLAIM_C2 &&
      relation.object === CLAIM_C && relation.proposition === null &&
      relation.scope === "worked_trace_06:claim_dependency",
    "accepted BUILD 4 relation Claim R drifted",
  );

  const [thought] = await sql<
    { content: string; source: string; microseconds: string }[]
  >`
    select content, source,
      ((extract(epoch from captured_at) * 1000000)::bigint)::text as microseconds
    from public.thoughts where id = ${GT01}::uuid
  `;
  assert(
    await deriveDigest(
      thought.content,
      thought.source,
      thought.microseconds,
    ) === DIGEST_V1,
    "the GT01 revision digest is no longer independently reproducible",
  );
}

async function verifyFourOutcomes(sql: Sql): Promise<string[]> {
  const observed: string[] = [];
  observed.push(await observeTrace03(sql, CLAIM_C));
  assert(
    observed[0] === "linked_revision_match",
    "the match outcome regressed",
  );

  await sql.unsafe("begin");
  try {
    await sql`
      update public.thoughts
      set content = 'GT01: The brass heron waits beneath the cobalt staircase.'
      where id = ${GT01}::uuid
    `;
    const status = await observeTrace03(sql, CLAIM_C);
    assert(
      status === "linked_revision_mismatch",
      "the mismatch outcome regressed",
    );
    observed.push(status);
  } finally {
    await sql.unsafe("rollback");
  }

  await sql.unsafe("begin");
  try {
    await sql`delete from public.thoughts where id = ${GT01}::uuid`;
    const status = await observeTrace03(sql, CLAIM_C);
    assert(
      status === "linked_evidence_unavailable",
      "the unavailable outcome regressed",
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

  await sql.unsafe("begin");
  try {
    await sql.unsafe("set local role service_role");
    await sql`
      insert into public.claims (id, proposition, scope)
      values (${PROBE}::uuid, 'A BUILD 3 shaped assertion still works.',
        'cross_build:assertion_default')
    `;
    await sql.unsafe("reset role");
    const [inserted] = await sql<
      { kind: string; origin: string; standing: string }[]
    >`
      select claim_kind as kind, origin, epistemic_standing as standing
      from public.claims where id = ${PROBE}::uuid
    `;
    assert(
      inserted.kind === "assertion" && inserted.origin === "ecb_inference" &&
        inserted.standing === "unassessed",
      "a BUILD 3 shaped assertion insert no longer produces the accepted Claim",
    );
    const status = await observeTrace03(sql, PROBE);
    assert(
      status === "no_recorded_build_3_evidence_link",
      "the no-recorded-basis outcome regressed",
    );
    observed.push(status);
  } finally {
    await sql.unsafe("rollback");
  }

  return observed;
}

async function verifyRejections(): Promise<void> {
  const probe = connect();
  try {
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claims (id, proposition, scope)
        values (${PROBE}::uuid, '   ', 'cross_build:blank')
      `;
    }, "23514");
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claims
          (id, scope, claim_kind, subject_referent_id, predicate, object_referent_id)
        values (${PROBE}::uuid, 'cross_build:foreign_predicate', 'relation',
          ${CLAIM_C2}::uuid, 'supports', ${CLAIM_C}::uuid)
      `;
    }, "23514");
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.claims
          (id, scope, claim_kind, subject_referent_id, predicate, object_referent_id)
        values (${PROBE}::uuid, 'cross_build:self', 'relation',
          ${CLAIM_C2}::uuid, 'depends_on', ${CLAIM_C2}::uuid)
      `;
    }, "23514");
    await expectRejection(probe, async () => {
      await probe.unsafe("set local role service_role");
      await probe`
        insert into public.evidence_links
          (id, claim_id, evidence_referent_id, evidence_revision_digest)
        values (${PROBE}::uuid, ${CLAIM_C}::uuid, ${GT01}::uuid,
          decode(repeat('00', 32), 'hex'))
      `;
    }, "42501");
  } finally {
    await probe.end();
  }

  const sql = connect();
  try {
    const [residue] = await sql<{ claims: string; links: string }[]>`
      select
        (select count(*) from public.claims where id = ${PROBE}::uuid)::text as claims,
        (select count(*) from public.evidence_links where id = ${PROBE}::uuid)::text as links
    `;
    assert(
      residue.claims === "0" && residue.links === "0",
      "a cross-build probe left canonical residue",
    );
  } finally {
    await sql.end();
  }
}

const sql = connect();
try {
  await verifyClaimShape(sql);
  await verifyPreservedFixtures(sql);
  const outcomes = await verifyFourOutcomes(sql);
  await verifyRejections();

  console.log(JSON.stringify({
    suite: "build-3-4-cross-build-regression",
    result: "PASS",
    checks: [
      "kind-exclusive-claim-shape-preserved",
      "claim-kind-and-predicate-vocabularies-preserved",
      "predicate-scoped-self-relation-prohibition-preserved",
      "restrictive-referent-endpoints-and-no-native-dependency",
      "no-uniqueness-over-relation-triple",
      "prepare-claim-invoker-and-lock-free",
      "prepare-evidence-link-definer-with-for-share",
      "least-privilege-not-weakened",
      "claim-c-identity-preserved-standing-chain-applied",
      "evidence-link-l-preserved",
      "claim-c2-and-relation-r-preserved",
      "independent-digest-still-reproducible",
      "all-four-worked-trace-03-outcomes-producible",
      "build-4-rejections-preserved",
      "probe-residue-absent",
    ],
    outcomes,
  }));
} finally {
  await sql.end();
}
