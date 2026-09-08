import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import pg from 'pg';

const CANONICAL_PROJECT_REF = 'vezxivrvhakclxuvxzso';
const RP_ID = 'ecos.effortlessconnection.com';
const ORIGIN = 'https://ecos.effortlessconnection.com';
const ACCEPTED_P0 = await readFile(new URL('../../docs/build-shape/008-build-6-p0-candidate.json', import.meta.url), 'utf8');
const P1 = ACCEPTED_P0.replace('"requires_human_explanation": false', '"requires_human_explanation": true');

const DATABASE_URL = process.env.BUILD6_DATABASE_URL;
if (!DATABASE_URL) throw new Error('BUILD6_DATABASE_URL is required');
if (process.env.BUILD6_DISPOSABLE !== 'YES') throw new Error('BUILD6_DISPOSABLE=YES is required');
if (DATABASE_URL.includes(CANONICAL_PROJECT_REF)) {
  throw new Error('Refusing to run BUILD 6 qualification against canonical ecb-v2-brain');
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 12, application_name: 'ecb-build6-qualification' });
const runtimeRoles = new Set(['ecb_governance_installer', 'ecb_governance_verifier', 'ecb_governance_executor']);

function token(bytes = 48) { return randomBytes(bytes).toString('base64url'); }
function future(minutes = 5) { return new Date(Date.now() + minutes * 60_000).toISOString(); }

async function q(client, text, values = []) {
  return client.query(text, values);
}
async function one(client, text, values = []) {
  const result = await q(client, text, values);
  return result.rows[0]?.result;
}
async function setRole(client, role) {
  if (!runtimeRoles.has(role)) throw new Error(`unsupported test role ${role}`);
  await client.query(`set local role ${role}`);
}
async function roleCall(role, text, values = []) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await setRole(client, role);
    const result = await one(client, text, values);
    await client.query('commit');
    return result;
  } catch (error) {
    try { await client.query('rollback'); } catch { /* no-op */ }
    throw error;
  } finally {
    client.release();
  }
}
async function expectDbError(fn, codes = []) {
  let caught;
  try { await fn(); } catch (error) { caught = error; }
  assert.ok(caught, 'expected database operation to reject');
  if (codes.length) assert.ok(codes.includes(caught.code), `expected SQLSTATE ${codes.join('/')} but got ${caught.code}: ${caught.message}`);
  return caught;
}

async function retainInstallerSubject(kind, payload, format, id, source = 'build6_synthetic_qualification') {
  return roleCall(
    'ecb_governance_installer',
    'select ecb_governance.installer_retain_subject($1,$2,$3,$4,$5::uuid) as result',
    [kind, payload, format, source, id],
  );
}

async function makePreGenesis({ credentialCount = 1 } = {}) {
  const ids = {
    scope: randomUUID(), basis: randomUUID(), remit: randomUUID(), p0: randomUUID(), setup: randomUUID(),
  };
  const setupToken = token();
  await retainInstallerSubject('external_basis', 'synthetic external root basis — BUILD 6 qualification only\n', 'ecb.build6.external_basis.v1', ids.basis);
  await retainInstallerSubject('remit', 'synthetic mirror of accepted BUILD 6 H remit — qualification only\n', 'ecb.build6.remit.v1', ids.remit);
  const p0 = await retainInstallerSubject('policy', ACCEPTED_P0, 'ecb.build6.policy.v1', ids.p0);
  assert.equal(p0.digest, '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664');
  await roleCall('ecb_governance_installer', 'select ecb_governance.installer_create_scope($1::uuid) as result', [ids.scope]);
  await roleCall('ecb_governance_installer', `
    select ecb_governance.installer_open_setup(
      $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8::smallint,$9::timestamptz,$10::uuid
    ) as result
  `, [ids.scope, ids.basis, ids.remit, ids.p0, setupToken, RP_ID, ORIGIN, credentialCount, future(30), ids.setup]);
  return { ids, setupToken };
}

