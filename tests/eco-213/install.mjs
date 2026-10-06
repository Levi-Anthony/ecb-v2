import pg from 'pg';
import { readFile, readdir } from 'node:fs/promises';
const url = process.env.ECO213_TEST_DATABASE_URL;
if (!/^postgresql:\/\/postgres@127\.0\.0\.1:55439\/build6$/.test(url ?? '')) {
  throw new Error('Explicit disposable localhost database required');
}
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  // Only the installed public functional baseline. BUILD 7–10/149/159 are absent.
  for (const name of [
    '20260907234712_build_6_governance_bootstrap.sql',
    '20260914063000_build_11_ordinary_operation_kernel.sql',
    '20260915090000_build_12_ordinary_versioned_artifacts.sql',
    '20260915101000_build_12_artifact_key_fetch.sql',
    '20260915102500_build_12_artifact_key_fetch_fix.sql',
    '20260915102000_seed_integral_holonic_grammar_semantic_contract_v1.sql',
    '20260915114500_build_12_greenfield_artifact_correction.sql',
    '20260916023000_eco138_admission_disposition.sql',
    '20260916023100_eco138_disposition_transition_fix.sql',
    '20260916030000_eco140_shaped_next_action.sql',
  ]) {
    await client.query(await readFile(`sql/migrations/${name}`, 'utf8'));
    console.log(`Installed public predecessor: ${name}`);
  }
  for (const name of (await readdir('sql/migrations')).filter(x => x.includes('_eco213_') || x === '20261005223000_eco214_effect_policy_depin.sql').sort()) {
    await client.query(await readFile(`sql/migrations/${name}`, 'utf8'));
    console.log(`Applied candidate: ${name}`);
  }
  console.log('Private coordination state is untouched; complete production equivalence is not claimed.');
} finally { await client.end(); }
