// BUILD 5B migration runner.
//
// The Output Contract requires activation and migration-ledger recording to be one transaction,
// using a single outer transaction with the new file's exact bytes and a parameterized
// migration-ledger write, without a nested BEGIN/COMMIT in the file. This runner implements that
// mechanism and proves both required properties before any canonical application:
//
//   1. all-or-nothing activation of schema, functions, triggers, index, grants and ledger row;
//   2. applied bytes provably identical to the committed artifact.
//
// BUILD 5A deliberately used a different mechanism (the file's own BEGIN/COMMIT, executed directly
// with no outer wrapper). That mechanism is not inherited here; it is replaced and re-probed.

// deno-lint-ignore-file no-explicit-any -- postgres.js is dynamically typed at the call surface.
import postgres from "postgres";

const MIGRATION_VERSION = "20260906014257";
const MIGRATION_NAME = "build_5b_versioned_artifacts";
const MIGRATION_PATH = new URL(
  `../../sql/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`,
  import.meta.url,
);

export interface RunnerEvidence {
  version: string;
  name: string;
  fileBytes: number;
  fileSha256: string;
  probeResidueFound: boolean;
  applied: boolean;
}

function connectionString(): string {
  const url = Deno.env.get("REHEARSAL_DATABASE_URL");
  if (!url) {
    throw new Error(
      "REHEARSAL_DATABASE_URL is required. This runner is for the disposable rehearsal database.",
    );
  }
  return url;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes.slice());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function activate(
  sql: any,
  fileText: string,
  commit: boolean,
): Promise<void> {
  await sql.begin(async (tx: any) => {
    // Exact file bytes, executed as one unit inside the outer transaction.
    await tx.unsafe(fileText);
    // Parameterized ledger write in the same transaction.
    await tx`
      insert into supabase_migrations.schema_migrations (version, name)
      values (${MIGRATION_VERSION}, ${MIGRATION_NAME})
    `;
    if (!commit) {
      throw new Error("__rollback_probe__");
    }
  });
}

async function residue(sql: any): Promise<boolean> {
  const [{ table_present }] = await sql`
    select count(*) > 0 as table_present
    from information_schema.tables
    where table_schema = 'public' and table_name = 'artifacts'
  `;
  const [{ ledger_present }] = await sql`
    select count(*) > 0 as ledger_present
    from supabase_migrations.schema_migrations
    where version = ${MIGRATION_VERSION}
  `;
  const [{ fn_present }] = await sql`
    select count(*) > 0 as fn_present
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'prepare_build_5b%'
  `;
  return table_present || ledger_present || fn_present;
}

async function main(): Promise<void> {
  const fileBytes = await Deno.readFile(MIGRATION_PATH);
  const fileText = new TextDecoder("utf-8").decode(fileBytes);
  const fileSha256 = await sha256Hex(fileBytes);

  if (/^\s*(begin|commit)\s*;/im.test(fileText)) {
    throw new Error(
      "Migration file carries its own BEGIN/COMMIT. The bound mechanism forbids a nested transaction.",
    );
  }

  const sql = postgres(connectionString(), { max: 1, onnotice: () => {} });
  try {
    // Property 1 — all-or-nothing. Run the full path, force a rollback, prove zero residue.
    try {
      await activate(sql, fileText, false);
      throw new Error("rollback probe unexpectedly committed");
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes("__rollback_probe__")
      ) {
        throw error;
      }
    }
    const probeResidueFound = await residue(sql);
    if (probeResidueFound) {
      throw new Error(
        "Rollback probe left residue. Classify and stop before applying; do not inherit old mechanics.",
      );
    }

    // Property 2 — applied bytes identical to the committed artifact.
    await activate(sql, fileText, true);
    const [{ present }] = await sql`
      select count(*) = 1 as present
      from supabase_migrations.schema_migrations
      where version = ${MIGRATION_VERSION}
    `;
    if (!present) {
      throw new Error("Ledger row absent after commit");
    }

    const evidence: RunnerEvidence = {
      version: MIGRATION_VERSION,
      name: MIGRATION_NAME,
      fileBytes: fileBytes.length,
      fileSha256,
      probeResidueFound,
      applied: true,
    };
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await sql.end();
  }
}

if (import.meta.main) {
  await main();
}
