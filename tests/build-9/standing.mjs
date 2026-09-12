import assert from "node:assert/strict";
import * as s from "./support.mjs";
const {
  admin,
  connect,
  make,
  run,
  open,
  publish,
  returned,
  reenter,
  inspect,
  save,
  close,
} = s;
const results = [], monitor = connect("custodian");
const signal = () => {
  let resolve;
  const p = new Promise((r) => resolve = r);
  return { p, resolve };
};
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const link = async (claim) =>
  (await admin`insert into public.evidence_links(claim_id,evidence_referent_id) values(${claim}::uuid,'19a949ea-a8fc-4250-a386-fa64e5530180') returning id`)[
    0
  ].id;
const change = async (db, claim, l, from, to) =>
  (await db`insert into public.claim_standing_transitions(claim_id,from_standing,to_standing,basis_evidence_link_id) values(${claim}::uuid,${from},${to},${l}::uuid) returning id`)[
    0
  ].id;
try {
  for (const slot of ["decision", "governance"]) {
    const f = await make();
    await open(f);
    const q = await publish(f);
    await returned(f, q.judgment);
    const claim = slot === "decision"
        ? f.decision
        : f.dependencies.governance.claim,
      l = await link(claim);
    const a = await change(admin, claim, l, "unassessed", "basis_qualified"),
      b = await change(admin, claim, l, "basis_qualified", "unassessed");
    const r = await reenter(f);
    assert.equal(r.result.disposition, "REQUALIFY");
    results.push({
      id: "P08/P18",
      control: "native Claim standing ABA " + slot,
      a,
      b,
      r,
      card: await inspect(f),
    });
  }
  for (const rollback of [false, true]) {
    const f = await make();
    await open(f);
    const q = await publish(f);
    await returned(f, q.judgment);
    const card = await inspect(f),
      l = await link(f.decision),
      w = connect("postgres"),
      p = connect(),
      written = signal(),
      release = signal();
    const wt = w.begin(async (tx) => {
      await change(tx, f.decision, l, "unassessed", "basis_qualified");
      written.resolve();
      await release.p;
      if (rollback) throw Error("intentional rollback");
    }).catch((e) => {
      if (!rollback) throw e;
      assert.equal(e.message, "intentional rollback");
    });
    await written.p;
    const rt = reenter(f, { db: p, card }).then(
      (value) => ({ value }),
      (e) => ({ error: e.message }),
    );
    let waiting = false;
    try {
      for (let i = 0; i < 200; i++) {
        const [r] =
          await monitor`select count(*)::int n from pg_stat_activity where datname='build9' and wait_event_type='Lock' and query like '%ecb9.reenter%'`;
        if (r.n) {
          waiting = true;
          break;
        }
        await delay(10);
      }
      assert.equal(waiting, true);
    } finally {
      release.resolve();
    }
    await wt;
    const r = await rt;
    if (rollback) assert.equal(r.value.result.disposition, "CONTINUE");
    else assert.match(r.error, /stale_observation/);
    results.push({
      id: "P09/P18",
      control: rollback
        ? "native Claim writer rollback"
        : "native Claim writer commit",
      waiting,
      r,
      card: await inspect(f),
    });
    await Promise.all([w.end(), p.end()]);
  }
  console.log("native standing composition PASS");
} catch (e) {
  process.exitCode = 1;
  results.push({
    result: "FAIL",
    classification: "M/T pending diagnosis",
    error: e.message,
    stack: e.stack,
  });
  console.error(e);
} finally {
  save(process.argv[2] ?? "standing-results.json", {
    result: process.exitCode ? "FAIL" : "PASS",
    results,
    limits:
      "Existing BUILD 5A writer/Claim row lock; event identities, not wall time or a new clock.",
  });
  await monitor.end();
  await close();
}
