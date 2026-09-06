// Read-only verification; fixed expectations come from frozen WT07.
// deno-lint-ignore-file no-explicit-any
import { assert, baseline, catalog, equal, hash, read } from "./support.ts";
import * as F from "./fixtures.ts";

export const preIds = [
  F.A1_ID,
  F.OP1_ID,
  F.A2_ID,
  F.CHECK1_ID,
  F.OP2_ID,
  F.A_BAD_ID,
  F.CHECK2_ID,
];
export const receiptIds = [F.RC1_ID, F.RC2_ID];

export async function preservation(db: any, expanded = true) {
  const snap = await read("predecessor");
  const data = await baseline(db);
  const oldIds = new Set(snap.data.referents.map((r: any) => r.id));
  (data as any).referents = (data as any).referents.filter((r: any) =>
    oldIds.has(r.id)
  );
  equal(data, snap.data, "all inherited fixture bytes");
  const actual = await catalog(db), prior = structuredClone(actual);
  if (expanded) {
    for (const key of Object.keys(prior)) {
      if (Array.isArray(prior[key])) {
        prior[key] = prior[key].filter((r: any) =>
          r.table !== "artifacts" && r.name !== "artifacts" &&
          !["prepare_build_5b_artifact", "reject_build_5b_artifact_mutation"]
            .includes(r.name)
        );
      }
    }
  }
  equal(
    prior,
    snap.catalog,
    "all inherited definitions, constraints, triggers and privileges",
  );
  const ledger =
    await db`select * from supabase_migrations.schema_migrations where version < '20260906014257' order by version`;
  equal(ledger, snap.ledger, "inherited migration ledger");
  return actual;
}

export async function schema(db: any) {
  const actual = await preservation(db);
  const [v] = await db`select
    (select count(*)::int from information_schema.tables where table_schema='public' and table_type='BASE TABLE') tables,
    (select count(*)::int from information_schema.views where table_schema='public') views,
    (select count(*)::int from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public') functions,
    (select relrowsecurity from pg_class where oid='public.artifacts'::regclass) rls,
    (select count(*)::int from pg_policies where schemaname='public' and tablename='artifacts') policies,
    (select count(*)::int from pg_indexes where schemaname='public' and tablename='artifacts') indexes,
    has_table_privilege('service_role','public.artifacts','SELECT') can_select,
    has_table_privilege('service_role','public.artifacts','INSERT') table_insert`;
  equal(v, {
    tables: 6,
    views: 0,
    functions: 8,
    rls: true,
    policies: 0,
    indexes: 2,
    can_select: true,
    table_insert: false,
  }, "exact expansion and RLS");
  const inserts = actual.grants.filter((r: any) =>
    r.table === "artifacts" && r.role === "service_role" &&
    r.privilege === "INSERT"
  ).map((r: any) => r.column).sort();
  equal(inserts, [
    "artifact_role",
    "context_id",
    "id",
    "payload_text",
    "producer_succeeded",
    "target_id",
  ], "exact insert columns");
  for (const role of ["anon", "authenticated", "service_role"]) {
    for (
      const priv of ["UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"]
    ) {
      assert(
        !(await db`select has_table_privilege(${role},'public.artifacts',${priv}) ok`)[
          0
        ].ok,
        role + " " + priv,
      );
    }
    if (role !== "service_role") {
      assert(
        !(await db`select has_table_privilege(${role},'public.artifacts','SELECT,INSERT') ok`)[
          0
        ].ok,
        "client access",
      );
    }
    for (
      const fn of [
        "prepare_build_5b_artifact",
        "reject_build_5b_artifact_mutation",
      ]
    ) {
      assert(
        !(await db`select has_function_privilege(${role},${
          "public." + fn + "()"
        },'EXECUTE') ok`)[0].ok,
        "direct checker access",
      );
    }
  }
  const foreignKeys =
    await db`select confdeltype,confupdtype,condeferrable from pg_constraint where conrelid='public.artifacts'::regclass and contype='f'`;
  assert(
    foreignKeys.length === 3 &&
      foreignKeys.every((r: any) =>
        !r.condeferrable && ["a", "r"].includes(r.confdeltype) &&
        ["a", "r"].includes(r.confupdtype)
      ),
    "restrictive immediate FKs",
  );
  const funcs =
    await db`select prosecdef,proconfig from pg_proc where oid in ('public.prepare_build_5b_artifact()'::regprocedure,'public.reject_build_5b_artifact_mutation()'::regprocedure)`;
  assert(
    funcs.length === 2 &&
      funcs.every((r: any) =>
        !r.prosecdef && r.proconfig.includes('search_path=""')
      ),
    "invoker search path",
  );
  return actual;
}

