import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import postgres from "../../server/ecb-human/node_modules/postgres/src/index.js";
import { hash } from "../../server/ecb-human/app.mjs";

const url = "postgres://custodian@127.0.0.1:55439/build6";
const sql = () => postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const admin = sql();
const verifier = postgres(
  "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
  { max: 1, prepare: false, onnotice: () => {} },
);
const executor = postgres(
  "postgres://ecb_governance_executor@127.0.0.1:55439/build6",
  { max: 1, prepare: false, onnotice: () => {} },
);

const rpc = async (db, fn, action, a) =>
  (await db.unsafe(
    `select ecb_governance.${fn}($1,$2::text::jsonb) as result`,
    [action, JSON.stringify(a)],
  ))[0].result;

async function activeBlocks(pid) {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    const [row] = await admin`
      select cardinality(pg_blocking_pids(${pid})) > 0 as blocked
    `;
    if (row.blocked) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.fail(`did not observe PostgreSQL blocking for pid ${pid}`);
}

async function currentState() {
  const [row] = await admin`
    select s.id as scope,
           s.current_transition as predecessor,
           p.payload as policy_bytes
    from ecb_governance.scopes s
    join ecb_governance.transitions t on t.id=s.current_transition
    join ecb_governance.subjects p on p.id=t.policy
    where s.current_transition is not null
    order by (
      select count(*) from ecb_governance.decisions d where d.scope=s.id
    ) desc, s.id
    limit 1
  `;
  assert(row, "expected one active synthetic governance scope from retained qualification");
  return row;
}

function successorPolicy(current) {
  if (current.includes('"requires_human_explanation": false')) {
    return current.replace(
      '"requires_human_explanation": false',
      '"requires_human_explanation": true',
    );
  }
  if (current.includes('"requires_human_explanation": true')) {
    return current.replace(
      '"requires_human_explanation": true',
      '"requires_human_explanation": false',
    );
  }
  throw new Error("operative policy lacks supported explanation toggle");
}

async function syntheticSession(scope) {
  const [credential] = await admin`
    select id from ecb_governance.credentials
    where scope=${scope}
    order by id
    limit 1
  `;
  assert(credential, "active scope needs a retained synthetic credential");

  const secret = randomBytes(32).toString("base64url");
  const csrf = randomBytes(32).toString("base64url");
  const browser = randomBytes(32).toString("base64url");
  await admin.begin(async (tx) => {
    const [ceremony] = await tx`
      insert into ecb_governance.ceremonies(
        scope,purpose,challenge,browser_hash,proof,consumed_at
      ) values (
        ${scope},'authentication',${randomUUID()},${hash(browser)},
        ${JSON.stringify({ supplemental_readiness_fixture: true })}::jsonb,
        clock_timestamp()
      ) returning id
    `;
    await tx`
      insert into ecb_governance.sessions(
        scope,credential,ceremony,secret_hash,csrf_hash
      ) values (
        ${scope},${credential.id},${ceremony.id},${hash(secret)},${hash(csrf)}
      )
    `;
  });
  return { secret, csrf };
}

function acceptArgs(state, session, requestId = randomUUID()) {
  const candidate = successorPolicy(state.policy_bytes);
  return {
    scope: state.scope,
    session_secret: session.secret,
    csrf: session.csrf,
    policy_bytes: candidate,
    policy_digest: hash(candidate),
    predecessor: state.predecessor,
    request_id: requestId,
    explanation: "Synthetic supplemental concurrency observation",
  };
}

function executionArgs(state, decision, requestId = randomUUID()) {
  return {
    scope: state.scope,
    decision: decision.id,
    policy_digest: decision.policy_digest,
    predecessor: state.predecessor,
    request_id: requestId,
  };
}

async function twoCommittedGrants(state, session) {
  const firstVerifier = postgres(
    "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  const secondVerifier = postgres(
    "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  try {
    const [{ pid }] = await secondVerifier`select pg_backend_pid() as pid`;
    const firstArgs = acceptArgs(state, session);
    const secondArgs = acceptArgs(state, session);

    await firstVerifier.unsafe("begin");
    const first = await rpc(firstVerifier, "human", "accept", firstArgs);
    first.policy_digest = firstArgs.policy_digest;
    const pending = rpc(secondVerifier, "human", "accept", secondArgs);
    await activeBlocks(pid);
    await firstVerifier.unsafe("commit");
    const second = await pending;
    second.policy_digest = secondArgs.policy_digest;

    assert.notEqual(first.id, second.id);
    assert.equal(first.predecessor, state.predecessor);
    assert.equal(second.predecessor, state.predecessor);
    return { first, second };
  } finally {
    await Promise.all([firstVerifier.end(), secondVerifier.end()]);
  }
}

