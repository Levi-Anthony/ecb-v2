import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { z } from "zod";

declare const Supabase: {
  ai: {
    Session: new (model: string) => {
      run(
        input: string,
        options: { mean_pool: boolean; normalize: boolean },
      ): Promise<Iterable<number>>;
    };
  };
};

const MODEL_ID = "gte-small";
const VECTOR_DIMENSIONS = 384;
const REPAIR_BATCH_LIMIT = 100;

export type Thought = {
  id: string;
  content: string;
  source: string;
  captured_at: string;
};

export type RepresentationStatus = {
  model_id: string;
  ready: boolean;
  error?:
    | "embedding_failed"
    | "representation_persistence_failed"
    | "representation_status_failed";
};

export type CaptureResult = {
  operation_id: string;
  replayed: boolean;
  thought: Thought;
  representation: RepresentationStatus;
};

export type ThoughtMatch = Thought & {
  lexical_rank: number | null;
  lexical_score: number | null;
  semantic_rank: number | null;
  semantic_similarity: number | null;
  score: number;
};

export type SearchCoverage = {
  total_thoughts: number;
  represented_thoughts: number;
  missing_representations: number;
  semantic_query_available: boolean;
  semantic_index_complete: boolean;
  lexical_available: boolean;
  degraded: boolean;
};

export type SearchRepair = {
  attempted: number;
  repaired: number;
  error?:
    | "embedding_failed"
    | "representation_persistence_failed"
    | "repair_scan_failed";
};

export type SearchResult = {
  results: ThoughtMatch[];
  coverage: SearchCoverage;
  repair: SearchRepair;
};

export type FetchedThought = Thought & {
  representation_ready: boolean;
};

type OperationFailureCode =
  | "operation_conflict"
  | "runtime_unauthorized"
  | "persistence_failed"
  | "capture_failed"
  | "search_failed"
  | "fetch_failed";

export class BrainOperationError extends Error {
  constructor(public readonly code: OperationFailureCode) {
    super(code);
    this.name = "BrainOperationError";
  }
}

export type BrainRuntime = {
  capture(input: {
    operationId: string;
    content: string;
    source: string;
    capturedAt?: string;
  }): Promise<CaptureResult>;
  search(query: string, limit: number): Promise<SearchResult>;
  fetch(id: string): Promise<FetchedThought | null>;
};

export type PersistedCapture = {
  operationId: string;
  replayed: boolean;
  thought: Thought;
};

export type MissingRepresentation = {
  thoughtId: string;
  content: string;
};

export type OrdinaryStore = {
  capture(input: {
    operationId: string;
    content: string;
    source: string;
    capturedAt?: string;
  }): Promise<PersistedCapture>;
  fetch(id: string, modelId: string): Promise<FetchedThought | null>;
  listMissingEmbeddings(
    modelId: string,
    limit: number,
  ): Promise<MissingRepresentation[]>;
  storeEmbedding(
    thoughtId: string,
    modelId: string,
    embedding: number[],
  ): Promise<string>;
  search(
    query: string,
    modelId: string,
    queryEmbedding: number[] | null,
    limit: number,
  ): Promise<Omit<SearchResult, "repair">>;
};

export type Embedder = (text: string) => Promise<number[]>;

type AppDependencies = {
  accessKey: string;
  runtime: BrainRuntime;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
};

function result(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
  };
}

function failure(code: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: code }) }],
    isError: true,
  };
}

function logFailure(code: string, error: unknown): void {
  console.error(code, error instanceof Error ? error.message : String(error));
}

function operationFailure(error: unknown, fallback: OperationFailureCode) {
  const code = error instanceof BrainOperationError ? error.code : fallback;
  logFailure(code, error);
  return failure(code);
}

