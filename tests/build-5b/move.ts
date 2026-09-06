// Exact frozen fixture stages, shared by rehearsal and qualified canonical execution.
// deno-lint-ignore-file no-explicit-any
import {
  assert,
  canonical,
  connect,
  equal,
  EVIDENCE,
  hash,
  LOCAL,
  read,
  ROOT,
  save,
} from "./support.ts";
import { absent, activate, verifyLedger } from "./runner.ts";
import {
  fixtures,
  preIds,
  preservation,
  receiptIds,
  schema,
} from "./verify.ts";
import * as F from "./fixtures.ts";

export async function stages(url: string, label: string) {
  const outcomes: any[] = [];
  let db = connect(url);
  try {
    await schema(db);
    const rows = await db`select id::text from artifacts order by id`;
    const n = rows.length;
    assert([0, 7, 9].includes(n), "partial or unexpected stage; stop");
    await fixtures(db, n as 0 | 7 | 9);
    if (n === 0) {
      await db.begin(async (tx: any) => {
        await tx.unsafe("set local role service_role");
        await tx`insert into artifacts(id,artifact_role,context_id,payload_text) values (${F.A1_ID},'source_representation',${F.TR1},${F.A1_TEXT})`;
        await tx`insert into artifacts(id,artifact_role,context_id) values (${F.OP1_ID},'transformation_request',${F.A1_ID})`;
        await tx`insert into artifacts(id,artifact_role,context_id,payload_text,producer_succeeded) values (${F.A2_ID},'transformed_representation',${F.OP1_ID},${F.A2_TEXT},true)`;
        await tx`insert into artifacts(id,artifact_role,context_id,target_id) values (${F.CHECK1_ID},'check_attempt',${F.OP1_ID},${F.A2_ID})`;
        await tx`insert into artifacts(id,artifact_role,context_id) values (${F.OP2_ID},'transformation_request',${F.A1_ID})`;
        await tx`insert into artifacts(id,artifact_role,context_id,payload_text,producer_succeeded) values (${F.A_BAD_ID},'transformed_representation',${F.OP2_ID},${F.A_BAD_TEXT},true)`;
        await tx`insert into artifacts(id,artifact_role,context_id,target_id) values (${F.CHECK2_ID},'check_attempt',${F.OP2_ID},${F.A_BAD_ID})`;
        await tx.unsafe("reset role");
        await fixtures(tx, 7);
      });
      await db.end();
      db = connect(url);
      await fixtures(db, 7);
      outcomes.push({
        stage: "precheck",
        outcome: "COMMITTED_CONFIRMED",
        ids: preIds,
      });
      await save(label + "-stages", { outcomes });
    } else {outcomes.push({
        stage: "precheck",
        outcome: "EXACT_COMMITTED_STATE_RECONSTRUCTED",
      });}
    if (n !== 9) {
      await db.begin(async (tx: any) => {
        await tx.unsafe("set local role service_role");
        await tx`insert into artifacts(id,artifact_role,context_id) values (${F.RC1_ID},'transformation_receipt',${F.CHECK1_ID})`;
        await tx`insert into artifacts(id,artifact_role,context_id) values (${F.RC2_ID},'transformation_receipt',${F.CHECK2_ID})`;
        await tx.unsafe("reset role");
        await fixtures(tx, 9);
      });
      outcomes.push({
        stage: "receipts",
        outcome: "COMMITTED",
        ids: receiptIds,
      });
    } else {outcomes.push({
        stage: "receipts",
        outcome: "EXACT_COMMITTED_STATE_RECONSTRUCTED",
      });}
    await db.end();
    db = connect(url);
    await db.unsafe("begin isolation level repeatable read read only");
    const rowsFinal = await fixtures(db, 9), installed = await schema(db);
    await db.unsafe("commit");
    outcomes.push({ stage: "fresh_verification", outcome: "PASS" });
    const result = { outcomes, rows: rowsFinal, catalog: installed };
    await save(label + "-stages", result);
    console.log(label + " fixture stages PASS");
    return result;
  } catch (e) {
    // Never retry an uncertain transaction here. A fresh read resolves exact stage presence first.
    await db.end().catch(() => {});
    db = connect(url);
    const state =
      await db`select id::text,encode(payload_digest,'hex') digest,artifact_role from artifacts order by id`;
    await save(label + "-uncertain", {
      error: String(e),
      state,
      action:
        "STOP; re-entry requires complete exact-stage verification before any retry",
    });
    throw e;
  } finally {
    await db.end();
  }
}

