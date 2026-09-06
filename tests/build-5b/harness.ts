// Worked Trace 07 rehearsal harness.
//
// Runs the frozen WT07 sequence and challenges P01-P23 against a disposable database. Every
// expected outcome is fixed independently in fixtures.ts or inline below; none is obtained by
// asking the implementation under test what it produces.
//
// This harness performs no canonical contact. It requires REHEARSAL_DATABASE_URL.

// deno-lint-ignore-file no-explicit-any -- postgres.js is dynamically typed at the call surface.
import postgres from "postgres";
import {
  A1_ID,
  A1_TEXT,
  A2_ID,
  A2_P23_TEXT,
  A2_TEXT,
  A_BAD_ID,
  A_BAD_TEXT,
  CHECK1_ID,
  CHECK2_ID,
  CHECKER_ID,
  CLAIM_C,
  CLAIM_C2,
  CONTRACT_ID,
  EXPECTED_WITNESS,
  GT01,
  LINK_L,
  OBLIGATIONS,
  OP1_ID,
  OP2_ID,
  RC1_ID,
  RC2_ID,
  RELATION_R,
  TR1,
  ZERO_DIGEST,
} from "./fixtures.ts";

type Sql = any;

interface Finding {
  id: string;
  title: string;
  expected: string;
  observed: string;
  pass: boolean;
}

const findings: Finding[] = [];

function record(
  id: string,
  title: string,
  expected: string,
  observed: string,
  pass: boolean,
) {
  findings.push({ id, title, expected, observed, pass });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`${mark}  ${id.padEnd(6)} ${title}`);
  if (!pass) {
    console.log(`        expected: ${expected}`);
    console.log(`        observed: ${observed}`);
  }
}

function url(): string {
  const value = Deno.env.get("REHEARSAL_DATABASE_URL");
  if (!value) throw new Error("REHEARSAL_DATABASE_URL is required");
  return value;
}

function serviceUrl(): string {
  const value = Deno.env.get("REHEARSAL_SERVICE_URL");
  if (!value) throw new Error("REHEARSAL_SERVICE_URL is required");
  return value;
}