async function registerSynthetic(fixture, { credentialRef = randomUUID(), credentialId = `synthetic-${randomUUID()}`, counter = 0 } = {}) {
  const ceremonyId = randomUUID();
  const preauth = token();
  const challenge = token(32);
  await roleCall('ecb_governance_verifier', `
    select ecb_governance.begin_registration($1::uuid,$2,$3,$4,$5::timestamptz,$6::uuid) as result
  `, [fixture.ids.setup, fixture.setupToken, challenge, preauth, future(), ceremonyId]);
  const result = await roleCall('ecb_governance_verifier', `
    select ecb_governance.complete_registration(
      $1::uuid,$2,$3,$4,$5::bytea,$6::integer,$7::bigint,$8::text[],$9,$10::boolean,
      $11::boolean,$12,$13::boolean,$14::boolean,$15::uuid
    ) as result
  `, [
    ceremonyId, preauth, '{"synthetic":true}', credentialId, Buffer.from('a1010203262001215820'.padEnd(82, '0'), 'hex'),
    -7, counter, ['internal'], 'multiDevice', true, true, ORIGIN, false, true, credentialRef,
  ]);
  assert.equal(result.status, 'registered_inert');
  return { credentialRef, credentialId, ceremonyId };
}

async function bindCommitted(fixture, credentials, { requestId = randomUUID(), bindingId = randomUUID(), decisionId = randomUUID() } = {}) {
  const result = await roleCall('ecb_governance_verifier', `
    select ecb_governance.bind_initial_instance($1::uuid,$2,$3::uuid[],$4,$5::uuid,$6::uuid,$7::uuid) as result
  `, [fixture.ids.setup, fixture.setupToken, credentials.map((c) => c.credentialRef), 'synthetic_human_setup_completion', requestId, bindingId, decisionId]);
  return { result, requestId, bindingId, decisionId };
}

async function executeCommitted(scopeId, decisionId, { requestId = randomUUID(), transitionId = randomUUID() } = {}) {
  const result = await roleCall('ecb_governance_executor', `
    select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result
  `, [scopeId, decisionId, requestId, transitionId]);
  return { result, requestId, transitionId };
}

async function makeGenesis() {
  const fixture = await makePreGenesis();
  const credential = await registerSynthetic(fixture);
  const binding = await bindCommitted(fixture, [credential]);
  const genesis = await executeCommitted(fixture.ids.scope, binding.decisionId);
  assert.equal(genesis.result.transition_kind, 'genesis');
  assert.equal(genesis.result.bootstrap_exhausted, true);
  return { fixture, credential, binding, genesis };
}

async function makeSession(genesis, { sessionSecret = token(), csrf = token(), counter = 0 } = {}) {
  const ceremonyId = randomUUID();
  const preauth = token();
  await roleCall('ecb_governance_verifier', `
    select ecb_governance.begin_authentication($1::uuid,$2,$3,$4::timestamptz,$5::uuid) as result
  `, [genesis.fixture.ids.scope, token(32), preauth, future(), ceremonyId]);
  const credential = await roleCall('ecb_governance_verifier',
    'select ecb_governance.authentication_credential($1::uuid,$2) as result',
    [genesis.fixture.ids.scope, genesis.credential.credentialId]);
  const sessionId = randomUUID();
  const result = await roleCall('ecb_governance_verifier', `
    select ecb_governance.complete_authentication(
      $1::uuid,$2,$3,$4,$5::bytea,$6::bigint,$7,$8::boolean,$9::boolean,$10,$11::boolean,$12::boolean,
      $13,$14,$15::integer,$16::integer,$17::uuid
    ) as result
  `, [
    ceremonyId, preauth, '{"synthetic":true}', genesis.credential.credentialId,
    Buffer.from(credential.user_handle_hex, 'hex'), counter, 'multiDevice', true, true,
    ORIGIN, false, true, sessionSecret, csrf, 86400, 604800, sessionId,
  ]);
  assert.equal(result.status, 'session_created');
  return { sessionSecret, csrf, sessionId };
}

