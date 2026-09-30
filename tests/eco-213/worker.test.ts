import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { runStep, workerAuthorized } from '../../server/circulation/worker.js';
import { MODEL, validateOutput } from '../../server/circulation/profile.js';

// All values and IO below are constructed controls, never live/provider qualification.
const key = 'constructed-test-worker-key-with-32-bytes';
const carrier = randomUUID();
const source = 'Jennifer wanted me to call her back.';
const bundle = {
  resolution: 'one reported desire with participant coupling',
  context: { question: 'What was desired?', scope: 'quoted report', limitations: [] },
  units: [{ handle: 'desire', text: 'Jennifer wanted the narrator to call her back.', subject_id: null, subject_status: 'UNKNOWN',
    modality: 'desired', polarity: 'positive', attribution: 'narrator', conditions: [],
    participants: [{ role: 'desiring person', mention: 'Jennifer', subject_id: null, identity_status: 'UNKNOWN' },
      { role: 'requested caller', mention: 'me', subject_id: null, identity_status: 'UNKNOWN' }],
    anchors: [{ carrier_id: carrier, byte_start: 0, byte_end: Buffer.byteLength(source), excerpt: source }] }],
  relations: [], omissions: [], losses: [], questions: [], repairs_output_id: null, repair_reason: null,
};
function harness(overrides: Record<string, unknown> = {}) {
  const calls: { url: string; body: any }[] = [];
  const lease = { status: 'leased', attempt_id: randomUUID(), fence: 1, activity: { kind: 'differentiate' },
    source: { carrier_id: carrier, text: source }, mechanism: { model: MODEL }, work: {}, remit: { max_input: 16000, max_output: 4000 },
    context_outputs: [], context_subjects: [], context_coverage: { complete_outputs: true }, ...overrides };
  const env = { ECB_CIRCULATION_ENABLED: 'true', ECB_CIRCULATION_WORKER_KEY: key, ECB_CIRCULATION_OPENROUTER_KEY: 'constructed-test-provider-key' };
  let modelReply: any = { model: MODEL, provider: 'OpenAI', id: 'constructed-generation', usage: { prompt_tokens: 20, completion_tokens: 20 },
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(bundle) } }] };
  let reservation = { dispatch_permitted: true, replayed: false, reservation_id: randomUUID() };
  let tariff: any = { id: MODEL, pricing: { prompt: '0.00000015', completion: '0.00000060', request: '0' } };
  let status = 200;
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url); const body = init?.body ? JSON.parse(String(init.body)) : null; calls.push({ url: path, body });
    if (path.endsWith('eco213_lease')) return Response.json(lease);
    if (path.endsWith('/models')) return Response.json({ data: [tariff] });
    if (path.endsWith('eco213_reserve')) return Response.json(reservation);
    if (path.endsWith('/chat/completions')) return Response.json(modelReply, { status });
    if (path.endsWith('eco213_finish')) return Response.json({ status: 'complete' });
    if (path.endsWith('eco213_fail')) return Response.json({ status: 'failed', failure_code: body.p_code });
    throw new Error('unexpected constructed dispatch');
  }) as typeof fetch;
  return { calls, lease, env, fetcher, reply: (x: any) => modelReply = x, tariff: (x: any) => tariff = x,
    reservation: (x: any) => reservation = x, status: (x: number) => status = x,
    run: () => runStep({ env, fetch: fetcher }) };
}
test('worker authentication requires installed key and Bearer scheme', () => {
  assert.equal(workerAuthorized(`Bearer ${key}`, key), true);
  for (const a of [null, key, `Basic ${key}`, 'Bearer wrong']) assert.equal(workerAuthorized(a, key), false);
  assert.equal(workerAuthorized('Bearer short', 'short'), false);
});
test('missing provider credential is visible without provider dispatch', async () => {
  const h = harness(); delete (h.env as any).ECB_CIRCULATION_OPENROUTER_KEY;
  assert.equal((await h.run()).failure_code, 'provider_uncommissioned');
  assert.equal(h.calls.some(x => x.url.includes('openrouter.ai')), false);
});
test('reserve before exactly one request; strict fixed route and price ceiling', async () => {
  const h = harness(); await h.run();
  const reserve = h.calls.findIndex(x => x.url.endsWith('eco213_reserve'));
  const call = h.calls.findIndex(x => x.url.endsWith('/chat/completions'));
  assert.ok(reserve < call && reserve >= 0);
  const request = h.calls[call].body;
  assert.equal(request.model, MODEL); assert.equal(request.provider.require_parameters, true);
  assert.deepEqual(request.provider.only, ['openai']); assert.equal(request.provider.allow_fallbacks, false);
  assert.equal(request.response_format.json_schema.strict, true);
  assert.equal(h.calls.filter(x => x.url.endsWith('/chat/completions')).length, 1);
  assert.ok(h.calls.some(x => x.url.endsWith('eco213_finish') && x.body.p_provider.generation_id === 'constructed-generation'));
});
test('unbounded tariff denies request', async () => {
  const h = harness(); h.tariff({ id: MODEL, pricing: { prompt: 'NaN', completion: '1' } });
  assert.equal((await h.run()).failure_code, 'tariff_unbounded');
  assert.equal(h.calls.some(x => x.url.endsWith('/chat/completions')), false);
});
test('reservation replay retains ambiguity and does not dispatch again', async () => {
  const h = harness(); h.reservation({ replayed: true, dispatch_permitted: false });
  assert.equal((await h.run()).failure_code, 'provider_outcome_ambiguous');
  assert.equal(h.calls.some(x => x.url.endsWith('/chat/completions')), false);
});
test('oversized input fails visibly without truncation or provider call', async () => {
  const h = harness({ source: { carrier_id: carrier, text: 'x'.repeat(17000) } });
  assert.equal((await h.run()).failure_code, 'input_resource_boundary');
  assert.equal(h.calls.some(x => x.url.includes('openrouter.ai')), false);
});
test('bad anchor preserves raw output failure and cannot regenerate', async () => {
  const h = harness(); const bad = structuredClone(bundle); bad.units[0].anchors[0].byte_start = 1;
  h.reply({ model: MODEL, provider: 'OpenAI', id: 'constructed-generation', choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(bad) } }] });
  assert.equal((await h.run()).failure_code, 'output_validation_failed');
  assert.ok(h.calls.at(-1)?.body.p_provider.raw_output.includes('constructed-generation'));
  assert.equal(h.calls.some(x => x.url.endsWith('eco213_finish')), false);
});
test('provider HTTP failures expose safe code and delegated delayed retry', async () => {
  const h = harness(); h.status(503); h.reply({ error: 'constructed private provider detail' });
  assert.equal((await h.run()).failure_code, 'provider_http_failed');
  assert.equal(h.calls.at(-1)?.body.p_transient, true);
  assert.equal(h.calls.filter(x => x.url.endsWith('/chat/completions')).length, 1);
});
test('unexpected model/provider identity fails before semantic commit', async () => {
  const h = harness(); h.reply({ model: 'other-model', provider: 'Other', id: 'constructed-generation', choices: [{ finish_reason: 'stop' }] });
  assert.equal((await h.run()).failure_code, 'provider_identity_requires_requalification');
  assert.equal(h.calls.some(x => x.url.endsWith('eco213_finish')), false);
});
test('exact quote cannot establish semantic adequacy of a false description', () => {
  const falseDescription = structuredClone(bundle); falseDescription.units[0].text = 'The narrator completed the call.';
  const result = validateOutput('differentiate', falseDescription, new Map([[carrier, source]]));
  assert.equal('verdict' in result, false); // Deliberate structural checker limit, not a semantic PASS.
});
test('blocking semantic UNKNOWN cannot be labeled satisfied', () => {
  assert.throws(() => validateOutput('assess', { verdict: 'SATISFIED', coverage: { participants: 'UNKNOWN', modality: 'SATISFIED', polarity: 'SATISFIED', conditions: 'SATISFIED', attribution: 'SATISFIED', dependencies: 'SATISFIED' }, findings: [], unresolved: [], limitations: [] }, new Map()));
});
test('unrecognized fields cannot silently widen mechanism output', () => {
  assert.throws(() => validateOutput('differentiate', { ...bundle, policy_override: true }, new Map([[carrier, source]])));
});
