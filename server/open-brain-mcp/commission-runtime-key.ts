import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function randomKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function ensureKey(): Promise<{ key: string; path: string | null }> {
  const existing = Deno.env.get("ECB_ORDINARY_DB_KEY")?.trim();
  if (existing) return { key: existing, path: null };

  const home = requiredEnv("HOME");
  const directory = `${home}/.ecb-v2-runtime`;
  const path = `${directory}/ordinary-db-key`;
  await Deno.mkdir(directory, { recursive: true, mode: 0o700 });

  try {
    const stored = (await Deno.readTextFile(path)).trim();
    if (stored.length >= 32) return { key: stored, path };
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }

  const key = randomKey();
  await Deno.writeTextFile(path, `${key}\n`, { mode: 0o600 });
  await Deno.chmod(path, 0o600);
  return { key, path };
}

const { key, path } = await ensureKey();
const admin = createClient(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { error } = await admin.rpc("ecb11_commission_runtime_key", { p_key: key });
if (error) {
  throw new Error(`Runtime-key commissioning failed: ${error.message}`);
}

console.log("BUILD 11 ordinary database capability commissioned.");
if (path) {
  console.log(`Runtime key retained at ${path}.`);
}
console.log(
  "Install the same key as the Edge Function secret ECB_ORDINARY_DB_KEY before deploying the BUILD 11 MCP runtime. The key value was not printed.",
);
