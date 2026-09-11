// Location-only disposable wrapper. Never edit the accepted BUILD 7 fixtures,
// comparator, or their fixed-cardinality historical harnesses.
import { readFileSync, writeFileSync } from "node:fs";
const source = readFileSync(
  new URL("../build-7/support.mjs", import.meta.url),
  "utf8",
);
const target = new URL("./.inherited-support.mjs", import.meta.url);
writeFileSync(
  target,
  source.replace(
    'from "postgres"',
    'from "../build-7/node_modules/postgres/src/index.js"',
  )
    .replaceAll("55440/build7", "55441/build8").replaceAll(
      "evidence/build-7/",
      "evidence/build-8/inherited/",
    ),
);
export const b7 = await import(target.href);