function buildServer(runtime: BrainRuntime): McpServer {
  const server = new McpServer({ name: "ecb-v2-open-brain", version: "0.2.0" });

  server.registerTool(
    "capture_thought",
    {
      title: "Capture Thought",
      description:
        "Persist one atomic evidence thought under a stable operation UUID. Reuse the same operation_id to reconcile an uncertain retry; use a new operation_id for a distinct encounter, even when content repeats.",
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        operation_id: z.string().uuid(),
        content: z.string().trim().min(1),
        source: z.string().trim().min(1),
        captured_at: z.string().datetime({ offset: true }).optional(),
      },
    },
    async ({ operation_id, content, source, captured_at }) => {
      try {
        return result(
          await runtime.capture({
            operationId: operation_id,
            content,
            source,
            capturedAt: captured_at,
          }),
        );
      } catch (error) {
        return operationFailure(error, "capture_failed");
      }
    },
  );

  server.registerTool(
    "search",
    {
      title: "Search Thoughts",
      description:
        "Search canonical thought evidence through one hybrid retrieval surface. Lexical retrieval remains available when semantic embedding is unavailable; coverage reports whether semantic indexing is complete or degraded.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        query: z.string().trim().min(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
      },
    },
    async ({ query, limit }) => {
      try {
        return result(await runtime.search(query, limit));
      } catch (error) {
        return operationFailure(error, "search_failed");
      }
    },
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch Thought",
      description:
        "Fetch one canonical thought by durable UUID and report whether its current semantic representation is ready.",
      annotations: { readOnlyHint: true },
      inputSchema: { id: z.string().uuid() },
    },
    async ({ id }) => {
      try {
        const thought = await runtime.fetch(id);
        return thought ? result(thought) : failure("not_found");
      } catch (error) {
        return operationFailure(error, "fetch_failed");
      }
    },
  );

  return server;
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function keysMatch(provided: string, expected: string): Promise<boolean> {
  const [providedDigest, expectedDigest] = await Promise.all([
    digest(provided),
    digest(expected),
  ]);
  let difference = 0;
  for (let index = 0; index < expectedDigest.length; index += 1) {
    difference |= providedDigest[index] ^ expectedDigest[index];
  }
  return difference === 0;
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function createMcpApp({ accessKey, runtime }: AppDependencies): Hono {
  const app = new Hono();

  app.options("*", (context) => context.text("ok", 200, corsHeaders));

  app.all("*", async (context) => {
    const token = bearerToken(context.req.raw);
    if (!token || !(await keysMatch(token, accessKey))) {
      return context.json(
        { error: "unauthorized" },
        401,
        { ...corsHeaders, "WWW-Authenticate": 'Bearer realm="ecb-v2"' },
      );
    }

    if (!context.req.header("accept")?.includes("text/event-stream")) {
      const headers = new Headers(context.req.raw.headers);
      headers.set("Accept", "application/json, text/event-stream");
      const patched = new Request(context.req.raw.url, {
        method: context.req.raw.method,
        headers,
        body: context.req.raw.body,
      });
      Object.defineProperty(context.req, "raw", { value: patched });
    }

    const server = buildServer(runtime);
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    const response = await transport.handleRequest(context);
    if (!response) return context.json({ error: "transport_failed" }, 500);

    response.headers.delete("mcp-session-id");
    for (const [name, value] of Object.entries(corsHeaders)) {
      response.headers.set(name, value);
    }
    return response;
  });

  return app;
}

function validateEmbedding(vector: Iterable<number>): number[] {
  const normalized = Array.from(vector);
  if (
    normalized.length !== VECTOR_DIMENSIONS ||
    !normalized.every(Number.isFinite)
  ) {
    throw new Error("embedding_failed");
  }
  return normalized;
}

export function createBrainRuntime(
  store: OrdinaryStore,
  embed: Embedder,
): BrainRuntime {
  async function representationForCapture(
    thought: Thought,
  ): Promise<RepresentationStatus> {
    try {
      const fetched = await store.fetch(thought.id, MODEL_ID);
      if (fetched?.representation_ready) {
        return { model_id: MODEL_ID, ready: true };
      }
    } catch {
      return {
        model_id: MODEL_ID,
        ready: false,
        error: "representation_status_failed",
      };
    }

    let vector: number[];
    try {
      vector = validateEmbedding(await embed(thought.content));
    } catch {
      return {
        model_id: MODEL_ID,
        ready: false,
        error: "embedding_failed",
      };
    }

    try {
      await store.storeEmbedding(thought.id, MODEL_ID, vector);
      return { model_id: MODEL_ID, ready: true };
    } catch {
      return {
        model_id: MODEL_ID,
        ready: false,
        error: "representation_persistence_failed",
      };
    }
  }

  async function repairMissing(): Promise<SearchRepair> {
    let missing: MissingRepresentation[];
    try {
      missing = await store.listMissingEmbeddings(MODEL_ID, REPAIR_BATCH_LIMIT);
    } catch {
      return { attempted: 0, repaired: 0, error: "repair_scan_failed" };
    }

    let attempted = 0;
    let repaired = 0;
    for (const item of missing) {
      attempted += 1;
      let vector: number[];
      try {
        vector = validateEmbedding(await embed(item.content));
      } catch {
        return { attempted, repaired, error: "embedding_failed" };
      }

      try {
        await store.storeEmbedding(item.thoughtId, MODEL_ID, vector);
        repaired += 1;
      } catch {
        return {
          attempted,
          repaired,
          error: "representation_persistence_failed",
        };
      }
    }

    return { attempted, repaired };
  }

  return {
    async capture({ operationId, content, source, capturedAt }) {
      const persisted = await store.capture({
        operationId,
        content,
        source,
        capturedAt,
      });

      return {
        operation_id: persisted.operationId,
        replayed: persisted.replayed,
        thought: persisted.thought,
        representation: await representationForCapture(persisted.thought),
      };
    },

    async search(query, limit) {
      const repair = await repairMissing();

      let queryEmbedding: number[] | null = null;
      if (repair.error !== "embedding_failed") {
        try {
          queryEmbedding = validateEmbedding(await embed(query));
        } catch {
          queryEmbedding = null;
        }
      }

      const searched = await store.search(
        query,
        MODEL_ID,
        queryEmbedding,
        limit,
      );

      return { ...searched, repair };
    },

    async fetch(id) {
      return await store.fetch(id, MODEL_ID);
    },
  };
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function rpcFailure(error: unknown, fallback: OperationFailureCode): never {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);

  if (message.includes("ecb11_operation_conflict")) {
    throw new BrainOperationError("operation_conflict");
  }
  if (
    message.includes("ecb11_runtime_unauthorized") ||
    message.includes("ecb11_runtime_uncommissioned")
  ) {
    throw new BrainOperationError("runtime_unauthorized");
  }
  throw new BrainOperationError(fallback);
}

function createStore(): OrdinaryStore {
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          "x-ecb-runtime-key": requiredEnv("ECB_ORDINARY_DB_KEY"),
        },
      },
    },
  );

  return {
    async capture({ operationId, content, source, capturedAt }) {
      const { data, error } = await supabase.rpc("ecb11_capture_thought", {
        p_operation_id: operationId,
        p_content: content,
        p_source: source,
        p_captured_at: capturedAt ?? null,
      });
      if (error) rpcFailure(error, "persistence_failed");
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new BrainOperationError("persistence_failed");
      return {
        operationId: String(row.operation_id),
        replayed: Boolean(row.replayed),
        thought: {
          id: String(row.thought_id),
          content: String(row.content),
          source: String(row.source),
          captured_at: String(row.captured_at),
        },
      };
    },

    async fetch(id, modelId) {
      const { data, error } = await supabase.rpc("ecb11_fetch_thought", {
        p_id: id,
        p_model_id: modelId,
      });
      if (error) rpcFailure(error, "fetch_failed");
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return null;
      return {
        id: String(row.id),
        content: String(row.content),
        source: String(row.source),
        captured_at: String(row.captured_at),
        representation_ready: Boolean(row.representation_ready),
      };
    },

    async listMissingEmbeddings(modelId, limit) {
      const { data, error } = await supabase.rpc(
        "ecb11_list_missing_embeddings",
        {
          p_model_id: modelId,
          p_limit: limit,
        },
      );
      if (error) rpcFailure(error, "search_failed");
      return (Array.isArray(data) ? data : []).map((row) => ({
        thoughtId: String(row.thought_id),
        content: String(row.content),
      }));
    },

    async storeEmbedding(thoughtId, modelId, embedding) {
      const { data, error } = await supabase.rpc("ecb11_store_embedding", {
        p_thought_id: thoughtId,
        p_model_id: modelId,
        p_embedding: embedding,
      });
      if (error) rpcFailure(error, "persistence_failed");
      if (!data) throw new BrainOperationError("persistence_failed");
      return String(data);
    },

    async search(query, modelId, queryEmbedding, limit) {
      const { data, error } = await supabase.rpc("ecb11_search_thoughts", {
        p_query: query,
        p_model_id: modelId,
        p_query_embedding: queryEmbedding,
        p_limit: limit,
      });
      if (error) rpcFailure(error, "search_failed");
      if (!data || typeof data !== "object") {
        throw new BrainOperationError("search_failed");
      }
      return data as Omit<SearchResult, "repair">;
    },
  };
}

function createEmbedder(): Embedder {
  const embeddingSession = new Supabase.ai.Session(MODEL_ID);
  return async (text: string) => {
    const output = await embeddingSession.run(text, {
      mean_pool: true,
      normalize: true,
    });
    return validateEmbedding(output);
  };
}

function createRuntime(): AppDependencies {
  return {
    accessKey: requiredEnv("ECB_BRAIN_KEY"),
    runtime: createBrainRuntime(createStore(), createEmbedder()),
  };
}

if (import.meta.main) {
  Deno.serve(createMcpApp(createRuntime()).fetch);
}
