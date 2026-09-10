// A fresh process receives only the retained read boundary, scope and exact observation handle.
import postgres from "postgres";
import { readFileSync, writeFileSync } from "node:fs";
import { recover } from "../../server/build-7/recover.mjs";
const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
const u = new URL(input.database);
if (
  u.hostname !== "127.0.0.1" || u.port !== "55440" || u.pathname !== "/build7"
) throw Error("disposable_boundary");
const db = postgres(input.database, { max: 1, prepare: false });
try {
  writeFileSync(
    process.argv[3],
    JSON.stringify(await recover(db, input.scope, input.observation), null, 2) +
      "\n",
  );
} finally {
  await db.end();
}
