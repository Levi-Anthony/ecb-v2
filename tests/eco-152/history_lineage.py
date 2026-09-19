#!/usr/bin/env python3
"""Targeted regression: payload presence is not historical-before lineage.

Runs after the complete lifecycle. Fixture choice of a retained Resolution is not
currentness selection. All candidate interactions still use the ordinary RPC path.
"""
import json
import qualify as m

def main():
    s = json.loads((m.OUT / 'cold-state.json').read_text())
    history = {x['artifact_id']: json.loads(x['envelope']) for x in s['history']}
    state = json.loads((m.OUT / 'after.json').read_text())
    resolutions = [x for x in s['history'] if x['record_kind'] == 'resolution']
    rid = resolutions[-1]['artifact_id']
    caps = {c['id']: c for c in state['capabilities_redacted']}
    assessments = [r for r in state['records'] if r['record_kind'] == 'qualification'
                   and r['resolution_id'] == rid and r['result'] == 'PASS'
                   and caps[r['capability_id']]['revoked_by'] is None]
    if not assessments:
        raise RuntimeError('No retained applicable fixture reviewer for exact lineage regression')
    template = dict(history[assessments[-1]['artifact_id']]['payload'])
    template.pop('profile', None)
    unrelated = m.artifact('Unrelated before-payload. This Artifact is absent from the retained Resolution source/grammar/dependency manifest.')
    exact_resolution = history[rid]['payload']
    after_id = exact_resolution['grammar']['artifact_id']
    m.snapshot('history-regression-before.json')
    obs = m.write('observation', {
        'resolution_id': rid, 'before_artifact_id': unrelated['artifact_id'],
        'after_artifact_id': after_id, 'history_available': True,
        'description': 'Adversarial fixture: unrelated existing payload must not prove old meaning'
    }, s)['artifact_id']
    appraisal = dict(template, result='material', observation_id=obs,
                     affected_use=s['declared_use'], rationale='Synthetic appraisal cannot manufacture exact prior lineage')
    app = m.write('applicability', appraisal, s)['artifact_id']
    m.write('fence_change', {'applicability_id': app}, s)
    m.refresh(s)
    request = m.request('qualification', dict(template, result='PASS',
                       change_receipt_id=s['last_fence_id'], historical_requalification=True), s)
    m.log_file('history-lineage-request.jsonl', request)
    m.rejected('unrelated_before_cannot_prove_history', m.sql_for(request),
               'orientation_historical_lineage_mismatch',
               'Preserve observation custody but reject stronger historical requalification without exact old-meaning lineage')
    count = int(m.run('select count(*) from public.ordinary_operations where id=' +
                     m.lit(request['operation_id']) + ';', admin=True))
    m.check('invalid_history_claim_has_no_committed_receipt', count == 0,
            {'operation_count': count, 'operation_id': request['operation_id']},
            'A rejected historical claim must not acquire a durable qualification receipt')
    m.snapshot('history-regression-after.json')
    final = m.resolve(s)
    (m.OUT / 'cold-state.json').write_text(m.encode(final))
    checks = [json.loads(line) for line in (m.OUT / 'checks.jsonl').read_text().splitlines()]
    (m.OUT / 'summary.json').write_text(m.encode({'checks':len(checks), 'result':'PASS',
        'scope_id':s['scope_id'], 'use':s['declared_use'], 'boundary':'isolated ordinary DB/RPC',
        'historical_lineage_regression':'PASS', 'production':False}))
    print('ECO152_HISTORY_LINEAGE=PASS', flush=True)

if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        m.log_file('history-lineage-failure.jsonl', {'error':str(exc)})
        m.snapshot('history-regression-failure-state.json')
        print('ECO152_HISTORY_LINEAGE=FAIL: ' + str(exc), flush=True)
        raise
