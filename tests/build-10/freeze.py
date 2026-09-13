#!/usr/bin/env python3

import hashlib
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
evidence = root / 'docs/build-receipts/evidence/build-10'

# Preserve the original historical freeze and create a new, stronger
# pre-holdout boundary for ECO-122.
original_path = evidence / 'checker-freeze.json'
path = evidence / 'pre-holdout-freeze-v2.json'

if not original_path.exists():
    raise RuntimeError('Original checker-freeze.json must be preserved')

if path.exists():
    raise RuntimeError('Existing pre-holdout-freeze-v2.json must be preserved')


def sql(side, q):
    p = subprocess.run(
        [
            'docker', 'exec', '-i', f'ecb10-{side}-pg17',
            'psql', '-X', '-qAt',
            '-U', 'custodian',
            '-d', f'build10_{side}',
            '-v', 'ON_ERROR_STOP=1'
        ],
        input=q,
        text=True,
        capture_output=True,
        check=True,
    )
    return p.stdout.strip()


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def rel(p):
    return str(p.relative_to(root))


def git(*args):
    return subprocess.run(
        ['git', *args],
        cwd=root,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.strip()


inventory = """
select jsonb_agg(
  jsonb_build_object(
    'signature', p.oid::regprocedure::text,
    'definition', pg_get_functiondef(p.oid)
  )
  order by p.oid::regprocedure::text
)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'ecb10';
"""

source = json.loads(sql('source', inventory))
destination = json.loads(sql('destination', inventory))
assert source == destination

method = sql('destination', 'select ecb10.method_digest();')
assert method == sql('source', 'select ecb10.method_digest();')

# Preserve the selected no-Packet/no-b10_context physicalization.
assert sql(
    'destination',
    "select count(*) from pg_class where relname='b10_context';"
) == '0'

base_checkpoint = git('rev-parse', 'HEAD')
assert base_checkpoint == 'ae399a8b3ec7dc33741acb6cffbfe779bec87409'

# Complete decision-relevant pre-holdout freeze boundary.
#
# Included:
# - semantic implementation / checker definition
# - runtime modules used by transfer/check/recovery
# - fixture/question/report/representation/proposition construction
# - exact JS dependency specification + lock
#
# Intentionally excluded:
# - holdout.mjs: future holdout must be authored only after the durable
#   pre-holdout checkpoint
# - other proof-suite orchestration: not part of semantic fixture/checker
#   definition for the future holdout
# - worker-config.mjs: reads disposable local config only
files = [
    root / 'sql/migrations/20260913070000_build_10_semantic_transfer.sql',
    *sorted((root / 'server/build-10').glob('*.mjs')),
    root / 'tests/build-10/support.mjs',
    root / 'tests/build-10/package.json',
    root / 'tests/build-10/package-lock.json',
]

for p in files:
    if not p.is_file():
        raise RuntimeError(f'Missing frozen file: {rel(p)}')

original = json.loads(original_path.read_text())

# ECO-122 is an evidence-boundary repair, not a checker change.
assert original['method_digest'] == method

# Every implementation file covered by the original freeze must remain
# byte-identical. support/package files are newly brought inside the
# stronger boundary.
for old_rel, old_digest in original['files'].items():
    p = root / old_rel
    assert digest(p) == old_digest, f'Original frozen file changed: {old_rel}'

frozen_files = {rel(p): digest(p) for p in files}

# One stable digest for the complete file boundary, independent of JSON
# formatting or dictionary insertion representation.
boundary_material = ''.join(
    f'{name}\0{frozen_files[name]}\n'
    for name in sorted(frozen_files)
).encode()
boundary_digest = hashlib.sha256(boundary_material).hexdigest()

record = {
    'state': 'PRE_HOLDOUT_FREEZE_V2',
    'purpose': 'ECO-122 fixture-inclusive durable pre-holdout boundary',
    'base_checkpoint': base_checkpoint,
    'original_checker_freeze': 'checker-freeze.json',
    'original_method_digest': original['method_digest'],
    'method_digest': method,
    'boundary_digest': boundary_digest,
    'files': frozen_files,
    'function_count': len(destination),
    'source_destination_definitions_equal': True,
    'holdout_state': 'NO_NEW_HOLDOUT_AUTHORED_OR_EXECUTED_FOR_ECO_122',
    'inclusions': {
        'semantic_transfer_migration':
            'Defines the finite checker and BUILD 10 database semantics.',
        'server_build_10':
            'Runtime transfer, resolver, recovery, and client surfaces used by the episode.',
        'support_mjs':
            'Constructs decision-relevant question, basis, report, representation, proposition, limits, delivery, and assessment fixtures.',
        'package_json_and_lock':
            'Pins the JavaScript execution dependency used by the BUILD 10 runtime harness.'
    },
    'exclusions': {
        'tests/build-10/holdout.mjs':
            'Historical holdout only; the new ECO-122 holdout must be authored after the durable pre-holdout checkpoint.',
        'other_tests/build-10 proof suites':
            'Proof orchestration is not part of the semantic fixture/checker definition for the future holdout.',
        'tests/build-10/worker-config.mjs':
            'Reads disposable local configuration only and does not determine semantic fixture construction.'
    },
    'limitations': [
        'This artifact cannot name the future Git commit that will contain it; chronology is established by committing this state before authoring the new holdout.',
        'The later holdout may support post-freeze non-tuning/generalization evidence but does not acquire independent specification authorship merely from this freeze.'
    ]
}

(evidence / 'checker-definitions-v2.json').write_text(
    json.dumps(destination, indent=2) + '\n'
)
path.write_text(json.dumps(record, indent=2) + '\n')

print('PRE-HOLDOUT FREEZE V2')
print('METHOD', method)
print('BOUNDARY', boundary_digest)
print('FILES', len(frozen_files))
