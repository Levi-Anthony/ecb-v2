import { close, make, run, save } from "./support.mjs";
try {
  const f = await make();
  const result = await run(f);
  console.log(JSON.stringify(result, null, 2));
  save("smoke-02.json", { f, result });
} finally {
  await close();
}
