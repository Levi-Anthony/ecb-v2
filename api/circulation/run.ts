import { pipeline, env } from '@huggingface/transformers';
import { runStep, workerAuthorized } from '../../server/circulation/worker.js';
env.cacheDir = '/tmp/transformers-cache';
env.useFSCache = true;
export const config = { maxDuration: 90 };
type EmbeddingModel = (text: string, options: { pooling: 'mean'; normalize: true }) => Promise<{ data: Iterable<number> }>;
let model: Promise<EmbeddingModel> | undefined;
async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  if (!workerAuthorized(request.headers.get('authorization'), process.env.ECB_CIRCULATION_WORKER_KEY)) return new Response(null, { status: 401 });
  try {
    const outcome = await runStep({ env: process.env, fetch, embed: async text => {
      model ??= pipeline('feature-extraction', 'Supabase/gte-small') as unknown as Promise<EmbeddingModel>;
      return Array.from((await (await model)(text, { pooling: 'mean', normalize: true })).data);
    } });
    return Response.json(outcome);
  } catch { return Response.json({ error: 'circulation_unavailable', recovery: 'inspect_processing' }, { status: 503 }); }
}

// Vercel's function default export is a Node (req, res) handler. The fetch
// object explicitly selects Web Request/Response handling, as in api/mcp.ts.
export default { fetch: handler };
