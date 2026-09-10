// Bounded executor client. A database credential conveys technical access, never H approval.
import postgres from "postgres";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const databaseCA = await readFile(new URL("./certs/supabase-root-2021.crt", import.meta.url), "utf8");

export async function connectExecutor(env = process.env) {
  if (!env.EXECUTOR_DATABASE_URL) throw new Error("restricted executor database connection required");
  if (Object.keys(env).some((key) =>
    /HUMAN_DATABASE_URL|INSTALLER_DATABASE_URL|DATABASE_OWNER|SERVICE_ROLE|SUPABASE_SECRET|JWT_SECRET|JWT_SIGN|SETUP_SECRET|POSTGRES_URL|POSTGRES_PRISMA_URL|VERCEL_TOKEN|ECB_BRAIN_KEY/.test(key)
  )) throw new Error("executor runtime contains forbidden credential configuration");
  const db = postgres(env.EXECUTOR_DATABASE_URL, {
    ssl: { rejectUnauthorized: true, ca: databaseCA },
    prepare: false,
    max: 1,
    connect_timeout: 10,
    onnotice: () => {},
  });
  try {
    const [role] = await db`select current_user as name, session_user as login,
      (select rolsuper or rolbypassrls or rolcreaterole or rolcreatedb from pg_roles where rolname=current_user) as elevated,
      pg_has_role(current_user,'ecb_governance_owner','MEMBER') as owner,
      pg_has_role(current_user,'ecb_human_verifier','MEMBER') as verifier,
      pg_has_role(current_user,'service_role','MEMBER') as service,
      has_function_privilege(current_user,'ecb_governance.executor(text,jsonb)','EXECUTE') as can_execute,
      has_function_privilege(current_user,'ecb_governance.human(text,jsonb)','EXECUTE') as can_issue_decisions`;
    if (role.name !== "ecb_governance_executor" || role.login !== role.name ||
        role.elevated || role.owner || role.verifier || role.service ||
        !role.can_execute || role.can_issue_decisions) throw new Error("unqualified executor connection");
    return db;
  } catch (error) {
    await db.end();
    throw error;
  }
}
export const operations = Object.freeze({
  inspect:
    "Read the exact scope, subjects, binding, decisions and transition history. Creates no authorization.",
  execute:
    "Consume one previously committed, unwithdrawn exact genesis/succession grant. Requires scope, decision, request_id, policy_digest and exact predecessor (null for genesis). Exact retry recovers the committed result; changed input conflicts. No human-decision issuance or enrollment capability.",
  recover:
    "With the same exact execution input, serialize on scope and report committed result or established absence. Network failure remains unknown; never infer failure from missing acknowledgement.",
});
export async function execute(db, action, request) {
  if (!Object.hasOwn(operations, action)) {
    throw new Error("unsupported executor operation");
  }
  const r = await db`select ecb_governance.executor(${action},${
    db.json(request)
  }) as result`;
  return r[0].result;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [action, file] = process.argv.slice(2);
  if (!Object.hasOwn(operations, action) || !file) {
    throw new Error(
      "Usage: node executor.mjs inspect|execute|recover exact-request.json",
    );
  }
  let db;
  try {
    const request = JSON.parse(await readFile(file, "utf8"));
    db = await connectExecutor();
    console.log(
      JSON.stringify(
        await execute(db, action, request),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        outcome: "unknown",
        message:
          "No success claimed. Recover using the exact request and inspect the retained state.",
      }),
    );
    process.exitCode = 1;
  } finally {
    await db?.end();
  }
}
