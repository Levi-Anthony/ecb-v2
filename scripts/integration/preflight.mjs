import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MAP = join(ROOT, 'integration/capability-map.v0.1.json');
const requiredPGO = ['source','focal','containing_whole','initiating_contrast','point_of_view','intended_end_state','definition_of_done','discrimination','authority','stopping','scope'];
const liveStandings = new Set(['DESCRIBED','CODE_PRESENT','INSTALLED','DEPLOYED','MECHANICALLY_VERIFIED','ACTUAL_USE_VALIDATED']);

export function validateIndex(index, sourceExists = p => existsSync(resolve(ROOT, p))) {
  const errors = [];
  const nonempty = (value, label) => {
    if (typeof value !== 'string' || value.trim().length < 5) errors.push(label + ': missing or unusably short');
  };
  const list = (value, label, least = 1) => {
    if (!Array.isArray(value) || value.length < least) errors.push(label + ': missing sufficient examples');
  };
  if (index?.schema !== 'ecos-integration-projection-v0.1') errors.push('schema: unknown edition');
  if (!index?.standing?.includes('NOT_SEMANTIC')) errors.push('standing: do not represent this projection as semantic authority');
  const p = index?.pgo ?? {};
  for (const k of requiredPGO) if (!(k in p)) errors.push('pgo.' + k + ': absent');
  for (const k of ['focal','containing_whole','initiating_contrast','point_of_view','intended_end_state','authority','stopping']) nonempty(p[k], 'pgo.' + k);
  list(p.definition_of_done, 'pgo.definition_of_done', 2);
  list(p.scope, 'pgo.scope', 4);
  nonempty(p.discrimination?.method, 'pgo.discrimination.method');
  nonempty(p.discrimination?.method_example, 'pgo.discrimination.method_example');
  list(p.discrimination?.helps, 'pgo.discrimination.helps', 2);
  list(p.discrimination?.hinders, 'pgo.discrimination.hinders', 2);
  const checkRef = (ref, label) => {
    if (typeof ref !== 'string' || !sourceExists(ref)) errors.push(label + ': unresolved repository source ' + String(ref));
  };
  checkRef(p.source, 'pgo.source');
  list(index?.stakeholders, 'stakeholders');
  list(index?.requirements, 'requirements');
  list(index?.capabilities, 'capabilities');
  list(index?.conflicts, 'conflicts');
  const ids = new Set();
  for (const c of index?.capabilities ?? []) {
    if (!c.id || ids.has(c.id)) errors.push('capability: absent or duplicate ID ' + String(c.id));
    ids.add(c.id);
    for (const [property, location] of [['semantic_contract','source'],['physical_adapter','source'],['durable_control','source']]) {
      checkRef(c[property]?.[location], c.id + '.' + property);
    }
    nonempty(c.semantic_contract?.meaning, c.id + '.semantic_contract.meaning');
    nonempty(c.physical_adapter?.description, c.id + '.physical_adapter.description');
    if (c.semantic_contract?.meaning === c.acceptance?.missing) errors.push(c.id + ': portable contract collapsed into missing-acceptance text');
    nonempty(c.durable_control?.owner, c.id + '.owner');
    nonempty(c.durable_control?.reentry, c.id + '.reentry');
    nonempty(c.acceptance?.missing, c.id + '.acceptance');
    nonempty(c.physical_adapter?.standing, c.id + '.adapter_standing');
  }
  const rid = new Set();
  for (const r of index?.requirements ?? []) {
    if (!r.id || rid.has(r.id)) errors.push('requirement ID absent/duplicate: ' + r.id);
    rid.add(r.id);
    checkRef(r.source, 'requirement ' + r.id);
    for (const k of ['stakeholder','outcome','owner','acceptance','standing']) nonempty(r[k], 'requirement ' + r.id + '.' + k);
  }
  for (const c of index?.conflicts ?? []) {
    nonempty(c.id, 'conflict.id'); nonempty(c.owner, 'conflict.owner');
    nonempty(c.risk, 'conflict.risk'); nonempty(c.next, 'conflict.next');
  }
  return errors;
}