export async function fixtures(db: any, stage: 0 | 7 | 9) {
  await preservation(db);
  const rows =
    await db`select id::text,artifact_role,context_id::text,target_id::text,payload_text,encode(payload_digest,'hex') digest,producer_succeeded,created_xid::text,recorded_at::text from public.artifacts order by id`;
  const ids = stage === 0
    ? []
    : stage === 7
    ? preIds
    : [...preIds, ...receiptIds];
  equal(
    rows.map((r: any) => r.id),
    [...ids].sort(),
    "exact stage Artifact IDs",
  );
  const snap = await read("predecessor");
  const refs = await db`select id::text from public.referents order by id`;
  equal(
    refs.map((r: any) => r.id),
    [...snap.data.referents.map((r: any) => r.id), ...ids].sort(),
    "exact stage Referent IDs",
  );
  for (const r of rows) {
    equal(
      r.digest,
      await hash(r.payload_text),
      "independent payload hash " + r.id,
    );
  }
  if (stage === 0) return rows;
  const byId = Object.fromEntries(rows.map((r: any) => [r.id, r]));
  const expected = [
    [F.A1_ID, "source_representation", F.TR1, null, F.A1_TEXT, null],
    [F.OP1_ID, "transformation_request", F.A1_ID, null, null, null],
    [F.A2_ID, "transformed_representation", F.OP1_ID, null, F.A2_TEXT, true],
    [F.CHECK1_ID, "check_attempt", F.OP1_ID, F.A2_ID, null, null],
    [F.OP2_ID, "transformation_request", F.A1_ID, null, null, null],
    [
      F.A_BAD_ID,
      "transformed_representation",
      F.OP2_ID,
      null,
      F.A_BAD_TEXT,
      true,
    ],
    [F.CHECK2_ID, "check_attempt", F.OP2_ID, F.A_BAD_ID, null, null],
    ...(stage === 9
      ? [[F.RC1_ID, "transformation_receipt", F.CHECK1_ID, null, null, null], [
        F.RC2_ID,
        "transformation_receipt",
        F.CHECK2_ID,
        null,
        null,
        null,
      ]]
      : []),
  ];
  for (const [id, role, context, target, text, producer] of expected) {
    const r = byId[String(id)];
    equal([r.artifact_role, r.context_id, r.target_id, r.producer_succeeded], [
      role,
      context,
      target,
      producer,
    ], "role and participation " + id);
    if (text !== null) {
      equal(r.payload_text, text, "frozen exact representation " + id);
    }
  }
  const [fn] =
    await db`select pg_get_functiondef('public.prepare_build_5b_artifact()'::regprocedure) def`;
  for (
    const [opId, attemptId, outputId, receiptId] of [[
      F.OP1_ID,
      F.CHECK1_ID,
      F.A2_ID,
      F.RC1_ID,
    ], [F.OP2_ID, F.CHECK2_ID, F.A_BAD_ID, F.RC2_ID]]
  ) {
    const op = byId[opId],
      attempt = byId[attemptId],
      output = byId[outputId],
      input = byId[F.A1_ID];
    const spec = JSON.parse(op.payload_text);
    equal(spec, {
      contract_id: F.CONTRACT_ID,
      contract_version: 1,
      source_format: "transition_v1",
      output_format: "basis_v1",
      scope: "recorded_transition_only",
      coverage: "grounding_and_preservation",
      obligations: [...F.OBLIGATIONS],
      checker_id: F.CHECKER_ID,
      checker_definition: fn.def,
      checker_definition_digest: await hash(fn.def),
      trust_boundary:
        "service_role_producer; trusted_database_and_ddl; no_external_trust_root",
    }, "complete operation specification");
    equal(JSON.parse(attempt.payload_text), {
      event: "check_requested",
      operation_id: opId,
      operation_digest: op.digest,
      input_id: input.id,
      input_digest: input.digest,
      output_id: outputId,
      contract_id: F.CONTRACT_ID,
      checker_id: F.CHECKER_ID,
      checker_definition_digest: spec.checker_definition_digest,
    }, "complete attempt binding");
    if (stage === 7) continue;
    const row = byId[receiptId], r = JSON.parse(row.payload_text);
    const positive = receiptId === F.RC1_ID;
    equal(r, {
      receipt_version: 1,
      scope: "recorded_transition_only",
      coverage: "grounding_and_preservation",
      attempt_id: attemptId,
      operation_id: opId,
      input_id: input.id,
      output_id: outputId,
      operation_digest: op.digest,
      input_digest: input.digest,
      output_digest: output.digest,
      checker_id: F.CHECKER_ID,
      checker_definition_digest: spec.checker_definition_digest,
      observed_checker_definition_digest: await hash(fn.def),
      producer_succeeded: true,
      checks: {
        input_format: true,
        output_format: positive,
        participation: true,
        grounding: true,
        preservation: positive ? true : null,
        checker_binding: true,
      },
      reasons: positive
        ? {}
        : { output_format: "invalid_format", preservation: "not_evaluated" },
      source_witness: F.EXPECTED_WITNESS,
      result: positive ? "PASS" : "FAIL",
    }, "complete reconstructed receipt");
    assert(
      row.created_xid !== attempt.created_xid,
      "receipt and attempt top-level transactions differ",
    );
  }
  return rows;
}
