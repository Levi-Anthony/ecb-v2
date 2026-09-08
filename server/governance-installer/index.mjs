import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { chmod, readFile, writeFile } from 'node:fs/promises';
import pg from 'pg';

const ACCEPTED_P0_SHA256 = '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664';
const RP_ID = 'ecos.effortlessconnection.com';
const ORIGIN = 'https://ecos.effortlessconnection.com';

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith('--') || value === undefined) fail('arguments must be --name value pairs');
    out[key.slice(2)] = value;
  }
  return out;
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function uuid(value, label) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))) {
    fail(`${label} must be a UUID`);
  }
  return value;
}

async function call(client, text, values) {
  const result = await client.query(text, values);
  return result.rows[0]?.result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const databaseUrl = process.env.ECB_INSTALLER_DATABASE_URL;
  if (!databaseUrl) fail('ECB_INSTALLER_DATABASE_URL is required');
  if (!args['basis-file'] || !args['remit-file'] || !args['p0-file'] || !args['output']) {
    fail('required: --basis-file --remit-file --p0-file --output');
  }

  const scopeId = args.scope ? uuid(args.scope, 'scope') : randomUUID();
  const basisId = args['basis-id'] ? uuid(args['basis-id'], 'basis-id') : randomUUID();
  const remitId = args['remit-id'] ? uuid(args['remit-id'], 'remit-id') : randomUUID();
  const p0Id = args['p0-id'] ? uuid(args['p0-id'], 'p0-id') : randomUUID();
  const setupId = args['setup-id'] ? uuid(args['setup-id'], 'setup-id') : randomUUID();
  const sourceRef = args['source-ref'] || 'build6_protected_installer';
  const credentialCount = Number(args['credential-count'] || '1');
  if (!Number.isInteger(credentialCount) || credentialCount < 1 || credentialCount > 3) {
    fail('credential-count must be 1..3');
  }
  const minutes = Number(args['expires-minutes'] || '30');
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 120) fail('expires-minutes must be >0 and <=120');

  const [basis, remit, p0] = await Promise.all([
    readFile(args['basis-file'], 'utf8'),
    readFile(args['remit-file'], 'utf8'),
    readFile(args['p0-file'], 'utf8'),
  ]);
  if (sha256(p0) !== ACCEPTED_P0_SHA256) fail('P0 bytes do not match the accepted BUILD 6 SHA-256');

  const token = randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();
  const client = new pg.Client({ connectionString: databaseUrl, application_name: 'ecb-build6-installer' });
  await client.connect();
  try {
    const identity = await client.query(`
      select current_user as role,
             has_function_privilege(current_user,
               'ecb_governance.installer_retain_subject(text,text,text,text,uuid)', 'execute') as retain_ok,
             has_function_privilege(current_user,
               'ecb_governance.installer_create_scope(uuid)', 'execute') as scope_ok,
             has_function_privilege(current_user,
               'ecb_governance.installer_open_setup(uuid,uuid,uuid,uuid,text,text,text,smallint,timestamptz,uuid)', 'execute') as setup_ok
    `);
    const access = identity.rows[0];
    if (['ecb_governance_verifier', 'ecb_governance_executor'].includes(access.role)) {
      fail('runtime verifier/executor credential cannot be used as installation custody');
    }
    if (!access.retain_ok || !access.scope_ok || !access.setup_ok) {
      fail(`current installation custody role ${access.role} lacks the bounded installer entries`);
    }

    await client.query('begin');
    const basisResult = await call(client,
      'select ecb_governance.installer_retain_subject($1,$2,$3,$4,$5::uuid) as result',
      ['external_basis', basis, 'ecb.build6.external_basis.v1', sourceRef, basisId]);
    const remitResult = await call(client,
      'select ecb_governance.installer_retain_subject($1,$2,$3,$4,$5::uuid) as result',
      ['remit', remit, 'ecb.build6.remit.v1', sourceRef, remitId]);
    const p0Result = await call(client,
      'select ecb_governance.installer_retain_subject($1,$2,$3,$4,$5::uuid) as result',
      ['policy', p0, 'ecb.build6.policy.v1', sourceRef, p0Id]);
    await call(client, 'select ecb_governance.installer_create_scope($1::uuid) as result', [scopeId]);
    const setup = await call(client, `
      select ecb_governance.installer_open_setup(
        $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8::smallint,$9::timestamptz,$10::uuid
      ) as result
    `, [scopeId, basisId, remitId, p0Id, token, RP_ID, ORIGIN, credentialCount, expiresAt, setupId]);
    await client.query('commit');

    const secretEnvelope = {
      format: 'ecb.build6.setup-capability.v1',
      setupId,
      scopeId,
      token,
      expiresAt,
      expectedCredentialCount: credentialCount,
      rpId: RP_ID,
      origin: ORIGIN,
    };
    await writeFile(args.output, `${JSON.stringify(secretEnvelope, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
    await chmod(args.output, 0o600);

    const receipt = {
      status: 'setup_capability_created',
      setupId,
      scopeId,
      expiresAt,
      expectedCredentialCount: credentialCount,
      outputFile: args.output,
      basis: basisResult,
      remit: remitResult,
      p0: p0Result,
      setup,
    };
    // Deliberately never print the setup token.
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } catch (error) {
    try { await client.query('rollback'); } catch { /* no-op */ }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
  process.exitCode = 1;
});
