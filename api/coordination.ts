const SUPABASE_URL = 'https://vezxivrvhakclxuvxzso.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4mAxzOfWinJcn-98szUEYA_Wh88UdPW';
const REPO = 'Levi-Anthony/ecb-v2';
const BRANCH = 'move/eco-190-coordination-core';
const RELIANCE_LOCATOR = `vercel:project:ecb-v2:branch:${BRANCH}`;
const CONSUMER_LOCATOR = `vercel-preview:ecb-v2:${BRANCH}:coordination`;

type AnyJson = Record<string, any>;

function dbHeaders(includeRuntime = true): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'content-type': 'application/json',
  };
  if (includeRuntime) {
    const key = process.env.ECB_ORDINARY_DB_KEY?.trim();
    if (!key) throw new Error('missing_ecb_ordinary_db_key');
    headers['x-ecb-runtime-key'] = key;
  }
  return headers;
}

async function rpc<T>(
  name: string,
  body: Record<string, unknown>,
  includeRuntime = true,
): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: dbHeaders(includeRuntime),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`rpc_${name}_${response.status}:${text.slice(0, 700)}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

function one<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] as T : value;
}

function artifactRow(value: any): { id: string; content: string; registered_at: string } {
  const row = one<any>(value);
  return row.artifact ?? {
    id: String(row.artifact_id),
    content: String(row.content),
    registered_at: String(row.registered_at),
  };
}

async function sha256Bytes(value: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
  );
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = await sha256Bytes(value);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function uuidFor(label: string): Promise<string> {
  const bytes = (await sha256Bytes(`ECO190:${label}`)).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function requiredPreviewEnv() {
  if (process.env.VERCEL_ENV !== 'preview') {
    throw new Error('eco190_preview_only');
  }
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (!sha || !vercelUrl) throw new Error('eco190_preview_identity_unavailable');
  return { sha, vercelUrl, environment: 'preview' as const };
}

async function githubCommit(sha: string): Promise<{ date: string; message: string }> {
  const response = await fetch(`https://api.github.com/repos/${REPO}/commits/${sha}`, {
    headers: { accept: 'application/vnd.github+json' },
  });
  if (!response.ok) throw new Error(`github_commit_unavailable:${response.status}`);
  const data = await response.json() as any;
  return {
    date: String(data.commit?.committer?.date ?? data.commit?.author?.date ?? ''),
    message: String(data.commit?.message ?? ''),
  };
}

async function rawFile(sha: string, path: string): Promise<string> {
  const response = await fetch(
    `https://raw.githubusercontent.com/${REPO}/${sha}/${path}`,
  );
  if (!response.ok) throw new Error(`github_raw_unavailable:${path}:${response.status}`);
  return response.text();
}

async function createArtifact(label: string, content: string) {
  const operationId = await uuidFor(`artifact:${label}`);
  const result = await rpc<any>('ecb12_create_artifact', {
    p_operation_id: operationId,
    p_content: content,
  });
  const artifact = artifactRow(result);
  return { operationId, artifact };
}

async function realizationBundle(sha: string) {
  const paths = [
    'sql/migrations/20260924220000_eco190_coordination_core.sql',
    'api/coordination.ts',
    'server.ts',
    'api/mcp.ts',
    'api/index.ts',
    'api/runtime.ts',
    'package.json',
  ];
  const files: Record<string, string> = {};
  for (const path of paths) files[path] = await rawFile(sha, path);
  const commit = await githubCommit(sha);
  const content = JSON.stringify({
    profile: 'ecb.coordination.realization-bundle/1',
    repository: REPO,
    commit_sha: sha,
    commit_date: commit.date,
    commit_message: commit.message,
    branch: BRANCH,
    files,
  });
  return createArtifact(`realization-bundle:${sha}`, content);
}

async function staticArtifacts() {
  const boundary = await createArtifact(
    'boundary:v1',
    'Boundary: canonical BRAIN tri-axial coordination vertical slice only; real canonical state plus isolated Vercel preview consumer; no production cutover, provider migration, or production alias promotion.',
  );
  const frame = await createArtifact(
    'frame:v1',
    'Mapper/frame: ECO-190 Control Room qualification. Preserve evidence, authority, currentness, installation and runtime observation as distinct propositions.',
  );
  const pgo = await createArtifact(
    'pgo:v1',
    'PGO: qualify canonical-BRAIN coordination/reconstitution through a real preview consumer with decision-changing evidence, bounded irreversible exposure, recoverability, inspectable failure, and explicit stop before production cutover.',
  );
  const question = await createArtifact(
    'question:v1',
    'Question: can independently standing URG/PGO/SSMM/fidelity constituents be recovered from canonical BRAIN, progressively projected for a real consumer, and locally requalified across material change without hidden conversational memory or external governing truth?',
  );
  const ssmm = await createArtifact(
    'ssmm:v1',
    'SSMM: ECO-190 Principal-launched Move; physical realization and qualification active. Permitted next step is bounded canonical additive realization plus preview proof. Production cutover remains unauthorized.',
  );
  const use = await createArtifact(
    'use:v1',
    'Declared use/environment: isolated Vercel preview consumer against canonical ecb-v2-brain; use recovered coordination to answer where-am-I / what-matters / what-next / what-is-stale-or-unauthorized.',
  );
  const fidelity = await createArtifact(
    'fidelity:v1',
    'Fidelity obligations: exact source/version binding; evidence/warrant/authority/currentness non-collapse; blocking UNKNOWN; typed external reliance; operation replay/conflict; disconnected consumer is not installation; no secret values in semantic BRAIN.',
  );
  const basis = await createArtifact(
    'qualification-basis:v1',
    JSON.stringify({
      profile: 'ecb.coordination.qualification-basis/1',
      governing: [
        'ECO-189 accepted Shape c3471982-ee45-46fb-9557-a8549506cf4f',
        'ECO-191 indexed-change Shape a772bbf2-f8f4-4ceb-9fc7-e5cbb20e345e',
        'ECO-190 Principal launch: Check status and continue',
        'ECO-190 Physical Design e6edc94e-01f8-447b-b30a-929f1bf9c2cb',
      ],
      scope: 'Register-B bounded physical realization + qualification',
      production_cutover_authorized: false,
    }),
  );
  return { boundary, frame, pgo, question, ssmm, use, fidelity, basis };
}

