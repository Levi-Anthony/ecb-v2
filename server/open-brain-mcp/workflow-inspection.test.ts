import { assert, assertEquals } from "jsr:@std/assert@1.0.14";
import { type BrainRuntime, createMcpApp } from "./index.ts";
import {
  createWorkflowReader,
  workflowContract,
} from "./workflow-inspection.ts";
const root = "40ca3bbd-c905-4ec5-b202-bfb49fcd6605";
const child = "e6840c97-41ba-4978-880d-86573c2fbc9c";
const runtime: BrainRuntime = {
  capture() {
    throw new Error("unexpected write");
  },
  search() {
    throw new Error("unexpected representation repair");
  },
  fetch() {
    throw new Error("unexpected thought read");
  },
};
async function call(
  app: ReturnType<typeof createMcpApp>,
  name: string,
  args = {},
  key: string | null = "test-key",
) {
  const response = await app.request("http://localhost/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(key === null ? {} : { authorization: `Bearer ${key}` }),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: name === "tools/list" ? name : "tools/call",
      params: name === "tools/list" ? {} : { name, arguments: args },
    }),
  });
  const text = await response.text();
  const line = text.startsWith("{")
    ? text
    : text.split("\n").find((x) => x.startsWith("data: "))?.slice(6);
  return { status: response.status, body: line ? JSON.parse(line) : null };
}
Deno.test("workflow discovery is read-only, optional UUID, no command and same contract", async () => {
  const app = createMcpApp({ accessKey: "test-key", runtime });
  const { body } = await call(app, "tools/list");
  assert(
    !body.result.tools.some((x: { name: string }) =>
      x.name === "workflow_command"
    ),
  );
  const tool = body.result.tools.find((x: { name: string }) =>
    x.name === "workflow_inspect"
  );
  assert(tool.description.includes(workflowContract));
  assertEquals(tool.annotations, {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  });
  assertEquals(tool.inputSchema.properties.cycle_id.format, "uuid");
  assertEquals(tool.inputSchema.required ?? [], []);
});
Deno.test("root/default/child reads use only guarded RPC; repeated calls return fresh snapshot", async () => {
  const calls: unknown[] = [];
  let version = 8;
  const workflow = createWorkflowReader(async (name, args) => {
    calls.push({ name, args });
    return {
      data: {
        contract: workflowContract,
        cycle: { id: args.p_cycle_id, version: version++ },
        debt: [{ requirement: "actual use" }],
        zero_balance: false,
        monitor: { health: "UNKNOWN" },
      },
      error: null,
    };
  });
  const app = createMcpApp({ accessKey: "test-key", runtime, workflow });
  for (const cycle of [undefined, root, child, root]) {
    const { body } = await call(
      app,
      "workflow_inspect",
      cycle ? { cycle_id: cycle } : {},
    );
    assertEquals(body.result.isError, undefined);
    const snapshot = JSON.parse(body.result.content[0].text);
    assertEquals(snapshot.cycle.version, 7 + calls.length);
    assertEquals(snapshot.zero_balance, false);
    assertEquals(snapshot.monitor.health, "UNKNOWN");
  }
  assertEquals(
    calls,
    [undefined, root, child, root].map((cycle) => ({
      name: "ecb_workflow_inspect",
      args: { p_cycle_id: cycle ?? null },
    })),
  );
});
Deno.test("missing/wrong bearer and malformed UUID cannot reach the database", async () => {
  let reads = 0;
  const workflow = createWorkflowReader(async () => {
    reads++;
    return { data: {}, error: null };
  });
  const app = createMcpApp({ accessKey: "test-key", runtime, workflow });
  for (const key of [null, "wrong-key"]) {
    assertEquals((await call(app, "workflow_inspect", {}, key)).status, 401);
  }
  const invalid = await call(app, "workflow_inspect", {
    cycle_id: "root;drop table cycles",
  });
  assert(invalid.body.error || invalid.body.result?.isError);
  assertEquals(reads, 0);
  try {
    await workflow.inspect("not-a-uuid");
    throw new Error("accepted invalid identity");
  } catch (error) {
    assertEquals((error as Error).message, "workflow_invalid_cycle_id");
  }
  assertEquals(reads, 0);
});
Deno.test("unconfigured recovery, denied/missing RPC, transport failure sanitize without fallback", async () => {
  const missing = createMcpApp({ accessKey: "test-key", runtime });
  assertEquals(
    JSON.parse(
      (await call(missing, "workflow_inspect")).body.result.content[0].text,
    ).error,
    "workflow_recover_denied",
  );
  for (const scenario of ["denied", "missing", "transport", "null"]) {
    let reads = 0;
    const workflow = createWorkflowReader(async () => {
      reads++;
      if (scenario === "transport") {
        throw new Error("workflow_secret_value SQL x-ecb-runtime-key=secret");
      }
      return {
        data: null,
        error: scenario === "null" ? null : {
          code: scenario === "denied" ? "42501" : "PGRST202",
          message: "secret SQL",
        },
      };
    });
    const { body } = await call(
      createMcpApp({ accessKey: "test-key", runtime, workflow }),
      "workflow_inspect",
      { cycle_id: root },
    );
    assertEquals(body.result.isError, true);
    const output = JSON.parse(body.result.content[0].text);
    assertEquals(output.error, "workflow_unavailable");
    assert(!JSON.stringify(output).includes("secret"));
    assertEquals(reads, 1);
  }
});

Deno.test("UUID nil/max share the Node schema boundary and reach the guarded facade", async () => {
  const calls: unknown[] = [];
  const workflow = createWorkflowReader(async (_name, args) => {
    calls.push(args.p_cycle_id);
    return { data: null, error: { code: "P0002" } };
  });
  const app = createMcpApp({ accessKey: "test-key", runtime, workflow });
  for (
    const cycle_id of [
      "00000000-0000-0000-0000-000000000000",
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
    ]
  ) {
    const { body } = await call(app, "workflow_inspect", { cycle_id });
    assertEquals(
      JSON.parse(body.result.content[0].text).error,
      "workflow_unavailable",
    );
  }
  assertEquals(calls.length, 2);
});
