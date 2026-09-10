// Human-operated installer. Never run inside model terminal capture.
import postgres from 'postgres';
import { readFile, lstat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { verifierCredential as retainCredential } from './verifier-custody.mjs';
import { expected, retainedRequest } from './m2-activate.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const project = 'vezxivrvhakclxuvxzso';
const ca = await readFile(new URL('./certs/supabase-root-2021.crt', import.meta.url), 'utf8');
let stage = 'source_validation';

export function installerUri(raw) {
  const u = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(u.protocol) ||
      !/^[a-z0-9-]+\.pooler\.supabase\.com$/.test(u.hostname) || u.port !== '5432' ||
      decodeURIComponent(u.username) !== `postgres.${project}` || !u.password || u.pathname !== '/postgres' ||
      [...u.searchParams].some(([k,v]) => !(['jit','sslmode'].includes(k)) || (k === 'jit' && v !== 'true'))) {
    throw new Error('Unexpected installer target');
  }
  return u;
}
export function executorUri(admin, password) {
  const u = new URL(admin);
  u.username = `ecb_governance_executor.${project}`;
  u.password = password;
  u.port = '6543';
  u.search = ''; // Never propagate installer JIT authorization or URI overrides.
  return u.toString();
}
export function childEnvironment(uri) {
  return { PATH: process.env.PATH || '/usr/bin:/bin', EXECUTOR_DATABASE_URL: uri };
}
export async function secretPrompt() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Human terminal required');
  process.stdout.write('Private installer connection (hidden): ');
  if (spawnSync('stty', ['-echo'], { stdio: ['inherit','ignore','ignore'] }).status !== 0) throw new Error('Echo control failed');
  // Disable readline's own terminal echo as well as the terminal driver's echo.
  const rl = createInterface({ input: process.stdin, terminal: false });
  try { return (await rl.question('')).trim(); }
  finally { rl.close(); spawnSync('stty', ['echo'], { stdio: ['inherit','ignore','ignore'] }); process.stdout.write('\n'); }
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY || Number(process.versions.node.split('.')[0]) !== 24)
    throw new Error('Node 24 and human terminal required');
  const directory = resolve(process.argv[2] || '');
  if (!process.argv[2]) throw new Error('Private custody directory required');
  await retainedRequest();
  stage = 'private_installer_input';
  console.log('BUILD 6 M2 — private executor provisioning and exact activation\nPaste the canonical Session-pooler installer URI below; it must stay out of chat and command history.\nThis enables only the existing restricted executor, then executes the already committed genesis decision.\nM1 will not run again. No P1 decision will be made.');
  let adminUrl = installerUri(await secretPrompt());
  let admin = postgres(adminUrl.toString(), { max: 1, prepare: false, connect_timeout: 10,
    ssl: { rejectUnauthorized: true, ca }, onnotice: () => {} });
  let uri;
  try {
    stage = 'canonical_preflight';
    const [state] = await admin`select current_user = 'postgres' as installer,
      (select count(*)=1 from ecb_governance.scopes) as one_scope,
      (select count(*)=1 from ecb_governance.decisions) as one_decision,
      exists(select 1 from ecb_governance.scopes s join ecb_governance.decisions d on d.scope=s.id
        join ecb_governance.subjects p on p.id=s.p0
        where s.id=${expected.scope}::uuid and s.binding='7446baff-13a8-4f68-a0c3-8445933575b8'
        and s.h='4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d' and d.id=${expected.decision}::uuid
        and d.operation='genesis' and d.policy=s.p0 and d.basis=s.root_basis and d.h=s.h
        and d.predecessor is null and p.digest=${expected.policy_digest}) as exact_basis,
      encode(sha256(convert_to(pg_get_functiondef('ecb_governance.executor(text,jsonb)'::regprocedure),'UTF8')),'hex') as executor_hash`;
    if (!state.installer || !state.one_scope || !state.one_decision || !state.exact_basis ||
      state.executor_hash !== '1429d27ef17c332c98630860784ac21808b0597a11f147f4a89a282450e26b53') throw new Error('Canonical preflight mismatch');
    const [role] = await admin`select rolcanlogin, rolinherit, rolsuper or rolbypassrls or rolcreatedb or rolcreaterole as elevated,
      pg_has_role(rolname,'ecb_governance_owner','MEMBER') or pg_has_role(rolname,'ecb_human_verifier','MEMBER') or pg_has_role(rolname,'service_role','MEMBER') as forbidden_member,
      has_function_privilege(rolname,'ecb_governance.executor(text,jsonb)','EXECUTE') as allowed,
      has_function_privilege(rolname,'ecb_governance.human(text,jsonb)','EXECUTE') or
      has_function_privilege(rolname,'ecb_governance.commission(text,text,text,text,text,integer)','EXECUTE') as forbidden_entry
      from pg_roles where rolname='ecb_governance_executor'`;
    if (!role || role.rolinherit || role.elevated || role.forbidden_member || !role.allowed || role.forbidden_entry)
      throw new Error('Executor privilege mismatch');
    const [tables] = await admin`select exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='ecb_governance' and c.relkind in ('r','p') and
      (has_table_privilege('ecb_governance_executor',c.oid,'INSERT') or has_table_privilege('ecb_governance_executor',c.oid,'UPDATE') or
      has_table_privilege('ecb_governance_executor',c.oid,'DELETE') or has_table_privilege('ecb_governance_executor',c.oid,'TRUNCATE'))) as writable`;
    if (tables.writable) throw new Error('Executor raw mutation privilege');
    let retained = false;
    try { await lstat(join(directory,'verifier-runtime.json')); retained = true; }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (role.rolcanlogin && !retained) throw new Error('Existing executor login lacks matching private recovery; do not rotate it');
    console.log('INSTALLER_AUTH=PASS\nCANONICAL_PREFLIGHT=PASS');
    stage = 'executor_credential_custody';
    // Reuse tested installer-side custody logic in a separate executor-only directory.
    // Its historical file name does not refer to or access the M1 verifier record.
    const password = await retainCredential(directory, `executor:${project}:${adminUrl.hostname}`, async value => {
      // The utility validates its own generated 64-character base64url secret.
      await admin.unsafe(`alter role ecb_governance_executor login password '${value}'`);
    });
    uri = executorUri(adminUrl.toString(), password);
  } finally { await admin.end({ timeout: 2 }).catch(() => {}); admin = undefined; adminUrl = undefined; }
  console.log('EXECUTOR_PROVISIONING=PASS\nStarting separate restricted executor process.');
  stage = 'restricted_executor_activation';
  const child = spawnSync(process.execPath, [join(here,'m2-activate.mjs')], {
    env: childEnvironment(uri), stdio: ['ignore','inherit','inherit'], cwd: here,
  });
  uri = undefined;
  if (child.error || child.status !== 0) throw new Error('Restricted executor did not confirm M2');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    const category = error?.code === '28P01' ? 'authentication_failed' : 'check_failed_or_outcome_unknown';
    console.error(`STOPPED_AT=${stage}\nCATEGORY=${category}\nM2 success is not claimed by this installer. Preserve the private recovery record and exact request. No raw credential or database error is displayed.`);
    process.exitCode = 1;
  });
}