async function fetchEpisode(episodeId: string): Promise<AnyJson> {
  return rpc<AnyJson>('ecb190_fetch_episode', { p_episode_id: episodeId });
}

function sanitize(view: AnyJson) {
  return {
    episode: view.episode,
    projection: view.projection,
    current: {
      role: view.current?.envelope?.role,
      operation_id: view.current?.envelope?.operation_id,
      engagement_index: view.current?.engagement_index,
    },
    external_reliances: (view.external_reliances ?? []).map((item: any) => ({
      id: item.id,
      epoch: item.epoch,
      source_system: item.source_system,
      source_locator: item.source_locator,
      currentness: item.payload?.currentness,
      observed_version: item.payload?.observed_version,
      observed_status: item.payload?.observed_status,
    })),
    consumer_bindings: (view.consumer_bindings ?? []).map((item: any) => ({
      id: item.id,
      epoch: item.epoch,
      consumer_kind: item.consumer_kind,
      consumer_locator: item.consumer_locator,
      environment: item.payload?.environment,
      deployment_id: item.payload?.deployment_id,
      connected_status: item.payload?.connected_status,
      observed_use: item.payload?.observed_use,
    })),
    supporting_receipts: (view.supporting_receipts ?? []).map((item: any) => ({
      receipt_id: item.receipt_id,
      artifact_id: item.artifact_id,
      record_role: item.record_role,
      epoch: item.epoch,
      verdict: item.payload?.verdict ?? null,
    })),
  };
}

async function bootstrap() {
  const env = requiredPreviewEnv();
  const commit = await githubCommit(env.sha);
  const ids = {
    episode: await uuidFor('episode'),
    reliance: await uuidFor('reliance:vercel-preview'),
    consumer: await uuidFor('consumer:vercel-preview'),
  };
  const staticSet = await staticArtifacts();
  const bundle = await realizationBundle(env.sha);

  const snapshot = JSON.stringify({
    profile: 'ecb.coordination.snapshot/1',
    engagement_index: {
      r: ids.episode,
      b: staticSet.boundary.artifact.id,
      f: staticSet.frame.artifact.id,
      g: staticSet.pgo.artifact.id,
      q: staticSet.question.artifact.id,
      t: staticSet.ssmm.artifact.id,
      u: staticSet.use.artifact.id,
    },
    constituents: {
      fidelity: staticSet.fidelity.artifact.id,
      realization_manifest: bundle.artifact.id,
    },
    qualification_basis_artifact_id: staticSet.basis.artifact.id,
  });

  const opened = await rpc<any>('ecb190_open_episode', {
    p_operation_id: await uuidFor('open-episode'),
    p_episode_id: ids.episode,
    p_submitted_text: snapshot,
  });

  const relianceEvidence = await createArtifact(
    `reliance-evidence:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.external-observation/1',
      system: 'vercel',
      stable_locator: RELIANCE_LOCATOR,
      deployment_url: env.vercelUrl,
      commit_sha: env.sha,
      commit_date: commit.date,
      observation: 'preview route executing against canonical BRAIN',
    }),
  );
  const reliancePayload = JSON.stringify({
    profile: 'ecb.coordination.reliance/1',
    source_system: 'vercel',
    source_locator: RELIANCE_LOCATOR,
    observed_version: env.sha,
    observed_fingerprint: await sha256Hex(`${env.sha}|${env.vercelUrl}`),
    observed_status: 'READY_PREVIEW',
    observed_at: commit.date,
    currentness: 'CURRENT',
    decision_consequence: 'preview consumer may be used for bounded ECO-190 qualification only while this exact deployment/history remains current',
    revalidation_trigger: 'deployment commit/history or runtime availability changes',
    failure_semantics: 'fence only claims depending on this preview realization; do not invalidate unrelated canonical BRAIN state',
    evidence_basis_artifact_id: relianceEvidence.artifact.id,
  });
  const reliance = await rpc<any>('ecb190_record_reliance', {
    p_operation_id: await uuidFor(`reliance:${env.sha}`),
    p_episode_id: ids.episode,
    p_reliance_id: ids.reliance,
    p_expected_epoch: 0,
    p_submitted_text: reliancePayload,
  });

  // A successful recovery is the first observed use of the preview consumer.
  await fetchEpisode(ids.episode);

  const consumerEvidence = await createArtifact(
    `consumer-evidence:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.consumer-observation/1',
      consumer: CONSUMER_LOCATOR,
      deployment_url: env.vercelUrl,
      commit_sha: env.sha,
      observation: 'preview consumer successfully recovered canonical coordination projection',
    }),
  );
  const consumerPayload = JSON.stringify({
    profile: 'ecb.coordination.consumer/1',
    consumer_kind: 'vercel-preview-http',
    consumer_locator: CONSUMER_LOCATOR,
    environment: 'preview',
    deployment_id: env.vercelUrl,
    runtime_id: env.sha,
    realization_artifact_ids: [bundle.artifact.id],
    connected_status: 'CONNECTED',
    observed_use: 'OBSERVED',
    observed_at: commit.date,
    evidence_basis_artifact_id: consumerEvidence.artifact.id,
    external_reliance_id: ids.reliance,
  });
  const consumer = await rpc<any>('ecb190_record_consumer_binding', {
    p_operation_id: await uuidFor(`consumer:${env.sha}`),
    p_episode_id: ids.episode,
    p_consumer_id: ids.consumer,
    p_expected_epoch: 0,
    p_submitted_text: consumerPayload,
  });

  const manifestReceipt = await rpc<any>('ecb190_record_receipt', {
    p_operation_id: await uuidFor(`reconstitution-receipt:${env.sha}`),
    p_episode_id: ids.episode,
    p_role: 'RECONSTITUTION_MANIFEST',
    p_submitted_text: JSON.stringify({
      profile: 'ecb.coordination.receipt/1',
      kind: 'exact_realization_custody',
      artifact_refs: [
        bundle.artifact.id,
        staticSet.basis.artifact.id,
        relianceEvidence.artifact.id,
        consumerEvidence.artifact.id,
      ],
      reconstruction_rule: 'recover realization bundle from canonical Artifact custody; GitHub/Linear are not required as content sources after custody',
    }),
  });

  const view = await fetchEpisode(ids.episode);
  return {
    action: 'bootstrap',
    environment: env,
    ids,
    opened,
    reliance,
    consumer,
    manifest_receipt: manifestReceipt,
    view: sanitize(view),
  };
}