function client(connection: string): Sql {
  return postgres(connection, { max: 1, onnotice: () => {} });
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

/** The producer. A local transformation over parsed A1; it never creates receipt outcomes. */
function produce(a1Text: string): string {
  const a1 = JSON.parse(a1Text);
  return JSON.stringify({
    format: "basis_v1",
    basis: {
      evidence: a1.basis.evidence,
      link: a1.basis.link,
      scheme: a1.basis.scheme,
      linked_digest: a1.basis.linked_digest,
      observed_digest: a1.basis.observed_digest,
    },
    transition: {
      id: a1.event,
      claim: a1.claim,
      from: a1.from,
      to: a1.to,
      recorded_at: a1.recorded_at,
    },
    scope: a1.scope,
  });
}

async function errorOf(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const uuid = () => crypto.randomUUID();

interface Episode {
  srcId: string;
  opId: string;
  outId: string | null;
  attemptId: string;
}

/** Build source/request/output/attempt in one committed transaction. */
async function buildEpisode(sql: Sql, opts: {
  a1: string;
  a2: string | null;
  producer?: boolean;
  sourceContext?: string;
  targetOverride?: string;
}): Promise<Episode> {
  const srcId = uuid(),
    opId = uuid(),
    outId = opts.a2 === null ? null : uuid(),
    attemptId = uuid();
  await sql.begin(async (tx: Sql) => {
    await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text)
             values (${srcId}, 'source_representation', ${
      opts.sourceContext ?? TR1
    }, ${opts.a1})`;
    await tx`insert into public.artifacts (id, artifact_role, context_id)
             values (${opId}, 'transformation_request', ${srcId})`;
    if (outId !== null) {
      await tx`insert into public.artifacts
                 (id, artifact_role, context_id, payload_text, producer_succeeded)
               values (${outId}, 'transformed_representation', ${opId}, ${opts.a2},
                       ${opts.producer ?? true})`;
    }
    await tx`insert into public.artifacts (id, artifact_role, context_id, target_id)
             values (${attemptId}, 'check_attempt', ${opId},
                     ${opts.targetOverride ?? outId ?? srcId})`;
  });
  return { srcId, opId, outId, attemptId };
}

async function publishReceipt(
  sql: Sql,
  attemptId: string,
  id?: string,
): Promise<any> {
  const receiptId = id ?? uuid();
  await sql`insert into public.artifacts (id, artifact_role, context_id)
            values (${receiptId}, 'transformation_receipt', ${attemptId})`;
  const [row] =
    await sql`select payload_text from public.artifacts where id = ${receiptId}`;
  return JSON.parse(row.payload_text);
}

function checksOf(receipt: any): Record<string, boolean | null> {
  return receipt.checks;
}

function sameChecks(
  actual: Record<string, boolean | null>,
  expected: Record<string, boolean | null>,
): boolean {
  return OBLIGATIONS.every((k) => actual[k] === expected[k]);
}

/**
 * Compare two flat objects by field. Receipt payloads are serialized as PostgreSQL jsonb, which
 * does not preserve key order, so string equality is not a sound comparison for them.
 */
function sameFields(
  actual: Record<string, unknown> | null | undefined,
  expected: Record<string, unknown>,
): boolean {
  if (actual === null || actual === undefined) return false;
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (actualKeys.length !== expectedKeys.length) return false;
  if (!actualKeys.every((k, i) => k === expectedKeys[i])) return false;
  return expectedKeys.every((k) => actual[k] === expected[k]);
}

async function predecessorSnapshot(sql: Sql): Promise<string> {
  const [row] = await sql`
    select
      (select count(*) from public.thoughts) as thoughts,
      (select count(*) from public.claims) as claims,
      (select count(*) from public.evidence_links) as links,
      (select count(*) from public.claim_standing_transitions) as transitions,
      (select string_agg(id::text || ':' || epistemic_standing || ':' || origin || ':' ||
                         asserted_at::text, '|' order by id) from public.claims) as claim_state,
      (select string_agg(id::text || ':' || encode(evidence_revision_digest,'hex') || ':' ||
                         linked_at::text, '|' order by id) from public.evidence_links) as link_state,
      (select string_agg(id::text || ':' || recorded_at::text || ':' ||
                         encode(observed_revision_digest,'hex'), '|' order by id)
       from public.claim_standing_transitions) as transition_state,
      (select string_agg(id::text || ':' || content || ':' || source, '|' order by id)
       from public.thoughts) as thought_state
  `;
  return JSON.stringify(row);
}

/**
 * P19 — the request's checker definition is no longer supported.
 *
 * Runs in its own database, copied from the rehearsal template, so the alternate checker
 * deployment never mutates the authority under test. The alternate deployment preserves behaviour
 * and changes only the recorded definition text, which is exactly what the binding obligation is
 * required to notice. The proof is the recorded before/after definition digests, not a flag.
 */
async function runP19(): Promise<void> {
  const adminUrl = Deno.env.get("REHEARSAL_ADMIN_URL");
  const p19Url = Deno.env.get("REHEARSAL_P19_URL");
  if (!adminUrl || !p19Url) {
    record(
      "P19",
      "alternate checker-definition deployment",
      "performed",
      "NOT PERFORMED",
      false,
    );
    return;
  }

  const admin = client(adminUrl);
  try {
    await admin.unsafe("drop database if exists rehearsal_p19");
    await admin.unsafe("create database rehearsal_p19 template rehearsal");
  } finally {
    await admin.end();
  }

  const p19 = client(p19Url);
  try {
    const episode = await buildEpisode(p19, { a1: A1_TEXT, a2: A2_TEXT });
    const [opRow] =
      await p19`select payload_text from public.artifacts where id = ${episode.opId}`;
    const requestDigest =
      JSON.parse(opRow.payload_text).checker_definition_digest;

    const [defRow] = await p19`
      select pg_get_functiondef(p.oid) as def
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'prepare_build_5b_artifact'`;
    const alternate = defRow.def.replace(
      "declare",
      "declare\n  -- P19 alternate checker deployment: behaviour preserved, definition text changed.",
    );
    if (alternate === defRow.def) {
      throw new Error("P19 could not build an alternate definition");
    }
    await p19.unsafe(alternate);

    const [newDefRow] = await p19`
      select pg_get_functiondef(p.oid) as def
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'prepare_build_5b_artifact'`;
    const installedDigest = await sha256Hex(newDefRow.def);

    const receipt = await publishReceipt(p19, episode.attemptId);
    record(
      "P19",
      "an unsupported checker definition is terminal INCOMPLETE/checker_definition_mismatch",
      "INCOMPLETE, checker_binding null, reason checker_definition_mismatch, other checks not evaluated, digests differ",
      `${receipt.result} binding=${checksOf(receipt).checker_binding} ` +
        `reason=${receipt.reasons.checker_binding} ` +
        `grounding=${
          checksOf(receipt).grounding
        }/${receipt.reasons.grounding} ` +
        `request=${requestDigest.slice(0, 12)} installed=${
          installedDigest.slice(0, 12)
        }`,
      receipt.result === "INCOMPLETE" &&
        checksOf(receipt).checker_binding === null &&
        receipt.reasons.checker_binding === "checker_definition_mismatch" &&
        checksOf(receipt).grounding === null &&
        receipt.reasons.grounding === "not_evaluated" &&
        requestDigest !== installedDigest &&
        receipt.observed_checker_definition_digest === installedDigest,
    );
  } finally {
    await p19.end();
  }
}

async function main(): Promise<void> {
  const sql = client(url());
  const svc = client(serviceUrl());

  try {
    const before = await predecessorSnapshot(sql);

    // ---------------------------------------------------------------------
    // WT07 stage 3 — the seven pre-check Artifacts, one atomic transaction.
    // ---------------------------------------------------------------------
    const producedA2 = produce(A1_TEXT);
    record(
      "PROD",
      "producer reproduces the frozen A2 bytes from A1",
      A2_TEXT,
      producedA2,
      producedA2 === A2_TEXT,
    );

    await svc.begin(async (tx: Sql) => {
      await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text)
               values (${A1_ID}, 'source_representation', ${TR1}, ${A1_TEXT})`;
      await tx`insert into public.artifacts (id, artifact_role, context_id)
               values (${OP1_ID}, 'transformation_request', ${A1_ID})`;
      await tx`insert into public.artifacts
                 (id, artifact_role, context_id, payload_text, producer_succeeded)
               values (${A2_ID}, 'transformed_representation', ${OP1_ID}, ${A2_TEXT}, true)`;
      await tx`insert into public.artifacts (id, artifact_role, context_id, target_id)
               values (${CHECK1_ID}, 'check_attempt', ${OP1_ID}, ${A2_ID})`;
      await tx`insert into public.artifacts (id, artifact_role, context_id)
               values (${OP2_ID}, 'transformation_request', ${A1_ID})`;
      await tx`insert into public.artifacts
                 (id, artifact_role, context_id, payload_text, producer_succeeded)
               values (${A_BAD_ID}, 'transformed_representation', ${OP2_ID}, ${A_BAD_TEXT}, true)`;
      await tx`insert into public.artifacts (id, artifact_role, context_id, target_id)
               values (${CHECK2_ID}, 'check_attempt', ${OP2_ID}, ${A_BAD_ID})`;
    });

    const [stage3] = await sql`select count(*)::int as n from public.artifacts`;
    record(
      "S3",
      "stage 3 commits exactly seven pre-check Artifacts",
      "7",
      String(stage3.n),
      stage3.n === 7,
    );

    // ---------------------------------------------------------------------
    // WT07 stage 4 — receipts in a different top-level transaction.
    // ---------------------------------------------------------------------
    const rc1 = await publishReceipt(svc, CHECK1_ID, RC1_ID);
    const rc2 = await publishReceipt(svc, CHECK2_ID, RC2_ID);

    record(
      "RC1",
      "RC1 all six components true, result PASS",
      "PASS with six true",
      `${rc1.result} ${JSON.stringify(checksOf(rc1))}`,
      rc1.result === "PASS" &&
        OBLIGATIONS.every((k) => checksOf(rc1)[k] === true),
    );
    record(
      "RC1w",
      "RC1 source witness is exactly the inherited episode",
      JSON.stringify(EXPECTED_WITNESS),
      JSON.stringify(rc1.source_witness),
      sameFields(rc1.source_witness, EXPECTED_WITNESS),
    );
    record(
      "RC1c",
      "RC1 coverage reports both directions and correct scope",
      "grounding_and_preservation / recorded_transition_only",
      `${rc1.coverage} / ${rc1.scope}`,
      rc1.coverage === "grounding_and_preservation" &&
        rc1.scope === "recorded_transition_only",
    );
    record(
      "RC1h",
      "RC1 input and output digests recompute from retained text",
      `${await sha256Hex(A1_TEXT)} / ${await sha256Hex(A2_TEXT)}`,
      `${rc1.input_digest} / ${rc1.output_digest}`,
      rc1.input_digest === await sha256Hex(A1_TEXT) &&
        rc1.output_digest === await sha256Hex(A2_TEXT),
    );
    record(
      "RC2",
      "RC2 producer true, output_format false, grounding true, preservation not evaluated, FAIL",
      "FAIL / of=false gr=true pr=null / producer true",
      `${rc2.result} / of=${checksOf(rc2).output_format} gr=${
        checksOf(rc2).grounding
      } ` +
        `pr=${checksOf(rc2).preservation} / producer ${rc2.producer_succeeded}`,
      rc2.result === "FAIL" && checksOf(rc2).output_format === false &&
        checksOf(rc2).grounding === true &&
        checksOf(rc2).preservation === null &&
        rc2.producer_succeeded === true &&
        rc2.reasons.preservation === "not_evaluated",
    );

    // ---------------------------------------------------------------------
    // P23 — same-checker preservation sensitivity control.
    // ---------------------------------------------------------------------
    const p23Control = await buildEpisode(svc, { a1: A1_TEXT, a2: A2_TEXT });
    const p23Mutant = await buildEpisode(svc, { a1: A1_TEXT, a2: A2_P23_TEXT });
    const controlReceipt = await publishReceipt(svc, p23Control.attemptId);
    const mutantReceipt = await publishReceipt(svc, p23Mutant.attemptId);

    const p23Expected = {
      input_format: true,
      output_format: true,
      participation: true,
      grounding: true,
      preservation: false,
      checker_binding: true,
    };
    record(
      "P23",
      "same checker: unchanged A2 passes, zero-digest A2 fails only on preservation",
      `control PASS six true; mutant FAIL ${JSON.stringify(p23Expected)}`,
      `control ${controlReceipt.result} ${
        JSON.stringify(checksOf(controlReceipt))
      }; ` +
        `mutant ${mutantReceipt.result} ${
          JSON.stringify(checksOf(mutantReceipt))
        }`,
      controlReceipt.result === "PASS" &&
        OBLIGATIONS.every((k) => checksOf(controlReceipt)[k] === true) &&
        mutantReceipt.result === "FAIL" &&
        sameChecks(checksOf(mutantReceipt), p23Expected) &&
        mutantReceipt.reasons.preservation === "mismatch",
    );
    record(
      "P23a",
      "P23's sole payload mutation is basis.observed_digest set to 64 zero characters",
      `one substitution of ${
        ZERO_DIGEST.slice(0, 8)
      }... and no other difference`,
      `differs_only_in_observed_digest=${
        A2_P23_TEXT.replace(
          ZERO_DIGEST,
          "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
        ) ===
          A2_TEXT
      } contains_zero_digest=${A2_P23_TEXT.includes(ZERO_DIGEST)}`,
      A2_P23_TEXT.includes(ZERO_DIGEST) &&
        A2_P23_TEXT.replace(
            ZERO_DIGEST,
            "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
          ) === A2_TEXT,
    );
    record(
      "P23b",
      "P23 control and mutant ran under the identical checker definition digest",
      "equal observed checker definition digests",
      `${controlReceipt.observed_checker_definition_digest} vs ` +
        `${mutantReceipt.observed_checker_definition_digest}`,
      controlReceipt.observed_checker_definition_digest ===
        mutantReceipt.observed_checker_definition_digest,
    );

    // ---------------------------------------------------------------------
    // P01 — immutability, including no-op and zero-row statements.
    // ---------------------------------------------------------------------
    const mutations: [string, () => Promise<unknown>][] = [
      [
        "update payload",
        () =>
          svc`update public.artifacts set payload_text = 'x' where id = ${A1_ID}`,
      ],
      [
        "no-op update",
        () =>
          svc`update public.artifacts set payload_text = payload_text where id = ${A1_ID}`,
      ],
      [
        "zero-row update",
        () =>
          svc`update public.artifacts set payload_text = 'x' where id = ${uuid()}`,
      ],
      ["delete", () => svc`delete from public.artifacts where id = ${A1_ID}`],
      [
        "zero-row delete",
        () => svc`delete from public.artifacts where id = ${uuid()}`,
      ],
      ["truncate", () => svc`truncate public.artifacts`],
    ];
    const rejects: string[] = [];
    for (const [label, fn] of mutations) {
      const err = await errorOf(fn);
      rejects.push(`${label}:${err === null ? "ACCEPTED" : "rejected"}`);
    }
    const [afterP01] =
      await sql`select payload_text from public.artifacts where id = ${A1_ID}`;
    record(
      "P01",
      "every update/delete/truncate rejects; original bytes survive",
      "all six rejected and A1 bytes unchanged",
      `${rejects.join(", ")}; bytes ${
        afterP01.payload_text === A1_TEXT ? "intact" : "CHANGED"
      }`,
      rejects.every((r) => r.endsWith("rejected")) &&
        afterP01.payload_text === A1_TEXT,
    );

    // ---------------------------------------------------------------------
    // P02 — locator substituted for retained payload.
    // ---------------------------------------------------------------------
    const locator = JSON.stringify({
      uri: "https://example.invalid/a1.json",
      digest: await sha256Hex(A1_TEXT),
    });
    const p02 = await buildEpisode(svc, { a1: locator, a2: A2_TEXT });
    const p02Receipt = await publishReceipt(svc, p02.attemptId);
    record(
      "P02",
      "a URI/digest stand-in for A1 cannot reach PASS",
      "not PASS, input_format false",
      `${p02Receipt.result} input_format=${checksOf(p02Receipt).input_format}`,
      p02Receipt.result !== "PASS" &&
        checksOf(p02Receipt).input_format === false,
    );

    // ---------------------------------------------------------------------
    // P03 — covered by RC2 above; asserted here as its own line.
    // ---------------------------------------------------------------------
    record(
      "P03",
      "producer declares success on A_BAD; observed result is FAIL and flag stays true",
      "FAIL with producer_succeeded true",
      `${rc2.result} producer_succeeded=${rc2.producer_succeeded}`,
      rc2.result === "FAIL" && rc2.producer_succeeded === true,
    );

    // ---------------------------------------------------------------------
    // P04 — each episode scalar mutated in A1 and mapped faithfully into A2.
    // Expected outcome fixed independently: grounding false, preservation true.
    // ---------------------------------------------------------------------
    const scalarMutations: [string, (o: Record<string, unknown>) => void][] = [
      ["event", (o) => o.event = "11111111-1111-4111-8111-111111111111"],
      ["claim", (o) => o.claim = "22222222-2222-4222-8222-222222222222"],
      ["from", (o) => o.from = "basis_qualified"],
      ["to", (o) => o.to = "unassessed"],
      ["recorded_at", (o) => o.recorded_at = "2020-01-01T00:00:00.000000Z"],
      [
        "basis.link",
        (o) =>
          (o.basis as Record<string, unknown>).link =
            "33333333-3333-4333-8333-333333333333",
      ],
      [
        "basis.evidence",
        (o) =>
          (o.basis as Record<string, unknown>).evidence =
            "44444444-4444-4444-8444-444444444444",
      ],
      [
        "basis.linked_digest",
        (o) =>
          (o.basis as Record<string, unknown>).linked_digest = "a".repeat(64),
      ],
      [
        "basis.observed_digest",
        (o) =>
          (o.basis as Record<string, unknown>).observed_digest = "b".repeat(64),
      ],
    ];
    const p04Results: string[] = [];
    for (const [label, mutate] of scalarMutations) {
      const parsed = JSON.parse(A1_TEXT);
      mutate(parsed);
      const mutatedA1 = JSON.stringify(parsed);
      const faithfulA2 = produce(mutatedA1);
      const ep = await buildEpisode(svc, { a1: mutatedA1, a2: faithfulA2 });
      const receipt = await publishReceipt(svc, ep.attemptId);
      const ok = receipt.result === "FAIL" &&
        checksOf(receipt).grounding === false &&
        checksOf(receipt).preservation === true;
      p04Results.push(
        `${label}:${
          ok
            ? "ok"
            : `${receipt.result}/g=${checksOf(receipt).grounding}/p=${
              checksOf(receipt).preservation
            }`
        }`,
      );
    }
    record(
      "P04",
      "faithfully mapped wrong source values give grounding false, preservation true, FAIL",
      "all nine scalars ok",
      p04Results.join(", "),
      p04Results.every((r) => r.endsWith(":ok")),
    );

    // ---------------------------------------------------------------------
    // P05 — request obligations cannot be rewritten or caller-supplied.
    // ---------------------------------------------------------------------
    const forgedSpec = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, payload_text)
          values (${uuid()}, 'transformation_request', ${A1_ID}, '{"contract_id":"weak"}')`
    );
    const rewriteSpec = await errorOf(() =>
      svc`update public.artifacts set payload_text = '{"contract_id":"weak"}' where id = ${OP1_ID}`
    );
    const forgedReceipt = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, payload_text)
          values (${uuid()}, 'transformation_receipt', ${CHECK1_ID}, '{"result":"PASS"}')`
    );
    const freshRequest = await buildEpisode(svc, { a1: A1_TEXT, a2: A2_TEXT });
    const [freshOp] =
      await sql`select payload_text from public.artifacts where id = ${freshRequest.opId}`;
    const [origOp] =
      await sql`select payload_text from public.artifacts where id = ${OP1_ID}`;
    record(
      "P05",
      "forged/rewritten spec and caller receipt payload all reject; a new request uses the same fixed rule",
      "three rejections and identical derived specification",
      `spec:${forgedSpec ? "rejected" : "ACCEPTED"} update:${
        rewriteSpec ? "rejected" : "ACCEPTED"
      } ` +
        `receipt:${forgedReceipt ? "rejected" : "ACCEPTED"} ` +
        `spec_identical:${freshOp.payload_text === origOp.payload_text}`,
      forgedSpec !== null && rewriteSpec !== null && forgedReceipt !== null &&
        freshOp.payload_text === origOp.payload_text,
    );

    // ---------------------------------------------------------------------
    // P06 — a passing receipt cannot be reused for another tuple.
    // ---------------------------------------------------------------------
    const reuseId = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id)
          values (${RC1_ID}, 'transformation_receipt', ${p23Control.attemptId})`
    );
    const wrongParticipation = await buildEpisode(svc, {
      a1: A1_TEXT,
      a2: A2_TEXT,
      targetOverride: A1_ID, // an existing Artifact that is not this operation's output
    });
    const wrongPartReceipt = await publishReceipt(
      svc,
      wrongParticipation.attemptId,
    );
    record(
      "P06",
      "receipt row id reuse rejects; wrong output participation is FAIL, never a copied PASS",
      "id reuse rejected; participation false and result FAIL",
      `reuse:${reuseId ? "rejected" : "ACCEPTED"} ` +
        `participation=${
          checksOf(wrongPartReceipt).participation
        } ${wrongPartReceipt.result}`,
      reuseId !== null && checksOf(wrongPartReceipt).participation === false &&
        wrongPartReceipt.result === "FAIL",
    );

    // ---------------------------------------------------------------------
    // P07 — aborting receipt publication leaves the attempt incomplete.
    // ---------------------------------------------------------------------
    const p07 = await buildEpisode(svc, { a1: A1_TEXT, a2: A2_TEXT });
    const p07ReceiptId = uuid();
    await errorOf(() =>
      svc.begin(async (tx: Sql) => {
        await tx`insert into public.artifacts (id, artifact_role, context_id)
                 values (${p07ReceiptId}, 'transformation_receipt', ${p07.attemptId})`;
        throw new Error("abort publication");
      })
    );
    const [p07Receipts] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_receipt' and context_id = ${p07.attemptId}`;
    const [p07Ref] = await sql`
      select count(*)::int as n from public.referents where id = ${p07ReceiptId}`;
    record(
      "P07",
      "aborted receipt publication removes receipt and its Referent; attempt stays incomplete",
      "0 receipts and 0 orphan Referents",
      `receipts=${p07Receipts.n} referents=${p07Ref.n}`,
      p07Receipts.n === 0 && p07Ref.n === 0,
    );

    // ---------------------------------------------------------------------
    // P08 — the three distinct absence states.
    // ---------------------------------------------------------------------
    const noAttemptSrc = uuid(), noAttemptOp = uuid();
    await svc.begin(async (tx: Sql) => {
      await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text)
               values (${noAttemptSrc}, 'source_representation', ${TR1}, ${A1_TEXT})`;
      await tx`insert into public.artifacts (id, artifact_role, context_id)
               values (${noAttemptOp}, 'transformation_request', ${noAttemptSrc})`;
    });
    const [noAttempt] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'check_attempt' and context_id = ${noAttemptOp}`;

    const committedNoReceipt = await buildEpisode(svc, {
      a1: A1_TEXT,
      a2: A2_TEXT,
    });
    const [noReceipt] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_receipt' and context_id = ${committedNoReceipt.attemptId}`;

    const bareTarget = uuid();
    await svc`insert into public.referents (id) values (${bareTarget})`;
    const registeredNoNative = await buildEpisode(svc, {
      a1: A1_TEXT,
      a2: null,
      targetOverride: bareTarget,
    });
    const unavailableReceipt = await publishReceipt(
      svc,
      registeredNoNative.attemptId,
    );
    record(
      "P08",
      "NO_CHECK_PERFORMED, INCOMPLETE/no terminal observation, and terminal INCOMPLETE/unavailable are distinct",
      "0 attempts; 0 receipts; terminal INCOMPLETE with unavailable output",
      `attempts=${noAttempt.n} receipts=${noReceipt.n} terminal=${unavailableReceipt.result}/` +
        `${unavailableReceipt.reasons.output_format}`,
      noAttempt.n === 0 && noReceipt.n === 0 &&
        unavailableReceipt.result === "INCOMPLETE" &&
        unavailableReceipt.reasons.output_format === "unavailable" &&
        checksOf(unavailableReceipt).output_format === null,
    );

    // ---------------------------------------------------------------------
    // P09 — A1 and A2 internally consistent but both built from a corrupted source cache.
    // ---------------------------------------------------------------------
    const corrupted = JSON.parse(A1_TEXT);
    corrupted.basis.observed_digest = "c".repeat(64);
    corrupted.recorded_at = "2019-05-05T05:05:05.050505Z";
    const corruptedA1 = JSON.stringify(corrupted);
    const p09 = await buildEpisode(svc, {
      a1: corruptedA1,
      a2: produce(corruptedA1),
    });
    const p09Receipt = await publishReceipt(svc, p09.attemptId);
    record(
      "P09",
      "self-consistent pair from a corrupted cache still gives grounding false",
      "grounding false, preservation true, FAIL",
      `${p09Receipt.result} g=${checksOf(p09Receipt).grounding} p=${
        checksOf(p09Receipt).preservation
      }`,
      p09Receipt.result === "FAIL" &&
        checksOf(p09Receipt).grounding === false &&
        checksOf(p09Receipt).preservation === true,
    );

    // ---------------------------------------------------------------------
    // P10 — branching: two operations share A1.
    // ---------------------------------------------------------------------
    const [shared] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_request' and context_id = ${A1_ID}`;
    record(
      "P10",
      "two operations share A1 and both persist with no successor or currentness implication",
      ">= 2 requests on A1, RC1 PASS and RC2 FAIL both retained",
      `requests=${shared.n} rc1=${rc1.result} rc2=${rc2.result}`,
      shared.n >= 2 && rc1.result === "PASS" && rc2.result === "FAIL",
    );

    // ---------------------------------------------------------------------
    // P11 — unregistered target rejects; registered-but-native-missing is INCOMPLETE.
    // ---------------------------------------------------------------------
    const unregistered = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, target_id)
          values (${uuid()}, 'check_attempt', ${OP1_ID}, ${uuid()})`
    );
    record(
      "P11",
      "attempt on an unregistered output id rejects; registered-but-absent output is INCOMPLETE",
      "rejected; INCOMPLETE",
      `${unregistered ? "rejected" : "ACCEPTED"}; ${unavailableReceipt.result}`,
      unregistered !== null && unavailableReceipt.result === "INCOMPLETE",
    );

    // ---------------------------------------------------------------------
    // P13 — strict format before lossy parsing.
    // ---------------------------------------------------------------------
    const dupTop = A1_TEXT.replace(
      '{"format":"transition_v1"',
      '{"format":"transition_v1","format":"transition_v1"',
    );
    const dupNested = A1_TEXT.replace(
      '"basis":{"link":',
      '"basis":{"link":"4c6c0f50-a936-4da6-bb09-233f93320639","link":',
    );
    const malformed = A1_TEXT.slice(0, -1);
    const nonString = A1_TEXT.replace('"from":"unassessed"', '"from":123');
    const extraKey = A1_TEXT.replace(
      '"scope":"recorded_transition_only"',
      '"scope":"recorded_transition_only","truth":"yes"',
    );
    const p13Cases: [string, string][] = [
      ["duplicate top-level key", dupTop],
      ["duplicate nested key", dupNested],
      ["malformed JSON", malformed],
      ["number where string required", nonString],
      ["extra truth field", extraKey],
    ];
    const p13Results: string[] = [];
    for (const [label, text] of p13Cases) {
      const ep = await buildEpisode(svc, { a1: text, a2: A2_TEXT });
      const receipt = await publishReceipt(svc, ep.attemptId);
      const [stored] =
        await sql`select payload_text from public.artifacts where id = ${ep.srcId}`;
      const ok = receipt.result !== "PASS" &&
        checksOf(receipt).input_format === false &&
        stored.payload_text === text;
      p13Results.push(`${label}:${ok ? "ok" : receipt.result}`);
    }
    record(
      "P13",
      "duplicate keys (top and nested), malformed JSON, wrong types and extra fields all fail format with bytes retained",
      "all five ok",
      p13Results.join(", "),
      p13Results.every((r) => r.endsWith(":ok")),
    );

    // ---------------------------------------------------------------------
    // P14 — same-transaction and SAVEPOINT bypass.
    // ---------------------------------------------------------------------
    const sameTx = await errorOf(() =>
      svc.begin(async (tx: Sql) => {
        const s = uuid(), o = uuid(), out = uuid(), a = uuid();
        await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text)
                 values (${s}, 'source_representation', ${TR1}, ${A1_TEXT})`;
        await tx`insert into public.artifacts (id, artifact_role, context_id)
                 values (${o}, 'transformation_request', ${s})`;
        await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text, producer_succeeded)
                 values (${out}, 'transformed_representation', ${o}, ${A2_TEXT}, true)`;
        await tx`insert into public.artifacts (id, artifact_role, context_id, target_id)
                 values (${a}, 'check_attempt', ${o}, ${out})`;
        await tx`insert into public.artifacts (id, artifact_role, context_id)
                 values (${uuid()}, 'transformation_receipt', ${a})`;
      })
    );
    const savepoint = await errorOf(() =>
      svc.begin(async (tx: Sql) => {
        const s = uuid(), o = uuid(), out = uuid(), a = uuid();
        await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text)
                 values (${s}, 'source_representation', ${TR1}, ${A1_TEXT})`;
        await tx`insert into public.artifacts (id, artifact_role, context_id)
                 values (${o}, 'transformation_request', ${s})`;
        await tx`insert into public.artifacts (id, artifact_role, context_id, payload_text, producer_succeeded)
                 values (${out}, 'transformed_representation', ${o}, ${A2_TEXT}, true)`;
        await tx`insert into public.artifacts (id, artifact_role, context_id, target_id)
                 values (${a}, 'check_attempt', ${o}, ${out})`;
        await tx.savepoint(async (sp: Sql) => {
          await sp`insert into public.artifacts (id, artifact_role, context_id)
                   values (${uuid()}, 'transformation_receipt', ${a})`;
        });
      })
    );
    record(
      "P14",
      "receipt in the attempt's own transaction rejects, directly and through a SAVEPOINT",
      "both rejected on the committed-attempt boundary",
      `same_tx:${sameTx ? "rejected" : "ACCEPTED"} savepoint:${
        savepoint ? "rejected" : "ACCEPTED"
      }`,
      sameTx !== null && savepoint !== null &&
        sameTx.includes("different top-level transaction") &&
        savepoint.includes("different top-level transaction"),
    );

    // ---------------------------------------------------------------------
    // P15 — computed then rolled back before commit.
    // ---------------------------------------------------------------------
    const p15 = await buildEpisode(svc, { a1: A1_TEXT, a2: A2_TEXT });
    await errorOf(() =>
      svc.begin(async (tx: Sql) => {
        const [row] =
          await tx`insert into public.artifacts (id, artifact_role, context_id)
                               values (${uuid()}, 'transformation_receipt', ${p15.attemptId})
                               returning payload_text`;
        if (!row) throw new Error("no returning row");
        throw new Error("simulated disconnect before commit");
      })
    );
    const fresh = client(url());
    const [p15Rows] = await fresh`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_receipt' and context_id = ${p15.attemptId}`;
    const [p15Attempt] = await fresh`
      select count(*)::int as n from public.artifacts where id = ${p15.attemptId}`;
    await fresh.end();
    record(
      "P15",
      "INSERT RETURNING before an aborted commit leaves a committed attempt and no receipt",
      "attempt present, 0 receipts",
      `attempt=${p15Attempt.n} receipts=${p15Rows.n}`,
      p15Attempt.n === 1 && p15Rows.n === 0,
    );

    // ---------------------------------------------------------------------
    // P16 — an uncommitted attempt is invisible to another session.
    // ---------------------------------------------------------------------
    const sessionA = client(serviceUrl());
    const sessionB = client(serviceUrl());
    const p16Ids = { s: uuid(), o: uuid(), out: uuid(), a: uuid() };
    await sessionA.unsafe("begin");
    await sessionA`insert into public.artifacts (id, artifact_role, context_id, payload_text)
                   values (${p16Ids.s}, 'source_representation', ${TR1}, ${A1_TEXT})`;
    await sessionA`insert into public.artifacts (id, artifact_role, context_id)
                   values (${p16Ids.o}, 'transformation_request', ${p16Ids.s})`;
    await sessionA`insert into public.artifacts (id, artifact_role, context_id, payload_text, producer_succeeded)
                   values (${p16Ids.out}, 'transformed_representation', ${p16Ids.o}, ${A2_TEXT}, true)`;
    await sessionA`insert into public.artifacts (id, artifact_role, context_id, target_id)
                   values (${p16Ids.a}, 'check_attempt', ${p16Ids.o}, ${p16Ids.out})`;
    const invisible = await errorOf(() =>
      sessionB`insert into public.artifacts (id, artifact_role, context_id)
               values (${uuid()}, 'transformation_receipt', ${p16Ids.a})`
    );
    await sessionA.unsafe("commit");
    const afterCommit = await publishReceipt(sessionB, p16Ids.a);
    await sessionA.end();
    await sessionB.end();
    record(
      "P16",
      "an uncommitted attempt cannot be checked; after its commit a new transaction can",
      "rejected while uncommitted, then PASS",
      `invisible:${
        invisible ? "rejected" : "ACCEPTED"
      } after:${afterCommit.result}`,
      invisible !== null && afterCommit.result === "PASS",
    );

    // ---------------------------------------------------------------------
    // P17 — one terminal result per attempt, both branches.
    // ---------------------------------------------------------------------
    const winnerCommits = await buildEpisode(svc, { a1: A1_TEXT, a2: A2_TEXT });
    const w1 = client(serviceUrl());
    const w2 = client(serviceUrl());
    await w1.unsafe("begin");
    await w1`insert into public.artifacts (id, artifact_role, context_id)
             values (${uuid()}, 'transformation_receipt', ${winnerCommits.attemptId})`;
    const loserId = uuid();
    const loserPromise = errorOf(() =>
      w2`insert into public.artifacts (id, artifact_role, context_id)
         values (${loserId}, 'transformation_receipt', ${winnerCommits.attemptId})`
    );
    await new Promise((r) => setTimeout(r, 250));
    await w1.unsafe("commit");
    const loserError = await loserPromise;
    const [committedCount] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_receipt' and context_id = ${winnerCommits.attemptId}`;
    const [loserRef] =
      await sql`select count(*)::int as n from public.referents where id = ${loserId}`;

    const winnerRollsBack = await buildEpisode(svc, {
      a1: A1_TEXT,
      a2: A2_TEXT,
    });
    await w1.unsafe("begin");
    await w1`insert into public.artifacts (id, artifact_role, context_id)
             values (${uuid()}, 'transformation_receipt', ${winnerRollsBack.attemptId})`;
    const secondId = uuid();
    const secondPromise = errorOf(() =>
      w2`insert into public.artifacts (id, artifact_role, context_id)
         values (${secondId}, 'transformation_receipt', ${winnerRollsBack.attemptId})`
    );
    await new Promise((r) => setTimeout(r, 250));
    await w1.unsafe("rollback");
    const secondError = await secondPromise;
    const [rollbackCount] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_receipt' and context_id = ${winnerRollsBack.attemptId}`;
    await w1.end();
    await w2.end();
    record(
      "P17",
      "concurrent publishers: winner-commit blocks the loser, winner-rollback lets the other through",
      "commit branch 1 receipt + loser rejected + no orphan Referent; rollback branch 1 receipt + second succeeds",
      `commit: receipts=${committedCount.n} loser=${
        loserError ? "rejected" : "ACCEPTED"
      } ` +
        `orphan=${loserRef.n}; rollback: receipts=${rollbackCount.n} ` +
        `second=${secondError ? "rejected" : "succeeded"}`,
      committedCount.n === 1 && loserError !== null && loserRef.n === 0 &&
        rollbackCount.n === 1 && secondError === null,
    );

    // ---------------------------------------------------------------------
    // P18 — re-submitting a completed attempt.
    // ---------------------------------------------------------------------
    const duplicate = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id)
          values (${uuid()}, 'transformation_receipt', ${CHECK1_ID})`
    );
    const [rc1Count] = await sql`
      select count(*)::int as n from public.artifacts
      where artifact_role = 'transformation_receipt' and context_id = ${CHECK1_ID}`;
    record(
      "P18",
      "re-submitting a completed attempt adds no second receipt and no orphan Referent",
      "rejected, still exactly 1 receipt",
      `${duplicate ? "rejected" : "ACCEPTED"} receipts=${rc1Count.n}`,
      duplicate !== null && rc1Count.n === 1,
    );

    // ---------------------------------------------------------------------
    // P20 — forged derived columns.
    // ---------------------------------------------------------------------
    const forgeDigest = await errorOf(() =>
      sql`insert into public.artifacts (id, artifact_role, context_id, payload_text, payload_digest)
          values (${uuid()}, 'source_representation', ${TR1}, ${A1_TEXT}, '\\x00'::bytea)`
    );
    const forgeXid = await errorOf(() =>
      sql`insert into public.artifacts (id, artifact_role, context_id, payload_text, created_xid)
          values (${uuid()}, 'source_representation', ${TR1}, ${A1_TEXT}, '1'::xid8)`
    );
    const forgeTime = await errorOf(() =>
      sql`insert into public.artifacts (id, artifact_role, context_id, payload_text, recorded_at)
          values (${uuid()}, 'source_representation', ${TR1}, ${A1_TEXT}, now())`
    );
    const forgeFlag = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, payload_text, producer_succeeded)
          values (${uuid()}, 'source_representation', ${TR1}, ${A1_TEXT}, true)`
    );
    const grantBlocked = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, payload_text, payload_digest)
          values (${uuid()}, 'source_representation', ${TR1}, ${A1_TEXT}, '\\x00'::bytea)`
    );
    const digestRows =
      await sql`select id, payload_text, encode(payload_digest,'hex') as d
                                 from public.artifacts order by recorded_at limit 200`;
    let digestsOk = true;
    for (const row of digestRows) {
      if (await sha256Hex(row.payload_text) !== row.d) digestsOk = false;
    }
    record(
      "P20",
      "forged digest/xid/time/producer-flag reject; every retained payload hash recomputes",
      "five rejections and all digests independently reproduced",
      `digest:${forgeDigest ? "rejected" : "ACCEPTED"} xid:${
        forgeXid ? "rejected" : "ACCEPTED"
      } ` +
        `time:${forgeTime ? "rejected" : "ACCEPTED"} flag:${
          forgeFlag ? "rejected" : "ACCEPTED"
        } ` +
        `grant:${grantBlocked ? "rejected" : "ACCEPTED"} hashes:${digestsOk}`,
      forgeDigest !== null && forgeXid !== null && forgeTime !== null &&
        forgeFlag !== null &&
        grantBlocked !== null && digestsOk,
    );

    // ---------------------------------------------------------------------
    // P21 — unavailable source versus contradicting source.
    // ---------------------------------------------------------------------
    const bareSource = uuid();
    await svc`insert into public.referents (id) values (${bareSource})`;
    const noEvent = await buildEpisode(svc, {
      a1: A1_TEXT,
      a2: A2_TEXT,
      sourceContext: bareSource,
    });
    const noEventReceipt = await publishReceipt(svc, noEvent.attemptId);
    record(
      "P21",
      "a registered source Referent with no Event row is INCOMPLETE/unavailable, not false",
      "INCOMPLETE with grounding null and reason unavailable",
      `${noEventReceipt.result} g=${checksOf(noEventReceipt).grounding} ` +
        `reason=${noEventReceipt.reasons.grounding} witness=${noEventReceipt.source_witness}`,
      noEventReceipt.result === "INCOMPLETE" &&
        checksOf(noEventReceipt).grounding === null &&
        noEventReceipt.reasons.grounding === "unavailable" &&
        noEventReceipt.source_witness === null,
    );

    // ---------------------------------------------------------------------
    // P22 — invalid native creation.
    // ---------------------------------------------------------------------
    const selfRef = await errorOf(() => {
      const id = uuid();
      return svc`insert into public.artifacts (id, artifact_role, context_id, payload_text)
                 values (${id}, 'source_representation', ${id}, ${A1_TEXT})`;
    });
    const wrongContext = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, payload_text, producer_succeeded)
          values (${uuid()}, 'transformed_representation', ${A1_ID}, ${A2_TEXT}, true)`
    );
    const reusedReferent = await errorOf(() =>
      svc`insert into public.artifacts (id, artifact_role, context_id, payload_text)
          values (${GT01}, 'source_representation', ${TR1}, ${A1_TEXT})`
    );
    const [refShape] = await sql`
      select count(*)::int as n from information_schema.columns
      where table_schema = 'public' and table_name = 'referents'`;
    record(
      "P22",
      "self-reference, mis-typed context and reused Referent id all reject; Referent stays identity-only",
      "three rejections and a two-column Referent row",
      `self:${selfRef ? "rejected" : "ACCEPTED"} context:${
        wrongContext ? "rejected" : "ACCEPTED"
      } ` +
        `reuse:${
          reusedReferent ? "rejected" : "ACCEPTED"
        } referent_columns=${refShape.n}`,
      selfRef !== null && wrongContext !== null && reusedReferent !== null &&
        refShape.n === 2,
    );

    // ---------------------------------------------------------------------
    // P12 — predecessor untouched by every result category.
    // ---------------------------------------------------------------------
    const after = await predecessorSnapshot(sql);
    record(
      "P12",
      "Claims, L, TR1, GT01, C2 and R are byte-identical before and after every result category",
      before,
      after,
      before === after,
    );

    // ---------------------------------------------------------------------
    // WT07 stage 5 — fresh-context reconstruction from persistence alone.
    // ---------------------------------------------------------------------
    const consumer = client(url());
    const reconstruction: string[] = [];
    for (const receiptId of [RC1_ID, RC2_ID]) {
      const [receiptRow] = await consumer`
        select payload_text, context_id from public.artifacts where id = ${receiptId}`;
      const receipt = JSON.parse(receiptRow.payload_text);
      const [attempt] = await consumer`
        select payload_text, context_id, target_id, created_xid::text as xid
        from public.artifacts where id = ${receiptRow.context_id}`;
      const [operation] = await consumer`
        select payload_text, context_id from public.artifacts where id = ${attempt.context_id}`;
      const [input] = await consumer`
        select payload_text, encode(payload_digest,'hex') as d
        from public.artifacts where id = ${operation.context_id}`;
      const outputRow = await consumer`
        select payload_text, encode(payload_digest,'hex') as d, producer_succeeded
        from public.artifacts where id = ${attempt.target_id}`;
      const spec = JSON.parse(operation.payload_text);

      const inputHashOk = await sha256Hex(input.payload_text) === input.d;
      const outputHashOk = outputRow.length === 0 ||
        await sha256Hex(outputRow[0].payload_text) === outputRow[0].d;
      const specOk = spec.contract_id === CONTRACT_ID &&
        spec.checker_id === CHECKER_ID &&
        typeof spec.checker_definition === "string" &&
        spec.checker_definition.length > 0 &&
        await sha256Hex(spec.checker_definition) ===
          spec.checker_definition_digest;
      const witnessOk = receiptId === RC1_ID
        ? sameFields(receipt.source_witness, EXPECTED_WITNESS)
        : receipt.source_witness !== undefined;
      const componentsOk = OBLIGATIONS.every((k) => k in receipt.checks);
      const producerOk = receipt.producer_succeeded === true;
      const xidOk = attempt.xid !== null && attempt.xid.length > 0;

      const ok = inputHashOk && outputHashOk && specOk && witnessOk &&
        componentsOk && producerOk &&
        xidOk;
      reconstruction.push(
        `${receiptId.slice(0, 8)}:${
          ok
            ? "ok"
            : `hash=${inputHashOk}/${outputHashOk} spec=${specOk} witness=${witnessOk}`
        }`,
      );
    }
    const [a1Recovered] = await consumer`
      select payload_text from public.artifacts where id = ${A1_ID}`;
    await consumer.end();
    record(
      "S5",
      "fresh context reconstructs payloads, specs, witnesses, components and hashes from persistence alone",
      "both receipts reconstruct; A1 byte-identical",
      `${reconstruction.join(", ")}; a1=${
        a1Recovered.payload_text === A1_TEXT ? "identical" : "DIFFERS"
      }`,
      reconstruction.every((r) => r.includes(":ok")) &&
        a1Recovered.payload_text === A1_TEXT,
    );

    // ---------------------------------------------------------------------
    // Layer B regression projection.
    // ---------------------------------------------------------------------
    const [inventory] = await sql`
      select
        (select count(*) from information_schema.tables
          where table_schema='public' and table_type='BASE TABLE')::int as tables,
        (select count(*) from information_schema.views where table_schema='public')::int as views,
        (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
          where n.nspname='public')::int as functions,
        (select count(*) from public.thoughts)::int as thoughts,
        (select count(*) from public.claims)::int as claims,
        (select count(*) from public.evidence_links)::int as links,
        (select count(*) from public.claim_standing_transitions)::int as transitions
    `;
    record(
      "LB1",
      "whole-schema inventory expands only by the permitted Artifact surface",
      "6 tables, 0 views, 8 functions, 1 thought, 3 claims, 1 link, 1 transition",
      JSON.stringify(inventory),
      inventory.tables === 6 && inventory.views === 0 &&
        inventory.functions === 8 &&
        inventory.thoughts === 1 && inventory.claims === 3 &&
        inventory.links === 1 &&
        inventory.transitions === 1,
    );

    const [claimC] = await sql`
      select epistemic_standing, origin from public.claims where id = ${CLAIM_C}`;
    record(
      "LB2",
      "Claim C keeps ecb_inference/basis_qualified; C2 and R preserved",
      "ecb_inference / basis_qualified",
      `${claimC.origin} / ${claimC.epistemic_standing}`,
      claimC.origin === "ecb_inference" &&
        claimC.epistemic_standing === "basis_qualified",
    );

    const noClaimsUpdate = await errorOf(() =>
      svc`update public.claims set epistemic_standing = 'unassessed' where id = ${CLAIM_C}`
    );
    const noLinkDelete = await errorOf(() =>
      svc`delete from public.evidence_links where id = ${LINK_L}`
    );
    const noTransitionUpdate = await errorOf(() =>
      svc`update public.claim_standing_transitions set to_standing = 'unassessed' where id = ${TR1}`
    );
    record(
      "LB3",
      "no added UPDATE/DELETE reach on Claims, Evidence Links or standing transitions",
      "all three rejected",
      `claims:${noClaimsUpdate ? "rejected" : "ACCEPTED"} links:${
        noLinkDelete ? "rejected" : "ACCEPTED"
      } ` +
        `transitions:${noTransitionUpdate ? "rejected" : "ACCEPTED"}`,
      noClaimsUpdate !== null && noLinkDelete !== null &&
        noTransitionUpdate !== null,
    );

    const [indexes] = await sql`
      select count(*)::int as n from pg_indexes
      where schemaname='public' and tablename='artifacts'`;
    record(
      "LB4",
      "the new table adds exactly one index beyond its primary key",
      "2",
      String(indexes.n),
      indexes.n === 2,
    );

    const [rls] = await sql`
      select relrowsecurity as enabled,
             (select count(*) from pg_policies where schemaname='public' and tablename='artifacts')::int as policies
      from pg_class where oid = 'public.artifacts'::regclass`;
    record(
      "LB5",
      "Artifacts has RLS enabled with zero policies",
      "enabled true, 0 policies",
      `${rls.enabled}, ${rls.policies}`,
      rls.enabled === true && rls.policies === 0,
    );

    const [c2r] = await sql`
      select count(*)::int as n from public.claims where id in (${CLAIM_C2}, ${RELATION_R})`;
    record(
      "LB6",
      "C2 and R survive unchanged",
      "2",
      String(c2r.n),
      c2r.n === 2,
    );
  } finally {
    await sql.end();
    await svc.end();
  }

  await runP19();

  const failed = findings.filter((f) => !f.pass);
  console.log(
    `\n${findings.length - failed.length}/${findings.length} checks passed`,
  );
  if (failed.length > 0) {
    console.log(`FAILING: ${failed.map((f) => f.id).join(", ")}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
