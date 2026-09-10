// Exact reader: no candidate selection by timestamp, search rank, prose or model memory.
import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
export async function recover(db, scope, observation = null) {
  return db.begin("isolation level repeatable read read only", async (tx) => {
    const [s] =
      await tx`select id::text,focal::text,contract::text,current_event::text from ecb7.scopes where id=${scope}::uuid`;
    if (!s) return { status: "unknown_scope" };
    const rows =
      await tx`select id::text,context_id::text,payload_text,encode(payload_digest,'hex') as digest,artifact_role from public.artifacts where artifact_role='b7_designation' and payload_text::jsonb->>'scope'=${scope}`;
    const byId = new Map(rows.map((x) => [x.id, x]));
    const chain = [];
    let current = s.current_event;
    while (current) {
      if (chain.includes(current) || !byId.has(current)) {
        return { status: "conflicting_history" };
      }
      chain.push(current);
      current = JSON.parse(byId.get(current).payload_text).predecessor;
    }
    if (chain.length !== rows.length) return { status: "conflicting_history" };
    if (!s.current_event) {
      return {
        status: "no_designation",
        scope: s,
        qualified_is_not_designated: true,
      };
    }
    const retained = {};
    async function read(id, role) {
      if (retained[id]) return JSON.parse(retained[id].payload_text);
      const [r] =
        await tx`select id::text,context_id::text,artifact_role,payload_text,encode(payload_digest,'hex') as digest from public.artifacts where id=${id}::uuid`;
      if (!r) throw Error(`exact_payload_unavailable:${id}`);
      if (role && r.artifact_role !== role) throw Error(`wrong_role:${id}`);
      if (
        createHash("sha256").update(r.payload_text).digest("hex") !== r.digest
      ) throw Error(`integrity_mismatch:${id}`);
      retained[id] = r;
      return JSON.parse(r.payload_text);
    }
    try {
      const event = await read(s.current_event, "b7_designation");
      const request = await read(
        byId.get(s.current_event).context_id,
        "b7_attempt",
      );
      const expression = await read(event.candidate, "b7_candidate");
      const qualification = await read(event.evaluation, "b7_evaluation");
      await read(qualification.attempt, "b7_attempt");
      const grant = await read(event.grant, "b7_grant");
      await read(event.observation, "b7_observation");
      const grammar = await read(expression.grammar, "b7_grammar");
      const contract = await read(expression.contract, "b7_contract");
      for (const id of expression.snapshots) await read(id, "b7_snapshot");
      for (const id of grammar.interpretation_sources ?? []) {
        await read(id, "b7_snapshot");
      }
      const claims = [];
      for (const mapping of expression.mappings) {
        const [r] =
          await tx`select * from public.claims where id=${mapping.claim}::uuid`;
        if (!r) throw Error("exact_claim_unavailable");
        claims.push(r);
      }
      if (
        !isDeepStrictEqual(qualification.basis, expression) ||
        qualification.candidate !== event.candidate ||
        qualification.outcome !== "PASS" || event.scope !== scope ||
        expression.focal !== s.focal || request.candidate !== event.candidate
      ) throw Error("binding_mismatch");
      let reliance = {
        applicable: false,
        gaps: [{ reason: "observation_unavailable" }],
      };
      if (observation) {
        const obs = await read(observation, "b7_observation");
        if (retained[observation].context_id !== scope) {
          throw Error("observation_scope");
        }
        const [a] = await tx`select ecb7.applicability(${
          tx.json(expression)
        },${observation}::uuid) as value`;
        reliance = a.value;
        if (
          grant.temporal.continuing_effect === "unrevoked" &&
          (!Array.isArray(obs.revoked_grants) ||
            obs.revoked_grants.includes(event.grant))
        ) {
          reliance.applicable = false;
          reliance.gaps.push({ reason: "continuing_authority_condition" });
        }
      }
      for (const gap of reliance.gaps) {
        gap.comparisons = contract.comparisons.filter((cmp) =>
          !gap.dependency || !expression.snapshots.includes(gap.dependency) ||
          grammar.aliases[cmp.token]?.snapshot === gap.dependency
        ).map((cmp) => cmp.id);
      }
      const affected = new Set(reliance.gaps.flatMap((gap) => gap.comparisons));
      reliance.constrained_comparisons = [...affected];
      reliance.unaffected_comparisons = contract.comparisons.filter((cmp) =>
        !affected.has(cmp.id)
      ).map((cmp) => cmp.id);
      return {
        status: event.operation === "withdraw"
          ? "selection_withdrawn"
          : reliance.applicable
          ? "recovered"
          : "requalification_required",
        scope: s,
        event,
        grant,
        expression,
        qualification,
        grammar,
        contract,
        claims,
        retained,
        history: rows,
        chain,
        reliance,
        current_selection: event.operation === "select"
          ? event.candidate
          : null,
        historical_designation: s.current_event,
        execution_authorized: false,
        routes: {
          confirmation: "append C4 observation and C2 attempt/result",
          constrained_reliance:
            "restrict named comparisons in gaps; preserve expression",
          replacement:
            "C1 new expression/basis → C2 → separately authorized C3",
        },
        limitations: [
          "declared_observations_only",
          "no_model_internal_claim",
          "trusted_storage_and_method_custody",
        ],
      };
    } catch (e) {
      return { status: "incomplete", scope: s, reason: e.message, retained };
    }
  });
}
