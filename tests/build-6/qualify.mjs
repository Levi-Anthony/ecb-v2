import postgres from "../../server/ecb-human/node_modules/postgres/src/index.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const file = "sql/migrations/20260907234712_build_6_governance_bootstrap.sql";
const evidence = "tests/build-6/evidence";
await mkdir(evidence, { recursive: true });
const bytes = await readFile(file, "utf8");
const digest = createHash("sha256").update(bytes).digest("hex");
const db = postgres("postgres://postgres@127.0.0.1:55439/build6", {
  max: 1,
  prepare: false,
  onnotice: () => {},
});
async function snapshot() {
  const tables = [
    "thoughts",
    "referents",
    "claims",
    "evidence_links",
    "claim_standing_transitions",
    "artifacts",
  ];
  const rows = {};
  for (const t of tables) {
    rows[t] = (await db.unsafe(
      `select coalesce(jsonb_agg(to_jsonb(x) order by id),'[]') as data from public.${t} x`,
    ))[0].data;
  }
  return rows;
}
try {
  const before = await snapshot();
  const shape =
    (await db`select version from supabase_migrations.schema_migrations order by version`)
      .map((x) => x.version);
  assert.equal(shape.at(-1), "20260906014257");
  await assert.rejects(() =>
    db.begin(async (tx) => {
      await tx.unsafe(bytes);
      throw new Error("forced_installation_rollback");
    }), /forced_installation_rollback/);
  const [absent] =
    await db`select to_regnamespace('ecb_governance') is null as schema_absent,not exists(select 1 from pg_roles where rolname='ecb_governance_owner') as role_absent`;
  assert(absent.schema_absent && absent.role_absent);
  assert.deepEqual(await snapshot(), before);
  await db.begin(async (tx) => {
    await tx.unsafe(bytes);
    await tx`insert into supabase_migrations.schema_migrations(version,statements,name) values('20260907234712',${[
      bytes,
    ]},'build_6_governance_bootstrap')`;
  });
  assert.deepEqual(await snapshot(), before);
  const run = spawnSync(process.execPath, [
    "--test",
    "tests/build-6/governance.test.mjs",
    "tests/build-6/succession-handoff.test.mjs",
  ], { encoding: "utf8" });
  await writeFile(`${evidence}/qualification.txt`, run.stdout + run.stderr);
  if (run.status !== 0) {
    process.stdout.write(run.stdout + run.stderr);
    throw new Error("qualification failed");
  }
  const after = await snapshot();
  for (const t of Object.keys(before)) {
    if (t === "referents") {
      const ids = new Map(after[t].map((r) => [r.id, r]));
      for (const row of before[t]) assert.deepEqual(ids.get(row.id), row);
    } else assert.deepEqual(after[t], before[t]);
  }
  const [ledger] =
    await db`select statements from supabase_migrations.schema_migrations where version='20260907234712'`;
  assert.equal(ledger.statements[0], bytes);
  const versions = JSON.parse(
    await readFile("server/ecb-human/package-lock.json", "utf8"),
  );
  const receipt = {
    observed_at: new Date().toISOString(),
    environment:
      "disposable PG17 at 127.0.0.1:55439/build6; copied retained BUILD 5B episode, not canonical",
    migration: file,
    migration_sha256: digest,
    node: process.version,
    server_package:
      versions.packages["node_modules/@simplewebauthn/server"].version,
    browser_package:
      versions.packages["node_modules/@simplewebauthn/browser"].version,
    installation_rollback: "passed",
    atomic_migration_ledger: "passed",
    prior_public_rows_preserved: "passed",
    first_p1_succession_seam: "included in qualification.txt",
    tests_exit_code: run.status,
    live_credential_binding: "not performed",
    canonical_migration: "not performed",
    device_tests: "not run",
    deployment: "not performed",
    limits: [
      "Synthetic ES256 authenticators do not prove iPhone/Mac or credential-ecosystem redundancy.",
      "Copied BUILD 5B transaction IDs are historical data; this run grants them no new prior-commit authority.",
      "P1 custody tests use synthetic local credential records; live retained executor custody is not read by CI.",
      "Installation/deployment custody remains trusted; this conversation is not an ordinary operating-agent profile.",
    ],
  };
  await writeFile(
    `${evidence}/receipt.json`,
    JSON.stringify(receipt, null, 2) + "\n",
  );
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await db.end();
}
