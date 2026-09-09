import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import { createApp } from "../../server/ecb-human/app.mjs";
import handler from "../../server/ecb-human/api/index.mjs";

test("entrance HTML is served from function-only assets at both human routes", async (t) => {
  const server = createServer(createApp(() => { throw new Error("unexpected database call"); }));
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const expected = await readFile(new URL("../../server/ecb-human/views/index.html", import.meta.url), "utf8");
  for (const path of ["/", "/intervene"]) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "text/html");
    assert.equal(await response.text(), expected);
  }
  await assert.rejects(access(new URL("../../server/ecb-human/public/index.html", import.meta.url)), { code: "ENOENT" });
});

test("deployed handler still gates entrance HTML on verifier qualification", async (t) => {
  const previous = process.env.HUMAN_DATABASE_URL;
  delete process.env.HUMAN_DATABASE_URL;
  t.after(() => {
    if (previous === undefined) delete process.env.HUMAN_DATABASE_URL;
    else process.env.HUMAN_DATABASE_URL = previous;
  });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "service_unavailable", outcome: "unknown" });
});
