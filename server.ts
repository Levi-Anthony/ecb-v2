import { StreamableHTTPTransport } from '@hono/mcp';
import { pipeline } from '@huggingface/transformers';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Hono } from 'hono';
import { z } from 'zod';

const SUPABASE_URL = 'https://vezxivrvhakclxuvxzso.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4mAxzOfWinJcn-98szUEYA_Wh88UdPW';
const MODEL_ID = 'gte-small';
const VECTOR_DIMENSIONS = 384;
const REPAIR_BATCH_LIMIT = 100;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
};

type Thought = {
  id: string;
  content: string;
  source: string;
  captured_at: string;
};

type RepresentationStatus = {
  model_id: string;
  ready: boolean;
  error?: 'embedding_failed' | 'representation_persistence_failed' | 'representation_status_failed';
};

type Admission = {
  operation_id: string | null;
  committed_at: string | null;
  producer_context: string | null;
  parent_receipt_id: string | null;
};

type Disposition = {
  revision_id: string;
  state: string;
  reentry_condition: string | null;
  recorded_at: string;
};

type SearchCoverage = {
  total_thoughts: number;
  represented_thoughts: number;
  missing_representations: number;
  semantic_query_available: boolean;
  semantic_index_complete: boolean;
  lexical_available: boolean;
  degraded: boolean;
};

type SearchRepair = {
  attempted: number;
  repaired: number;
  error?: 'embedding_failed' | 'representation_persistence_failed' | 'repair_scan_failed';
};

type ThoughtMatch = Thought & {
  lexical_rank: number | null;
  lexical_score: number | null;
  semantic_rank: number | null;
  semantic_similarity: number | null;
  score: number;
};

type SearchResult = {
  results: ThoughtMatch[];
  coverage: SearchCoverage;
  repair: SearchRepair;
};

type FetchedThought = Thought & {
  representation_ready: boolean;
  admission: Admission;
  disposition: Disposition;
};

type Artifact = {
  id: string;
  content: string;
  registered_at: string;
};

type FailureCode =
  | 'operation_conflict'
  | 'disposition_conflict'
  | 'runtime_unauthorized'
  | 'persistence_failed'
  | 'capture_failed'
  | 'search_failed'
  | 'fetch_failed'
  | 'disposition_write_failed'
  | 'artifact_write_failed'
  | 'artifact_fetch_failed';

type EmbeddingModel = (
  text: string,
  options: { pooling: 'mean'; normalize: true },
) => Promise<{ data: Iterable<number> }>;

class BrainOperationError extends Error {
  constructor(readonly code: FailureCode) {
    super(code);
    this.name = 'BrainOperationError';
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`missing_${name.toLowerCase()}`);
  return value;
}

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

function failure(code: string) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ error: code }) }],
    isError: true,
  };
}

function logFailure(code: string, error: unknown): void {
  console.error(code, error instanceof Error ? error.message : String(error));
}

function operationFailure(error: unknown, fallback: FailureCode) {
  const code = error instanceof BrainOperationError ? error.code : fallback;
  logFailure(code, error);
  return failure(code);
}

function nullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function nonBlankText() {
  return z.string().refine((value) => value.trim().length > 0, {
    message: 'must contain non-whitespace text',
  });
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
}

async function bearerAccepted(request: Request): Promise<boolean> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return false;
  const token = authorization.slice('Bearer '.length).trim();
  if (!token) return false;
  const expected = requiredEnv('ECB_BRAIN_KEY_SHA256').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(expected)) throw new Error('invalid_ecb_brain_key_sha256');
  const actual = await sha256Hex(token);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function rpcHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'content-type': 'application/json',
    'x-ecb-runtime-key': requiredEnv('ECB_ORDINARY_DB_KEY'),
  };
}

async function rpc<T>(name: string, body: Record<string, unknown>, fallback: FailureCode): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: rpcHeaders(),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    if (text.includes('ecb11_operation_conflict')) {
      throw new BrainOperationError('operation_conflict');
    }
    if (text.includes('eco138_disposition_predecessor_conflict')) {
      throw new BrainOperationError('disposition_conflict');
    }
    if (text.includes('ecb11_runtime_unauthorized') || text.includes('ecb11_runtime_uncommissioned')) {
      throw new BrainOperationError('runtime_unauthorized');
    }
    throw new BrainOperationError(fallback);
  }
  if (!text) return null as T;
  return JSON.parse(text) as T;
}

