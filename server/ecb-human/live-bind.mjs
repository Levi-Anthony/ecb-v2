import postgres from "postgres";
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
const EXPECTED_MIGRATION_SHA =
  "de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461";
const EXPECTED_P0_SHA =
  "686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664";
const EXPECTED_BRANCH = "reconcile/build-6-tested-move";
const SERVICE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(SERVICE_DIR, "../..");
const SETUP_DIR = join(homedir(), ".ecb-human-setup");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(command, args, {
  cwd = REPO,
  env = process.env,
  input,
  quietFailure = false,
} = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    input,
    encoding: "utf8",
    stdio: input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) {
    const detail = quietFailure
      ? ""
      : `\n${(result.stderr || result.stdout || "").trim()}`.slice(0, 1200);
    throw new Error(`${command} ${args.join(" ")} failed${detail}`);
  }
  return `${result.stdout || ""}\n${result.stderr || ""}`.trim();
}

async function hiddenQuestion(promptText) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("A real human-operated terminal is required.");
  }
  process.stdout.write(promptText);
  const off = spawnSync("stty", ["-echo"], { stdio: ["inherit", "ignore", "inherit"] });
  if (off.status !== 0) throw new Error("Could not disable terminal echo.");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question("")).trim();
  } finally {
    rl.close();
    spawnSync("stty", ["echo"], { stdio: ["inherit", "ignore", "inherit"] });
    process.stdout.write("\n");
  }
}

function validateInstallerUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Installer connection is not a valid PostgreSQL URI.");
  }
  const user = decodeURIComponent(url.username);
  if (
    !url.hostname.endsWith(".pooler.supabase.com") ||
    url.port !== "5432" ||
    user !== `postgres.${PROJECT_REF}` ||
    !url.password ||
    !url.pathname.endsWith("/postgres")
  ) {
    throw new Error(
      "Use the canonical Supabase Session pooler URI: postgres.<project-ref> on port 5432.",
    );
  }
  return url;
}

function verifierUrlFrom(installerUrl, password) {
  const url = new URL(installerUrl.toString());
  url.username = `ecb_human_verifier.${PROJECT_REF}`;
  url.password = password;
  url.port = "6543";
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey"]) {
    url.searchParams.delete(key);
  }
  return url.toString();
}

async function governanceState(db) {
  const [row] = await db`
    select
      (select count(*)::int from ecb_governance.scopes) as scopes,
      (select count(*)::int from ecb_governance.credentials) as credentials,
      (select count(*)::int from ecb_governance.sessions) as sessions,
      (select count(*)::int from ecb_governance.decisions) as decisions,
      (select count(*)::int from ecb_governance.transitions) as transitions
  `;
  return row;
}

async function m1State(db, scope) {
  const [row] = await db`
    select
      s.id,
      s.binding,
      s.current_transition,
      (select count(*)::int from ecb_governance.credentials c where c.scope=s.id) as credentials,
      (select count(*)::int from ecb_governance.decisions d where d.scope=s.id) as decisions,
      (select count(*)::int from ecb_governance.decisions d where d.scope=s.id and d.operation='genesis') as genesis_decisions,
      (select min(d.id::text) from ecb_governance.decisions d where d.scope=s.id and d.operation='genesis') as genesis_decision,
      (select count(*)::int from ecb_governance.transitions t where t.scope=s.id) as transitions
    from ecb_governance.scopes s
    where s.id=${scope}::uuid
  `;
  return row;
}

async function health(expectedStatus = 200) {
  const response = await fetch(`${ORIGIN}/health`, {
    cache: "no-store",
    redirect: "error",
  });
  const text = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`/health returned HTTP ${response.status}, expected ${expectedStatus}.`);
  }
  if (expectedStatus === 200) {
    const body = JSON.parse(text);
    if (
      body.service !== "ecb-human" ||
      body.governance_activation !== "not_implied_by_service_health"
    ) throw new Error("/health returned an unexpected service identity.");
  }
  return response;
}

