import { createHash, randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

const PROJECT_REF = "vezxivrvhakclxuvxzso";
const TEAM_ID = "team_wueYGTZ3nxHz1WhMg8UE9gSy";
const PROJECT_ID = "prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4";
const ORIGIN = "https://ecos.effortlessconnection.com";
const RP_ID = "ecos.effortlessconnection.com";
const BRANCH = "reconcile/build-6-tested-move";
const MIGRATION_SHA = "de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461";
const P0_SHA = "686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664";
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const PRIVATE_DIR = join(homedir(), ".ecb-human-setup");
const sha = (v) => createHash("sha256").update(v).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, args, { cwd = REPO, env = process.env, input, hide = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, env, input, encoding: "utf8", stdio: input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"] });
  if (r.error || r.status !== 0) {
    const detail = hide ? "" : `\n${(r.stderr || r.stdout || "").trim()}`.slice(0, 1200);
    throw new Error(`${cmd} ${args.join(" ")} failed${detail}`);
  }
  return `${r.stdout || ""}\n${r.stderr || ""}`.trim();
}

async function postgresModule() {
  try { return (await import("postgres")).default; }
  catch (e) {
    if (e?.code !== "ERR_MODULE_NOT_FOUND") throw e;
    console.log("Installing pinned ecb-human dependencies locally...");
    run("npm", ["ci", "--ignore-scripts"], { cwd: HERE });
    return (await import("postgres")).default;
  }
}

async function secretPrompt(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("A real human-operated terminal is required.");
  process.stdout.write(label);
  if (spawnSync("stty", ["-echo"], { stdio: ["inherit", "ignore", "inherit"] }).status !== 0) throw new Error("Could not disable terminal echo.");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try { return (await rl.question("")).trim(); }
  finally { rl.close(); spawnSync("stty", ["echo"], { stdio: ["inherit", "ignore", "inherit"] }); process.stdout.write("\n"); }
}

function installerUri(raw) {
  let u;
  try { u = new URL(raw); } catch { throw new Error("Installer connection is not a valid PostgreSQL URI."); }
  if (!u.hostname.endsWith(".pooler.supabase.com") || u.port !== "5432" || decodeURIComponent(u.username) !== `postgres.${PROJECT_REF}` || !u.password || u.pathname !== "/postgres") {
    throw new Error("Use the canonical Supabase Session pooler URI for this project: postgres.<project-ref> on port 5432.");
  }
  return u;
}

function verifierUri(admin, password) {
  const u = new URL(admin.toString());
  u.username = `ecb_human_verifier.${PROJECT_REF}`;
  u.password = password;
  u.port = "6543";
  for (const k of ["sslmode", "sslrootcert", "sslcert", "sslkey"]) u.searchParams.delete(k);
  return u.toString();
}

async function counts(db) {
  const [r] = await db`select
    (select count(*)::int from ecb_governance.scopes) scopes,
    (select count(*)::int from ecb_governance.credentials) credentials,
    (select count(*)::int from ecb_governance.sessions) sessions,
    (select count(*)::int from ecb_governance.decisions) decisions,
    (select count(*)::int from ecb_governance.transitions) transitions`;
  return r;
}

async function scopeState(db, id) {
  const [r] = await db`select s.id,s.binding,s.current_transition,s.setup_hash,s.setup_expires,s.credential_count,
    (select count(*)::int from ecb_governance.credentials c where c.scope=s.id) credentials,
    (select count(*)::int from ecb_governance.decisions d where d.scope=s.id) decisions,
    (select count(*)::int from ecb_governance.decisions d where d.scope=s.id and d.operation='genesis') genesis_decisions,
    (select min(d.id::text) from ecb_governance.decisions d where d.scope=s.id and d.operation='genesis') genesis_decision,
    (select count(*)::int from ecb_governance.transitions t where t.scope=s.id) transitions
    from ecb_governance.scopes s where s.id=${id}::uuid`;
  return r;
}

async function onlyScope(db) {
  const rows = await db`select id,binding,current_transition,setup_hash,setup_expires,credential_count from ecb_governance.scopes order by id`;
  if (rows.length > 1) throw new Error("More than one canonical governance scope exists; stop for reconciliation.");
  return rows[0] || null;
}

async function privateRecovery(scope, setupHash) {
  await mkdir(PRIVATE_DIR, { recursive: true, mode: 0o700 });
  await chmod(PRIVATE_DIR, 0o700);
  for (const name of (await readdir(PRIVATE_DIR)).filter((n) => /^setup-\d+\.json$/.test(n)).sort().reverse()) {
    const path = join(PRIVATE_DIR, name);
    try {
      const info = await stat(path);
      const r = JSON.parse(await readFile(path, "utf8"));
      if (r.project === PROJECT_REF && r.scope === scope && r.setup_hash === setupHash && r.capability && sha(r.capability) === setupHash) {
        if ((info.mode & 0o777) !== 0o600) await chmod(path, 0o600);
        return { path, record: r };
      }
    } catch {}
  }
  return null;
}

async function newestRecovery(since) {
  const rows = [];
  for (const name of (await readdir(PRIVATE_DIR)).filter((n) => /^setup-\d+\.json$/.test(n))) {
    const path = join(PRIVATE_DIR, name);
    const info = await stat(path);
    if (info.mtimeMs >= since - 1000) rows.push({ path, info });
  }
  rows.sort((a, b) => b.info.mtimeMs - a.info.mtimeMs);
  for (const row of rows) {
    const r = JSON.parse(await readFile(row.path, "utf8"));
    if (r.project === PROJECT_REF && r.state === "commission_committed" && r.scope && r.capability && sha(r.capability) === r.setup_hash) {
      if ((row.info.mode & 0o777) !== 0o600) await chmod(row.path, 0o600);
      return { path: row.path, record: r };
    }
  }
  throw new Error("Installer did not leave a valid committed private recovery record.");
}

async function healthy() {
  const r = await fetch(`${ORIGIN}/health`, { cache: "no-store", redirect: "error" });
  if (r.status !== 200) throw new Error(`/health returned HTTP ${r.status}.`);
  const b = await r.json();
  if (b.service !== "ecb-human" || b.governance_activation !== "not_implied_by_service_health") throw new Error("Unexpected /health identity.");
}

async function waitHealthy() {
  let last;
  for (let i = 0; i < 45; i++) { try { await healthy(); return; } catch (e) { last = e; await sleep(2000); } }
  throw last;
}

function clipboard(secret) {
  if (process.platform !== "darwin") throw new Error("This one-command custody handoff currently requires macOS clipboard support.");
  if (spawnSync("pbcopy", [], { input: secret, encoding: "utf8", stdio: ["pipe", "ignore", "ignore"] }).status !== 0) throw new Error("Could not place setup capability on private clipboard.");
}
function clearClipboard(secret) {
  if (process.platform !== "darwin") return;
  const r = spawnSync("pbpaste", [], { encoding: "utf8" });
  if (r.status === 0 && r.stdout === secret) spawnSync("pbcopy", [], { input: "", encoding: "utf8" });
}

async function main() {
  const postgres = await postgresModule();
  if (run("git", ["branch", "--show-current"]) !== BRANCH) throw new Error(`Run from ${BRANCH}.`);
  const dirty = run("git", ["status", "--porcelain", "--", "server/ecb-human", "docs/build-shape/008-build-6-accepted-remit.txt", "docs/build-shape/008-build-6-move-release.md", "docs/build-shape/008-build-6-p0-candidate.json", "sql/migrations/20260907234712_build_6_governance_bootstrap.sql"]);
  if (dirty) throw new Error("Critical live-binding files have local modifications; preserve/reconcile them first.");
  if (sha(await readFile(join(REPO, "sql/migrations/20260907234712_build_6_governance_bootstrap.sql"))) !== MIGRATION_SHA || sha(await readFile(join(REPO, "docs/build-shape/008-build-6-p0-candidate.json"))) !== P0_SHA) throw new Error("Qualified migration or P0 bytes changed.");

  run("vercel", ["whoami"]);
  const venv = { ...process.env, VERCEL_ORG_ID: TEAM_ID, VERCEL_PROJECT_ID: PROJECT_ID };
  const forbidden = ["SERVICE_ROLE","JWT_SECRET","JWT_SIGN","POSTGRES_URL","POSTGRES_PRISMA_URL","DATABASE_OWNER","SUPABASE_SECRET","SETUP_SECRET","EXECUTOR_DATABASE_URL","INSTALLER_DATABASE_URL","ECB_BRAIN_KEY"];
  let inventory = run("vercel", ["env", "ls", "production"], { cwd: HERE, env: venv });
  const bad = forbidden.filter((k) => inventory.includes(k));
  if (bad.length) throw new Error(`Forbidden ecb-human production keys exist: ${bad.join(", ")}`);

  console.log("\nPRIVATE CUSTODY ACTION 1/3\nOperation: paste the canonical Supabase Session pooler connection URI for ecb-v2-brain into the hidden prompt.\nWhy you: it is an installation credential and must never enter model/chat custody.\nExpect: no characters echo. The URI must use postgres.vezxivrvhakclxuvxzso on port 5432; the regional pooler hostname may vary.\nHazard: do not put this URI in chat, a shell command, shell history, or the repo.\n");
  const adminUrl = installerUri(await secretPrompt("Private installer connection: "));
  const admin = postgres(adminUrl.toString(), { max: 1, prepare: false, connect_timeout: 10, ssl: { rejectUnauthorized: true }, onnotice: () => {} });
  let verifier, recovery, capability;
  try {
    const initial = await counts(admin);
    if (initial.transitions !== 0) throw new Error("A transition already exists; M2 boundary has been crossed. This helper will not continue.");
    let existing = await onlyScope(admin);
    if (existing && existing.current_transition !== null) throw new Error("Current transition is non-null; M2 boundary has been crossed.");

    const roles = await admin`select rolname,rolcanlogin,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles where rolname in ('ecb_governance_owner','ecb_human_verifier','ecb_governance_executor') order by rolname`;
    if (roles.length !== 3) throw new Error("Expected BUILD 6 roles are not all installed.");
    for (const r of roles) {
      if (r.rolsuper || r.rolbypassrls || r.rolcreaterole || r.rolcreatedb) throw new Error(`Unexpected elevated privilege on ${r.rolname}.`);
      if (r.rolname !== "ecb_human_verifier" && r.rolcanlogin) throw new Error(`${r.rolname} must remain NOLOGIN.`);
    }

    const verifierPassword = randomBytes(48).toString("base64url");
    await admin.unsafe(`alter role ecb_human_verifier login password '${verifierPassword}'`);
    const humanUrl = verifierUri(adminUrl, verifierPassword);
    verifier = postgres(humanUrl, { max: 1, prepare: false, connect_timeout: 10, ssl: { rejectUnauthorized: true }, onnotice: () => {} });
    const [id] = await verifier`select current_user role,(select rolsuper or rolbypassrls or rolcreaterole or rolcreatedb from pg_roles where rolname=current_user) elevated,pg_has_role(current_user,'ecb_governance_owner','MEMBER') owner,pg_has_role(current_user,'service_role','MEMBER') service`;
    if (id.role !== "ecb_human_verifier" || id.elevated || id.owner || id.service) throw new Error("Restricted verifier role failed local qualification.");

    const envArgs = inventory.includes("HUMAN_DATABASE_URL") ? ["env","update","HUMAN_DATABASE_URL","production"] : ["env","add","HUMAN_DATABASE_URL","production","--sensitive"];
    run("vercel", envArgs, { cwd: HERE, env: venv, input: humanUrl + "\n", hide: true });
    inventory = run("vercel", ["env","ls","production"], { cwd: HERE, env: venv });
    if (!inventory.includes("HUMAN_DATABASE_URL") || forbidden.some((k) => inventory.includes(k))) throw new Error("Vercel environment failed restricted verifier inventory check.");
    console.log("Restricted verifier qualified. Deploying exact ecb-human production target...");
    run("vercel", ["deploy","--prod","--yes"], { cwd: HERE, env: venv });
    await waitHealthy();
    const root = await fetch(ORIGIN, { cache: "no-store", redirect: "error" });
    if (root.status !== 200 || !(root.headers.get("content-type") || "").includes("text/html")) throw new Error(`Human entrance returned HTTP ${root.status}, not verifier-gated HTML.`);

    await mkdir(PRIVATE_DIR, { recursive: true, mode: 0o700 }); await chmod(PRIVATE_DIR, 0o700);
    let scope;
    if (existing) {
      recovery = await privateRecovery(existing.id, existing.setup_hash);
      if (!recovery) throw new Error("A partial canonical scope exists but its matching private recovery record is unavailable. Do not commission another scope.");
      if (existing.binding === null && new Date(existing.setup_expires) <= new Date()) throw new Error("The existing setup window expired before binding; preserve recovery material and perform a bounded repair, not a second commission.");
      scope = existing.id; capability = recovery.record.capability;
    } else {
      const remitFile = join(REPO, "docs/build-shape/008-build-6-accepted-remit.txt");
      const basisFile = join(REPO, "docs/build-shape/008-build-6-move-release.md");
      const cfg = { project_ref: PROJECT_REF, origin: ORIGIN, rp_id: RP_ID, credential_count: 1, remit_file: remitFile, remit_sha256: sha(await readFile(remitFile)), root_basis_file: basisFile, root_basis_sha256: sha(await readFile(basisFile)), source_reference: "BUILD 6 accepted H/remit/P0 and staged Move release; exact repository sources retained" };
      const cfgPath = join(PRIVATE_DIR, `live-bind-config-${Date.now()}.json`);
      await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + "\n", { mode: 0o600, flag: "wx" });
      console.log("\nPRIVATE CUSTODY ACTION 2/3\nOperation: the existing installer will display the exact retained H/remit/P0/basis and ask whether to open one 30-minute setup window.\nWhy you: OPEN creates the short-lived setup capability under human installation custody.\nExpect: prompt ending ‘Type OPEN:’. Type exactly OPEN if the displayed package matches; anything else exits without commission.\nHazard: the capability is secret. It is saved only under ~/.ecb-human-setup/ with private permissions and is never printed.\n");
      const since = Date.now();
      const child = spawnSync(process.execPath, [join(HERE, "installer.mjs"), cfgPath], { cwd: REPO, env: { ...process.env, INSTALLER_DATABASE_URL: adminUrl.toString() }, stdio: "inherit" });
      if (child.error || child.status !== 0) throw new Error("Installer did not complete a committed setup commission.");
      recovery = await newestRecovery(since); scope = recovery.record.scope; capability = recovery.record.capability;
      existing = await onlyScope(admin);
    }

    let state = await scopeState(admin, scope);
    const alreadyBound = state?.binding !== null && state.current_transition === null && state.credentials === 1 && state.decisions === 1 && state.genesis_decisions === 1 && state.transitions === 0;
    if (state?.binding !== null && !alreadyBound) throw new Error("Existing bound scope does not satisfy exact M1 invariants.");

    if (!alreadyBound) {
      clipboard(capability);
      if (process.platform === "darwin") spawnSync("open", [`${ORIGIN}/?scope=${encodeURIComponent(scope)}`], { stdio: "ignore" });
      console.log("\nPRIVATE CUSTODY ACTION 3/3\nOperation: complete the native passkey registration and exact binding in the opened ECOS Human Entrance.\nWhy you: WebAuthn user verification and final binding require your physical human custody.\nExpect: the scope is prefilled. Expand ‘First-time protected setup’; paste the clipboard once into Setup capability; Inspect setup; Add a passkey; authorize the native macOS/iCloud Keychain passkey (Touch ID is normal); Review credential binding; then Bind this credential set and scope.\nAcceptable variants: macOS may offer Touch ID, iCloud Keychain, QR/device, or a hardware security key. Use QR/security-key only if you intentionally want that credential ecosystem. Cancelling before completion is safe; rerun this helper to resume rather than creating another scope.\nHazard: never paste the setup capability anywhere except the protected setup field. Do not click any policy Accept control afterward. M2 is outside this Move. Leave this terminal running; it will verify M1 automatically.\n");
    }

    for (let i = 0; i < 450; i++) {
      state = await scopeState(admin, scope);
      if (!state) throw new Error("Commissioned scope disappeared.");
      if (state.current_transition !== null || state.transitions !== 0) throw new Error("A transition appeared; M2 boundary was crossed unexpectedly.");
      if (state.binding !== null && state.credentials === 1 && state.decisions === 1 && state.genesis_decisions === 1) break;
      await sleep(2000);
    }
    if (!state || state.binding === null || state.current_transition !== null || state.credentials !== 1 || state.decisions !== 1 || state.genesis_decisions !== 1 || state.transitions !== 0) throw new Error("Timed out before exact M1 bound-not-activated state was observed.");

    let rejected = false;
    try { await verifier.unsafe("select ecb_governance.human($1,$2::jsonb)", ["setup_view", JSON.stringify({ scope, setup_secret: capability })]); }
    catch (e) { rejected = /setup_unavailable/.test(e.message); }
    if (!rejected) throw new Error("Completed binding did not invalidate the setup capability.");
    await healthy();
    inventory = run("vercel", ["env","ls","production"], { cwd: HERE, env: venv });
    if (!inventory.includes("HUMAN_DATABASE_URL") || forbidden.some((k) => inventory.includes(k))) throw new Error("Final Vercel environment inventory is not restricted as required.");
    clearClipboard(capability);
    console.log(`\nLIVE_BINDING=PASS\nSCOPE=${scope}\nGENESIS_DECISION=${state.genesis_decision}\nBINDING=NON_NULL\nCURRENT_TRANSITION=NULL\nTRANSITIONS=0\nRECOVERY_MATERIAL=PRIVATE_0600\nHEALTH=PASS\nM2=NOT_STARTED\n`);
  } finally {
    if (capability) clearClipboard(capability);
    if (verifier) await verifier.end({ timeout: 2 }).catch(() => {});
    await admin.end({ timeout: 2 }).catch(() => {});
  }
}
main().catch((e) => { console.error(`LIVE_BINDING=BLOCKED\n${e.message}`); process.exitCode = 1; });
