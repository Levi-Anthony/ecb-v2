// Qualification helpers adapted from preserved local candidate 60f510c; no migration adoption.
import postgres from "postgres";
export type Sql = ReturnType<typeof postgres>;
export type Data = Record<string, unknown>;
export const ROOT = new URL("../../", import.meta.url);
export const MIGRATION =
  "sql/migrations/20260906014257_build_5b_versioned_artifacts.sql";
export const SHAPE = "07fcb9f29c75365c07d36226043d3b17cbc769fd";
export const EVIDENCE = Deno.env.get("B5B_EVIDENCE_DIR") ??
  "/tmp/ecb5b-qualification-evidence";
export const LOCAL = "postgres://postgres@127.0.0.1:55438/rehearsal";
export const BASE_TABLES = [
  "thoughts",
  "referents",
  "claims",
  "evidence_links",
  "claim_standing_transitions",
];
export const F = {
  TR1: "a6925494-a862-441b-a361-5f5ec41dc9dc",
  C: "0f89e778-b16e-4840-9129-a2aa3eb6f697",
  L: "4c6c0f50-a936-4da6-bb09-233f93320639",
  GT01: "19a949ea-a8fc-4250-a386-fa64e5530180",
  A1: "8777e33d-7555-40aa-92f9-d5107395c0c7",
  OP1: "ba27d938-c586-4c09-ac31-9c67a2d0b5e0",
  A2: "95b5db1d-cb79-439b-ae93-0bdaef5cfda2",
  CHECK1: "661fc2b6-63f8-4cfc-8d29-697213ac2286",
  RC1: "6d0b744b-9707-46cb-b771-9085501e93ee",
  OP2: "f64d508d-df25-47c8-8d6d-e26a6dc9a906",
  BAD: "9c322dda-54b8-4838-bdf1-2df471f0f992",
  CHECK2: "407027f9-05cf-4bc3-85dc-012d2e0aa3fe",
  RC2: "1217d889-e874-4875-9c8a-d78c86156583",
};
export function assert(x: unknown, m: string): asserts x {
  if (!x) throw new Error(m);
}
export function canonical(x: unknown): string {
  return JSON.stringify(
    x,
    (_, v) =>
      v && typeof v === "object" && !Array.isArray(v)
        ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => a.localeCompare(b)),
        )
        : v,
  );
}
export function equal(x: unknown, y: unknown, m: string) {
  assert(canonical(x) === canonical(y), m);
}
export async function hash(x: string | Uint8Array) {
  const bytes = typeof x === "string" ? new TextEncoder().encode(x) : x;
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)),
    ),
  ].map(
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
export function connect(url = LOCAL) {
  return postgres(url, {
    max: 1,
    prepare: false,
    connect_timeout: 15,
    connection: { search_path: "public,extensions" },
    onnotice: () => {},
  });
}
export async function save(name: string, x: unknown) {
  await Deno.mkdir(EVIDENCE, { recursive: true });
  await Deno.writeTextFile(
    `${EVIDENCE}/${name}.json`,
    JSON.stringify(x, null, 2),
  );
}
export async function read(name: string) {
  return JSON.parse(await Deno.readTextFile(`${EVIDENCE}/${name}.json`));
}
export async function sourceFixtures() {
  const text = await Deno.readTextFile(
    new URL("docs/acceptance/build-5b-wt07.md", ROOT),
  );
  const literals = [...text.matchAll(/```json\n([^`]+)\n```/g)].map((m) =>
    m[1]
  );
  assert(literals.length === 2, "two frozen fixture literals");
  const [a1, a2] = literals;
  const bad = a2.replace(/,"observed_digest":"[0-9a-f]{64}"/, "");
  assert(a2 !== bad, "bad fixture must differ");
  return { a1, a2, bad };
}
export async function asRole<T>(db: Sql, f: () => Promise<T>) {
  await db.unsafe("set role service_role");
  try {
    return await f();
  } finally {
    await db.unsafe("reset role").catch(() => {});
  }
}
export async function atomic<T>(
  db: Sql,
  f: () => Promise<T>,
  rollback = false,
) {
  await db.unsafe("begin");
  try {
    const v = await f();
    await db.unsafe(rollback ? "rollback" : "commit");
    return v;
  } catch (e) {
    await db.unsafe("rollback").catch(() => {});
    throw e;
  }
}
export async function insert(
  db: Sql,
  role: string,
  context: string,
  payload: string | null = null,
  target: string | null = null,
  id: string = crypto.randomUUID(),
  producer: boolean | null = null,
) {
  await db`insert into public.artifacts(id,artifact_role,context_id,target_id,payload_text,producer_succeeded) values (${id},${role},${context},${target},${payload},${producer})`;
  return id;
}
export async function artifact(db: Sql, id: string) {
  const [r] =
    await db`select id::text,artifact_role,context_id::text,target_id::text,payload_text,encode(payload_digest,'hex') as payload_digest,producer_succeeded,recorded_at::text,created_xid::text from public.artifacts where id=${id}::uuid`;
  assert(r, `missing Artifact ${id}`);
  return r;
}
export async function receipt(
  db: Sql,
  attempt: string,
  id: string = crypto.randomUUID(),
) {
  await insert(db, "transformation_receipt", attempt, null, null, id);
  const r = await artifact(db, id);
  return { row: r, payload: JSON.parse(r.payload_text) };
}
export async function reject(
  db: Sql,
  f: () => Promise<unknown>,
  code?: string,
) {
  const before = await counts(db);
  await db.unsafe("begin");
  let rejected = false;
  try {
    await f();
  } catch (e) {
    const c = (e as { code?: string }).code;
    assert(c, `non-database error: ${String(e)}`);
    if (code) equal(c, code, "expected SQLSTATE");
    rejected = true;
  } finally {
    await db.unsafe("rollback");
  }
  assert(rejected, "statement unexpectedly succeeded");
  equal(await counts(db), before, "rejected transaction residue");
}
export async function counts(db: Sql) {
  return (await db`select (select count(*) from public.thoughts)::int thoughts,(select count(*) from public.referents)::int referents,(select count(*) from public.claims)::int claims,(select count(*) from public.evidence_links)::int links,(select count(*) from public.claim_standing_transitions)::int transitions,(select count(*) from public.artifacts)::int artifacts`)[
    0
  ];
}
export async function baseline(db: Sql) {
  const data: Data = {};
  for (const t of BASE_TABLES) {
    data[t] = (await db.unsafe(
      `select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]') as rows from public.${t} t`,
    ))[0].rows;
  }
  return data;
}
export async function catalog(db: Sql) {
  return (await db`select jsonb_build_object(
 'tables',(select jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity,'owner',pg_get_userbyid(c.relowner)) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
 'columns',(select jsonb_agg(jsonb_build_object('table',table_name,'column',column_name,'type',udt_name,'null',is_nullable,'default',column_default) order by table_name,ordinal_position) from information_schema.columns where table_schema='public'),
 'constraints',(select jsonb_agg(jsonb_build_object('table',c.relname,'name',con.conname,'def',pg_get_constraintdef(con.oid)) order by c.relname,con.conname) from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public'),
 'functions',(select jsonb_agg(jsonb_build_object('name',p.proname,'def',pg_get_functiondef(p.oid),'owner',pg_get_userbyid(p.proowner),'acl',p.proacl::text) order by p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'),
 'triggers',(select jsonb_agg(jsonb_build_object('table',c.relname,'name',t.tgname,'def',pg_get_triggerdef(t.oid)) order by c.relname,t.tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal),
 'indexes',(select jsonb_agg(jsonb_build_object('table',tablename,'name',indexname,'def',indexdef) order by tablename,indexname) from pg_indexes where schemaname='public'),
 'policies',(select coalesce(jsonb_agg(to_jsonb(p) order by tablename,policyname),'[]') from pg_policies p where schemaname='public'),
 'grants',(select jsonb_agg(jsonb_build_object('table',table_name,'column',column_name,'role',grantee,'privilege',privilege_type) order by table_name,column_name,grantee,privilege_type) from information_schema.column_privileges where table_schema='public' and grantee in ('PUBLIC','anon','authenticated','service_role')),
 'table_grants',(select jsonb_agg(jsonb_build_object('table',table_name,'role',grantee,'privilege',privilege_type) order by table_name,grantee,privilege_type) from information_schema.table_privileges where table_schema='public' and grantee in ('PUBLIC','anon','authenticated','service_role')),
 'schema_grants',(select jsonb_agg(jsonb_build_object('role',r.rolname,'schema',n.nspname,'usage',has_schema_privilege(r.oid,n.oid,'usage'),'create',has_schema_privilege(r.oid,n.oid,'create')) order by r.rolname,n.nspname) from pg_roles r cross join pg_namespace n where r.rolname in ('postgres','service_role','anon','authenticated') and n.nspname in ('public','extensions'))
 ) as value`)[0].value;
}
