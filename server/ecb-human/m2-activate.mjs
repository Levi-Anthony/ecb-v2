// Restricted executor process: no installer or human credential is admitted here.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { connectExecutor, execute } from './executor.mjs';

export const expected = Object.freeze({
  scope: '20ad3966-8647-4a0f-9eed-2888e67e1e49',
  decision: 'a5f6d414-85cd-4a67-b904-64fc122db362',
  request_id: 'e4e78a38-4f42-4f0f-b281-bd0dbdb26fda',
  policy_digest: '686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664',
  predecessor: null,
});
const h = '4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d';
const binding = '7446baff-13a8-4f68-a0c3-8445933575b8';
const obligations = ['activate_exact_p0', 'designate_initial_h_and_remit', 'exhaust_bootstrap'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const requireFact = fact => { if (!fact) throw new Error('M2 retained-state mismatch'); };

export async function retainedRequest() {
  const bytes = await readFile(new URL('../../docs/build-shape/008-build-6-m2-request.json', import.meta.url));
  requireFact(sha(bytes) === 'e67b2364c7e9da64f8379c13f4c37ec7c0bd8ca70b6b99c8817842e74012a9da');
  return JSON.parse(bytes);
}

export function validateView(view) {
  const s = view.scope;
  requireFact(s.id === expected.scope && s.h === h && s.binding === binding);
  requireFact(s.origin === 'https://ecos.effortlessconnection.com' && s.rp_id === 'ecos.effortlessconnection.com');
  for (const [id, digest, kind] of [
    [s.p0, expected.policy_digest, 'policy'],
    [s.remit, 'a54707a0bb4e5373ec8c46adee58d71b67aa6de018d652d7d18b0445f24b9932', 'remit'],
    [s.root_basis, 'f43f95b4fdb84a62c16a0c56acd4a9b3a1ba3d0fd3bf25cd34cddaf4190da78b', 'external_basis'],
  ]) {
    const subject = view.subjects.find(x => x.id === id);
    requireFact(subject && subject.kind === kind && subject.digest === digest && sha(subject.payload) === digest);
  }
  const d = view.decisions.find(x => x.id === expected.decision);
  requireFact(d && d.operation === 'genesis' && d.scope === s.id && d.policy === s.p0 &&
    d.h === h && d.basis === s.root_basis && d.predecessor === null);
  requireFact(!view.decisions.some(x => x.operation === 'withdraw' && x.target === d.id));
  requireFact(view.decisions.length === 1);
  return s;
}

export function validateCompletion(result, view) {
  const s = validateView(view), t = result.transition;
  requireFact(result.outcome === 'committed' && t && view.transitions.length === 1);
  requireFact(t.id === s.current_transition && t.id === view.transitions[0].id);
  requireFact(t.scope === expected.scope && t.decision === expected.decision &&
    t.request_id === expected.request_id && t.predecessor === null && t.policy === s.p0 &&
    t.h === h && t.remit === s.remit && t.binding === binding && t.executor === 'ecb_governance_executor');
  requireFact(JSON.stringify(t.obligations) === JSON.stringify(obligations));
  requireFact(JSON.stringify(view.transitions[0]) === JSON.stringify(t));
  return { M2: 'PASS', scope: t.scope, decision: t.decision, transition: t.id,
    request_id: t.request_id, transitions: 1, bootstrap_exhausted: true, BUILD_6: 'OPEN', P1: 'NOT_STARTED' };
}

export async function activate(call, request, report = () => {}) {
  let result = await call('recover', request);
  let view = await call('inspect', request);
  const s = validateView(view);
  if (result.outcome !== 'committed') {
    requireFact(result.outcome === 'not_committed' && result.scope_locked === true &&
      result.current_transition === null && s.current_transition === null && view.transitions.length === 0);
    report('M2 preconditions match. Executing the retained prior grant once.');
    // If execution throws or loses its acknowledgement, do not issue another effect.
    result = await call('execute', request);
    requireFact(result.outcome === 'committed');
    const recovered = await call('recover', request);
    requireFact(JSON.stringify(recovered) === JSON.stringify(result));
    view = await call('inspect', request);
  }
  return validateCompletion(result, view);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let db;
  try {
    const request = await retainedRequest();
    db = await connectExecutor();
    console.log('EXECUTOR_AUTH=PASS');
    const receipt = await activate((action, body) => execute(db, action, body), request, console.log);
    await db.end(); db = undefined;
    // A fresh connection must reconstruct the exact committed outcome.
    db = await connectExecutor();
    const cold = validateCompletion(await execute(db, 'recover', request), await execute(db, 'inspect', request));
    requireFact(JSON.stringify(cold) === JSON.stringify(receipt));
    console.log(JSON.stringify({ ...receipt, cold_recovery: 'PASS' }, null, 2));
  } catch {
    console.error('M2=UNCONFIRMED. Preserve the exact request and private credential. Reconcile before another effect; rerunning starts with recovery.');
    process.exitCode = 1;
  } finally { await db?.end({ timeout: 2 }).catch(() => {}); }
}
