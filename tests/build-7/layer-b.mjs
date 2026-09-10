// Explicit current-state adapter under Shape §M.7. Historical harness remains unchanged.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { admin, close, save } from "./support.mjs";
const dir = mkdtempSync(join(tmpdir(), "ecb7-regression-"));
try {
  const source = readFileSync(
    new URL("../build-5b/layer-b-standing.ts", import.meta.url),
    "utf8",
  );
  const [counts] =
    await admin`select (select count(*)::text from public.claims) claims,(select count(*)::text from public.referents) referents`;
  const adapted = source.replaceAll("55438", "55440").replace(
    'counts.claims === "3"',
    `counts.claims === "${counts.claims}"`,
  ).replace(
    'counts.referents === "16"',
    `counts.referents === "${counts.referents}"`,
  );
  const path = join(dir, "layer-b.ts");
  writeFileSync(path, adapted);
  const run = spawnSync("deno", [
    "run",
    "--config",
    new URL("../build-5b/deno.json", import.meta.url).pathname,
    "--allow-env",
    "--allow-net=127.0.0.1:55440",
    path,
  ], {
    encoding: "utf8",
    env: {
      ...process.env,
      POSTGRES_URL: "postgres://postgres@127.0.0.1:55440/build7",
    },
  });
  const result = {
    source: "tests/build-5b/layer-b-standing.ts",
    source_sha256: createHash("sha256").update(source).digest("hex"),
    adaptations: { loopback_port: "55438 → 55440", pre_probe_counts: counts },
    exit_code: run.status,
    stdout: run.stdout,
    stderr: run.stderr,
  };
  save("layer-b-regression.json", result);
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  if (run.status !== 0) process.exitCode = 1;
} finally {
  await close();
  rmSync(dir, { recursive: true, force: true });
}
