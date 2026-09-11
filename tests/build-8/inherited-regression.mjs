import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
// Only disposal location, support import and output directory differ. The BUILD
// 5B behavioral wrapper itself retains all exact source/expectation comparisons.
for (const name of ["layer-b", "regression"]) {
  const text = readFileSync(`tests/build-7/${name}.mjs`, "utf8");
  const path = `tests/build-8/.${name}-generated.mjs`;
  const adapted = text.replace(
    'from "./support.mjs"',
    'from "./.inherited-support.mjs"',
  )
    .replaceAll("55440", "55441").replaceAll("/build7", "/build8");
  writeFileSync(path, adapted);
  try {
    const r = spawnSync(process.execPath, [path], { encoding: "utf8" });
    process.stdout.write(r.stdout);
    process.stderr.write(r.stderr);
    if (r.status !== 0) throw Error(`${name} inherited regression failed`);
  } finally {
    unlinkSync(path);
  }
}
