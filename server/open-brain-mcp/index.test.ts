import { assertEquals } from "jsr:@std/assert@1.0.14";

import {
  BrainOperationError,
  type BrainRuntime,
  createMcpApp,
} from "./index.ts";

const thought = {
  id: "11111111-1111-4111-8111-111111111111",
  content: "GT01: The brass heron waits beneath the violet staircase.",
  source: "golden_trace_01",
  captured_at: "2026-09-03T00:00:00.000Z",
  embedding_model: "gte-small",
};

const runtime: BrainRuntime = {
  async capture() {
    return thought;
  },
  async search() {
    return [{ ...thought, similarity: 1 }];
  },
  async fetch(id) {
    return id === thought.id ? thought : null;
  },
};

const app = createMcpApp({ accessKey: "test-key", runtime });

const initialize = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "ecb-v2-test", version: "0.1.0" },
  },
};

async function request(body: unknown, token = "test-key") {
  return await app.request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

async function responseJson(response: Response) {
  const text = await response.text();
  if (text.startsWith("{")) return JSON.parse(text);
  const dataLine = text.split("\n").find((line) => line.startsWith("data: "));
  return dataLine ? JSON.parse(dataLine.slice(6)) : null;
}

Deno.test("rejects an invalid bearer key", async () => {
  const response = await request(initialize, "wrong-key");
  assertEquals(response.status, 401);
  assertEquals(await response.json(), { error: "unauthorized" });
});

Deno.test("initializes statelessly", async () => {
  const response = await request(initialize);
  assertEquals(response.status, 200);
  assertEquals(response.headers.has("mcp-session-id"), false);
  const body = await responseJson(response);
  assertEquals(typeof body?.result?.protocolVersion, "string");
});

Deno.test("registers exactly the BUILD 0 tool surface", async () => {
  const response = await request({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
  const body = await responseJson(response);
  const names = body.result.tools.map((tool: { name: string }) => tool.name)
    .sort();
  assertEquals(names, ["capture_thought", "fetch", "search"]);
});

Deno.test("returns the durable capture identity through MCP", async () => {
  const response = await request({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "capture_thought",
      arguments: { content: thought.content, source: thought.source },
    },
  });
  const body = await responseJson(response);
  const captured = JSON.parse(body.result.content[0].text);
  assertEquals(captured.id, thought.id);
  assertEquals(captured.source, thought.source);
});

Deno.test("returns an explicit not-found result", async () => {
  const response = await request({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "fetch",
      arguments: { id: "22222222-2222-4222-8222-222222222222" },
    },
  });
  const body = await responseJson(response);
  assertEquals(JSON.parse(body.result.content[0].text), {
    error: "not_found",
  });
  assertEquals(body.result.isError, true);
});

Deno.test("preserves safe operation failure codes", async () => {
  const failingRuntime: BrainRuntime = {
    async capture() {
      throw new BrainOperationError("embedding_failed");
    },
    async search() {
      throw new BrainOperationError("search_failed");
    },
    async fetch() {
      throw new BrainOperationError("fetch_failed");
    },
  };
  const failingApp = createMcpApp({
    accessKey: "test-key",
    runtime: failingRuntime,
  });

  for (
    const [id, name, args, code] of [
      [
        5,
        "capture_thought",
        { content: "one", source: "test" },
        "embedding_failed",
      ],
      [6, "search", { query: "one" }, "search_failed"],
      [7, "fetch", { id: thought.id }, "fetch_failed"],
    ] as const
  ) {
    const response = await failingApp.request("http://localhost/", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        authorization: "Bearer test-key",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: { name, arguments: args },
      }),
    });
    const body = await responseJson(response);
    assertEquals(JSON.parse(body.result.content[0].text), { error: code });
    assertEquals(body.result.isError, true);
  }
});
