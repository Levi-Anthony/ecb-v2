import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { MODEL, instructions, schemas, validateOutput, type Stage } from './profile.js';

export const DATABASE = 'https://vezxivrvhakclxuvxzso.supabase.co';
export const PUBLISHABLE_KEY = 'sb_publishable_4mAxzOfWinJcn-98szUEYA_Wh88UdPW';
export type WorkerIO = {
  env: Record<string, string | undefined>;
  fetch: typeof fetch;
  embed?: (text: string) => Promise<number[]>;
};
export function workerAuthorized(authorization: string | null, key: string | undefined) {
  if (!key || key.length < 32 || !authorization?.startsWith('Bearer ')) return false;
  const hash = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(hash(authorization.slice(7)), hash(key));
}
class StepError extends Error {
  constructor(readonly code: string, readonly transient = false) { super(code); }
}
export async function runStep(io: WorkerIO) {
  const key = io.env.ECB_CIRCULATION_WORKER_KEY;
  if (io.env.ECB_CIRCULATION_ENABLED !== 'true' || !key || key.length < 32) throw new StepError('worker_uncommissioned');
  async function rpc(name: string, payload: Record<string, unknown> = {}) {
    const response = await io.fetch(`${DATABASE}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: PUBLISHABLE_KEY, 'content-type': 'application/json', 'x-eco213-worker-key': key! },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const code=(await response.text()).match(/eco213_[a-z_]+/)?.[0] ?? 'worker_rpc_failed';
      throw new StepError(code);
    }
    return response.json();
  }
  const lease = await rpc('eco213_lease');
  if (lease.status !== 'leased') return lease;
  const basis = { p_attempt: lease.attempt_id, p_fence: lease.fence };
  let provider: Record<string, unknown> = {};
  try {
    const kind = lease.activity.kind;
    if (kind === 'embed') {
      if (!io.embed) throw new StepError('embedding_unavailable');
      const representations = [];
      for (const r of lease.missing_representations ?? []) {
        const vector = await io.embed(r.content);
        if (vector.length !== 384 || !vector.every(Number.isFinite)) throw new StepError('embedding_invalid');
        representations.push({ representation_id: r.id, vector });
      }
      return await rpc('eco213_finish', { ...basis, p_bundle: { representations }, p_provider: { model: 'Supabase/gte-small', dimensions: 384, provider_dispatch: false } });
    }
    if (!(kind in schemas)) throw new StepError('mechanism_stage_unsupported');
    const stage = kind as Stage;
    if (lease.mechanism.model !== MODEL) throw new StepError('mechanism_model_requires_requalification');
    const providerKey = io.env.ECB_CIRCULATION_OPENROUTER_KEY;
    if (!providerKey) throw new StepError('provider_uncommissioned');
    const user = JSON.stringify({ work: lease.work, source: lease.source, prior_outputs: lease.context_outputs,
      native_subjects: lease.context_subjects, context_coverage: lease.context_coverage });
    // UTF-8 octet count conservatively bounds BPE tokens; schema/instruction overhead
    // is included, with 512 tokens reserved for provider chat framing. No truncation.
    const schema = z.toJSONSchema(schemas[stage]);
    const inputBound = Buffer.byteLength(user + instructions[stage] + JSON.stringify(schema), 'utf8') + 512;
    const outputBound = lease.remit.max_output;
    if (inputBound > lease.remit.max_input) throw new StepError('input_resource_boundary');
    const quoted = await io.fetch('https://openrouter.ai/api/v1/models', { signal: AbortSignal.timeout(10000) });
    if (!quoted.ok) throw new StepError('tariff_unavailable');
    const route = (await quoted.json()).data?.find((m: { id: string }) => m.id === MODEL);
    if (!route?.pricing || route.pricing.prompt === undefined || route.pricing.completion === undefined) throw new StepError('tariff_unbounded');
    const prompt = Number(route.pricing.prompt), completion = Number(route.pricing.completion), request = Number(route.pricing.request ?? 0);
    if (![prompt, completion, request].every(x => Number.isFinite(x) && x >= 0)) throw new StepError('tariff_unbounded');
    const tariff = { model: MODEL, pricing: route.pricing, quote_source: 'https://openrouter.ai/api/v1/models', quoted_at: new Date().toISOString() };
    const reservation = await rpc('eco213_reserve', { ...basis, p_usd: prompt * inputBound + completion * outputBound + request,
      p_input: inputBound, p_output: outputBound, p_tariff: tariff });
    if (!reservation.dispatch_permitted || reservation.replayed) throw new StepError('provider_outcome_ambiguous');
    const response = await io.fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${providerKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, provider: { require_parameters: true, allow_fallbacks: false, only: ['openai'],
        max_price: { prompt: prompt * 1_000_000, completion: completion * 1_000_000, request } },
        messages: [{ role: 'system', content: instructions[stage] }, { role: 'user', content: user }],
        max_tokens: outputBound, temperature: 0,
        response_format: { type: 'json_schema', json_schema: { name: `eco213_${stage}`, strict: true, schema } } }),
      signal: AbortSignal.timeout(45000),
    });
    const raw = await response.text();
    provider = { raw_output: raw, requested_model: MODEL, status: response.status };
    if (!response.ok) throw new StepError(response.status === 429 ? 'provider_rate_limited' : 'provider_http_failed', response.status === 429 || response.status >= 500);
    const parsed = JSON.parse(raw);
    provider = { ...provider, returned_model: parsed.model, provider: parsed.provider ?? 'UNKNOWN', generation_id: parsed.id,
      usage: parsed.usage ?? { status: 'UNKNOWN' }, reservation_id: reservation.reservation_id };
    if (!parsed.model || !parsed.id || parsed.choices?.[0]?.finish_reason !== 'stop') throw new StepError('provider_completion_incomplete');
    if (parsed.model !== MODEL || String(parsed.provider ?? '').toLowerCase() !== 'openai') throw new StepError('provider_identity_requires_requalification');
    const content = parsed.choices[0].message?.content;
    if (typeof content !== 'string') throw new StepError('provider_output_missing');
    const carriers = new Map<string, string>([[lease.source.carrier_id, lease.source.text]]);
    if (lease.source.original_carrier_id) carriers.set(lease.source.original_carrier_id, lease.source.original_text);
    const bundle = validateOutput(stage, JSON.parse(content), carriers);
    return await rpc('eco213_finish', { ...basis, p_bundle: bundle, p_provider: provider });
  } catch (error) {
    const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    const code = error instanceof StepError ? error.code : timeout ? 'provider_outcome_ambiguous' : 'output_validation_failed';
    // Timeout/unknown external outcome is retained; it never authorizes immediate regeneration.
    try {
      return await rpc('eco213_fail', { ...basis, p_code: code, p_transient: error instanceof StepError && error.transient, p_provider: provider });
    } catch {
      // Evidence preservation grants no late commit or retry authority.
      return await rpc('eco213_preserve_attempt', { ...basis, p_code: code, p_provider: provider });
    }
  }
}