export function affectedAreas(paths) {
  const areas = new Set();
  for (const path of paths) {
    if (/^(server\/personal|api\/(app|personal|workspace)|server\/oauth|tests\/(personal|workspace)|vercel\.json)/.test(path)) areas.add('human-door-identity');
    if (/^(server\/open-brain-mcp|server\/current-commission|tests\/current-commission)/.test(path)) areas.add('commission-delivery');
    if (/^(server\/workflow-governance|api\/workflow|tests\/workflow)/.test(path)) areas.add('native-work');
    if (/^(research\/(formal-semantics|urg-kernel)|docs\/inquiry-orchestration)/.test(path)) areas.add('semantic-contract');
    if (/^(integration\/|scripts\/integration\/|tests\/integration\/)/.test(path)) areas.add('integration-projection');
  }
  return [...areas].sort();
}

async function fetchJSON(path, token) {
  const response = await fetch('https://api.github.com/' + path, {
    headers: { Accept:'application/vnd.github+json', Authorization:'Bearer ' + token, 'X-GitHub-Api-Version':'2022-11-28', 'User-Agent':'ecos-integration-preflight' }
  });
  if (!response.ok) throw new Error('GitHub API ' + response.status + ' for ' + path);
  return response.json();
}

export async function inspectOpenPRConflicts(repo, prNumber, token) {
  if (!repo || !prNumber || !token) return { state:'UNVERIFIED', reason:'No authenticated PR context; cannot claim a clean PR inventory' };
  try {
    const fileList = async n => {
      const files = [];
      for (let page=1; page<=5; page++) {
        const pageFiles = await fetchJSON('repos/' + repo + '/pulls/' + n + '/files?per_page=100&page=' + page, token);
        files.push(...pageFiles.map(x=>x.filename));
        if (pageFiles.length < 100) return files;
      }
      throw new Error('PR file listing exceeds bounded scan');
    };
    const all = await fetchJSON('repos/' + repo + '/pulls?state=open&per_page=100',token);
    if (all.length === 100) return {state:'UNVERIFIED', reason:'Open PR list may be truncated; scan must not assert coverage'};
    const current = affectedAreas(await fileList(prNumber));
    const overlaps = [];
    for (const pr of all) {
      if (pr.number === prNumber) continue;
      const areas = affectedAreas(await fileList(pr.number));
      const shared = current.filter(area=>areas.includes(area));
      if (shared.length) overlaps.push({pr:pr.number,url:pr.html_url,areas:shared,draft:pr.draft});
    }
    return {state:'SCANNED',current,overlaps,scope:'Shared path families only, not semantic equivalence or GitHub mergeability'};
  } catch (e) {
    return {state:'UNVERIFIED',reason:String(e)};
  }
}

export function report(index, errors, live) {
  const lines = [
    '# ECOS integration preflight — advisory',
    '',
    'Authority: ' + index.standing,
    'Main baseline: ' + index.baseline.main_sha + ' (historical snapshot; fresh GitHub/BRAIN verification separate)',
    'Definition of done items: ' + index.pgo.definition_of_done.length,
    'Positive examples: ' + index.pgo.discrimination.helps.length + '; negative examples: ' + index.pgo.discrimination.hinders.length,
    'Stakeholder-to-acceptance links: ' + index.requirements.length,
    'Portable-contract → physical-adapter → control entries: ' + index.capabilities.length,
    'Documented conflicts: ' + index.conflicts.map(c=>c.id).join(', '),
    '',
    'Structural source checks: ' + (errors.length ? 'FAIL' : 'PASS') + ' (does not prove semantic adequacy)',
    ...errors.map(e=>'- ' + e),
    '',
    'Live PR overlap scan: ' + live.state,
    ...(live.reason ? [live.reason] : []),
    ...(live.overlaps ?? []).map(x=>'- PR #' + x.pr + ' shared change surface: ' + x.areas.join(', ')),
    '',
    'Limit: Unresolved known collisions are RECEIVING OBLIGATIONS, not universal merge blocks. A green run is not proof of runtime qualification, Principal acceptance, or current BRAIN state.'
  ];
  return lines.join('\n') + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = JSON.parse(readFileSync(MAP, 'utf8'));
  const errors = validateIndex(index);
  const pr = process.env.GITHUB_EVENT_PATH ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')).pull_request?.number : undefined;
  const live = await inspectOpenPRConflicts(process.env.GITHUB_REPOSITORY, pr, process.env.GITHUB_TOKEN);
  const output = report(index,errors,live);
  process.stdout.write(output);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, output);
  if (errors.length) process.exitCode = 1;
}
