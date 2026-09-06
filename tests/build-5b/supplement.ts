// Disposable-only: actual backend loss, recovery, retained byte hashes and native search.
import { assert, connect, equal, hash, LOCAL, save } from "./support.ts";
import { preservation } from "./verify.ts";
import * as F from "./fixtures.ts";
const db = connect(), dead = connect();
try {
  const attempt = crypto.randomUUID(), result = crypto.randomUUID();
  await db.unsafe("set role service_role");
  await db`insert into artifacts(id,artifact_role,context_id,target_id) values (${attempt},'check_attempt',${F.OP1_ID},${F.A2_ID})`;
  await db.unsafe("reset role");
  await dead.unsafe("begin");
  await dead.unsafe("set local role service_role");
  const [{ pid }] = await dead`select pg_backend_pid() pid`;
  const [returned] =
    await dead`insert into artifacts(id,artifact_role,context_id) values (${result},'transformation_receipt',${attempt}) returning payload_text`;
  equal(
    JSON.parse(returned.payload_text).result,
    "PASS",
    "actual computed positive before disconnect",
  );
  assert(
    (await db`select pg_terminate_backend(${pid}) terminated`)[0].terminated,
    "actual backend termination",
  );
  await dead.end({ timeout: 1 }).catch(() => {});
  const fresh = connect(LOCAL);
  try {
    const [state] = await fresh`select
      (select count(*)::int from artifacts where id=${attempt}) attempt,
      (select count(*)::int from artifacts where id=${result}) receipt,
      (select count(*)::int from referents where id=${result}) referent`;
    equal(
      state,
      { attempt: 1, receipt: 0, referent: 0 },
      "fresh observation after actual connection loss",
    );
    await fresh.unsafe("set role service_role");
    await fresh`insert into artifacts(id,artifact_role,context_id) values (${result},'transformation_receipt',${attempt})`;
    await fresh.unsafe("reset role");
    const [persisted] =
      await fresh`select payload_text from artifacts where id=${result}`;
    equal(
      JSON.parse(persisted.payload_text).result,
      "PASS",
      "fresh exact attempt recovery",
    );
    // The harness knows commit succeeded; emulate a consumer discarding acknowledgement.
    await save("crash-recovery", {
      result: "PASS",
      backend: pid,
      attempt,
      receipt: result,
      after_disconnect: state,
      recovered: JSON.parse(persisted.payload_text),
      acknowledgement_limit:
        "real backend terminated before commit; later successful commit resolved by exact-ID read, not induced network ambiguity after commit",
    });
  } finally {
    await fresh.end();
  }
  const rows =
    await db`select id::text,payload_text,encode(payload_digest,'hex') digest from artifacts order by id`;
  for (const row of rows) {
    equal(
      row.digest,
      await hash(row.payload_text),
      "independent retained hash " + row.id,
    );
  }
  await db.unsafe("set role service_role");
  const search =
    await db`select id::text from search_thoughts((select embedding from thoughts where id=${F.GT01}),1)`;
  equal(search, [{ id: F.GT01 }], "native search returns retained GT01");
  await db.unsafe("reset role");
  await preservation(db);
  await save("supplement", {
    result: "PASS",
    retained_hashes: rows.length,
    search,
    prior_bytes_and_catalog: "unchanged",
  });
  console.log(
    "actual disconnect, recovery, all retained hashes and native search PASS",
  );
} finally {
  await dead.end({ timeout: 1 }).catch(() => {});
  await db.end();
}
