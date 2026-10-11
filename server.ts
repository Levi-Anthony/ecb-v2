import { pipeline } from '@huggingface/transformers';
import {
  type AuthInfo,
  type ScopeChallengeHandler,
  createMcpHandler,
  hostHeaderValidationResponse,
  McpServer,
  originValidationResponse,
} from '@modelcontextprotocol/server';
import { Hono } from 'hono';
import { z } from 'zod';
import { contracts as circulationContracts, registerCirculationTools } from './server/circulation/tools.js';
import { bearerChallenge, oauthEnabled, oauthToolDenial, verifyOAuthToken } from './server/oauth.js';
import { runBrainInquiry } from './server/orchestration-brain.js';
import { canonical } from './server/orchestration.js';
import { evaluateDIBoundary } from './server/domain-admission.js';
import { produceResponsibilitySet, type RecoveredSource } from './server/responsibility-producer.js';
import { createBrainInquiryAdapters } from './server/orchestration-brain.js';
import { systemsEngineeringNativePackages } from './server/native-packages/systems-engineering.js';
import { executeWorkflow, registerWorkflowTools, workflowContract, workflowError, type WorkflowPorts } from './server/workflow-governance.js';

const SUPABASE_URL = 'https://vezxivrvhakclxuvxzso.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4mAxzOfWinJcn-98szUEYA_Wh88UdPW';
const MODEL_ID = 'gte-small';
const VECTOR_DIMENSIONS = 384;
const REPAIR_BATCH_LIMIT = 100;
const CAPABILITY_POLICY_VERSION = 'eco218-ordinary-v1';
const CAPABILITIES = {
  recover: 'ecb:recover',
  preserve: 'ecb:preserve',
  transition: 'ecb:transition',
} as const;
type Capability = keyof typeof CAPABILITIES;
type CredentialGrant = { key_sha256: string; client_id: string; capabilities: Capability[] };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, content-type, accept, mcp-session-id, mcp-protocol-version, mcp-method, mcp-name, last-event-id',
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

type Projection = {
  artifact_id: string;
  kind: 'ACTION' | 'HOLD';
  content: string;
  bound_at: string;
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
  projection: Projection;
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
  | 'capture_operation_identity_required'
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
  const message = error instanceof Error ? error.message : '';
  const code = error instanceof BrainOperationError ? error.code : /^eco213_[a-z_]+$/.test(message) ? message : fallback;
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

/**
 * Transitional compatibility for clients that cached the pre-operation_id
 * MCP input schema. They must supply captured_at as their stable event key.
 * The UUIDv8 namespace includes the authenticated client and exact payload:
 * retries replay; distinct source occurrences do not accidentally collapse.
 * Missing both keys fails closed before any storage/RPC call.
 */
async function legacyCaptureOperationId(input: {
  actor?: string; source: string; content: string; capturedAt?: string;
}): Promise<string> {
  if (!input.actor || !input.capturedAt) throw new BrainOperationError('capture_operation_identity_required');
  const hash = await sha256Hex(JSON.stringify([
    'ecb-v2:legacy-capture-id:1', input.actor, input.source, input.content, input.capturedAt,
  ]));
  const variant = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hash.slice(0, 8), hash.slice(8, 12), '8' + hash.slice(13, 16),
    variant + hash.slice(17, 20), hash.slice(20, 32),
  ].join('-');
}

function digestEquals(actual: string, expected: string): boolean {
  let difference = 0;
  for (let index = 0; index < 64; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function configuredGrants(): CredentialGrant[] {
  const raw = process.env.ECB_MCP_CAPABILITY_GRANTS;
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length > 32) throw new Error('invalid_ecb_mcp_capability_grants');
  const seen = new Set<string>();
  return parsed.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('invalid_ecb_mcp_capability_grants');
    const grant = item as Partial<CredentialGrant>;
    if (typeof grant.key_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(grant.key_sha256)
      || typeof grant.client_id !== 'string' || !/^[a-zA-Z0-9._:-]{1,80}$/.test(grant.client_id)
      || !Array.isArray(grant.capabilities) || grant.capabilities.length === 0
      || grant.capabilities.some((value) => !Object.keys(CAPABILITIES).includes(value))) {
      throw new Error('invalid_ecb_mcp_capability_grants');
    }
    if (seen.has(grant.key_sha256)) throw new Error('duplicate_ecb_mcp_capability_credential');
    seen.add(grant.key_sha256);
    return grant as CredentialGrant;
  });
}

