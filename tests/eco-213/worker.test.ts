import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID,createHash } from 'node:crypto';
import {z} from 'zod';
import { runStep, workerAuthorized } from '../../server/circulation/worker.js';
import { MODEL,EMBEDDING_MODEL,EMBEDDING_PROMPT,EMBEDDING_SCHEMA,instructions,schemas,validateOutput } from '../../server/circulation/profile.js';

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
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
function harness(overrides: Record<string, unknown> = {}) {
  const calls: { url: string; body: any }[] = [];
  const lease = { status: 'leased', attempt_id: randomUUID(), fence: 1, activity: { kind: 'differentiate' },
    source: { carrier_id: carrier, text: source }, mechanism: { model:MODEL,code_digest:'0'.repeat(64),prompt_digest:digest(instructions.differentiate),schema_digest:digest(JSON.stringify(z.toJSONSchema(schemas.differentiate))) }, work: {}, remit: { max_input: 16000, max_output: 4000 },
    context_outputs: [], context_subjects: [], context_coverage: { complete_outputs: true }, ...overrides };
  const env = { ECB_CIRCULATION_ENABLED: 'true',ECB_CIRCULATION_CODE_DIGEST:'0'.repeat(64), ECB_CIRCULATION_WORKER_KEY: key, ECB_CIRCULATION_OPENROUTER_KEY: 'constructed-test-provider-key' };
  let modelReply: any = { model: MODEL, provider: 'OpenAI', id: 'constructed-generation', usage: { prompt_tokens: 20, completion_tokens: 20 },
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(bundle) } }] };
  let reservation = { dispatch_permitted: true, replayed: false, reservation_id: randomUUID() };
  let tariff: any = { id: MODEL, pricing: { prompt: '0.00000015', completion: '0.00000060', request: '0' } };
  let status = 200;
  let metadata: any = { data: { id: 'constructed-generation', model: MODEL, provider_name: 'OpenAI', total_cost: 0.00002 } };
  let metadataStatus = 200;
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url); const body = init?.body ? JSON.parse(String(init.body)) : null; calls.push({ url: path, body });
    if (path.endsWith('eco213_lease')) return Response.json(lease);
    if (path.endsWith('/models')) return Response.json({ data: [tariff] });
    if (path.endsWith('eco213_reserve')) return Response.json(reservation);
    if (path.endsWith('/chat/completions')) return Response.json(modelReply, { status });
    if (path.includes('/generation?id=')) return Response.json(metadata, { status: metadataStatus });
    if (path.endsWith('eco213_finish')) return Response.json({ status: 'complete' });
    if (path.endsWith('eco213_fail')) return Response.json({ status: 'failed', failure_code: body.p_code });
    throw new Error('unexpected constructed dispatch');
  }) as typeof fetch;
  return { calls, lease, env, fetcher, reply: (x: any) => modelReply = x, tariff: (x: any) => tariff = x,
    reservation: (x: any) => reservation = x, status: (x: number) => status = x,
    metadata: (x: any, code = 200) => { metadata = x; metadataStatus = code; },
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

test('late commit and failure rejection retain provider evidence without retry',async()=>{
 const h=harness();const fetcher=(async(url:string|URL|Request,init?:RequestInit)=>{
  if(String(url).endsWith('eco213_finish')||String(url).endsWith('eco213_fail')) return new Response('constructed fence rejection',{status:409});
  if(String(url).endsWith('eco213_preserve_attempt')){
   assert.ok(JSON.parse(String(init?.body)).p_provider.raw_output);return Response.json({status:'evidence_preserved',effect_committed:false});
  }return h.fetcher(url,init);
 }) as typeof fetch;
 assert.equal((await runStep({env:h.env,fetch:fetcher})).effect_committed,false);
 assert.equal(h.calls.filter(x=>x.url.endsWith('/chat/completions')).length,1);
});

test('changed mechanism code/prompt/schema cannot dispatch provider calls',async()=>{
 const h=harness();h.lease.mechanism.prompt_digest='1'.repeat(64);
 assert.equal((await h.run()).failure_code,'mechanism_edition_requires_requalification');
 assert.equal(h.calls.some(x=>x.url.includes('openrouter.ai')),false);
});

test('documented completion without provider binds actual generation metadata before commit',async()=>{
 const h=harness();h.reply({model:MODEL,id:'constructed-generation',usage:{prompt_tokens:20,completion_tokens:20},
  choices:[{finish_reason:'stop',message:{content:JSON.stringify(bundle)}}]});
 assert.equal((await h.run()).status,'complete');
 const finish=h.calls.find(x=>x.url.endsWith('eco213_finish'))!;
 assert.equal(finish.body.p_provider.provider,'OpenAI');
 assert.equal(finish.body.p_provider.provider_identity_basis,'generation_metadata');
 assert.equal(finish.body.p_provider.generation_metadata.id,'constructed-generation');
 assert.equal(h.calls.filter(x=>x.url.endsWith('/chat/completions')).length,1);
});
test('missing or mismatched generation provenance retains output and denies regeneration',async()=>{
 for(const [metadata,code,error]of [
  [{error:'not available'},404,'provider_provenance_unavailable'],
  [{data:{id:'different-generation',model:MODEL,provider_name:'OpenAI'}},200,'provider_identity_requires_requalification'],
  [{data:{id:'constructed-generation',model:MODEL,provider_name:'Other'}},200,'provider_identity_requires_requalification'],
 ] as const){
  const h=harness();h.reply({model:MODEL,id:'constructed-generation',choices:[{finish_reason:'stop',message:{content:JSON.stringify(bundle)}}]});
  h.metadata(metadata,code);assert.equal((await h.run()).failure_code,error);
  assert.ok(h.calls.at(-1)?.body.p_provider.raw_output.includes('constructed-generation'));
  assert.ok(h.calls.at(-1)?.body.p_provider.generation_metadata_raw);
  assert.equal(h.calls.at(-1)?.body.p_transient,false);
  assert.equal(h.calls.some(x=>x.url.endsWith('eco213_finish')),false);
  assert.equal(h.calls.filter(x=>x.url.endsWith('/chat/completions')).length,1);
 }
});
test('null tariff is unbounded and cannot authorize a zero-price dispatch',async()=>{
 const h=harness();h.tariff({id:MODEL,pricing:{prompt:null,completion:null}});
 assert.equal((await h.run()).failure_code,'tariff_unbounded');
 assert.equal(h.calls.some(x=>x.url.endsWith('/chat/completions')),false);
});
test('embedding validates its bound mechanism before compute or index commit',async()=>{
 const mechanism={model:EMBEDDING_MODEL,code_digest:'0'.repeat(64),prompt_digest:digest(EMBEDDING_PROMPT),schema_digest:digest(JSON.stringify(EMBEDDING_SCHEMA))};
 for(const [changed,error]of [
  [{model:'other-embedding-model'},'mechanism_model_requires_requalification'],
  [{code_digest:'1'.repeat(64)},'mechanism_edition_requires_requalification'],
  [{schema_digest:'1'.repeat(64)},'mechanism_edition_requires_requalification'],
 ] as const){
  const h=harness({activity:{kind:'embed'},mechanism:{...mechanism,...changed},missing_representations:[{id:randomUUID(),content:source}]});
  let computed=0;assert.equal((await runStep({env:h.env,fetch:h.fetcher,embed:async()=>{computed++;return Array(384).fill(0);}})).failure_code,error);
  assert.equal(computed,0);assert.equal(h.calls.some(x=>x.url.endsWith('eco213_finish')),false);
 }
 const h=harness({activity:{kind:'embed'},mechanism,missing_representations:[{id:randomUUID(),content:source}]});
 assert.equal((await runStep({env:h.env,fetch:h.fetcher,embed:async()=>Array(384).fill(0.1)})).status,'complete');
 assert.equal(h.calls.some(x=>x.url.includes('openrouter.ai')),false);
});