function currentIds(view: AnyJson) {
  const reliance = view.external_reliances?.[0];
  const consumer = view.consumer_bindings?.[0];
  if (!reliance || !consumer) throw new Error('eco190_dependencies_not_initialized');
  return {
    relianceId: String(reliance.id),
    relianceEpoch: Number(reliance.epoch),
    consumerId: String(consumer.id),
    consumerEpoch: Number(consumer.epoch),
  };
}

async function expectedFailure(
  label: string,
  call: () => Promise<unknown>,
  fragment: string,
) {
  try {
    await call();
    return { label, pass: false, observed: 'unexpected_success' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      label,
      pass: message.includes(fragment),
      observed: message.includes(fragment) ? fragment : message.slice(0, 180),
    };
  }
}

function makeChange(input: {
  view: AnyJson;
  destinationIndex: AnyJson;
  destinationConstituents: AnyJson;
  destinationBasis: string;
  relianceId: string;
  relianceEpoch: number;
  consumerId: string;
  consumerEpoch: number;
  coverage: any[];
  transport: any[];
  authorityScope?: string;
  claimed?: 'ELIGIBLE' | 'INELIGIBLE';
  reason: string;
  deploymentSha: string;
}) {
  return JSON.stringify({
    profile: 'ecb.coordination.change/1',
    transition: {
      source_head_receipt_id: input.view.episode.head_receipt_id,
      source_epoch: input.view.episode.epoch,
      reason: input.reason,
      deployment_sha: input.deploymentSha,
      declared_write_set: ['episode_head','external_reliance_head','consumer_binding_head'],
    },
    continuity: {
      mode: 'SAME_REFERENT_REVISED_ACCOUNT',
      basis: 'same ECO-190 qualification episode across preview realization history',
    },
    source_retention: {
      source_head_receipt_id: input.view.episode.head_receipt_id,
      preserve_history: true,
    },
    transport: input.transport,
    affected_old: [
      { item: 'prior preview realization', disposition: 'AFFECTED' },
      { item: 'PGO', disposition: 'UNCHANGED' },
      { item: 'focal referent', disposition: 'UNCHANGED' },
    ],
    destination_disclosure: {
      method_version: 'eco190-preview-consumer/1',
      destination_index: input.destinationIndex,
      qualification_basis_artifact_id: input.destinationBasis,
      constituents: input.destinationConstituents,
      newly_active_requirements: input.coverage.map((row) => row.requirement_id),
      material_unknowns: input.coverage
        .filter((row) => row.status === 'UNKNOWN')
        .map((row) => row.requirement_id),
      sufficiency: 'BOUNDED',
    },
    coverage: input.coverage,
    current_use: {
      engagement_index: input.destinationIndex,
      qualification_basis_artifact_id: input.destinationBasis,
      currentness: 'CURRENT',
      ssmm_legality: 'LEGAL',
      authority_scope: input.authorityScope ?? 'AUTHORIZED',
      external_reliance_id: input.relianceId,
      expected_reliance_epoch: input.relianceEpoch,
      consumer_binding_id: input.consumerId,
      expected_consumer_epoch: input.consumerEpoch,
      consumer_environment: 'preview',
    },
    reconciliation: {
      reliance_eligibility: input.claimed ?? 'ELIGIBLE',
      reasons: ['declared destination coverage and current-use gates evaluated'],
      remaining_apertures: [],
      permitted_next: ['continue bounded ECO-190 qualification'],
    },
  });
}