let embeddingPipeline: Promise<EmbeddingModel> | null = null;

async function getEmbeddingPipeline(): Promise<EmbeddingModel> {
  embeddingPipeline ??= pipeline(
    'feature-extraction',
    'Supabase/gte-small',
  ) as unknown as Promise<EmbeddingModel>;
  return embeddingPipeline;
}

function validateEmbedding(vector: Iterable<number>): number[] {
  const normalized = Array.from(vector);
  if (normalized.length !== VECTOR_DIMENSIONS || !normalized.every(Number.isFinite)) {
    throw new Error('embedding_failed');
  }
  return normalized;
}

async function embed(text: string): Promise<number[]> {
  const model = await getEmbeddingPipeline();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return validateEmbedding(output.data);
}

async function fetchThought(id: string): Promise<FetchedThought | null> {
  const data = await rpc<unknown[]>('eco138_fetch_thought', {
    p_id: id,
    p_model_id: MODEL_ID,
  }, 'fetch_failed');
  const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    content: String(row.content),
    source: String(row.source),
    captured_at: String(row.captured_at),
    representation_ready: Boolean(row.representation_ready),
    admission: {
      operation_id: nullableString(row.admission_operation_id),
      committed_at: nullableString(row.admission_committed_at),
      producer_context: nullableString(row.producer_context),
      parent_receipt_id: nullableString(row.parent_operation_id),
    },
    disposition: {
      revision_id: String(row.disposition_revision_id),
      state: String(row.disposition),
      reentry_condition: nullableString(row.reentry_condition),
      recorded_at: String(row.disposition_recorded_at),
    },
  };
}

async function storeEmbedding(thoughtId: string, vector: number[]): Promise<void> {
  await rpc('ecb11_store_embedding', {
    p_thought_id: thoughtId,
    p_model_id: MODEL_ID,
    p_embedding: vector,
  }, 'persistence_failed');
}

async function representationForCapture(thought: Thought): Promise<RepresentationStatus> {
  try {
    const fetched = await fetchThought(thought.id);
    if (fetched?.representation_ready) return { model_id: MODEL_ID, ready: true };
  } catch {
    return { model_id: MODEL_ID, ready: false, error: 'representation_status_failed' };
  }

  let vector: number[];
  try {
    vector = validateEmbedding(await embed(thought.content));
  } catch {
    return { model_id: MODEL_ID, ready: false, error: 'embedding_failed' };
  }

  try {
    await storeEmbedding(thought.id, vector);
    return { model_id: MODEL_ID, ready: true };
  } catch {
    return { model_id: MODEL_ID, ready: false, error: 'representation_persistence_failed' };
  }
}

async function repairMissing(): Promise<SearchRepair> {
  let missing: Array<{ thought_id: string; content: string }>;
  try {
    missing = await rpc('ecb11_list_missing_embeddings', {
      p_model_id: MODEL_ID,
      p_limit: REPAIR_BATCH_LIMIT,
    }, 'search_failed');
  } catch {
    return { attempted: 0, repaired: 0, error: 'repair_scan_failed' };
  }

  let attempted = 0;
  let repaired = 0;
  for (const item of missing) {
    attempted += 1;
    let vector: number[];
    try {
      vector = await embed(item.content);
    } catch {
      return { attempted, repaired, error: 'embedding_failed' };
    }
    try {
      await storeEmbedding(item.thought_id, vector);
      repaired += 1;
    } catch {
      return { attempted, repaired, error: 'representation_persistence_failed' };
    }
  }
  return { attempted, repaired };
}