async function retainCandidate(payload, id = randomUUID()) {
  return roleCall('ecb_governance_verifier',
    'select ecb_governance.retain_candidate_policy($1,$2,$3::uuid) as result',
    [payload, 'build6_synthetic_candidate', id]);
}

async function recordDecision(genesis, session, targetSubjectId, { action = 'accept', expected = genesis.genesis.transitionId, explanation = null, requestId = randomUUID(), decisionId = randomUUID() } = {}) {
  const result = await roleCall('ecb_governance_verifier', `
    select ecb_governance.record_human_decision(
      $1,$2,$3,$4::uuid,$5,$6::uuid,$7::uuid,$8::uuid,$9,$10::uuid
    ) as result
  `, [session.sessionSecret, session.csrf, ORIGIN, genesis.fixture.ids.scope, action, targetSubjectId, expected, requestId, explanation, decisionId]);
  return { result, requestId, decisionId };
}

async function withdrawDecision(genesis, session, targetDecisionId, { requestId = randomUUID(), withdrawalId = randomUUID() } = {}) {
  const result = await roleCall('ecb_governance_verifier', `
    select ecb_governance.withdraw_human_decision($1,$2,$3,$4::uuid,$5::uuid,$6::uuid,$7::uuid) as result
  `, [session.sessionSecret, session.csrf, ORIGIN, genesis.fixture.ids.scope, targetDecisionId, requestId, withdrawalId]);
  return { result, requestId, withdrawalId };
}

test('entry gate: PostgreSQL 17 disposable predecessor and exact privilege surface', async () => {
  const client = await pool.connect();
  try {
    const version = await q(client, `select current_setting('server_version_num')::integer as n, current_database() as db`);
    assert.ok(version.rows[0].n >= 170000, `expected PostgreSQL 17+, got ${version.rows[0].n}`);

    const tables = await q(client, `
      select table_name from information_schema.tables
      where table_schema='ecb_governance' and table_type='BASE TABLE' order by table_name
    `);
    assert.deepEqual(tables.rows.map((r) => r.table_name), [
      'ceremonies','credentials','decisions','scopes','sessions','setup_grants','subjects','transitions',
    ]);

    const direct = await q(client, `
      select grantee, privilege_type, table_name from information_schema.role_table_grants
      where table_schema='ecb_governance'
        and grantee in ('anon','authenticated','service_role','ecb_governance_verifier','ecb_governance_executor')
    `);
    assert.equal(direct.rowCount, 0, 'runtime/API roles must have no direct private-table grants');

    const roleAttrs = await q(client, `
      select rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
      from pg_catalog.pg_roles where rolname like 'ecb_governance_%' order by rolname
    `);
    for (const row of roleAttrs.rows) {
      assert.equal(row.rolsuper || row.rolcreaterole || row.rolcreatedb || row.rolreplication || row.rolbypassrls, false, `${row.rolname} has forbidden role power`);
    }

    const bypass = await q(client, `
      select
        has_function_privilege('ecb_governance_executor','ecb_governance.record_human_decision(text,text,text,uuid,text,uuid,uuid,uuid,text,uuid)','execute') as executor_human,
        has_function_privilege('ecb_governance_verifier','ecb_governance.execute_governance(uuid,uuid,uuid,uuid)','execute') as verifier_execute,
        has_schema_privilege('service_role','ecb_governance','usage') as service_schema
    `);
    assert.deepEqual(bypass.rows[0], { executor_human: false, verifier_execute: false, service_schema: false });
  } finally { client.release(); }
});