async function materialChange() {
  const env = requiredPreviewEnv();
  const commit = await githubCommit(env.sha);
  const episodeId = await uuidFor('episode');
  let view = await fetchEpisode(episodeId);
  const depsBefore = currentIds(view);
  const existingVersion = String(view.external_reliances[0]?.payload?.observed_version ?? '');

  const bundle = await realizationBundle(env.sha);
  const relianceEvidence = await createArtifact(
    `reliance-evidence:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.external-observation/1',
      system: 'vercel',
      stable_locator: RELIANCE_LOCATOR,
      deployment_url: env.vercelUrl,
      commit_sha: env.sha,
      commit_date: commit.date,
      observation: 'new preview deployment/history observed',
    }),
  );

  if (existingVersion !== env.sha) {
    await rpc<any>('ecb190_record_reliance', {
      p_operation_id: await uuidFor(`reliance:${env.sha}`),
      p_episode_id: episodeId,
      p_reliance_id: depsBefore.relianceId,
      p_expected_epoch: depsBefore.relianceEpoch,
      p_submitted_text: JSON.stringify({
        profile: 'ecb.coordination.reliance/1',
        source_system: 'vercel',
        source_locator: RELIANCE_LOCATOR,
        observed_version: env.sha,
        observed_fingerprint: await sha256Hex(`${env.sha}|${env.vercelUrl}`),
        observed_status: 'READY_PREVIEW',
        observed_at: commit.date,
        currentness: 'CURRENT',
        decision_consequence: 'new preview history must be re-bound before positive reliance',
        revalidation_trigger: 'deployment commit/history or runtime availability changes',
        failure_semantics: 'fence only claims depending on this preview realization',
        evidence_basis_artifact_id: relianceEvidence.artifact.id,
      }),
    });
  }

  view = await fetchEpisode(episodeId);
  const depsAfterReliance = currentIds(view);

  const staleEpochControl = existingVersion !== env.sha
    ? await expectedFailure(
        'same-endpoint-different-history-old-epoch',
        () => rpc<any>('ecb190_record_change', {
          p_operation_id: uuidFor('negative:old-reliance-epoch').then(String),
          p_episode_id: episodeId,
          p_expected_epoch: view.episode.epoch,
          p_submitted_text: '{}',
        } as any),
        'never-match',
      )
    : { label: 'same-endpoint-different-history-old-epoch', pass: true, observed: 'already_applied' };

  // Recover first, then record that this exact new deployment was observed using the projection.
  await fetchEpisode(episodeId);
  const consumerEvidence = await createArtifact(
    `consumer-evidence:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.consumer-observation/1',
      consumer: CONSUMER_LOCATOR,
      deployment_url: env.vercelUrl,
      commit_sha: env.sha,
      observation: 'new preview deployment recovered and used coordination projection',
    }),
  );
  const currentConsumerVersion = String(view.consumer_bindings[0]?.payload?.runtime_id ?? '');
  if (currentConsumerVersion !== env.sha) {
    await rpc<any>('ecb190_record_consumer_binding', {
      p_operation_id: await uuidFor(`consumer:${env.sha}`),
      p_episode_id: episodeId,
      p_consumer_id: depsAfterReliance.consumerId,
      p_expected_epoch: depsAfterReliance.consumerEpoch,
      p_submitted_text: JSON.stringify({
        profile: 'ecb.coordination.consumer/1',
        consumer_kind: 'vercel-preview-http',
        consumer_locator: CONSUMER_LOCATOR,
        environment: 'preview',
        deployment_id: env.vercelUrl,
        runtime_id: env.sha,
        realization_artifact_ids: [bundle.artifact.id],
        connected_status: 'CONNECTED',
        observed_use: 'OBSERVED',
        observed_at: commit.date,
        evidence_basis_artifact_id: consumerEvidence.artifact.id,
        external_reliance_id: depsAfterReliance.relianceId,
      }),
    });
  }

  view = await fetchEpisode(episodeId);
  const deps = currentIds(view);
  const alreadyApplied = view.current?.envelope?.parsed?.transition?.deployment_sha === env.sha;
  if (alreadyApplied) {
    return { action: 'material-change', status: 'already_applied', view: sanitize(view) };
  }

  const changedUse = await createArtifact(
    `use:deployment:${env.sha}`,
    `Declared use/environment after material realization change: isolated preview consumer at commit ${env.sha}; reconstitute and requalify before continued positive reliance.`,
  );
  const changedBasis = await createArtifact(
    `qualification-basis:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.qualification-basis/1',
      governing_basis: view.episode.qualification_basis_artifact_id,
      new_external_evidence: relianceEvidence.artifact.id,
      new_consumer_evidence: consumerEvidence.artifact.id,
      realization_bundle: bundle.artifact.id,
      reason: 'material preview deployment/history change',
    }),
  );
  const bridge = await createArtifact(
    `bridge:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.bridge/1',
      source_head: view.episode.head_receipt_id,
      destination_use: changedUse.artifact.id,
      destination_basis: changedBasis.artifact.id,
      continuity: 'same ECO-190 episode; use/basis revised for new realization history',
    }),
  );

  const sourceIndex = view.current.engagement_index;
  const destinationIndex = { ...sourceIndex, u: changedUse.artifact.id };
  const destinationConstituents = {
    ...Object.fromEntries(
      Object.entries(view.current.constituents).map(([key, value]: [string, any]) => [key, value.artifact_id]),
    ),
    realization_manifest: bundle.artifact.id,
  };
  const coverage = [
    {
      requirement_id: 'preview_consumer_observed',
      blocking: true,
      status: 'SATISFIED',
      basis_artifact_id: consumerEvidence.artifact.id,
    },
    {
      requirement_id: 'external_currentness',
      blocking: true,
      status: 'SATISFIED',
      basis_artifact_id: relianceEvidence.artifact.id,
    },
    {
      requirement_id: 'destination_reconstitution_bundle',
      blocking: true,
      status: 'SATISFIED',
      basis_artifact_id: bundle.artifact.id,
    },
  ];
  const qualifiedTransport = [{
    source_slot: 'prior_pgo',
    destination_slot: 'destination_pgo',
    bridge_artifact_id: bridge.artifact.id,
    loss_class: 'PRESERVED',
    status: 'QUALIFIED_DESTINATION_REUSE',
  }];

  const controls: any[] = [];
  const noBridge = makeChange({
    view,
    destinationIndex,
    destinationConstituents,
    destinationBasis: changedBasis.artifact.id,
    relianceId: deps.relianceId,
    relianceEpoch: deps.relianceEpoch,
    consumerId: deps.consumerId,
    consumerEpoch: deps.consumerEpoch,
    coverage,
    transport: [{ ...qualifiedTransport[0], bridge_artifact_id: undefined }],
    reason: 'negative control: changed index/basis without bridge',
    deploymentSha: env.sha,
  });
  controls.push(await expectedFailure(
    'changed-index-requires-bridge',
    async () => rpc<any>('ecb190_record_change', {
      p_operation_id: await uuidFor(`negative:no-bridge:${env.sha}`),
      p_episode_id: episodeId,
      p_expected_epoch: view.episode.epoch,
      p_submitted_text: noBridge,
    }),
    'ecb190_transport_bridge_required',
  ));

  const blockingUnknown = makeChange({
    view,
    destinationIndex,
    destinationConstituents,
    destinationBasis: changedBasis.artifact.id,
    relianceId: deps.relianceId,
    relianceEpoch: deps.relianceEpoch,
    consumerId: deps.consumerId,
    consumerEpoch: deps.consumerEpoch,
    coverage: [
      ...coverage,
      {
        requirement_id: 'destination_only_unknown',
        blocking: true,
        status: 'UNKNOWN',
        qf_reentry: 'resolve destination-only obligation before positive reliance',
      },
    ],
    transport: qualifiedTransport,
    reason: 'negative control: blocking UNKNOWN',
    deploymentSha: env.sha,
  });
  controls.push(await expectedFailure(
    'blocking-unknown-blocks',
    async () => rpc<any>('ecb190_record_change', {
      p_operation_id: await uuidFor(`negative:blocking-unknown:${env.sha}`),
      p_episode_id: episodeId,
      p_expected_epoch: view.episode.epoch,
      p_submitted_text: blockingUnknown,
    }),
    'ecb190_reconciliation_result_mismatch',
  ));

  const unauthorized = makeChange({
    view,
    destinationIndex,
    destinationConstituents,
    destinationBasis: changedBasis.artifact.id,
    relianceId: deps.relianceId,
    relianceEpoch: deps.relianceEpoch,
    consumerId: deps.consumerId,
    consumerEpoch: deps.consumerEpoch,
    coverage,
    transport: qualifiedTransport,
    authorityScope: 'UNAUTHORIZED',
    reason: 'negative control: phase does not confer authority',
    deploymentSha: env.sha,
  });
  controls.push(await expectedFailure(
    'phase-does-not-confer-authority',
    async () => rpc<any>('ecb190_record_change', {
      p_operation_id: await uuidFor(`negative:unauthorized:${env.sha}`),
      p_episode_id: episodeId,
      p_expected_epoch: view.episode.epoch,
      p_submitted_text: unauthorized,
    }),
    'ecb190_reconciliation_result_mismatch',
  ));

  // Exact old reliance epoch must fail after the same stable endpoint receives a new history.
  if (existingVersion !== env.sha) {
    const oldEpochChange = makeChange({
      view,
      destinationIndex,
      destinationConstituents,
      destinationBasis: changedBasis.artifact.id,
      relianceId: deps.relianceId,
      relianceEpoch: depsBefore.relianceEpoch,
      consumerId: deps.consumerId,
      consumerEpoch: deps.consumerEpoch,
      coverage,
      transport: qualifiedTransport,
      reason: 'negative control: same endpoint, stale reliance epoch',
      deploymentSha: env.sha,
    });
    controls.push(await expectedFailure(
      'same-endpoint-different-history-old-epoch',
      async () => rpc<any>('ecb190_record_change', {
        p_operation_id: await uuidFor(`negative:old-reliance-epoch:${env.sha}`),
        p_episode_id: episodeId,
        p_expected_epoch: view.episode.epoch,
        p_submitted_text: oldEpochChange,
      }),
      'ecb190_current_use_reliance_epoch_conflict',
    ));
  }

  const valid = makeChange({
    view,
    destinationIndex,
    destinationConstituents,
    destinationBasis: changedBasis.artifact.id,
    relianceId: deps.relianceId,
    relianceEpoch: deps.relianceEpoch,
    consumerId: deps.consumerId,
    consumerEpoch: deps.consumerEpoch,
    coverage,
    transport: qualifiedTransport,
    reason: 'material preview deployment/history change with localized recoordination',
    deploymentSha: env.sha,
  });
  const change = await rpc<any>('ecb190_record_change', {
    p_operation_id: await uuidFor(`change:${env.sha}`),
    p_episode_id: episodeId,
    p_expected_epoch: view.episode.epoch,
    p_submitted_text: valid,
  });

  const after = await fetchEpisode(episodeId);
  return {
    action: 'material-change',
    environment: env,
    change,
    controls,
    stale_epoch_probe_placeholder: staleEpochControl,
    view: sanitize(after),
  };
}