async function waitForHealth() {
  let last;
  for (let i = 0; i < 45; i++) {
    try {
      return await health(200);
    } catch (error) {
      last = error;
      await sleep(2000);
    }
  }
  throw last ?? new Error("Hosted verifier did not become healthy.");
}

async function newestRecovery(sinceMs) {
  const names = (await readdir(SETUP_DIR))
    .filter((name) => /^setup-\d+\.json$/.test(name));
  const candidates = [];
  for (const name of names) {
    const path = join(SETUP_DIR, name);
    const info = await stat(path);
    if (info.mtimeMs >= sinceMs - 1000) candidates.push({ path, mtimeMs: info.mtimeMs, mode: info.mode });
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (!candidates.length) throw new Error("Installer did not leave a recoverable setup record.");
  const chosen = candidates[0];
  if ((chosen.mode & 0o777) !== 0o600) {
    await chmod(chosen.path, 0o600);
  }
  const record = JSON.parse(await readFile(chosen.path, "utf8"));
  if (
    record.project !== PROJECT_REF ||
    record.state !== "commission_committed" ||
    !record.scope ||
    !record.capability ||
    digest(record.capability) !== record.setup_hash
  ) {
    throw new Error("Setup recovery record is incomplete or does not match the canonical project.");
  }
  return { path: chosen.path, record };
}

function copySecretToClipboard(secret) {
  if (process.platform !== "darwin") {
    throw new Error(
      "Automatic private clipboard handoff currently requires macOS; use the recovery file directly without pasting it into chat or shell history.",
    );
  }
  const result = spawnSync("pbcopy", [], {
    input: secret,
    encoding: "utf8",
    stdio: ["pipe", "ignore", "ignore"],
  });
  if (result.status !== 0) throw new Error("Could not copy setup capability to the macOS clipboard.");
}

function clearClipboardIfStill(secret) {
  if (process.platform !== "darwin") return;
  const read = spawnSync("pbpaste", [], { encoding: "utf8" });
  if (read.status === 0 && read.stdout === secret) {
    spawnSync("pbcopy", [], { input: "", encoding: "utf8" });
  }
}

function openBrowser(scope) {
  if (process.platform !== "darwin") return false;
  const result = spawnSync("open", [`${ORIGIN}/?scope=${encodeURIComponent(scope)}`], {
    stdio: "ignore",
  });
  return result.status === 0;
}

async function main() {
  const branch = run("git", ["branch", "--show-current"]);
  if (branch !== EXPECTED_BRANCH) {
    throw new Error(`Run this from ${EXPECTED_BRANCH}; current branch is ${branch || "(detached)"}.`);
  }
  const critical = run("git", [
    "status", "--porcelain", "--",
    "server/ecb-human",
    "docs/build-shape/008-build-6-accepted-remit.txt",
    "docs/build-shape/008-build-6-move-release.md",
    "docs/build-shape/008-build-6-p0-candidate.json",
    "sql/migrations/20260907234712_build_6_governance_bootstrap.sql",
  ]);
  if (critical) {
    throw new Error("Critical BUILD 6 live-bind files have local modifications. Preserve or reconcile them before custody begins.");
  }

  const migration = await readFile(
    join(REPO, "sql/migrations/20260907234712_build_6_governance_bootstrap.sql"),
  );
  const p0 = await readFile(join(REPO, "docs/build-shape/008-build-6-p0-candidate.json"));
  if (digest(migration) !== EXPECTED_MIGRATION_SHA || digest(p0) !== EXPECTED_P0_SHA) {
    throw new Error("Qualified BUILD 6 migration or P0 bytes changed.");
  }

  run("vercel", ["whoami"]);
  const vercelEnv = {
    ...process.env,
    VERCEL_ORG_ID: TEAM_ID,
    VERCEL_PROJECT_ID: PROJECT_ID,
  };
  let inventory = run("vercel", ["env", "ls", "production"], {
    cwd: SERVICE_DIR,
    env: vercelEnv,
  });
  const forbidden = [
    "SERVICE_ROLE", "JWT_SECRET", "JWT_SIGN", "POSTGRES_URL",
    "POSTGRES_PRISMA_URL", "DATABASE_OWNER", "SUPABASE_SECRET",
    "SETUP_SECRET", "EXECUTOR_DATABASE_URL", "INSTALLER_DATABASE_URL",
    "ECB_BRAIN_KEY",
  ];
  const presentForbidden = forbidden.filter((name) => inventory.includes(name));
  if (presentForbidden.length) {
    throw new Error(`ecb-human production contains forbidden keys: ${presentForbidden.join(", ")}`);
  }

  console.log(
    "\nPRIVATE CUSTODY ACTION 1/3\n" +
    "Paste the canonical Supabase Session pooler connection URI for project " +
    `${PROJECT_REF}. It must use postgres.${PROJECT_REF} on port 5432.\n` +
    "Why you: this credential has installation authority and must never enter model/chat custody.\n" +
    "Expected: the terminal will hide your input completely. Nothing should echo.\n" +
    "Acceptable variant: the host prefix may differ by Supabase region, but it must end in .pooler.supabase.com.\n" +
    "Hazard: do not paste this URI into chat, a command line, shell history, or a file in the repo.\n",
  );
  const installerRaw = await hiddenQuestion("Private installer connection: ");
  const installerUrl = validateInstallerUrl(installerRaw);
  const admin = postgres(installerUrl.toString(), {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: true },
    onnotice: () => {},
  });

  let verifier;
  let recovery;
  try {
    const initial = await governanceState(admin);
    if (initial.transitions !== 0) {
      throw new Error("M2 or a later transition already exists; live-bind will not advance or rewrite it.");
    }
    if (initial.scopes !== 0) {
      throw new Error(
        "A canonical scope already exists. This helper will not commission a second scope blindly; recover the existing private setup record first.",
      );
    }

    const roles = await admin`
      select rolname, rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb
      from pg_roles
      where rolname in ('ecb_governance_owner','ecb_human_verifier','ecb_governance_executor')
      order by rolname
    `;
    if (roles.length !== 3) throw new Error("Expected BUILD 6 roles are not all installed.");
    for (const role of roles) {
      if (role.rolsuper || role.rolbypassrls || role.rolcreaterole || role.rolcreatedb) {
        throw new Error(`Unexpected elevated privilege on ${role.rolname}.`);
      }
      if (role.rolname !== "ecb_human_verifier" && role.rolcanlogin) {
        throw new Error(`${role.rolname} must remain NOLOGIN.`);
      }
    }

    const verifierPassword = randomBytes(48).toString("base64url");
    await admin.unsafe(
      `alter role ecb_human_verifier login password '${verifierPassword}'`,
    );
    const verifierUrl = verifierUrlFrom(installerUrl, verifierPassword);
    verifier = postgres(verifierUrl, {
      max: 1,
      prepare: false,
      connect_timeout: 10,
      ssl: { rejectUnauthorized: true },
      onnotice: () => {},
    });
    const [identity] = await verifier`
      select current_user as role,
        (select rolsuper or rolbypassrls or rolcreaterole or rolcreatedb
           from pg_roles where rolname=current_user) as elevated,
        pg_has_role(current_user,'ecb_governance_owner','MEMBER') as owner,
        pg_has_role(current_user,'service_role','MEMBER') as service
    `;
    if (
      identity.role !== "ecb_human_verifier" ||
      identity.elevated || identity.owner || identity.service
    ) throw new Error("Generated verifier connection did not qualify as the restricted role.");

    const hasHumanUrl = inventory.includes("HUMAN_DATABASE_URL");
    const envArgs = hasHumanUrl
      ? ["env", "update", "HUMAN_DATABASE_URL", "production"]
      : ["env", "add", "HUMAN_DATABASE_URL", "production", "--sensitive"];
    run("vercel", envArgs, {
      cwd: SERVICE_DIR,
      env: vercelEnv,
      input: verifierUrl + "\n",
      quietFailure: true,
    });
    inventory = run("vercel", ["env", "ls", "production"], {
      cwd: SERVICE_DIR,
      env: vercelEnv,
    });
    if (!inventory.includes("HUMAN_DATABASE_URL")) {
      throw new Error("Vercel did not retain HUMAN_DATABASE_URL in production.");
    }
    const postWriteForbidden = forbidden.filter((name) => inventory.includes(name));
    if (postWriteForbidden.length) {
      throw new Error(`Forbidden ecb-human production keys appeared: ${postWriteForbidden.join(", ")}`);
    }

    console.log("Restricted verifier qualified locally. Redeploying exact ecb-human project...");
    const deployOutput = run("vercel", ["deploy", "--prod", "--yes"], {
      cwd: SERVICE_DIR,
      env: vercelEnv,
    });
    const deploymentUrl = deployOutput.match(/https:\/\/[A-Za-z0-9.-]+\.vercel\.app/)?.[0];
    await waitForHealth();
    const root = await fetch(ORIGIN, { cache: "no-store", redirect: "error" });
    if (root.status !== 200 || !(root.headers.get("content-type") || "").includes("text/html")) {
      throw new Error(`Human entrance returned HTTP ${root.status} instead of verifier-gated HTML.`);
    }
    console.log(
      `Hosted verifier is healthy${deploymentUrl ? ` at ${deploymentUrl}` : ""}; canonical governance remains inactive.`,
    );

    await mkdir(SETUP_DIR, { recursive: true, mode: 0o700 });
    await chmod(SETUP_DIR, 0o700);
    const remitFile = join(REPO, "docs/build-shape/008-build-6-accepted-remit.txt");
    const basisFile = join(REPO, "docs/build-shape/008-build-6-move-release.md");
    const remit = await readFile(remitFile);
    const basis = await readFile(basisFile);
    const config = {
      project_ref: PROJECT_REF,
      origin: ORIGIN,
      rp_id: RP_ID,
      credential_count: 1,
      remit_file: remitFile,
      remit_sha256: digest(remit),
      root_basis_file: basisFile,
      root_basis_sha256: digest(basis),
      source_reference:
        "BUILD 6 accepted H/remit/P0 and staged Move release; exact repository sources retained",
    };
    const configPath = join(SETUP_DIR, `live-bind-config-${Date.now()}.json`);
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n", {
      mode: 0o600,
      flag: "wx",
    });

    console.log(
      "\nPRIVATE CUSTODY ACTION 2/3\n" +
      "The existing installer will now show the exact accepted H/remit/P0 and retained root basis, then ask whether to open the 30-minute setup window.\n" +
      "Why you: OPEN causes creation of the short-lived private setup capability under installation custody.\n" +
      "Expected prompt: “Open a 30-minute setup window for this exact package? Type OPEN:”.\n" +
      "Acceptable action: type exactly OPEN if the displayed package matches; anything else exits without commissioning.\n" +
      "Hazard: the generated capability is secret. The installer saves it only under ~/.ecb-human-setup/ and never prints it.\n",
    );
    const commissionedAt = Date.now();
    const installer = spawnSync(
      process.execPath,
      [join(SERVICE_DIR, "installer.mjs"), configPath],
      {
        cwd: REPO,
        env: { ...process.env, INSTALLER_DATABASE_URL: installerUrl.toString() },
        stdio: "inherit",
      },
    );
    if (installer.error || installer.status !== 0) {
      throw new Error("Installer did not complete a committed setup commission.");
    }
    recovery = await newestRecovery(commissionedAt);
    const { scope, capability } = recovery.record;

    copySecretToClipboard(capability);
    const opened = openBrowser(scope);
    console.log(
      "\nPRIVATE CUSTODY ACTION 3/3\n" +
      `${opened ? "The protected human entrance has been opened in your browser." : `Open ${ORIGIN}/?scope=${scope} yourself.`}\n` +
      "The nonsecret scope should already be filled in. The setup capability is on your macOS clipboard.\n" +
      "1. Expand “First-time protected setup”.\n" +
      "2. Paste once into “Setup capability”. Do not paste it anywhere else.\n" +
      "3. Click “Inspect setup”; confirm the exact scope/H/remit/P0 shown are the accepted ones.\n" +
      "4. Click “Add a passkey”. macOS/iCloud Keychain should present the native passkey authorization; authorize the credential you intend to bind. Touch ID is normal; QR/security-key choices are acceptable only if intentionally selecting that credential ecosystem.\n" +
      "5. Click “Review credential binding”; verify the displayed credential set contains the credential you just enrolled.\n" +
      "6. Click “Bind this credential set and scope”.\n" +
      "Why you: WebAuthn user verification and the final protected binding are the actual human-custody boundary.\n" +
      "Expected final browser message: exact credentials and scope bound; activation pending.\n" +
      "Hazard: do NOT click any policy Accept control afterward. M2 is not part of this Move.\n\n" +
      "This terminal will verify the canonical M1 invariants automatically; leave it running.",
    );

    let final;
    for (let i = 0; i < 450; i++) {
      final = await m1State(admin, scope);
      if (!final) throw new Error("Commissioned scope disappeared.");
      if (final.current_transition !== null || final.transitions !== 0) {
        throw new Error("A transition appeared; M2 boundary was crossed unexpectedly.");
      }
      if (
        final.binding !== null &&
        final.genesis_decisions === 1 &&
        final.decisions === 1 &&
        final.credentials === 1 &&
        final.transitions === 0
      ) break;
      await sleep(2000);
    }
    if (
      !final ||
      final.binding === null ||
      final.current_transition !== null ||
      final.genesis_decisions !== 1 ||
      final.decisions !== 1 ||
      final.credentials !== 1 ||
      final.transitions !== 0
    ) throw new Error("Timed out before the exact M1 bound-but-not-activated state was observed.");

    let setupRejected = false;
    try {
      await verifier.unsafe(
        "select ecb_governance.human($1,$2::jsonb)",
        ["setup_view", JSON.stringify({ scope, setup_secret: capability })],
      );
    } catch (error) {
      setupRejected = /setup_unavailable/.test(error.message);
    }
    if (!setupRejected) throw new Error("Completed binding did not invalidate the setup capability.");

    await health(200);
    inventory = run("vercel", ["env", "ls", "production"], {
      cwd: SERVICE_DIR,
      env: vercelEnv,
    });
    const finalForbidden = forbidden.filter((name) => inventory.includes(name));
    if (finalForbidden.length) {
      throw new Error(`Forbidden ecb-human production keys remain: ${finalForbidden.join(", ")}`);
    }
    if (!inventory.includes("HUMAN_DATABASE_URL")) {
      throw new Error("Restricted HUMAN_DATABASE_URL is missing after binding.");
    }

    clearClipboardIfStill(capability);
    console.log(
      "\nLIVE_BINDING=PASS\n" +
      `SCOPE=${scope}\n` +
      `GENESIS_DECISION=${final.genesis_decision}\n` +
      "BINDING=NON_NULL\n" +
      "CURRENT_TRANSITION=NULL\n" +
      "TRANSITIONS=0\n" +
      "RECOVERY_MATERIAL=PRIVATE_0600\n" +
      "HEALTH=PASS\n" +
      "M2=NOT_STARTED\n",
    );
  } finally {
    if (recovery?.record?.capability) clearClipboardIfStill(recovery.record.capability);
    if (verifier) await verifier.end({ timeout: 2 }).catch(() => {});
    await admin.end({ timeout: 2 }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(`LIVE_BINDING=BLOCKED\n${error.message}`);
  process.exitCode = 1;
});
