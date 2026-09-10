// Human-operated local custody runner for the first BUILD 6 ordinary succession.
// Reads the retained restricted executor credential privately; never prints it.
import { constants } from "node:fs";
import { lstat, open, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { connectExecutor, execute as executorOperation } from "./executor.mjs";

export const expected = Object.freeze({
  project: "vezxivrvhakclxuvxzso",
  scope: "20ad3966-8647-4a0f-9eed-2888e67e1e49",
  predecessor: "63bcd3fd-55f4-49bd-976f-c2bba50e6ab1",
  policy_digest: "2057597b340e7f324176c65847633b776e0d266407988dedbaec001359c39556",
});
const uuid = (value) => typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const exactKeys = (value, keys) => {
  const actual = Object.keys(value).sort();
  const wanted = [...keys].sort();
  return actual.length === wanted.length && actual.every((key, i) => key === wanted[i]);
};
async function close(db) {
  if (!db?.end) return;
  try { await db.end({ timeout: 2 }); } catch {}
}

export function validateRequest(request) {
  if (!request || typeof request !== "object" || Array.isArray(request) ||
      !exactKeys(request, ["scope", "decision", "request_id", "policy_digest", "predecessor"]) ||
      request.scope !== expected.scope || request.predecessor !== expected.predecessor ||
      request.policy_digest !== expected.policy_digest || !uuid(request.decision) || !uuid(request.request_id)) {
    throw new Error("Unexpected first-P1 execution request");
  }
  return Object.freeze({ ...request });
}

export async function executorUriFromCustody(directory) {
  const path = resolve(directory);
  const dir = await lstat(path);
  if (!dir.isDirectory() || dir.uid !== process.getuid() || (dir.mode & 0o077) !== 0) {
    throw new Error("Unsafe private executor directory");
  }
  let file;
  try {
    file = await open(join(path, "verifier-runtime.json"), constants.O_RDONLY | constants.O_NOFOLLOW);
    const info = await file.stat();
    if (!info.isFile() || info.uid !== process.getuid() || (info.mode & 0o777) !== 0o600) {
      throw new Error("Unsafe private executor record");
    }
    const record = JSON.parse(await file.readFile("utf8"));
    const target = typeof record.target === "string" &&
      record.target.match(new RegExp(`^executor:${expected.project}:([a-z0-9-]+\\.pooler\\.supabase\\.com)$`));
    if (record.version !== 1 || record.state !== "applied" || !target ||
        typeof record.password !== "string" || !/^[A-Za-z0-9_-]{64}$/.test(record.password)) {
      throw new Error("Private executor record does not match this succession");
    }
    const uri = new URL(`postgresql://placeholder@${target[1]}:6543/postgres`);
    uri.username = `ecb_governance_executor.${expected.project}`;
    uri.password = record.password;
    return uri.toString();
  } finally {
    await file?.close();
  }
}

function verifyCommitted(result, view, request) {
  const t = result?.transition;
  if (result?.outcome !== "committed" || !t ||
      t.scope !== request.scope || t.decision !== request.decision ||
      t.request_id !== request.request_id || t.predecessor !== request.predecessor ||
      t.executor !== "ecb_governance_executor" ||
      JSON.stringify(t.obligations) !== JSON.stringify([
        "install_exact_successor",
        "preserve_h_remit_history_and_exhaustion",
      ])) {
    throw new Error("Committed succession does not match exact request");
  }
  if (view?.scope?.current_transition !== t.id) {
    throw new Error("Committed succession is not current");
  }
  const subject = view.subjects?.find((s) => s.id === t.policy);
  const decision = view.decisions?.find((d) => d.id === request.decision);
  if (!subject || subject.kind !== "policy" || subject.digest !== request.policy_digest ||
      !decision || decision.operation !== "succession" || decision.policy !== t.policy ||
      decision.predecessor !== request.predecessor || decision.h !== t.h ||
      decision.basis !== request.predecessor) {
    throw new Error("Committed succession basis does not match P1");
  }
  return t;
}

export async function runSuccession({ directory, request, connect, perform } = {}) {
  request = validateRequest(request);
  const uri = await executorUriFromCustody(directory);
  connect ??= (value) => connectExecutor({ EXECUTOR_DATABASE_URL: value });
  perform ??= executorOperation;
  let first, committed;
  try {
    first = await connect(uri);
    const recovery = await perform(first, "recover", request);
    if (recovery?.outcome === "committed") {
      committed = recovery;
    } else if (recovery?.outcome === "not_committed" && recovery.scope_locked === true &&
               recovery.current_transition === request.predecessor) {
      committed = await perform(first, "execute", request);
    } else {
      throw new Error("Recovery did not establish safe execution eligibility");
    }
    verifyCommitted(committed, await perform(first, "inspect", request), request);
  } finally {
    await close(first);
  }

  let cold;
  try {
    cold = await connect(uri);
    const recovered = await perform(cold, "recover", request);
    const transition = verifyCommitted(recovered, await perform(cold, "inspect", request), request);
    return Object.freeze({
      P1: "PASS",
      scope: request.scope,
      decision: request.decision,
      transition: transition.id,
      request_id: request.request_id,
      predecessor: request.predecessor,
      policy_digest: request.policy_digest,
      BUILD_6: "OPEN",
      cold_recovery: "PASS",
    });
  } finally {
    await close(cold);
  }
}

export const failureText = () =>
  "P1=UNCONFIRMED. Preserve the exact public request and private executor custody. Reconcile canonical state before another effect; rerunning begins with recovery.";

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY || Number(process.versions.node.split(".")[0]) !== 24) {
    throw new Error("Node 24 and human terminal required");
  }
  const [directoryArg, requestFile] = process.argv.slice(2);
  if (!directoryArg || !requestFile) {
    throw new Error("Usage: node succession-custody.mjs PRIVATE_CUSTODY_DIR EXACT_PUBLIC_REQUEST.json");
  }
  const request = JSON.parse(await readFile(resolve(requestFile), "utf8"));
  console.log("BUILD 6 P1 — restricted ordinary succession\nRecovery is checked before any effect. No installer or human credential is requested.");
  console.log(JSON.stringify(await runSuccession({ directory: resolve(directoryArg), request }), null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    console.error(failureText());
    process.exitCode = 1;
  });
}