const runtime = {
  async capture(input: {
    operationId: string;
    content: string;
    source: string;
    capturedAt?: string;
    producerContext?: string;
    parentReceiptId?: string;
  }) {
    const data = await rpc<unknown[]>('ecb11_capture_thought', {
      p_operation_id: input.operationId,
      p_content: input.content,
      p_source: input.source,
      p_captured_at: input.capturedAt ?? null,
      p_producer_context: input.producerContext ?? null,
      p_parent_operation_id: input.parentReceiptId ?? null,
    }, 'persistence_failed');
    const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
    if (!row) throw new BrainOperationError('persistence_failed');
    const thought: Thought = {
      id: String(row.thought_id),
      content: String(row.content),
      source: String(row.source),
      captured_at: String(row.captured_at),
    };
    return {
      operation_id: String(row.operation_id),
      replayed: Boolean(row.replayed),
      thought,
      admission: {
        producer_context: nullableString(row.producer_context),
        parent_receipt_id: nullableString(row.parent_operation_id),
      },
      disposition: {
        revision_id: String(row.disposition_revision_id),
        state: String(row.disposition),
        reentry_condition: nullableString(row.reentry_condition),
        recorded_at: String(row.disposition_recorded_at),
      },
      representation: await representationForCapture(thought),
    };
  },

  async search(query: string, limit: number): Promise<SearchResult> {
    const repair = await repairMissing();
    let queryEmbedding: number[] | null = null;
    if (repair.error !== 'embedding_failed') {
      try {
        queryEmbedding = await embed(query);
      } catch {
        queryEmbedding = null;
      }
    }
    const searched = await rpc<Omit<SearchResult, 'repair'>>('ecb11_search_thoughts', {
      p_query: query,
      p_model_id: MODEL_ID,
      p_query_embedding: queryEmbedding,
      p_limit: limit,
    }, 'search_failed');
    return { ...searched, repair };
  },

  async fetch(id: string) {
    return fetchThought(id);
  },

  async setDisposition(input: {
    operationId: string;
    thoughtId: string;
    expectedRevisionId: string;
    disposition: string;
    reentryCondition?: string;
  }) {
    const data = await rpc<unknown[]>('eco138_set_thought_disposition', {
      p_operation_id: input.operationId,
      p_thought_id: input.thoughtId,
      p_expected_revision_id: input.expectedRevisionId,
      p_disposition: input.disposition,
      p_reentry_condition: input.reentryCondition ?? null,
    }, 'disposition_write_failed');
    const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
    if (!row) throw new BrainOperationError('disposition_write_failed');
    return {
      operation_id: String(row.operation_id),
      replayed: Boolean(row.replayed),
      thought_id: String(row.thought_id),
      disposition: {
        revision_id: String(row.disposition_revision_id),
        predecessor_revision_id: nullableString(row.predecessor_revision_id),
        state: String(row.disposition),
        reentry_condition: nullableString(row.reentry_condition),
        recorded_at: String(row.recorded_at),
      },
    };
  },

  async createArtifact(input: { operationId: string; content: string }) {
    const data = await rpc<unknown[]>('ecb12_create_artifact', {
      p_operation_id: input.operationId,
      p_content: input.content,
    }, 'artifact_write_failed');
    const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
    if (!row) throw new BrainOperationError('artifact_write_failed');
    return {
      operation_id: String(row.operation_id),
      artifact: {
        id: String(row.artifact_id),
        content: String(row.content),
        registered_at: String(row.registered_at),
      },
      replayed: Boolean(row.replayed),
    };
  },

  async fetchArtifact(id: string): Promise<Artifact | null> {
    const data = await rpc<unknown[]>('ecb12_fetch_artifact', {
      p_id: id,
    }, 'artifact_fetch_failed');
    const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
    if (!row) return null;
    return {
      id: String(row.id),
      content: String(row.content),
      registered_at: String(row.registered_at),
    };
  },
};

