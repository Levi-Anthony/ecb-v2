import pg from 'pg';

const DATABASE_URL = process.env.ECB_EXECUTOR_DATABASE_URL;
if (!DATABASE_URL) throw new Error('ECB_EXECUTOR_DATABASE_URL is required');

const parsed = new URL(DATABASE_URL);
const role = decodeURIComponent(parsed.username).split('.')[0];
if (role !== 'ecb_governance_executor') {
  throw new Error('ECB_EXECUTOR_DATABASE_URL must authenticate only as ecb_governance_executor');
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  application_name: 'ecb-governance-executor-build6',
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function uuid(value, label) {
  if (!UUID.test(String(value || ''))) throw new Error(`${label}_invalid`);
  return value;
}

async function one(sql, values) {
  const result = await pool.query(sql, values);
  return result.rows[0]?.result;
}

export async function inspectScope(scopeId) {
  return one(
    'select ecb_governance.executor_scope($1::uuid) as result',
    [uuid(scopeId, 'scope_id')],
  );
}

export async function executeCommittedDecision({ scopeId, decisionId, requestId, transitionId = null }) {
  return one(
    'select ecb_governance.execute_governance($1::uuid,$2::uuid,$3::uuid,$4::uuid) as result',
    [
      uuid(scopeId, 'scope_id'),
      uuid(decisionId, 'decision_id'),
      uuid(requestId, 'request_id'),
      transitionId === null ? null : uuid(transitionId, 'transition_id'),
    ],
  );
}

export async function recover({ scopeId, requestId }) {
  return one(
    'select ecb_governance.recover_request($1::uuid,$2::uuid) as result',
    [uuid(scopeId, 'scope_id'), uuid(requestId, 'request_id')],
  );
}

export async function verifyRuntimeRole() {
  const result = await pool.query(
    "select current_user as role, current_setting('server_version') as postgres_version",
  );
  if (result.rows[0]?.role !== 'ecb_governance_executor') {
    throw new Error('database_role_rejected');
  }
  return result.rows[0];
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'inspect' && args.length === 1) {
    console.log(JSON.stringify(await inspectScope(args[0]), null, 2));
  } else if (command === 'execute' && (args.length === 3 || args.length === 4)) {
    const [scopeId, decisionId, requestId, transitionId] = args;
    console.log(JSON.stringify(await executeCommittedDecision({ scopeId, decisionId, requestId, transitionId }), null, 2));
  } else if (command === 'recover' && args.length === 2) {
    const [scopeId, requestId] = args;
    console.log(JSON.stringify(await recover({ scopeId, requestId }), null, 2));
  } else if (command === 'health' && args.length === 0) {
    console.log(JSON.stringify(await verifyRuntimeRole(), null, 2));
  } else {
    throw new Error('usage: inspect <scope> | execute <scope> <decision> <request> [transition] | recover <scope> <request> | health');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(JSON.stringify({ error: error.message }));
    process.exitCode = 1;
  }).finally(() => pool.end());
}
