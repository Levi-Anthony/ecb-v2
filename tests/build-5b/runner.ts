// One outer transaction over the exact migration bytes, ledger provenance and precommit checks.
// No canonical execution is permitted from this module's standalone rehearsal entry point.
// deno-lint-ignore-file no-explicit-any
import { assert, connect, equal, hash, MIGRATION, ROOT } from "./support.ts";
import { fixtures, schema } from "./verify.ts";
export const VERSION = "20260906014257";
export const NAME = "build_5b_versioned_artifacts";
export async function migration() {
  const bytes = await Deno.readFile(new URL(MIGRATION, ROOT));
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  equal(
    new TextEncoder().encode(text),
    bytes,
    "lossless migration byte decoding",
  );
  assert(!/^\s*(begin|commit)\s*;/im.test(text), "no nested transaction");
  return { text, sha256: await hash(bytes), bytes: bytes.length };
}
export async function activate(
  db: any,
  candidate: string,
  rollback = false,
  expectedCatalog?: unknown,
) {
  const file = await migration();
  await db.begin(async (tx: any) => {
    await tx.unsafe(file.text);
    await tx`insert into supabase_migrations.schema_migrations(version,name,statements,created_by,idempotency_key)
      values (${VERSION},${NAME},array[${file.text}]::text[],${candidate},${file.sha256})`;
    const installed = await schema(tx);
    if (expectedCatalog) {
      equal(installed, expectedCatalog, "rehearsed schema before commit");
    }
    await fixtures(tx, 0);
    await verifyLedger(tx, candidate);
    if (rollback) throw new Error("__rollback_probe__");
  });
  return {
    version: VERSION,
    candidate,
    migration_sha256: file.sha256,
    migration_bytes: file.bytes,
    committed: true,
  };
}
export async function verifyLedger(db: any, candidate: string) {
  const file = await migration();
  const rows =
    await db`select version,name,statements,created_by,idempotency_key from supabase_migrations.schema_migrations where version >= ${VERSION}`;
  equal(rows, [{
    version: VERSION,
    name: NAME,
    statements: [file.text],
    created_by: candidate,
    idempotency_key: file.sha256,
  }], "exact ledger bytes/hash/candidate");
}
export async function absent(db: any) {
  const [r] = await db`select to_regclass('public.artifacts') as artifact,
    (select count(*)::int from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('prepare_build_5b_artifact','reject_build_5b_artifact_mutation')) functions,
    (select count(*)::int from supabase_migrations.schema_migrations where version >= ${VERSION}) ledger`;
  equal(
    r,
    { artifact: null, functions: 0, ledger: 0 },
    "schema/ledger both absent; no rollback residue",
  );
}
if (import.meta.main) {
  const url = Deno.env.get("REHEARSAL_DATABASE_URL");
  assert(
    url && new URL(url).hostname === "127.0.0.1" &&
      new URL(url).port === "55438",
    "standalone runner requires disposable PG17",
  );
  const db = connect(url);
  try {
    try {
      await activate(
        db,
        Deno.env.get("B5B_CANDIDATE") ?? "rehearsal-candidate",
        true,
      );
      throw new Error("rollback unexpectedly committed");
    } catch (e) {
      if (!(e instanceof Error) || e.message !== "__rollback_probe__") throw e;
    }
    await absent(db);
    console.log(
      JSON.stringify({
        rollback_probe: "PASS",
        ...await activate(
          db,
          Deno.env.get("B5B_CANDIDATE") ?? "rehearsal-candidate",
        ),
      }),
    );
  } finally {
    await db.end();
  }
}
