import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import keyedEndpoint from '../api/mcp/k/[key].js';
import bearerEndpoint from '../api/mcp.js';
import workerEndpoint from '../api/circulation/run.js';

// Constructed credentials only. These tests never load a deployed secret.
const key = 'constructed-eco218-key-with-32-bytes';
const scopedKey = 'constructed-eco218-recover-only';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
process.env.ECB_BRAIN_KEY_SHA256 = digest(key);
process.env.ECB_ORDINARY_DB_KEY = 'constructed-eco218-database-key';
process.env.ECB_MCP_CAPABILITY_GRANTS = JSON.stringify([
  { key_sha256: digest(scopedKey), client_id: 'recover-only', capabilities: ['recover'] },
]);
delete process.env.ECB_CIRCULATION_ENABLED;
delete process.env.ECB_CIRCULATION_WORKER_KEY;

const names = [
  'capture_thought', 'search', 'fetch', 'set_thought_disposition',
  'create_artifact', 'fetch_artifact',
];
const address = (token: string) => `http://localhost/api/mcp/k/${encodeURIComponent(token)}`;
const headers = {
  host: 'localhost', accept: 'application/json, text/event-stream', 'content-type': 'application/json',
};
function request(token: string, extraHeaders: Record<string, string> = {}, body = '{}') {
  return keyedEndpoint.fetch(new Request(address(token), {
    method: 'POST', headers: { ...headers, ...extraHeaders }, body,
  }));
}
async function useClient(
  mode: 'modern' | 'legacy',
  callback: (client: Client) => Promise<void>,
  bearer = false,
) {
  const endpoint = bearer ? bearerEndpoint : keyedEndpoint;
  const transport = new StreamableHTTPClientTransport(
    new URL(bearer ? 'http://localhost/api/mcp' : address(key)),
    { fetch: async (url, init) => endpoint.fetch(new Request(url, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init?.headers)), host: 'localhost',
        ...(bearer ? { authorization: `Bearer ${key}` } : {}),
      },
    })) },
  );
  const client = new Client(
    { name: 'eco218-route-control', version: '1' },
    mode === 'modern' ? { versionNegotiation: { mode: { pin: '2026-07-28' } } } : {},
  );
  try {
    // Legacy connect sends initialize; modern connect negotiates its protocol era.
    await client.connect(transport);
    assert.equal(client.getProtocolEra(), mode);
    await callback(client);
  } finally {
    await client.close();
  }
}

for (const mode of ['modern', 'legacy'] as const) {
  test(`${mode}: path credential connects without bearer and retains the identical six-tool catalog`, async () => {
    let bearerTools: unknown;
    await useClient(mode, async client => { bearerTools = (await client.listTools()).tools; }, true);
    await useClient(mode, async client => {
      const tools = (await client.listTools()).tools;
      assert.deepEqual(tools.map(tool => tool.name), names);
      assert.deepEqual(tools, bearerTools);
    });
  });
}

test('wrong path credentials return a generic 401 even with a valid bearer', async () => {
  for (const token of ['wrong', `${key}x`, key.slice(0, -1), ` ${key} `, scopedKey, digest(key)]) {
    const response = await request(token, { authorization: `Bearer ${key}` }, '{');
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'unauthorized' });
  }
});

test('existing bearer endpoint still requires bearer and ignores query credentials', async () => {
  const response = await bearerEndpoint.fetch(new Request(`http://localhost/api/mcp?key=${key}`, {
    method: 'POST', headers, body: '{}',
  }));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('WWW-Authenticate'), 'Bearer realm="ecb-v2"');
  const wrong = await bearerEndpoint.fetch(new Request('http://localhost/api/mcp', {
    method: 'POST', headers: { ...headers, authorization: 'Bearer wrong' }, body: '{}',
  }));
  assert.equal(wrong.status, 401);
});

