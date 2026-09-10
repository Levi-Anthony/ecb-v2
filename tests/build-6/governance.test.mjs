import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import postgres from "../../server/ecb-human/node_modules/postgres/src/index.js";
import { createApp, hash, ORIGIN } from "../../server/ecb-human/app.mjs";
import { SyntheticAuthenticator } from "./fixture.mjs";
import { execute as executorRequest } from "../../server/ecb-human/executor.mjs";
const url = "postgres://custodian@127.0.0.1:55439/build6";
const sql = () => postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const admin = sql();
const P0 = await readFile(
  new URL(
    "../../docs/build-shape/008-build-6-p0-candidate.json",
    import.meta.url,
  ),
  "utf8",
);
const P1 = P0.replace(
  '"requires_human_explanation": false',
  '"requires_human_explanation": true',
);
const setupSecret = randomBytes(32).toString("base64url");
let scope, genesisDecision, genesis, session, csrf, appServer, endpoint;
let auth = new SyntheticAuthenticator();
let verifier, executor;
const rpc = async (db, fn, action, a) =>
  (await db.unsafe(
    `select ecb_governance.${fn}($1,$2::text::jsonb) as result`,
    [action, JSON.stringify(a)],
  ))[0].result;
const human = (action, a = {}) =>
  rpc(verifier, "human", action, { scope, ...a });
const exec = (action, a = {}) =>
  executorRequest(executor, action, { scope, ...a });
