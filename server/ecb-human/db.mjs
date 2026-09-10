import postgres from "postgres";
import { readFileSync } from "node:fs";

// Explicit, database-only trust also works in Vercel without a local CA path.
const databaseCA = readFileSync(new URL("./certs/supabase-root-2021.crt", import.meta.url), "utf8");
export async function connectVerifier(env = process.env) {
  const forbidden = Object.keys(env).filter((k) =>
    /SERVICE_ROLE|JWT_SECRET|JWT_SIGN|POSTGRES_URL|POSTGRES_PRISMA_URL|DATABASE_OWNER|SUPABASE_SECRET|SETUP_SECRET|EXECUTOR_DATABASE_URL|INSTALLER_DATABASE_URL|VERCEL_TOKEN|ECB_BRAIN_KEY/
      .test(k)
  );
  if (forbidden.length) {
    throw new Error(
      "human runtime contains forbidden credential configuration",
    );
  }
  if (!env.HUMAN_DATABASE_URL) {
    throw new Error("restricted human database connection required");
  }
  const sql = postgres(env.HUMAN_DATABASE_URL, {
    max: 3,
    prepare: false,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: true, ca: databaseCA },
    onnotice: () => {},
  });
  const [r] =
    await sql`select current_user as role, (select rolsuper or rolbypassrls or rolcreaterole from pg_roles where rolname=current_user) as elevated, pg_has_role(current_user,'ecb_governance_owner','MEMBER') as owner, pg_has_role(current_user,'service_role','MEMBER') as service`;
  if (r.role !== "ecb_human_verifier" || r.elevated || r.owner || r.service) {
    await sql.end();
    throw new Error("unqualified verifier role");
  }
  return sql;
}