async function negativeControls() {
  const env = requiredPreviewEnv();
  const episodeId = await uuidFor('episode');
  let view = await fetchEpisode(episodeId);
  let deps = currentIds(view);
  const controls: any[] = [];

  const evidence = await createArtifact(
    `negative-controls:${env.sha}`,
    JSON.stringify({
      profile: 'ecb.coordination.negative-controls/1',
      deployment_sha: env.sha,
      purpose: 'exercise stale reliance, disconnected consumer, replay/conflict and missing runtime capability',
    }),
  );

  // Replay/conflict on a supporting receipt.
  const receiptOp = await uuidFor(`negative:receipt-replay:${env.sha}`);
  const receiptBody = JSON.stringify({
    profile: 'ecb.coordination.receipt/1',
    artifact_refs: [evidence.artifact.id],
    kind: 'negative-control-replay',
  });
  const firstReceipt = await rpc<any>('ecb190_record_receipt', {
    p_operation_id: receiptOp,
    p_episode_id: episodeId,
    p_role: 'QUALIFICATION',
    p_submitted_text: receiptBody,
  });
  const replayReceipt = await rpc<any>('ecb190_record_receipt', {
    p_operation_id: receiptOp,
    p_episode_id: episodeId,
    p_role: 'QUALIFICATION',
    p_submitted_text: receiptBody,
  });
  controls.push({
    label: 'same-operation-same-request-replays',
    pass: Boolean(replayReceipt?.replayed),
    observed: replayReceipt?.replayed ? 'replayed=true' : replayReceipt,
  });
  controls.push(await expectedFailure(
    'same-operation-changed-request-conflicts',
    () => rpc<any>('ecb190_record_receipt', {
      p_operation_id: receiptOp,
      p_episode_id: episodeId,
      p_role: 'QUALIFICATION',
      p_submitted_text: JSON.stringify({
        profile: 'ecb.coordination.receipt/1',
        artifact_refs: [evidence.artifact.id],
        kind: 'changed-request',
      }),
    }),
    'ecb11_operation_conflict',
  ));

  controls.push(await expectedFailure(
    'missing-runtime-capability-blocks',
    () => rpc<any>('ecb190_fetch_episode', { p_episode_id: episodeId }, false),
    'ecb11_runtime_unauthorized',
  ));

  // Stale external reliance is localized and blocks positive use.
  const reliance = view.external_reliances[0];
  const staleEvidence = await createArtifact(
    `reliance-stale:${env.sha}`,
    JSON.stringify({ reason: 'qualification negative control', prior: reliance.payload }),
  );
  if (reliance.payload.currentness !== 'STALE') {
    await rpc<any>('ecb190_record_reliance', {
      p_operation_id: await uuidFor(`negative:reliance-stale:${env.sha}`),
      p_episode_id: episodeId,
      p_reliance_id: deps.relianceId,
      p_expected_epoch: deps.relianceEpoch,
      p_submitted_text: JSON.stringify({
        ...reliance.payload,
        profile: 'ecb.coordination.reliance/1',
        currentness: 'STALE',
        decision_consequence: 'dependent current-use claim is fenced for this negative control',
        revalidation_trigger: 'explicit restore/revalidation receipt',
        failure_semantics: 'do not invalidate unrelated BRAIN state',
        evidence_basis_artifact_id: staleEvidence.artifact.id,
      }),
    });
  }
  view = await fetchEpisode(episodeId);
  deps = currentIds(view);
  controls.push({
    label: 'stale-reliance-localizes',
    pass: (view.projection?.stale_or_unauthorized ?? []).some(
      (item: any) => item.kind === 'external_reliance' && item.id === deps.relianceId,
    ),
    observed: view.projection?.stale_or_unauthorized,
  });

  const headIndex = view.current.engagement_index;
  const headConstituents = Object.fromEntries(
    Object.entries(view.current.constituents).map(([key, value]: [string, any]) => [key, value.artifact_id]),
  );
  const headBasis = String(view.episode.qualification_basis_artifact_id);
  const noOpCoverage = [{
    requirement_id: 'negative_control_basis',
    blocking: true,
    status: 'SATISFIED',
    basis_artifact_id: evidence.artifact.id,
  }];
  const staleChange = makeChange({
    view,
    destinationIndex: headIndex,
    destinationConstituents: headConstituents,
    destinationBasis: headBasis,
    relianceId: deps.relianceId,
    relianceEpoch: deps.relianceEpoch,
    consumerId: deps.consumerId,
    consumerEpoch: deps.consumerEpoch,
    coverage: noOpCoverage,
    transport: [],
    reason: 'negative control: stale external reliance',
    deploymentSha: env.sha,
  });
  controls.push(await expectedFailure(
    'stale-reliance-blocks-positive-use',
    async () => rpc<any>('ecb190_record_change', {
      p_operation_id: await uuidFor(`negative:stale-change:${env.sha}`),
      p_episode_id: episodeId,
      p_expected_epoch: view.episode.epoch,
      p_submitted_text: staleChange,
    }),
    'ecb190_reconciliation_result_mismatch',
  ));

  const restoredEvidence = await createArtifact(
    `reliance-restored:${env.sha}`,
    JSON.stringify({ reason: 'explicit revalidation after negative control', deployment_sha: env.sha }),
  );
  await rpc<any>('ecb190_record_reliance', {
    p_operation_id: await uuidFor(`negative:reliance-restore:${env.sha}`),
    p_episode_id: episodeId,
    p_reliance_id: deps.relianceId,
    p_expected_epoch: deps.relianceEpoch,
    p_submitted_text: JSON.stringify({
      ...view.external_reliances[0].payload,
      profile: 'ecb.coordination.reliance/1',
      currentness: 'CURRENT',
      decision_consequence: 'preview realization revalidated after bounded stale control',
      revalidation_trigger: 'deployment/history changes',
      failure_semantics: 'fence only dependent current-use claims',
      evidence_basis_artifact_id: restoredEvidence.artifact.id,
    }),
  });

  view = await fetchEpisode(episodeId);
  deps = currentIds(view);

  // Disconnected consumer is not installation and blocks positive use.
  const consumer = view.consumer_bindings[0];
  const disconnectedEvidence = await createArtifact(
    `consumer-disconnected:${env.sha}`,
    JSON.stringify({ reason: 'qualification negative control', prior: consumer.payload }),
  );
  await rpc<any>('ecb190_record_consumer_binding', {
    p_operation_id: await uuidFor(`negative:consumer-disconnect:${env.sha}`),
    p_episode_id: episodeId,
    p_consumer_id: deps.consumerId,
    p_expected_epoch: deps.consumerEpoch,
    p_submitted_text: JSON.stringify({
      ...consumer.payload,
      profile: 'ecb.coordination.consumer/1',
      connected_status: 'DISCONNECTED',
      observed_use: 'UNOBSERVED',
      evidence_basis_artifact_id: disconnectedEvidence.artifact.id,
    }),
  });
  view = await fetchEpisode(episodeId);
  deps = currentIds(view);
  controls.push({
    label: 'disconnected-consumer-not-installed',
    pass: (view.projection?.stale_or_unauthorized ?? []).some(
      (item: any) => item.kind === 'consumer' && item.id === deps.consumerId,
    ),
    observed: view.projection?.stale_or_unauthorized,
  });

  const disconnectedChange = makeChange({
    view,
    destinationIndex: view.current.engagement_index,
    destinationConstituents: Object.fromEntries(
      Object.entries(view.current.constituents).map(([key, value]: [string, any]) => [key, value.artifact_id]),
    ),
    destinationBasis: String(view.episode.qualification_basis_artifact_id),
    relianceId: deps.relianceId,
    relianceEpoch: deps.relianceEpoch,
    consumerId: deps.consumerId,
    consumerEpoch: deps.consumerEpoch,
    coverage: noOpCoverage,
    transport: [],
    reason: 'negative control: disconnected consumer',
    deploymentSha: env.sha,
  });
  controls.push(await expectedFailure(
    'disconnected-consumer-blocks-positive-use',
    async () => rpc<any>('ecb190_record_change', {
      p_operation_id: await uuidFor(`negative:disconnected-change:${env.sha}`),
      p_episode_id: episodeId,
      p_expected_epoch: view.episode.epoch,
      p_submitted_text: disconnectedChange,
    }),
    'ecb190_reconciliation_result_mismatch',
  ));

  const consumerRestoreEvidence = await createArtifact(
    `consumer-restored:${env.sha}`,
    JSON.stringify({ reason: 'consumer re-observed after disconnect control', deployment_sha: env.sha }),
  );
  await rpc<any>('ecb190_record_consumer_binding', {
    p_operation_id: await uuidFor(`negative:consumer-restore:${env.sha}`),
    p_episode_id: episodeId,
    p_consumer_id: deps.consumerId,
    p_expected_epoch: deps.consumerEpoch,
    p_submitted_text: JSON.stringify({
      ...view.consumer_bindings[0].payload,
      profile: 'ecb.coordination.consumer/1',
      connected_status: 'CONNECTED',
      observed_use: 'OBSERVED',
      evidence_basis_artifact_id: consumerRestoreEvidence.artifact.id,
    }),
  });

  const evidenceReceipt = await rpc<any>('ecb190_record_receipt', {
    p_operation_id: await uuidFor(`negative-controls-receipt:${env.sha}`),
    p_episode_id: episodeId,
    p_role: 'QUALIFICATION',
    p_submitted_text: JSON.stringify({
      profile: 'ecb.coordination.receipt/1',
      artifact_refs: [
        evidence.artifact.id,
        staleEvidence.artifact.id,
        restoredEvidence.artifact.id,
        disconnectedEvidence.artifact.id,
        consumerRestoreEvidence.artifact.id,
      ],
      kind: 'negative-control-evidence',
      controls,
      first_receipt_id: firstReceipt?.receipt_id ?? firstReceipt?.operation_id,
    }),
  });

  const after = await fetchEpisode(episodeId);
  return {
    action: 'negative-controls',
    environment: env,
    controls,
    evidence_receipt: evidenceReceipt,
    view: sanitize(after),
  };
}

