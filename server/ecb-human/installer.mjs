// Run directly by the human custodian in a terminal outside model/browser automation.
// This helper does not migrate, activate, or choose an initial policy/remit.
import postgres from "postgres";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { createInterface } from "node:readline/promises";
const digest = (b) => createHash("sha256").update(b).digest("hex");
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  throw new Error(
    "Human-operated terminal required; no captured tool execution.",
  );
}
const configFile = process.argv[2];
if (!configFile) {
  throw new Error("Usage: node installer.mjs exact-installation-package.json");
}
const config = JSON.parse(await readFile(configFile, "utf8"));
if (
  config.project_ref !== "vezxivrvhakclxuvxzso" ||
  config.origin !== "https://ecos.effortlessconnection.com" ||
  config.rp_id !== "ecos.effortlessconnection.com"
) {
  throw new Error(
    "Installation target does not match accepted project and origin",
  );
}
if (![1, 2].includes(config.credential_count)) {
  throw new Error("Choose one or two actual bootstrap credentials");
}
const p0 = await readFile(
  new URL(
    "../../docs/build-shape/008-build-6-p0-candidate.json",
    import.meta.url,
  ),
  "utf8",
);
const remit = await readFile(config.remit_file, "utf8");
const basis = await readFile(config.root_basis_file, "utf8");
if (
  digest(p0) !==
    "686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664" ||
  digest(remit) !== config.remit_sha256 ||
  digest(basis) !== config.root_basis_sha256
) throw new Error("Exact installation package changed");
console.log(
  "Initial H: Levi, under the existing accepted remit and P0.\nOrigin: " +
    config.origin + "\nExpected credentials: " + config.credential_count +
    "\nRemit:\n" + remit + "\nRetained external setup basis:\n" + basis,
);
const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const answer = await prompt.question(
  "Open a 30-minute setup window for this exact package? Type OPEN: ",
);
prompt.close();
if (answer !== "OPEN") process.exit(0);
const db = postgres(process.env.INSTALLER_DATABASE_URL, {
  ssl: { rejectUnauthorized: true },
  max: 1,
  prepare: false,
});
const capability = randomBytes(32).toString("base64url");
const dir = resolve(homedir(), ".ecb-human-setup");
await mkdir(dir, { recursive: true, mode: 0o700 });
const recovery = join(dir, `setup-${Date.now()}.json`);
// Retain the secret before contact. A lost acknowledgement must be reconciled by this hash,
// not followed by another blind commission. The secret never appears in stdout/chat/URLs.
await writeFile(
  recovery,
  JSON.stringify(
    {
      project: config.project_ref,
      capability,
      setup_hash: digest(capability),
      state: "commission_outcome_unknown",
    },
    null,
    2,
  ),
  { mode: 0o600, flag: "wx" },
);
try {
  const [{ scope }] =
    await db`select ecb_governance.commission(${p0},${remit},${basis},${config.source_reference},${
      digest(capability)
    },${config.credential_count}) as scope`;
  await writeFile(
    recovery,
    JSON.stringify(
      {
        project: config.project_ref,
        scope,
        capability,
        setup_hash: digest(capability),
        state: "commission_committed",
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(
    "Scope: " + scope + "\nCapability saved privately at " + recovery +
      "\nOpen " + config.origin +
      " yourself and enter the scope and capability in protected setup. The service will show the public key set before binding.",
  );
} catch {
  console.error(
    "Setup outcome is unknown. Retained private recovery record: " + recovery +
      ". Ask installation custody to reconcile its setup_hash before further effects.",
  );
  process.exitCode = 1;
} finally {
  await db.end();
}
