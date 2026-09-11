import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import postgres from "../build-7/node_modules/postgres/src/index.js";
const hash = (x) => createHash("sha256").update(x).digest("hex");
const dir = "docs/build-receipts/evidence/build-8", path = `${dir}/freeze.json`;
const files = [
  "sql/migrations/20260911130000_build_8_action_envelope.sql",
  "sql/migrations/20260911140000_build_8_lifecycle.sql",
  ...readdirSync("server/build-8").filter((x) => x.endsWith(".mjs")).map((x) =>
    `server/build-8/${x}`
  ),
  ...readdirSync("tests/build-8").filter((x) =>
    !x.startsWith(".") && !x.startsWith("holdout") && /\.(mjs|sql|sh)$/.test(x)
  ).map((x) => `tests/build-8/${x}`),
  "docs/build-shape/012-build-8-move-gate.json",
  `${dir}/live-sources.json`,
].sort();
if (process.argv[2] === "--freeze") {
  const freeze = {
    frozen_at: new Date().toISOString(),
    base_checkpoint: "b4b813dd0779dc1f697ba42b2f7132538f18df95",
    branch: execFileSync("git", ["branch", "--show-current"], {
      encoding: "utf8",
    }).trim(),
    proof_class:
      "disposable atomic-ledger synthetic target whose native effect and native operation record commit atomically under the accepted PostgreSQL scope lock",
    authorship:
      "same worker implemented and tests; fixed expected semantics independently supplied by fixture/test contract, not producer/checker output; no independent-author proof",
    contract:
      "ECO-103 P01-P14 + I1-I9 + E1-E6; untuned additional holdout not yet authored",
    files: Object.fromEntries(files.map((f) => [f, hash(readFileSync(f))])),
  };
  writeFileSync(path, JSON.stringify(freeze, null, 2) + "\n");
  console.log("Implementation/comparison contract FROZEN");
} else {
  const freeze = JSON.parse(readFileSync(path));
  for (const [f, want] of Object.entries(freeze.files)) {
    assert.equal(hash(readFileSync(f)), want, `freeze drift: ${f}`);
  }
  console.log(`Freeze verified (${Object.keys(freeze.files).length} files)`);
  if (process.argv[2] === "--audit") {
    const db = postgres("postgres://postgres@127.0.0.1:55441/build8", {
      max: 1,
      prepare: false,
    });
    try {
      const functions =
        await db`select p.oid::regprocedure::text signature,pg_get_userbyid(proowner) owner,prosecdef security_definer,provolatile volatility,proacl::text grants,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb8' order by 1`;
      assert.ok(functions.every((f) => f.owner === "ecb8_owner"));
      const roles =
        await db`select rolname,rolcanlogin,rolinherit from pg_roles where rolname like 'ecb8_%' order by 1`;
      const [privilege] =
        await db`select has_column_privilege('ecb8_owner','ecb7.scopes','current_event','UPDATE') pointer,has_table_privilege('ecb8_owner','ecb7.scopes','UPDATE') general_update,has_column_privilege('ecb8_owner','ecb7.scopes','synthetic','UPDATE') lock_column`;
      assert.deepEqual(privilege, {
        pointer: false,
        general_update: false,
        lock_column: true,
      });
      const [shape] =
        await db`select (select count(*)::int from pg_tables where schemaname='ecb8') tables,(select count(*)::int from public.artifacts a left join public.referents r on r.id=a.id where r.id is null) missing_identities`;
      assert.deepEqual(shape, { tables: 0, missing_identities: 0 });
      const artifacts =
        await db`select artifact_role,count(*)::int from public.artifacts group by artifact_role order by artifact_role`;
      const [version] =
        await db`select version(),current_setting('transaction_isolation') isolation`;
      const audit = {
        proof_class: freeze.proof_class,
        freeze_sha256: hash(readFileSync(path)),
        functions,
        roles,
        privilege,
        shape,
        artifacts,
        version,
      };
      writeFileSync(`${dir}/audit.json`, JSON.stringify(audit, null, 2) + "\n");
      console.log("Custody, identity, schema and definition audit PASS");
    } finally {
      await db.end();
    }
  }
}
