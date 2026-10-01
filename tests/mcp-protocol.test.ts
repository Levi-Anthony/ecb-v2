import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import app from '../server.ts';

const key = 'local-mcp-test-key';
process.env.ECB_BRAIN_KEY_SHA256 = createHash('sha256').update(key).digest('hex');
process.env.ECB_ORDINARY_DB_KEY = 'local-db-test-key';
const credential = {
  recover: 'local-recover-key',
  preserve: 'local-preserve-key',
  transition: 'local-transition-key',
  compose: 'local-compose-key',
};
process.env.ECB_MCP_CAPABILITY_GRANTS = JSON.stringify(Object.entries(credential).map(([client_id, token]) => ({
  key_sha256: createHash('sha256').update(token).digest('hex'),
  client_id,
  capabilities: client_id === 'compose' ? ['preserve', 'transition'] : [client_id],
})));

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

async function withClient(mode: 'modern' | 'legacy', callback: (client: Client) => Promise<void>, token = key) {
  const transport = new StreamableHTTPClientTransport(new URL('http://localhost/mcp'), {
    fetch: async (url, init) => await app.fetch(new Request(url, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init?.headers)),
        host: 'localhost',
        authorization: `Bearer ${token}`,
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

const invalidArgs: Record<string, Record<string, unknown>> = {
  fetch: { id: 'invalid' },
  fetch_artifact: { id: 'invalid' },
  search: { query: '' },
  capture_thought: { operation_id: 'invalid', content: 'x', source: 'test' },
  create_artifact: { operation_id: 'invalid', content: 'x' },
  set_thought_disposition: { operation_id: 'invalid' },
};

for (const mode of ['modern', 'legacy'] as const) {
  test(`${mode} capability grants gate each tool before input validation or database dispatch`, async () => {
    const allowedByCredential: Record<string, string[]> = {
      recover: ['fetch', 'fetch_artifact', 'search'],
      preserve: ['capture_thought', 'create_artifact'],
      transition: ['set_thought_disposition'],
      compose: ['capture_thought', 'create_artifact', 'set_thought_disposition'],
    };
    for (const [principal, allowedNames] of Object.entries(allowedByCredential)) {
      await withClient(mode, async (client) => {
        assert.deepEqual((await client.listTools()).tools.map((tool) => tool.name), names);
        for (const name of names) {
          const call = () => client.callTool({ name, arguments: invalidArgs[name] });
          if (allowedNames.includes(name)) {
            const response = await call();
            assert.equal(response.isError, true, `${principal} should reach ${name} validation`);
          } else {
            await assert.rejects(call, /403|insufficient[_ ]scope/i, `${principal} must be denied ${name}`);
          }
        }
      }, credential[principal as keyof typeof credential]);
    }
  });
}

test('allowed recovery dispatches while denied preservation consumes no operation', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ name: string; body: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ name: String(input).split('/').pop() ?? '', body: JSON.parse(String(init?.body)) });
    return new Response('[]', { status: 200 });
  };
  try {
    await withClient('modern', async (client) => {
      const id = '00000000-0000-4000-8000-000000000001';
      const recovered = await client.callTool({ name: 'fetch', arguments: { id } });
      assert.equal(recovered.isError, true); // The mock Brain has no such Thought.
      assert.deepEqual(calls, [{ name: 'eco140_fetch_thought', body: { p_id: id, p_model_id: 'gte-small' } }]);
      await assert.rejects(
        () => client.callTool({ name: 'create_artifact', arguments: { operation_id: id, content: 'not created' } }),
        /403|insufficient[_ ]scope/i,
      );
      assert.equal(calls.length, 1);
    }, credential.recover);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('compatibility credential retains the full ordinary catalog and invocation access', async () => {
  await withClient('modern', async (client) => {
    for (const name of names) {
      const response = await client.callTool({ name, arguments: invalidArgs[name] });
      assert.equal(response.isError, true, `${name} must reach schema validation`);
    }
  });
});

test('absent capability grants preserve compatibility, reject unconfigured bearers, replay operation identity, and retain currentness', async () => {
  const previous = process.env.ECB_MCP_CAPABILITY_GRANTS;
  const originalFetch = globalThis.fetch;
  const artifactId = '00000000-0000-4000-8000-000000000020';
  const preserveId = '00000000-0000-4000-8000-000000000021';
  const transitionId = '00000000-0000-4000-8000-000000000022';
  const predecessor = '00000000-0000-4000-8000-000000000023';
  const thoughtId = '00000000-0000-4000-8000-000000000024';
  const calls: Array<{ name: string; body: Record<string, unknown> }> = [];
  delete process.env.ECB_MCP_CAPABILITY_GRANTS;
  globalThis.fetch = async (input, init) => {
    const name = String(input).split('/').pop() ?? '';
    const body = JSON.parse(String(init?.body));
    calls.push({ name, body });
    if (name === 'ecb12_create_artifact') {
      const replayed = calls.filter((call) => call.name === name).length > 1;
      return Response.json([{
        operation_id: preserveId, artifact_id: artifactId, content: 'dormant-compatible',
        registered_at: '2026-09-29T00:00:00Z', replayed,
      }]);
    }
    if (name === 'eco140_set_thought_disposition') {
      return new Response('eco138_disposition_predecessor_conflict', { status: 409 });
    }
    throw new Error(`unexpected RPC ${name}`);
  };
  try {
    const unconfigured = await request('{}', { authorization: `Bearer ${credential.recover}` });
    assert.equal(unconfigured.status, 401);

    await withClient('modern', async (client) => {
      assert.deepEqual((await client.listTools()).tools.map((tool) => tool.name), names);
      for (const name of names) {
        const response = await client.callTool({ name, arguments: invalidArgs[name] });
        assert.equal(response.isError, true, `${name} must retain compatibility access with grants absent`);
      }

      const createArgs = { operation_id: preserveId, content: 'dormant-compatible' };
      const first = await client.callTool({ name: 'create_artifact', arguments: createArgs });
      const replay = await client.callTool({ name: 'create_artifact', arguments: createArgs });
      assert.equal(first.isError, undefined);
      assert.equal(replay.isError, undefined);

      const transitioned = await client.callTool({ name: 'set_thought_disposition', arguments: {
        operation_id: transitionId, thought_id: thoughtId, expected_revision_id: predecessor,
        disposition: 'ready', projection_artifact_id: artifactId, projection_kind: 'ACTION',
      } });
      assert.equal(transitioned.isError, true);
      assert.match(
        transitioned.content[0]?.type === 'text' ? transitioned.content[0].text : '',
        /disposition_conflict/,
      );
    });

    assert.deepEqual(
      calls.map((call) => call.name),
      ['ecb12_create_artifact', 'ecb12_create_artifact', 'eco140_set_thought_disposition'],
    );
    assert.equal(calls[0].body.p_operation_id, preserveId);
    assert.equal(calls[1].body.p_operation_id, preserveId);
    assert.equal(calls[2].body.p_operation_id, transitionId);
    assert.equal(calls[2].body.p_expected_revision_id, predecessor);
    assert.equal(calls[2].body.p_projection_artifact_id, artifactId);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.ECB_MCP_CAPABILITY_GRANTS;
    else process.env.ECB_MCP_CAPABILITY_GRANTS = previous;
  }
});

test('a composed preservation then transition uses distinct operation identities and still enforces currentness', async () => {
  const originalFetch = globalThis.fetch;
  const artifactId = '00000000-0000-4000-8000-000000000010';
  const preserveId = '00000000-0000-4000-8000-000000000011';
  const transitionId = '00000000-0000-4000-8000-000000000012';
  const predecessor = '00000000-0000-4000-8000-000000000013';
  const thoughtId = '00000000-0000-4000-8000-000000000014';
  const calls: Array<{ name: string; body: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const name = String(input).split('/').pop() ?? '';
    const body = JSON.parse(String(init?.body));
    calls.push({ name, body });
    if (name === 'ecb12_create_artifact') {
      return Response.json([{ operation_id: preserveId, artifact_id: artifactId, content: 'shaped',
        registered_at: '2026-09-27T00:00:00Z', replayed: false }]);
    }
    if (name === 'eco140_set_thought_disposition') {
      return new Response('eco138_disposition_predecessor_conflict', { status: 409 });
    }
    throw new Error(`unexpected RPC ${name}`);
  };
  try {
    await withClient('modern', async (client) => {
      const created = await client.callTool({ name: 'create_artifact', arguments: {
        operation_id: preserveId, content: 'shaped',
      } });
      assert.equal(created.isError, undefined);
      const transitioned = await client.callTool({ name: 'set_thought_disposition', arguments: {
        operation_id: transitionId, thought_id: thoughtId, expected_revision_id: predecessor,
        disposition: 'ready', projection_artifact_id: artifactId, projection_kind: 'ACTION',
      } });
      assert.equal(transitioned.isError, true);
      assert.match(transitioned.content[0]?.type === 'text' ? transitioned.content[0].text : '', /disposition_conflict/);
    }, credential.compose);
    assert.deepEqual(calls.map((call) => call.name), ['ecb12_create_artifact', 'eco140_set_thought_disposition']);
    assert.equal(calls[0].body.p_operation_id, preserveId);
    assert.equal(calls[1].body.p_operation_id, transitionId);
    assert.equal(calls[1].body.p_expected_revision_id, predecessor);
    assert.equal(calls[1].body.p_projection_artifact_id, artifactId);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('bad capability configuration fails closed before dispatch', async () => {
  const previous = process.env.ECB_MCP_CAPABILITY_GRANTS;
  process.env.ECB_MCP_CAPABILITY_GRANTS = '[{"client_id":"bad"}]';
  try {
    const response = await request('{}');
    assert.equal(response.status, 503);
  } finally {
    process.env.ECB_MCP_CAPABILITY_GRANTS = previous;
  }
});

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