async function git(args: string[]) {
  const r = await new Deno.Command("git", {
    args,
    cwd: ROOT,
    stdout: "piped",
    stderr: "piped",
  }).output();
  assert(r.success, "git provenance command");
  return new TextDecoder().decode(r.stdout).trim();
}
export async function artifactIdentity() {
  const names = (await git([
    "ls-files",
    "tests/build-5b",
    "sql/migrations",
    "docs/acceptance/build-5b-wt07.md",
    "docs/build-shape/007-build-5b.md",
    "docs/invariants.md",
    "docs/build-contract.md",
  ])).split("\n");
  const files: Record<string, string> = {};
  for (const name of names) {
    files[name] = await hash(await Deno.readFile(new URL(name, ROOT)));
  }
  return {
    commit: await git(["rev-parse", "HEAD"]),
    tree: await git(["rev-parse", "HEAD^{tree}"]),
    files,
  };
}
if (import.meta.main) {
  const mode = Deno.args[0];
  if (mode === "rehearse") {
    await stages(LOCAL.replace("/rehearsal", "/episode"), "episode");
  } else if (mode === "canonical") {
    const gate = await read("qualification");
    assert(gate.result === "PASS", "qualification pass required");
    equal(
      await hash(
        await Deno.readFile(
          EVIDENCE + "/predecessor.json",
        ),
      ),
      gate.predecessor_sha256,
      "rehearsed canonical snapshot bytes",
    );
    equal(await git(["status", "--porcelain"]), "", "clean candidate worktree");
    const current = await artifactIdentity();
    equal(
      current,
      gate.identity,
      "exact committed/rehearsed artifact identity",
    );
    const remote = await git([
      "ls-remote",
      "origin",
      "refs/heads/build/build-5b-pg17-qualification",
    ]);
    assert(remote.startsWith(current.commit + "\t"), "remote candidate anchor");
    // Git object-store bytes, not only filesystem hashes, must match the rehearsed artifacts.
    for (const [name, digest] of Object.entries(current.files)) {
      const r = await new Deno.Command("git", {
        args: ["show", current.commit + ":" + name],
        cwd: ROOT,
        stdout: "piped",
        stderr: "piped",
      }).output();
      assert(
        r.success && await hash(r.stdout) === digest,
        "committed bytes " + name,
      );
    }
    const url = Deno.env.get("POSTGRES_URL");
    assert(url, "canonical connection required");
    const parsed = new URL(url);
    assert(
      parsed.hostname.endsWith(".supabase.com") ||
        parsed.hostname === "db.vezxivrvhakclxuvxzso.supabase.co",
      "canonical host",
    );
    assert(
      parsed.username.includes("vezxivrvhakclxuvxzso") ||
        parsed.hostname.includes("vezxivrvhakclxuvxzso"),
      "canonical project binding",
    );
    let db = connect(url);
    try {
      const [v] =
        await db`select current_setting('server_version_num') version`;
      assert(
        Math.floor(Number(v.version) / 10000) === 17,
        "canonical major version",
      );
      const [state] = await db`select to_regclass('public.artifacts') present`;
      if (!state.present) {
        await absent(db);
        await preservation(db, false);
        const activated = await activate(
          db,
          current.commit,
          false,
          gate.installed_catalog,
        );
        await save("canonical-schema-transaction", activated);
      }
      await db.end();
      db = connect(url);
      await verifyLedger(db, current.commit);
      const installed = await schema(db);
      equal(
        installed,
        gate.installed_catalog,
        "exact rehearsed installed schema",
      );
      await save("canonical-schema-confirmation", {
        result: "PASS",
        candidate: current.commit,
        catalog_sha256: await hash(canonical(installed)),
      });
    } catch (e) {
      await save("canonical-schema-uncertainty", {
        error: String(e),
        action:
          "STOP; no blind retry; resolve persisted ledger and definitions on re-entry",
      });
      throw e;
    } finally {
      await db.end();
    }
    await stages(url, "canonical");
  } else throw new Error("use rehearse or canonical");
}
