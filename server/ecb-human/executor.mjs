// Bounded executor client. A database credential conveys technical access, never H approval.
import postgres from "postgres";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
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
  const db = postgres(process.env.EXECUTOR_DATABASE_URL, {
    ssl: { rejectUnauthorized: true },
    prepare: false,
    max: 1,
  });
  try {
    const [role] =
      await db`select current_user as name,pg_has_role(current_user,'ecb_governance_owner','MEMBER') as owner,pg_has_role(current_user,'ecb_human_verifier','MEMBER') as verifier`;
    if (
      role.name !== "ecb_governance_executor" || role.owner || role.verifier
    ) throw new Error("unqualified executor connection");
    console.log(
      JSON.stringify(
        await execute(db, action, JSON.parse(await readFile(file, "utf8"))),
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
    await db.end();
  }
}
