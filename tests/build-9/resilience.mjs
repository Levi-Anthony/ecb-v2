import assert from "node:assert/strict";
import { execFileSync, fork } from "node:child_process";
import { readFileSync } from "node:fs";
import * as s from "./support.mjs";
const {
  connect,
  admin,
  make,
  run,
  open,
  publish,
  returned,
  reenter,
  observe,
  inspect,
  fixture,
  uuid,
  save,
  close,
  sha,
} = s;
const result = [];
const monitor = connect("custodian");
async function ready() {
  const f = await make();
  await open(f);
  const q = await publish(f);
  await returned(f, q.judgment);
  return f;
}
const signals = () => {
  let resolve;
  const p = new Promise((r) => resolve = r);
  return { p, resolve };
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function blocked(queryText) {
  for (let i = 0; i < 200; i++) {
    const r =
      await monitor`select count(*)::int n from pg_stat_activity where datname='build9' and wait_event_type='Lock' and query like ${
        "%" + queryText + "%"
      }`;
    if (r[0].n) return r[0].n;
    await wait(10);
  }
  throw Error("test did not observe real lock wait");
}
try {
  for (const rollback of [false, true]) {
    const f = await ready(),
      card = await inspect(f),
      v = await fixture(f, {
        kind: "applicability",
        subject: f.subjects.applicability,
        applicable: false,
      });
    const w = connect("b9_writer"),
      p = connect("b9_parent"),
      written = signals(),
      release = signals();
    const wt = w.begin(async (tx) => {
      await observe(f, "applicability", v, true, {
        db: tx,
        pred: card.boundary,
      });
      written.resolve();
      await release.p;
      if (rollback) throw Error("intentional writer rollback");
    }).catch((e) => {
      if (!rollback) throw e;
      assert.equal(e.message, "intentional writer rollback");
    });
    await written.p;
    const rt = reenter(f, { db: p, card }).then(
      (x) => ({ value: x }),
      (e) => ({ error: e.message }),
    );
    const waiting = await blocked("ecb9.reenter");
    release.resolve();
    await wt;
    const r = await rt;
    if (rollback) assert.equal(r.value.result.disposition, "CONTINUE");
    else assert.match(r.error, /stale_predecessor/);
    const after = await inspect(f);
    if (rollback) assert.equal(after.changes.length, 0);
    else assert.equal(after.present.disposition, "REQUALIFY");
    result.push({
      id: "P09",
      control: rollback
        ? "writer rollback then reentry"
        : "writer commit before stale reentry",
      waiting,
      r,
      after,
    });
    await Promise.all([w.end(), p.end()]);
  }
  {
    const f = await ready(),
      card = await inspect(f),
      v = await fixture(f, {
        kind: "applicability",
        subject: f.subjects.applicability,
        applicable: false,
      });
    const p = connect(),
      w = connect("b9_writer"),
      written = signals(),
      release = signals();
    const pt = p.begin(async (tx) => {
      const r = await reenter(f, { db: tx, card });
      assert.equal(r.result.disposition, "CONTINUE");
      written.resolve();
      await release.p;
      return r;
    });
    await written.p;
    const wt = observe(f, "applicability", v, true, {
      db: w,
      pred: card.boundary,
    }).then((x) => ({ value: x }), (e) => ({ error: e.message }));
    const waiting = await blocked("ecb9.observe");
    release.resolve();
    const pr = await pt, wr = await wt;
    assert.match(wr.error, /stale_predecessor/);
    await observe(f, "applicability", v);
    const after = await inspect(f);
    assert.equal(after.present.disposition, "REQUALIFY");
    result.push({
      id: "P09",
      control: "reentry first; writer stale then fresh serialized observation",
      waiting,
      pr,
      wr,
      after,
    });
    await Promise.all([w.end(), p.end()]);
  }
  for (const operation of ["open", "publish", "return", "reentry"]) {
    for (const stopAt of ["before-commit", "after-commit"]) {
      const f = await make();
      if (operation !== "open") {
        await open(f);
      }
      let q;
      if (["return", "reentry"].includes(operation)) q = await publish(f);
      if (operation === "reentry") await returned(f, q.judgment);
      const before = await inspect(f),
        request = uuid(),
        worker = fork("tests/build-9/crash-worker.mjs", [
          f.p,
          operation,
          stopAt,
          request,
        ], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
      const messages = [], errs = [];
      worker.stderr.on("data", (b) => errs.push(String(b)));
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          worker.kill("SIGKILL");
          reject(Error("crash harness phase timeout " + errs.join("")));
        }, 15000);
        worker.on("message", (msg) => {
          messages.push(msg);
          if (msg.phase === "error") {
            clearTimeout(timer);
            reject(Error(msg.message));
          }
          if (msg.phase === "ready") worker.send("apply");
          if (
            msg.phase ===
              (stopAt === "before-commit"
                ? "applied-uncommitted"
                : "committed-no-caller-ack")
          ) {
            clearTimeout(timer);
            resolve();
          }
        });
      });
      worker.kill("SIGKILL");
      await new Promise((r) => worker.once("exit", r));
      const after = await inspect(f);
      if (stopAt === "before-commit") {
        assert.equal(after.boundary, before.boundary);
      } else assert.notEqual(after.boundary, before.boundary);
      let recovered;
      const opts = { pred: before.boundary, request };
      if (operation === "open") {
        recovered = await open(f, opts);
      }
      if (operation === "publish") {
        recovered = await publish(f, {
          ...opts,
          attempt: before.child.attempt,
        });
      }
      if (operation === "return") {
        recovered = await returned(f, q.judgment, opts);
      }
      if (operation === "reentry") {
        recovered = await reenter(f, { ...opts, card: before });
      }
      assert.equal(recovered.replay, stopAt === "after-commit");
      const cold = JSON.parse(
        execFileSync(process.execPath, ["server/build-9/recover.mjs", f.p], {
          encoding: "utf8",
        }),
      );
      assert.ok(cold.boundary);
      result.push({
        id: "P12",
        control: operation + " " + stopAt,
        before,
        phases: messages.map((m) => m.phase),
        after,
        recovered,
        cold,
      });
    }
  }
  // Actual database server crash, with committed result and uncommitted reentry.
  {
    const f = await ready(), before = await inspect(f), request = uuid();
    const worker = fork("tests/build-9/crash-worker.mjs", [
      f.p,
      "reentry",
      "before-commit",
      request,
    ], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
    const phases = [];
    await new Promise((resolve, reject) => {
      worker.on("message", (m) => {
        phases.push(m.phase);
        if (m.phase === "ready") worker.send("apply");
        if (m.phase === "applied-uncommitted") resolve();
        if (m.phase === "error") reject(Error(m.message));
      });
    });
    execFileSync("docker", ["kill", "--signal=KILL", "ecb9-move-pg17"]);
    worker.kill("SIGKILL");
    execFileSync("docker", ["start", "ecb9-move-pg17"]);
    for (let i = 0; i < 100; i++) {
      try {
        execFileSync("docker", [
          "exec",
          "ecb9-move-pg17",
          "pg_isready",
          "-U",
          "custodian",
        ], { stdio: "ignore" });
        break;
      } catch {
        await wait(100);
      }
    }
    const cold = JSON.parse(
      execFileSync(process.execPath, ["server/build-9/recover.mjs", f.p], {
        encoding: "utf8",
      }),
    );
    assert.equal(cold.boundary, before.boundary);
    assert.equal(cold.judgment.source, before.judgment.source);
    assert.equal(cold.present.disposition, "CONTINUE");
    const fresh = await reenter(f, { card: before, request });
    assert.equal(fresh.replay, false);
    result.push({
      id: "P12",
      control: "PG17 SIGKILL/crash recovery",
      phases,
      before,
      cold,
      fresh,
    });
  }
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  process.exitCode = 1;
  result.push({
    result: "FAIL",
    classification: "M/T pending diagnosis",
    error: e.message,
    stack: e.stack,
  });
  console.error(e);
} finally {
  save(process.argv[2] ?? "resilience-results.json", {
    implementationSha: sha(
      readFileSync(
        "sql/migrations/20260912160000_build_9_recursive_inquiry.sql",
      ),
    ),
    fixtureSha: sha(readFileSync("tests/build-9/support.mjs")),
    methodSha: sha(readFileSync("tests/build-9/resilience.mjs")),
    results: result,
    limits:
      "Actual PG17 loopback row-lock concurrency and crash durability only; no distributed exactly-once or permanent-loss guarantee.",
  });
  await monitor.end();
  await close();
}