test('path credential reaches the same ordinary database adapter without activating circulation', async () => {
  const savedFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push(String(input).split('/').pop() ?? '');
    assert.equal(new Headers(init?.headers).get('x-ecb-runtime-key'), process.env.ECB_ORDINARY_DB_KEY);
    assert.equal(JSON.parse(String(init?.body)).p_id, '00000000-0000-4000-8000-000000000001');
    return Response.json([]);
  };
  try {
    await useClient('legacy', async client => {
      const result = await client.callTool({
        name: 'fetch', arguments: { id: '00000000-0000-4000-8000-000000000001' },
      });
      assert.equal(result.isError, true); // No Thought exists in the constructed database.
    });
    assert.deepEqual(calls, ['eco140_fetch_thought']);
  } finally {
    globalThis.fetch = savedFetch;
  }
});

test('path access fails closed if circulation is enabled while bearer behavior is preserved', async () => {
  process.env.ECB_CIRCULATION_ENABLED = 'true';
  try {
    assert.equal((await request(key)).status, 401);
    await useClient('legacy', async client => {
      assert.ok((await client.listTools()).tools.length > names.length);
    }, true);
  } finally {
    delete process.env.ECB_CIRCULATION_ENABLED;
  }
});

test('a shared ordinary/worker key is rejected and disabled worker dispatch remains blocked', async () => {
  const savedFetch = globalThis.fetch;
  let dispatched = 0;
  globalThis.fetch = async () => { dispatched++; throw new Error('unexpected dispatch'); };
  process.env.ECB_CIRCULATION_WORKER_KEY = key;
  try {
    assert.equal((await request(key)).status, 401);
    const response = await workerEndpoint.fetch(new Request('http://localhost/api/circulation/run', {
      method: 'POST', headers: { authorization: `Bearer ${key}` },
    }));
    assert.equal(response.status, 503);
    assert.equal(dispatched, 0);
  } finally {
    delete process.env.ECB_CIRCULATION_WORKER_KEY;
    globalThis.fetch = savedFetch;
  }
});

test('a separate worker key never works on the path route or grants the ordinary key worker access', async () => {
  process.env.ECB_CIRCULATION_WORKER_KEY = 'constructed-distinct-worker-key-with-32-bytes';
  try {
    assert.equal((await request(process.env.ECB_CIRCULATION_WORKER_KEY)).status, 401);
    assert.equal((await workerEndpoint.fetch(new Request('http://localhost/api/circulation/run', {
      method: 'POST', headers: { authorization: `Bearer ${key}` },
    }))).status, 401);
    await useClient('legacy', async client => {
      assert.deepEqual((await client.listTools()).tools.map(tool => tool.name), names);
    });
  } finally {
    delete process.env.ECB_CIRCULATION_WORKER_KEY;
  }
});

test('path route preserves Host, Origin, and CORS controls before parsing', async () => {
  assert.equal((await request(key, { host: 'untrusted.example' }, '{')).status, 403);
  assert.equal((await request(key, { origin: 'https://untrusted.example' }, '{')).status, 403);
  const response = await keyedEndpoint.fetch(new Request(address(key), {
    method: 'OPTIONS', headers: { host: 'localhost' },
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
});

test('path route preserves body limits and does not log credentials or the connector address', async () => {
  const logs: string[] = [];
  const savedInfo = console.info;
  const savedError = console.error;
  console.info = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); };
  console.error = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); };
  try {
    assert.equal((await request(key, {}, 'x'.repeat(4 * 1024 * 1024 + 1))).status, 413);
    await useClient('legacy', async client => {
      const result = await client.callTool({ name: 'fetch', arguments: { id: 'invalid-uuid' } });
      assert.equal(result.isError, true);
    });
    const savedGrants = process.env.ECB_MCP_CAPABILITY_GRANTS;
    process.env.ECB_MCP_CAPABILITY_GRANTS = '[{"client_id":"bad"}]';
    try {
      const response = await request(key);
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: 'runtime_configuration_failed' });
    } finally {
      process.env.ECB_MCP_CAPABILITY_GRANTS = savedGrants;
    }
    assert.ok(logs.length > 0);
    assert.ok(logs.every(line => !line.includes(key) && !line.includes('/mcp/k/')));
  } finally {
    console.info = savedInfo;
    console.error = savedError;
  }
});
