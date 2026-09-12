import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as s from "./support.mjs";
const {
  admin,
  make,
  open,
  publish,
  inspect,
  source,
  uuid,
  connect,
  save,
  close,
} = s;
const before = JSON.parse(readFileSync(process.argv[2]));
const after = JSON.parse(readFileSync(process.argv[3]));
const controls = [];
async function reject(name, fn) {
  let error;
  try {
    await fn();
  } catch (e) {
    error = e.message;
  }
  assert.ok(error, name);
  controls.push({ name, rejected: true, error });
}
try {
  assert.deepEqual(after.functions, before.functions);
  controls.push({
    name: "all predecessor function definitions/owners/ACLs unchanged",
    count: before.functions.length,
  });
  assert.deepEqual(
    after.columns.filter((x) => !x.grantee.startsWith("ecb9")),
    before.columns,
  );
  controls.push({
    name: "no old column privileges broadened",
    count: before.columns.length,
  });
  assert.deepEqual(
    after.triggers.filter((t) => t.tgname !== "prepare_build9_artifact"),
    before.triggers,
  );
  controls.push({ name: "predecessor trigger routing byte-equivalent" });
  assert.deepEqual(after.selected, before.selected);
  controls.push({ name: "BUILD 7 selected pointers unchanged by install" });
  const f = await make();
  await open(f);
  const q = await publish(f);
  await admin.unsafe(
    "create role b9_old_evaluator login; grant ecb7_evaluator,ecb8_evaluator,service_role to b9_old_evaluator",
  );
  const old = connect("b9_old_evaluator");
  try {
    await reject(
      "b9 inquiry cannot become b7 candidate",
      () => old`select ecb7.attempt(${uuid()}::uuid,${f.p}::uuid)`,
    );
    await reject(
      "b9 judgment cannot become b7 attempt",
      () => old`select ecb7.publish(${q.judgment}::uuid,'{}'::jsonb,'x')`,
    );
    await reject(
      "b9 artifact cannot become old transformation input",
      () =>
        old`insert into public.artifacts(artifact_role,context_id) values('transformation_request',${f.p}::uuid)`,
    );
    await reject(
      "old producer cannot publish b9 role",
      () =>
        old`insert into public.artifacts(artifact_role,context_id,payload_text) values('b9_judgment',${f.p}::uuid,'{}')`,
    );
    await reject(
      "old producer cannot overwrite b9 artifact",
      () =>
        old`update public.artifacts set payload_text='{}' where id=${f.p}::uuid`,
    );
    // Valid original BUILD 5B source/request control on the unchanged old checker.
    const src =
      (await old`insert into public.artifacts(artifact_role,context_id,payload_text) values('source_representation',${f.scope}::uuid,'{"bounded":"composition positive"}') returning id`)[
        0
      ].id;
    const request =
      (await old`insert into public.artifacts(artifact_role,context_id) values('transformation_request',${src}::uuid) returning id`)[
        0
      ].id;
    controls.push({
      name: "old source/request behavior remains usable",
      src,
      request,
    });
  } finally {
    await old.end();
  }
  const privileges =
    await admin`select rolname,rolsuper,rolcreaterole,rolcreatedb,rolbypassrls from pg_roles where rolname like 'ecb9%' or rolname like 'b9%' order by rolname`;
  assert.ok(
    privileges.every((r) =>
      !r.rolsuper && !r.rolcreaterole && !r.rolcreatedb && !r.rolbypassrls
    ),
  );
  controls.push({ name: "bounded roles no elevated authority", privileges });
  const pointers =
    await admin`select id,current_event from ecb7.scopes order by id`;
  assert.ok(pointers.every((x) => x.current_event === null));
  controls.push({
    name: "BUILD 9 scope composition writes no designation pointer",
    pointers,
  });
  console.log("P18 PASS");
} catch (e) {
  process.exitCode = 1;
  controls.push({
    result: "FAIL",
    classification: "M/T pending diagnosis",
    error: e.message,
    stack: e.stack,
  });
  console.error(e);
} finally {
  save(process.argv[4] ?? "composition-results.json", {
    id: "P18",
    result: process.exitCode ? "FAIL" : "PASS",
    controls,
    limits:
      "Exact inherited checker/custody seams only; no re-proving closed BUILD 7/8 capabilities.",
  });
  await close();
}
