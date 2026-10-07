import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import app from '../../server.ts';

const key = 'inquiry-recover-fixture-key';
process.env.ECB_MCP_CAPABILITY_GRANTS = JSON.stringify([{ key_sha256: createHash('sha256').update(key).digest('hex'), client_id: 'inquiry-reader', capabilities: ['recover'] }]);
process.env.ECB_BRAIN_KEY_SHA256 = createHash('sha256').update('unused-compatibility-fixture-key').digest('hex');
process.env.ECB_ORDINARY_DB_KEY = 'fixture-runtime-key';
delete process.env.ECB_CIRCULATION_ENABLED;
const focal = '00000000-0000-4000-8000-000000000001', prior = '00000000-0000-4000-8000-000000000002';
const inquiry = { intended_use: 'Recover material for the present work', return_route: 'fixture:work', context: { referent_id: focal,
  boundary_ref: 'fixture:boundary', governing_orientation_ref: 'fixture:pgo', mapper_ref: 'fixture:mapper', frame_ref: 'fixture:frame', access_ref: 'fixture:access' } };
async function withClient(run: (client: Client, calls: Array<{ name: string; payload: Record<string, unknown> }>) => Promise<void>) {
  const original = globalThis.fetch, calls: Array<{ name: string; payload: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const name = String(input).split('/').pop() ?? '';
    if (!String(input).includes('/rest/v1/rpc/')) return new Response('fixture embedding unavailable', { status: 503 });
    const p = JSON.parse(String(init?.body)); calls.push({ name, payload: p });
    let value: unknown = [];
    if (name === 'ecb11_search_thoughts') value = { results: [{ id: prior, content: 'Similarity snippet must not replace exact fetch', source: 'fixture', captured_at: '2026-10-06T00:00:00Z' }],
      coverage: { semantic_query_available: false, lexical_available: true, degraded: true } };
    if (name === 'eco140_fetch_thought') value = [{ id: p.p_id, content: `Exact fetched ${p.p_id}`, source: 'fixture:source', captured_at: '2026-10-06T00:00:00Z',
      disposition_revision_id: 'fixture:revision', disposition: 'HOLD', disposition_recorded_at: '2026-10-06T00:00:00Z', projection_artifact_id: 'fixture:projection', projection_kind: 'HOLD', projection_content: 'Pending', projection_bound_at: '2026-10-06T00:00:00Z' }];
    if (name === 'eco213_dispatch') {
      if (p.p_operation === 'search_structure') value = { results: [], coverage: { semantic_query_available: false, lexical_available: true } };
      else if (p.p_operation === 'traverse_structure') value = { referent_id: p.p_payload.referent_id, memberships: [] };
      else if (p.p_operation === 'fetch_referent') value = { referent_id: p.p_payload.referent_id, basis_digest: `edition:${p.p_payload.referent_id}`, thought: { content: 'Native exact source' }, native_records: [] };
      else throw new Error(`Unexpected effect ${p.p_operation}`);
    }
    return new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
  };
  const transport = new StreamableHTTPClientTransport(new URL('http://localhost/mcp'), { fetch: async (url, init) => app.fetch(new Request(url, {
    ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), host: 'localhost', authorization: `Bearer ${key}` },
  })) });
  const client = new Client({ name: 'inquiry-integration-fixture', version: '1.0.0' }, { versionNegotiation: { mode: { pin: '2026-07-28' } } });
  try { await client.connect(transport); await run(client, calls); } finally { await client.close(); globalThis.fetch = original; }
}
test('ordinary search opens exact cross-context candidates under recover capability with no new tool', async () => {
  await withClient(async (client, calls) => {
    const tools = (await client.listTools()).tools;
    assert.deepEqual(tools.map(t => t.name), ['capture_thought', 'search', 'fetch', 'set_thought_disposition', 'create_artifact', 'fetch_artifact']);
    assert((tools.find(t => t.name === 'search')!.inputSchema.properties as Record<string, unknown>).inquiry);
    const r = await client.callTool({ name: 'search', arguments: { query: 'apparently unrelated future concern', inquiry } });
    assert.equal(r.isError, undefined);
    const body = JSON.parse((r.content as Array<{ text: string }>)[0].text);
    assert.equal(body.disposition, 'HOLD'); assert.equal(body.admitted_relation_count, 0);
    assert.equal(body.situated_basis.actor_ref, 'inquiry-reader');
    assert(body.projection.content.includes('Exact fetched')); assert(!body.projection.content.includes('Similarity snippet'));
    assert(calls.filter(c => c.name === 'eco213_dispatch').every(c => ['search_structure', 'traverse_structure', 'fetch_referent'].includes(String(c.payload.p_operation))));
    const before = calls.length;
    await assert.rejects(client.callTool({ name: 'create_artifact', arguments: { operation_id: prior, content: body.projection.content } }), /403|insufficient[_ ]scope/i);
    assert.equal(calls.length, before);
  });
});
test('query-only search preserves the prior contract', async () => {
  await withClient(async (client, calls) => {
    const r = await client.callTool({ name: 'search', arguments: { query: 'ordinary search' } });
    const body = JSON.parse((r.content as Array<{ text: string }>)[0].text);
    assert.equal(body.results[0].id, prior); assert.equal(body.contract, undefined); assert(body.repair);
    assert(!calls.some(c => c.name === 'eco213_dispatch'));
  });
});
test('caller cannot supply/spoof the authenticated actor in inquiry context', async () => {
  await withClient(async (client, calls) => {
    const r = await client.callTool({ name: 'search', arguments: { query: 'x', inquiry: { ...inquiry, context: { ...inquiry.context, actor_ref: 'admin' } } } });
    assert.equal(r.isError, true); assert.equal(calls.length, 0);
  });
});


test('ordinary inquiry applies systems-engineering domain admission without a new public tool', async () => {
  await withClient(async (client) => {
    const r = await client.callTool({ name: 'search', arguments: {
      query: 'compare viewpoint semantics without reinventing native systems engineering',
      inquiry: {
        ...inquiry,
        domain_admission: {
          domain: 'systems-engineering',
          responsibilities: [{
            id: 'viewpoint-concern-framing',
            construct_ref: 'SysML Viewpoint',
            problem_solved: 'Frame stakeholder concerns for a model view.',
            source_lane: 'CURRENT_PRACTICE',
            source_refs: ['https://www.omg.org/spec/SysML/2.0/About-SysML'],
            native_package_ids: ['se:omg:sysml:2.0'],
            native_coverage: 'ADEQUATE',
            relation_type: 'OVERLAP',
            required_for_current_use: true,
            prior_art: {
              checked: true,
              evidence_refs: ['https://www.omg.org/spec/SysML/2.0/About-SysML'],
            },
          }],
        },
      },
    } });
    assert.equal(r.isError, undefined);
    const body = JSON.parse((r.content as Array<{ text: string }>)[0].text);
    assert.equal(body.domain_admission.contract, 'ecos:domain-semantic-admission:0.1.0');
    assert.equal(body.domain_admission.disposition, 'READY');
    assert.equal(body.domain_admission.decisions[0].disposition, 'INHERIT');
    assert.match(body.domain_admission.decisions[0].id, /^sha256:[0-9a-f]{64}$/);
    assert.equal(body.disposition, 'HOLD'); // the existing semantic relation adapter still holds independently
    assert(body.domain_admission.ledger_projection.includes('SysML Viewpoint'));
  });
});