const expectReject = async (fn, pattern) => assert.rejects(fn, pattern);
class Browser {
  constructor() {
    this.jar = {};
  }
  async request(path, data, headers = {}) {
    const res = await fetch(endpoint + path, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        Origin: ORIGIN,
        ...(data === undefined ? {} : { "Content-Type": "application/json" }),
        Cookie: Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join(
          "; ",
        ),
        ...headers,
      },
      body: data === undefined ? undefined : JSON.stringify({ scope, ...data }),
    });
    for (const c of res.headers.getSetCookie()) {
      const [k, v] = c.split(";")[0].split("=");
      this.jar[k] = v;
    }
    return { status: res.status, body: await res.json(), headers: res.headers };
  }
  async post(path, data = {}, headers = {}) {
    const r = await this.request(path, data, headers);
    assert.equal(r.status, 200, JSON.stringify(r.body));
    return r.body;
  }
}
const browser = new Browser();
async function approve(bytes = P1, extra = {}) {
  return human("accept", {
    session_secret: session,
    csrf,
    policy_bytes: bytes,
    policy_digest: hash(bytes),
    predecessor: genesis.transition.id,
    request_id: randomUUID(),
    explanation: "",
    ...extra,
  });
}
function execution(d, extra = {}) {
  return {
    decision: d.id ?? d,
    policy_digest: hash(P1),
    predecessor: genesis.transition.id,
    request_id: randomUUID(),
    ...extra,
  };
}
const authOptions = () => browser.post("/api/authentication/options");
async function badAuth(change, mutate = (x) => x) {
  const a = await authOptions();
  const r = await browser.request("/api/authentication/verify", {
    ceremony: a.ceremony,
    response: mutate(auth.authenticate(a.options, change)),
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, "verification_failed");
}
async function activeBlocks(pid) {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    const [r] =
      await admin`select cardinality(pg_blocking_pids(${pid}))>0 as blocked`;
    if (r.blocked) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.fail("did not observe actual PostgreSQL blocking");
}

await test("BUILD 6 isolated PG17, signed WebAuthn, HTTP and authority boundaries", async (t) => {
  try {
    await t.test("restricted installation, seven native identities, predecessor preservation", async () => {
      const [{ version }] =
        await admin`select current_setting('server_version_num')::int as version`;
      assert(version >= 170000 && version < 180000);
      const [{ count }] =
        await admin`select count(*)::int as count from public.artifacts`;
      assert.equal(count, 9);
      await admin`alter role ecb_human_verifier login`;
      await admin`alter role ecb_governance_executor login`;
      verifier = postgres(
        "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
        { max: 1, prepare: false },
      );
      executor = postgres(
        "postgres://ecb_governance_executor@127.0.0.1:55439/build6",
        { max: 1, prepare: false },
      );
      const [{ scope_id }] =
        await admin`select ecb_governance.commission(${P0},'SYNTHETIC bounded test remit','SYNTHETIC external test root; never Levi','tests/build-6',${
          hash(setupSecret)
        },1) as scope_id`;
      scope = scope_id;
      appServer = createServer(createApp(verifier));
      await new Promise((r) => appServer.listen(0, "127.0.0.1", r));
      endpoint = `http://127.0.0.1:${appServer.address().port}`;
      const tables =
        await admin`select tablename from pg_tables where schemaname='ecb_governance'`;
      assert.equal(tables.length, 7);
      const inherited =
        await admin`select pg_has_role('ecb_human_verifier','ecb_governance_owner','MEMBER') as verifier,pg_has_role('ecb_governance_executor','ecb_governance_owner','MEMBER') as executor`;
      assert.deepEqual(inherited[0], { verifier: false, executor: false });
    });
    await t.test("uncommissioned first visitor, absent session and wrong origin rejected", async () => {
      assert.equal(
        (await browser.request("/api/setup/view", {
          setup_secret: "not-the-capability",
        })).body.error,
        "setup_unavailable",
      );
      assert.equal(
        (await browser.request("/api/view?scope=" + scope)).status,
        401,
      );
      assert.equal(
        (await browser.request(
          "/api/setup/view",
          { setup_secret: setupSecret },
          { Origin: "https://attacker.example" },
        )).body.error,
        "origin_rejected",
      );
      assert.equal(
        (await browser.request("/api/authentication/options", {})).body.error,
        "unbound_identity",
      );
    });
    await t.test("real library verifies synthetic ES256 registration; key remains inert", async () => {
      const options = await browser.post("/api/registration/options", {
        setup_secret: setupSecret,
      });
      await browser.post("/api/registration/verify", {
        setup_secret: setupSecret,
        ceremony: options.ceremony,
        response: auth.register(options.options),
      });
      const view = await browser.post("/api/setup/view", {
        setup_secret: setupSecret,
      });
      assert.equal(view.scope.binding, null);
      assert.equal(view.scope.current_transition, null);
      assert.equal(view.credentials.length, 1);
      assert.equal(
        (await browser.request("/api/authentication/options", {})).body.error,
        "unbound_identity",
      );
      assert.equal(
        (await browser.request("/api/registration/options", {
          setup_secret: setupSecret,
        })).body.error,
        "enrollment_complete",
      );
    });
    await t.test("exact binding accepts once; changed set and same-transaction effect reject", async () => {
      const helperSource = await readFile(new URL("../../server/ecb-human/live-bind.mjs", import.meta.url), "utf8");
      const setupProbe = helperSource.match(/verifier\.unsafe\("([^"]+)"/)[1];
      const probeArgs = ["setup_view", JSON.stringify({ scope, setup_secret: setupSecret })];
      // Exercise the helper's exact parameter encoding with the actual driver:
      // the same capability succeeds before binding and fails after commit.
      const [beforeBinding] = await verifier.unsafe(setupProbe, probeArgs);
      assert.equal(beforeBinding.human.scope.id, scope);
      const { digest } = await browser.post("/api/setup/digest", {
        setup_secret: setupSecret,
      });
      assert.equal(
        (await browser.request("/api/setup/bind", {
          setup_secret: setupSecret,
          credential_set_digest: "wrong",
          request_id: randomUUID(),
        })).body.error,
        "binding_changed",
      );
      await admin.begin(async (tx) => {
        const d = await rpc(tx, "human", "bind", {
          scope,
          setup_secret: setupSecret,
          credential_set_digest: digest,
          request_id: randomUUID(),
        });
        await tx.savepoint(async (sub) => {
          await expectReject(
            () =>
              rpc(sub, "executor", "execute", {
                scope,
                decision: d.decision,
                policy_digest: hash(P0),
                predecessor: null,
                request_id: randomUUID(),
              }),
            /prior_commit_required/,
          );
          throw new Error("rollback-savepoint");
        }).catch((e) => assert.match(e.message, /rollback-savepoint/));
        throw new Error("rollback-binding");
      }).catch((e) => assert.match(e.message, /rollback-binding/));
      const result = await browser.post("/api/setup/bind", {
        setup_secret: setupSecret,
        credential_set_digest: digest,
        request_id: randomUUID(),
      });
      genesisDecision = result.decision;
      assert.equal(result.activated, false);
      await assert.rejects(verifier.unsafe(setupProbe, probeArgs), e => e.code === "P0001" && e.message === "setup_unavailable");
      assert.equal(
        (await browser.request("/api/setup/bind", {
          setup_secret: setupSecret,
          credential_set_digest: digest,
          request_id: randomUUID(),
        })).body.error,
        "setup_unavailable",
      );
    });
    await t.test("committed M2 activation, exact recovery, replay/conflict and exhaustion", async () => {
      const request = {
        decision: genesisDecision,
        policy_digest: hash(P0),
        predecessor: null,
        request_id: randomUUID(),
      };
      genesis = await exec("execute", request);
      assert.deepEqual(genesis.transition.obligations, [
        "activate_exact_p0",
        "designate_initial_h_and_remit",
        "exhaust_bootstrap",
      ]);
      assert.deepEqual(await exec("execute", request), genesis);
      assert.deepEqual(await exec("recover", request), genesis);
      await expectReject(
        () => exec("execute", { ...request, policy_digest: "0".repeat(64) }),
        /request_conflict/,
      );
      await expectReject(
        () => exec("execute", { ...request, request_id: randomUUID() }),
        /decision_consumed/,
      );
      const view = await exec("inspect");
      assert.equal(view.scope.current_transition, genesis.transition.id);
      assert.equal(view.transitions.length, 1);
    });
    await t.test("real signature login creates hashed cookie session and preserves proof", async () => {
      const a = await authOptions();
      const response = auth.authenticate(a.options);
      const result = await browser.request("/api/authentication/verify", {
        ceremony: a.ceremony,
        response,
      });
      assert.equal(result.status, 200, JSON.stringify(result.body));
      csrf = result.body.csrf;
      session = browser.jar["__Host-ecb-session"];
      assert(session);
      assert.match(
        result.headers.get("set-cookie"),
        /Secure; HttpOnly; SameSite=Lax/,
      );
      const rows =
        await admin`select secret_hash,csrf_hash from ecb_governance.sessions where scope=${scope}`;
      assert.equal(rows.length, 1);
      assert.equal(rows[0].secret_hash, hash(session));
      assert.equal(rows[0].csrf_hash, hash(csrf));
      const retry = await browser.request("/api/authentication/verify", {
        ceremony: a.ceremony,
        response,
      });
      assert.equal(retry.status, 400);
      const v = await browser.request("/api/view?scope=" + scope);
      assert.equal(v.status, 200);
      assert.equal(v.body.csrf, csrf);
      assert.equal(v.headers.get("cache-control"), "no-store");
    });
    await t.test("wrong key, user handle, signature, challenge, UV, origin and cross-origin reject", async () => {
      await badAuth({ userHandle: "wrong" });
      await badAuth({ signer: new SyntheticAuthenticator().privateKey });
      await badAuth({ client: { challenge: "wrong" } });
      await badAuth({ flags: 1 });
      await badAuth({ client: { origin: "https://attacker.example" } });
      await badAuth({ client: { crossOrigin: true } });
      await badAuth({}, (r) => ({ ...r, id: new SyntheticAuthenticator().id }));
      await badAuth({ counter: 0 });
    });
    await t.test("pre-auth browser binding rejects copied ceremony", async () => {
      const options = await authOptions();
      const other = new Browser();
      const r = await other.request("/api/authentication/verify", {
        ceremony: options.ceremony,
        response: auth.authenticate(options.options),
      });
      assert.equal(r.status, 400);
    });
    await t.test("CSRF, forged session and public/agent SQL bypass fail", async () => {
      const args = {
        policy_bytes: P1,
        policy_digest: hash(P1),
        predecessor: genesis.transition.id,
        request_id: randomUUID(),
        explanation: "",
      };
      assert.equal(
        (await browser.request("/api/accept", args)).body.error,
        "csrf_rejected",
      );
      await expectReject(
        () => human("accept", { ...args, session_secret: "fake", csrf }),
        /session_required/,
      );
      await expectReject(
        () =>
          rpc(executor, "human", "accept", {
            scope,
            ...args,
            session_secret: session,
            csrf,
          }),
        /permission denied/,
      );
      for (const db of [executor, verifier]) {
        for (
          const table of [
            "subjects",
            "scopes",
            "credentials",
            "ceremonies",
            "sessions",
            "decisions",
            "transitions",
          ]
        ) {
          await expectReject(
            () => db.unsafe(`delete from ecb_governance.${table}`),
            /permission denied/,
          );
        }
      }
      for (const role of ["service_role", "anon", "authenticated"]) {
        await expectReject(() =>
          admin.begin(async (tx) => {
            await tx.unsafe(`set local role ${role}`);
            await rpc(tx, "human", "view", { scope, session_secret: session });
          }), /permission denied/);
      }
      await expectReject(
        () => verifier`set role ecb_governance_owner`,
        /permission denied/,
      );
    });
    await t.test("exact policy rejects duplicates, unknown fields, changed fixed fields, wrong type and digest", async () => {
      const malformed = [
        P1.replace('"format":', '"format":"duplicate","format":'),
        P1.replace('"allows_delegation": false', '"allows_delegation": true'),
        P1.replace(
          '"requires_human_explanation": true',
          '"requires_human_explanation": "true"',
        ),
        P1.replace("{", '{"extra":1,'),
        P1.replace('"governance_scope",', ""),
      ];
      for (const bytes of malformed) {
        await expectReject(() => approve(bytes), /unsupported_policy/);
      }
      await expectReject(
        () => approve(P1, { policy_digest: hash(P0) }),
        /wrong_digest/,
      );
    });
    await t.test("P0 authorizes exact P1 without explanation; idempotent decision conflicts on changed input", async () => {
      const request_id = randomUUID();
      const a = await approve(P1, { request_id });
      const again = await approve(P1, { request_id });
      assert.equal(a.id, again.id);
      await expectReject(() => approve(P0, { request_id }), /request_conflict/);
    });
    await t.test("withdrawal via independent client prevents execution; no reauthentication of grant needed", async () => {
      const d = await approve();
      const alternate = new Browser();
      alternate.jar["__Host-ecb-session"] = session;
      await alternate.post("/api/withdraw", {
        decision: d.id,
        request_id: randomUUID(),
      }, { "X-ECB-CSRF": csrf });
      await expectReject(
        () => exec("execute", execution(d)),
        /decision_withdrawn/,
      );
    });
    await t.test("real competing withdrawal/execution observes lock and commits withdrawal winner", async () => {
      const d = await approve();
      const other = sql();
      const [{ pid }] = await other`select pg_backend_pid() as pid`;
      await admin.unsafe("begin");
      await rpc(admin, "human", "withdraw", {
        scope,
        session_secret: session,
        csrf,
        decision: d.id,
        request_id: randomUUID(),
      });
      const pending = rpc(other, "executor", "execute", {
        scope,
        ...execution(d),
      }).then(() => {
        throw new Error("unexpected execute");
      }, (e) => e);
      await activeBlocks(pid);
      await admin.unsafe("commit");
      assert.match((await pending).message, /decision_withdrawn/);
      await other.end();
    });
    await t.test("rollback of withdrawal releases actually blocked execution; exact success recovers after reconnect", async () => {
      const d = await approve();
      const other = sql();
      const [{ pid }] = await other`select pg_backend_pid() as pid`;
      const request = execution(d);
      await admin.unsafe("begin");
      await rpc(admin, "human", "withdraw", {
        scope,
        session_secret: session,
        csrf,
        decision: d.id,
        request_id: randomUUID(),
      });
      const pending = rpc(other, "executor", "execute", { scope, ...request });
      await activeBlocks(pid);
      await admin.unsafe("rollback");
      const result = await pending;
      await other.end();
      assert.equal(result.outcome, "committed");
      const cold = sql();
      assert.deepEqual(
        await rpc(cold, "executor", "recover", { scope, ...request }),
        result,
      );
      await cold.end();
      const v = await exec("inspect");
      assert.equal(v.transitions.length, 2);
      assert.equal(v.scope.current_transition, result.transition.id);
      genesis = result;
    });
    await t.test("operative P1 governs next decision, candidate cannot lower its own approval requirement", async () => {
      await expectReject(() => approve(P0), /explanation_required/);
      const d = await approve(P0, {
        explanation: "Synthetic explained decision; remains unexecuted",
      });
      assert.equal(d.operation, "succession");
      await expectReject(
        () => approve(P0, { predecessor: randomUUID(), explanation: "x" }),
        /stale_predecessor/,
      );
    });
    await t.test("rollback leaves no effect, authoritative absence supports recovery", async () => {
      const d = await approve(P0, { explanation: "Rollback probe" });
      const request = execution(d, { policy_digest: hash(P0) });
      await admin.begin(async (tx) => {
        await rpc(tx, "executor", "execute", { scope, ...request });
        throw new Error("rollback");
      }).catch((e) => assert.equal(e.message, "rollback"));
      const r = await exec("recover", request);
      assert.equal(r.outcome, "not_committed");
      assert.equal(r.scope_locked, true);
    });
    await t.test("polling does not refresh inactivity; logout blocks new admissions but leaves committed grant executable", async () => {
      const d = await approve(P0, { explanation: "Grant survives logout" });
      const before =
        await admin`select last_active from ecb_governance.sessions where secret_hash=${
          hash(session)
        }`;
      await browser.request("/api/view?scope=" + scope);
      const after =
        await admin`select last_active from ecb_governance.sessions where secret_hash=${
          hash(session)
        }`;
      assert.deepEqual(after, before);
      await browser.post("/api/logout", {}, { "X-ECB-CSRF": csrf });
      await expectReject(
        () => approve(P0, { explanation: "after logout" }),
        /session_required/,
      );
      const r = await exec(
        "execute",
        execution(d, { policy_digest: hash(P0) }),
      );
      assert.equal(r.outcome, "committed");
    });
    await t.test("dropped HTTP login acknowledgement issues no reusable bearer proof", async () => {
      const lostBrowser = new Browser();
      const options = await lostBrowser.post("/api/authentication/options");
      const response = auth.authenticate(options.options);
      const dropped = createServer((req, res) => {
        res.end = () => res.destroy();
        return createApp(verifier)(req, res);
      });
      await new Promise((r) => dropped.listen(0, "127.0.0.1", r));
      const oldEndpoint = endpoint;
      endpoint = `http://127.0.0.1:${dropped.address().port}`;
      try {
        await assert.rejects(() =>
          lostBrowser.post("/api/authentication/verify", {
            ceremony: options.ceremony,
            response,
          })
        );
      } finally {
        endpoint = oldEndpoint;
        await new Promise((r) => dropped.close(r));
      }
      const [{ count }] =
        await admin`select count(*)::int as count from ecb_governance.sessions where ceremony=${options.ceremony}`;
      assert.equal(count, 1);
      assert.equal(lostBrowser.jar["__Host-ecb-session"], undefined);
      const replay = await lostBrowser.request("/api/authentication/verify", {
        ceremony: options.ceremony,
        response,
      });
      assert.equal(replay.status, 400);
      const fresh = await lostBrowser.post("/api/authentication/options");
      await lostBrowser.post("/api/authentication/verify", {
        ceremony: fresh.ceremony,
        response: auth.authenticate(fresh.options),
      });
      assert(lostBrowser.jar["__Host-ecb-session"]);
    });
    await t.test("expired sessions reject admission; expired ceremony cannot issue a session", async () => {
      const b = new Browser();
      const a = await b.post("/api/authentication/options");
      await admin`update ecb_governance.ceremonies set expires=clock_timestamp()-interval '1 second' where id=${a.ceremony}`;
      assert.equal(
        (await b.request("/api/authentication/verify", {
          ceremony: a.ceremony,
          response: auth.authenticate(a.options),
        })).body.error,
        "ceremony_unavailable",
      );
      const fresh = await b.post("/api/authentication/options");
      await b.post("/api/authentication/verify", {
        ceremony: fresh.ceremony,
        response: auth.authenticate(fresh.options),
      });
      const token = b.jar["__Host-ecb-session"];
      await admin`update ecb_governance.sessions set last_active=clock_timestamp()-interval '25 hours' where secret_hash=${
        hash(token)
      }`;
      assert.equal((await b.request("/api/view?scope=" + scope)).status, 401);
    });
    await t.test("inconsistent current pointer cannot report retry eligibility", async () => {
      await admin.begin(async (tx) => {
        await tx`update ecb_governance.scopes set current_transition=null where id=${scope}`;
        await rpc(tx, "executor", "recover", {
          scope,
          request_id: randomUUID(),
        });
      }).then(
        () => assert.fail("corruption admitted"),
        (e) => assert.match(e.message, /inconsistent_history/),
      );
    });
    for (const rollback of [false, true]) {
      await t.test(`genesis concurrency observes actual lock; first executor ${rollback ? "rolls back" : "commits"}`, async () => {
        const setup = randomBytes(32).toString("base64url");
        const [{ id }] =
          await admin`select ecb_governance.commission(${P0},'SYNTHETIC remit','SYNTHETIC concurrency basis','tests/build-6',${
            hash(setup)
          },1) as id`;
        const b = new Browser(), key = new SyntheticAuthenticator();
        const options = await b.post("/api/registration/options", {
          scope: id,
          setup_secret: setup,
        });
        await b.post("/api/registration/verify", {
          scope: id,
          setup_secret: setup,
          ceremony: options.ceremony,
          response: key.register(options.options),
        });
        const binding = await b.post("/api/setup/digest", {
          scope: id,
          setup_secret: setup,
        });
        const decision = await b.post("/api/setup/bind", {
          scope: id,
          setup_secret: setup,
          credential_set_digest: binding.digest,
          request_id: randomUUID(),
        });
        const request = {
          scope: id,
          decision: decision.decision,
          predecessor: null,
          policy_digest: hash(P0),
          request_id: randomUUID(),
        };
        const second = sql();
        const [{ pid }] = await second`select pg_backend_pid() as pid`;
        await admin.unsafe("begin");
        const first = await rpc(admin, "executor", "execute", request);
        const pending = rpc(second, "executor", "execute", request);
        await activeBlocks(pid);
        await admin.unsafe(rollback ? "rollback" : "commit");
        const result = await pending;
        await second.end();
        if (rollback) {
          assert.notEqual(result.transition.id, first.transition.id);
        } else assert.deepEqual(result, first);
        const view = await exec("inspect", { scope: id });
        assert.equal(view.transitions.length, 1);
        assert.equal(view.scope.current_transition, result.transition.id);
      });
    }
    await t.test("all native records have Referents; historical mutation rejected; predecessor payloads survive", async () => {
      for (
        const table of [
          "subjects",
          "scopes",
          "credentials",
          "ceremonies",
          "sessions",
          "decisions",
          "transitions",
        ]
      ) {
        const [{ missing }] = await admin.unsafe(
          `select count(*)::int as missing from ecb_governance.${table} t left join public.referents r on r.id=t.id where r.id is null`,
        );
        assert.equal(missing, 0);
      }
      await expectReject(
        () =>
          admin`update ecb_governance.decisions set explanation='rewritten' where scope=${scope}`,
        /immutable_history/,
      );
      await expectReject(
        () =>
          admin`delete from ecb_governance.transitions where scope=${scope}`,
        /immutable_history/,
      );
      const [{ count }] =
        await admin`select count(*)::int as count from public.artifacts`;
      assert.equal(count, 9);
      const owners =
        await admin`select proname,prosecdef,proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ecb_governance'`;
      for (const p of owners) {
        assert(p.proconfig.some((x) => x.startsWith("search_path=")));
      }
    });
  } finally {
    if (appServer) await new Promise((r) => appServer.close(r));
    await Promise.all([admin.end(), verifier?.end(), executor?.end()]);
  }
});
