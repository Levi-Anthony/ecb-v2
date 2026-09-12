import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import * as t from "./support.mjs";
import { recover } from "../../server/build-8/recover.mjs";
const {
  admin,
  actor,
  observer,
  b7,
  make,
  started,
  ready,
  propose,
  qualify,
  grant,
  authorize,
  control,
  env,
  head,
  inspect,
  uuid,
} = t;
const results = [];
async function rejects(name, fn, re = /b8_|permission denied/) {
  let msg;
  try {
    await fn();
  } catch (e) {
    msg = e.message;
  }
  assert.ok(msg, name);
  assert.match(msg, re);
  results.push({ name, rejected: msg });
}
async function fault(f, name, fn) {
  const db = t.connect("custodian");
  try {
    let r;
    try {
      await db.begin(async (tx) => {
        await tx`set local session_replication_role=replica`;
        await fn(tx);
        r = await recover(tx, f.scope, f.action);
        assert.equal(r.status, "UNKNOWN");
        throw Error("ROLLBACK_EXPECTED_FAULT");
      });
    } catch (e) {
      if (e.message !== "ROLLBACK_EXPECTED_FAULT") throw e;
    }
    results.push({ name, status: r.status, reason: r.reason });
  } finally {
    await db.end();
  }
}
try {
  const f = await make(), r = await started(f);
  await control(f, "effect", r.st);
  for (const kind of ["fork", "cycle", "scope", "missing_predecessor"]) {
    await fault(f, `P13 valid-digest ${kind}`, async (tx) => {
      const row =
          (await tx`select * from public.artifacts where id=${r.st}::uuid`)[0],
        e = JSON.parse(row.payload_text);
      if (kind === "scope") e.scope = uuid();
      else if (kind === "missing_predecessor") e.predecessor = uuid();
      else if (kind === "cycle") e.predecessor = r.st;
      if (kind === "fork") {
        const id = uuid();
        await tx`insert into public.referents(id) values(${id}::uuid)`;
        await tx`insert into public.artifacts(id,artifact_role,context_id,payload_text,payload_digest,recorded_at,created_xid)
    values(${id}::uuid,'b8_event',${f.scope}::uuid,${
          JSON.stringify({ ...e, request: uuid() })
        },extensions.digest(convert_to(${
          JSON.stringify({ ...e, request: uuid() })
        },'UTF8'),'sha256'),now(),pg_current_xact_id())`;
        // Assign exact matching digest after insertion so this is topology sensitivity.
        await tx`update public.artifacts set payload_digest=extensions.digest(convert_to(payload_text,'UTF8'),'sha256') where artifacts.id=${id}::uuid`;
      } else {await tx`update public.artifacts set payload_text=${
          JSON.stringify(e)
        },payload_digest=extensions.digest(convert_to(${
          JSON.stringify(e)
        },'UTF8'),'sha256') where id=${r.st}::uuid`;}
    });
  }
  const none = await make();
  await fault(
    none,
    "P05 authorization without independently inspectable designation",
    async (tx) => {
      const r = await ready(none);
      const row =
          (await tx`select * from public.artifacts where id=${r.au}::uuid`)[0],
        e = JSON.parse(row.payload_text);
      e.data.designation = null;
      await tx`update public.artifacts set payload_text=${
        JSON.stringify(e)
      },payload_digest=extensions.digest(convert_to(${
        JSON.stringify(e)
      },'UTF8'),'sha256') where id=${r.au}::uuid`;
    },
  );
  // All three pre-effect reliance boundaries must see BUILD 7 pointer changes.
  for (const stage of ["qualification", "authorization", "admission"]) {
    const x = await make(),
      id = await propose(x),
      q = await qualify(x, id),
      g = await grant(x, id, q);
    let au;
    if (stage === "admission") au = (await authorize(x, id, q, g)).event;
    const key = {
        id: x.candidate.orientation.key,
        result: { id: x.candidate.orientation.evaluation },
      },
      o = await b7.observe(x.orientation);
    const wg = await b7.grant(
      x.orientation,
      key,
      x.candidate.orientation.designation,
      { operation: "withdraw" },
    );
    await b7.select(
      x.orientation,
      key,
      x.candidate.orientation.designation,
      wg,
      o,
      uuid(),
      "withdraw",
    );
    if (stage === "qualification") {
      const changed = await qualify(x, id);
      assert.equal(changed.outcome, "FAIL");
      results.push({
        name: "P06 changed Key before qualification",
        evaluation: changed,
      });
    } else if (stage === "authorization") {
      await rejects(
        "P06 changed Key before authorization",
        () => authorize(x, id, q, g),
      );
    } else {await rejects("P06 changed Key before admission", () =>
        control(x, "admit", au));}
  }
  const replay = await make(),
    id = await propose(replay),
    q = await qualify(replay, id),
    g = await grant(replay, id, q),
    p = await head(replay),
    req = uuid();
  const au = await authorize(replay, id, q, g, null, actor, p, req);
  await env(replay, "tick", { tick: 30 });
  await env(replay, "withdraw", { authorization: au.event });
  const h = await head(replay),
    again = await authorize(replay, id, q, g, null, actor, p, req);
  assert.equal(again.replayed, true);
  assert.equal(await head(replay), h);
  const recovered = await recover(observer, replay.scope, replay.action);
  assert.equal(recovered.authorizations[au.event].legitimate, true);
  assert.equal(recovered.present.applicable, false);
  await rejects(
    "P05 exact request changed parameters",
    () => authorize(replay, uuid(), q, g, null, actor, p, req),
  );
  results.push({
    name: "P07 historical authorization replay after expiry and withdrawal",
    again,
    present: recovered.present,
  });
  // Literal process loss after committed execution-start, then recovery in parent.
  const crash = await make(),
    cr = await ready(crash),
    ad = await control(crash, "admit", cr.au);
  const child = spawnSync(process.execPath, [
    "--input-type=module",
    "-e",
    `import postgres from './tests/build-7/node_modules/postgres/src/index.js';const db=postgres('postgres://b8_actor@127.0.0.1:55441/build8',{max:1});await db.unsafe('select ecb8.control($1::uuid,$2::uuid,$3,$4::uuid,$5::uuid,$6::uuid)',${
      JSON.stringify([
        crash.scope,
        crash.action,
        "start",
        ad.event,
        ad.event,
        uuid(),
      ])
    });process.exit(23);`,
  ], { encoding: "utf8" });
  assert.equal(child.status, 23, child.stderr);
  const after = await recover(observer, crash.scope, crash.action);
  assert.equal(after.status, "RECONCILE_REQUIRED");
  assert.equal(after.native.effect_count, 0);
  results.push({
    name: "P09 fresh child exits after committed start",
    status: after.status,
    unfinished: after.unfinished,
  });
  // Native role metadata and exact identity/bytes protections at the actual insert boundary.
  for (const metadata of ["payload_digest", "recorded_at", "created_xid"]) {
    await rejects(
      `E1 derived ${metadata} cannot be caller supplied`,
      () =>
        admin.begin(async (tx) => {
          await tx.unsafe(
            `grant insert(${metadata}) on public.artifacts to ecb8_owner`,
          );
          await tx`set local role ecb8_owner`;
          const value = metadata === "payload_digest"
            ? "decode(repeat('00',32),'hex')"
            : metadata === "recorded_at"
            ? "now()"
            : "pg_current_xact_id()";
          await tx.unsafe(
            `insert into public.artifacts(id,artifact_role,context_id,payload_text,${metadata}) values($1::uuid,'b8_envelope',$2::uuid,$3,${value})`,
            [uuid(), crash.scope, JSON.stringify(crash.candidate)],
          );
        }),
      /b8_derived_columns/,
    );
  }
  const bytes = JSON.stringify(crash.candidate, null, 3) + "\n",
    exact = await propose(crash, bytes);
  assert.equal(
    (await admin`select payload_text from public.artifacts where id=${exact}::uuid`)[
      0
    ].payload_text,
    bytes,
  );
  await rejects(
    "E1 duplicate JSON keys at retained-byte boundary",
    () => propose(crash, '{"scope":"x","scope":"y"}'),
    /b8_exact_unique_json_required/,
  );
  await rejects("E1 identity registered once", () =>
    admin.begin(async (tx) => {
      await tx`set local role ecb8_owner`;
      await tx`select ecb8.retain('b8_envelope',${crash.scope}::uuid,${bytes},${crash.action}::uuid)`;
    }), /b8_identity_already_registered/);
  const rr = (await inspect(crash)).history;
  assert.equal(rr.revision, 0);
  await env(crash, "tick", { tick: 11 });
  assert.equal((await inspect(crash)).history.revision, 0);
  results.push({
    name: "I2 tick does not change native revision",
    revision: 0,
  });
  await rejects(
    "I3 logical tick requires an integer, not caller text",
    () => env(crash, "tick", { tick: "12" }),
    /b8_integer_tick_required/,
  );
  console.log(`Supplemental PASS (${results.length} controls)`);
} finally {
  t.save("supplemental.json", {
    proof_class: "atomic-ledger synthetic target only",
    results,
  });
  await t.close();
}