async function raceSuccessorEffects({ rollbackFirst }) {
  const state = await currentState();
  const session = await syntheticSession(state.scope);
  const { first, second } = await twoCommittedGrants(state, session);
  const firstExecutor = postgres(
    "postgres://ecb_governance_executor@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  const secondExecutor = postgres(
    "postgres://ecb_governance_executor@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  try {
    const [{ pid }] = await secondExecutor`select pg_backend_pid() as pid`;
    await firstExecutor.unsafe("begin");
    const firstResult = await rpc(
      firstExecutor,
      "executor",
      "execute",
      executionArgs(state, first),
    );
    const pending = rpc(
      secondExecutor,
      "executor",
      "execute",
      executionArgs(state, second),
    ).then(
      (value) => ({ ok: true, value }),
      (error) => ({ ok: false, error }),
    );
    await activeBlocks(pid);
    await firstExecutor.unsafe(rollbackFirst ? "rollback" : "commit");
    const secondResult = await pending;

    const [{ count }] = await admin`
      select count(*)::int as count
      from ecb_governance.transitions
      where predecessor=${state.predecessor}
    `;
    assert.equal(count, 1, "one predecessor must have exactly one lawful successor");

    if (rollbackFirst) {
      assert.equal(secondResult.ok, true);
      assert.equal(secondResult.value.outcome, "committed");
      assert.notEqual(secondResult.value.transition.id, firstResult.transition.id);
      const [scopeRow] = await admin`
        select current_transition from ecb_governance.scopes where id=${state.scope}
      `;
      assert.equal(scopeRow.current_transition, secondResult.value.transition.id);
    } else {
      assert.equal(secondResult.ok, false);
      assert.match(secondResult.error.message, /stale_predecessor/);
      const [scopeRow] = await admin`
        select current_transition from ecb_governance.scopes where id=${state.scope}
      `;
      assert.equal(scopeRow.current_transition, firstResult.transition.id);
    }
  } finally {
    await Promise.all([firstExecutor.end(), secondExecutor.end()]);
  }
}

async function logoutFirstRace({ rollbackLogout }) {
  const state = await currentState();
  const session = await syntheticSession(state.scope);
  const logoutDb = postgres(
    "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  const admissionDb = postgres(
    "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  try {
    const [{ pid }] = await admissionDb`select pg_backend_pid() as pid`;
    const admissionArgs = acceptArgs(state, session);
    await logoutDb.unsafe("begin");
    const logout = await rpc(logoutDb, "human", "logout", {
      scope: state.scope,
      session_secret: session.secret,
      csrf: session.csrf,
    });
    assert.equal(logout.logged_out, true);
    const pending = rpc(admissionDb, "human", "accept", admissionArgs).then(
      (value) => ({ ok: true, value }),
      (error) => ({ ok: false, error }),
    );
    await activeBlocks(pid);
    await logoutDb.unsafe(rollbackLogout ? "rollback" : "commit");
    const result = await pending;

    const [sessionRow] = await admin`
      select invalidated_at from ecb_governance.sessions
      where scope=${state.scope} and secret_hash=${hash(session.secret)}
    `;
    if (rollbackLogout) {
      assert.equal(result.ok, true);
      assert.equal(sessionRow.invalidated_at, null);
    } else {
      assert.equal(result.ok, false);
      assert.match(result.error.message, /session_required/);
      assert.notEqual(sessionRow.invalidated_at, null);
      const [{ count }] = await admin`
        select count(*)::int as count from ecb_governance.decisions
        where scope=${state.scope} and request_id=${admissionArgs.request_id}
      `;
      assert.equal(count, 0);
    }
  } finally {
    await Promise.all([logoutDb.end(), admissionDb.end()]);
  }
}

async function admissionFirstRace({ rollbackAdmission }) {
  const state = await currentState();
  const session = await syntheticSession(state.scope);
  const admissionDb = postgres(
    "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  const logoutDb = postgres(
    "postgres://ecb_human_verifier@127.0.0.1:55439/build6",
    { max: 1, prepare: false, onnotice: () => {} },
  );
  try {
    const [{ pid }] = await logoutDb`select pg_backend_pid() as pid`;
    const admissionArgs = acceptArgs(state, session);
    await admissionDb.unsafe("begin");
    const admitted = await rpc(admissionDb, "human", "accept", admissionArgs);
    const pendingLogout = rpc(logoutDb, "human", "logout", {
      scope: state.scope,
      session_secret: session.secret,
      csrf: session.csrf,
    });
    await activeBlocks(pid);
    await admissionDb.unsafe(rollbackAdmission ? "rollback" : "commit");
    const logout = await pendingLogout;
    assert.equal(logout.logged_out, true);

    const [{ count }] = await admin`
      select count(*)::int as count from ecb_governance.decisions
      where scope=${state.scope} and request_id=${admissionArgs.request_id}
    `;
    assert.equal(count, rollbackAdmission ? 0 : 1);
    if (!rollbackAdmission) assert.equal(admitted.request_id, admissionArgs.request_id);

    const [sessionRow] = await admin`
      select invalidated_at from ecb_governance.sessions
      where scope=${state.scope} and secret_hash=${hash(session.secret)}
    `;
    assert.notEqual(sessionRow.invalidated_at, null);
  } finally {
    await Promise.all([admissionDb.end(), logoutDb.end()]);
  }
}

await test("BUILD 6 supplemental readiness concurrency observations", async (t) => {
  try {
    await t.test(
      "distinct succession grants serialize; committed first effect leaves exactly one successor",
      () => raceSuccessorEffects({ rollbackFirst: false }),
    );
    await t.test(
      "distinct succession grants serialize; rolled-back first effect releases blocked successor",
      () => raceSuccessorEffects({ rollbackFirst: true }),
    );
    await t.test(
      "logout commit wins over blocked admission",
      () => logoutFirstRace({ rollbackLogout: false }),
    );
    await t.test(
      "logout rollback releases blocked admission",
      () => logoutFirstRace({ rollbackLogout: true }),
    );
    await t.test(
      "committed admission completes before blocked logout",
      () => admissionFirstRace({ rollbackAdmission: false }),
    );
    await t.test(
      "rolled-back admission leaves no decision before blocked logout invalidates session",
      () => admissionFirstRace({ rollbackAdmission: true }),
    );
  } finally {
    await Promise.all([admin.end(), verifier.end(), executor.end()]);
  }
});
