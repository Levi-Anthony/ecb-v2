// R6: literal read-only cold reconstruction. No fixture imports, expected output,
// producer status, network target, or latest-record substitution supplies facts.
import { createHash } from "node:crypto";
import { isDeepStrictEqual as equal } from "node:util";
const hash = (s) => createHash("sha256").update(s).digest("hex");
export async function recover(db, scope, action) {
  const [result] =
    await db`select ecb8.inspect(${scope}::uuid,${action}::uuid) x`;
  const raw = result.x;
  if (!raw.history) return raw;
  const retained = {},
    ordered = [],
    effects = [],
    acks = [],
    starts = {},
    admissions = {},
    terminals = {},
    authorizations = {};
  let value = 0,
    revision = 0,
    ready = true,
    tick = 10,
    selected = null,
    head = null,
    selectionHead = null;
  const revoked = new Set(), withdrawn = new Set();
  try {
    const rows = new Map(raw.retained.map((r) => [r.id, r]));
    function read(id, role) {
      const r = rows.get(id);
      if (!r) throw Error(`missing_exact_payload:${id}`);
      if (role && r.role !== role) throw Error(`wrong_role:${id}`);
      if (hash(r.bytes) !== r.digest) throw Error(`digest_mismatch:${id}`);
      retained[id] = r;
      return JSON.parse(r.bytes);
    }
    const initials = raw.retained.filter((r) =>
      r.role === "b8_basis" && JSON.parse(r.bytes).kind === "target_initial" &&
      JSON.parse(r.bytes).action === action
    );
    if (initials.length !== 1) throw Error("initial_history_gap");
    const initial = read(initials[0].id, "b8_basis");
    if (initial.scope !== scope || initial.action !== action) {
      throw Error("locator_mismatch");
    }
    const dependencies = { ...initial.dependencies };
    // All exact candidates/results are recoverable, including rejected proposals.
    for (
      const r of raw.retained.filter((r) =>
        r.context === scope && r.role !== "b8_event"
      )
    ) read(r.id, r.role);
    function closure(id) {
      const c = read(id, "b8_envelope"), ct = read(c.contract, "b8_basis");
      if (
        c.scope !== scope || c.action !== action || ct.scope !== scope ||
        ct.action !== action || ct.kind !== "contract"
      ) throw Error("closure_locator");
      read(ct.initial, "b8_basis");
      if (hash(ct.method_definition) !== ct.method || c.method !== ct.method) {
        throw Error("method_binding");
      }
      const required = [...Object.keys(ct.required), c.contract].sort();
      if (!equal(Object.keys(c.dependencies).sort(), required)) {
        throw Error("manifest_coverage");
      }
      for (const dep of required) {
        const pin = c.dependencies[dep],
          want = dep === c.contract ? "b8_basis" : ct.required[dep].role;
        read(dep, want);
        if (pin.role !== want || pin.digest !== rows.get(dep).digest) {
          throw Error(`dependency_binding:${dep}`);
        }
      }
      const key = read(c.orientation.key, "b7_candidate"),
        q7 = read(c.orientation.evaluation, "b7_evaluation"),
        d7 = read(c.orientation.designation, "b7_designation");
      if (
        q7.candidate !== c.orientation.key || q7.outcome !== "PASS" ||
        !equal(q7.basis, key) || d7.candidate !== c.orientation.key ||
        d7.evaluation !== c.orientation.evaluation || d7.operation !== "select"
      ) throw Error("orientation_binding");
      read(q7.attempt, "b7_attempt");
      read(d7.grant, "b7_grant");
      read(d7.observation, "b7_observation");
      return { c, ct };
    }
    const events = raw.retained.filter((r) =>
      r.role === "b8_event" && r.context === scope &&
      JSON.parse(r.bytes).action === action
    );
    const seen = new Set();
    while (seen.size < events.length) {
      const next = events.filter((r) =>
        JSON.parse(r.bytes).predecessor === head
      );
      if (next.length !== 1 || seen.has(next[0].id)) {
        throw Error("broken_fork_cycle_history");
      }
      const row = next[0], e = read(row.id, "b8_event"), d = e.data;
      seen.add(row.id);
      if (
        e.scope !== scope || e.action !== action ||
        initial.principals[e.login] !== e.participant
      ) throw Error("event_binding");
      if (ordered.some((x) => x.request === e.request)) {
        throw Error("request_fork");
      }
      switch (e.kind) {
        case "tick":
          if (!Number.isInteger(d.tick) || d.tick <= tick) {
            throw Error("tick_order");
          }
          tick = d.tick;
          break;
        case "ready":
          if (typeof d.ready !== "boolean" || d.ready === ready) {
            throw Error("target_revision");
          }
          ready = d.ready;
          revision++;
          break;
        case "dependency":
          dependencies[d.source] = d.revision;
          break;
        case "revoke_grant":
          revoked.add(d.grant);
          break;
        case "withdraw":
          withdrawn.add(d.authorization);
          selected = null;
          selectionHead = row.id;
          break;
        case "authorize": {
          const au = d.authorization,
            { c, ct } = closure(au.envelope),
            q = read(au.evaluation, "b8_evaluation"),
            g = read(au.grant, "b8_basis");
          const eligible = q.outcome === "PASS" && q.envelope === au.envelope &&
            q.method === c.method && q.contract === c.contract &&
            q.findings.every((x) => x.status === "PASS");
          const grantValid = g.kind === "grant" && g.issuer === "A_TEST" &&
            g.login === e.login && g.actor === e.participant &&
            g.scope === scope && g.action === action &&
            g.target === c.target && g.envelope === au.envelope &&
            g.evaluation === au.evaluation && g.predecessor === selectionHead &&
            equal(g.temporal, c.temporal);
          const selectedValid = d.designation.envelope === au.envelope &&
            d.designation.predecessor === selectionHead;
          const legitimate = eligible && grantValid && selectedValid &&
            tick >= 10 && tick < 12 && !revoked.has(au.grant);
          authorizations[row.id] = {
            ...au,
            eligible,
            grantValid,
            selectedValid,
            legitimate,
            issued_tick: tick,
          };
          selected = row.id;
          selectionHead = row.id;
          break;
        }
        case "admit": {
          const au = authorizations[d.authorization];
          if (!au) throw Error("admission_authorization_gap");
          const { c } = closure(d.envelope);
          admissions[row.id] = {
            ...d,
            legitimate: au.legitimate && selected === d.authorization &&
              tick >= 10 && tick < 20 && !revoked.has(d.grant) &&
              value === c.from_value && revision === c.target_revision &&
              ready &&
              d.observation.orientation === c.orientation.designation &&
              Object.entries(c.dependencies).every(([id, p]) =>
                dependencies[id] === p.revision
              ),
            xid: row.xid,
          };
          break;
        }
        case "start":
          if (
            !admissions[d.admission] ||
            Object.entries(starts).some(([id, st]) =>
              !terminals[id] || st.admission === d.admission
            )
          ) throw Error("start_gap_or_conflict");
          starts[row.id] = { ...d, xid: row.xid };
          break;
        case "fence":
          if (!starts[d.start] || terminals[d.start] || effects.length) {
            throw Error("terminal_conflict");
          }
          terminals[d.start] = { id: row.id, kind: "fence" };
          break;
        case "effect": {
          if (
            d.target !== initial.target || d.operation !== "advance_one" ||
            d.delta !== 1
          ) throw Error("native_history_gap");
          if (terminals[d.start]) throw Error("terminal_conflict");
          const st = starts[d.start], ad = st && admissions[st.admission];
          let legitimate = false;
          if (ad) {
            const { c } = closure(ad.envelope);
            legitimate = ad.legitimate && selected === ad.authorization &&
              !revoked.has(ad.grant) && !withdrawn.has(ad.authorization) &&
              e.participant === c.actor && e.login === initial.actor_login &&
              value === c.from_value && revision === c.target_revision &&
              ready && tick < 30 && !effects.length &&
              d.observation.tick === tick && d.observation.value === value &&
              d.observation.revision === revision &&
              d.observation.orientation === c.orientation.designation &&
              Object.entries(c.dependencies).every(([id, p]) =>
                dependencies[id] === p.revision
              ) && st.xid !== row.xid;
          }
          // Native operation establishes effect even if authorization is absent.
          value++;
          revision++;
          effects.push({
            id: row.id,
            start: d.start,
            legitimate,
            observed_native_effect: 1,
          });
          if (st) terminals[d.start] = { id: row.id, kind: "effect" };
          break;
        }
        case "ack":
          acks.push({ id: row.id, ...d });
          break;
        default:
          throw Error("unknown_event_subtype");
      }
      head = row.id;
      ordered.push({ id: row.id, ...e });
    }
    const unfinished = Object.keys(starts).filter((id) => !terminals[id]);
    let present = { applicable: false, gaps: ["no_selected_authorization"] };
    if (selected) {
      const au = authorizations[selected],
        { c } = closure(au.envelope),
        gaps = [];
      if (revoked.has(au.grant) || withdrawn.has(selected)) {
        gaps.push("revoked");
      }
      if (raw.history.selected?.id !== selected) {
        throw Error("observer_selection_disagreement");
      }
      // Current pointer observation is supplied by the locked database read, not a
      // caller's expectation. Historical legitimacy above is not rewritten.
      if (
        raw.current_orientation !== undefined &&
        raw.current_orientation !== c.orientation.designation
      ) gaps.push("orientation_selection");
      for (const [id, p] of Object.entries(c.dependencies)) {
        if (dependencies[id] !== p.revision) gaps.push(`dependency:${id}`);
      }
      if (tick >= 30) gaps.push("effect_deadline");
      if (value !== c.from_value || revision !== c.target_revision || !ready) {
        gaps.push("target_state");
      }
      present = { applicable: !gaps.length, gaps };
    }
    if (
      value !== raw.history.value || revision !== raw.history.revision ||
      effects.length !== raw.history.effects.length || head !== raw.history.head
    ) throw Error("native_observer_disagreement");
    return {
      status: effects.length
        ? "EFFECT_ESTABLISHED"
        : unfinished.length
        ? "RECONCILE_REQUIRED"
        : "NO_EFFECT_ESTABLISHED",
      scope,
      action,
      target: initial.target,
      native: { value, revision, ready, effect_count: effects.length },
      tick,
      head,
      selected,
      authorizations,
      admissions,
      starts,
      terminals,
      effects,
      acks,
      unfinished,
      legitimate: effects.every((e) => e.legitimate),
      present,
      retry: effects.length || unfinished.length
        ? "HOLD"
        : "FRESH_ADMISSION_REQUIRED",
      entitlement: {
        remaining_occurrences: Math.max(0, 1 - effects.length),
        may_dispatch_from_recovery: false,
        fresh_admission_possible: present.applicable && tick >= 10 &&
          tick < 20 && !effects.length && !unfinished.length,
      },
      retained,
      ordered,
      boundary: raw.boundary,
      proof_class: "atomic-ledger synthetic target only",
      limits: [
        "trusted custody and retained observation boundary",
        "same-worker implementation and testing",
      ],
    };
  } catch (e) {
    return {
      status: "UNKNOWN",
      retry: "HOLD",
      reason: e.message,
      retained,
      observed_effects: effects,
    };
  }
}