test('exact policy decoder accepts P0/P1 profile and rejects normalization traps', async () => {
  const validP0 = await retainCandidate(ACCEPTED_P0);
  assert.equal(validP0.digest, '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664');
  const validP1 = await retainCandidate(P1);
  assert.notEqual(validP1.digest, validP0.digest);

  const invalid = [
    ACCEPTED_P0.replace('"allows_other_operations": false', '"allows_other_operations": false,\n  "unknown": true'),
    ACCEPTED_P0.replace('"requires_human_explanation": false', '"requires_human_explanation": "false"'),
    ACCEPTED_P0.replace('"allows_delegation": false', '"allows_delegation": true'),
    ACCEPTED_P0.replace('"governance_scope",\n    "initial_h_designation_and_remit"', '"initial_h_designation_and_remit",\n    "governance_scope"'),
    ACCEPTED_P0.replace('"operation": "policy_succession",', '"operation": "policy_succession",\n  "operation": "policy_succession",'),
  ];
  for (const payload of invalid) {
    await expectDbError(() => retainCandidate(payload), ['22023']);
  }
});

test('interrupted setup exposes inert candidate Referent IDs but does not designate H', async () => {
  const fixture = await makePreGenesis();
  const credential = await registerSynthetic(fixture);
  const context = await roleCall('ecb_governance_verifier',
    'select ecb_governance.registration_context($1::uuid,$2) as result',
    [fixture.ids.setup, fixture.setupToken]);
  assert.equal(context.candidates.length, 1);
  assert.equal(context.candidates[0].credential_ref, credential.credentialRef);
  assert.equal(context.candidates[0].bound, false);
  const state = await roleCall('ecb_governance_executor',
    'select ecb_governance.executor_scope($1::uuid) as result', [fixture.ids.scope]);
  assert.equal(state.binding_subject_id, null);
  assert.equal(state.current_transition_id, null);
  assert.equal(state.bootstrap_exhausted, false);
});

test('same-top-level transaction cannot bind genesis decision and consume it; prior commit can', async () => {
  const fixture = await makePreGenesis();
  const credential = await registerSynthetic(fixture);
  const requestId = randomUUID();
  const bindingId = randomUUID();
  const decisionId = randomUUID();
  const client = await pool.connect();
  try {
    await client.query('begin');
    await setRole(client, 'ecb_governance_verifier');
    await one(client, `select ecb_governance.bind_initial_instance($1::uuid,$2,$3::uuid[],$4,$5::uuid,$6::uuid,$7::uuid) as result`,
      [fixture.ids.setup, fixture.setupToken, [credential.credentialRef], 'synthetic_same_tx', requestId, bindingId, decisionId]);
    await setRole(client, 'ecb_governance_executor');
    await expectDbError(() => one(client,
      'select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result',
      [fixture.ids.scope, decisionId, randomUUID(), randomUUID()]), ['55000']);
    await client.query('rollback');
  } finally { client.release(); }

  const check = await roleCall('ecb_governance_verifier',
    'select ecb_governance.registration_context($1::uuid,$2) as result',
    [fixture.ids.setup, fixture.setupToken]);
  assert.equal(check.candidates[0].bound, false, 'failed same-transaction attempt must roll back binding');

  const binding = await bindCommitted(fixture, [credential], { requestId, bindingId, decisionId });
  assert.match(binding.result.status, /committed_on_transaction_end|confirmed_prior_success/);
  const genesis = await executeCommitted(fixture.ids.scope, decisionId);
  assert.equal(genesis.result.transition_kind, 'genesis');
  assert.equal(genesis.result.sequence_no, 1);
});

