import { readFileSync, writeFileSync } from "node:fs";
import postgres from "../build-7/node_modules/postgres/src/index.js";
import { recover } from "../../server/build-8/recover.mjs";
const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
if (input.boundary !== "ecb8-disposable-55441/build8") {
  throw Error("disposable_read_boundary");
}
const db = postgres("postgres://b8_observer@127.0.0.1:55441/build8", {
  max: 1,
  prepare: false,
});
try {
  writeFileSync(
    process.argv[3],
    JSON.stringify(await recover(db, input.scope, input.action), null, 2) +
      "\n",
  );
} finally {
  await db.end();
}
