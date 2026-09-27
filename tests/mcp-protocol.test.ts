import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import app from '../server.ts';

const key = 'local-mcp-test-key';
process.env.ECB_BRAIN_KEY_SHA256 = createHash('sha256').update(key).digest('hex');

const names = [
  'capture_thought', 'search', 'fetch', 'set_thought_disposition',
  'create_artifact', 'fetch_artifact',
];

function request(body: string, headers: Record<string, string> = {}) {
  return app.request('http://localhost/mcp', {
    method: 'POST',
    headers: {
      host: 'localhost',
      authorization: `Bearer ${key}`,
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers,
    },
    body,
  });
}

async function withClient(mode: 'modern' | 'legacy', callback: (client: Client) => Promise<void>) {
  const transport = new StreamableHTTPClientTransport(new URL('http://localhost/mcp'), {
    fetch: async (url, init) => await app.fetch(new Request(url, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init?.headers)),
        host: 'localhost',
        authorization: `Bearer ${key}`,
      },
    })),
  });
  const client = new Client(
    { name: 'ecb-mcp-regression', version: '1.0.0' },
    mode === 'modern' ? { versionNegotiation: { mode: { pin: '2026-07-28' } } } : {},
  );
  try {
    await client.connect(transport);
    assert.equal(client.getProtocolEra(), mode);
    await callback(client);
  } finally {
    await client.close();
  }
}

for (const mode of ['modern', 'legacy'] as const) {
  test(`${mode} client retains the six existing tool contracts`, async () => {
    await withClient(mode, async (client) => {
      const tools = (await client.listTools()).tools;
      assert.deepEqual(tools.map((tool) => tool.name), names);
      assert.equal(tools.find((tool) => tool.name === 'search')?.annotations?.readOnlyHint, false);
      assert.equal(tools.find((tool) => tool.name === 'fetch')?.annotations?.readOnlyHint, true);
      assert.deepEqual(
        tools.filter((tool) => tool.annotations?.idempotentHint).map((tool) => tool.name),
        ['capture_thought', 'set_thought_disposition', 'create_artifact'],
      );
      assert.ok(tools.find((tool) => tool.name === 'capture_thought')?.inputSchema.required?.includes('operation_id'));
      assert.ok(tools.find((tool) => tool.name === 'set_thought_disposition')?.inputSchema.required?.includes('expected_revision_id'));
      assert.ok(tools.find((tool) => tool.name === 'create_artifact')?.inputSchema.required?.includes('operation_id'));

      // Invalid input must remain a visible tool error and never reach the database.
      const invalid = await client.callTool({ name: 'fetch', arguments: { id: 'invalid-uuid' } });
      assert.equal(invalid.isError, true);
      assert.match(invalid.content[0]?.type === 'text' ? invalid.content[0].text : '', /Invalid UUID/);
    });
  });
}

test('host and origin are checked before parsing or authorization', async () => {
  const badHost = await request('{', { host: 'untrusted.example' });
  assert.equal(badHost.status, 403);
  const badOrigin = await request('{', { origin: 'https://untrusted.example' });
  assert.equal(badOrigin.status, 403);
  const badPreflight = await app.request('http://localhost/mcp', {
    method: 'OPTIONS', headers: { host: 'localhost', origin: 'https://untrusted.example' },
  });
  assert.equal(badPreflight.status, 403);
  const unauthorized = await request('{}', { authorization: 'Bearer wrong-key' });
  assert.equal(unauthorized.status, 401);
});

test('oversized bodies and JSON-RPC batches are rejected before dispatch', async () => {
  const oversized = await request('x'.repeat(4 * 1024 * 1024 + 1));
  assert.equal(oversized.status, 413);

  const batch = Array.from({ length: 101 }, (_, index) => ({
    jsonrpc: '2.0', id: index + 1, method: 'ping', params: {},
  }));
  const response = await request(JSON.stringify(batch));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, -32600);
});