test('genesis retry/idempotency and recovery distinguish prior success, conflict, and scope-locked absence', async () => {
  const genesis = await makeGenesis();
  const same = await roleCall('ecb_governance_executor',
    'select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result',
    [genesis.fixture.ids.scope, genesis.binding.decisionId, genesis.genesis.requestId, randomUUID()]);
  assert.equal(same.status, 'confirmed_prior_success');

  await expectDbError(() => roleCall('ecb_governance_executor',
    'select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result',
    [genesis.fixture.ids.scope, randomUUID(), genesis.genesis.requestId, randomUUID()]), ['23505']);

  const confirmed = await roleCall('ecb_governance_executor',
    'select ecb_governance.recover_request($1::uuid,$2::uuid) as result',
    [genesis.fixture.ids.scope, genesis.genesis.requestId]);
  assert.equal(confirmed.status, 'confirmed_effect');
  const absent = await roleCall('ecb_governance_executor',
    'select ecb_governance.recover_request($1::uuid,$2::uuid) as result',
    [genesis.fixture.ids.scope, randomUUID()]);
  assert.equal(absent.status, 'not_committed_under_scope_locked_read');
});

test('P0 permits exact P1 without explanation; P1 then requires explanation and stale predecessor rejects', async () => {
  const genesis = await makeGenesis();
  const session = await makeSession(genesis);
  const p1 = await retainCandidate(P1);
  const d1 = await recordDecision(genesis, session, p1.subject_id, { explanation: null });
  assert.equal(d1.result.decision_kind, 'succession_authorization');
  const installed = await executeCommitted(genesis.fixture.ids.scope, d1.decisionId);
  assert.equal(installed.result.transition_kind, 'succession');

  const p2 = await retainCandidate(P1);
  await expectDbError(() => recordDecision(genesis, session, p2.subject_id, {
    expected: installed.transitionId, explanation: null,
  }), ['23514', '42501', '22023']);
  const explained = await recordDecision(genesis, session, p2.subject_id, {
    expected: installed.transitionId, explanation: 'Synthetic qualification explanation.',
  });
  assert.equal(explained.result.decision_kind, 'succession_authorization');

  const p3 = await retainCandidate(P1);
  await expectDbError(() => recordDecision(genesis, session, p3.subject_id, {
    expected: genesis.genesis.transitionId, explanation: 'Stale predecessor control.',
  }), ['40001']);
});

test('withdrawal prevents a pending authorization from executing', async () => {
  const genesis = await makeGenesis();
  const session = await makeSession(genesis);
  const p1 = await retainCandidate(P1);
  const decision = await recordDecision(genesis, session, p1.subject_id, { explanation: null });
  const withdrawal = await withdrawDecision(genesis, session, decision.decisionId);
  assert.equal(withdrawal.result.status, 'withdrawn');
  await expectDbError(() => executeCommitted(genesis.fixture.ids.scope, decision.decisionId), ['55000']);
});

test('logout blocks new human admissions but does not revoke a previously committed grant', async () => {
  const genesis = await makeGenesis();
  const session = await makeSession(genesis);
  const p1 = await retainCandidate(P1);
  const decision = await recordDecision(genesis, session, p1.subject_id, { explanation: null });
  const logout = await roleCall('ecb_governance_verifier',
    'select ecb_governance.logout_session($1,$2,$3) as result',
    [session.sessionSecret, session.csrf, ORIGIN]);
  assert.equal(logout.status, 'logged_out');
  const p2 = await retainCandidate(P1);
  await expectDbError(() => recordDecision(genesis, session, p2.subject_id, { explanation: 'must fail after logout' }), ['42501']);
  const executed = await executeCommitted(genesis.fixture.ids.scope, decision.decisionId);
  assert.equal(executed.result.transition_kind, 'succession');
});

test('fresh client reconstructs operative basis without conversation state', async () => {
  const genesis = await makeGenesis();
  const session = await makeSession(genesis);
  const client = new pg.Client({ connectionString: DATABASE_URL, application_name: 'ecb-build6-fresh-reconstruction' });
  await client.connect();
  try {
    await client.query('begin');
    await setRole(client, 'ecb_governance_executor');
    const executor = await one(client, 'select ecb_governance.executor_scope($1::uuid) as result', [genesis.fixture.ids.scope]);
    assert.equal(executor.bootstrap_exhausted, true);
    assert.equal(executor.current_transition_id, genesis.genesis.transitionId);
    await client.query('rollback');

    await client.query('begin');
    await setRole(client, 'ecb_governance_verifier');
    const human = await one(client, 'select ecb_governance.human_scope($1,$2::uuid) as result', [session.sessionSecret, genesis.fixture.ids.scope]);
    assert.equal(human.current_policy_digest, '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664');
    assert.equal(human.binding_subject_id, genesis.binding.bindingId);
    await client.query('rollback');
  } finally { await client.end(); }
});

