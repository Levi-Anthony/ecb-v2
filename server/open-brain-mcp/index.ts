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

type CapturedThought = {
  id: string;
  content: string;
  source: string;
  captured_at: string;
  embedding_model: string;
};

type ThoughtMatch = CapturedThought & {
  similarity: number;
};

type OperationFailureCode =
  | "embedding_failed"
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
    content: string;
    source: string;
    capturedAt?: string;
  }): Promise<CapturedThought>;
  search(query: string, limit: number): Promise<ThoughtMatch[]>;
  fetch(id: string): Promise<CapturedThought | null>;
};

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
  const server = new McpServer({ name: "ecb-v2-open-brain", version: "0.1.0" });

  server.registerTool(
    "capture_thought",
    {
      title: "Capture Thought",
      description:
        "Persist one atomic evidence thought with explicit source provenance and return its durable identity.",
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        content: z.string().trim().min(1),
        source: z.string().trim().min(1),
        captured_at: z.string().datetime({ offset: true }).optional(),
      },
    },
    async ({ content, source, captured_at }) => {
      try {
        return result(
          await runtime.capture({ content, source, capturedAt: captured_at }),
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
        "Search canonical thought evidence by meaning using the same embedding model as capture.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        query: z.string().trim().min(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
      },
    },
    async ({ query, limit }) => {
      try {
        return result({ results: await runtime.search(query, limit) });
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
        "Fetch one canonical thought by the durable UUID returned by search.",
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

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function createRuntime(): AppDependencies {
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const embeddingSession = new Supabase.ai.Session(MODEL_ID);

  async function embed(text: string): Promise<number[]> {
    let output: Iterable<number>;
    try {
      output = await embeddingSession.run(text, {
        mean_pool: true,
        normalize: true,
      });
    } catch {
      throw new BrainOperationError("embedding_failed");
    }
    const vector = Array.from(output as Iterable<number>);
    if (
      vector.length !== VECTOR_DIMENSIONS ||
      !vector.every(Number.isFinite)
    ) {
      throw new BrainOperationError("embedding_failed");
    }
    return vector;
  }

  const runtime: BrainRuntime = {
    async capture({ content, source, capturedAt }) {
      const embedding = await embed(content);
      const row = {
        content,
        source,
        embedding,
        embedding_model: MODEL_ID,
        ...(capturedAt ? { captured_at: capturedAt } : {}),
      };
      const { data, error } = await supabase
        .from("thoughts")
        .insert(row)
        .select("id, content, source, captured_at, embedding_model")
        .single();
      if (error || !data) {
        throw new BrainOperationError("persistence_failed");
      }
      return data as CapturedThought;
    },

    async search(query, limit) {
      const queryEmbedding = await embed(query);
      const { data, error } = await supabase.rpc("search_thoughts", {
        query_embedding: queryEmbedding,
        match_count: limit,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as ThoughtMatch[];
    },

    async fetch(id) {
      const { data, error } = await supabase
        .from("thoughts")
        .select("id, content, source, captured_at, embedding_model")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as CapturedThought | null;
    },
  };

  return { accessKey: requiredEnv("ECB_BRAIN_KEY"), runtime };
}

if (import.meta.main) {
  Deno.serve(createMcpApp(createRuntime()).fetch);
}
