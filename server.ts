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

type FetchedThought = Thought & { representation_ready: boolean };

type FailureCode =
  | 'operation_conflict'
  | 'runtime_unauthorized'
  | 'persistence_failed'
  | 'capture_failed'
  | 'search_failed'
  | 'fetch_failed'
  | 'artifact_conflict'
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
    if (text.includes('ecb11_operation_conflict') || text.includes('ecb12_operation_conflict')) {
      throw new BrainOperationError('operation_conflict');
    }
    if (text.includes('ecb12_artifact_key_exists') || text.includes('ecb12_stale_supersession')) {
      throw new BrainOperationError('artifact_conflict');
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
  const data = await rpc<unknown[]>('ecb11_fetch_thought', {
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
    vector = await embed(thought.content);
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
  async capture(input: { operationId: string; content: string; source: string; capturedAt?: string }) {
    const data = await rpc<unknown[]>('ecb11_capture_thought', {
      p_operation_id: input.operationId,
      p_content: input.content,
      p_source: input.source,
      p_captured_at: input.capturedAt ?? null,
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

  async createArtifact(input: {
    operationId: string;
    artifactKey: string;
    artifactType: string;
    mediaType: string;
    payloadText: string;
    provenance: Record<string, unknown>;
  }) {
    return rpc<unknown>('ecb12_create_artifact', {
      p_operation_id: input.operationId,
      p_artifact_key: input.artifactKey,
      p_artifact_type: input.artifactType,
      p_media_type: input.mediaType,
      p_payload_text: input.payloadText,
      p_provenance: input.provenance,
      p_created_by: 'ordinary_mcp',
    }, 'artifact_write_failed');
  },

  async createArtifactVersion(input: {
    operationId: string;
    artifactId: string;
    supersedesVersionId: string;
    mediaType: string;
    payloadText: string;
    provenance: Record<string, unknown>;
  }) {
    return rpc<unknown>('ecb12_create_artifact_version', {
      p_operation_id: input.operationId,
      p_artifact_id: input.artifactId,
      p_supersedes_version_id: input.supersedesVersionId,
      p_media_type: input.mediaType,
      p_payload_text: input.payloadText,
      p_provenance: input.provenance,
      p_created_by: 'ordinary_mcp',
    }, 'artifact_write_failed');
  },

  async fetchArtifact(artifactId: string, versionNumber?: number) {
    return rpc<unknown | null>('ecb12_fetch_artifact', {
      p_artifact_id: artifactId,
      p_version_number: versionNumber ?? null,
    }, 'artifact_fetch_failed');
  },

  async fetchArtifactByKey(artifactKey: string, versionNumber?: number) {
    return rpc<unknown | null>('ecb12_fetch_artifact_by_key', {
      p_artifact_key: artifactKey,
      p_version_number: versionNumber ?? null,
    }, 'artifact_fetch_failed');
  },
};

function buildServer(): McpServer {
  const server = new McpServer({ name: 'ecb-v2-open-brain', version: '0.3.0' });

  server.registerTool('capture_thought', {
    title: 'Capture Thought',
    description:
      'Persist one atomic evidence thought under a stable operation UUID. Reuse the same operation_id to reconcile an uncertain retry; use a new operation_id for a distinct encounter, even when content repeats.',
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
  }, async ({ operation_id, content, source, captured_at }) => {
    try {
      return result(await runtime.capture({ operationId: operation_id, content, source, capturedAt: captured_at }));
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
      'Fetch one canonical thought by durable UUID and report whether its current semantic representation is ready.',
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

  server.registerTool('create_artifact', {
    title: 'Create Artifact',
    description:
      'Create one stable Artifact identity and immutable version-1 representation. Artifact creation preserves exact payload bytes, provenance and a content digest; it does not confer truth, standing, currentness, acceptance, authority or authorization on the payload.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      operation_id: z.string().uuid(),
      artifact_key: z.string().trim().min(1),
      artifact_type: z.string().trim().min(1),
      media_type: z.string().trim().min(1).optional().default('text/plain; charset=utf-8'),
      payload_text: z.string(),
      provenance: z.record(z.string(), z.unknown()).optional().default({}),
    },
  }, async ({ operation_id, artifact_key, artifact_type, media_type, payload_text, provenance }) => {
    try {
      return result(await runtime.createArtifact({
        operationId: operation_id,
        artifactKey: artifact_key,
        artifactType: artifact_type,
        mediaType: media_type,
        payloadText: payload_text,
        provenance,
      }));
    } catch (error) {
      return operationFailure(error, 'artifact_write_failed');
    }
  });

  server.registerTool('create_artifact_version', {
    title: 'Create Artifact Version',
    description:
      'Create the next immutable version of an existing Artifact by explicitly naming the current version it supersedes. Stale supersession is rejected; prior versions remain unchanged and fetchable.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      operation_id: z.string().uuid(),
      artifact_id: z.string().uuid(),
      supersedes_version_id: z.string().uuid(),
      media_type: z.string().trim().min(1).optional().default('text/plain; charset=utf-8'),
      payload_text: z.string(),
      provenance: z.record(z.string(), z.unknown()).optional().default({}),
    },
  }, async ({ operation_id, artifact_id, supersedes_version_id, media_type, payload_text, provenance }) => {
    try {
      return result(await runtime.createArtifactVersion({
        operationId: operation_id,
        artifactId: artifact_id,
        supersedesVersionId: supersedes_version_id,
        mediaType: media_type,
        payloadText: payload_text,
        provenance,
      }));
    } catch (error) {
      return operationFailure(error, 'artifact_write_failed');
    }
  });

  server.registerTool('fetch_artifact', {
    title: 'Fetch Artifact',
    description:
      'Fetch an Artifact by durable UUID. Supply version_number to retrieve an exact immutable version; omit it only when latest-version behavior is explicitly desired.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      artifact_id: z.string().uuid(),
      version_number: z.number().int().min(1).optional(),
    },
  }, async ({ artifact_id, version_number }) => {
    try {
      const artifact = await runtime.fetchArtifact(artifact_id, version_number);
      return artifact ? result(artifact) : failure('not_found');
    } catch (error) {
      return operationFailure(error, 'artifact_fetch_failed');
    }
  });

  server.registerTool('fetch_artifact_by_key', {
    title: 'Fetch Artifact by Key',
    description:
      'Fetch an Artifact by stable artifact_key. Supply version_number for semantic or other hard dependencies so the caller does not silently drift to a later representation.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      artifact_key: z.string().trim().min(1),
      version_number: z.number().int().min(1).optional(),
    },
  }, async ({ artifact_key, version_number }) => {
    try {
      const artifact = await runtime.fetchArtifactByKey(artifact_key, version_number);
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
    'create_artifact',
    'create_artifact_version',
    'fetch_artifact',
    'fetch_artifact_by_key',
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