async function authenticateOrdinaryCredential(request: Request): Promise<AuthInfo | null> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice('Bearer '.length).trim();
  if (!token) return null;
  const expected = requiredEnv('ECB_BRAIN_KEY_SHA256').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(expected)) throw new Error('invalid_ecb_brain_key_sha256');
  const grants = configuredGrants();
  if (grants.some((grant) => grant.key_sha256 === expected)) {
    throw new Error('compatibility_credential_collision');
  }
  const actual = await sha256Hex(token);
  const compatibility = digestEquals(actual, expected);
  const matches = grants.filter((grant) => digestEquals(actual, grant.key_sha256));
  if (compatibility) return {
    token, clientId: 'ordinary-compatibility', scopes: Object.values(CAPABILITIES),
  };
  if (matches.length !== 1) return oauthEnabled() ? verifyOAuthToken(token) : null;
  return {
    token, clientId: matches[0].client_id,
    scopes: [...new Set(matches[0].capabilities.map((capability) => CAPABILITIES[capability]))],
  };
}

function capabilityCheck(capability: Capability): ScopeChallengeHandler {
  const required = CAPABILITIES[capability];
  return ({ request, authInfo }) => {
    const allowed = authInfo?.scopes.includes(required) === true;
    const args = request.params?.arguments;
    const candidate = args && typeof args === 'object' && 'operation_id' in args
      ? (args as { operation_id?: unknown }).operation_id : undefined;
    const operationId = typeof candidate === 'string' && /^[0-9a-f-]{36}$/i.test(candidate)
      ? candidate : undefined;
    console.info(JSON.stringify({
      event: 'ordinary_capability_decision', policy: CAPABILITY_POLICY_VERSION,
      client_id: authInfo?.clientId ?? 'missing', required, decision: allowed ? 'allow' : 'deny',
      ...(operationId ? { operation_id: operationId } : {}),
    }));
    return allowed ? undefined : { scopes: [required] as [string], errorDescription: `${required} capability required` };
  };
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

async function circulationDispatch(operation: string, payload: Record<string, unknown>, actor: string): Promise<unknown> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/eco213_dispatch`, {
    method: 'POST', headers: rpcHeaders(),
    body: JSON.stringify({ p_operation: operation, p_payload: payload, p_actor: actor }),
  });
  const body = await response.text();
  if (!response.ok) {
    const code = body.match(/eco213_[a-z_]+/)?.[0] ?? 'eco213_operation_failed';
    throw new Error(code);
  }
  return body ? JSON.parse(body) : null;
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
  const data = await rpc<unknown[]>('eco140_fetch_thought', {
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
    projection: {
      artifact_id: String(row.projection_artifact_id),
      kind: String(row.projection_kind) as 'ACTION' | 'HOLD',
      content: String(row.projection_content),
      bound_at: String(row.projection_bound_at),
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
    actor?: string;
    processingMode?: 'trusted' | 'raw_only';
  }) {
    let processing: unknown = { admission: 'not_requested', existing_continuation: 'UNKNOWN' };
    const args = {
      p_operation_id: input.operationId,
      p_content: input.content,
      p_source: input.source,
      p_captured_at: input.capturedAt ?? null,
      p_producer_context: input.producerContext ?? null,
      p_parent_operation_id: input.parentReceiptId ?? null,
    };
    let data: unknown[];
    if (process.env.ECB_CIRCULATION_ENABLED === 'true' && input.processingMode !== 'raw_only') {
      if (!input.actor) throw new Error('eco213_actor_missing');
      const trusted = await circulationDispatch('trusted_capture', {
        operation_id: input.operationId, content: input.content, source: input.source,
        captured_at: input.capturedAt ?? null, producer_context: input.producerContext ?? null,
        parent_receipt_id: input.parentReceiptId ?? null,
        work_id: requiredEnv('ECB_CIRCULATION_DEFAULT_WORK_ID'),
        mechanism_id: requiredEnv('ECB_CIRCULATION_DIFFERENTIATION_MECHANISM_ID'),
      }, input.actor) as { capture: Record<string, unknown>; processing: unknown };
      data = [trusted.capture]; processing = trusted.processing;
    } else data = await rpc<unknown[]>('ecb11_capture_thought', args, 'persistence_failed');
    const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
    if (!row) throw new BrainOperationError('persistence_failed');
    const thought: Thought = {
      id: String(row.thought_id),
      content: String(row.content),
      source: String(row.source),
      captured_at: String(row.captured_at),
    };
    const representation = await representationForCapture(thought);
    const current = await fetchThought(thought.id);
    if (!current) throw new BrainOperationError('capture_failed');
    return {
      operation_id: String(row.operation_id),
      replayed: Boolean(row.replayed),
      thought,
      admission: {
        producer_context: nullableString(row.producer_context),
        parent_receipt_id: nullableString(row.parent_operation_id),
      },
      disposition: current.disposition,
      projection: current.projection,
      representation,
      processing,
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
    projectionArtifactId: string;
    projectionKind: 'ACTION' | 'HOLD';
  }) {
    const data = await rpc<unknown[]>('eco140_set_thought_disposition', {
      p_operation_id: input.operationId,
      p_thought_id: input.thoughtId,
      p_expected_revision_id: input.expectedRevisionId,
      p_disposition: input.disposition,
      p_reentry_condition: input.reentryCondition ?? null,
      p_projection_artifact_id: input.projectionArtifactId,
      p_projection_kind: input.projectionKind,
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
      projection: {
        artifact_id: String(row.projection_artifact_id),
        kind: String(row.projection_kind) as 'ACTION' | 'HOLD',
        bound_at: String(row.projection_bound_at),
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

async function workflowRpc(name: string, body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: rpcHeaders(), body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const value = await response.json();
  if (!response.ok) throw new Error(/workflow_[a-z_]+/.exec(String(value.message))?.[0] ?? 'workflow_database_unavailable');
  return value;
}
const workflowPorts: WorkflowPorts = {
  inspect: (cycleId) => workflowRpc('ecb_workflow_inspect', {p_cycle_id:cycleId ?? null}),
  command: (action,payload,actor) => workflowRpc('ecb_workflow_command', {p_action:action,p_payload:payload,p_actor:actor}),
};

function buildServer(): McpServer {
  const server = new McpServer(
    { name: 'ecb-v2-open-brain', version: '0.7.0' },
    { capabilities: { tools: {} } },
  );

  registerWorkflowTools(server,workflowPorts,capabilityCheck);

  server.registerTool('capture_thought', {
    title: 'Capture Thought',
    description:
      'Contract ecb-v2-capture/0.5.2. Supply operation_id UUID for stable idempotency. Older client snapshots without that field must supply stable captured_at: the server derives a payload- and authenticated-client-bound UUIDv8; requests lacking both are rejected before persistence. Preserve exact Thought custody. Trusted circulation requires separate remit; raw_only only preserves. Custody, admission and semantic success remain separate; no standing is granted.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    scopeChallenge: capabilityCheck('preserve'),
    inputSchema: {
      operation_id: z.string().uuid().optional(),
      content: nonBlankText(),
      source: nonBlankText(),
      captured_at: z.string().datetime({ offset: true }).optional(),
      producer_context: z.string().min(1).optional(),
      parent_receipt_id: z.string().uuid().optional(),
      processing_mode: z.enum(['trusted', 'raw_only']).optional(),
    },
  }, async ({ operation_id, content, source, captured_at, producer_context, parent_receipt_id, processing_mode }, context) => {
    try {
      const actor = context.http?.authInfo?.clientId;
      const operationId = operation_id ?? await legacyCaptureOperationId({ actor, content, source, capturedAt: captured_at });
      return result(await runtime.capture({
        operationId,
        content,
        source,
        capturedAt: captured_at,
        producerContext: producer_context,
        parentReceiptId: parent_receipt_id,
        actor,
        processingMode: processing_mode,
      }));
    } catch (error) {
      return operationFailure(error, 'capture_failed');
    }
  });

  if (process.env.ECB_CIRCULATION_ENABLED === 'true') {
    registerCirculationTools(server, { check: capabilityCheck, dispatch: circulationDispatch, embed });
  }

  server.registerTool('search', {
    title: 'Search Thoughts',
    description:
      'Contract ecb-v2-search/0.7.4. Search canonical thought evidence through one hybrid retrieval surface. Optional inquiry context also opens cross-context native/structural discovery, exact candidate recovery and an editioned working projection with explicit qualification/reentry. Similarity creates no standing. This call can repair missing semantic representations; lexical retrieval remains available when embeddings fail, with coverage/degradation reported.',
    // Search repairs missing embeddings before retrieval, so it can write representations.
    annotations: { readOnlyHint: false, destructiveHint: false },
    scopeChallenge: capabilityCheck('recover'),
    inputSchema: {
      query: z.string().trim().min(1),
      limit: z.number().int().min(1).max(100).optional().default(10),
      inquiry: z.strictObject({
        intended_use: nonBlankText(),
        return_route: nonBlankText(),
        context: z.strictObject({
          referent_id: nonBlankText().optional(), boundary_ref: nonBlankText().optional(),
          governing_orientation_ref: nonBlankText().optional(), mapper_ref: nonBlankText().optional(),
          frame_ref: nonBlankText().optional(), access_ref: nonBlankText().optional(),
          source_refs: z.array(nonBlankText()).max(50).optional(),
        }),
        known_referent_ids: z.array(z.string().uuid()).max(50).optional(),
        work_id: z.string().uuid().optional(),
        structural_depth: z.number().int().min(0).max(3).optional(),
        projection_chars: z.number().int().min(1024).max(100000).optional(),
        domain_admission: z.strictObject({
          domain: z.literal('systems-engineering'),
          // Governing obligation identity is distinct from focal inquiry referent.
          // Omission remains HOLD without breaking legacy client requests.
          obligation_ref: z.string().uuid().optional(),
          package_ids: z.array(nonBlankText()).min(1).max(25).optional(),
          responsibilities: z.array(z.strictObject({
            id: nonBlankText(), construct_ref: nonBlankText(), problem_solved: nonBlankText(),
            source_lane: z.enum(['COURSE', 'CURRENT_PRACTICE', 'EXPLANATORY_RECONSTRUCTION', 'PROJECT_APPLICATION']),
            source_refs: z.array(nonBlankText()).min(1).max(50),
            native_package_ids: z.array(nonBlankText()).min(1).max(25),
            native_coverage: z.enum(['ADEQUATE', 'PARTIAL', 'NONE', 'UNKNOWN', 'UNAVAILABLE']),
            relation_type: z.enum(['SAME', 'OVERLAP', 'GENERALIZATION', 'ORTHOGONAL', 'TENSION', 'MISSING', 'UNKNOWN']),
            required_for_current_use: z.boolean().optional(),
            requires_cross_domain_correspondence: z.boolean().optional(),
            correspondence_targets: z.array(nonBlankText()).max(50).optional(),
            unmet_obligation: nonBlankText().optional(),
            ecos_mechanism_refs: z.array(nonBlankText()).max(50).optional(),
            prior_art: z.strictObject({
              checked: z.boolean(), evidence_refs: z.array(nonBlankText()).max(50),
              unavailable_reason: nonBlankText().optional(),
            }),
            falsifier: nonBlankText().optional(), receiving_owner: nonBlankText().optional(),
            question_forward: z.strictObject({
              question: nonBlankText(), decision_consequence: nonBlankText(), reentry_condition: nonBlankText(),
            }).optional(),
          })).min(1).max(50),
        }).optional(),
      }).optional(),
    },
  }, async ({ query, limit, inquiry }, context) => {
    try {
      if (inquiry) {
        const actor = context.http?.authInfo?.clientId;
        if (!actor) return failure('inquiry_actor_missing');
        const inquiryResult = await runBrainInquiry({ query, intended_use: inquiry.intended_use, return_route: inquiry.return_route,
          context: inquiry.context, actor_ref: actor, known_referent_ids: inquiry.known_referent_ids, work_id: inquiry.work_id,
          limits: { candidates: Math.min(limit, 50), structural_depth: inquiry.structural_depth, projection_chars: inquiry.projection_chars },
        }, { searchThoughts: (q, n) => runtime.search(q, n), fetchThought: id => runtime.fetch(id), dispatch: circulationDispatch, embed }, actor);
        if (!inquiry.domain_admission) return result(inquiryResult);
        const packageIds = inquiry.domain_admission.package_ids
          ?? systemsEngineeringNativePackages.filter(p => p.domain === inquiry.domain_admission!.domain).map(p => p.id);
        const domainAdmission = evaluateDIBoundary({
          domain: inquiry.domain_admission.domain, inquiry_basis_ref: inquiryResult.inquiry_basis_ref,
          package_ids: packageIds, responsibilities: inquiry.domain_admission.responsibilities,
        }, systemsEngineeringNativePackages);
        // Recover the exact source through the same authorized ordinary BRAIN/native readers.
        // This producer returns verbatim evidence candidates, never semantic validation by inference.
        const brainPorts = { searchThoughts: (q: string, n: number) => runtime.search(q, n),
          fetchThought: (id: string) => runtime.fetch(id), dispatch: circulationDispatch, embed };
        const sourceReader = createBrainInquiryAdapters(brainPorts, actor);
        const produced = await produceResponsibilitySet({
          inquiry_basis_ref: inquiryResult.inquiry_basis_ref, intended_use: inquiry.intended_use,
          obligation_ref: inquiry.domain_admission.obligation_ref ?? '',
          responsibility_ids: inquiry.domain_admission.responsibilities.map(r => r.id),
        }, {
          async recoverSource(ref): Promise<RecoveredSource | null> {
            const evidence = await sourceReader.fetchEvidence(ref);
            return evidence && evidence.content ? {
              ref: evidence.referent_id, content: evidence.content, custody_ref: evidence.custody_ref,
              basis_digest: evidence.digest, source_refs: evidence.source_refs,
              currentness: evidence.currentness,
            } : null;
          },
          // No implied provider commission: qualified semantic writer remains an explicit adapter.
        });
        const responsibilitySet = produced.assessment;
        const responsibilityProposal = produced.proposal;
        const unresolved = [...new Set([
          ...inquiryResult.reentry.unresolved_refs,
          ...domainAdmission.unresolved_refs.map(ref => 'domain_admission:' + ref),
          ...responsibilitySet.unresolved_refs.map(ref => 'responsibility_set:' + ref),
        ])];
        const disposition = inquiryResult.disposition === 'HOLD' || domainAdmission.disposition === 'HOLD' ||
          responsibilitySet.disposition === 'HOLD' ? 'HOLD' : 'READY';
        const reentry = {
          ...inquiryResult.reentry, unresolved_refs: unresolved,
          condition: responsibilitySet.disposition === 'HOLD'
            ? 'Obtain an attributable, independently source-verified responsibility-set validation for this use; ' + inquiryResult.reentry.condition
            : domainAdmission.disposition === 'HOLD'
              ? 'Resolve domain-semantic admission qualification gates, then ' + inquiryResult.reentry.condition
              : inquiryResult.reentry.condition,
        };
        const artifactContent = canonical({
          contract: inquiryResult.contract,
          indexical_binding: inquiryResult.indexical_binding,
          projection: inquiryResult.projection,
          domain_admission: domainAdmission,
          responsibility_set: responsibilitySet,
          responsibility_proposal: responsibilityProposal,
          disposition,
          reentry,
        });
        return result({
          ...inquiryResult,
          domain_admission: domainAdmission,
          responsibility_set: responsibilitySet,
          responsibility_proposal: responsibilityProposal,
          disposition,
          reentry,
          preservation: { ...inquiryResult.preservation, artifact_content: artifactContent },
        });
      }
      return result(await runtime.search(query, limit));
    } catch (error) {
      return operationFailure(error, 'search_failed');
    }
  });

  server.registerTool('fetch', {
    title: 'Fetch Thought',
    description:
      'Fetch canonical Thought evidence by Thought UUID or its admission receipt UUID. Returns custody provenance, representation readiness, the exact current operational disposition, and its exact ACTION/HOLD projection. Projection currentness confers no execution authority.',
    annotations: { readOnlyHint: true },
    scopeChallenge: capabilityCheck('recover'),
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
      'Append a new operational-disposition revision using exact predecessor currentness and bind one immutable shaped projection Artifact. projection_kind is ACTION or HOLD; HOLD requires a concrete reentry_condition. A current projection is guidance, not execution authority, truth, standing, priority, or route.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    scopeChallenge: capabilityCheck('transition'),
    inputSchema: {
      operation_id: z.string().uuid(),
      thought_id: z.string().uuid(),
      expected_revision_id: z.string().uuid(),
      disposition: nonBlankText(),
      reentry_condition: z.string().min(1).optional(),
      projection_artifact_id: z.string().uuid(),
      projection_kind: z.enum(['ACTION', 'HOLD']),
    },
  }, async ({
    operation_id,
    thought_id,
    expected_revision_id,
    disposition,
    reentry_condition,
    projection_artifact_id,
    projection_kind,
  }) => {
    try {
      return result(await runtime.setDisposition({
        operationId: operation_id,
        thoughtId: thought_id,
        expectedRevisionId: expected_revision_id,
        disposition,
        reentryCondition: reentry_condition,
        projectionArtifactId: projection_artifact_id,
        projectionKind: projection_kind,
      }));
    } catch (error) {
      return operationFailure(error, 'disposition_write_failed');
    }
  });

  server.registerTool('create_artifact', {
    title: 'Create Artifact',
    description:
      'Create one immutable text Artifact as a persistent Referent. The exact text is retained as representation content; creation does not confer truth, standing, currentness, relation, acceptance, authority, or authorization. A shaped ACTION/HOLD remains only a candidate until an exact disposition revision binds it.',
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    scopeChallenge: capabilityCheck('preserve'),
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
    scopeChallenge: capabilityCheck('recover'),
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
const mcpHandler = createMcpHandler(buildServer, { legacy: 'stateless' });

function allowedHostnames(): string[] {
  const configured = (process.env.ECB_MCP_ALLOWED_HOSTS ?? '').split(',');
  const vercel = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];
  return [...new Set([...configured, ...vercel, 'localhost', '127.0.0.1', '[::1]']
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value)))];
}

function validateMcpHostAndOrigin(request: Request): Response | undefined {
  const hosts = allowedHostnames();
  const origins = [...hosts, ...(process.env.ECB_MCP_ALLOWED_ORIGIN_HOSTS ?? '')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)];
  return hostHeaderValidationResponse(request, hosts)
    ?? originValidationResponse(request, origins);
}

app.get('/', (context) => context.json({
  service: 'ecb-v2-open-brain',
  runtime: 'vercel-node',
  canonical_brain: 'vezxivrvhakclxuvxzso',
  model: 'Supabase/gte-small',
  workflow_contract: workflowContract,
  ordinary_tools: [
    'capture_thought',
    'search',
    'fetch',
    'set_thought_disposition',
    'create_artifact',
    'fetch_artifact',
    'workflow_inspect',
    'workflow_command',
    ...(process.env.ECB_CIRCULATION_ENABLED === 'true' ? Object.keys(circulationContracts) : []),
  ],
  provider_admin_credentials_required: false,
}));

app.options('*', (context) => {
  const rejected = validateMcpHostAndOrigin(context.req.raw);
  return rejected ?? context.text('ok', 200, corsHeaders);
});

// Human/client door over the same native records and controller as the agent door.
app.all('/workflow', async (context) => {
  const rejected = validateMcpHostAndOrigin(context.req.raw);
  if (rejected) return rejected;
  if (!['GET','POST'].includes(context.req.method)) return context.json({error:'method_not_allowed'},405);
  let auth: AuthInfo | null;
  try { auth=await authenticateOrdinaryCredential(context.req.raw); }
  catch { return context.json({error:'workflow_auth_unavailable'},503,corsHeaders); }
  if (!auth) return context.json({error:'unauthorized'},401,{...corsHeaders,'WWW-Authenticate':bearerChallenge()});
  const required=context.req.method==='GET' ? 'recover' : 'transition';
  if (!auth.scopes.includes(CAPABILITIES[required])) return context.json({error:'insufficient_scope',required_capability:required},403,corsHeaders);
  try {
    if (context.req.method==='GET') {
      const cycleId=context.req.query('cycle_id');
      if (cycleId && !z.string().uuid().safeParse(cycleId).success) return context.json({error:'workflow_invalid_cycle_id'},400,corsHeaders);
      return context.json(await workflowPorts.inspect(cycleId),200,corsHeaders);
    }
    const length=Number(context.req.header('content-length') ?? 0);
    if (length>1024*1024) return context.json({error:'request_too_large'},413,corsHeaders);
    const body=await context.req.text();
    if (body.length>1024*1024) return context.json({error:'request_too_large'},413,corsHeaders);
    return context.json(await executeWorkflow(JSON.parse(body),auth.clientId,workflowPorts),200,corsHeaders);
  } catch(error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return context.json({error:'workflow_invalid_command'},400,corsHeaders);
    return context.json(workflowError(error),409,corsHeaders);
  }
});

app.all('/mcp', async (context) => {
  const rejected = validateMcpHostAndOrigin(context.req.raw);
  if (rejected) return rejected;
  let authInfo: AuthInfo | null;
  try {
    authInfo = await authenticateOrdinaryCredential(context.req.raw);
    if (!authInfo) {
      return context.json(
        { error: 'unauthorized' },
        401,
        { ...corsHeaders, 'WWW-Authenticate': bearerChallenge() },
      );
    }
  } catch (error) {
    logFailure('runtime_configuration_failed', error);
    return context.json({ error: 'runtime_configuration_failed' }, 503, corsHeaders);
  }

  const response = await oauthToolDenial(context.req.raw, authInfo)
    ?? await mcpHandler.fetch(context.req.raw, { authInfo });
  for (const [name, value] of Object.entries(corsHeaders)) response.headers.set(name, value);
  return response;
});

export default app;
