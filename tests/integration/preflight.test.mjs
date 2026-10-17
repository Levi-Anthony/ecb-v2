import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, symlinkSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateIndex, isRepositoryFile, affectedAreas, inspectOpenPRConflicts, report } from '../../scripts/integration/preflight.mjs';
const map = JSON.parse(readFileSync(new URL('../../integration/capability-map.v0.1.json',import.meta.url),'utf8'));
const clone = () => structuredClone(map);

test('current projection resolves source pointers and full PGO discrimination', () => {
  assert.deepEqual(validateIndex(map),[]);
  assert.ok(map.pgo.definition_of_done.some(v=>v.includes('Principal')));
  assert.ok(map.pgo.discrimination.hinders.some(v=>v.includes('PR #109')));
});
test('PGO dilution fails when method, examples and terminal end state are erased', () => {
  const weak=clone();
  weak.pgo.intended_end_state = '';
  weak.pgo.definition_of_done = [];
  delete weak.pgo.discrimination.method;
  weak.pgo.discrimination.helps=[];
  weak.pgo.discrimination.hinders=[];
  const result=validateIndex(weak).join('\n');
  for(const name of ['intended_end_state','definition_of_done','discrimination.method','discrimination.helps','discrimination.hinders']) assert.ok(result.includes(name), name);
});
test('untraceable adapter and duplicate capability fail structural check', () => {
  const bad=clone();
  bad.capabilities[0].physical_adapter.source = 'not/an/existing/adapter.ts';
  bad.capabilities.push(structuredClone(bad.capabilities[0]));
  const err=validateIndex(bad).join('\n');
  assert.match(err,/unresolved repository source/);
  assert.match(err,/duplicate ID/);
});
test('PR change families distinguish overlapping human identity and Edge commission work', () => {
  assert.deepEqual(affectedAreas(['server/personal-workspace.ts','api/app.ts','server/oauth-consent.ts']),['human-door-identity']);
  assert.deepEqual(affectedAreas(['server/open-brain-mcp/current-commission.ts']),['commission-delivery']);
  assert.deepEqual(affectedAreas(['server/workflow-governance.ts','research/formal-semantics/foo.md']),['native-work','semantic-contract']);
});
test('no live credentials gives UNVERIFIED, never a false clean result', async () => {
  const result=await inspectOpenPRConflicts(undefined,undefined,undefined);
  assert.equal(result.state,'UNVERIFIED');
  assert.match(report(map,[],result),/Live PR overlap scan: UNVERIFIED/);
});

test('semantic contract cannot be replaced by the list of missing tests or a generic adapter pointer', () => {
  const wrong=clone();
  wrong.capabilities[0].semantic_contract.meaning=wrong.capabilities[0].acceptance.missing;
  delete wrong.capabilities[1].physical_adapter.description;
  const problems=validateIndex(wrong).join('\n');
  assert.match(problems,/portable contract collapsed/);
  assert.match(problems,/physical_adapter.description/);
});


test('source path must be a real regular file inside the checkout, not a directory, traversal, absolute path or escaping symlink', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const inside = mkdtempSync(join(root, '.preflight-source-test-'));
  const outside = mkdtempSync(join(tmpdir(), 'ecos-preflight-external-'));
  try {
    const external = join(outside, 'outside.md');
    writeFileSync(external, 'external untrusted source');
    symlinkSync(external, join(inside, 'outside-link.md'));
    assert.equal(isRepositoryFile('docs/current-product-delivery-commission.md'), true);
    for (const path of [
      '.', 'docs', '../', '../../outside.md', external,
      relative(root, join(inside, 'outside-link.md')),
    ]) assert.equal(isRepositoryFile(path), false, path);
    for (const path of ['.', 'docs', '../', external, relative(root, join(inside, 'outside-link.md'))]) {
      const bad = clone();
      bad.pgo.source = path;
      assert.match(validateIndex(bad).join('\n'), /pgo.source: unresolved repository source/, path);
    }
  } finally {
    rmSync(inside, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});
