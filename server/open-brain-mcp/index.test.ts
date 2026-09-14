import { assert, assertEquals } from "jsr:@std/assert@1.0.14";

import {
  BrainOperationError,
  type BrainRuntime,
  createBrainRuntime,
  createMcpApp,
  type OrdinaryStore,
  type Thought,
} from "./index.ts";

const operationId = "33333333-3333-4333-8333-333333333333";
const thought: Thought = {
  id: "11111111-1111-4111-8111-111111111111",
  content: "GT01: The brass heron waits beneath the violet staircase.",
  source: "golden_trace_01",
  captured_at: "2026-09-03T00:00:00.000Z",
};

const runtime: BrainRuntime = {
  async capture(input) {
    return {
      operation_id: input.operationId,
      replayed: false,
      thought,
      representation: { model_id: "gte-small", ready: true },
    };
  },
  async search() {
    return {
      results: [{
        ...thought,
        lexical_rank: 1,
        lexical_score: 1,
        semantic_rank: 1,
        semantic_similarity: 1,
        score: 0.03278688524590164,
      }],
      coverage: {
        total_thoughts: 1,
        represented_thoughts: 1,
        missing_representations: 0,
        semantic_query_available: true,
        semantic_index_complete: true,
        lexical_available: true,
        degraded: false,
      },
      repair: { attempted: 0, repaired: 0 },
    };
  },
  async fetch(id) {
    return id === thought.id
      ? { ...thought, representation_ready: true }
      : null;
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
    clientInfo: { name: "ecb-v2-test", version: "0.2.0" },
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

function vector(value = 0): number[] {
  return Array.from({ length: 384 }, () => value);
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

Deno.test("keeps the three-tool surface and makes capture structurally idempotent", async () => {
  const response = await request({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
  const body = await responseJson(response);
  const tools = body.result.tools;
  const names = tools.map((tool: { name: string }) => tool.name).sort();
  assertEquals(names, ["capture_thought", "fetch", "search"]);

  const capture = tools.find((tool: { name: string }) =>
    tool.name === "capture_thought"
  );
  assertEquals(capture.annotations.idempotentHint, true);
  assert(capture.inputSchema.required.includes("operation_id"));
});

Deno.test("returns operation identity and durable Thought identity through MCP", async () => {
  const response = await request({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "capture_thought",
      arguments: {
        operation_id: operationId,
        content: thought.content,
        source: thought.source,
      },
    },
  });
  const body = await responseJson(response);
  const captured = JSON.parse(body.result.content[0].text);
  assertEquals(captured.operation_id, operationId);
  assertEquals(captured.thought.id, thought.id);
  assertEquals(captured.representation.ready, true);
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

Deno.test("preserves a safe operation-conflict failure code", async () => {
  const conflictRuntime: BrainRuntime = {
    ...runtime,
    async capture() {
      throw new BrainOperationError("operation_conflict");
    },
  };
  const conflictApp = createMcpApp({
    accessKey: "test-key",
    runtime: conflictRuntime,
  });
  const response = await conflictApp.request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: "Bearer test-key",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "capture_thought",
        arguments: {
          operation_id: operationId,
          content: thought.content,
          source: thought.source,
        },
      },
    }),
  });
  const body = await responseJson(response);
  assertEquals(JSON.parse(body.result.content[0].text), {
    error: "operation_conflict",
  });
  assertEquals(body.result.isError, true);
});

Deno.test("embedding failure after admission does not erase preserved Thought success", async () => {
  let storeEmbeddingCalls = 0;
  const store: OrdinaryStore = {
    async capture(input) {
      return { operationId: input.operationId, replayed: false, thought };
    },
    async fetch() {
      return { ...thought, representation_ready: false };
    },
    async listMissingEmbeddings() {
      return [];
    },
    async storeEmbedding() {
      storeEmbeddingCalls += 1;
      return "44444444-4444-4444-8444-444444444444";
    },
    async search() {
      throw new Error("unused");
    },
  };
  const brain = createBrainRuntime(store, async () => {
    throw new Error("provider unavailable");
  });

  const captured = await brain.capture({
    operationId,
    content: thought.content,
    source: thought.source,
  });

  assertEquals(captured.thought.id, thought.id);
  assertEquals(captured.representation, {
    model_id: "gte-small",
    ready: false,
    error: "embedding_failed",
  });
  assertEquals(storeEmbeddingCalls, 0);
});

Deno.test("replayed capture with ready representation does not regenerate embedding", async () => {
  let embedCalls = 0;
  const store: OrdinaryStore = {
    async capture(input) {
      return { operationId: input.operationId, replayed: true, thought };
    },
    async fetch() {
      return { ...thought, representation_ready: true };
    },
    async listMissingEmbeddings() {
      return [];
    },
    async storeEmbedding() {
      throw new Error("must not run");
    },
    async search() {
      throw new Error("unused");
    },
  };
  const brain = createBrainRuntime(store, async () => {
    embedCalls += 1;
    return vector();
  });

  const captured = await brain.capture({
    operationId,
    content: thought.content,
    source: thought.source,
  });

  assertEquals(captured.replayed, true);
  assertEquals(captured.representation.ready, true);
  assertEquals(embedCalls, 0);
});

Deno.test("search falls back to lexical retrieval and reports degraded semantic coverage", async () => {
  let receivedEmbedding: number[] | null | undefined;
  const store: OrdinaryStore = {
    async capture() {
      throw new Error("unused");
    },
    async fetch() {
      return null;
    },
    async listMissingEmbeddings() {
      return [];
    },
    async storeEmbedding() {
      throw new Error("unused");
    },
    async search(_query, _modelId, queryEmbedding) {
      receivedEmbedding = queryEmbedding;
      return {
        results: [{
          ...thought,
          lexical_rank: 1,
          lexical_score: 1,
          semantic_rank: null,
          semantic_similarity: null,
          score: 1 / 61,
        }],
        coverage: {
          total_thoughts: 1,
          represented_thoughts: 1,
          missing_representations: 0,
          semantic_query_available: false,
          semantic_index_complete: true,
          lexical_available: true,
          degraded: true,
        },
      };
    },
  };
  const brain = createBrainRuntime(store, async () => {
    throw new Error("provider unavailable");
  });

  const searched = await brain.search("violet staircase", 10);
  assertEquals(receivedEmbedding, null);
  assertEquals(searched.results[0].id, thought.id);
  assertEquals(searched.coverage.lexical_available, true);
  assertEquals(searched.coverage.semantic_query_available, false);
  assertEquals(searched.coverage.degraded, true);
});

Deno.test("search repairs missing representations before hybrid retrieval when provider is available", async () => {
  let stored = 0;
  let embedCalls = 0;
  const store: OrdinaryStore = {
    async capture() {
      throw new Error("unused");
    },
    async fetch() {
      return null;
    },
    async listMissingEmbeddings() {
      return [{ thoughtId: thought.id, content: thought.content }];
    },
    async storeEmbedding() {
      stored += 1;
      return "55555555-5555-4555-8555-555555555555";
    },
    async search(_query, _modelId, queryEmbedding) {
      assertEquals(queryEmbedding?.length, 384);
      return {
        results: [],
        coverage: {
          total_thoughts: 1,
          represented_thoughts: 1,
          missing_representations: 0,
          semantic_query_available: true,
          semantic_index_complete: true,
          lexical_available: true,
          degraded: false,
        },
      };
    },
  };
  const brain = createBrainRuntime(store, async () => {
    embedCalls += 1;
    return vector(embedCalls / 10);
  });

  const searched = await brain.search("violet staircase", 10);
  assertEquals(stored, 1);
  assertEquals(embedCalls, 2);
  assertEquals(searched.repair, { attempted: 1, repaired: 1 });
  assertEquals(searched.coverage.degraded, false);
});
