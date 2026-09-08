import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const files = {
  p0: 'docs/build-shape/008-build-6-p0-candidate.json',
  migration: 'sql/migrations/20260908013000_build_6_governance_bootstrap.sql',
  setupRecovery: 'sql/migrations/20260908013100_build_6_setup_recovery_surface.sql',
  decisionSurface: 'sql/migrations/20260908013200_build_6_decision_result_surface.sql',
  nativeExtensionUsage: 'sql/migrations/20260908013300_build_6_native_extension_usage.sql',
  referentRegistryIntegration: 'sql/migrations/20260908013400_build_6_referent_registry_integration.sql',
  registrationResultAmbiguity: 'sql/migrations/20260908013500_build_6_registration_result_ambiguity.sql',
  prepareRunner: 'tests/build-6/ci-pg17-prepare.sh',
  installRunner: 'tests/build-6/ci-pg17-install-candidate.sh',
  humanApi: 'server/ecb-human/api/index.mjs',
  humanUi: 'server/ecb-human/src/app.js',
  executor: 'server/governance-executor/index.mjs',
  installer: 'server/governance-installer/index.mjs',
};

const ACCEPTED_P0_SHA = '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664';
const RUN8_QUALIFIED_BOOTSTRAP_SHA = 'e2010025a6de85842c25b740ec2e0af6e15db801e8cc8da67b0f92780bd91bc6';
const CANONICAL_REF = 'vezxivrvhakclxuvxzso';

function sha(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
async function bytes(relative) { return readFile(path.join(root, relative)); }

function run(command, args, env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: here, env, stdio: 'inherit' });
    child.on('exit', (code, signal) => resolve({ code, signal }));
    child.on('error', (error) => resolve({ code: null, signal: null, error: error.message }));
  });
}

const startedAt = new Date().toISOString();
const receipt = {
  format: 'ecb.build6.qualification.v1',
  started_at: startedAt,
  disposition: 'qualification_observation_not_authority',
  target: 'disposable_pg17_only',
  artifacts: {},
  checks: {},
  unrun: [
    'physical_iphone_passkey_ceremony',
    'physical_mac_passkey_ceremony',
    'real_backup_or_second_authenticator_loss_coverage',
    'qualified_https_deployment_ecos_effortlessconnection_com',
    'ordinary_operating_agent_actual_tool_and_credential_exclusion',
    'canonical_m2_activation',
    'canonical_restart_reconstruction',
    'first_human_p1_decision',
    'human_metabolize_and_build6_closure',
  ],
};

try {
  for (const [name, relative] of Object.entries(files)) {
    const content = await bytes(relative);
    receipt.artifacts[name] = { path: relative, sha256: sha(content), bytes: content.length };
  }
  assert.equal(receipt.artifacts.p0.sha256, ACCEPTED_P0_SHA, 'accepted P0 byte digest mismatch');
  receipt.checks.exact_p0_bytes = 'PASS';

  assert.equal(
    receipt.artifacts.migration.sha256,
    RUN8_QUALIFIED_BOOTSTRAP_SHA,
    'committed BUILD 6 bootstrap differs from the exact candidate qualified in run 8',
  );
  receipt.checks.exact_committed_bootstrap_bytes = 'PASS';

  const migration = (await bytes(files.migration)).toString('utf8');
  const build6Sql = (
    await Promise.all([
      files.migration,
      files.setupRecovery,
      files.decisionSurface,
      files.nativeExtensionUsage,
      files.referentRegistryIntegration,
      files.registrationResultAmbiguity,
    ].map(async (relative) => (await bytes(relative)).toString('utf8')))
  ).join('\n');
  const humanApi = (await bytes(files.humanApi)).toString('utf8');
  const executor = (await bytes(files.executor)).toString('utf8');
  const installer = (await bytes(files.installer)).toString('utf8');
  const prepareRunner = (await bytes(files.prepareRunner)).toString('utf8');

  assert.ok(!build6Sql.includes('pg_catalog.coalesce'), 'invalid pg_catalog.coalesce remains in committed BUILD 6 SQL');
  assert.ok(!build6Sql.includes('pg_catalog.least'), 'invalid pg_catalog.least remains in committed BUILD 6 SQL');
  assert.ok(migration.includes('search_path=""'), 'qualified fixed-search-path catalog representation is absent');
  assert.ok(!prepareRunner.includes('sed -e'), 'qualification still rewrites BUILD 6 migration bytes at runtime');
  assert.ok(!prepareRunner.includes('.normalized.sql'), 'qualification still consumes generated normalized migration bytes');
  receipt.checks.committed_migration_path_no_runtime_rewrite = 'PASS';

  for (const required of [
    'ecb_governance_native', 'ecb_governance_installer', 'ecb_governance_verifier',
    'ecb_governance_executor', 'execute_governance', 'record_human_decision',
    'bind_initial_instance', 'recover_request', 'pg_current_xact_id()',
  ]) assert.ok(migration.includes(required), `migration missing ${required}`);
  receipt.checks.required_governance_surface_present = 'PASS';

  assert.ok(humanApi.includes("const RP_ID = 'ecos.effortlessconnection.com'"));
  assert.ok(humanApi.includes("const ORIGIN = 'https://ecos.effortlessconnection.com'"));
  assert.ok(humanApi.includes("dbRole !== 'ecb_governance_verifier'"));
  assert.ok(!humanApi.includes('service_role'));
  assert.ok(!humanApi.includes('JWT_SECRET'));
  receipt.checks.human_service_static_custody_boundary = 'PASS';

  assert.ok(executor.includes("role !== 'ecb_governance_executor'"));
  assert.ok(!executor.includes('record_human_decision'));
  assert.ok(!executor.includes('begin_registration'));
  receipt.checks.executor_static_human_exclusion = 'PASS';

  assert.ok(installer.includes('ACCEPTED_P0_SHA256'));
  assert.ok(installer.includes('mode: 0o600'));
  assert.ok(installer.includes('Deliberately never print the setup token'));
  receipt.checks.installer_static_secret_custody = 'PASS';

  const dbUrl = process.env.BUILD6_DATABASE_URL || '';
  assert.ok(dbUrl, 'BUILD6_DATABASE_URL is required for executable qualification');
  assert.equal(process.env.BUILD6_DISPOSABLE, 'YES', 'BUILD6_DISPOSABLE=YES is required');
  assert.ok(!dbUrl.includes(CANONICAL_REF), 'canonical project URL is forbidden');
  receipt.checks.canonical_target_refusal = 'PASS';

  const executed = await run(process.execPath, ['--test', 'governance.test.mjs'], process.env);
  receipt.checks.pg17_governance_suite = executed.code === 0 ? 'PASS' : 'FAIL';
  if (executed.code !== 0) throw new Error(`governance suite exited ${executed.code ?? executed.signal ?? executed.error}`);

  receipt.result = 'PASS_WITH_REQUIRED_LIVE_OBSERVATIONS_UNRUN';
} catch (error) {
  receipt.result = 'FAIL';
  receipt.failure = error.message;
  process.exitCode = 1;
} finally {
  receipt.completed_at = new Date().toISOString();
  const output = process.env.BUILD6_RECEIPT_PATH || path.join(here, 'qualification-receipt.local.json');
  await writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ result: receipt.result, receipt: output, unrun: receipt.unrun }, null, 2)}\n`);
}
