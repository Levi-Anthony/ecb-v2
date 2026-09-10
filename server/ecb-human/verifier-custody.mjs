import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, open, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

// Installer-side only. No installer URI/PAT is stored, and no secret is logged.
export async function verifierCredential(directory, target, applyPassword) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const dir = await lstat(directory);
  if (!dir.isDirectory() || dir.uid !== process.getuid()) throw new Error("Unsafe private verifier directory.");
  await chmod(directory, 0o700);
  const path = join(directory, "verifier-runtime.json");
  const lockPath = join(directory, "verifier-runtime.lock");
  let lock;
  try { lock = await open(lockPath, "wx", 0o600); }
  catch { throw new Error("Verifier custody is already locked; inspect the prior run before retrying."); }
  try {
    let record, file;
    try {
      file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      const info = await file.stat();
      if (!info.isFile() || info.uid !== process.getuid() || (info.mode & 0o777) !== 0o600) throw new Error("Unsafe private verifier record.");
      record = JSON.parse(await file.readFile("utf8"));
    } catch (e) {
      if (e.code !== "ENOENT") throw new Error("Private verifier record cannot be safely read; preserve it for reconciliation.");
    } finally { await file?.close(); }
    if (!record) {
      record = { version: 1, target, password: randomBytes(48).toString("base64url"), state: "prepared" };
      const created = await open(path, "wx", 0o600);
      try { await created.writeFile(JSON.stringify(record)); await created.sync(); }
      finally { await created.close(); }
    }
    if (record.version !== 1 || record.target !== target || !/^[A-Za-z0-9_-]{64}$/.test(record.password) || !["prepared", "applied"].includes(record.state)) {
      throw new Error("Private verifier record does not match this installation; preserve it for reconciliation.");
    }
    if (record.state === "prepared") {
      // If acknowledgement was lost, reapplying these same bytes cannot invent
      // another credential. Record applied state only after the ALTER succeeds.
      try { await applyPassword(record.password); }
      catch { throw new Error("Verifier credential application failed or its outcome is unknown; the same credential is retained privately for reconciliation."); }
      record.state = "applied";
      const tempPath = `${path}.${randomBytes(8).toString("hex")}.tmp`;
      const temp = await open(tempPath, "wx", 0o600);
      try { await temp.writeFile(JSON.stringify(record)); await temp.sync(); }
      finally { await temp.close(); }
      await rename(tempPath, path);
    }
    return record.password;
  } finally { await lock.close(); await unlink(lockPath); }
}

export async function qualifyVerifier(connect, pause, report) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const sql = connect();
    try {
      const [id] = await sql`select current_user role,(select rolsuper or rolbypassrls or rolcreaterole or rolcreatedb from pg_roles where rolname=current_user) elevated,pg_has_role(current_user,'ecb_governance_owner','MEMBER') owner,pg_has_role(current_user,'service_role','MEMBER') service`;
      if (id.role !== "ecb_human_verifier" || id.elevated || id.owner || id.service) throw new Error("Restricted verifier role failed local qualification.");
      return sql;
    } catch (e) {
      await sql.end({ timeout: 2 }).catch(() => {});
      const authFailure = e?.code === "28P01" || /password authentication failed|circuit breaker open/i.test(e?.message ?? "");
      if (!authFailure) throw e;
      if (attempt === 1) throw new Error("VERIFIER_AUTH=FAILED. Installer authenticated, but the restricted verifier login was rejected. Its credential is retained privately; do not rotate it or recreate the PAT. No setup was commissioned by this attempt.");
      for (let elapsed = 0; elapsed < 120; elapsed += 30) {
        report(`Verifier authentication rejected; retaining the same credential and waiting (${120 - elapsed}s remaining).`);
        await pause(30000);
      }
    }
  }
}