function buildServer(): McpServer {
  const server = new McpServer({ name: 'ecb-v2-open-brain', version: '0.4.0' });

  server.registerTool('capture_thought', {
    title: 'Capture Thought',
    description:
      'Transfer custody of one atomic evidence Thought under a stable operation UUID. Optional producer_context and parent_receipt_id preserve known encounter provenance without granting standing or triggering qualification. A neutral active disposition is established automatically.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      operation_id: z.string().uuid(),
      content: nonBlankText(),
      source: nonBlankText(),
      captured_at: z.string().datetime({ offset: true }).optional(),
      producer_context: z.string().min(1).optional(),
      parent_receipt_id: z.string().uuid().optional(),
    },
  }, async ({ operation_id, content, source, captured_at, producer_context, parent_receipt_id }) => {
    try {
      return result(await runtime.capture({
        operationId: operation_id,
        content,
        source,
        capturedAt: captured_at,
        producerContext: producer_context,
        parentReceiptId: parent_receipt_id,
      }));
    } catch (error) {
      return operationFailure(error, 'capture_failed');
    }
  });

  server.registerTool('search', {
    title: 'Search Thoughts',
    description:
      'Search canonical thought evidence through one hybrid retrieval surface. Lexical retrieval remains available when semantic embedding is unavailable; coverage reports whether semantic indexing is complete or degraded.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      query: z.string().trim().min(1),
      limit: z.number().int().min(1).max(100).optional().default(10),
    },
  }, async ({ query, limit }) => {
    try {
      return result(await runtime.search(query, limit));
    } catch (error) {
      return operationFailure(error, 'search_failed');
    }
  });

  server.registerTool('fetch', {
    title: 'Fetch Thought',
    description:
      'Fetch canonical Thought evidence by Thought UUID or its admission receipt UUID. Returns custody provenance, representation readiness, and the exact current operational disposition separately; none confers truth or authority.',
    annotations: { readOnlyHint: true },
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    try {
      const thought = await runtime.fetch(id);
      return thought ? result(thought) : failure('not_found');
    } catch (error) {
      return operationFailure(error, 'fetch_failed');
    }
  });

  server.registerTool('set_thought_disposition', {
    title: 'Set Thought Disposition',
    description:
      'Append a new operational-disposition revision for one Thought using exact predecessor currentness. This records what ECOS is doing with the material now; it does not change the evidence, Claim standing, truth, authority, priority, or route. Preserve a concrete reentry_condition when intentionally deferring work on an unresolved condition.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      operation_id: z.string().uuid(),
      thought_id: z.string().uuid(),
      expected_revision_id: z.string().uuid(),
      disposition: nonBlankText(),
      reentry_condition: z.string().min(1).optional(),
    },
  }, async ({ operation_id, thought_id, expected_revision_id, disposition, reentry_condition }) => {
    try {
      return result(await runtime.setDisposition({
        operationId: operation_id,
        thoughtId: thought_id,
        expectedRevisionId: expected_revision_id,
        disposition,
        reentryCondition: reentry_condition,
      }));
    } catch (error) {
      return operationFailure(error, 'disposition_write_failed');
    }
  });

  server.registerTool('create_artifact', {
    title: 'Create Artifact',
    description:
      'Create one immutable text Artifact as a persistent Referent. The exact text is retained as representation content; creation does not confer truth, standing, currentness, relation, acceptance, authority, or authorization.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      operation_id: z.string().uuid(),
      content: z.string(),
    },
  }, async ({ operation_id, content }) => {
    try {
      return result(await runtime.createArtifact({ operationId: operation_id, content }));
    } catch (error) {
      return operationFailure(error, 'artifact_write_failed');
    }
  });

  server.registerTool('fetch_artifact', {
    title: 'Fetch Artifact',
    description:
      'Fetch one immutable text Artifact by its durable Referent UUID. This operation has no latest-version or currentness semantics.',
    annotations: { readOnlyHint: true },
    inputSchema: { id: z.string().uuid() },
  }, async ({ id }) => {
    try {
      const artifact = await runtime.fetchArtifact(id);
      return artifact ? result(artifact) : failure('not_found');
    } catch (error) {
      return operationFailure(error, 'artifact_fetch_failed');
    }
  });

  return server;
}

const app = new Hono();

app.get('/', (context) => context.json({
  service: 'ecb-v2-open-brain',
  runtime: 'vercel-node',
  canonical_brain: 'vezxivrvhakclxuvxzso',
  model: 'Supabase/gte-small',
  ordinary_tools: [
    'capture_thought',
    'search',
    'fetch',
    'set_thought_disposition',
    'create_artifact',
    'fetch_artifact',
  ],
  provider_admin_credentials_required: false,
}));

app.options('*', (context) => context.text('ok', 200, corsHeaders));

app.all('/mcp', async (context) => {
  try {
    if (!(await bearerAccepted(context.req.raw))) {
      return context.json(
        { error: 'unauthorized' },
        401,
        { ...corsHeaders, 'WWW-Authenticate': 'Bearer realm="ecb-v2"' },
      );
    }
  } catch (error) {
    logFailure('runtime_configuration_failed', error);
    return context.json({ error: 'runtime_configuration_failed' }, 503, corsHeaders);
  }

  const server = buildServer();
  const transport = new StreamableHTTPTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  const response = await transport.handleRequest(context);
  if (!response) return context.json({ error: 'transport_failed' }, 500);
  for (const [name, value] of Object.entries(corsHeaders)) response.headers.set(name, value);
  return response;
});

export default app;
