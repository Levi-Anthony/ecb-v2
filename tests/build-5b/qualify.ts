// Reproduce BUILD 5B's exact predecessor, baseline and complete disposable PG17 qualification.
// deno-lint-ignore-file no-explicit-any
import {
  assert,
  baseline,
  canonical,
  catalog,
  connect,
  equal,
  EVIDENCE,
  hash,
  LOCAL,
  read,
  ROOT,
  save,
  SHAPE,
} from "./support.ts";
import { artifactIdentity } from "./move.ts";
import { fixtures, schema } from "./verify.ts";
const mode = Deno.args[0] ?? "rehearse";
async function command(
  program: string,
  args: string[],
  cwd: URL = ROOT,
  env: Record<string, string> = {},
) {
  const r = await new Deno.Command(program, {
    args,
    cwd,
    env,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const stdout = new TextDecoder().decode(r.stdout),
    stderr = new TextDecoder().decode(r.stderr);
  assert(
    r.success,
    program + " " + args.join(" ") + " failed: " + stderr.slice(-2500),
  );
  return { stdout, stderr };
}
if (mode === "snapshot") {
  const url = Deno.env.get("POSTGRES_URL");
  assert(url, "canonical connection required");
  const db = connect(url);
  try {
    await db.unsafe("begin isolation level repeatable read read only");
    assert(
      !(await db`select to_regclass('public.artifacts') present`)[0].present,
      "pre-BUILD 5B snapshot only",
    );
    const meta =
      (await db`select current_setting('server_version') version,current_setting('server_version_num') version_num,current_setting('server_encoding') encoding`)[
        0
      ];
    const extensions =
      await db`select extname,extversion,n.nspname from pg_extension e join pg_namespace n on n.oid=e.extnamespace order by extname`;
    const roles =
      await db`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls from pg_roles where rolname in ('postgres','service_role','anon','authenticated') order by rolname`;
    const ledger =
      await db`select * from supabase_migrations.schema_migrations order by version`;
    const data = await baseline(db);
    equal(
      Object.fromEntries(
        Object.entries(data).map(([k, v]: any) => [k, v.length]),
      ),
      {
        thoughts: 1,
        referents: 7,
        claims: 3,
        evidence_links: 1,
        claim_standing_transitions: 1,
      },
      "predecessor counts",
    );
    assert(
      ledger.length === 6 && ledger[5].version === "20260905022247",
      "predecessor migration lineage",
    );
    const snap = {
      meta,
      extensions,
      roles,
      ledger,
      data,
      catalog: await catalog(db),
    };
    await db.unsafe("commit");
    await save("predecessor", snap);
    console.log("read-only canonical snapshot PASS");
  } finally {
    await db.end();
  }
} else if (mode === "rehearse") {
  await save("qualification", {
    result: "INCOMPLETE",
    started_at: new Date().toISOString(),
  });
  const identity = await artifactIdentity();
  // Docker's fixed loopback fixture container is separate from every canonical connection.
  const admin = (sql: string) =>
    command("docker", [
      "exec",
      "ecb5b-qualified-pg17",
      "psql",
      "-U",
      "custodian",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ]);
  const results: any[] = [];
  const run = async (
    label: string,
    dir: string,
    args: string[],
    extra: Record<string, string> = {},
  ) => {
    const r = await command("deno", args, new URL(dir + "/", ROOT), {
      POSTGRES_URL: LOCAL,
      ...extra,
    });
    await Deno.mkdir(EVIDENCE, { recursive: true });
    await Deno.writeTextFile(`${EVIDENCE}/${label}.log`, r.stdout + r.stderr);
    results.push({ label, directory: dir, args, ...r, result: "PASS" });
    console.log(label + " PASS");
    return r.stdout;
  };
  await run("static", "tests/build-5b", ["task", "check"]);
  const shapeFiles =
    (await command("git", ["ls-tree", "-r", "--name-only", SHAPE])).stdout
      .trim().split("\n");
  let preserved = 0;
  for (const name of shapeFiles) {
    if (["BUILD_CHECKOUT.md", "sql/migrations/README.md"].includes(name)) {
      continue;
    }
    const r = await new Deno.Command("git", {
      args: ["show", SHAPE + ":" + name],
      cwd: ROOT,
      stdout: "piped",
      stderr: "piped",
    }).output();
    assert(
      r.success &&
        await hash(r.stdout) ===
          await hash(await Deno.readFile(new URL(name, ROOT))),
      "frozen predecessor file " + name,
    );
    preserved++;
  }
  for (const name of ["rehearsal_p19", "episode", "rehearsal"]) {
    await admin("drop database if exists " + name + " with (force)");
  }
  await admin("create database rehearsal owner postgres template postgres");
  const dir = "tests/build-5b",
    access = [
      "run",
      "--allow-env",
      "--allow-net",
      "--allow-read",
      "--allow-write",
    ];
  await run("seed", dir, [...access, "seed.ts"]);
  const db = connect();
  try {
    const roles =
      await db`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls from pg_roles where rolname in ('postgres','service_role','anon','authenticated') order by rolname`;
    equal(
      roles,
      (await read("predecessor")).roles,
      "relevant canonical role attributes",
    );
  } finally {
    await db.end();
  }
  const inherited = [
    ["standing", "tests/build-5a", [
      "run",
      "--allow-env",
      "--allow-net",
      "harness.ts",
    ]],
    ["claims-relations", "tests/build-3-4-cross-build", [
      "run",
      "--allow-env",
      "--allow-net",
      "harness.ts",
    ]],
    ["referents", "tests/build-2-cross-build", [
      "run",
      "--allow-env",
      "--allow-net",
      "harness.ts",
    ]],
    ["mcp", "server/open-brain-mcp", [
      "test",
      "--allow-env",
      "--allow-net",
      "index.test.ts",
    ]],
    [
      "qualification-fixtures",
      "harvest/build-1/build-0-ob1-qualification-seam",
      ["task", "test"],
    ],
    ["qualification-trace", "harvest/build-1/build-0-ob1-qualification-seam", [
      "task",
      "trace",
    ]],
  ] as const;
  for (const [label, path, args] of inherited) {
    await run("baseline-" + label, path, [...args]);
  }
  await run("runner", dir, [...access, "runner.ts"], {
    REHEARSAL_DATABASE_URL: LOCAL,
    B5B_CANDIDATE: identity.commit,
  });
  await admin("create database episode owner postgres template rehearsal");
  await run("episode", dir, [...access, "move.ts", "rehearse"]);
  await run("stage-resumption", dir, [...access, "move.ts", "rehearse"]);
  await run("layer-b-standing", dir, [...access, "layer-b-standing.ts"], {
    POSTGRES_URL: LOCAL.replace("/rehearsal", "/episode"),
  });
  for (const [label, path, args] of inherited.slice(1)) {
    await run("layer-b-" + label, path, [...args], {
      POSTGRES_URL: LOCAL.replace("/rehearsal", "/episode"),
    });
  }
  const wt07 = await run("wt07", dir, [...access, "harness.ts"], {
    REHEARSAL_DATABASE_URL: LOCAL,
    REHEARSAL_SERVICE_URL: LOCAL + "?role=service_role",
    REHEARSAL_ADMIN_URL: LOCAL.replace("/rehearsal", "/postgres"),
    REHEARSAL_P19_URL: LOCAL + "_p19",
  });
  const findings = JSON.parse(
    wt07.split("\n").find((s) => s.startsWith("WT07_FINDINGS "))!.slice(14),
  );
  assert(
    findings.length === 39 && findings.every((f: any) => f.pass),
    "all WT07 findings",
  );
  for (let i = 1; i <= 23; i++) {
    assert(
      findings.some((f: any) => f.id === "P" + String(i).padStart(2, "0")),
      "P-case coverage",
    );
  }
  const p23 = JSON.parse(
    wt07.split("\n").find((s) => s.startsWith("P23_OBSERVATIONS "))!.slice(17),
  );
  const blocking = wt07.split("\n").filter((s) => s.startsWith("P17_BLOCKING "))
    .map((s) => JSON.parse(s.slice(13)));
  assert(blocking.length === 2, "both actual P17 blocking observations");
  await run("supplement", dir, [...access, "supplement.ts"]);
  const episode = connect(LOCAL.replace("/rehearsal", "/episode"));
  let installed;
  try {
    await fixtures(episode, 9);
    installed = await schema(episode);
  } finally {
    await episode.end();
  }
  equal(
    await artifactIdentity(),
    identity,
    "artifact bytes unchanged across complete rehearsal",
  );
  const result = {
    result: "PASS",
    identity,
    predecessor_sha256: await hash(
      await Deno.readFile(EVIDENCE + "/predecessor.json"),
    ),
    frozen_predecessor_files: preserved,
    fidelity: await read("fidelity"),
    installed_catalog: installed,
    findings,
    p23,
    blocking,
    crash: await read("crash-recovery"),
    supplement: await read("supplement"),
    results,
  };
  await save("qualification", result);
  console.log(
    "COMPLETE PG17 QUALIFICATION PASS " + identity.commit + " " +
      await hash(canonical(result)),
  );
} else throw new Error("use snapshot or rehearse");