async function reconstruct() {
  requiredPreviewEnv();
  const episodeId = await uuidFor('episode');
  const view = await fetchEpisode(episodeId);
  const bundleText = view.current?.constituents?.realization_manifest?.content;
  if (!bundleText) throw new Error('eco190_realization_bundle_missing');
  const bundle = JSON.parse(bundleText);
  const required = [
    'sql/migrations/20260924220000_eco190_coordination_core.sql',
    'api/coordination.ts',
    'server.ts',
    'api/mcp.ts',
    'api/index.ts',
    'api/runtime.ts',
    'package.json',
  ];
  const missing = required.filter((path) => typeof bundle.files?.[path] !== 'string');
  return {
    action: 'reconstruct',
    source: 'canonical_BRAIN_artifact_only',
    github_read_performed: false,
    bundle_commit_sha: bundle.commit_sha,
    files_present: required.filter((path) => !missing.includes(path)),
    missing,
    pass: missing.length === 0,
    projection: sanitize(view).projection,
  };
}

async function qualify() {
  const env = requiredPreviewEnv();
  const episodeId = await uuidFor('episode');
  const reconstruction = await reconstruct();
  const view = await fetchEpisode(episodeId);
  if (!reconstruction.pass) throw new Error('eco190_reconstruction_incomplete');
  const currentStale = view.projection?.stale_or_unauthorized ?? [];
  const verdict = currentStale.length === 0 ? 'PASS' : 'FAIL';
  const evidenceArtifacts = [
    view.current?.constituents?.realization_manifest?.artifact_id,
    view.episode?.qualification_basis_artifact_id,
  ].filter(Boolean);
  const receipt = await rpc<any>('ecb190_record_receipt', {
    p_operation_id: await uuidFor(`final-qualification:${env.sha}`),
    p_episode_id: episodeId,
    p_role: 'QUALIFICATION',
    p_submitted_text: JSON.stringify({
      profile: 'ecb.coordination.receipt/1',
      artifact_refs: evidenceArtifacts,
      kind: 'eco190-bounded-qualification',
      verdict,
      deployment_sha: env.sha,
      reconstruction,
      stale_or_unauthorized: currentStale,
      production_cutover: 'NOT_AUTHORIZED_NOT_PERFORMED',
    }),
  });
  return {
    action: 'qualify',
    verdict,
    qualification_receipt: receipt,
    reconstruction,
    view: sanitize(await fetchEpisode(episodeId)),
  };
}

export default {
  async fetch(request: Request) {
    try {
      requiredPreviewEnv();
      const url = new URL(request.url);
      const action = url.searchParams.get('action') ?? 'fetch';
      const episodeId = await uuidFor('episode');

      if (request.method !== 'GET') {
        return Response.json({ error: 'method_not_allowed' }, { status: 405 });
      }

      if (action === 'bootstrap') return Response.json(await bootstrap());
      if (action === 'material-change') return Response.json(await materialChange());
      if (action === 'negative-controls') return Response.json(await negativeControls());
      if (action === 'reconstruct') return Response.json(await reconstruct());
      if (action === 'qualify') return Response.json(await qualify());
      if (action === 'fetch') {
        return Response.json({
          action: 'fetch',
          view: sanitize(await fetchEpisode(episodeId)),
        });
      }
      return Response.json({ error: 'unknown_action' }, { status: 400 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('eco190_coordination_preview_error', message);
      return Response.json(
        { error: 'eco190_coordination_preview_error', detail: message.slice(0, 240) },
        { status: 500 },
      );
    }
  },
};
