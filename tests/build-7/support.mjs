import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  capacities,
  doc,
  method,
  obligations,
  qualify,
} from "../../server/build-7/qualification.mjs";
export { capacities, doc, method, obligations, qualify };
export const uuid = randomUUID;
export const url = (u) => `postgres://${u}@127.0.0.1:55440/build7`;
export const connect = (u) =>
  postgres(url(u), {
    max: 1,
    onnotice: () => {},
    prepare: false,
    connection: u === "b7_producer" ? { role: "service_role" } : {},
  });
export const admin = connect("postgres"),
  producer = connect("b7_producer"),
  evaluator = connect("b7_evaluator"),
  executor = connect("b7_actor");
export const close = () =>
  Promise.all([admin, producer, evaluator, executor].map((x) => x.end()));
export const copy = (x) => structuredClone(x);
export const evidenceDir = new URL(
  "../../docs/build-receipts/evidence/build-7/",
  import.meta.url,
);
export const save = (name, x) => {
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(new URL(name, evidenceDir), JSON.stringify(x, null, 2) + "\n");
};
export async function ref() {
  const id = uuid();
  await admin`insert into public.referents(id) values(${id}::uuid)`;
  return id;
}
export async function fixture(role, context, payload, id = uuid()) {
  const [r] = await admin`select ecb7.fixture(${role},${context}::uuid,${
    admin.json({ synthetic: true, ...payload })
  },${id}::uuid) as id`;
  return r.id;
}
export function question(kind = "observations") {
  return {
    question: kind === "human"
      ? "Which attributed report and independently observed convention would distinguish a requested pause from collective agreement?"
      : "Under the declared placement, calibration, sampling and latency, which environmental differences produce distinct native observations soon enough to change the required control branch?",
    change:
      "retained native observation / attributed report changes the declared consequence",
    notice: "exact source revision observation or focal inquiry",
    reentry: "C2 requalification of affected comparison",
    consequence: "allow the distinction only in a newly qualified candidate",
  };
}
export async function make(kind = "thermostat", options = {}) {
  const focal = await ref(),
    scope = await ref(),
    mapper = await ref(),
    container = await ref(),
    sensor = await ref();
  const snapshots = [], aliases = {}, mappings = [];
  const sources = {};
  async function source(token, access, data) {
    const id = await fixture("b7_snapshot", focal, {
      source: `fixture://${kind}/${token}`,
      version: "1",
      limits: "synthetic stipulated evidence; no real observation",
      mapper,
      anchor: access === "native" ? focal : mapper,
      relation: access === "native" ? "self_indexed" : "observes",
      ...data,
    });
    sources[token] = await doc(admin, id);
    snapshots.push(id);
    aliases[token] = { snapshot: id, access };
    return id;
  }
  const coords = [
    {
      dimension: "altitude",
      subject: sensor,
      line: null,
      value: "constituent",
    },
    {
      dimension: "altitude",
      subject: container,
      line: null,
      value: "container",
    },
    { dimension: "stage", subject: focal, line: "sensing", value: "installed" },
    { dimension: "state", subject: focal, line: "switching", value: "idle" },
    {
      dimension: "stage",
      subject: focal,
      line: "switching",
      value: "commissioned",
    },
    {
      dimension: "type",
      subject: focal,
      line: "sensing",
      value: "rounded_native",
    },
  ];
  const a = uuid(), b = uuid(), d = uuid();
  if (kind === "thermostat") {
    await source(a, "native", {
      observations: [20, 20],
      latency: 40,
      resolution: 0.5,
      sampling: 30,
      thresholds: [19.5, 20.5],
      calibration: "v1",
      coordinates: coords,
      local_evidence: [],
    });
    await source(b, "measurement", {
      observations: [20.1, 20.2],
      latency: 1,
      coordinates: [],
      local_evidence: [],
    });
  } else {
    await source(a, "testimony", {
      speaker: focal,
      report: "I want a pause",
      coordinates: coords,
      local_evidence: [],
    });
    await source(b, "inference", {
      speaker: mapper,
      report: "I want a pause",
      coordinates: [],
      local_evidence: [],
    });
    await source(d, "convention", {
      convention: "explicit_all",
      participants: [focal, mapper],
      signals: [focal],
      coordinates: [],
      local_evidence: [],
    });
  }
  const sourceText = readFileSync(
    new URL(
      "../../docs/build-shape/010-build-7-human-closure.md",
      import.meta.url,
    ),
    "utf8",
  );
  const interpretation = await fixture("b7_snapshot", focal, {
    source: "linear:ECO-94/comment/74c49056-6b3b-42fe-944a-a5cb577a5e40",
    version: "2026-09-10T08:02:40.508Z",
    text: sourceText,
    limits: "human closure exact retained text",
  });
  const grammar = {
    governing_revision: "ECO-94:74c49056",
    interpretation_sources: [interpretation],
    aliases,
    capacities: Object.fromEntries(capacities.map((k) => [k, {
      label: k,
      meaning: ({
        quadrants:
          "Individual/collective and interior/exterior distinctions; separate from frame, mapper and access.",
        altitude:
          "Relative constituent, focal, peer, container position under declared projection; not developmental Stage.",
        lines:
          "Separate capacity dimensions; one Line does not characterize the whole Referent.",
        stages:
          "Ordered trajectory position with criteria for movement; distinct from State.",
        states:
          "Presently instantiated condition with observation duration limits; not Stage.",
        types:
          "Categorical alternatives only when they alter a stated decision.",
        directional_frame:
          "Focal Referent, anchor Referent and declared anchor-to-focal relation; mapper and access separately identified.",
      })[k],
      question:
        `Which ${k} distinction changes this comparison or requires re-entry?`,
      source: "ECO-94 accepted record §D + human closure",
      ...(k === "quadrants"
        ? {
          distinctions: [
            "individual-interior",
            "individual-exterior",
            "collective-interior",
            "collective-exterior",
          ],
        }
        : {}),
    }])),
  };
  const grammarId = await fixture("b7_grammar", focal, grammar);
  const common = {
    alternatives: [true, false],
    consequence:
      "whether the declared source supports this bounded distinction",
    defeater:
      "a different retained observation or access basis changes the answer",
  };
  const comparisons = kind === "thermostat"
    ? [{
      id: "native",
      kind: "observational_discrimination",
      token: a,
      decision_interval: 60,
      ...common,
    }, {
      id: "external",
      kind: "observational_discrimination",
      token: b,
      decision_interval: 60,
      ...common,
    }]
    : [{
      id: "report",
      kind: "reported_preference",
      token: a,
      preference: "I want a pause",
      ...common,
    }, {
      id: "inferred",
      kind: "reported_preference",
      token: b,
      preference: "I want a pause",
      ...common,
    }, { id: "agreement", kind: "collective_agreement", token: d, ...common }];
  const ct = {
    scope,
    focal,
    method,
    method_source: "repo:server/build-7/qualification.mjs",
    method_definition: readFileSync(
      new URL("../../server/build-7/qualification.mjs", import.meta.url),
      "utf8",
    ),
    obligations,
    capacities,
    comparisons,
    // Bounded prose meanings declared before candidates are examined. These are not producer fields.
    expression_interpretations: kind === "thermostat"
      ? {
        "External observations distinguish these cases; native observations do not.":
          { native: false, measurement: true },
        "Only the external observation distinguishes the stipulated cases; the native observation does not.":
          { native: false, measurement: true },
        "The external path discriminates these cases; the native path does not.":
          { native: false, measurement: true },
        "The thermostat can distinguish the cases because the engineer’s readings differ.":
          { native: true, measurement: true },
      }
      : {
        "Attributed report, inferred preference and collective agreement remain distinct.":
          { testimony: true, inference: false, convention: false },
        "The mapper’s inference is the participant’s direct report and establishes collective agreement.":
          { testimony: true, inference: true, convention: true },
      },
    expression_interpretation_limits:
      "Only retained comparator-authored meanings are checked; unsupported prose requires another applicable method, not inferred success.",
    negative_control: "invert_source_bound_answer",
    applicability: {
      mode: "declared_dependencies",
      limits:
        "no time-only freshness claim; explicit observed changes and grant continuing conditions",
    },
    question_forward: question(kind),
    ...options.contract,
  };
  const contract = await fixture("b7_contract", focal, ct);
  await admin`insert into ecb7.scopes(id,focal,contract,synthetic) values(${scope}::uuid,${focal}::uuid,${contract}::uuid,true)`;
  for (const [token, alias] of Object.entries(aliases)) {
    const src = sources[token];
    const claim = uuid();
    const relation = {
      focal,
      anchor: src.anchor,
      relation: src.relation,
      mapper: src.mapper,
      source: alias.snapshot,
      access: alias.access,
    };
    await producer`insert into public.claims(id,proposition,scope) values(${claim}::uuid,${
      JSON.stringify(relation)
    },${scope})`;
    mappings.push({
      token,
      snapshot: alias.snapshot,
      mapper: src.mapper,
      access: alias.access,
      focal,
      frame: { focal, anchor: src.anchor, relation: src.relation },
      claim,
    });
  }
  const candidate = {
    focal,
    identity_basis: "one explicitly seated synthetic specimen",
    grammar: grammarId,
    contract,
    snapshots,
    mappings,
    governing_revision: grammar.governing_revision,
    expression: kind === "thermostat"
      ? "External observations distinguish these cases; native observations do not."
      : "Attributed report, inferred preference and collective agreement remain distinct.",
    parent: null,
    conclusions: kind === "thermostat"
      ? [{ comparison: "native", answer: false }, {
        comparison: "external",
        answer: true,
      }]
      : [{ comparison: "report", answer: true }, {
        comparison: "inferred",
        answer: false,
      }, { comparison: "agreement", answer: false }],
    coordinates: coords.map((x) => ({ ...x, snapshot: snapshots[0] })),
    dispositions: Object.fromEntries(capacities.map((k) => [k, {
      status: "minimal",
      basis: "retained comparisons and explicit limits",
      discriminator:
        `Which ${k} alternative could change the bounded comparison?`,
      reexpand: "exact grammar + evidence + comparison manifest",
      question_forward: question(kind),
    }])),
    question_forward: question(kind),
    omission_challenges: {},
    evidence_dispositions: [],
    promotions: [],
    dependencies: Object.fromEntries(
      [grammarId, contract, ...snapshots].map((id) => [id, "v1"]),
    ),
    compression: {
      findings: "conclusions, coordinates, mappings",
      reexpand: "exact manifest references",
      trigger: "changed source or decision-required distinction",
    },
  };
  await bind(candidate);
  return {
    kind,
    focal,
    scope,
    contract,
    ct,
    grammar: grammarId,
    grammarData: grammar,
    sources,
    snapshots,
    aliases,
    candidate,
    tokens: [a, b, d],
    mapper,
  };
}
export async function retain(f, c = f.candidate) {
  const id = uuid();
  await producer`insert into public.artifacts(id,artifact_role,context_id,payload_text) values(${id}::uuid,'b7_candidate',${f.scope}::uuid,${
    JSON.stringify(c)
  })`;
  return id;
}
export async function evaluate(f, c = f.candidate) {
  const id = await retain(f, c);
  const result = await qualify(evaluator, id, f.contract, uuid());
  return { id, result };
}
export async function observe(f, c = f.candidate, extra = {}) {
  const [r] = await evaluator`select ecb7.observe(${f.scope}::uuid,${
    evaluator.json({
      route: "synthetic exact revision probe",
      dependencies: c.dependencies,
      revoked_grants: [],
      limits: "declared inputs only; no world-complete awareness",
      ...extra,
    })
  }) as id`;
  return r.id;
}
export async function grant(f, x, predecessor = null, extra = {}) {
  return fixture("b7_grant", f.scope, {
    issuer: "G_TEST",
    actor: "b7_actor",
    scope: f.scope,
    candidate: x.id,
    evaluation: x.result.id,
    predecessor,
    operation: "select",
    temporal: {
      act: "until_revoked",
      continuing_effect: "historical_act_only",
    },
    ...extra,
  });
}
export async function select(
  f,
  x,
  predecessor,
  g,
  o,
  request = uuid(),
  operation = "select",
  db = executor,
) {
  const [r] =
    await db`select ecb7.designate(${request}::uuid,${f.scope}::uuid,${x.id}::uuid,${x.result.id}::uuid,${predecessor}::uuid,${g}::uuid,${o}::uuid,${operation}) as value`;
  return r.value;
}

export async function bind(c) {
  c.dependencies = { method };
  for (
    const id of [
      c.grammar,
      c.contract,
      ...c.snapshots,
      ...((await doc(admin, c.grammar)).interpretation_sources ?? []),
    ]
  ) {
    const [r] =
      await admin`select encode(payload_digest,'hex') as digest from public.artifacts where id=${id}::uuid`;
    c.dependencies[id] = r.digest;
  }
  return c;
}
