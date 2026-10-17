import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.14";
import {
  type CommissionAnchor,
  commissionDigest,
  type CommissionPorts,
  getCurrentCommission,
} from "./current-commission.ts";
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
async function fixture() {
  const source = { id: id(1), content: "Edition: test/1\nCommission source\n" };
  const projection = {
    contract: "ecos:current-commission:1.0.0",
    source: {
      artifact_id: source.id,
      sha256: await commissionDigest(source.content),
      edition: "test/1",
    },
    authority_refs: [id(2)],
    standing: "PRINCIPAL_DIRECTED_DISTRIBUTION",
    summary: "Decisions",
    next_action: "Recover then act within authorization",
    limitations: "No authority granted",
  };
  const anchor: CommissionAnchor = {
    id: id(3),
    disposition: { revision_id: id(4), state: "current_commission" },
    projection: {
      artifact_id: id(5),
      kind: "ACTION",
      content: JSON.stringify(projection),
    },
  };
  const calls: string[] = [];
  const ports: CommissionPorts = {
    fetchThought: async () => {
      calls.push("thought");
      return structuredClone(anchor);
    },
    fetchArtifact: async () => {
      calls.push("artifact");
      return structuredClone(source);
    },
  };
  return { source, anchor, ports, calls, projection };
}
Deno.test("commission reads exact source and revalidates head on every recovery", async () => {
  const f = await fixture();
  const a = await getCurrentCommission(f.anchor.id, f.ports);
  assertEquals(a.source_content, f.source.content);
  assertEquals(a.source.sha256, await commissionDigest(f.source.content));
  assertEquals(await getCurrentCommission(f.anchor.id, f.ports), a);
  assertEquals(f.calls, [
    "thought",
    "artifact",
    "thought",
    "thought",
    "artifact",
    "thought",
  ]);
});
Deno.test("commission rejects missing configuration and unavailable reads", async () => {
  const f = await fixture();
  await assertRejects(
    () => getCurrentCommission(undefined, f.ports),
    Error,
    "commission_anchor_unconfigured",
  );
  await assertRejects(
    () =>
      getCurrentCommission(f.anchor.id, {
        ...f.ports,
        fetchThought: async () => null,
      }),
    Error,
    "commission_head_unqualified",
  );
  await assertRejects(
    () =>
      getCurrentCommission(f.anchor.id, {
        ...f.ports,
        fetchArtifact: async () => {
          throw Error();
        },
      }),
    Error,
    "commission_source_unavailable",
  );
});
Deno.test("commission rejects source tampering, false edition and noncurrent projection", async () => {
  const f = await fixture();
  f.source.content += "tampered";
  await assertRejects(
    () => getCurrentCommission(f.anchor.id, f.ports),
    Error,
    "commission_source_binding_mismatch",
  );
  f.projection.source.sha256 = await commissionDigest(f.source.content);
  f.projection.source.edition = "test/2";
  f.anchor.projection.content = JSON.stringify(f.projection);
  await assertRejects(
    () => getCurrentCommission(f.anchor.id, f.ports),
    Error,
    "commission_source_binding_mismatch",
  );
  f.anchor.disposition.state = "superseded";
  await assertRejects(
    () => getCurrentCommission(f.anchor.id, f.ports),
    Error,
    "commission_head_unqualified",
  );
});
Deno.test("commission rejects changed revision, projection identity and bytes at exit", async () => {
  for (
    const mutate of [
      (a: CommissionAnchor) => a.disposition.revision_id = id(8),
      (a: CommissionAnchor) => a.projection.artifact_id = id(9),
      (a: CommissionAnchor) => a.projection.content += " ",
    ]
  ) {
    const f = await fixture();
    let reads = 0;
    await assertRejects(
      () =>
        getCurrentCommission(f.anchor.id, {
          ...f.ports,
          fetchThought: async () => {
            const a = structuredClone(f.anchor);
            if (++reads === 2) mutate(a);
            return a;
          },
        }),
      Error,
      "commission_head_changed",
    );
  }
});