test('real scope lock serializes withdrawal behind execution; rollback lets withdrawal win', async () => {
  const genesis = await makeGenesis();
  const session = await makeSession(genesis);
  const p1 = await retainCandidate(P1);
  const decision = await recordDecision(genesis, session, p1.subject_id, { explanation: null });
  const a = await pool.connect();
  const b = await pool.connect();
  try {
    await a.query('begin');
    await setRole(a, 'ecb_governance_executor');
    await one(a, 'select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result',
      [genesis.fixture.ids.scope, decision.decisionId, randomUUID(), randomUUID()]);

    await b.query('begin');
    await setRole(b, 'ecb_governance_verifier');
    const blocked = one(b, 'select ecb_governance.withdraw_human_decision($1,$2,$3,$4::uuid,$5::uuid,$6::uuid,$7::uuid) as result',
      [session.sessionSecret, session.csrf, ORIGIN, genesis.fixture.ids.scope, decision.decisionId, randomUUID(), randomUUID()]);
    const state = await Promise.race([blocked.then(() => 'completed'), new Promise((resolve) => setTimeout(() => resolve('blocked'), 150))]);
    assert.equal(state, 'blocked', 'withdrawal should wait on the scope serialization lock');
    await a.query('rollback');
    const withdrawal = await blocked;
    assert.equal(withdrawal.status, 'withdrawn');
    await b.query('commit');
    const current = await roleCall('ecb_governance_executor', 'select ecb_governance.executor_scope($1::uuid) as result', [genesis.fixture.ids.scope]);
    assert.equal(current.current_transition_id, genesis.genesis.transitionId);
  } catch (error) {
    try { await a.query('rollback'); } catch { /* no-op */ }
    try { await b.query('rollback'); } catch { /* no-op */ }
    throw error;
  } finally { a.release(); b.release(); }
});

test('real scope lock serializes withdrawal behind execution; committed execution wins truthfully', async () => {
  const genesis = await makeGenesis();
  const session = await makeSession(genesis);
  const p1 = await retainCandidate(P1);
  const decision = await recordDecision(genesis, session, p1.subject_id, { explanation: null });
  const a = await pool.connect();
  const b = await pool.connect();
  try {
    await a.query('begin');
    await setRole(a, 'ecb_governance_executor');
    const transition = await one(a, 'select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result',
      [genesis.fixture.ids.scope, decision.decisionId, randomUUID(), randomUUID()]);

    await b.query('begin');
    await setRole(b, 'ecb_governance_verifier');
    const blocked = one(b, 'select ecb_governance.withdraw_human_decision($1,$2,$3,$4::uuid,$5::uuid,$6::uuid,$7::uuid) as result',
      [session.sessionSecret, session.csrf, ORIGIN, genesis.fixture.ids.scope, decision.decisionId, randomUUID(), randomUUID()]);
    const state = await Promise.race([blocked.then(() => 'completed'), new Promise((resolve) => setTimeout(() => resolve('blocked'), 150))]);
    assert.equal(state, 'blocked');
    await a.query('commit');
    const outcome = await blocked;
    assert.equal(outcome.status, 'already_executed');
    assert.equal(outcome.transition_id, transition.transition_id);
    await b.query('commit');
  } catch (error) {
    try { await a.query('rollback'); } catch { /* no-op */ }
    try { await b.query('rollback'); } catch { /* no-op */ }
    throw error;
  } finally { a.release(); b.release(); }
});

test.after(async () => {
  await pool.end();
});
