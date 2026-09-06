import {
  assert,
  BASE_TABLES,
  baseline,
  catalog,
  connect,
  equal,
  hash,
  read,
  ROOT,
  save,
} from "./support.ts";
const snap = await read("predecessor");
const db = connect();
try {
  for (const item of snap.catalog.schema_grants) {
    await db.unsafe(`revoke all on schema ${item.schema} from ${item.role}`);
    for (const priv of ["usage", "create"]) {
      if (item[priv]) {
        await db.unsafe(
          `grant ${priv} on schema ${item.schema} to ${item.role}`,
        );
      }
    }
  }
  const files = [];
  for await (const f of Deno.readDir(new URL("sql/migrations/", ROOT))) {
    if (f.name.endsWith(".sql") && !f.name.includes("build_5b")) {
      files.push(f.name);
    }
  }
  files.sort();
  for (const name of files) {
    const sql = await Deno.readTextFile(
      new URL("sql/migrations/" + name, ROOT),
    );
    await db.unsafe(sql);
    if (name.includes("build_0_atomic")) {
      const row = snap.data.thoughts[0];
      await db`insert into public.thoughts select * from jsonb_populate_record(null::public.thoughts,${
        db.json(row)
      }::jsonb)`;
    }
    // Restore only existing predecessor fixture rows/columns, including database-assigned historical times.
    // This runs ONLY in the disposable bootstrap, with no BUILD 5B artifacts installed.
    for (const t of BASE_TABLES) {
      const [exists] = await db`select to_regclass(${`public.${t}`}) present`;
      if (!exists.present) continue;
      const columns =
        (await db`select column_name from information_schema.columns where table_schema='public' and table_name=${t}`)
          .map((r) => r.column_name);
      for (const row of snap.data[t]) {
        const keys = Object.keys(row).filter((k) =>
          columns.includes(k) && k.endsWith("_at")
        );
        await db.unsafe(
          `update public.${t} set (${keys.join(",")}) = (select ${
            keys.join(",")
          } from jsonb_populate_record(null::public.${t},$1::text::jsonb)) where id=$2::uuid`,
          [JSON.stringify(row), row.id],
        );
      }
    }
    console.log("applied accepted predecessor " + name);
  }
  // Captured accepted native-trigger EXECUTE grant is not recorded by the historical migration.
  await db.unsafe(
    "grant execute on function public.register_thought_referent() to service_role",
  );
  for (const row of snap.ledger) {
    await db`insert into supabase_migrations.schema_migrations select * from jsonb_populate_record(null::supabase_migrations.schema_migrations,${
      db.json(row)
    }::jsonb)`;
  }
  equal(await baseline(db), snap.data, "exact predecessor fixtures");
  const actual = await catalog(db);
  await save("rehearsal-predecessor-catalog", actual);
  equal(actual, snap.catalog, "predecessor catalog fidelity");
  const [meta] =
    await db`select current_setting('server_version') version,current_setting('server_version_num') version_num`;
  assert(Math.floor(Number(meta.version_num) / 10000) === 17, "PG major");
  const ext =
    await db`select extname,extversion from pg_extension where extname in ('vector','pgcrypto') order by extname`;
  equal(
    ext,
    snap.extensions.filter((x: { extname: string }) =>
      ["vector", "pgcrypto"].includes(x.extname)
    ).map((
      { extname, extversion }: { extname: string; extversion: string },
    ) => ({ extname, extversion })),
    "required extension versions",
  );
  const features =
    await db`select ('{"x":1,"x":2}' is json object with unique keys) as duplicate_accepted, pg_current_xact_id()::text xid,encode(sha256(convert_to('abc','UTF8')),'hex') hash`;
  assert(!features[0].duplicate_accepted, "uniqueness feature");
  equal(
    features[0].hash,
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    "sha256 feature",
  );
  await save("fidelity", {
    result: "PASS",
    meta,
    ext,
    features,
    catalog_sha256: await hash(JSON.stringify(actual)),
    fixture_sha256: await hash(JSON.stringify(snap.data)),
  });
  console.log("FIDELITY PASS");
} finally {
  await db.end();
}
